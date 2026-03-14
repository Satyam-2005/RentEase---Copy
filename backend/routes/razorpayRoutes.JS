const express  = require("express");
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const router   = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount:  Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

router.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment fields" });
    }

    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Payment signature mismatch" });
    }
  } catch (err) {
    console.error("Razorpay verify-payment error:", err);
    res.status(500).json({ success: false, error: "Server error during verification" });
  }
});
module.exports = router;