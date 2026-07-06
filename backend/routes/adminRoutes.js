import express from 'express';
import {
  getAnalytics,
  getBranchHeads,
  updateBranchHeadStatus,
  exportReport,
  updateBranchHead,
  deleteBranchHead,
} from '../controllers/adminController.js';
import { protect, adminOnly, adminOrBranchHead } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOrBranchHead, getAnalytics);
router.get('/branch-heads', protect, adminOnly, getBranchHeads);
router.put('/branch-heads/:id/status', protect, adminOnly, updateBranchHeadStatus);
router.put('/branch-heads/:id', protect, adminOnly, updateBranchHead);
router.delete('/branch-heads/:id', protect, adminOnly, deleteBranchHead);
router.get('/reports/export', protect, adminOnly, exportReport);

export default router;
