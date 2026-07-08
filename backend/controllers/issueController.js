import CustomerIssue from '../models/CustomerIssue.js';
import Branch from '../models/Branch.js';

// @desc    Get all issue reports
// @route   GET /api/issues
// @access  Private (Admin or Branch Head)
export const getIssues = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'branch_head') {
      query.branch = req.user.branchId;
    }

    const issues = await CustomerIssue.find(query)
      .populate('branch', 'name')
      .populate('branchHead', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: issues.length, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a customer issue report
// @route   POST /api/issues
// @access  Private (Branch Head)
export const createIssue = async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    issueCategory,
    issueDescription,
    resolutionDetails,
    status,
  } = req.body;

  try {
    const branch = await Branch.findById(req.user.branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch head has no assigned branch' });
    }

    let supportingImages = [];
    if (req.files && req.files.length > 0) {
      supportingImages = req.files.map((file) => file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }

    const isResolved = status === 'Resolved';

    const issue = await CustomerIssue.create({
      customerName,
      customerPhone,
      customerAddress,
      issueCategory,
      issueDescription,
      resolutionDetails: resolutionDetails || '',
      resolutionDate: isResolved ? new Date() : null,
      supportingImages,
      branch: branch._id,
      branchName: branch.name,
      branchHead: req.user._id,
      branchHeadName: req.user.name,
      status: status || 'Open',
    });

    res.status(201).json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer issue details
// @route   PUT /api/issues/:id
// @access  Private (Admin or Branch Head)
export const updateIssue = async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    issueCategory,
    issueDescription,
    resolutionDetails,
    status
  } = req.body;

  try {
    const issue = await CustomerIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Enforce branch ownership for Branch Heads
    if (req.user.role === 'branch_head' && issue.branch.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify reports of other branches' });
    }

    if (customerName) issue.customerName = customerName;
    if (customerPhone) issue.customerPhone = customerPhone;
    if (customerAddress) issue.customerAddress = customerAddress;
    if (issueCategory) issue.issueCategory = issueCategory;
    if (issueDescription) issue.issueDescription = issueDescription;
    
    if (resolutionDetails !== undefined) {
      issue.resolutionDetails = resolutionDetails;
    }

    if (status) {
      issue.status = status;
      if (status === 'Resolved' && !issue.resolutionDate) {
        issue.resolutionDate = new Date();
      } else if (status !== 'Resolved') {
        issue.resolutionDate = null;
      }
    }

    const updatedIssue = await issue.save();
    res.json({ success: true, issue: updatedIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
