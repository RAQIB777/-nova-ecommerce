const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { requireAuth } = require("../middleware/auth");
const Order = require("../models/Order");

router.post("/create", requireAuth, async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: "Online payments are not configured" });
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id, paymentMethod: "razorpay", paymentStatus: "pending" });
    if (!order) return res.status(404).json({ message: "Pending payment order not found" });
    const gateway = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const paymentOrder = await gateway.orders.create({ amount: Math.round(order.total * 100), currency: "INR", receipt: String(order._id) });
    order.paymentOrderId = paymentOrder.id;
    await order.save();
    res.json({ keyId: process.env.RAZORPAY_KEY_ID, paymentOrder });
  } catch (e) { next(e); }
});
router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id, paymentMethod: "razorpay" });
    if (!order || order.paymentOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment order mismatch" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) return res.status(400).json({ message: "Invalid payment signature" });
    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "paid";
    order.status = "confirmed";
    await order.save();
    res.json({ verified: true, order });
  } catch (e) { next(e); }
});
module.exports = router;
