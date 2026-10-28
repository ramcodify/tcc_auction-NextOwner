import express from 'express';
import { getStudentActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getStudentActivity);

export default router;
