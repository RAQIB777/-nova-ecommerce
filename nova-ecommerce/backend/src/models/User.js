const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: [{ name: String, phone: String, line1: String, line2: String, city: String, state: String, postalCode: String, country: { type: String, default: "India" } }]
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
