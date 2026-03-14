import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  Trash2, Edit, PlusCircle, Package, X, RefreshCw,
  Search, BarChart2, Tag, IndianRupee,
  Calendar, AlertCircle, CheckCircle2, Filter, ChevronDown,
  Eye, Layers, MapPin, ShieldCheck,
  Download, ToggleLeft, ToggleRight, Sparkles, TrendingUp
} from "lucide-react";

const API = "https://rentease-backend-oxyy.onrender.com";
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const CATEGORIES = ["All", "Furniture", "Appliances", "Electronics", "Fitness", "Office", "Kitchen", "Other"];

const getAuthConfig = () => {
  const rawToken = sessionStorage.getItem("token");
  if (!rawToken) return null;
  const token = rawToken.replace(/^"|"$/g, "");
  return { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } };
};

const INPUT_CLS = "w-full bg-white/60 border border-slate-200/80 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 rounded-2xl px-4 py-3 text-[13px] outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800";
const TEXTAREA_CLS = `${INPUT_CLS} resize-none`;

const FieldLabel = ({ text, required }) => (
  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">
    {text}{required && <span className="text-red-400 ml-0.5">*</span>}
  </p>
);

const InputField = ({ label, name, type = "text", placeholder, required, rows, value, onChange }) => (
  <div>
    <FieldLabel text={label} required={required} />
    {rows ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={TEXTAREA_CLS}
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={INPUT_CLS}
      />
    )}
  </div>
);

const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-700 flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-[12px] font-bold border backdrop-blur-xl ${
            t.type === "error"
              ? "bg-white/95 text-red-600 border-red-100 shadow-red-100/50"
              : t.type === "warning"
              ? "bg-white/95 text-amber-600 border-amber-100 shadow-amber-100/50"
              : "bg-white/95 text-emerald-600 border-emerald-100 shadow-emerald-100/50"
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              t.type === "error" ? "bg-red-100" : t.type === "warning" ? "bg-amber-100" : "bg-emerald-100"
            }`}
          >
            {t.type === "error" ? (
              <X size={12} className="text-red-500" />
            ) : (
              <CheckCircle2 size={12} className={t.type === "warning" ? "text-amber-500" : "text-emerald-500"} />
            )}
          </motion.div>
          {t.msg}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 rounded-full ${
              t.type === "error" ? "bg-red-300" : t.type === "warning" ? "bg-amber-300" : "bg-emerald-300"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3.5, ease: "linear" }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
{ /* eslint-disable no-unused-vars */}
const StatCard = ({ label, value, icon: Icon, color, bg, border, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className={`${bg} ${border} border rounded-2xl px-5 py-4 relative overflow-hidden`}
  >
    <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent pointer-events-none" />
    <div className="flex items-center justify-between mb-3 relative">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
        <Icon size={14} className={color} />
      </div>
    </div>
    <p className={`text-2xl font-black tracking-tight ${color} relative`}>{value}</p>
    {sub && <p className="text-[9px] text-slate-400 mt-0.5 font-semibold relative">{sub}</p>}
  </motion.div>
);

const EMPTY_FORM = {
  name: "", category: "", image: "", description: "",
  rentPerMonth: "", deposit: "", tenureOptions: "3, 6, 12",
  availability: "available", serviceAreas: "", damagePolicy: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCatFilter, setShowCatFilter] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setAvailability = useCallback((val) => {
    setForm((prev) => ({ ...prev, availability: val }));
  }, []);

  useEffect(() => { fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
    } catch {
      showToast("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingProduct(null);
    setShowModal(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = getAuthConfig();
    if (!config) { showToast("Admin login required.", "error"); return; }
    setSubmitting(true);
    const payload = {
      ...form,
      rentPerMonth: Number(form.rentPerMonth),
      deposit: Number(form.deposit),
      tenureOptions: typeof form.tenureOptions === "string"
        ? form.tenureOptions.split(",").map((t) => Number(t.trim())).filter((n) => !isNaN(n) && n)
        : form.tenureOptions,
      serviceAreas: typeof form.serviceAreas === "string"
        ? form.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean)
        : form.serviceAreas,
    };
    try {
      if (editingProduct) {
        await axios.put(`${API}/api/products/${editingProduct._id}`, payload, config);
        showToast("Product updated successfully.");
      } else {
        await axios.post(`${API}/api/products`, payload, config);
        showToast("Product added successfully.");
      }
      fetchProducts();
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      image: product.image || "",
      description: product.description || "",
      rentPerMonth: product.rentPerMonth || "",
      deposit: product.deposit || "",
      tenureOptions: Array.isArray(product.tenureOptions) ? product.tenureOptions.join(", ") : "",
      availability: product.availability || "available",
      serviceAreas: Array.isArray(product.serviceAreas) ? product.serviceAreas.join(", ") : (product.serviceAreas || ""),
      damagePolicy: product.damagePolicy || "",
    });
    setShowModal(true);
  }, []);

  const handleDelete = async (id) => {
    const config = getAuthConfig();
    if (!config) { showToast("Session expired.", "error"); return; }
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/products/${id.trim()}`, config);
      setProducts((p) => p.filter((x) => x._id !== id));
      setConfirmDelete(null);
      setSelectedProduct(null);
      showToast("Product deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (product) => {
    const config = getAuthConfig();
    if (!config) { showToast("Admin login required.", "error"); return; }
    const newStatus = product.availability === "available" ? "unavailable" : "available";
    setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, availability: newStatus } : p));
    try {
      await axios.put(`${API}/api/products/${product._id}`, { ...product, availability: newStatus }, config);
      showToast(`Marked as ${newStatus}.`);
    } catch {
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, availability: product.availability } : p));
      showToast("Failed to update availability.", "error");
    }
  };

  const exportCSV = () => {
    const rows = [["ID", "Name", "Category", "Rent/Month", "Deposit", "Availability", "Tenures", "Service Areas"]];
    filtered.forEach((p) => rows.push([p._id, p.name, p.category, p.rentPerMonth, p.deposit, p.availability || "available", (p.tenureOptions || []).join("|"), (p.serviceAreas || []).join("|")]));
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `inventory_${Date.now()}.csv` }).click();
    showToast("CSV exported.");
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    available: products.filter((p) => (p.availability || "available") === "available").length,
    unavailable: products.filter((p) => p.availability === "unavailable").length,
    avgRent: products.length ? Math.round(products.reduce((a, p) => a + (p.rentPerMonth || 0), 0) / products.length) : 0,
  }), [products]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-violet-50/30 antialiased">
      <Toast toasts={toasts} />

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-600 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative p-8 text-center border border-slate-100 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-400 via-red-500 to-red-400" />
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Trash2 size={26} className="text-red-500" />
              </motion.div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Delete Product?</h3>
              <p className="text-[12px] text-slate-400 mb-7 leading-relaxed">This will permanently remove the product from your inventory. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">Keep It</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deletingId === confirmDelete ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : <Trash2 size={12} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-20 sm:pt-24 md:pt-28 pb-16">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-linear-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-slate-300/50">
                <Package size={16} className="text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">RentEase Admin</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Inventory<br /><span className="font-light italic text-slate-400">Control</span>
            </h1>
            <p className="mt-3 text-[12px] text-slate-400 font-medium flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {stats.available} live
              </span>
              <span className="text-slate-300">·</span>
              {products.length} total products
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
              <Download size={12} /> Export
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={fetchProducts} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 12px 30px rgba(86,11,173,0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true); }}
              className="flex items-center gap-2 bg-[#560BAD] text-white px-5 py-2.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-violet-300/40 transition-all"
            >
              <PlusCircle size={14} /> Add Product
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard delay={0}    label="Total Products"  value={stats.total}              icon={Layers}       color="text-slate-700"   bg="bg-white"       border="border-slate-200"   sub="in inventory"     />
          <StatCard delay={0.06} label="Available"       value={stats.available}          icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50"  border="border-emerald-100" sub="ready to rent"    />
          <StatCard delay={0.12} label="Unavailable"     value={stats.unavailable}        icon={AlertCircle}  color="text-red-500"     bg="bg-red-50"      border="border-red-100"     sub="off listing"      />
          <StatCard delay={0.18} label="Avg Rent/Month"  value={`₹${fmt(stats.avgRent)}`} icon={TrendingUp}   color="text-violet-600"  bg="bg-violet-50"   border="border-violet-100"  sub="across all items" />
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-10 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={13} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => setShowCatFilter(!showCatFilter)} className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all whitespace-nowrap">
              <Filter size={12} /> {categoryFilter}
              <motion.div animate={{ rotate: showCatFilter ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={10} />
              </motion.div>
            </button>
            <AnimatePresence>
              {showCatFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden w-44"
                >
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => { setCategoryFilter(cat); setShowCatFilter(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 transition-colors ${categoryFilter === cat ? "text-violet-600 bg-violet-50" : "text-slate-600"}`}>
                      <Tag size={10} className="opacity-40" />{cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-2xl gap-1">
            {[["grid", Layers], ["list", BarChart2]].map(([mode, Icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewMode === mode ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}>
                <Icon size={12} />{mode}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </motion.div>

        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }} className="w-11 h-11 rounded-full border-[3px] border-violet-100 border-t-[#560BAD]" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-violet-200">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
              <Package size={48} className="text-violet-200" />
            </motion.div>
            <p className="mt-4 text-slate-600 font-bold">No products found.</p>
            <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} className="mt-3 text-[11px] text-violet-500 font-bold hover:underline">Clear filters</button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-violet-100/50 transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="h-48 overflow-hidden relative bg-linear-to-br from-violet-50 to-slate-100">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[9px] font-black text-violet-600 uppercase tracking-widest border border-violet-100/50">
                      {product.category}
                    </span>
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm flex items-center gap-1 ${
                      (product.availability || "available") === "available"
                        ? "bg-emerald-50/95 text-emerald-700 border-emerald-200"
                        : "bg-red-50/95 text-red-600 border-red-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(product.availability || "available") === "available" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                      {(product.availability || "available") === "available" ? "Live" : "Off"}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedProduct(product)} className="flex-1 py-2 bg-white/95 backdrop-blur-sm text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/60 flex items-center justify-center gap-1 hover:bg-white shadow-lg">
                        <Eye size={10} /> View
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleEdit(product)} className="flex-1 py-2 bg-[#560BAD]/95 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-[#560BAD] shadow-lg">
                        <Edit size={10} /> Edit
                      </motion.button>
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="font-black text-slate-800 truncate text-[15px] tracking-tight">{product.name}</h2>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 mt-1 leading-relaxed h-8">{product.description}</p>

                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        { label: "Rent", value: `₹${fmt(product.rentPerMonth)}` },
                        { label: "Deposit", value: `₹${fmt(product.deposit)}` },
                        { label: "Tenures", value: `${(product.tenureOptions || []).join(",")}m` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">{label}</p>
                          <p className="text-[11px] font-black text-slate-800 mt-0.5 truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {product.serviceAreas?.length > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin size={9} className="text-violet-400 shrink-0" />
                        <p className="text-[9px] text-slate-400 truncate font-medium">{(product.serviceAreas || []).join(", ")}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => toggleAvailability(product)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          (product.availability || "available") === "available"
                            ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                        }`}
                      >
                        {(product.availability || "available") === "available" ? <><ToggleRight size={11} /> Disable</> : <><ToggleLeft size={11} /> Enable</>}
                      </button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(product)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                        <Edit size={13} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfirmDelete(product._id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100">
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {["Product", "Category", "Rent/mo", "Deposit", "Tenures", "Service Areas", "Availability", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((p, i) => (
                      <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-slate-800 truncate max-w-35">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-35">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-1 rounded-lg border border-violet-100 uppercase">{p.category}</span></td>
                        <td className="px-4 py-3"><p className="text-[13px] font-black text-slate-900">₹{fmt(p.rentPerMonth)}</p></td>
                        <td className="px-4 py-3"><p className="text-[12px] font-semibold text-slate-600">₹{fmt(p.deposit)}</p></td>
                        <td className="px-4 py-3"><p className="text-[11px] text-slate-500">{(p.tenureOptions || []).join(", ")}m</p></td>
                        <td className="px-4 py-3"><p className="text-[10px] text-slate-400 max-w-30 truncate">{(p.serviceAreas || []).join(", ") || "—"}</p></td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleAvailability(p)} className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl border transition-all ${
                            (p.availability || "available") === "available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          }`}>
                            {(p.availability || "available") === "available" ? "● Available" : "● Unavailable"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelectedProduct(p)} className="w-7 h-7 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center hover:bg-violet-100 transition-colors"><Eye size={12} className="text-violet-600" /></button>
                            <button onClick={() => handleEdit(p)} className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"><Edit size={12} className="text-blue-600" /></button>
                            <button onClick={() => setConfirmDelete(p._id)} className="w-7 h-7 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={12} className="text-red-500" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-400 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 28 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-xl flex items-center justify-center transition-colors">
                <X size={14} className="text-white" />
              </button>

              <div className="h-56 overflow-hidden relative bg-linear-to-br from-violet-50 to-slate-100">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-4 left-5 right-12">
                  <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{selectedProduct.name}</h2>
                </div>
                <div className={`absolute top-4 right-14 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm flex items-center gap-1 ${
                  (selectedProduct.availability || "available") === "available"
                    ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                    : "bg-red-50/90 text-red-600 border-red-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${(selectedProduct.availability || "available") === "available" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  {(selectedProduct.availability || "available") === "available" ? "Available" : "Unavailable"}
                </div>
              </div>

              <div className="p-6">
                <p className="text-[12px] text-slate-500 leading-relaxed mb-5">{selectedProduct.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Rent/Month", value: `₹${fmt(selectedProduct.rentPerMonth)}`, icon: IndianRupee },
                    { label: "Deposit",    value: `₹${fmt(selectedProduct.deposit)}`,      icon: ShieldCheck },
                    { label: "Tenures",    value: `${(selectedProduct.tenureOptions || []).join(", ")}m`, icon: Calendar },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
                      <Icon size={14} className="text-[#560BAD] mx-auto mb-1" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-[13px] font-black text-slate-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedProduct.serviceAreas?.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <MapPin size={11} className="text-[#560BAD]" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Service Areas</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedProduct.serviceAreas || []).map((area) => (
                        <span key={area} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-xl border border-violet-100">{area}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.damagePolicy && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertCircle size={11} className="text-amber-600" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Damage Policy</p>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">{selectedProduct.damagePolicy}</p>
                  </div>
                )}

                <div className="flex gap-2.5">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedProduct(null); handleEdit(selectedProduct); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#560BAD] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-violet-700 transition-all shadow-md shadow-violet-300/40">
                    <Edit size={13} /> Edit Product
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { toggleAvailability(selectedProduct); setSelectedProduct(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border ${
                      (selectedProduct.availability || "available") === "available"
                        ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                    }`}>
                    {(selectedProduct.availability || "available") === "available" ? <><ToggleRight size={13} /> Disable</> : <><ToggleLeft size={13} /> Enable</>}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedProduct(null); setConfirmDelete(selectedProduct._id); }}
                    className="px-4 py-3 rounded-2xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-500 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 28 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[95vh] overflow-y-auto"
            >
              <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-linear-to-r from-slate-50 to-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#560BAD] rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
                    {editingProduct ? <Edit size={15} className="text-white" /> : <Sparkles size={15} className="text-white" />}
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 tracking-tight">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{editingProduct ? "Update details, pricing and availability" : "Fill in all product details below"}</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={resetForm} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                  <X size={14} className="text-slate-600" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-7">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Product Name"    name="name"          placeholder="e.g. Premium Sofa Set"                                     required value={form.name}          onChange={handleChange} />
                  <InputField label="Category"        name="category"      placeholder="e.g. Furniture"                                             required value={form.category}      onChange={handleChange} />

                  <div className="col-span-2">
                    <InputField label="Image URL" name="image" placeholder="https://..." value={form.image} onChange={handleChange} />
                    <AnimatePresence>
                      {form.image && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 100, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 rounded-2xl overflow-hidden border border-slate-100">
                          <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="col-span-2">
                    <InputField label="Description" name="description" placeholder="Brief product description..." rows={2} value={form.description} onChange={handleChange} />
                  </div>

                  <InputField label="Monthly Rent (₹)" name="rentPerMonth" type="number" placeholder="999"  required value={form.rentPerMonth} onChange={handleChange} />
                  <InputField label="Deposit (₹)"      name="deposit"      type="number" placeholder="2999" required value={form.deposit}      onChange={handleChange} />

                  <div className="col-span-2">
                    <InputField label="Tenure Options (e.g. 3, 6, 12)" name="tenureOptions" placeholder="3, 6, 12" required value={form.tenureOptions} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <InputField label="Service Areas (comma separated)" name="serviceAreas" placeholder="Mumbai, Delhi, Bangalore" value={form.serviceAreas} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <InputField label="Damage & Return Policy" name="damagePolicy" placeholder="e.g. Minor damages covered, major damages charged at cost..." rows={2} value={form.damagePolicy} onChange={handleChange} />
                  </div>

                  <div className="col-span-2">
                    <FieldLabel text="Availability" />
                    <div className="grid grid-cols-2 gap-2">
                      {["available", "unavailable"].map((val) => (
                        <motion.button
                          key={val}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setAvailability(val)}
                          className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                            form.availability === val
                              ? val === "available"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200"
                                : "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${form.availability === val ? "bg-white" : val === "available" ? "bg-emerald-400" : "bg-red-400"}`} />
                          {val === "available" ? "Available" : "Unavailable"}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                  <button type="button" onClick={resetForm} className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors rounded-2xl hover:bg-slate-50">Cancel</button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 bg-[#560BAD] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-300/40 flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" /> Saving...</>
                    ) : (
                      <><CheckCircle2 size={13} /> {editingProduct ? "Update Product" : "Save Product"}</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}