const router = require("express").Router();
const { requireAuth, requireAdmin } = require("../middleware/auth");
const Order = require("../models/Order");
router.use(requireAuth, requireAdmin);
router.get("/orders", async (_req, res, next) => {
  try { res.json({ orders: await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(500) }); }
  catch (e) { next(e); }
});
router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const allowed = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (e) { next(e); }
});
router.get("/dashboard", async (_req, res, next) => {
  try {
    const [orders, paid] = await Promise.all([Order.countDocuments(), Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, revenue: { $sum: "$total" } } }])]);
    res.json({ orders, revenue: paid[0]?.revenue || 0 });
  } catch (e) { next(e); }
});
module.exports = router;
