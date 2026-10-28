import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import AutoBid from '../models/AutoBid.js';
import User from '../models/User.js';
import { getIO, createNotification } from './notificationService.js';

/**
 * Reusable, authoritative bidding service.
 * Handles manual bids, proxy auto-bidding resolution, and last-minute extensions.
 */
export const placeBid = async ({ auctionId, bidderId, amount, isAuto = false }) => {
  const numericAmount = Math.floor(Number(amount));

  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Bid amount must be a positive integer in ₹.');
  }

  // 1. Fetch Auction
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new Error('Auction not found.');
  }

  // 2. Validate Auction Status
  if (auction.status !== 'live') {
    throw new Error(`This auction is no longer accepting bids (Status: ${auction.status}).`);
  }

  // 3. Server-authoritative time check
  const now = new Date();
  if (new Date(auction.closesAt) <= now) {
    throw new Error('This auction has already closed.');
  }

  // 4. Seller cannot bid on own listing
  if (auction.sellerId.toString() === bidderId.toString()) {
    throw new Error('Sellers cannot place bids on their own listings.');
  }

  // 5. Current leading bidder check
  if (
    auction.leadingBidderId &&
    auction.leadingBidderId.toString() === bidderId.toString()
  ) {
    throw new Error('You already hold the leading bid on this auction.');
  }

  // 6. Validate minimum bid amount
  const minRequired =
    auction.bidCount === 0
      ? auction.startingPrice
      : auction.currentPrice + auction.minimumIncrement;

  if (numericAmount < minRequired) {
    throw new Error(
      `Bid must be at least ₹${minRequired.toLocaleString('en-IN')} (Current: ₹${auction.currentPrice.toLocaleString('en-IN')}, Min increment: ₹${auction.minimumIncrement.toLocaleString('en-IN')}).`
    );
  }

  // 7. Check Last-Minute Extension Rule:
  // "If a valid bid arrives during the final 30 seconds, move the closing deadline to 60 seconds after that bid."
  let wasExtended = false;
  const msRemaining = new Date(auction.closesAt).getTime() - now.getTime();
  if (msRemaining <= 30000 && msRemaining > 0) {
    const newDeadline = new Date(now.getTime() + 60000);
    auction.closesAt = newDeadline;
    auction.extensionCount = (auction.extensionCount || 0) + 1;
    wasExtended = true;
  }

  // Previous leader to notify
  const previousLeaderId = auction.leadingBidderId;

  // 8. Create authoritative Bid document
  const bid = await Bid.create({
    auctionId: auction._id,
    bidderId,
    amount: numericAmount,
    bidType: isAuto ? 'auto' : 'manual'
  });

  // 9. Update Auction document
  auction.currentPrice = numericAmount;
  auction.currentLeadingBidId = bid._id;
  auction.leadingBidderId = bidderId;
  auction.bidCount += 1;
  await auction.save();

  // Populate bidder details for real-time broadcast and response
  const bidder = await User.findById(bidderId).select('name campus');

  const bidPayload = {
    id: bid._id,
    amount: bid.amount,
    bidType: bid.bidType,
    createdAt: bid.createdAt,
    bidder: {
      id: bidder._id,
      name: bidder.name,
      campus: bidder.campus
    }
  };

  // 10. Broadcast via Socket.IO
  const io = getIO();
  if (io) {
    const payload = {
      auctionId: auction._id.toString(),
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      closesAt: auction.closesAt,
      leadingBidderId: bidderId.toString(),
      wasExtended,
      newBid: bidPayload
    };

    console.log(`[Socket Broadcast] Emitting bid_placed to auction:${auction._id} and globally. Price: ${auction.currentPrice}, bidCount: ${auction.bidCount}`);
    io.to(`auction:${auction._id}`).emit('bid_placed', payload);
    io.emit('bid_placed', payload);

    if (wasExtended) {
      const extPayload = {
        auctionId: auction._id.toString(),
        closesAt: auction.closesAt,
        message: 'Bidding extended by 60 seconds due to a last-minute bid!'
      };
      io.to(`auction:${auction._id}`).emit('auction_extended', extPayload);
      io.emit('auction_extended', extPayload);
    }
  }

  // 11. Dispatch notifications
  if (previousLeaderId && previousLeaderId.toString() !== bidderId.toString()) {
    await createNotification({
      userId: previousLeaderId,
      title: 'Outbid Alert',
      message: `You were outbid on "${auction.title}". The leading bid is now ₹${numericAmount.toLocaleString('en-IN')}.`,
      type: 'bid_outbid',
      relatedAuctionId: auction._id,
      link: `/auction/${auction._id}`
    });
  }

  // Notify seller of new bid
  await createNotification({
    userId: auction.sellerId,
    title: 'New Bid Received',
    message: `${bidder.name} placed a bid of ₹${numericAmount.toLocaleString('en-IN')} on "${auction.title}".`,
    type: 'bid_leading',
    relatedAuctionId: auction._id,
    link: `/auction/${auction._id}`
  });

  // 12. Evaluate active proxy auto-bids from other students
  if (!isAuto) {
    // Avoid re-entrant recursion by triggering auto-bid resolution asynchronously
    setImmediate(async () => {
      try {
        await resolveProxyBids(auction._id, bidderId);
      } catch (err) {
        console.error('[Proxy Bidding Resolution Error]', err.message);
      }
    });
  }

  return {
    success: true,
    bid: bidPayload,
    auction: {
      id: auction._id,
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      closesAt: auction.closesAt,
      wasExtended
    }
  };
};

/**
 * Server-side automatic proxy bidding evaluator.
 * Deterministic resolution: higher max leads, earlier timestamp breaks ties.
 */
export const resolveProxyBids = async (auctionId, currentBidderId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction || auction.status !== 'live' || new Date(auction.closesAt) <= new Date()) {
    return;
  }

  // Find all active auto-bids for this auction from other students whose max > currentPrice
  const competingAutoBids = await AutoBid.find({
    auctionId,
    bidderId: { $ne: auction.leadingBidderId },
    isActive: true,
    maxAmount: { $gt: auction.currentPrice }
  }).sort({ maxAmount: -1, createdAt: 1 }); // Higher max first, earlier creation breaks tie

  if (competingAutoBids.length === 0) return;

  const topAutoBid = competingAutoBids[0];
  const nextMinBid = auction.currentPrice + auction.minimumIncrement;

  if (topAutoBid.maxAmount >= nextMinBid) {
    // Determine the calculated bid amount
    let targetBid = nextMinBid;

    // If there is another competitor with auto-bid, jump directly to rivalMax + increment (up to top's max)
    if (competingAutoBids.length > 1) {
      const secondAutoBid = competingAutoBids[1];
      const competitivePrice = secondAutoBid.maxAmount + auction.minimumIncrement;
      targetBid = Math.min(topAutoBid.maxAmount, Math.max(nextMinBid, competitivePrice));
    }

    // Place proxy bid on behalf of student
    await placeBid({
      auctionId: auction._id,
      bidderId: topAutoBid.bidderId,
      amount: targetBid,
      isAuto: true
    });
  }
};
