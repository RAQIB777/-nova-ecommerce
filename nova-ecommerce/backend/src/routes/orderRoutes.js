const router = require("express").Router();
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/auth");
const Product = require("../models/Product");
const Order = require("../models/Order");

router.post("/", requireAuth, async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const { items, shippingAddress, paymentMethod } = req.body;
      if (!Array.isArray(items) || !items.length || !shippingAddress?.name || !shippingAddress?.line1 || !shippingAddress?.postalCode) {
        const e = new Error("Items and a complete shipping address are required"); e.status = 400; throw e;
      }
      if (!["cod", "razorpay"].includes(paymentMethod)) { const e = new Error("Invalid payment method"); e.status = 400; throw e; }
      const normalized = [];
      let subtotal = 0;
      for (const line of items) {
        const product = await Product.findById(line.productId).session(session);
        const quantity = Number(line.quantity);
        if (!product || !product.active || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) {
          const e = new Error("A product is unavailable or has insufficient stock"); e.status = 409; throw e;
        }
        product.stock -= quantity;
        await product.save({ session });
        subtotal += product.price * quantity;
        normalized.push({ product: product._id, name: product.name, image: product.images[0] || "", quantity, price: product.price, size: line.size || "", color: line.color || "" });
      }
      const shippingFee = subtotal >= 1999 ? 0 : 99;
      const [order] = await Order.create([{ user: req.user._id, items: normalized, shippingAddress, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod, paymentStatus: paymentMethod === "cod" ? "pending" : "pending", status: paymentMethod === "cod" ? "confirmed" : "pending" }], { session });
      created = order;
    });
    res.status(201).json({ order: created });
  } catch (e) { next(e); } finally { await session.endSession(); }
});
router.get("/myorders", requireAuth, async (req, res, next) => {
  try { res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) }); }
  catch (e) { next(e); }
});
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (e) { next(e); }
});
router.put("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["pending", "confirmed"].includes(order.status)) return res.status(409).json({ message: "This order can no longer be cancelled online" });
    order.status = "cancelled";
    await order.save();
    res.json({ order });
  } catch (e) { next(e); }
});
module.exports = router;
