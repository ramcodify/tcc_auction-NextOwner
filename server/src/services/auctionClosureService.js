import Auction from '../models/Auction.js';
import User from '../models/User.js';
import { getIO, createNotification } from './notificationService.js';

let intervalId = null;

/**
 * Idempotent closing processor for a single expired auction.
 */
export const closeSingleAuction = async (auction) => {
  // Check if auction is still live before transitioning
  if (auction.status !== 'live') {
    return;
  }

  const now = new Date();

  // If no bids were placed
  if (auction.bidCount === 0 || !auction.leadingBidderId) {
    auction.status = 'unsold';
    await auction.save();

    console.log(`[Auction Closure] Auction "${auction.title}" (${auction._id}) closed: UNSOLD (0 bids).`);

    // Notify seller
    createNotification({
      userId: auction.sellerId,
      title: 'Auction Ended: Unsold',
      message: `Your auction for "${auction.title}" ended with no bids placed.`,
      type: 'system',
      relatedAuctionId: auction._id,
      link: `/seller/dashboard`
    });

    const io = getIO();
    if (io) {
      io.to(`auction:${auction._id}`).emit('auction_closed', {
        auctionId: auction._id,
        status: 'unsold',
        message: 'This auction has ended with no bids placed.'
      });
    }

    return;
  }

  // Bids exist: Move to awaiting seller approval
  auction.status = 'awaiting_approval';
  auction.sellerDecision = 'pending';
  await auction.save();

  console.log(`[Auction Closure] Auction "${auction.title}" (${auction._id}) closed: AWAITING SELLER APPROVAL. Leading bid: ₹${auction.currentPrice}`);

  // Notify seller to review & approve
  createNotification({
    userId: auction.sellerId,
    title: 'Auction Closed: Decision Required',
    message: `"${auction.title}" closed at ₹${auction.currentPrice.toLocaleString('en-IN')}. Please approve or reject the final winning offer.`,
    type: 'seller_decision',
    relatedAuctionId: auction._id,
    link: `/seller/dashboard`
  });

  // Notify provisional winner
  createNotification({
    userId: auction.leadingBidderId,
    title: 'Provisional Winner!',
    message: `You hold the highest bid (₹${auction.currentPrice.toLocaleString('en-IN')}) on "${auction.title}". Waiting for seller price approval.`,
    type: 'auction_won',
    relatedAuctionId: auction._id,
    link: `/auction/${auction._id}`
  });

  const io = getIO();
  if (io) {
    io.to(`auction:${auction._id}`).emit('auction_closed', {
      auctionId: auction._id,
      status: 'awaiting_approval',
      currentPrice: auction.currentPrice,
      leadingBidderId: auction.leadingBidderId,
      message: 'Auction closed. Awaiting seller confirmation.'
    });
  }
};

/**
 * Reconcile all expired live auctions.
 * Runs on startup and periodically every 5 seconds.
 */
export const reconcileExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredLiveAuctions = await Auction.find({
      status: 'live',
      closesAt: { $lte: now }
    });

    for (const auction of expiredLiveAuctions) {
      await closeSingleAuction(auction);
    }
  } catch (err) {
    console.error('[Auction Reconciler Error]', err.message);
  }
};

/**
 * Start the durable reconciliation service
 */
export const startAuctionClosureService = () => {
  // Reconcile immediately on server boot
  reconcileExpiredAuctions();

  // Run reconciliation check every 5 seconds
  if (!intervalId) {
    intervalId = setInterval(reconcileExpiredAuctions, 5000);
    console.log('[Auction Closure Service] Durable background reconciler active (interval: 5s).');
  }
};

export const stopAuctionClosureService = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
