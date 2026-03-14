const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  category:      { type: String, required: true },
  image:         { type: String, default: "" },
  description:   { type: String, default: "" },
  rentPerMonth:  { type: Number, required: true },
  deposit:       { type: Number, required: true },
  tenureOptions: { type: [Number], default: [3, 6, 12] },
  serviceAreas:  { type: [String], default: [] },
  damagePolicy:  { type: String, default: "" },
  availability:  { type: String, enum: ["available", "unavailable"], default: "available" },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);