const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    productName:    { type: String, required: true },
    productImage:   { type: String },
    price:          { type: Number },
    tenure:         { type: Number },
    totalAmount:    { type: Number },
    userEmail:      { type: String, required: true },
    phone:          { type: String },
    address:        { type: String },
    landmark:       { type: String },
    paymentMethod:  { type: String },
    paymentStatus:  { type: String, default: "Paid" },
    approvalStatus: {
      type:    String,
      enum:    ["Pending", "Approved", "Delivered", "Cancelled"],
      default: "Pending",
    },
    pauseStatus:    { type: String, enum: ["Active", "Paused"], default: "Active" },
    orderId:        { type: String },
    couponApplied:  { type: String, default: "" },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    serviceArea:    { type: String },
    deliveryDate:   { type: Date },
    pickupDate:     { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);