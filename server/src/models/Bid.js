import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [1, 'Bid amount must be at least ₹1']
    },
    bidType: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual'
    }
  },
  {
    timestamps: true
  }
);

BidSchema.index({ auctionId: 1, amount: -1, createdAt: 1 });

export default mongoose.model('Bid', BidSchema);
