import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Watchlist from '../models/Watchlist.js';

export const getStudentActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. All unique auctions where user placed bids
    const userBids = await Bid.find({ bidderId: userId }).select('auctionId');
    const bidAuctionIds = [...new Set(userBids.map((b) => b.auctionId.toString()))];

    const [
      biddedAuctions,
      watchedDocs,
      sellerAuctions
    ] = await Promise.all([
      Auction.find({ _id: { $in: bidAuctionIds } })
        .populate('sellerId', 'name campus')
        .sort({ closesAt: 1 }),
      Watchlist.find({ userId })
        .populate({
          path: 'auctionId',
          populate: { path: 'sellerId', select: 'name campus' }
        })
        .sort({ createdAt: -1 }),
      Auction.find({ sellerId: userId })
        .populate('leadingBidderId', 'name campus')
        .sort({ createdAt: -1 })
    ]);

    // Categorize Buyer Activity
    const buyerActiveLeading = [];
    const buyerOutbid = [];
    const buyerProvisionalWins = [];
    const buyerReserved = [];
    const buyerCompleted = [];
    const buyerLost = [];

    biddedAuctions.forEach((auction) => {
      const isLeader = auction.leadingBidderId && auction.leadingBidderId.toString() === userId.toString();

      if (auction.status === 'live') {
        if (isLeader) buyerActiveLeading.push(auction);
        else buyerOutbid.push(auction);
      } else if (auction.status === 'awaiting_approval') {
        if (isLeader) buyerProvisionalWins.push(auction);
        else buyerLost.push(auction);
      } else if (auction.status === 'reserved') {
        if (isLeader) buyerReserved.push(auction);
        else buyerLost.push(auction);
      } else if (auction.status === 'completed') {
        if (isLeader) buyerCompleted.push(auction);
        else buyerLost.push(auction);
      } else {
        buyerLost.push(auction);
      }
    });

    // Categorize Seller Activity
    const sellerLive = [];
    const sellerAwaitingDecision = [];
    const sellerReserved = [];
    const sellerCompleted = [];
    const sellerUnsold = [];
    const sellerCancelled = [];
    const sellerRejected = [];

    sellerAuctions.forEach((auction) => {
      if (auction.status === 'live') sellerLive.push(auction);
      else if (auction.status === 'awaiting_approval') sellerAwaitingDecision.push(auction);
      else if (auction.status === 'reserved') sellerReserved.push(auction);
      else if (auction.status === 'completed') sellerCompleted.push(auction);
      else if (auction.status === 'unsold') sellerUnsold.push(auction);
      else if (auction.status === 'cancelled') sellerCancelled.push(auction);
      else if (auction.status === 'rejected') sellerRejected.push(auction);
    });

    const watchedAuctions = watchedDocs.filter((w) => w.auctionId).map((w) => w.auctionId);

    return res.status(200).json({
      status: 'success',
      buyer: {
        activeLeading: buyerActiveLeading,
        outbid: buyerOutbid,
        provisionalWins: buyerProvisionalWins,
        reserved: buyerReserved,
        completed: buyerCompleted,
        lost: buyerLost,
        watched: watchedAuctions
      },
      seller: {
        live: sellerLive,
        awaitingDecision: sellerAwaitingDecision,
        reserved: sellerReserved,
        completed: sellerCompleted,
        unsold: sellerUnsold,
        cancelled: sellerCancelled,
        rejected: sellerRejected
      }
    });
  } catch (error) {
    console.error('[getStudentActivity Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
