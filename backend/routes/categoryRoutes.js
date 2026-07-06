import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOrBranchHead } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOrBranchHead, upload.single('image'), createCategory);
router.put('/:id', protect, adminOrBranchHead, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOrBranchHead, deleteCategory);

export default router;
