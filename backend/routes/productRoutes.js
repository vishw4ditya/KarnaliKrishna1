import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from '../controllers/productController.js';
import { protect, adminOrBranchHead } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, adminOrBranchHead, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOrBranchHead, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOrBranchHead, deleteProduct);

router.post('/:id/reviews', protect, addProductReview);

export default router;
