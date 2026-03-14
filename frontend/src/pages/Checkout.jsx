import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  ShoppingCart, Trash2, ChevronRight, Package, Shield,
  Truck, RefreshCw, Tag, Info, Zap, ArrowLeft, MapPin,
  Clock, Star, AlertCircle, CheckCircle2, Sparkles,
  CreditCard, RotateCcw, TrendingDown, Gift
} from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n || 0));

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const TENURE_OPTIONS = [
  { months: 3,  label: "3 Months",  discount: 0,    badge: null       },
  { months: 6,  label: "6 Months",  discount: 0.08, badge: "8% off"   },
  { months: 12, label: "12 Months", discount: 0.15, badge: "15% off"  },
];

// FREESHIP is a hidden/internal coupon — intentionally NOT shown in UI hints
const COUPONS = {
  SAVE10:   { label: "SAVE10",   desc: "GST waived + \u20b970 off",    gstFree: true,  flat: 70,  pct: 0,    freeOrder: false },
  RENT5:    { label: "RENT5",    desc: "Flat 5% off on base rent", gstFree: false, flat: 0,   pct: 0.05, freeOrder: false },
  NEWUSER:  { label: "NEWUSER",  desc: "\u20b9150 off for first order", gstFree: false, flat: 150, pct: 0,    freeOrder: false },
  FREESHIP: { label: "FREESHIP", desc: "Free order \u2014 \u20b90 total",   gstFree: true,  flat: 0,   pct: 0,    freeOrder: true  },
};

// Only these are shown as hints — FREESHIP is hidden on purpose
const VISIBLE_COUPON_HINTS = ["SAVE10", "RENT5", "NEWUSER"];

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart]                   = useState([]);
  const [coupon, setCoupon]               = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]     = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [expandedItem, setExpandedItem]   = useState(null);

  // useEffect(() => {
  //   const stored = JSON.parse(sessionStorage.getItem("cart")) || [];
  //   const sanitized = stored.map((item, idx) => ({
  //     ...item,
  //     cartId:   item.cartId || item._id || `item-${idx}`,
  //     price:    Number(item.rentPerMonth || item.price) || 999,
  //     tenure:   Number(item.tenure) || 3,
  //     quantity: Number(item.quantity) || 1,
  //   }));
    
  //   setCart(sanitized);
  // }, []);
    useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("cart")) || [];
    const sanitized = stored.map((item, idx) => ({
      ...item,
      cartId:   item.cartId || item._id || `item-${idx}`,
      price:    Number(item.rentPerMonth || item.price) || 999,
      tenure:   Number(item.tenure) || 3,
      quantity: Number(item.quantity) || 1,
    }));

    // Using a micro-task to avoid the cascading render error
    Promise.resolve().then(() => setCart(sanitized));
  }, []);

  const saveCart = (updated) => {
    setCart(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateTenure = (cartId, months) => {
    saveCart(cart.map(i => i.cartId === cartId ? { ...i, tenure: parseInt(months) } : i));
  };

  const removeItem = (cartId) => {
    saveCart(cart.filter(i => i.cartId !== cartId));
  };

  const getDiscountedPrice = (item) => {
    const base = item.price;
    const opt  = TENURE_OPTIONS.find(t => t.months === item.tenure);
    return opt ? Math.floor(base * (1 - opt.discount)) : base;
  };

  const totals = useMemo(() => {
    const couponData = appliedCoupon ? COUPONS[appliedCoupon] : null;
    const subtotal   = cart.reduce((acc, item) => acc + getDiscountedPrice(item) * item.tenure, 0);

    // FREESHIP: everything becomes 0
    if (couponData?.freeOrder) {
      const normalGst     = Math.round(subtotal * 0.18);
      const normalDeposit = subtotal > 0 ? Math.round(subtotal * 0.15) + 500 : 0;
      return {
        subtotal,
        gst: 0,
        deposit: 0,
        pctDiscount: 0,
        flatDiscount: 0,
        totalDiscount: subtotal + normalGst + normalDeposit,
        total: 0,
        isFreeOrder: true,
      };
    }

    const pctDiscount   = couponData?.pct  ? Math.round(subtotal * couponData.pct) : 0;
    const flatDiscount  = couponData?.flat || 0;
    const totalDiscount = pctDiscount + flatDiscount;
    const taxableBase   = subtotal - pctDiscount;
    const gst           = couponData?.gstFree ? 0 : Math.round(taxableBase * 0.18);
    const deposit       = subtotal > 0 ? Math.round(subtotal * 0.15) + 500 : 0;
    const total         = Math.max(0, taxableBase + gst + deposit - flatDiscount);
    return { subtotal, gst, deposit, pctDiscount, flatDiscount, totalDiscount, total, isFreeOrder: false };
  }, [cart, appliedCoupon]);

  const applyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCoupon("");
      setCouponSuccess(`"${code}" applied \u2014 ${COUPONS[code].desc}`);
      setTimeout(() => setCouponSuccess(""), 4000);
    } else {
      setCouponError("Invalid coupon code. Please try again.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponSuccess("");
  };

  const handleProceed = () => {
    sessionStorage.setItem("checkoutCart", JSON.stringify(cart));
    sessionStorage.setItem("checkoutCoupon", appliedCoupon || "");
    navigate("/proceed-to-payment");
  };

  const imgSrc = (item) => {
    const src = item.image || item.productImage || "";
    if (src.startsWith("http")) return src;
    if (src) return `/${src}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=ede9fe&color=7c3aed&size=200&bold=true`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-violet-50/30 font-sans pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-28 pb-10">

        {/* ─── Page Header ───────────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.button
            variants={fadeUp}
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 hover:text-[#560BAD] transition-colors mb-5 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
          </motion.button>

          <div className="flex items-end justify-between">
            <motion.div variants={fadeUp}>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your <span className="font-light italic text-slate-400">Cart</span>
              </h1>
              <p className="text-[12px] text-violet-600 font-semibold tracking-wide mt-1">
                {cart.length} {cart.length === 1 ? "item" : "items"} · Review before checkout
              </p>
            </motion.div>
            {cart.length > 0 && (
              <motion.div variants={fadeUp} className="hidden md:flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-2.5">
                <ShoppingCart size={14} className="text-violet-500" />
                <span className="text-[11px] font-black text-violet-700 uppercase tracking-widest">{cart.length} Items</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-violet-200"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <ShoppingCart size={52} className="text-violet-200" />
            </motion.div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-800 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your cart is empty</h2>
            <p className="text-[12px] text-slate-400 mt-1.5 mb-6">Browse our collection and add products to get started</p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 px-7 py-3.5 bg-[#560BAD] text-white rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-violet-200/50 hover:bg-violet-700 transition-all"
            >
              <Sparkles size={13} /> Explore Collection
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">

            {/* ─── LEFT: Cart Items ─────────────────────────────────── */}
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => {
                  const discountedPrice = getDiscountedPrice(item);
                  const lineCost        = discountedPrice * item.tenure;
                  const originalCost    = item.price * item.tenure;
                  const savings         = originalCost - lineCost;
                  const tenureOption    = TENURE_OPTIONS.find(t => t.months === item.tenure);
                  const isExpanded      = expandedItem === item.cartId;

                  return (
                    <motion.div
                      key={item.cartId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      <div className="p-5 flex gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={imgSrc(item)}
                            alt={item.name}
                            className="w-24 h-24 rounded-2xl object-cover border border-slate-100 bg-violet-50"
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=ede9fe&color=7c3aed&size=200&bold=true`; }}
                          />
                          {tenureOption?.badge && (
                            <span className="absolute -top-2 -right-2 text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-lg border-2 border-white shadow-sm">
                              {tenureOption.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0">
                              <h3 className="text-[15px] font-semibold text-slate-900 truncate tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.category && (
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg">
                                    {item.category}
                                  </span>
                                )}
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => <Star key={i} size={7} fill="#f59e0b" color="#f59e0b" />)}
                                  <span className="text-[9px] text-slate-400 ml-0.5 font-semibold">4.8</span>
                                </div>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.cartId)}
                              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0 border border-red-100"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Monthly Rent</p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[17px] font-bold text-[#560BAD]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                  ₹{fmt(discountedPrice)}
                                </span>
                                {savings > 0 && (
                                  <span className="text-[10px] text-slate-400 line-through">₹{fmt(item.price)}</span>
                                )}
                                <span className="text-[10px] text-slate-400">/mo</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Plan Total</p>
                              <p className="text-[17px] font-bold text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                ₹{fmt(lineCost)}
                              </p>
                              {savings > 0 && (
                                <p className="text-[9px] text-emerald-600 font-bold">Save ₹{fmt(savings)}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5">Rental Tenure</p>
                            <div className="flex gap-1.5">
                              {TENURE_OPTIONS.map(({ months, badge }) => (
                                <motion.button
                                  key={months}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateTenure(item.cartId, months)}
                                  className={`relative flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border ${
                                    item.tenure === months
                                      ? "bg-[#560BAD] text-white border-violet-600 shadow-sm shadow-violet-300/30"
                                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-violet-300"
                                  }`}
                                >
                                  {months}mo
                                  {badge && (
                                    <span className="absolute -top-2 -right-1 text-[7px] font-black bg-emerald-500 text-white px-1 py-px rounded-md border border-white">
                                      {badge}
                                    </span>
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-3">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExpandedItem(isExpanded ? null : item.cartId)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-700 transition-colors"
                        >
                          <Info size={11} />
                          {isExpanded ? "Hide Details" : "View Product Details"}
                          <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight size={11} />
                          </motion.span>
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-slate-50"
                          >
                            <div className="p-5 grid sm:grid-cols-2 gap-4 bg-slate-50/50">
                              {item.description && (
                                <div className="sm:col-span-2">
                                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Description</p>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                                </div>
                              )}

                              <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Plan Breakdown</p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Monthly rent</span>
                                    <span className="font-semibold text-slate-700">₹{fmt(discountedPrice)}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Duration</span>
                                    <span className="font-semibold text-slate-700">{item.tenure} months</span>
                                  </div>
                                  <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">Refundable deposit</span>
                                    <span className="font-semibold text-slate-700">₹{fmt(item.deposit || 0)}</span>
                                  </div>
                                  <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-100 font-bold">
                                    <span className="text-slate-700">Plan total</span>
                                    <span className="text-[#560BAD]">₹{fmt(lineCost)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-2xl p-3.5 border border-slate-100">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">What's Included</p>
                                <div className="space-y-1.5">
                                  {[
                                    { Icon: Shield,    text: "Damage protection cover"     },
                                    { Icon: RefreshCw, text: "Free quarterly servicing"    },
                                    { Icon: Truck,     text: "White-glove delivery"        },
                                    { Icon: RotateCcw, text: "Flexible early exit"         },
                                    { /* eslint-disable no-unused-vars */}
                                  ].map(({ Icon, text }, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <CheckCircle2 size={11} className="text-violet-400 shrink-0" />
                                      <span className="text-[11px] text-slate-600">{text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {item.serviceAreas?.length > 0 && (
                                <div className="sm:col-span-2 bg-white rounded-2xl p-3.5 border border-violet-100">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <MapPin size={10} className="text-violet-500" />
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-600">Service Areas</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.serviceAreas.map(area => (
                                      <span key={area} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-xl border border-violet-100">
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {item.damagePolicy && (
                                <div className="sm:col-span-2 bg-amber-50 rounded-2xl p-3.5 border border-amber-100">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <AlertCircle size={10} className="text-amber-600" />
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-700">Damage & Return Policy</p>
                                  </div>
                                  <p className="text-[11px] text-amber-800 leading-relaxed">{item.damagePolicy}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* ─── Coupon Section ───────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3 flex items-center gap-1.5">
                  <Gift size={10} className="text-violet-400" /> Coupon Code
                </p>
                <AnimatePresence mode="wait">
                  {appliedCoupon ? (
                    <motion.div
                      key="applied"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className={`flex items-center justify-between border border-dashed rounded-2xl px-4 py-3 ${
                        totals.isFreeOrder
                          ? "bg-violet-50 border-violet-300"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className={totals.isFreeOrder ? "text-violet-500" : "text-emerald-500"} />
                        <div>
                          <p className={`text-[11px] font-black uppercase tracking-wider ${totals.isFreeOrder ? "text-violet-700" : "text-emerald-700"}`}>
                            {appliedCoupon}
                          </p>
                          <p className={`text-[10px] ${totals.isFreeOrder ? "text-violet-600" : "text-emerald-600"}`}>
                            {COUPONS[appliedCoupon]?.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex gap-2.5">
                        <div className="relative flex-1">
                          <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                          <input
                            value={coupon}
                            onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                            onKeyDown={e => e.key === "Enter" && applyCoupon()}
                            placeholder="Enter coupon code"
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#560BAD] rounded-2xl pl-10 pr-4 py-3 text-[12px] font-bold text-slate-700 uppercase tracking-wider outline-none transition-all placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={applyCoupon}
                          className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#560BAD] transition-colors"
                        >
                          Apply
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {couponError && (
                          <motion.p
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 text-[10px] text-red-500 font-bold flex items-center gap-1 ml-1"
                          >
                            <AlertCircle size={10} /> {couponError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* FREESHIP is intentionally omitted from hints below */}
                      {/* <p className="mt-2 text-[9px] text-slate-400 ml-1">
                        Try:{" "}
                        {VISIBLE_COUPON_HINTS.map((code, i) => (
                          <React.Fragment key={code}>
                            <span
                              className="text-violet-500 font-bold cursor-pointer hover:text-violet-700 transition-colors"
                              onClick={() => { setCoupon(code); setCouponError(""); }}
                            >
                              {code}
                            </span>
                            {i < VISIBLE_COUPON_HINTS.length - 1 && <span className="text-slate-300"> · </span>}
                          </React.Fragment>
                        ))}
                      </p> */}
                    </motion.div>
                  )}
                </AnimatePresence>

                {couponSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1 ml-1"
                  >
                    <CheckCircle2 size={10} /> {couponSuccess}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* ─── RIGHT: Order Summary ─────────────────────────────── */}
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2 tracking-tight">
                  <span className="w-7 h-7 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-center">
                    <CreditCard size={13} className="text-[#560BAD]" />
                  </span>
                  Order Summary
                </h2>

                <div className="space-y-2.5 mb-5 max-h-70 overflow-y-auto pr-1 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <img
                        src={imgSrc(item)}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover bg-violet-50 shrink-0"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=ede9fe&color=7c3aed&size=200&bold=true`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">₹{fmt(getDiscountedPrice(item))}/mo × {item.tenure} mo</p>
                      </div>
                      <p className="text-[12px] font-bold text-slate-800 shrink-0">₹{fmt(getDiscountedPrice(item) * item.tenure)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 mb-5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Base Rent</span>
                    <span className="font-semibold text-slate-700">₹{fmt(totals.subtotal)}</span>
                  </div>

                  {totals.pctDiscount > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-600 font-medium uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <TrendingDown size={9} /> Coupon Discount
                      </span>
                      <span className="font-semibold text-emerald-600">-₹{fmt(totals.pctDiscount)}</span>
                    </div>
                  )}

                  {/* GST — hidden for free orders */}
                  {!totals.isFreeOrder && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">GST (18%)</span>
                      <span className={`font-semibold ${totals.gst === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                        {totals.gst === 0 ? "Waived" : `₹${fmt(totals.gst)}`}
                      </span>
                    </div>
                  )}

                  {/* Deposit — hidden for free orders */}
                  {!totals.isFreeOrder && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px]">Refundable Deposit</span>
                      <span className="font-semibold text-slate-700">₹{fmt(totals.deposit)}</span>
                    </div>
                  )}

                  {totals.flatDiscount > 0 && (
                    <div className="flex justify-between text-[11px] bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100 border-dashed">
                      <span className="text-emerald-700 font-black uppercase tracking-widest text-[9px] flex items-center gap-1">
                        <Tag size={9} /> Bonus Saving
                      </span>
                      <span className="font-black text-emerald-700">-₹{fmt(totals.flatDiscount)}</span>
                    </div>
                  )}

                  {/* Free order badge */}
                  {totals.isFreeOrder && (
                    <div className="flex justify-between text-[11px] bg-violet-50 rounded-xl px-3 py-2 border border-violet-200 border-dashed">
                      <span className="text-violet-700 font-black uppercase tracking-widest text-[9px] flex items-center gap-1">
                        <Sparkles size={9} /> Free Order Applied
                      </span>
                      <span className="font-black text-violet-700">-₹{fmt(totals.subtotal)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Total</span>
                    <div className="text-right">
                      {totals.totalDiscount > 0 && (
                        <p className="text-[9px] text-slate-400 line-through leading-none mb-0.5">
                          ₹{fmt(totals.subtotal + Math.round(totals.subtotal * 0.18) + totals.deposit)}
                        </p>
                      )}
                      <p
                        className={`text-2xl font-black ${totals.isFreeOrder ? "text-violet-600" : "text-[#560BAD]"}`}
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {totals.isFreeOrder ? "FREE" : `₹${fmt(totals.total)}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Savings banner */}
                {totals.totalDiscount > 0 && (
                  <div className={`flex items-center gap-2 border rounded-2xl px-4 py-3 mb-5 ${
                    totals.isFreeOrder ? "bg-violet-50 border-violet-100" : "bg-emerald-50 border-emerald-100"
                  }`}>
                    <CheckCircle2 size={14} className={`shrink-0 ${totals.isFreeOrder ? "text-violet-500" : "text-emerald-500"}`} />
                    <p className={`text-[10px] font-bold ${totals.isFreeOrder ? "text-violet-700" : "text-emerald-700"}`}>
                      {totals.isFreeOrder
                        ? "🎉 Your entire order is free!"
                        : `You're saving ₹${fmt(totals.totalDiscount)} on this order!`}
                    </p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProceed}
                  className={`w-full text-white py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2.5 ${
                    totals.isFreeOrder
                      ? "bg-violet-600 hover:bg-violet-700 shadow-violet-200/50"
                      : "bg-[#560BAD] hover:bg-violet-700 shadow-violet-200/50"
                  }`}
                >
                  <Zap size={15} />
                  {totals.isFreeOrder ? "Place Free Order" : "Proceed to Payment"}
                  <ChevronRight size={15} />
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-3">
                  {["visa", "mastercard", "upi", "netbanking"].map(method => (
                    <div key={method} className="text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                      {method}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-3 bg-violet-50/60 rounded-2xl p-3.5 border border-violet-100">
                  <Shield size={14} className="text-[#560BAD] mt-0.5 shrink-0" />
                  <p className="text-[10px] text-violet-700 font-medium leading-relaxed">
                    256-bit SSL encrypted checkout. Your payment details are never stored.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Why Subscribe with Us</p>
                <div className="space-y-2.5">
                  {[
                    { Icon: RefreshCw, text: "Free quarterly maintenance included", color: "text-sky-500",     bg: "bg-sky-50"     },
                    { Icon: Truck,     text: "White-glove delivery & installation", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { Icon: RotateCcw, text: "Cancel or pause anytime",             color: "text-amber-500",   bg: "bg-amber-50"   },
                    { Icon: Shield,    text: "Full damage protection on all plans", color: "text-violet-500",  bg: "bg-violet-50"  },
                  ].map(({ Icon, text, color, bg }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={12} className={color} />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
      `}</style>
    </div>
  );
}