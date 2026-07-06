import Branch from '../models/Branch.js';
import User from '../models/User.js';

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json({ success: true, branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get approved branch heads for customer support
// @route   GET /api/branches/support
// @access  Public
export const getBranchSupportList = async (req, res) => {
  try {
    const heads = await User.find({ role: 'branch_head', status: 'approved' })
      .select('name phone branchName branchId profilePhotoUrl')
      .populate('branchId', 'name address');
    res.json({ success: true, branchHeads: heads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private (Super Admin)
export const createBranch = async (req, res) => {
  const { name, address, contactNumber, status } = req.body;

  try {
    const branchExists = await Branch.findOne({ name });
    if (branchExists) {
      return res.status(400).json({ success: false, message: 'Branch already exists' });
    }

    const branch = await Branch.create({
      name,
      address,
      contactNumber,
      status: status || 'active',
    });

    res.status(201).json({ success: true, branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (Super Admin)
export const updateBranch = async (req, res) => {
  const { name, address, contactNumber, status } = req.body;

  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    branch.name = name || branch.name;
    branch.address = address || branch.address;
    branch.contactNumber = contactNumber || branch.contactNumber;
    branch.status = status || branch.status;

    const updatedBranch = await branch.save();
    res.json({ success: true, branch: updatedBranch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private (Super Admin)
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    await Branch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Branch removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
