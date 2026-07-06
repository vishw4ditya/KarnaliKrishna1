import express from 'express';
import {
  getBranches,
  getBranchSupportList,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getBranches);
router.get('/support', getBranchSupportList);
router.post('/', protect, adminOnly, createBranch);
router.put('/:id', protect, adminOnly, updateBranch);
router.delete('/:id', protect, adminOnly, deleteBranch);

export default router;
