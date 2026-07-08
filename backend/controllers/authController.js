import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretnepalbazaarjwtkey12345!', {
    expiresIn: '30d',
  });
};

const validatePasswordMix = (password) => {
  if (!password) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const registerCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!validatePasswordMix(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain a mix of alphabets and digits' });
    }

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
    if (!validatePasswordMix(password)) {
      return res.status(400).json({ success: false, message: 'Password must contain a mix of alphabets and digits' });
    }

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
          customId: user.customId,
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
      if (!validatePasswordMix(password)) {
        return res.status(400).json({ success: false, message: 'Password must contain a mix of alphabets and digits' });
      }
      user.password = password;
    }

    if (req.file) {
      user.profilePhotoUrl = req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
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
        customId: user.customId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using customId and phone
// @route   POST /api/auth/forgot-password
// @access  Public
export const resetPasswordWithCustomIdAndPhone = async (req, res) => {
  const { customId, phone, newPassword } = req.body;

  try {
    if (!customId || !phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'ID, phone number, and new password are required' });
    }

    if (!validatePasswordMix(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must contain a mix of alphabets and digits' });
    }

    // Find super admin or branch head with matching customId and phone number
    const user = await User.findOne({
      customId,
      phone,
      role: { $in: ['super_admin', 'branch_head'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid ID or phone number' });
    }

    user.password = newPassword; // Will be hashed automatically by userSchema pre-save hook
    await user.save();

    res.json({ success: true, message: 'Password has been updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

