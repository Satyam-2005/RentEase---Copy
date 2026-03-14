const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel"); 
const { sendEmail } = require("../utils/sendEmail");

// DELETE Order
router.delete("/orders/:id", async (req, res) => {
  try {
    const { message } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    await sendEmail(
      order.userEmail,
      "Order Removed",
      `Hello,\n\nYour order for ${order.productName} has been removed by admin.\n\nAdmin Message: ${message}`
    );

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted and email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all orders for Admin Dashboard
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

module.exports = router;