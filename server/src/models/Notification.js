import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'bid_outbid',
        'bid_leading',
        'auction_extended',
        'auction_won',
        'seller_decision',
        'handover_update',
        'new_question',
        'saved_search_match',
        'system'
      ],
      default: 'system',
      index: true
    },
    relatedAuctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      default: null
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
