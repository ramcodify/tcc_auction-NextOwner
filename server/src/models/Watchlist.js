import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

WatchlistSchema.index({ userId: 1, auctionId: 1 }, { unique: true });

export default mongoose.model('Watchlist', WatchlistSchema);
