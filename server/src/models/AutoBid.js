import mongoose from 'mongoose';

const AutoBidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: [true, 'Auction ID is required'],
      index: true
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bidder ID is required'],
      index: true
    },
    maxAmount: {
      type: Number,
      required: [true, 'Maximum bid authorization is required'],
      min: [1, 'Maximum amount must be at least ₹1']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// One active auto-bid per student per auction
AutoBidSchema.index({ auctionId: 1, bidderId: 1 }, { unique: true });

export default mongoose.model('AutoBid', AutoBidSchema);
