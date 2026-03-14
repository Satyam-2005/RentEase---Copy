const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const { sendEmail } = require("../utils/sendEmail");

const trySendEmail = async (to, subject, text, html) => {
  try {
    await sendEmail(to, subject, text, html);
    console.log(`Email dispatched to ${to}`);
  } catch (e) {
    console.error("Email failed (non-fatal):", e.message);
  }
};

const cancelEmailHTML = (productName, reason) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:'Segoe UI',sans-serif;background:#f8f9fd;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#1e293b,#334155);padding:36px 40px}
  .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800}
  .hdr p{color:#94a3b8;margin:6px 0 0;font-size:13px}
  .badge{display:inline-block;background:#ef4444;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-top:14px}
  .body{padding:36px 40px}
  .card{background:#f8f9fd;border-radius:14px;padding:18px 22px;margin-bottom:24px;border-left:4px solid #ef4444}
  .card h3{margin:0 0 4px;color:#1e293b;font-size:15px;font-weight:700}
  .card p{margin:0;color:#64748b;font-size:13px}
  .reason{background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:18px 22px;margin-bottom:24px}
  .reason h4{margin:0 0 8px;color:#c2410c;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px}
  .reason p{margin:0;color:#7c2d12;font-size:14px;line-height:1.6}
  .info{color:#64748b;font-size:13px;line-height:1.7;margin-bottom:24px}
  .cta{display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:13px;font-weight:700}
  .foot{background:#f8f9fd;padding:22px 40px;border-top:1px solid #e2e8f0}
  .foot p{margin:0;color:#94a3b8;font-size:11px;line-height:1.6}
</style></head>
<body><div class="wrap">
  <div class="hdr">
    <h1>RentEase</h1><p>Rental Subscription Platform</p>
    <span class="badge">Order Cancelled</span>
  </div>
  <div class="body">
    <p class="info">We're sorry to inform you that your order has been cancelled by our team.</p>
    <div class="card"><h3>${productName}</h3><p>Your rental order for this product has been cancelled.</p></div>
    <div class="reason"><h4>Reason for Cancellation</h4><p>${reason}</p></div>
    <p class="info">If you have questions, contact our support team. You can also browse our catalog and place a new order anytime.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta">Browse Products</a>
  </div>
  <div class="foot"><p>You received this because you placed an order on RentEase. &copy; ${new Date().getFullYear()} RentEase.</p></div>
</div></body></html>`;

const deliveredEmailHTML = (productName) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:'Segoe UI',sans-serif;background:#f8f9fd;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#064e3b,#065f46);padding:36px 40px}
  .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800}
  .hdr p{color:#6ee7b7;margin:6px 0 0;font-size:13px}
  .badge{display:inline-block;background:#10b981;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-top:14px}
  .body{padding:36px 40px}
  .emoji{font-size:44px;text-align:center;margin-bottom:18px}
  .card{background:#f0fdf4;border-radius:14px;padding:18px 22px;margin-bottom:24px;border-left:4px solid #10b981}
  .card h3{margin:0 0 4px;color:#1e293b;font-size:15px;font-weight:700}
  .card p{margin:0;color:#64748b;font-size:13px}
  .info{color:#64748b;font-size:13px;line-height:1.7;margin-bottom:24px}
  .cta{display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-size:13px;font-weight:700}
  .foot{background:#f8f9fd;padding:22px 40px;border-top:1px solid #e2e8f0}
  .foot p{margin:0;color:#94a3b8;font-size:11px}
</style></head>
<body><div class="wrap">
  <div class="hdr">
    <h1>RentEase</h1><p>Rental Subscription Platform</p>
    <span class="badge">Delivered</span>
  </div>
  <div class="body">
    <div class="emoji">🎉</div>
    <p class="info">Great news! Your rental has been delivered and your subscription is now active.</p>
    <div class="card"><h3>${productName}</h3><p>Your rental is now active and visible in My Rentals.</p></div>
    <p class="info">You can pause, resume, or request maintenance anytime from your dashboard.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-rentals" class="cta">Go to My Rentals</a>
  </div>
  <div class="foot"><p>&copy; ${new Date().getFullYear()} RentEase. All rights reserved.</p></div>
</div></body></html>`;

const approvedEmailHTML = (productName) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:'Segoe UI',sans-serif;background:#f8f9fd;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#312e81,#4338ca);padding:36px 40px}
  .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800}
  .hdr p{color:#a5b4fc;margin:6px 0 0;font-size:13px}
  .badge{display:inline-block;background:#6366f1;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-top:14px}
  .body{padding:36px 40px}
  .card{background:#eef2ff;border-radius:14px;padding:18px 22px;margin-bottom:24px;border-left:4px solid #6366f1}
  .card h3{margin:0 0 4px;color:#1e293b;font-size:15px;font-weight:700}
  .card p{margin:0;color:#64748b;font-size:13px}
  .info{color:#64748b;font-size:13px;line-height:1.7;margin-bottom:24px}
  .foot{background:#f8f9fd;padding:22px 40px;border-top:1px solid #e2e8f0}
  .foot p{margin:0;color:#94a3b8;font-size:11px}
</style></head>
<body><div class="wrap">
  <div class="hdr">
    <h1>RentEase</h1><p>Rental Subscription Platform</p>
    <span class="badge">Order Approved</span>
  </div>
  <div class="body">
    <p class="info">Your order has been reviewed and approved! We are preparing your rental for delivery.</p>
    <div class="card"><h3>${productName}</h3><p>Approved — preparing for dispatch.</p></div>
    <p class="info">You will receive another email once delivered. Thank you for choosing RentEase!</p>
  </div>
  <div class="foot"><p>&copy; ${new Date().getFullYear()} RentEase. All rights reserved.</p></div>
</div></body></html>`;

router.post("/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order Saved" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const filter = {};
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.userEmail) filter.userEmail = req.query.userEmail;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (approvalStatus === "Approved") {
      await trySendEmail(
        order.userEmail,
        "Your Order Has Been Approved - RentEase",
        `Your order for ${order.productName} has been approved and is being prepared for delivery.`,
        approvedEmailHTML(order.productName)
      );
    }

    if (approvalStatus === "Delivered") {
      await trySendEmail(
        order.userEmail,
        "Your Rental Has Been Delivered - RentEase",
        `Your rental for ${order.productName} is now active. Visit your dashboard to manage it.`,
        deliveredEmailHTML(order.productName)
      );
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.patch("/orders/:id/pause", async (req, res) => {
  try {
    const { pauseStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { pauseStatus }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: "Failed to update pause status" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const reason = req.body?.message || "Your order has been cancelled by our team.";

    await Order.findByIdAndUpdate(req.params.id, { approvalStatus: "Cancelled" });

    await trySendEmail(
      order.userEmail,
      "Your Order Has Been Cancelled - RentEase",
      `Your order for ${order.productName} was cancelled.\n\nReason: ${reason}`,
      cancelEmailHTML(order.productName, reason)
    );

    console.log(`Order ${req.params.id} marked Cancelled. Email sent to ${order.userEmail}`);
    res.json({ success: true, message: "Order cancelled and email sent." });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ error: error.message || "Failed to cancel order" });
  }
});

module.exports = router;