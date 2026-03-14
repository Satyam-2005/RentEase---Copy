import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  ShieldCheck, Truck, RefreshCw, Clock, Star, ChevronRight,
  ShoppingCart, Zap, Heart, Share2, ArrowLeft, CheckCircle2,
  MapPin, AlertCircle, Ban
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: d, ease: [0.22, 1, 0.36, 1] } })
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTenure, setSelectedTenure] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); 

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://rentease-backend-oxyy.onrender.com/api/products/${id}`);
      const data = res.data.product || res.data;
      setProduct(data);
      setSelectedTenure(data?.tenureOptions?.[0] || 3);
      setActiveImage(data?.images?.[0] || data?.image);
    } catch (err) {
      setError("Unable to retrieve product details.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  const isUnavailable = product?.availability === "unavailable";

  const calculatedRent = useMemo(() => {
    if (!product) return 0;
    const base = product.rentPerMonth || 0;
    if (selectedTenure >= 12) return Math.floor(base * 0.85);
    if (selectedTenure >= 6)  return Math.floor(base * 0.92);
    return base;
  }, [product, selectedTenure]);

  const savings = useMemo(() => {
    if (!product) return 0;
    return (product.rentPerMonth || 0) - calculatedRent;
  }, [product, calculatedRent]);

  const addToCart = () => {
    if (isUnavailable) return;
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const existing = cart.findIndex((i) => i._id === product._id);
    const item = { ...product, price: calculatedRent, tenure: selectedTenure, quantity: 1 };
    if (existing > -1) cart[existing] = item;
    else cart.push(item);
    sessionStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-violet-50 via-white to-slate-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
        className="w-9 h-9 rounded-full border-[3px] border-violet-100 border-t-violet-600"
      />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Loading</p>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <p className="text-[13px] text-slate-500">{error || "Product not found"}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-[11px] font-black uppercase tracking-[0.12em] text-violet-600 bg-none border-none cursor-pointer">
        ← Return
      </button>
    </div>
  );

  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-6xl mx-auto px-6 py-28 lg:py-24">

        {isUnavailable && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4"
          >
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Ban size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-700">Product Currently Unavailable</p>
              <p className="text-[11px] text-slate-400 mt-0.5">This item is temporarily off the listing. You can browse similar products.</p>
            </div>
            <button onClick={() => navigate("/products")} className="ml-auto px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-colors shrink-0">
              Browse
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16">

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 mb-7 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-violet-600 transition-colors duration-200 bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Collection
            </motion.button>

            <div className="flex gap-3">
              <div className="flex flex-col gap-2.5">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${activeImage === img ? "border-violet-500 shadow-md shadow-violet-200/60" : "border-slate-200 opacity-55 hover:opacity-85"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>

              <div className={`flex-1 rounded-2xl overflow-hidden bg-linear-to-br from-violet-50 to-slate-100 border border-slate-100 shadow-sm relative ${isUnavailable ? "grayscale-20" : ""}`}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.38 }}
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-105 lg:h-115 object-cover"
                  />
                </AnimatePresence>

                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-white/60">
                  <span className="text-[12px] font-black text-violet-700">₹{calculatedRent}</span>
                  <span className="text-[10px] text-slate-400 font-medium">/mo</span>
                </div>

                {isUnavailable ? (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-slate-100/95 backdrop-blur-sm border border-slate-300 rounded-xl px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">Unavailable</span>
                  </div>
                ) : (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-emerald-50/95 backdrop-blur-sm border border-emerald-200 rounded-xl px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700">In Stock</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-7 border-t border-slate-100">
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={0.1} viewport={{ once: true }}>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-3">Description</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{product.description}</p>
              </motion.div>
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={0.2} viewport={{ once: true }}>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-3">Plan Includes</p>
                <div className="flex flex-col gap-2">
                  {[
                    { Icon: ShieldCheck, text: "Comprehensive Damage Cover" },
                    { Icon: RefreshCw,   text: "Quarterly Professional Servicing" },
                    { Icon: Truck,       text: "White-Glove Delivery & Setup" },
                    { Icon: Clock,       text: "Flexible Early Exit Policy" }
                  ].map(({ text }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-violet-50/60 border border-violet-100/60"
                    >
                      <CheckCircle2 size={13} className="text-violet-500 shrink-0" />
                      <span className="text-[11px] text-slate-600 font-medium">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {product.serviceAreas?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-6 pt-6 border-t border-slate-100"
              >
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin size={10} className="text-violet-400" /> Available Service Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.serviceAreas.map((area) => (
                    <span key={area} className="flex items-center gap-1.5 text-[10px] font-semibold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-100">
                      <MapPin size={9} className="text-violet-400" /> {area}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {product.damagePolicy && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-6 pt-6 border-t border-slate-100"
              >
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={10} className="text-amber-500" /> Damage & Return Policy
                </p>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-[11px] text-amber-800 leading-relaxed">{product.damagePolicy}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="lg:sticky lg:top-24 flex flex-col gap-4 self-start"
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block text-[9px] font-black uppercase tracking-[0.18em] text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg mb-3"
              >
                {product.category}
              </motion.span>

              <h1
                className="text-2xl lg:text-[26px] font-semibold text-slate-900 leading-snug tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {product.name}
              </h1>

              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />)}
                <span className="text-[11px] text-slate-400 ml-1.5">4.8 · 240 reviews</span>
              </div>

              <div className="flex items-baseline gap-2.5 py-4 border-y border-slate-100 my-4">
                <motion.span
                  key={calculatedRent}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-light text-slate-900"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  ₹{calculatedRent}
                </motion.span>
                <span className="text-[12px] text-slate-400">/ month</span>
                <AnimatePresence>
                  {savings > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                    >
                      Save ₹{savings}
                    </motion.span>
                  )}
                </AnimatePresence>
                {selectedTenure >= 6 && (
                  <span className="text-[9px] font-black text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">Best Value</span>
                )}
              </div>

              <div className="mb-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2.5">Select Tenure</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mo: 3,  badge: null      },
                    { mo: 6,  badge: "8% off"  },
                    { mo: 12, badge: "15% off" }
                  ].map(({ mo, badge }) => (
                    <motion.button
                      key={mo}
                      whileHover={{ scale: isUnavailable ? 1 : 1.03 }}
                      whileTap={{ scale: isUnavailable ? 1 : 0.96 }}
                      onClick={() => !isUnavailable && setSelectedTenure(mo)}
                      className={`relative py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all duration-200 ${
                        isUnavailable
                          ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                          : selectedTenure === mo
                          ? "bg-violet-600 text-white shadow-md shadow-violet-300/50 border border-violet-500"
                          : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {mo} Mo
                      {badge && !isUnavailable && (
                        <span className="absolute -top-2 -right-1.5 text-[7px] font-black bg-emerald-500 text-white px-1 py-0.5 rounded-md border border-white">
                          {badge}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: isUnavailable ? 1 : 1.02, y: isUnavailable ? 0 : -1 }}
                    whileTap={{ scale: isUnavailable ? 1 : 0.97 }}
                    onClick={addToCart}
                    disabled={isUnavailable}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-md ${
                      isUnavailable
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-100"
                        : added
                        ? "bg-emerald-500 text-white shadow-emerald-200"
                        : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {added ? (
                        <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Added!
                        </motion.span>
                      ) : (
                        <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                          <ShoppingCart size={14} /> {isUnavailable ? "Unavailable" : "Add to Cart"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all duration-200"
                  >
                    <motion.div animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
                      <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} color={isWishlisted ? "#ef4444" : "#94a3b8"} />
                    </motion.div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    className="px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 transition-all duration-200"
                  >
                    <Share2 size={16} />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: isUnavailable ? 1 : 1.02, y: isUnavailable ? 0 : -1 }}
                  whileTap={{ scale: isUnavailable ? 1 : 0.97 }}
                  onClick={() => { if (!isUnavailable) { addToCart(); navigate("/checkout"); } }}
                  disabled={isUnavailable}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors duration-300 shadow-lg ${
                    isUnavailable
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-100"
                      : "bg-slate-900 text-white hover:bg-violet-800 shadow-slate-900/20"
                  }`}
                >
                  <Zap size={14} />
                  {isUnavailable ? "Currently Unavailable" : `Rent Now — ₹${calculatedRent}/mo`}
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {[
                { label: "Deposit",  value: `₹${product.deposit}` },
                { label: "Tenure",   value: `${selectedTenure} mo` },
                { label: "Shipping", value: "Checkout", green: true }
              ].map(({ label, value, green }, i) => (
                <div key={i} className={`flex flex-col items-center py-4 ${i < 2 ? "border-r border-slate-100" : ""}`}>
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                  <p className={`mt-1 text-[13px] font-bold ${green ? "text-emerald-600" : "text-slate-900"}`} style={!green ? { fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" } : { fontSize: "11px" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {product.serviceAreas?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={12} className="text-violet-500" />
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Delivery Available In</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.serviceAreas.map((area) => (
                    <span key={area} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-xl border border-violet-100">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400 px-5 pt-4 pb-0 mb-0">Rental FAQ</p>
              <div className="divide-y divide-slate-50">
                {[
                  { q: "Security Deposit Policy",    a: "Deposits are strictly refundable and processed within 48 hours of product return inspection." },
                  { q: "Maintenance & Upkeep",       a: "We provide quarterly professional maintenance and on-call support for any functional issues." },
                  { q: "Early Termination",          a: "Plans can be closed early by paying a pro-rated difference based on the next closest tenure." },
                  ...(product.damagePolicy ? [{ q: "Damage Policy", a: product.damagePolicy }] : [])
                ].map((faq, i) => (
                  <div
                    key={i}
                    className="px-5 cursor-pointer"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <div className="flex justify-between items-center py-3.5">
                      <span className="text-[12px] font-semibold text-slate-700">{faq.q}</span>
                      <motion.span animate={{ rotate: openIndex === i ? 90 : 0 }} transition={{ duration: 0.22 }}>
                        <ChevronRight size={13} className={openIndex === i ? "text-violet-500" : "text-slate-300"} />
                      </motion.span>
                    </div>
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="text-[11px] text-slate-500 leading-relaxed pb-4 overflow-hidden"
                        >
                          {faq.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;