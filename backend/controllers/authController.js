import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretnepalbazaarjwtkey12345!', {
    expiresIn: '30d',
  });
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const registerCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
      status: 'approved',
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new branch head
// @route   POST /api/auth/register-branch-head
// @access  Public (Requires file upload)
export const registerBranchHead = async (req, res) => {
  const { name, email, password, phone, branchName, branchId } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'branch_head',
      status: 'pending', // Requires admin approval
      branchId: branchId || null,
      branchName: branchName || '',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Pending Super Admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if unapproved branch head
      if (user.role === 'branch_head' && user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Your account status is '${user.status}'. Please contact Super Admin.`,
        });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          branchId: user.branchId,
          branchName: user.branchName,
          addresses: user.addresses,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google Sign-In / Sign-Up
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { name, email, googleId, imageUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name,
        email,
        phone: 'Not provided',
        password: Math.random().toString(36).slice(-12), // random string
        role: 'customer',
        status: 'approved',
        profilePhotoUrl: imageUrl || '',
        googleId,
      });
    } else if (!user.googleId) {
      // Link googleId if email already exists
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        branchId: user.branchId,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate Mobile OTP Login (Send OTP or verify OTP)
// @route   POST /api/auth/otp
// @access  Public
export const otpLogin = async (req, res) => {
  const { phone, code, step } = req.body; // step: 'send' or 'verify'

  try {
    if (step === 'send') {
      // Find or create customer
      let user = await User.findOne({ phone });
      if (!user) {
        // Create user with dummy email
        user = await User.create({
          name: `User-${phone.slice(-4)}`,
          email: `${phone}@nepalbazaar.com`,
          phone,
          password: Math.random().toString(36).slice(-12),
          role: 'customer',
          status: 'approved',
        });
      }

      // Simulate sending SMS
      return res.json({
        success: true,
        message: `OTP sent to ${phone} (Use '123456' for verification)`,
      });
    }

    if (step === 'verify') {
      if (code !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
      }

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          addresses: user.addresses,
        },
      });
    }

    res.status(400).json({ success: false, message: 'Invalid step' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Customer Address
// @route   POST /api/auth/address
// @access  Private (Customer)
export const addAddress = async (req, res) => {
  const { name, addressLine, city, state, latitude, longitude } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAddress = {
      name,
      addressLine,
      city,
      state,
      latitude,
      longitude,
      isDefault: user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit/Update Customer Address
// @route   PUT /api/auth/address/:id
// @access  Private (Customer)
export const updateAddress = async (req, res) => {
  const { name, addressLine, city, state, latitude, longitude, isDefault } = req.body;
  const addressId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.name = name || address.name;
    address.addressLine = addressLine || address.addressLine;
    address.city = city || address.city;
    address.state = state || address.state;
    address.latitude = latitude !== undefined ? latitude : address.latitude;
    address.longitude = longitude !== undefined ? longitude : address.longitude;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Customer Address
// @route   DELETE /api/auth/address/:id
// @access  Private (Customer)
export const deleteAddress = async (req, res) => {
  const addressId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);
    
    // Set first address as default if none is default
    if (user.addresses.length > 0 && !user.addresses.some((addr) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update user profile details and profile photo
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (password && password.trim() !== '') {
      user.password = password;
    }

    if (req.file) {
      user.profilePhotoUrl = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        branchId: user.branchId,
        branchName: user.branchName,
        profilePhotoUrl: user.profilePhotoUrl,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

