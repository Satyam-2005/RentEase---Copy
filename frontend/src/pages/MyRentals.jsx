import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Package, Pause, Play, Search,
  ChevronLeft, Activity, Wrench, Send,
  CheckCircle2, Layers, X, AlertCircle, TrendingUp,
  Clock, Star, Zap, BarChart2, ChevronRight,
  RefreshCw, Truck, ShieldAlert, RotateCcw,
  MapPin,
} from "lucide-react";

const API = "http://127.0.0.1:5000";
const fmt  = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const fmtDate = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const APPROVAL_CONFIG = {
  Pending:   { label: "Pending",   color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-400"                  },
  Approved:  { label: "Approved",  color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-400"                   },
  Delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400 animate-pulse"  },
  Rejected:  { label: "Rejected",  color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-400"                    },
  Cancelled: { label: "Cancelled", color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200",   dot: "bg-slate-400"                  },
};

const REQUEST_TYPES = [
  { key: "Maintenance", icon: Wrench,      label: "Maintenance",  color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", desc: "Report a repair or servicing need"       },
  { key: "Damage",      icon: ShieldAlert, label: "Damage Claim", color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    desc: "Report accidental damage to the product" },
  { key: "Return",      icon: RotateCcw,   label: "Return",       color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   desc: "Initiate a product return or early exit" },
  { key: "Dispute",     icon: AlertCircle, label: "Dispute",      color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100",  desc: "Raise a billing or service dispute"      },
];

const FILTER_TABS = ["All", "Pending", "Approved", "Delivered", "Paused"];

function StatusBadge({ approvalStatus, pauseStatus }) {
  const isPaused = approvalStatus === "Delivered" && pauseStatus === "Paused";
  const cfg = isPaused
    ? { label: "Paused", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" }
    : (APPROVAL_CONFIG[approvalStatus] || APPROVAL_CONFIG["Pending"]);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-xl border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function MyRentals() {
  const [rentals,            setRentals]            = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [search,             setSearch]             = useState("");
  const [filterTab,          setFilterTab]          = useState("All");
  const [selectedRental,     setSelectedRental]     = useState(null);
  const [showRequestModal,   setShowRequestModal]   = useState(false);
  const [requestType,        setRequestType]        = useState("Maintenance");
  const [requestForm,        setRequestForm]        = useState({ title: "", description: "", visitDate: "" });
  const [isSubmitting,       setIsSubmitting]       = useState(false);
  const [isSuccess,          setIsSuccess]          = useState(false);
  const [submitError,        setSubmitError]        = useState("");
  const [toast,              setToast]              = useState(null);
  const [confirmDelete,      setConfirmDelete]      = useState(null);

  // Read email fresh every render — sessionStorage first, localStorage as refresh fallback
  const getUserEmail = () => {
    const fromSession = sessionStorage.getItem("userEmail");
    const fromLocal   = localStorage.getItem("userEmail");
    const email       = (fromSession || fromLocal || "").trim().toLowerCase();
    if (!fromSession && fromLocal) {
      sessionStorage.setItem("userEmail", fromLocal);
      sessionStorage.setItem("userName",  localStorage.getItem("userName")  || "");
      sessionStorage.setItem("role",      localStorage.getItem("role")       || "user");
    }
    return email;
  };

  const userEmail = getUserEmail();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch orders strictly filtered by the logged-in user's email ──────────
  const fetchRentals = useCallback(async () => {
    setLoading(true);
    setRentals([]);                   // clear stale data from previous user immediately

    const email = getUserEmail();     // read fresh — not from closure

    if (!email) {
      setLoading(false);
      showToast("Please log in to view your orders.", "error");
      return;
    }

    try {
      // Send email as query param so the backend can filter
      const res  = await axios.get(`${API}/api/admin/orders`, {
        params: { userEmail: email },
      });

      const data = Array.isArray(res.data) ? res.data : [];

      // Double-filter on frontend as a safety net — ensures no cross-user data leaks
      // even if the backend returns unfiltered results
      const mine = data.filter(
        (o) => (o.userEmail || "").toLowerCase().trim() === email.toLowerCase().trim()
      );

      const mapped = mine
        .map((o, idx) => ({
          ...o,
          orderId:        o._id        || o.orderId   || `order-${idx}`,
          name:           o.productName || "Unknown Product",
          image:          o.productImage || "",
          startDate:      fmtDate(o.createdAt),
          pauseStatus:    o.pauseStatus    || "Active",
          approvalStatus: o.approvalStatus || "Pending",
          price:          Number(o.price)       || 0,
          tenure:         Number(o.tenure)      || 1,
          totalAmount:    Number(o.totalAmount) || 0,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRentals(mapped);
    } catch (err) {
      console.error("fetchRentals error:", err);
      showToast("Failed to load orders. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch whenever the logged-in user changes (email key changes) ──────
  useEffect(() => {
    fetchRentals();
  }, [fetchRentals, userEmail]);   // userEmail in deps → re-runs on user switch

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const handleTogglePause = async (orderId) => {
    const rental = rentals.find((r) => r.orderId === orderId);
    if (!rental) return;
    if (rental.approvalStatus !== "Delivered") {
      showToast("You can only pause active delivered subscriptions.", "error");
      return;
    }
    const next = rental.pauseStatus === "Paused" ? "Active" : "Paused";
    setRentals((prev) => prev.map((r) => r.orderId === orderId ? { ...r, pauseStatus: next } : r));
    if (selectedRental?.orderId === orderId) setSelectedRental((p) => ({ ...p, pauseStatus: next }));
    try {
      await axios.patch(`${API}/api/admin/orders/${orderId}/pause`, { pauseStatus: next });
      showToast(`Subscription ${next === "Paused" ? "paused" : "resumed"} successfully.`);
    } catch (err) {
      console.error("togglePause error:", err);
      setRentals((prev) => prev.map((r) => r.orderId === orderId ? { ...r, pauseStatus: rental.pauseStatus } : r));
      if (selectedRental?.orderId === orderId) setSelectedRental((p) => ({ ...p, pauseStatus: rental.pauseStatus }));
      showToast("Failed to update status. Please try again.", "error");
    }
  };

  // ── Delete / Terminate ────────────────────────────────────────────────────
  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`${API}/api/admin/orders/${orderId}`, {
        data: { message: "User terminated subscription." },
      });
      setRentals((prev) => prev.filter((r) => r.orderId !== orderId));
      setSelectedRental(null);
      setConfirmDelete(null);
      showToast("Order terminated successfully.");
    } catch (err) {
      console.error("delete error:", err);
      showToast("Failed to terminate. Please try again.", "error");
    }
  };

  // ── Request Submit ────────────────────────────────────────────────────────
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const email = getUserEmail() || selectedRental?.userEmail || "";
    if (!email)                          { setSubmitError("User email not found. Please log in again."); return; }
    if (!requestForm.title.trim())       { setSubmitError("Please enter an issue title."); return; }
    if (!requestForm.description.trim()) { setSubmitError("Please describe the problem in detail."); return; }
    if (!requestForm.visitDate)          { setSubmitError("Please select a preferred date."); return; }
    if (new Date(requestForm.visitDate) < new Date(new Date().toDateString())) {
      setSubmitError("Please select today or a future date.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/api/maintenance`, {
        orderId:     selectedRental.orderId,
        productName: selectedRental.name,
        userEmail:   email,
        issueTitle:  requestForm.title.trim(),
        description: requestForm.description.trim(),
        visitDate:   requestForm.visitDate,
        requestType,
        status:      "Pending",
      });
      setIsSuccess(true);
      setRequestForm({ title: "", description: "", visitDate: "" });
      setTimeout(() => { setIsSuccess(false); setShowRequestModal(false); }, 2800);
    } catch (err) {
      console.error("requestSubmit error:", err);
      setSubmitError(err?.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRequestModal = () => {
    setSubmitError("");
    setIsSuccess(false);
    setRequestType("Maintenance");
    setRequestForm({ title: "", description: "", visitDate: "" });
    setShowRequestModal(true);
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const activeCount   = rentals.filter((r) => r.approvalStatus === "Delivered" && r.pauseStatus === "Active").length;
  const pendingCount  = rentals.filter((r) => r.approvalStatus === "Pending").length;
  const pausedCount   = rentals.filter((r) => r.pauseStatus === "Paused").length;
  const totalMonthly  = rentals.filter((r) => r.approvalStatus === "Delivered" && r.pauseStatus === "Active").reduce((a, b) => a + b.price, 0);
  const totalInvested = rentals.reduce((a, b) => a + b.price * b.tenure, 0);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = rentals.filter((item) => {
    const matchSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.orderId).toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === "All"      ? true :
      filterTab === "Paused"   ? item.pauseStatus === "Paused" :
      item.approvalStatus === filterTab;
    return matchSearch && matchTab;
  });

  const selectedTypeConfig = REQUEST_TYPES.find((t) => t.key === requestType);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
        className="w-10 h-10 rounded-full border-[3px] border-violet-100 border-t-[#560BAD]"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
      >
        Loading your orders...
      </motion.p>
    </div>
  );

  // ── No email / not logged in ──────────────────────────────────────────────
  if (!userEmail) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50/20 p-6">
      <div className="w-16 h-16 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center mb-5">
        <AlertCircle size={28} className="text-[#560BAD]" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Session Expired</h2>
      <p className="text-slate-400 text-[13px] text-center mb-1">Your session was not found. Please log in again.</p>
      <p className="text-slate-300 text-[10px] text-center mb-6 font-mono">Tip: close this tab and log in fresh — sessionStorage resets on tab close.</p>
      <button
        onClick={() => window.location.href = "/register"}
        className="px-7 py-3 bg-[#560BAD] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200/50"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 antialiased">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-[12px] font-bold flex items-center gap-2.5 border backdrop-blur-sm max-w-xs ${
              toast.type === "error"
                ? "bg-white/95 text-red-600 border-red-100"
                : "bg-white/95 text-emerald-600 border-emerald-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${toast.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-28">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.div variants={fadeUp}>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 hover:text-[#560BAD] transition-colors mb-6 bg-transparent border-none cursor-pointer"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <Activity size={9} /> {activeCount} Active
                </span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                    <Clock size={9} /> {pendingCount} Pending
                  </span>
                )}
                {pausedCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <Pause size={9} /> {pausedCount} Paused
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                My <span className="font-light italic text-slate-400">Orders</span>
              </h1>
              <p className="mt-2 text-[11px] text-violet-500 font-semibold">{userEmail}</p>
              <p className="mt-0.5 text-[10px] text-slate-400 font-medium">
                Showing orders for this account only &mdash; active products appear after admin marks them Delivered
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Monthly Spend",  value: `₹${fmt(totalMonthly)}`,   sub: "active plans",   icon: TrendingUp, color: "text-[#560BAD]",  bg: "bg-violet-50",  border: "border-violet-100"  },
                { label: "Active Plans",   value: activeCount,                sub: "delivered",      icon: Zap,        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "Total Orders",   value: rentals.length,             sub: "all time",       icon: Package,    color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100"     },
                { label: "Total Invested", value: `₹${fmt(totalInvested)}`,   sub: "lifetime value", icon: BarChart2,  color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-100"  },
              ].map(({ label, value, sub, icon: Icon, color, bg, border }, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className={`${bg} ${border} border rounded-2xl px-4 py-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
                    <Icon size={13} className={color} />
                  </div>
                  <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Search + Refresh ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium focus:ring-2 focus:ring-violet-100 focus:border-violet-300 outline-none transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={fetchRentals}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#560BAD] hover:border-violet-200 transition-all shadow-sm flex-shrink-0"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </motion.div>

        {/* ── Filter Tabs ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm gap-1 mb-8 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                filterTab === tab
                  ? "bg-[#560BAD] text-white shadow-md shadow-violet-300/40"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab}
              {tab === "Pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-[7px] font-black rounded-full px-1.5 py-0.5">{pendingCount}</span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Empty State ───────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-violet-200">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <Layers size={44} className="text-violet-200" />
            </motion.div>
            <p className="mt-4 text-slate-600 font-semibold text-[14px]">
              {rentals.length === 0 ? "No orders yet." : "No orders match your filter."}
            </p>
            <p className="text-slate-400 text-[11px] mt-1 text-center max-w-xs leading-relaxed">
              {rentals.length === 0
                ? "Once you place an order it will appear here immediately. Active products show after admin marks them Delivered."
                : "Try selecting a different filter or clearing your search."}
            </p>
            {rentals.length === 0 && (
              <button
                onClick={() => window.location.href = "/products"}
                className="mt-5 px-6 py-3 bg-[#560BAD] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200/50"
              >
                Browse Products
              </button>
            )}
          </motion.div>
        ) : (

        /* ── Cards Grid ─────────────────────────────────────────────────── */
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.orderId}
                  layout
                  variants={fadeUp}
                  exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.2 } }}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-violet-100/40 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-50 to-slate-100">
                    <img
                      src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=ede9fe&color=7c3aed&size=400&bold=true`}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=ede9fe&color=7c3aed&size=400&bold=true`; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                    <div className="absolute top-3.5 left-3.5">
                      <StatusBadge approvalStatus={item.approvalStatus} pauseStatus={item.pauseStatus} />
                    </div>

                    <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/60">
                      <p className="text-[11px] font-black text-[#560BAD]">₹{fmt(item.price)}<span className="text-slate-400 font-medium text-[9px]">/mo</span></p>
                    </div>

                    {(item.deliveryDate || item.pickupDate) && (
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex gap-1.5 flex-wrap">
                        {item.deliveryDate && (
                          <span className="flex items-center gap-1 bg-indigo-50/90 backdrop-blur-sm border border-indigo-200 px-2 py-1 rounded-xl text-[8px] font-bold text-indigo-700">
                            <Truck size={8} /> {fmtDate(item.deliveryDate)}
                          </span>
                        )}
                        {item.pickupDate && (
                          <span className="flex items-center gap-1 bg-amber-50/90 backdrop-blur-sm border border-amber-200 px-2 py-1 rounded-xl text-[8px] font-bold text-amber-700">
                            <CalendarDays size={8} /> Pickup {fmtDate(item.pickupDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1 mr-3">
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate tracking-tight">{item.name}</h3>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5 font-mono">#{String(item.orderId).slice(-8)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} size={8} fill="#f59e0b" color="#f59e0b" />)}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">4.8</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Ordered</p>
                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                          <CalendarDays size={9} className="text-[#560BAD] flex-shrink-0" />{item.startDate}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Tenure</p>
                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                          <Clock size={9} className="text-[#560BAD] flex-shrink-0" />{item.tenure} months
                        </p>
                      </div>
                    </div>

                    {item.approvalStatus === "Pending" && (
                      <div className="mb-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <Clock size={10} className="text-amber-500 flex-shrink-0" />
                        <p className="text-[9px] text-amber-700 font-semibold leading-tight">Awaiting admin approval &amp; delivery scheduling.</p>
                      </div>
                    )}

                    {item.serviceArea && (
                      <div className="flex items-center gap-1.5 mb-3 py-1.5 px-2.5 bg-violet-50 rounded-xl border border-violet-100">
                        <MapPin size={9} className="text-violet-500 flex-shrink-0" />
                        <p className="text-[9px] font-semibold text-violet-700 truncate">{item.serviceArea}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {item.approvalStatus === "Delivered" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleTogglePause(item.orderId)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all"
                        >
                          {item.pauseStatus === "Paused" ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedRental(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide bg-[#560BAD] text-white shadow-sm shadow-violet-300/40 hover:bg-violet-700 transition-all"
                      >
                        <ChevronRight size={11} /> View Details
                      </motion.button>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-400 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedRental && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRental(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden border border-slate-100 max-h-[92vh] overflow-y-auto"
            >
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedRental(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </motion.button>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 h-52 md:h-auto bg-gradient-to-br from-violet-50 to-slate-100 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={selectedRental.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRental.name)}&background=ede9fe&color=7c3aed&size=400&bold=true`}
                    alt={selectedRental.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRental.name)}&background=ede9fe&color=7c3aed&size=400&bold=true`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <StatusBadge approvalStatus={selectedRental.approvalStatus} pauseStatus={selectedRental.pauseStatus} />
                  </div>
                </div>

                <div className="md:w-3/5 p-7">
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight pr-8">{selectedRental.name}</h2>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 mt-1 font-mono">#{String(selectedRental.orderId).slice(-8)}</p>

                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      { label: "Order Date",   val: selectedRental.startDate },
                      { label: "Monthly Rent", val: `₹${fmt(selectedRental.price)}` },
                      { label: "Tenure",       val: `${selectedRental.tenure} months` },
                      { label: "Total Amount", val: `₹${fmt(selectedRental.totalAmount || selectedRental.price * selectedRental.tenure)}` },
                      { label: "Payment",      val: selectedRental.paymentMethod || "N/A" },
                      { label: "Coupon",       val: selectedRental.couponApplied || "None" },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1">{label}</p>
                        <p className="text-[11px] font-semibold text-slate-700">{val}</p>
                      </div>
                    ))}
                  </div>

                  {selectedRental.approvalStatus === "Pending" && (
                    <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2.5">
                      <Clock size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-0.5">Order Under Review</p>
                        <p className="text-[10px] text-amber-600 leading-relaxed">Payment confirmed. Our team is reviewing and will schedule delivery shortly.</p>
                      </div>
                    </div>
                  )}

                  {(selectedRental.deliveryDate || selectedRental.pickupDate) && (
                    <div className="flex gap-2.5 mb-4">
                      {selectedRental.deliveryDate && (
                        <div className="flex-1 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Truck size={9} className="text-indigo-500" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Delivery</p>
                          </div>
                          <p className="text-[11px] font-semibold text-indigo-800">{fmtDate(selectedRental.deliveryDate)}</p>
                          {selectedRental.deliverySlot && <p className="text-[10px] text-indigo-500 mt-0.5">{selectedRental.deliverySlot}</p>}
                        </div>
                      )}
                      {selectedRental.pickupDate && (
                        <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CalendarDays size={9} className="text-amber-600" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-amber-600">Pickup</p>
                          </div>
                          <p className="text-[11px] font-semibold text-amber-800">{fmtDate(selectedRental.pickupDate)}</p>
                          {selectedRental.pickupSlot && <p className="text-[10px] text-amber-500 mt-0.5">{selectedRental.pickupSlot}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRental.address && (
                    <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Delivery Address</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{selectedRental.address}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedRental.approvalStatus === "Delivered" && (
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={openRequestModal}
                        className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-all border border-amber-100"
                      >
                        <Wrench size={13} /> Request Service / Raise Issue
                      </motion.button>
                    )}
                    {selectedRental.approvalStatus === "Delivered" && (
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleTogglePause(selectedRental.orderId)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-100"
                      >
                        {selectedRental.pauseStatus === "Paused"
                          ? <><Play size={13} /> Resume Subscription</>
                          : <><Pause size={13} /> Pause Subscription</>}
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmDelete(selectedRental.orderId)}
                      className="w-full py-3 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                    >
                      Cancel / Terminate Order
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative p-7 border border-slate-100"
            >
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h3 className="text-[17px] font-semibold text-slate-900 text-center mb-2">Terminate Order?</h3>
              <p className="text-[12px] text-slate-500 text-center mb-6 leading-relaxed">
                This will permanently remove the order from your account. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-100">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg shadow-red-200/50">
                  Terminate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Request Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowRequestModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative p-7 border border-slate-100 max-h-[92vh] overflow-y-auto"
            >
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => !isSubmitting && setShowRequestModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </motion.button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-900">Request Submitted!</h3>
                    <p className="text-slate-400 text-[12px] mt-2 text-center leading-relaxed">Our team will review and contact you shortly to schedule.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-5">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-8 h-8 ${selectedTypeConfig?.bg || "bg-amber-50"} border ${selectedTypeConfig?.border || "border-amber-100"} rounded-xl flex items-center justify-center`}>
                          {selectedTypeConfig && <selectedTypeConfig.icon size={15} className={selectedTypeConfig.color} />}
                        </div>
                        <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">
                          Raise <span className="text-slate-400 font-light italic">Request</span>
                        </h2>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium ml-10">{selectedRental?.name}</p>
                    </div>

                    <div className="mb-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] block mb-2">Request Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {REQUEST_TYPES.map(({ key, icon: Icon, label, color, bg, border, desc }) => (
                          <motion.button key={key} type="button" whileTap={{ scale: 0.97 }} onClick={() => setRequestType(key)}
                            className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                              requestType === key ? `${bg} ${border} shadow-sm` : "bg-slate-50 border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${requestType === key ? bg : "bg-white"} border ${border}`}>
                              <Icon size={12} className={requestType === key ? color : "text-slate-400"} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[10px] font-black uppercase tracking-wide ${requestType === key ? color : "text-slate-500"}`}>{label}</p>
                              <p className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{desc}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {submitError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mb-4 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-2.5">
                          <AlertCircle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-red-600 font-semibold">{submitError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] block mb-1.5">Issue Title</label>
                        <input required placeholder="e.g. Screen flickering, Motor noise, Billing issue"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#560BAD] focus:ring-2 focus:ring-violet-100 focus:bg-white rounded-2xl px-4 py-3 text-[13px] outline-none transition-all"
                          value={requestForm.title}
                          onChange={(e) => setRequestForm((p) => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] block mb-1.5">Description</label>
                        <textarea required placeholder="Describe the issue in detail..." rows={3}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#560BAD] focus:ring-2 focus:ring-violet-100 focus:bg-white rounded-2xl px-4 py-3 text-[13px] resize-none outline-none transition-all"
                          value={requestForm.description}
                          onChange={(e) => setRequestForm((p) => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] block mb-1.5">
                          {requestType === "Maintenance" ? "Preferred Visit Date" : requestType === "Return" ? "Preferred Pickup Date" : "Preferred Contact Date"}
                        </label>
                        <input required type="date" min={new Date().toISOString().split("T")[0]}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#560BAD] focus:ring-2 focus:ring-violet-100 focus:bg-white rounded-2xl px-4 py-3 text-[13px] outline-none transition-all"
                          value={requestForm.visitDate}
                          onChange={(e) => setRequestForm((p) => ({ ...p, visitDate: e.target.value }))}
                        />
                      </div>

                      {(requestType === "Damage" || requestType === "Return") && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className={`rounded-2xl p-3.5 border text-[11px] leading-relaxed ${
                            requestType === "Damage" ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                          }`}
                        >
                          {requestType === "Damage"
                            ? "Our team will assess the damage and advise if any charges apply based on the damage policy."
                            : "We will arrange pickup from your registered address. Ensure the product is securely packed before the pickup date."}
                        </motion.div>
                      )}

                      <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                        disabled={isSubmitting} type="submit"
                        className={`w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md mt-1 text-white ${
                          requestType === "Damage"  ? "bg-red-500 hover:bg-red-600 shadow-red-300/40" :
                          requestType === "Return"  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-300/40" :
                          requestType === "Dispute" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-300/40" :
                          "bg-[#560BAD] hover:bg-violet-700 shadow-violet-300/40"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            Submitting...
                          </>
                        ) : (
                          <><Send size={13} /> Submit {selectedTypeConfig?.label || "Request"}</>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}