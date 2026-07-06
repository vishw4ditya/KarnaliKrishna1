import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { generateInvoice } from '../utils/pdfGenerator.js';

// Helper to generate unique order number
const generateOrderNumber = () => {
  return 'NP-' + Math.floor(100000 + Math.random() * 900000);
};

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
  const {
    items,
    shippingAddress,
    couponCode,
    paymentMethod,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }

  try {
    // Retrieve web configuration
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const { vatRate, shippingCharge } = settings;

    // Verify stock and calculate subtotal
    let subTotal = 0;
    let branchId = null;

    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
        });
      }

      // Assign branch from first product (we assume items are routing from a branch inventory context)
      if (!branchId) {
        branchId = product.branch;
      }

      // Deduct Stock
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity === 0) {
        product.status = 'out_of_stock';
      }
      await product.save();

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.salePrice,
        quantity: item.quantity,
        variant: item.variant || '',
        image: product.images[0] || '',
      });

      subTotal += product.salePrice * item.quantity;
    }

    // Apply Coupon if present
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid(subTotal).valid) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (coupon.discountValue / 100) * subTotal;
          if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    // Taxes (VAT)
    const taxableAmount = Math.max(0, subTotal - discountAmount);
    const vatAmount = Math.round((taxableAmount * (vatRate / 100)) * 100) / 100;
    const totalAmount = taxableAmount + vatAmount + shippingCharge;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      branch: branchId,
      items: validatedItems,
      shippingAddress,
      coupon: {
        code: couponCode || '',
        discountAmount,
      },
      subTotal,
      discountAmount,
      shippingCharge,
      vatAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', // eSIM/Khalti mock payment is approved
      status: 'Pending',
      statusTimeline: [
        {
          status: 'Pending',
          note: 'Order successfully placed. Awaiting merchant confirmation.',
        },
      ],
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('branch', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get branch orders
// @route   GET /api/orders/branch
// @access  Private (Branch Head)
export const getBranchOrders = async (req, res) => {
  try {
    const orders = await Order.find({ branch: req.user.branchId })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Super Admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('branch', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('branch', 'name address contactNumber');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role authentication logic check
    const isCustomer = req.user.role === 'customer' && order.customer._id.toString() === req.user._id.toString();
    const isBranchOwner = req.user.role === 'branch_head' && order.branch._id.toString() === req.user.branchId?.toString();
    const isAdmin = req.user.role === 'super_admin';

    if (!isCustomer && !isBranchOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status timeline
// @route   PUT /api/orders/:id/status
// @access  Private (Admin or Branch Head)
export const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Enforce branch ownership for Branch Heads
    if (req.user.role === 'branch_head' && order.branch.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage orders of other branches' });
    }

    order.status = status;
    order.statusTimeline.push({
      status,
      note: note || `Order status set to ${status}`,
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'paid';
    }

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download PDF Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check credentials access
    const isCustomer = req.user.role === 'customer' && order.customer._id.toString() === req.user._id.toString();
    const isBranchOwner = req.user.role === 'branch_head' && order.branch.toString() === req.user.branchId?.toString();
    const isAdmin = req.user.role === 'super_admin';

    if (!isCustomer && !isBranchOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    generateInvoice(order, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
