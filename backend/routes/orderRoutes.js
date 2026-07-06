import express from 'express';
import {
  createOrder,
  getMyOrders,
  getBranchOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  downloadInvoice,
} from '../controllers/orderController.js';
import { protect, adminOnly, branchHeadOnly, adminOrBranchHead } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/branch', protect, branchHeadOnly, getBranchOrders);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOrBranchHead, updateOrderStatus);
router.get('/:id/invoice', protect, downloadInvoice);

export default router;
