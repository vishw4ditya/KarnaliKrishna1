import express from 'express';
import {
  getIssues,
  createIssue,
  updateIssue,
} from '../controllers/issueController.js';
import { protect, branchHeadOnly, adminOrBranchHead } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOrBranchHead, getIssues);
router.post('/', protect, branchHeadOnly, upload.array('supportingImages', 5), createIssue);
router.put('/:id', protect, adminOrBranchHead, updateIssue);

export default router;
