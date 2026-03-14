import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { ShoppingCart, Zap, Heart, Star, CheckCircle2, MapPin, Ban, Plus, Info, ShieldCheck } from "lucide-react";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const isUnavailable = product.availability === "unavailable";

  const addToCart = (e) => {
    e.stopPropagation();
    if (isUnavailable) return;
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const existing = cart.find((i) => i._id === product._id);
    if (existing) {
      cart = cart.map((i) => i._id === product._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    sessionStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const rentNow = (e) => {
    e.stopPropagation();
    if (isUnavailable) return;
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    if (!cart.find((i) => i._id === product._id)) {
      cart.push({ ...product, quantity: 1 });
      sessionStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }
    navigate("/checkout");
  };

  const imgSrc = product.image?.startsWith("http") ? product.image : `/${product.image}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={!isUnavailable ? { y: -10 } : {}}
      onClick={() => navigate(`/products/${product._id}`)}
      className={`group relative flex flex-col bg-white w-full max-w-87.5 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 cursor-pointer ${
        isUnavailable
          ? "opacity-75"
          : "hover:shadow-2xl hover:shadow-purple-500/15"
      }`}
    >
      <div className="relative h-72 overflow-hidden bg-slate-100">
        <motion.img
          whileHover={!isUnavailable ? { scale: 1.15 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full h-full object-cover ${isUnavailable ? "grayscale-35" : ""}`}
          src={imgSrc}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"; }}
        />

        {isUnavailable && (
          <div className="absolute inset-0 bg-slate-900/25 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
              <Ban size={12} className="text-slate-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Currently Unavailable</span>
            </div>
          </div>
        )}

        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/20">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#560BAD]">
              ₹{product.rentPerMonth}<span className="text-slate-400">/mo</span>
            </p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 w-fit">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] text-white font-bold">4.8</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border border-white/60 flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 z-10"
        >
          <motion.div animate={{ scale: wishlisted ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
            <Heart size={14} fill={wishlisted ? "#ef4444" : "none"} color={wishlisted ? "#ef4444" : "#94a3b8"} />
          </motion.div>
        </motion.button>

        {!isUnavailable && (
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="flex gap-3 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={addToCart}
                className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                  added ? "bg-emerald-500 text-white" : "bg-white text-slate-900 hover:bg-[#560BAD] hover:text-white"
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Added!
                    </motion.span>
                  ) : (
                    <motion.span key="cart" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-1.5">
                      <Plus size={13} /> Add Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
                className="p-3.5 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all shadow-lg"
              >
                <Info size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            <ShieldCheck size={12} className="text-[#560BAD]" />
            {product.category}
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#560BAD] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
          {product.description}
        </p>

        {product.serviceAreas?.length > 0 && (
          <div className="flex items-center gap-1.5 py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <MapPin size={9} className="text-[#560BAD] shrink-0" />
            <p className="text-[9px] text-slate-400 truncate font-medium">
              {product.serviceAreas.slice(0, 3).join(", ")}
              {product.serviceAreas.length > 3 && (
                <span className="text-[#560BAD] font-bold"> +{product.serviceAreas.length - 3}</span>
              )}
            </p>
          </div>
        )}

        <div className="pt-6 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Deposit</span>
            <span className="text-base font-black text-slate-900">₹{product.deposit}</span>
          </div>

          {isUnavailable ? (
            <span className="px-5 py-3 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-200 cursor-not-allowed select-none">
              Unavailable
            </span>
          ) : (
            <button
              onClick={rentNow}
              className="relative inline-flex items-center justify-center px-7 py-3 overflow-hidden tracking-tighter text-white bg-slate-900 rounded-xl group/btn transition-transform active:scale-95 shadow-xl shadow-slate-200"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-[#560BAD] rounded-full group-hover/btn:w-64 group-hover/btn:h-64" />
              <span className="absolute bottom-0 left-0 h-full -ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-auto h-full opacity-100 object-stretch" viewBox="0 0 487 487">
                  <path fillOpacity=".1" fillRule="nonzero" fill="#FFF" d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z" />
                </svg>
              </span>
              <span className="absolute top-0 right-0 w-12 h-full -mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="object-cover w-full h-full" viewBox="0 0 487 487">
                  <path fillOpacity=".1" fillRule="nonzero" fill="#FFF" d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z" />
                </svg>
              </span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-linear-to-b from-transparent via-transparent to-gray-200" />
              <span className="relative text-[11px] font-black uppercase tracking-[0.15em]">Rent Now</span>
            </button>
          )}
        </div>
      </div>

      {!isUnavailable && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-[#560BAD] via-purple-400 to-[#560BAD] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      )}
    </motion.div>
  );
}