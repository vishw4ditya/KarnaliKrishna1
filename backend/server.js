import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Model Imports (for seeding)
import User from './models/User.js';
import Branch from './models/Branch.js';
import Settings from './models/Settings.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory Statically
const uploadsPath = path.resolve('uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Serve Frontend static files in Production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    // Bypass for API and Uploads
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('Frontend build not found. Please build frontend first.');
    }
  });
} else {
  // Root Route
  app.get('/', (req, res) => {
    res.send('Nepal E-Commerce API is running...');
  });
}

// Seed Initial Data
const seedInitialData = async () => {
  try {
    // 1. Seed Website Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({});
      console.log('Seeded default website settings.');
    }

    // 2. Seed Default Branch
    let defaultBranch = await Branch.findOne({ name: 'Kathmandu Central' });
    if (!defaultBranch) {
      defaultBranch = await Branch.create({
        name: 'Kathmandu Central',
        address: 'Durbarmarg, Kathmandu, Nepal',
        contactNumber: '+977-1-4222222',
        status: 'active',
      });
      console.log('Seeded default branch: Kathmandu Central');
    }

    // 3. Seed Super Admin Account
    const adminExists = await User.findOne({ role: 'super_admin' });
    if (!adminExists) {
      const email = process.env.ADMIN_EMAIL || 'admin@nepalbazaar.com';
      const password = process.env.ADMIN_PASSWORD || 'adminpassword';
      await User.create({
        name: 'Super Admin (Owner)',
        email,
        password, // Will be hashed by mongoose pre-save hook
        phone: '+977-9800000000',
        role: 'super_admin',
        status: 'approved',
        branchId: defaultBranch._id,
        branchName: defaultBranch.name,
      });
      console.log('==================================================');
      console.log('SEED: Super Admin Account Created!');
      console.log(`Email: ${email}`);
      console.log('Password initialized from environment setup.');
      console.log('==================================================');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Seed data as soon as connection is open
mongoose.connection.once('open', seedInitialData);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
