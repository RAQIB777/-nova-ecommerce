const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.requireAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ message: "Sign in required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub).select("-passwordHash");
    if (!req.user) return res.status(401).json({ message: "Account not found" });
    next();
  } catch { res.status(401).json({ message: "Invalid or expired token" }); }
};
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};
