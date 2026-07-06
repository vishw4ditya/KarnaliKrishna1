import mongoose from 'mongoose';

const customerIssueSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    issueCategory: {
      type: String,
      required: true,
      enum: ['Delivery', 'Product Quality', 'Billing', 'Return/Refund', 'Other'],
    },
    issueDescription: {
      type: String,
      required: true,
    },
    resolutionDetails: {
      type: String,
      default: '',
    },
    resolutionDate: {
      type: Date,
      default: null,
    },
    supportingImages: [{
      type: String,
    }],
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    branchHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchHeadName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

const CustomerIssue = mongoose.model('CustomerIssue', customerIssueSchema);
export default CustomerIssue;
