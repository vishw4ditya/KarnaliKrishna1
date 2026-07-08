import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Home, Office, Parent's house
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'branch_head', 'super_admin'],
      default: 'customer',
    },
    // Branch assignment (primarily for Branch Heads)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    branchName: {
      type: String,
      default: '',
    },
    // Branch Head verification details
    profilePhotoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Default approved for customers, will override for branch_head during registration
    },
    addresses: [addressSchema],
    googleId: {
      type: String,
      default: null,
    },
    customId: {
      type: String,
      unique: true,
      sparse: true,
    }
  },
  {
    timestamps: true,
  }
);

// Helper function to generate custom ID (2 letters role prefix + 6 digits)
const generateCustomId = (role) => {
  const prefix = role === 'super_admin' ? 'SA' : role === 'branch_head' ? 'BH' : 'US';
  const digits = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}${digits}`;
};

// Generate customId before saving if applicable
userSchema.pre('save', async function (next) {
  if ((this.role === 'super_admin' || this.role === 'branch_head') && !this.customId) {
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const tempId = generateCustomId(this.role);
      const existing = await this.constructor.findOne({ customId: tempId });
      if (!existing) {
        this.customId = tempId;
        isUnique = true;
      }
      attempts++;
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
