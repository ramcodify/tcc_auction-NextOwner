import express from 'express';
import {
  getMarketplaceAuctions,
  getHomeAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  cancelAuction,
  submitBid,
  configureAutoBid,
  submitQuestion,
  answerQuestion,
  handleSellerDecision,
  confirmHandover
} from '../controllers/auctionController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Optional auth middleware for getAuctionById to see if user watched / auto-bid
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const jwt = (await import('jsonwebtoken')).default;
      const User = (await import('../models/User.js')).default;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nextowner_default_jwt_secret_dev');
      req.user = await User.findById(decoded.id);
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};

// Public routes
router.get('/', getMarketplaceAuctions);
router.get('/home', getHomeAuctions);
router.get('/:id', optionalAuth, getAuctionById);

// Protected routes
router.post('/', protect, upload.array('photos', 5), createAuction);
router.put('/:id', protect, upload.array('photos', 5), updateAuction);
router.post('/:id/cancel', protect, cancelAuction);
router.post('/:id/bid', protect, submitBid);
router.post('/:id/auto-bid', protect, configureAutoBid);
router.post('/:id/questions', protect, submitQuestion);
router.post('/:id/questions/:qId/answer', protect, answerQuestion);
router.post('/:id/decision', protect, handleSellerDecision);
router.post('/:id/handover-confirm', protect, confirmHandover);

export default router;
