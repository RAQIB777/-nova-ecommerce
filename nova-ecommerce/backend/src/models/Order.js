const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, name: String, image: String, quantity: Number, price: Number, size: String, color: String }],
  shippingAddress: { name: String, phone: String, line1: String, line2: String, city: String, state: String, postalCode: String, country: String },
  subtotal: Number, shippingFee: Number, total: Number,
  paymentMethod: { type: String, enum: ["razorpay", "cod"], required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  paymentOrderId: String, paymentId: String,
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"], default: "pending" }
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
