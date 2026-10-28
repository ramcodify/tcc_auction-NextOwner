import Watchlist from '../models/Watchlist.js';
import Auction from '../models/Auction.js';

export const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id })
      .populate({
        path: 'auctionId',
        populate: { path: 'sellerId', select: 'name campus' }
      })
      .sort({ createdAt: -1 });

    // Filter out deleted auctions
    const auctions = items
      .filter((w) => w.auctionId)
      .map((w) => w.auctionId);

    return res.status(200).json({
      status: 'success',
      data: auctions
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Watchlist.findOne({
      userId: req.user._id,
      auctionId: id
    });

    if (existing) {
      await Watchlist.findByIdAndDelete(existing._id);
      return res.status(200).json({
        status: 'success',
        isWatched: false,
        message: 'Removed from watchlist.'
      });
    }

    await Watchlist.create({
      userId: req.user._id,
      auctionId: id
    });

    return res.status(200).json({
      status: 'success',
      isWatched: true,
      message: 'Added to watchlist.'
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
