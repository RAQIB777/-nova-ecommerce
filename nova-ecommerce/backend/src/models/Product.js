const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);
