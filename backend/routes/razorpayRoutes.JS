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

    const safeReceipt = (receipt || `rcpt_${Date.now()}`)
      .toString()
      .slice(0, 40)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const options = {
      amount:  Math.round(Number(amount) * 100),
      currency,
      receipt: safeReceipt,
    };

    console.log("Creating Razorpay order:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);
    res.status(200).json(order);

  } catch (err) {
    console.error("Razorpay create-order error:", err?.error || err?.message || err);
    res.status(500).json({
      error:   "Failed to create Razorpay order",
      details: err?.error?.description || err?.message || "Unknown error",
    });
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
      console.log("Payment verified:", razorpay_payment_id);
      res.status(200).json({ success: true });
    } else {
      console.error("Signature mismatch:", razorpay_payment_id);
      res.status(400).json({ success: false, error: "Payment signature mismatch" });
    }

  } catch (err) {
    console.error("Razorpay verify-payment error:", err);
    res.status(500).json({ success: false, error: "Server error during verification" });
  }
});

module.exports = router;