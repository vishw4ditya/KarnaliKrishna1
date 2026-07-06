import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin, Branch Head or Customer checking out)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private (Admin or Branch Head)
export const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiryDate, minOrderAmount, maxDiscount } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate: new Date(expiryDate),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin or Branch Head)
export const updateCoupon = async (req, res) => {
  const { discountType, discountValue, expiryDate, minOrderAmount, maxDiscount, isActive } = req.body;

  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue !== undefined ? Number(discountValue) : coupon.discountValue;
    coupon.expiryDate = expiryDate ? new Date(expiryDate) : coupon.expiryDate;
    coupon.minOrderAmount = minOrderAmount !== undefined ? Number(minOrderAmount) : coupon.minOrderAmount;
    coupon.maxDiscount = maxDiscount !== undefined ? Number(maxDiscount) : coupon.maxDiscount;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin or Branch Head)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a coupon code against a purchase subtotal
// @route   POST /api/coupons/validate
// @access  Private (Customer)
export const validateCoupon = async (req, res) => {
  const { code, subTotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }

    const check = coupon.isValid(subTotal);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (coupon.discountValue / 100) * subTotal;
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // fixed discount
      discountAmount = coupon.discountValue;
    }

    // Cap discount at subtotal
    if (discountAmount > subTotal) {
      discountAmount = subTotal;
    }

    res.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
