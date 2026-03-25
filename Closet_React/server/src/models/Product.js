import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    mainCategory: { type: String, index: true }, // Men, Women
    subCategory: { type: String, index: true }, // Shirts, Pants, Sarees
    category: { type: String, index: true }, // Keep for backward compatibility
    brand: { type: String },
    sizes: [{
      size: { type: String, required: true },
      qty: { type: Number, required: true, min: 0 }
    }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0 },
    isFreeSize: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    numRatings: { type: Number, default: 0 },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        stars: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },

        createdAt: { type: Date, default: Date.now }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;


