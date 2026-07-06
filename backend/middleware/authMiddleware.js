import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretnepalbazaarjwtkey12345!');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check if user is a branch head and is not approved yet
      if (req.user.role === 'branch_head' && req.user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval by the Super Admin.',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Super Admin role required' });
  }
};

export const branchHeadOnly = (req, res, next) => {
  if (req.user && req.user.role === 'branch_head') {
    if (req.user.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Access denied: Account pending approval' });
    }
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Branch Head role required' });
  }
};

export const adminOrBranchHead = (req, res, next) => {
  if (req.user && (req.user.role === 'super_admin' || req.user.role === 'branch_head')) {
    if (req.user.role === 'branch_head' && req.user.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Access denied: Account pending approval' });
    }
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Privileged role required' });
  }
};
