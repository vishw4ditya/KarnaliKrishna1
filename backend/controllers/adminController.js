import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import Coupon from '../models/Coupon.js';
import CustomerIssue from '../models/CustomerIssue.js';
import { generatePdfReport } from '../utils/pdfGenerator.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

// @desc    Get dashboard metrics & analytics
// @route   GET /api/admin/analytics
// @access  Private (Super Admin or Branch Head with branch-specific scope)
export const getAnalytics = async (req, res) => {
  try {
    const isBranch = req.user.role === 'branch_head';
    const branchId = req.user.branchId;

    const query = {};
    if (isBranch) {
      query.branch = branchId;
    }

    // 1. Core Metrics
    const totalOrders = await Order.countDocuments(query);
    const totalProducts = await Product.countDocuments(isBranch ? { branch: branchId } : {});
    
    let totalCustomers = 0;
    if (isBranch) {
      // Customers who have placed orders at this branch
      const customerIds = await Order.distinct('customer', { branch: branchId });
      totalCustomers = customerIds.length;
    } else {
      totalCustomers = await User.countDocuments({ role: 'customer' });
    }

    const totalBranches = isBranch ? 1 : await Branch.countDocuments();
    const totalCoupons = isBranch ? 0 : await Coupon.countDocuments();
    const totalIssues = await CustomerIssue.countDocuments(isBranch ? { branch: branchId } : {});

    // Calculate total sales
    const salesData = await Order.find({ ...query, status: { $ne: 'Cancelled' } });
    const totalSales = salesData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // 2. Sales Trend (by month/date for charts)
    const salesTrend = salesData.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.sales += order.totalAmount;
        existing.orders += 1;
      } else {
        acc.push({ date, sales: order.totalAmount, orders: 1 });
      }
      return acc;
    }, []);

    // 3. Branch performance (if super admin)
    let branchPerformance = [];
    if (!isBranch) {
      const branches = await Branch.find();
      const orders = await Order.find({ status: { $ne: 'Cancelled' } });

      branchPerformance = branches.map((b) => {
        const branchOrders = orders.filter((o) => o.branch.toString() === b._id.toString());
        const sales = branchOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
        return {
          id: b._id,
          name: b.name,
          ordersCount: branchOrders.length,
          sales,
        };
      });
    }

    res.json({
      success: true,
      metrics: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalBranches,
        totalCoupons,
        totalIssues,
      },
      analytics: {
        salesTrend: salesTrend.slice(-10), // last 10 records
        branchPerformance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with role 'branch_head' for approval
// @route   GET /api/admin/branch-heads
// @access  Private (Super Admin)
export const getBranchHeads = async (req, res) => {
  try {
    const branchHeads = await User.find({ role: 'branch_head' }).sort({ createdAt: -1 });
    res.json({ success: true, branchHeads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject branch head registration
// @route   PUT /api/admin/branch-heads/:id/status
// @access  Private (Super Admin)
export const updateBranchHeadStatus = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const branchHead = await User.findById(req.params.id);
    if (!branchHead || branchHead.role !== 'branch_head') {
      return res.status(404).json({ success: false, message: 'Branch Head not found' });
    }

    branchHead.status = status;
    await branchHead.save();

    res.json({
      success: true,
      message: `Branch Head status updated to ${status}`,
      branchHead: {
        id: branchHead._id,
        name: branchHead.name,
        status: branchHead.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export custom Excel or PDF reports
// @route   GET /api/admin/reports/export
// @access  Private (Super Admin)
export const exportReport = async (req, res) => {
  const { type, format } = req.query; // type: sales, orders, customers, branches, issues; format: pdf, excel

  try {
    if (type === 'sales') {
      const orders = await Order.find({ status: { $ne: 'Cancelled' } })
        .populate('customer', 'name')
        .populate('branch', 'name');

      if (format === 'excel') {
        const data = orders.map((o) => ({
          'Order Number': o.orderNumber,
          Customer: o.customer?.name || 'Guest',
          Branch: o.branch?.name || 'Main',
          Date: new Date(o.createdAt).toLocaleDateString(),
          Subtotal: o.subTotal,
          Discount: o.discountAmount,
          VAT: o.vatAmount,
          'Total (Rs.)': o.totalAmount,
          'Payment Status': o.paymentStatus,
          Status: o.status,
        }));
        return generateExcelReport('Sales Report', data, res);
      } else {
        const headers = ['Order #', 'Customer', 'Branch', 'Date', 'Total (Rs.)', 'Status'];
        const rows = orders.map((o) => [
          o.orderNumber,
          o.customer?.name || 'Guest',
          o.branch?.name || 'Main',
          new Date(o.createdAt).toLocaleDateString(),
          o.totalAmount.toFixed(2),
          o.status,
        ]);
        return generatePdfReport('Sales Report', headers, rows, res);
      }
    }

    if (type === 'orders') {
      const orders = await Order.find()
        .populate('customer', 'name')
        .populate('branch', 'name');

      if (format === 'excel') {
        const data = orders.map((o) => ({
          'Order Number': o.orderNumber,
          Customer: o.customer?.name || 'Guest',
          Branch: o.branch?.name || 'Main',
          Items: o.items.length,
          'Total Amount': o.totalAmount,
          'Payment Method': o.paymentMethod,
          Status: o.status,
          Date: new Date(o.createdAt).toLocaleDateString(),
        }));
        return generateExcelReport('Orders Report', data, res);
      } else {
        const headers = ['Order #', 'Branch', 'Items', 'Total (Rs.)', 'Payment', 'Status'];
        const rows = orders.map((o) => [
          o.orderNumber,
          o.branch?.name || 'Main',
          o.items.length.toString(),
          o.totalAmount.toFixed(2),
          o.paymentMethod.toUpperCase(),
          o.status,
        ]);
        return generatePdfReport('Orders Report', headers, rows, res);
      }
    }

    if (type === 'customers') {
      const customers = await User.find({ role: 'customer' });

      if (format === 'excel') {
        const data = customers.map((c) => ({
          Name: c.name,
          Email: c.email,
          Phone: c.phone,
          Addresses: c.addresses.length,
          'Joined Date': new Date(c.createdAt).toLocaleDateString(),
        }));
        return generateExcelReport('Customers Report', data, res);
      } else {
        const headers = ['Name', 'Email', 'Phone', 'Addresses Count', 'Joined Date'];
        const rows = customers.map((c) => [
          c.name,
          c.email,
          c.phone,
          c.addresses.length.toString(),
          new Date(c.createdAt).toLocaleDateString(),
        ]);
        return generatePdfReport('Customers Report', headers, rows, res);
      }
    }

    if (type === 'branches') {
      const branches = await Branch.find();
      const orders = await Order.find({ status: { $ne: 'Cancelled' } });

      const data = branches.map((b) => {
        const branchOrders = orders.filter((o) => o.branch.toString() === b._id.toString());
        const sales = branchOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
        return {
          id: b._id,
          name: b.name,
          address: b.address,
          phone: b.contactNumber,
          status: b.status,
          orders: branchOrders.length,
          sales: sales,
        };
      });

      if (format === 'excel') {
        const excelData = data.map((b) => ({
          Name: b.name,
          Address: b.address,
          Phone: b.phone,
          Status: b.status,
          'Total Orders': b.orders,
          'Total Sales (Rs.)': b.sales,
        }));
        return generateExcelReport('Branches Report', excelData, res);
      } else {
        const headers = ['Name', 'Address', 'Status', 'Orders', 'Sales (Rs.)'];
        const rows = data.map((b) => [
          b.name,
          b.address,
          b.status,
          b.orders.toString(),
          b.sales.toFixed(2),
        ]);
        return generatePdfReport('Branch Performance Report', headers, rows, res);
      }
    }

    if (type === 'issues') {
      const issues = await CustomerIssue.find();

      if (format === 'excel') {
        const data = issues.map((i) => ({
          Customer: i.customerName,
          Phone: i.customerPhone,
          Branch: i.branchName,
          Category: i.issueCategory,
          Description: i.issueDescription,
          Status: i.status,
          'Branch Head': i.branchHeadName,
          Date: new Date(i.createdAt).toLocaleDateString(),
        }));
        return generateExcelReport('Issues Report', data, res);
      } else {
        const headers = ['Customer', 'Branch', 'Category', 'Status', 'Filer (Branch Head)', 'Date'];
        const rows = issues.map((i) => [
          i.customerName,
          i.branchName,
          i.issueCategory,
          i.status,
          i.branchHeadName,
          new Date(i.createdAt).toLocaleDateString(),
        ]);
        return generatePdfReport('Customer Issues Report', headers, rows, res);
      }
    }

    res.status(400).json({ success: false, message: 'Invalid report parameters' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update branch head details
// @route   PUT /api/admin/branch-heads/:id
// @access  Private (Super Admin)
export const updateBranchHead = async (req, res) => {
  const { name, email, phone, password, branchId, status } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'branch_head') {
      return res.status(404).json({ success: false, message: 'Branch Head not found' });
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
    if (status) user.status = status;

    if (password && password.trim() !== '') {
      user.password = password;
    }

    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (branch) {
        user.branchId = branch._id;
        user.branchName = branch.name;
      } else {
        return res.status(404).json({ success: false, message: 'Branch not found' });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Branch Head updated successfully',
      branchHead: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete branch head account
// @route   DELETE /api/admin/branch-heads/:id
// @access  Private (Super Admin)
export const deleteBranchHead = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'branch_head') {
      return res.status(404).json({ success: false, message: 'Branch Head not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Branch Head deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

