import mongoose from 'mongoose';

const SavedSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    keyword: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      default: 'all'
    },
    condition: {
      type: String,
      default: 'all'
    },
    maxPrice: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

SavedSearchSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SavedSearch', SavedSearchSchema);
