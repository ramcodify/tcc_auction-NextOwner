import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Optional user context from cookies/tokens
router.post('/chat', optionalAuth, handleAIChat);

export default router;

