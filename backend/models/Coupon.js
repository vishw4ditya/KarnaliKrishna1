import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0, // 0 means no maximum discount cap
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate coupon usability
couponSchema.methods.isValid = function (orderAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (now > this.expiryDate) return { valid: false, message: 'Coupon has expired' };
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of Rs. ${this.minOrderAmount} is required for this coupon`,
    };
  }
  return { valid: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
