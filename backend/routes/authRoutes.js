import express from 'express';
import {
  registerCustomer,
  registerBranchHead,
  loginUser,
  googleLogin,
  otpLogin,
  getMe,
  addAddress,
  updateAddress,
  deleteAddress,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/register-branch-head', registerBranchHead);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/otp', otpLogin);

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

export default router;
