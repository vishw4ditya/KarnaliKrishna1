import express from 'express';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { protect, adminOrBranchHead } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCoupons);
router.post('/validate', protect, validateCoupon);

router.post('/', protect, adminOrBranchHead, createCoupon);
router.put('/:id', protect, adminOrBranchHead, updateCoupon);
router.delete('/:id', protect, adminOrBranchHead, deleteCoupon);

export default router;
