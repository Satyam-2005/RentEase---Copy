import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  Search, SlidersHorizontal, Package, RefreshCw, Truck,
  CreditCard, LayoutGrid, LayoutList, Sparkles, TrendingUp, Ban, X,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

const API = "http://127.0.0.1:5000";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export default function Products() {
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [sort,        setSort]        = useState("latest");
  const [viewMode,    setViewMode]    = useState("grid");
  const [availFilter, setAvailFilter] = useState("all");
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category") || "";

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await axios.get(`${API}/api/products`);
      const data = Array.isArray(res.data) ? res.data : [];
      setProducts(data);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Counts (always from full list so badges are always accurate) ───────────
  const allCount         = products.length;
  const availableCount   = useMemo(() => products.filter(p => (p.availability || "available") === "available").length, [products]);
  const unavailableCount = useMemo(() => products.filter(p => p.availability === "unavailable").length, [products]);

  // ── Filter + sort — each step independent, no mutation ────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];                                  // fresh copy — never mutate state

    if (category) {
      result = result.filter(p =>
        (p.category || "").toLowerCase().includes(category.toLowerCase())
      );
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(p =>
        (p.name        || "").toLowerCase().includes(q) ||
        (p.category    || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    if (availFilter === "available") {
      result = result.filter(p => (p.availability || "available") === "available");
    } else if (availFilter === "unavailable") {
      result = result.filter(p => p.availability === "unavailable");
    }

    if (sort === "low")  result = result.sort((a, b) => (a.rentPerMonth || 0) - (b.rentPerMonth || 0));
    if (sort === "high") result = result.sort((a, b) => (b.rentPerMonth || 0) - (a.rentPerMonth || 0));

    return result;
  }, [products, category, search, availFilter, sort]);

  const clearSearch = () => setSearch("");

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-violet-50 via-white to-slate-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
        className="w-9 h-9 rounded-full border-[3px] border-violet-100 border-t-violet-600"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400"
      >
        Loading Collection
      </motion.p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-violet-50 via-white to-slate-50 p-6">
      <Package size={44} className="text-violet-200 mb-4" />
      <p className="text-slate-600 font-semibold text-[14px] mb-2">Could not load products</p>
      <p className="text-slate-400 text-[12px] mb-5">{error}</p>
      <button
        onClick={fetchProducts}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#560BAD] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200/50"
      >
        <RefreshCw size={13} /> Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-violet-50/30">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header className="pt-28 pb-6 px-6 sm:px-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-4">
            {/* Title */}
            <div className="space-y-1.5">
              <AnimatePresence>
                {category && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-lg"
                  >
                    <Sparkles size={9} /> {category}
                  </motion.span>
                )}
              </AnimatePresence>
              <h1
                className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {category ? `${category} Collection` : "Rent the Look"}
              </h1>
              <p className="text-[12px] text-violet-600 font-semibold tracking-wide">
                {category
                  ? `Premium ${category.toLowerCase()} on flexible monthly plans`
                  : "Curated furniture & appliances on flexible plans"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2.5">

              {/* ── Search ──────────────────────────────────────────────── */}
              {/* Fixed width — NO focus:w-60 expansion which was causing layout reflow */}
              <div className="relative w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-300 hover:bg-slate-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={9} className="text-white" />
                  </button>
                )}
              </div>

              {/* ── Sort ────────────────────────────────────────────────── */}
              <div className="relative">
                <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors cursor-pointer appearance-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                </select>
              </div>

              {/* ── View mode ───────────────────────────────────────────── */}
              <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {[
                  { mode: "grid", Icon: LayoutGrid },
                  { mode: "list", Icon: LayoutList },
                  
                ].map(({ mode, Icon }) => (
                  <motion.button
                    key={mode}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode(mode)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      viewMode === mode
                        ? "bg-white text-violet-600 shadow-sm border border-slate-200"
                        : "text-slate-400 hover:text-violet-500"
                    }`}
                  >
                    <Icon size={14} />
                  </motion.button>
                ))}
              </div>

              {/* ── Refresh ─────────────────────────────────────────────── */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={fetchProducts}
                title="Refresh products"
                className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-violet-600 hover:border-violet-200 transition-all"
              >
                <RefreshCw size={14} />
              </motion.button>
            </div>
          </div>

          {/* ── Filter bar ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg">
              <TrendingUp size={9} /> {filteredProducts.length} items
            </span>

            {/* Availability pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: "all",         label: "All",         count: allCount,         dot: null              },
                { key: "available",   label: "Available",   count: availableCount,   dot: "bg-emerald-400"  },
                { key: "unavailable", label: "Unavailable", count: unavailableCount, dot: "bg-slate-300"    },
              ].map(({ key, label, count, dot }) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAvailFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                    availFilter === key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
                  {label}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                    availFilter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Active search chip */}
            {search.trim() && (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-red-500 transition-colors bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-lg"
              >
                <span className="text-violet-600 font-semibold">"{search}"</span>
                <X size={9} />
              </button>
            )}

            {/* Active category chip */}
            {category && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                Category: <span className="text-violet-600 font-semibold">{category}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10">

        {filteredProducts.length === 0 ? (
          // ── Empty state ─────────────────────────────────────────────────
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white/70 rounded-2xl border border-dashed border-violet-200"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              {availFilter === "unavailable"
                ? <Ban size={44} className="text-slate-300" />
                : <Package size={44} className="text-violet-200" />}
            </motion.div>
            <h2
              className="mt-4 text-xl font-semibold text-slate-800 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No products found
            </h2>
            <p className="mt-1 text-[12px] text-slate-400 text-center max-w-xs">
              {search.trim()
                ? `No results for "${search}" — try a different search term.`
                : "Try adjusting your filters."}
            </p>
            <div className="flex gap-3 mt-5 flex-wrap justify-center">
              {search.trim() && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all border border-violet-100"
                >
                  Clear Search
                </button>
              )}
              {availFilter !== "all" && (
                <button
                  onClick={() => setAvailFilter("all")}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Show All Products
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          // ── Products grid — NO AnimatePresence wrapper here ─────────────
          // AnimatePresence was causing the grid to fully unmount + remount
          // every time search changed, making products "disappear" momentarily.
          // Using layout animation on individual cards instead is correct.
          <motion.div
            layout
            variants={stagger}
            initial="hidden"
            animate="show"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "grid grid-cols-1 gap-4"
            }
          >
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product._id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="bg-white/80 backdrop-blur-md border-t border-slate-100 py-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2
              className="text-2xl font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Why Choose Rent<span className="text-violet-600">Ease</span>?
            </h2>
            <p className="text-[12px] text-slate-500 mt-1.5">Everything you need, nothing you don't</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                Icon: CreditCard, title: "Affordable Pricing",
                desc: "Pay only for what you use with flexible monthly plans starting from ₹299/mo.",
                bg: "bg-violet-50",  border: "border-violet-100",  icon: "text-violet-600",
              },
              {
                Icon: RefreshCw, title: "Free Maintenance",
                desc: "Professional repairs and quarterly servicing are fully included at no extra cost.",
                bg: "bg-sky-50",     border: "border-sky-100",     icon: "text-sky-600",
              },
              {
                Icon: Truck, title: "Easy Relocation",
                desc: "Moving? We relocate your products to your new doorstep at no extra cost.",
                bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600",
              },
            ].map(({ Icon, title, desc, bg, border, icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={icon} />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}