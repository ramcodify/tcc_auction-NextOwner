import mongoose from 'mongoose';

const AuctionSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an auction title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['cycle', 'calculator', 'books', 'electronics', 'furniture', 'other'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition of the item'],
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      index: true
    },
    photos: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Please provide at least one photo of the item'
      }
    },
    startingPrice: {
      type: Number,
      required: [true, 'Please provide a starting price'],
      min: [1, 'Starting price must be at least ₹1']
    },
    minimumIncrement: {
      type: Number,
      default: 20,
      min: [5, 'Minimum bid increment must be at least ₹5']
    },
    currentPrice: {
      type: Number,
      required: true,
      index: true
    },
    currentLeadingBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null
    },
    leadingBidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    bidCount: {
      type: Number,
      default: 0,
      index: true
    },
    closesAt: {
      type: Date,
      required: [true, 'Please provide an auction closing date and time'],
      index: true
    },
    originalClosesAt: {
      type: Date,
      required: true
    },
    extensionCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: [
        'live',
        'awaiting_approval',
        'reserved',
        'completed',
        'unsold',
        'rejected',
        'cancelled',
        'pickup_failed'
      ],
      default: 'live',
      index: true
    },
    sellerDecision: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    decisionAt: {
      type: Date,
      default: null
    },
    handoverNotes: {
      type: String,
      trim: true,
      default: ''
    },
    buyerConfirmed: {
      type: Boolean,
      default: false
    },
    buyerConfirmedAt: {
      type: Date,
      default: null
    },
    sellerConfirmed: {
      type: Boolean,
      default: false
    },
    sellerConfirmedAt: {
      type: Date,
      default: null
    },
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    viewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Text search index on title and description
AuctionSchema.index({ title: 'text', description: 'text' });
// Compound indexes for performant marketplace queries
AuctionSchema.index({ status: 1, closesAt: 1 });
AuctionSchema.index({ status: 1, category: 1, currentPrice: 1 });

export default mongoose.model('Auction', AuctionSchema);
