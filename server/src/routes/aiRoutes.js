import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';

const router = express.Router();

// Optional user context can be passed
router.post('/chat', handleAIChat);

export default router;
