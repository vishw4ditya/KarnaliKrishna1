import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Color"
  options: [{ type: String, required: true }], // e.g. ["S", "M", "L"] or ["Red", "Blue"]
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
    }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'out_of_stock'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to calculate rating average automatically
productSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
    this.reviewsCount = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.reviewsCount = 0;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
