import Product from '../models/Product.js';

// @desc    Get all products (with search, category, branch, price filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, branch, minPrice, maxPrice, status, isFeatured } = req.query;

    const query = {};

    // Filter by keyword (searches name or description)
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by branch
    if (branch) {
      query.branch = branch;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.salePrice = {};
      if (minPrice) query.salePrice.$gte = Number(minPrice);
      if (maxPrice) query.salePrice.$lte = Number(maxPrice);
    }

    // Filter by status (default is active for public)
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    // Filter featured
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('branch', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('branch', 'name address contactNumber');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin or Branch Head)
export const createProduct = async (req, res) => {
  try {
    let {
      name,
      category,
      branch,
      description,
      originalPrice,
      salePrice,
      stockQuantity,
      status,
      isFeatured,
      specifications,
      variants,
    } = req.body;

    // Resolve branch ownership
    let assignedBranch = branch;
    if (req.user.role === 'branch_head') {
      assignedBranch = req.user.branchId; // Force branch head's branch
    }

    if (!assignedBranch) {
      return res.status(400).json({ success: false, message: 'Branch assignment is required' });
    }

    // Parse json fields if they come as string from FormData
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = {}; }
    }
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch (e) { variants = []; }
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.create({
      name,
      images,
      category,
      branch: assignedBranch,
      description,
      specifications,
      originalPrice: Number(originalPrice),
      salePrice: Number(salePrice),
      stockQuantity: Number(stockQuantity),
      status: status || 'active',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      variants,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin or Branch Head)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Enforce branch checks for Branch Heads
    if (req.user.role === 'branch_head' && product.branch.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this branch product' });
    }

    let {
      name,
      category,
      branch,
      description,
      originalPrice,
      salePrice,
      stockQuantity,
      status,
      isFeatured,
      specifications,
      variants,
    } = req.body;

    // Parse JSON arrays/maps if stringified (due to FormData uploads)
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = product.specifications; }
    }
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch (e) { variants = product.variants; }
    }

    product.name = name || product.name;
    product.category = category || product.category;
    if (req.user.role === 'super_admin' && branch) {
      product.branch = branch;
    }
    product.description = description || product.description;
    product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
    product.salePrice = salePrice !== undefined ? Number(salePrice) : product.salePrice;
    product.stockQuantity = stockQuantity !== undefined ? Number(stockQuantity) : product.stockQuantity;
    product.status = status || product.status;
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : product.isFeatured;
    product.specifications = specifications || product.specifications;
    product.variants = variants || product.variants;

    // Append new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin or Branch Head)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Enforce branch checks for Branch Heads
    if (req.user.role === 'branch_head' && product.branch.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this branch product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a product
// @route   POST /api/products/:id/reviews
// @access  Private (Customer)
export const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    await product.save(); // rating details recalculated in pre('save')

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
