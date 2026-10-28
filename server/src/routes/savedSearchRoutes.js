import express from 'express';
import { getSavedSearches, createSavedSearch, deleteSavedSearch } from '../controllers/savedSearchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getSavedSearches);
router.post('/', createSavedSearch);
router.delete('/:id', deleteSavedSearch);

export default router;
