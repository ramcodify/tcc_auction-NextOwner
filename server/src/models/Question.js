import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true
    },
    askerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    question: {
      type: String,
      required: [true, 'Please provide your question'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    answer: {
      type: String,
      trim: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters'],
      default: null
    },
    answeredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

QuestionSchema.index({ auctionId: 1, createdAt: -1 });

export default mongoose.model('Question', QuestionSchema);
