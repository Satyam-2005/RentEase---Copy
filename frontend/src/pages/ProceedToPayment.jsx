import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CreditCard, Truck, ShieldCheck, Tag, CheckCircle2,
  ChevronRight, AlertCircle, Smartphone, Landmark, Lock,
  Info, Receipt, MapPin, Banknote,
  ArrowLeft, Wallet, RefreshCw,
  Building2, QrCode, Zap, Phone, Mail,
  User, Hash, ChevronDown, RotateCcw,
  Home, Download, FileText,
} from "lucide-react";

const API = "https://rentease-backend-oxyy.onrender.com";
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n || 0));

const COUPONS = {
  SAVE10:   { desc: "GST waived + \u20b970 off",    gstFree: true,  flat: 70,  pct: 0,    freeOrder: false },
  RENT5:    { desc: "5% off on base rent",           gstFree: false, flat: 0,   pct: 0.05, freeOrder: false },
  NEWUSER:  { desc: "\u20b9150 off for first order", gstFree: false, flat: 150, pct: 0,    freeOrder: false },
  FREESHIP: { desc: "100% off \u2014 Pay \u20b90",   gstFree: true,  flat: 0,   pct: 0,    freeOrder: true  },
};

const PAYMENT_METHODS = [
  { id: "card",       icon: CreditCard, label: "Card",            sub: "Credit / Debit"  },
  { id: "upi",        icon: Smartphone, label: "UPI",             sub: "GPay \u00b7 PhonePe" },
  { id: "wallet",     icon: Wallet,     label: "Wallet",          sub: "Paytm \u00b7 Amazon" },
  { id: "netbanking", icon: Landmark,   label: "Net Banking",     sub: "All major banks" },
  { id: "cod",        icon: Banknote,   label: "Pay on Delivery", sub: "Cash / UPI"      },
];

const RAZORPAY_METHOD_MAP = {
  card:       { card: 1 },
  upi:        { upi: 1 },
  wallet:     { wallet: 1 },
  netbanking: { netbanking: 1 },
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("rzp-script")) { resolve(true); return; }
    const s = document.createElement("script");
    s.id = "rzp-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function generateReceiptHTML(receiptData) {
  const {
    orderId, razorpayPayId, paymentMethod, paymentStatus,
    form, cart, totals, appliedCoupon, isFreeOrder, date,
  } = receiptData;

  const itemRows = cart.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">${item.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center;">${item.tenure} mo</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:right;">\u20b9${fmt(item.price)}/mo</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#560BAD;text-align:right;">\u20b9${fmt(item.price * item.tenure)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>RentEase Receipt \u2014 ${orderId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:#f8fafc; color:#1e293b; }
  .page { max-width:700px; margin:0 auto; background:#fff; }
  .header { background:linear-gradient(135deg,#560BAD 0%,#7c3aed 100%); padding:40px 48px; }
  .header-top { display:flex; justify-content:space-between; align-items:flex-start; }
  .brand { color:#fff; font-size:24px; font-weight:900; letter-spacing:-0.5px; }
  .brand-sub { color:rgba(255,255,255,0.6); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; margin-top:2px; }
  .receipt-badge { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.2); border-radius:12px; padding:8px 16px; text-align:right; }
  .receipt-badge-label { color:rgba(255,255,255,0.6); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:2px; }
  .receipt-badge-val { color:#fff; font-size:13px; font-weight:700; font-family:monospace; margin-top:2px; }
  .status-bar { margin-top:24px; display:flex; align-items:center; gap:12px; }
  .status-pill { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:100px; padding:6px 14px; }
  .status-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; }
  .status-text { color:#fff; font-size:11px; font-weight:700; }
  .amount-hero { margin-top:20px; }
  .amount-label { color:rgba(255,255,255,0.6); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; }
  .amount-value { color:#fff; font-size:42px; font-weight:900; margin-top:4px; }
  .body { padding:40px 48px; }
  .section { margin-bottom:32px; }
  .section-title { font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid #f1f5f9; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .info-box { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:16px; }
  .info-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#94a3b8; margin-bottom:6px; }
  .info-value { font-size:13px; font-weight:600; color:#334155; }
  .info-sub { font-size:11px; color:#94a3b8; margin-top:2px; }
  table { width:100%; border-collapse:collapse; }
  thead th { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#94a3b8; padding:8px; text-align:left; border-bottom:2px solid #f1f5f9; }
  thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align:right; }
  .totals-box { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:20px; }
  .total-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; font-size:12px; }
  .total-row-label { color:#64748b; }
  .total-row-value { font-weight:600; color:#334155; }
  .total-row-discount { color:#10b981; }
  .total-final { display:flex; justify-content:space-between; align-items:center; padding-top:14px; margin-top:10px; border-top:2px solid #e2e8f0; }
  .total-final-label { font-size:14px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:1px; }
  .total-final-value { font-size:28px; font-weight:900; color:#560BAD; }
  .payment-row { display:flex; align-items:center; gap:12px; background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:16px; }
  .payment-icon { width:40px; height:40px; background:#ede9fe; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .payment-name { font-size:13px; font-weight:700; color:#334155; }
  .payment-id { font-size:10px; color:#94a3b8; font-family:monospace; margin-top:2px; }
  .footer { background:#f8fafc; border-top:1px solid #f1f5f9; padding:24px 48px; display:flex; justify-content:space-between; align-items:center; }
  .footer-brand { font-size:12px; font-weight:700; color:#560BAD; }
  .footer-note { font-size:10px; color:#94a3b8; }
  .highlight-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; display:flex; align-items:flex-start; gap:12px; }
  .highlight-icon { font-size:20px; flex-shrink:0; }
  .highlight-text { font-size:12px; color:#166534; line-height:1.6; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand">RentEase</div>
        <div class="brand-sub">Payment Receipt</div>
      </div>
      <div class="receipt-badge">
        <div class="receipt-badge-label">Order ID</div>
        <div class="receipt-badge-val">${orderId}</div>
      </div>
    </div>
    <div class="status-bar">
      <div class="status-pill">
        <div class="status-dot"></div>
        <span class="status-text">${paymentStatus}</span>
      </div>
      <span style="color:rgba(255,255,255,0.5);font-size:11px;">${date}</span>
    </div>
    <div class="amount-hero">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">${isFreeOrder ? "FREE" : "\u20b9" + fmt(totals.total)}</div>
    </div>
  </div>

  <div class="body">

    <div class="section">
      <div class="section-title">Customer & Delivery Details</div>
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">Customer Name</div>
          <div class="info-value">${form.name}</div>
          <div class="info-sub">${form.email}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Mobile Number</div>
          <div class="info-value">${form.phone}</div>
          ${form.altPhone ? `<div class="info-sub">Alt: ${form.altPhone}</div>` : ""}
        </div>
        <div class="info-box" style="grid-column:1/-1;">
          <div class="info-label">Delivery Address</div>
          <div class="info-value">${form.address}${form.landmark ? ", " + form.landmark : ""}</div>
          <div class="info-sub">${form.city}, ${form.state} \u2013 ${form.zip}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Items Rented</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Tenure</th>
            <th style="text-align:right;">Rate</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Price Breakdown</div>
      <div class="totals-box">
        <div class="total-row">
          <span class="total-row-label">Base Rent</span>
          <span class="total-row-value">\u20b9${fmt(totals.subtotal)}</span>
        </div>
        ${totals.pctDiscount > 0 ? `<div class="total-row"><span class="total-row-label">Coupon Discount (${appliedCoupon})</span><span class="total-row-value total-row-discount">-\u20b9${fmt(totals.pctDiscount)}</span></div>` : ""}
        ${!isFreeOrder ? `<div class="total-row"><span class="total-row-label">GST (18%)</span><span class="total-row-value ${totals.gst === 0 ? "total-row-discount" : ""}">${totals.gst === 0 ? "Waived" : "\u20b9" + fmt(totals.gst)}</span></div>` : ""}
        ${!isFreeOrder ? `<div class="total-row"><span class="total-row-label">Refundable Security Deposit</span><span class="total-row-value">\u20b9${fmt(totals.deposit)}</span></div>` : ""}
        ${totals.flatDiscount > 0 ? `<div class="total-row"><span class="total-row-label">Flat Discount</span><span class="total-row-value total-row-discount">-\u20b9${fmt(totals.flatDiscount)}</span></div>` : ""}
        ${isFreeOrder ? `<div class="total-row"><span class="total-row-label">FREESHIP Savings</span><span class="total-row-value total-row-discount">-\u20b9${fmt(totals.subtotal)}</span></div>` : ""}
        <div class="total-final">
          <span class="total-final-label">Total Paid</span>
          <span class="total-final-value">${isFreeOrder ? "FREE" : "\u20b9" + fmt(totals.total)}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payment Information</div>
      <div class="payment-row">
        <div class="payment-icon">${paymentMethod === "upi" ? "\uD83D\uDCF1" : paymentMethod === "card" ? "\uD83D\uDCB3" : paymentMethod === "wallet" ? "\uD83D\uDC5B" : paymentMethod === "netbanking" ? "\uD83C\uDFE6" : paymentMethod === "cod" ? "\uD83D\uDCB5" : "\u2705"}</div>
        <div>
          <div class="payment-name">${isFreeOrder ? "Free Order (FREESHIP Coupon)" : paymentMethod === "cod" ? "Cash on Delivery" : PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || paymentMethod}</div>
          ${razorpayPayId ? `<div class="payment-id">Razorpay ID: ${razorpayPayId}</div>` : ""}
          <div class="payment-id">Order ID: ${orderId}</div>
        </div>
      </div>
    </div>

    ${appliedCoupon ? `
    <div class="section">
      <div class="highlight-box">
        <div class="highlight-icon">\uD83C\uDF89</div>
        <div class="highlight-text">
          <strong>Coupon Applied: ${appliedCoupon}</strong><br/>
          ${COUPONS[appliedCoupon]?.desc}
        </div>
      </div>
    </div>` : ""}

    <div class="section">
      <div class="highlight-box" style="background:#eff6ff;border-color:#bfdbfe;">
        <div class="highlight-icon">\uD83D\uDEE1\uFE0F</div>
        <div class="highlight-text" style="color:#1e40af;">
          <strong>Security Deposit is fully refundable</strong> after product return and inspection. Free quarterly maintenance is included in your plan. You can cancel or pause your plan anytime.
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    <div>
      <div class="footer-brand">RentEase</div>
      <div class="footer-note">Thank you for choosing RentEase!</div>
    </div>
    <div style="text-align:right;">
      <div class="footer-note">Generated on ${date}</div>
      <div class="footer-note" style="margin-top:2px;">support@rentease.in</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function downloadReceipt(receiptData) {
  const html = generateReceiptHTML(receiptData);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RentEase_Receipt_${receiptData.orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function InputField({ icon: Icon, label, error, rightElement, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block">{label}</label>}
      <div className="relative group">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#560BAD] transition-colors pointer-events-none" />}
        <input
          {...props}
          className={`w-full bg-white border-2 ${error ? "border-red-300" : "border-slate-100"} rounded-2xl py-3.5 ${Icon ? "pl-10" : "pl-4"} ${rightElement ? "pr-12" : "pr-4"} outline-none focus:border-[#560BAD] focus:shadow-[0_0_0_4px_rgba(86,11,173,0.08)] transition-all duration-200 text-[13px] font-medium text-slate-700 placeholder:text-slate-300 shadow-sm`}
        />
        {rightElement && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={9} /> {error}</p>}
    </div>
  );
}

function StepIndicator({ currentStep }) {
  const steps = [{ n: 1, label: "Address" }, { n: 2, label: "Payment" }, { n: 3, label: "Confirm" }];
  return (
    <div className="flex items-center justify-center mb-12 max-w-sm mx-auto gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-2xl font-black flex items-center justify-center transition-all duration-500 shadow-sm ${currentStep > s.n ? "bg-[#560BAD] text-white" : currentStep === s.n ? "bg-[#560BAD] text-white shadow-lg shadow-violet-300/40" : "bg-white border-2 border-slate-100 text-slate-300"}`}>
              {currentStep > s.n ? <CheckCircle2 size={18} /> : <span className="text-[13px]">{s.n}</span>}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${currentStep >= s.n ? "text-[#560BAD]" : "text-slate-300"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-700 ${currentStep > s.n ? "bg-[#560BAD]" : "bg-slate-100"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function PaymentMethodPanel({ method, form, handleChange, errors, totals }) {
  const Notice = () => (
    <div className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
      <ShieldCheck size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] font-black text-blue-700 uppercase tracking-wider mb-0.5">Real Payment via Razorpay</p>
        <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
          Clicking Pay opens Razorpay's secure popup. Money is deducted only after you complete authentication (OTP / PIN) inside the popup.
        </p>
      </div>
    </div>
  );

  if (method === "card") return (
    <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Notice />
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-4">
        <p className="text-[11px] font-black text-violet-700 mb-1">Credit / Debit Card</p>
        <p className="text-[10px] text-violet-600 leading-relaxed">
          Razorpay opens on the Card tab. Enter your card number, expiry, and CVV inside the secure popup. 3D Secure OTP will be sent by your bank.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {["Visa", "Mastercard", "RuPay", "Amex"].map(c => (
          <div key={c} className="bg-white border border-slate-100 rounded-xl px-2 py-2 text-center">
            <CheckCircle2 size={11} className="text-emerald-500 mx-auto mb-1" />
            <span className="text-[9px] font-bold text-slate-600">{c}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[9px] text-amber-700 font-medium leading-relaxed">
          Test card: <span className="font-mono font-bold">4111 1111 1111 1111</span> &nbsp;|&nbsp; Expiry: any future date &nbsp;|&nbsp; CVV: any 3 digits &nbsp;|&nbsp; OTP: <span className="font-bold">1234</span>
        </p>
      </div>
    </motion.div>
  );

  if (method === "upi") return (
    <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Notice />
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <QrCode size={15} className="text-sky-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-black text-sky-700 mb-1">UPI Payment</p>
          <p className="text-[10px] text-sky-600 leading-relaxed">
            Razorpay opens on the UPI tab. Enter your UPI ID (e.g. <span className="font-mono font-bold">name@okaxis</span>) or use the QR code shown inside the popup. Approve the collect request in your UPI app.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { name: "Google Pay", color: "text-blue-600", bg: "bg-blue-50" },
          { name: "PhonePe", color: "text-violet-600", bg: "bg-violet-50" },
          { name: "Paytm", color: "text-sky-600", bg: "bg-sky-50" },
          { name: "BHIM", color: "text-emerald-600", bg: "bg-emerald-50" },
          { name: "CRED", color: "text-slate-700", bg: "bg-slate-50" },
          { name: "Amazon Pay", color: "text-orange-600", bg: "bg-orange-50" },
        ].map(app => (
          <div key={app.name} className={`${app.bg} rounded-xl px-2 py-2.5 text-center`}>
            <Smartphone size={13} className={`${app.color} mx-auto mb-1`} />
            <span className={`text-[8px] font-black ${app.color}`}>{app.name}</span>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
        <AlertCircle size={11} className="text-amber-500 flex-shrink-0" />
        <p className="text-[9px] text-amber-700 font-medium">
          Test mode: Use UPI ID <span className="font-mono font-bold">success@razorpay</span> to simulate a successful payment. QR scanning is disabled in test mode.
        </p>
      </div>
    </motion.div>
  );

  if (method === "wallet") return (
    <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Notice />
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <Wallet size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-black text-violet-700 mb-1">Digital Wallet</p>
          <p className="text-[10px] text-violet-600 leading-relaxed">
            Razorpay opens on the Wallet tab. Select your wallet and authenticate. Money is deducted from your wallet balance only after you confirm.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: "Paytm Wallet", color: "text-sky-600", bg: "bg-sky-50" },
          { name: "Amazon Pay", color: "text-orange-600", bg: "bg-orange-50" },
          { name: "PhonePe Wallet", color: "text-violet-600", bg: "bg-violet-50" },
          { name: "FreeCharge", color: "text-green-600", bg: "bg-green-50" },
          { name: "MobiKwik", color: "text-blue-600", bg: "bg-blue-50" },
          { name: "Jio Money", color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map(w => (
          <div key={w.name} className={`${w.bg} rounded-xl px-3 py-2.5 flex items-center gap-2`}>
            <Wallet size={11} className={w.color} />
            <span className={`text-[9px] font-black ${w.color}`}>{w.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (method === "netbanking") return (
    <motion.div key="netbanking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <Notice />
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <Landmark size={15} className="text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-black text-indigo-700 mb-1">Net Banking</p>
          <p className="text-[10px] text-indigo-600 leading-relaxed">
            Razorpay opens on the Net Banking tab. Select your bank and you will be redirected to your bank's secure login page to authorise the payment.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
        {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "IndusInd Bank", "Yes Bank", "Canara Bank", "Union Bank of India", "IDFC First Bank"].map(bank => (
          <div key={bank} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <Landmark size={9} className="text-slate-400 flex-shrink-0" />
            <span className="text-[9px] font-bold text-slate-600 leading-tight">{bank}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  if (method === "cod") return (
    <motion.div key="cod" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-black text-amber-700 mb-1">Pay on Delivery</p>
          <p className="text-[10px] text-amber-700 leading-relaxed">
            No online payment needed right now. Our delivery agent will collect exact cash or accept UPI at the time of delivery. OTP verification is mandatory.
          </p>
        </div>
      </div>
      <InputField
        label="Delivery Contact Number"
        name="codPhone"
        icon={Phone}
        placeholder="10-digit number for OTP"
        onChange={handleChange}
        value={form.codPhone}
        error={errors.codPhone}
        type="tel"
        maxLength="10"
      />
      <div className="mt-3 space-y-2">
        {[
          { icon: Banknote, text: "Exact cash or UPI required at delivery" },
          { icon: Phone, text: "OTP verification mandatory on delivery" },
          { icon: Truck, text: "Delivery within 3\u20135 business days" },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-2.5 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
            <Icon size={11} className="text-amber-500 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-medium">{text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return null;
}

export default function ProceedToPayment() {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [razorpayPayId, setRazorpayPayId] = useState("");
  const [receiptReady, setReceiptReady] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
    landmark: "", altPhone: "", codPhone: "",
  });

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("checkoutCart") || sessionStorage.getItem("cart") || "[]");
    const code = sessionStorage.getItem("checkoutCoupon") || "";
    if (code && COUPONS[code]) setAppliedCoupon(code);
    setCart(stored.map((item, idx) => ({
      ...item,
      cartId: item.cartId || item._id || `item-${idx}`,
      price: Number(item.price || item.rentPerMonth) || 999,
      tenure: Number(item.tenure) || 3,
    })));
    setForm(prev => ({
      ...prev,
      email: sessionStorage.getItem("userEmail") || "",
      phone: sessionStorage.getItem("userPhone") || "",
      name: sessionStorage.getItem("userName") || "",
    }));
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (["phone", "altPhone", "codPhone"].includes(name)) value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "zip") value = value.replace(/\D/g, "").slice(0, 6);
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const totals = useMemo(() => {
    const c = appliedCoupon ? COUPONS[appliedCoupon] : null;
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.tenure, 0);
    if (c?.freeOrder) return { subtotal, gst: 0, deposit: 0, pctDiscount: 0, flatDiscount: subtotal, total: 0 };
    const pctDiscount = c?.pct ? Math.round(subtotal * c.pct) : 0;
    const flatDiscount = c?.flat || 0;
    const gst = c?.gstFree ? 0 : Math.round((subtotal - pctDiscount) * 0.18);
    const deposit = subtotal > 0 ? Math.round(subtotal * 0.15) + 500 : 0;
    const total = Math.max(0, subtotal - pctDiscount + gst + deposit - flatDiscount);
    return { subtotal, gst, deposit, pctDiscount, flatDiscount, total };
  }, [cart, appliedCoupon]);

  const isFreeOrder = totals.total === 0;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCoupon("");
      setErrors(prev => ({ ...prev, coupon: null }));
    } else {
      setErrors(prev => ({ ...prev, coupon: "Invalid coupon code." }));
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.email.includes("@")) e.email = "Valid email required";
      if (form.phone.length < 10) e.phone = "10-digit phone required";
      if (!form.address.trim()) e.address = "Street address required";
      if (!form.city.trim()) e.city = "City required";
      if (!form.state.trim()) e.state = "State required";
      if (form.zip.length < 6) e.zip = "Valid 6-digit PIN required";
    } else if (step === 2 && !isFreeOrder) {
      if (paymentMethod === "cod" && form.codPhone.length < 10) {
        e.codPhone = "Enter 10-digit delivery contact number";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateOrderId = () => "ORD" + Date.now().toString(36).toUpperCase();

  const saveOrdersToDB = async (newOrderId, rzpPaymentId = "", paymentStatus = "Paid") => {
    for (const item of cart) {
      await axios.post(`${API}/api/admin/orders`, {
        productName: item.name,
        productImage: item.image || item.productImage || "",
        price: item.price,
        tenure: item.tenure,
        totalAmount: totals.total,
        userEmail: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.city}, ${form.state} \u2013 ${form.zip}`,
        landmark: form.landmark,
        paymentMethod: isFreeOrder ? "FREE" : paymentMethod === "cod" ? "COD" : paymentMethod.toUpperCase(),
        paymentStatus,
        approvalStatus: "Pending",
        pauseStatus: "Active",
        orderId: newOrderId,
        couponApplied: appliedCoupon || "",
        razorpayPaymentId: rzpPaymentId,
      });
    }
  };

  const clearCart = () => {
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("checkoutCart");
    sessionStorage.removeItem("checkoutCoupon");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const buildReceiptData = (newOrderId, rzpPayId, payStatus) => ({
    orderId: newOrderId,
    razorpayPayId: rzpPayId,
    paymentMethod,
    paymentStatus: payStatus,
    form,
    cart,
    totals,
    appliedCoupon,
    isFreeOrder,
    date: new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }),
  });

  const finalizeOrder = (newOrderId, rzpPayId, payStatus) => {
    clearCart();
    setOrderId(newOrderId);
    setRazorpayPayId(rzpPayId);
    setReceiptReady(buildReceiptData(newOrderId, rzpPayId, payStatus));
    setSuccess(true);
  };

  const processFreeOrder = async () => {
    setLoading(true);
    setServerError("");
    const newOrderId = generateOrderId();
    try {
      await saveOrdersToDB(newOrderId, "", "Free");
      finalizeOrder(newOrderId, "", "Payment Free");
    } catch (err) {
      setServerError(err?.response?.data?.error || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processCODOrder = async () => {
    setLoading(true);
    setServerError("");
    const newOrderId = generateOrderId();
    try {
      await saveOrdersToDB(newOrderId, "", "COD Pending");
      finalizeOrder(newOrderId, "", "COD \u2014 Pending Collection");
    } catch (err) {
      setServerError(err?.response?.data?.error || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processRazorpayPayment = async () => {
    setLoading(true);
    setServerError("");
    const newOrderId = generateOrderId();

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setServerError("Failed to load Razorpay. Check your internet connection.");
        setLoading(false);
        return;
      }

      const { data: rzpOrder } = await axios.post(`${API}/api/razorpay/create-order`, {
        amount: totals.total,
        receipt: newOrderId,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "RentEase",
        description: `Rental \u2014 ${cart.map(i => i.name).join(", ")}`,
        order_id: rzpOrder.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        method: RAZORPAY_METHOD_MAP[paymentMethod] || {},
        theme: { color: "#560BAD" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setServerError("Payment was cancelled. Please try again.");
          },
          confirm_close: true,
          escape: false,
        },
        handler: async (response) => {
          try {
            const { data: verified } = await axios.post(`${API}/api/razorpay/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!verified.success) {
              setServerError("Payment verification failed. Contact support. Order ID: " + newOrderId);
              setLoading(false);
              return;
            }
            await saveOrdersToDB(newOrderId, response.razorpay_payment_id, "Paid");
            finalizeOrder(newOrderId, response.razorpay_payment_id, "Paid via Razorpay");
          } catch (err) {
            setServerError("Order saving failed after payment. Contact support with Payment ID: " + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setServerError(`Payment failed: ${resp.error.description || "Unknown error"}. Please try again.`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setServerError(err?.response?.data?.error || "Could not initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const processPayment = () => {
    if (!validateStep()) return;
    if (isFreeOrder) { processFreeOrder(); return; }
    if (paymentMethod === "cod") { processCODOrder(); return; }
    processRazorpayPayment();
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-slate-50 p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="text-center max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-50"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
          className="w-24 h-24 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={52} className="text-emerald-500" />
        </motion.div>

        <h1 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {isFreeOrder ? "Order Placed!" : paymentMethod === "cod" ? "Order Confirmed!" : "Payment Successful!"}
        </h1>
        <p className="text-slate-500 text-[13px] font-medium mb-6 leading-relaxed">
          {paymentMethod === "cod"
            ? "Our agent will collect payment at delivery. OTP will be sent."
            : "Your rental is confirmed and under review. We will notify you once approved."}
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-3 text-left">
          <p className="text-amber-600 text-[9px] font-black uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-amber-800 font-mono font-bold text-[13px]">{orderId}</p>
        </div>

        {razorpayPayId && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-3.5 mb-3 text-left">
            <p className="text-violet-500 text-[9px] font-black uppercase tracking-widest mb-1">Razorpay Payment ID</p>
            <p className="text-violet-800 font-mono font-bold text-[11px] break-all">{razorpayPayId}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5 text-left">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivered To</p>
            <p className="text-[11px] font-semibold text-slate-700 truncate">{form.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{form.city}, {form.state}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount</p>
            <p className="text-[11px] font-semibold text-slate-700 uppercase">
              {isFreeOrder ? "FREE" : paymentMethod === "cod" ? "Cash on Delivery" : PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
            </p>
            <p className="text-[14px] font-black text-[#560BAD]">
              {isFreeOrder ? "\u20b90" : paymentMethod === "cod" ? `\u20b9${fmt(totals.total)} at door` : `\u20b9${fmt(totals.total)}`}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => receiptReady && downloadReceipt(receiptReady)}
          className="w-full bg-[#560BAD] text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200/50 flex items-center justify-center gap-2.5 mb-3"
        >
          <Download size={15} /> Download Payment Receipt
        </motion.button>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-start gap-2">
          <FileText size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-blue-600 font-medium leading-relaxed text-left">
            Receipt downloads as an HTML file. Open it in any browser and use <span className="font-bold">Ctrl+P</span> (or Print) to save as PDF.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => window.location.href = "/my-rentals"}
            className="w-full bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
          >
            View My Rentals
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="w-full text-slate-400 py-3 font-black text-[11px] uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 font-sans pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-10">

        <div className="flex flex-col items-center mb-10 text-center pt-12">
          <div className="w-12 h-12 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock size={20} className="text-[#560BAD]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Secure <span className="font-light italic text-slate-400">Checkout</span>
          </h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1.5">256-bit SSL encrypted &nbsp;&middot;&nbsp; PCI DSS compliant &nbsp;&middot;&nbsp; Powered by Razorpay</p>
        </div>

        <StepIndicator currentStep={step} />

        <AnimatePresence>
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-7 bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium rounded-2xl px-5 py-4 flex items-center gap-3 max-w-3xl mx-auto">
              <AlertCircle size={16} className="flex-shrink-0" /> {serverError}
              <button onClick={() => setServerError("")} className="ml-auto text-red-300 hover:text-red-500 font-black">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 items-start">
          <div>
            <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                    <h2 className="text-[18px] font-semibold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                      <div className="w-9 h-9 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-[#560BAD]" />
                      </div>
                      Delivery Address
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField label="Full Name" name="name" icon={User} placeholder="John Doe" onChange={handleChange} value={form.name} error={errors.name} />
                      <InputField label="Mobile Number" name="phone" icon={Phone} placeholder="10-digit mobile" onChange={handleChange} value={form.phone} error={errors.phone} type="tel" maxLength="10" />
                      <div className="md:col-span-2">
                        <InputField label="Email Address" name="email" icon={Mail} placeholder="you@email.com" onChange={handleChange} value={form.email} error={errors.email} type="email" />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Street Address" name="address" icon={Home} placeholder="Flat No, Building, Street" onChange={handleChange} value={form.address} error={errors.address} />
                      </div>
                      <InputField label="Landmark (Optional)" name="landmark" icon={MapPin} placeholder="Near landmark" onChange={handleChange} value={form.landmark} />
                      <InputField label="City" name="city" icon={Building2} placeholder="City" onChange={handleChange} value={form.city} error={errors.city} />
                      <div className="relative">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">State</label>
                        <div className="relative">
                          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                          <select name="state" value={form.state} onChange={handleChange}
                            className={`w-full bg-white border-2 ${errors.state ? "border-red-300" : "border-slate-100"} rounded-2xl py-3.5 pl-10 pr-4 outline-none focus:border-[#560BAD] transition-all text-[13px] font-medium text-slate-700 shadow-sm appearance-none`}>
                            <option value="">Select State</option>
                            {["Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                        {errors.state && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 flex items-center gap-1"><AlertCircle size={9} />{errors.state}</p>}
                      </div>
                      <InputField label="PIN Code" name="zip" icon={Hash} placeholder="6-digit PIN" onChange={handleChange} value={form.zip} error={errors.zip} type="tel" maxLength="6" />
                      <InputField label="Alternate Number (Optional)" name="altPhone" icon={Phone} placeholder="Alternate mobile" onChange={handleChange} value={form.altPhone} type="tel" maxLength="10" />
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => validateStep() && setStep(2)}
                    className="w-full bg-[#560BAD] text-white py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-200/50 flex items-center justify-center gap-3">
                    Continue to Payment <ChevronRight size={18} />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[18px] font-semibold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-9 h-9 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CreditCard size={16} className="text-[#560BAD]" />
                        </div>
                        Payment Method
                      </h2>
                      <button onClick={() => setStep(1)}
                        className="text-[9px] font-black uppercase tracking-widest text-[#560BAD] bg-violet-50 border border-violet-100 px-3 py-2 rounded-xl hover:bg-violet-100 transition-colors flex items-center gap-1.5">
                        <ArrowLeft size={11} /> Edit Address
                      </button>
                    </div>

                    {isFreeOrder ? (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 border-2 border-emerald-200 border-dashed rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <h3 className="text-[18px] font-semibold text-emerald-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          Free Order Applied!
                        </h3>
                        <p className="text-[12px] text-emerald-700 font-medium mb-3">
                          Coupon <span className="font-black">FREESHIP</span> makes this order completely free. No payment needed.
                        </p>
                        <div className="bg-white rounded-2xl border border-emerald-200 px-5 py-3 inline-block">
                          <p className="text-2xl font-black text-emerald-600" style={{ fontFamily: "'Cormorant Garamond', serif" }}>\u20b90 payable</p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="grid grid-cols-5 gap-2.5 mb-6">
                          {PAYMENT_METHODS.map(m => (
                            <motion.button key={m.id} whileTap={{ scale: 0.95 }}
                              onClick={() => { setPaymentMethod(m.id); setErrors({}); }}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${paymentMethod === m.id ? "border-[#560BAD] bg-violet-50 text-[#560BAD] shadow-md shadow-violet-100" : "border-slate-100 hover:border-slate-200 text-slate-300 bg-white"}`}>
                              <m.icon size={20} strokeWidth={2} />
                              <div className="text-center">
                                <p className="font-black text-[9px] uppercase tracking-tight leading-tight">{m.label}</p>
                                <p className={`text-[8px] mt-0.5 leading-tight font-medium ${paymentMethod === m.id ? "text-violet-400" : "text-slate-300"}`}>{m.sub}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <div className="rounded-3xl bg-slate-50/50 border-2 border-dashed border-slate-100 p-6 min-h-[200px]">
                          <AnimatePresence mode="wait">
                            <PaymentMethodPanel
                              key={paymentMethod}
                              method={paymentMethod}
                              form={form}
                              handleChange={handleChange}
                              errors={errors}
                              totals={totals}
                            />
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </div>

                  <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => validateStep() && setStep(3)}
                    className="w-full bg-[#560BAD] text-white py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-200/50 flex items-center justify-center gap-3">
                    Review & Confirm <ChevronRight size={18} />
                  </motion.button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
                    <h2 className="text-[18px] font-semibold text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                      <div className="w-9 h-9 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={16} className="text-[#560BAD]" />
                      </div>
                      Review Order
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Delivery Address</p>
                          <button onClick={() => setStep(1)} className="text-[9px] font-black uppercase tracking-widest text-[#560BAD] hover:underline">Edit</button>
                        </div>
                        <p className="text-[12px] font-bold text-slate-800">{form.name}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{form.address}{form.landmark ? `, ${form.landmark}` : ""}</p>
                        <p className="text-[11px] text-slate-500">{form.city}, {form.state} \u2013 {form.zip}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{form.phone}</p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Payment via</p>
                          <button onClick={() => setStep(2)} className="text-[9px] font-black uppercase tracking-widest text-[#560BAD] hover:underline">Edit</button>
                        </div>
                        {isFreeOrder ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-emerald-700">FREE ORDER</p>
                              <p className="text-[10px] text-emerald-500">FREESHIP coupon applied</p>
                            </div>
                          </div>
                        ) : paymentMethod === "cod" ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                              <Banknote size={16} className="text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-slate-800">Cash on Delivery</p>
                              <p className="text-[10px] text-slate-400">Pay \u20b9{fmt(totals.total)} at delivery</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100">
                              {(() => { const m = PAYMENT_METHODS.find(p => p.id === paymentMethod); return m ? <m.icon size={16} className="text-[#560BAD]" /> : null; })()}
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-slate-800">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                              <p className="text-[10px] text-violet-500 font-medium">via Razorpay secure gateway</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Items in Order</p>
                      {cart.map(item => (
                        <div key={item.cartId} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                          <img
                            src={item.image?.startsWith("http") ? item.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=ede9fe&color=7c3aed&size=200&bold=true`}
                            alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-violet-50 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">\u20b9{fmt(item.price)}/mo \u00d7 {item.tenure} months</p>
                          </div>
                          <p className="text-[13px] font-bold text-[#560BAD] flex-shrink-0">\u20b9{fmt(item.price * item.tenure)}</p>
                        </div>
                      ))}
                    </div>

                    <div className={`rounded-2xl p-4 border mb-5 ${isFreeOrder ? "bg-emerald-50 border-emerald-100" : "bg-violet-50/50 border-violet-100"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Total Payable</p>
                        {appliedCoupon && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">{appliedCoupon}</span>}
                      </div>
                      <p className={`text-3xl font-bold ${isFreeOrder ? "text-emerald-600" : "text-[#560BAD]"}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {isFreeOrder ? "FREE" : `\u20b9${fmt(totals.total)}`}
                      </p>
                      {isFreeOrder
                        ? <p className="text-[10px] text-emerald-600 font-medium mt-0.5">100% covered by FREESHIP coupon</p>
                        : <p className="text-[10px] text-slate-400 font-medium mt-0.5">Incl. \u20b9{fmt(totals.deposit)} refundable deposit &nbsp;&middot;&nbsp; GST {totals.gst === 0 ? "waived" : `\u20b9${fmt(totals.gst)}`}</p>
                      }
                    </div>

                    {!isFreeOrder && paymentMethod !== "cod" && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">How this payment works</p>
                        <div className="space-y-1.5">
                          {[
                            `Click Pay below \u2192 Razorpay secure popup opens`,
                            `Select or confirm ${PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label} inside the popup`,
                            "Complete OTP / PIN / biometric authentication",
                            "Money is deducted only after your confirmation",
                            "Order is saved instantly after successful payment",
                          ].map((txt, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 text-[8px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-[10px] text-blue-600 font-medium">{txt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                        By confirming, you agree to RentEase rental terms. Security deposit is fully refundable after product inspection. Plans are binding for the selected tenure.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    disabled={loading || cart.length === 0}
                    onClick={processPayment}
                    className={`w-full py-5 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                      loading || cart.length === 0
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                        : isFreeOrder
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/60"
                          : paymentMethod === "cod"
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200/60"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/60"
                    }`}
                  >
                    {loading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        {isFreeOrder ? "Placing Free Order..." : paymentMethod === "cod" ? "Confirming Order..." : "Opening Razorpay..."}
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        {isFreeOrder
                          ? "Confirm Free Order"
                          : paymentMethod === "cod"
                            ? `Confirm COD \u2014 \u20b9${fmt(totals.total)} at Delivery`
                            : `Pay \u20b9${fmt(totals.total)} via Razorpay`}
                      </>
                    )}
                  </motion.button>

                  <button onClick={() => setStep(2)}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-3 transition-colors flex items-center justify-center gap-1.5">
                    <ArrowLeft size={12} /> Edit Payment Method
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2 tracking-tight">
                <span className="w-7 h-7 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-center">
                  <Receipt size={13} className="text-[#560BAD]" />
                </span>
                Order Summary
              </h3>

              <div className="space-y-3 mb-5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.length > 0 ? cart.map(item => (
                  <div key={item.cartId} className="flex items-center gap-3">
                    <img
                      src={item.image?.startsWith("http") ? item.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=ede9fe&color=7c3aed&size=200&bold=true`}
                      alt={item.name} className="w-11 h-11 rounded-xl object-cover bg-violet-50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">\u20b9{fmt(item.price)}/mo \u00d7 {item.tenure} mo</p>
                    </div>
                    <p className="text-[12px] font-bold text-slate-800 flex-shrink-0">\u20b9{fmt(item.price * item.tenure)}</p>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <Info size={28} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cart is empty</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input
                        value={coupon}
                        onChange={e => { setCoupon(e.target.value.toUpperCase()); setErrors(prev => ({ ...prev, coupon: null })); }}
                        onKeyDown={e => e.key === "Enter" && applyCoupon()}
                        placeholder="Coupon code"
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#560BAD] rounded-xl pl-9 pr-3 py-2.5 text-[11px] font-bold uppercase tracking-wider outline-none transition-all"
                      />
                    </div>
                    <button onClick={applyCoupon} className="px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#560BAD] transition-colors">
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 border-dashed rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <div>
                        <p className="text-[10px] font-black text-emerald-700">{appliedCoupon}</p>
                        <p className="text-[9px] text-emerald-500">{COUPONS[appliedCoupon]?.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-[8px] font-black uppercase text-red-400 hover:text-red-600">Remove</button>
                  </div>
                )}
                {errors.coupon && (
                  <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 flex items-center gap-1">
                    <AlertCircle size={9} />{errors.coupon}
                  </p>
                )}
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5">
                {[
                  { label: "Base Rent",          value: `\u20b9${fmt(totals.subtotal)}`,       color: "text-slate-700",   skip: false                    },
                  { label: "Coupon Discount",     value: `-\u20b9${fmt(totals.pctDiscount)}`,   color: "text-emerald-600", skip: totals.pctDiscount === 0 },
                  { label: "GST (18%)",           value: totals.gst === 0 ? "Waived" : `\u20b9${fmt(totals.gst)}`, color: totals.gst === 0 ? "text-emerald-600" : "text-slate-700", skip: false },
                  { label: "Refundable Deposit",  value: `\u20b9${fmt(totals.deposit)}`,       color: "text-slate-700",   skip: isFreeOrder              },
                  { label: "Flat Discount",       value: `-\u20b9${fmt(totals.flatDiscount)}`, color: "text-emerald-600", skip: totals.flatDiscount === 0 && !isFreeOrder },
                  { label: "FREESHIP Savings",    value: `-\u20b9${fmt(totals.subtotal)}`,     color: "text-emerald-600", skip: !isFreeOrder             },
                ].filter(r => !r.skip).map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-medium text-[9px] uppercase tracking-widest">{label}</span>
                    <span className={`font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Total</span>
                  <p className={`text-2xl font-black ${isFreeOrder ? "text-emerald-600" : "text-[#560BAD]"}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {isFreeOrder ? "FREE" : `\u20b9${fmt(totals.total)}`}
                  </p>
                </div>
              </div>

              {isFreeOrder ? (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-[10px] text-emerald-700 font-bold">FREESHIP applied \u2014 no payment needed!</p>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-3 bg-violet-50/60 rounded-2xl p-3.5 border border-violet-100">
                  <ShieldCheck size={14} className="text-[#560BAD] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-[#560BAD] uppercase tracking-wider">Secured by Razorpay</p>
                    <p className="text-[9px] text-violet-400 font-medium mt-0.5">256-bit SSL \u00b7 PCI DSS compliant \u00b7 Cancel anytime</p>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-3">
                {["VISA", "MC", "UPI", "RuPay"].map(brand => (
                  <div key={brand} className="text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">{brand}</div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Rental Guarantee</p>
              <div className="space-y-2.5">
                {[
                  { Icon: ShieldCheck, text: "Deposit fully refundable",  color: "text-[#560BAD]",   bg: "bg-violet-50"  },
                  { Icon: RefreshCw,   text: "Free maintenance included", color: "text-sky-500",     bg: "bg-sky-50"     },
                  { Icon: Truck,       text: "Free relocation service",   color: "text-emerald-500", bg: "bg-emerald-50" },
                  { Icon: RotateCcw,   text: "Cancel or pause anytime",   color: "text-amber-500",   bg: "bg-amber-50"   },
                ].map(({ Icon, text, color, bg }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-7 h-7 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={12} className={color} />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
      `}</style>
    </div>
  );
}