const router = require("express").Router();
const Product = require("../models/Product");
router.get("/", async (req, res, next) => {
  try {
    const q = {};
    if (req.query.category && req.query.category !== "All") q.category = req.query.category;
    if (req.query.search) q.name = { $regex: String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    q.active = true;
    const products = await Product.find(q).sort({ createdAt: -1 }).limit(100);
    res.json({ products });
  } catch (e) { next(e); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.active) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (e) { next(e); }
});
module.exports = router;
