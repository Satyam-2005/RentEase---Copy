import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  Package, Trash2, CheckCircle2, Clock, Search, X,
  ChevronRight, RefreshCcw, AlertCircle, ShieldCheck, Mail,
  IndianRupee, MapPin, Calendar, Truck, XCircle, Eye, Download,
  Phone, ChevronDown, Activity, TrendingUp, BarChart3,
  Bell, Filter, ArrowDown, ArrowUp, Send, Clock3
} from "lucide-react";

const API = "http://127.0.0.1:5000";
const POLL_INTERVAL = 8000;

const STATUS = {
  Pending:   { dot: "#f59e0b", pill: "bg-amber-50 text-amber-700 border-amber-200",       ring: "ring-amber-200",   label: "Pending",   icon: Clock,        track: "bg-amber-400"   },
  Approved:  { dot: "#6366f1", pill: "bg-indigo-50 text-indigo-700 border-indigo-200",    ring: "ring-indigo-200",  label: "Approved",  icon: CheckCircle2, track: "bg-indigo-500"  },
  Delivered: { dot: "#10b981", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-200", label: "Delivered", icon: Truck,        track: "bg-emerald-500" },
  Cancelled: { dot: "#ef4444", pill: "bg-red-50 text-red-700 border-red-200",             ring: "ring-red-200",     label: "Cancelled", icon: XCircle,      track: "bg-red-400"     },
};

const PRESETS = [
  "Item currently out of stock.",
  "Payment verification failed.",
  "Delivery unavailable in your area.",
  "Product requires maintenance.",
  "Order details could not be verified.",
];

const fmt     = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN",  { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN",  { hour: "2-digit", minute: "2-digit" });

/* ── animated counter ── */
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(target * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

const AnimatedNum = ({ value, prefix = "" }) => {
  const v = useCountUp(typeof value === "number" ? value : 0);
  return <span>{prefix}{fmt(v)}</span>;
};

const Pulse = ({ color = "bg-emerald-400" }) => (
  <span className="relative flex h-2.5 w-2.5">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
  </span>
);

const MiniSparkline = ({ data = [], color = "#6366f1" }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 64, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Toast = ({ toasts }) => (
  <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-500 flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit   ={{ opacity: 0, y: -12, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-[12px] font-bold border bg-white/95 backdrop-blur-sm ${
            t.type === "error"   ? "text-red-600 border-red-100"      :
            t.type === "info"    ? "text-indigo-600 border-indigo-100" :
            t.type === "warning" ? "text-amber-600 border-amber-100"  :
            "text-emerald-600 border-emerald-100"
          }`}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            t.type === "error" ? "bg-red-400" : t.type === "info" ? "bg-indigo-400" : t.type === "warning" ? "bg-amber-400" : "bg-emerald-400"
          }`} />
          {t.msg}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, accentColor, accentBg, sub, spark, delay = 0 }) => {
  const sparkColor =
    accentColor.includes("indigo")  ? "#6366f1" :
    accentColor.includes("amber")   ? "#f59e0b" :
    accentColor.includes("emerald") ? "#10b981" : "#8b5cf6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 sm:p-2.5 rounded-xl ${accentBg}`}>
          <Icon size={16} className={accentColor} />
        </div>
        <MiniSparkline data={spark} color={sparkColor} />
      </div>
      <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
        <AnimatedNum value={typeof value === "number" ? value : 0} />
      </p>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
};

const OrderRow = ({ order, selected, onClick }) => {
  const sc = STATUS[order.approvalStatus] || STATUS.Pending;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8  }}
      animate={{ opacity: 1, y: 0  }}
      exit   ={{ opacity: 0, scale: 0.97 }}
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
        selected
          ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200"
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={order.productImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.productName || "P")}&background=f1f5f9&color=64748b&size=64&bold=true`}
          alt=""
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-100"
        />
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: sc.dot }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${selected ? "bg-white/10 text-white/70 border-white/10" : sc.pill}`}>
            {sc.label}
          </span>
          {order.approvalStatus === "Pending" && (
            <span className="hidden sm:inline text-[9px] font-black text-red-500 animate-pulse">● Action needed</span>
          )}
        </div>
        <p className={`font-bold text-[13px] truncate leading-tight ${selected ? "text-white" : "text-slate-800"}`}>
          {order.productName || "Unnamed Product"}
        </p>
        <p className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${selected ? "text-white/50" : "text-slate-400"}`}>
          {order.userEmail}
        </p>
      </div>

      <div className={`flex flex-col items-end gap-1 shrink-0 ${selected ? "text-white" : ""}`}>
        <p className="text-[12px] sm:text-[13px] font-black">₹{fmt(order.totalAmount)}</p>
        <p className={`text-[9px] sm:text-[10px] ${selected ? "text-white/40" : "text-slate-400"}`}>{fmtDate(order.createdAt)}</p>
        <ChevronRight size={12} className={`mt-0.5 ${selected ? "text-white/30" : "text-slate-300"}`} />
      </div>
    </motion.div>
  );
};

const DetailPane = ({ order, onClose, onStatus, onCancel, actionLoading, isMobile }) => {
  const _sc      = STATUS[order.approvalStatus] || STATUS.Pending;
  const steps   = ["Pending", "Approved", "Delivered"];
  const stepIdx = steps.indexOf(order.approvalStatus);

  const content = (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* header */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Order Detail</p>
            <p className="text-white font-mono text-xs sm:text-sm font-bold opacity-60">#{order._id?.slice(-10).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={order.productImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.productName || "P")}&background=1e293b&color=94a3b8&size=80&bold=true`}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-white/10 shrink-0"
            alt=""
          />
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm sm:text-base truncate leading-tight">{order.productName}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">₹{fmt(order.price)}/mo × {order.tenure} months</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{fmt(order.totalAmount)}</p>
          </div>
        </div>

        {order.approvalStatus !== "Cancelled" && (
          <div className="mt-4 sm:mt-5">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const done = i <= stepIdx;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                        done ? "bg-white border-white text-slate-900" : "bg-transparent border-white/20 text-white/30"
                      }`}>
                        {done ? <CheckCircle2 size={13} className="text-slate-900" /> : i + 1}
                      </div>
                      <p className={`text-[8px] font-bold mt-1 uppercase tracking-widest ${done ? "text-white/80" : "text-white/20"}`}>{step}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-2 ${i < stepIdx ? "bg-white/40" : "bg-white/10"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-4 sm:p-6 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: Mail,     label: "Email",   val: order.userEmail          },
            { icon: Phone,    label: "Phone",   val: order.phone || "—"       },
            { icon: Calendar, label: "Ordered", val: fmtDate(order.createdAt) },
            { icon: Clock3,   label: "Time",    val: fmtTime(order.createdAt) },
            // eslint-disable-next-line no-unused-vars
          ].map(({ icon: I, label, val }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <I size={10} className="text-slate-400" />
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 truncate">{val}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={10} className="text-slate-400" />
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Delivery Address</p>
          </div>
          <p className="text-[12px] font-medium text-slate-700 leading-relaxed">{order.address || "—"}</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <IndianRupee size={10} className="text-slate-400" />
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Payment</p>
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
            {order.paymentMethod || "ONLINE"} ✓
          </span>
        </div>

        {order.deliveryDate && (
          <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Truck size={10} className="text-indigo-500" />
              <p className="text-[8px] font-black uppercase tracking-widest text-indigo-500">Delivery Schedule</p>
            </div>
            <p className="text-[12px] font-semibold text-indigo-800">
              {new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              {order.deliverySlot && <span className="ml-2 text-indigo-500">· {order.deliverySlot}</span>}
            </p>
          </div>
        )}

        {order.pickupDate && (
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={10} className="text-amber-600" />
              <p className="text-[8px] font-black uppercase tracking-widest text-amber-600">Pickup Schedule</p>
            </div>
            <p className="text-[12px] font-semibold text-amber-800">
              {new Date(order.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              {order.pickupSlot && <span className="ml-2 text-amber-500">· {order.pickupSlot}</span>}
            </p>
          </div>
        )}

        {order.serviceArea && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="text-slate-400" />
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Service Area</p>
            </div>
            <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">{order.serviceArea}</span>
          </div>
        )}

        {/* action buttons */}
        <div className="space-y-2 pt-1">
          {order.approvalStatus === "Pending" && (
            <button
              disabled={actionLoading}
              onClick={() => onStatus(order._id, "Approved")}
              className="w-full h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <RefreshCcw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Approve &amp; Notify
            </button>
          )}
          {order.approvalStatus === "Approved" && (
            <button
              disabled={actionLoading}
              onClick={() => onStatus(order._id, "Delivered")}
              className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <RefreshCcw size={13} className="animate-spin" /> : <Truck size={13} />}
              Mark Delivered
            </button>
          )}
          {order.approvalStatus === "Delivered" && (
            <div className="w-full h-11 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] border border-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 size={13} /> Delivered Successfully
            </div>
          )}
          {order.approvalStatus === "Cancelled" && (
            <div className="w-full h-11 bg-red-50 text-red-500 rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] border border-red-100 flex items-center justify-center gap-2">
              <XCircle size={13} /> Order Cancelled
            </div>
          )}
          {order.approvalStatus !== "Cancelled" && order.approvalStatus !== "Delivered" && (
            <button
              onClick={() => onCancel(order)}
              className="w-full h-11 bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all border border-red-100 hover:border-red-200 flex items-center justify-center gap-2"
            >
              <Trash2 size={13} /> Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-300 flex items-end justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit  ={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl"
          >
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      key={order._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0  }}
      exit   ={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-24"
    >
      {content}
    </motion.div>
  );
};

const CancelModal = ({ modal, onClose, onConfirm, loading }) => (
  <AnimatePresence>
    {modal.show && (
      <div className="fixed inset-0 z-400 flex items-end sm:items-center justify-center p-0 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
        />
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0       }}
          exit   ={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto"
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center mb-3 border border-red-100">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Cancel Order?</h3>
              <p className="text-[12px] text-slate-400 mt-1">
                This will notify <span className="font-semibold text-slate-600">{modal.userEmail}</span>
              </p>
            </div>
            <button onClick={() => !loading && onClose()} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
              <X size={14} className="text-slate-500" />
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 mb-4 border border-slate-100 flex items-center gap-3">
            <Package size={13} className="text-slate-400 shrink-0" />
            <span className="text-[12px] font-semibold text-slate-600 truncate">{modal.productName}</span>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Presets</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => modal.setMessage(p)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                  modal.message === p ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >{p}</button>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason</label>
              <span className="text-[10px] text-slate-300 font-semibold">{modal.message.length}/300</span>
            </div>
            <textarea
              maxLength={300}
              placeholder="Describe why this order is being cancelled..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-300 focus:bg-white rounded-2xl px-4 py-3 text-[13px] outline-none resize-none min-h-20 transition-all"
              value={modal.message}
              onChange={(e) => modal.setMessage(e.target.value)}
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-4 flex items-start gap-2.5">
            <Bell size={12} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">A cancellation email will be sent immediately to the user.</p>
          </div>

          <div className="flex gap-2.5">
            <button
              disabled={loading}
              onClick={onClose}
              className="flex-1 h-11 text-slate-400 hover:text-slate-600 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50"
            >Keep Order</button>
            <button
              disabled={loading || !modal.message.trim()}
              onClick={onConfirm}
              className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCcw size={13} className="animate-spin" /> : <Send size={13} />}
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function AdminOrders() {
  const [orders,         setOrders]         = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [search,         setSearch]          = useState("");
  const [tab,            setTab]             = useState("all");
  const [selected,       setSelected]        = useState(null);
  const [sort,           setSort]            = useState("newest");
  const [showSort,       setShowSort]        = useState(false);
  const [actionLoading,  setActionLoading]   = useState(false);
  const [deleteLoading,  setDeleteLoading]   = useState(false);
  const [toasts,         setToasts]          = useState([]);
  const [online,         setOnline]          = useState(true);
  const [lastSync,       setLastSync]        = useState(null);
  const [newOrderIds,    setNewOrderIds]     = useState(new Set());
  const [cancelMsg,      setCancelMsg]       = useState("");
  const [cancelModal,    setCancelModal]     = useState({ show: false, orderId: null, userEmail: "", productName: "" });
  const [isMobile,       setIsMobile]        = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const pollingRef    = useRef(null);
  const prevOrderIds  = useRef(new Set());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res      = await axios.get(`${API}/api/admin/orders`);
      const incoming = res.data;
      const incomingIds = new Set(incoming.map(o => o._id));
      const fresh    = incoming.filter(o => !prevOrderIds.current.has(o._id));
      if (prevOrderIds.current.size > 0 && fresh.length > 0) {
        setNewOrderIds(new Set(fresh.map(o => o._id)));
        toast(`${fresh.length} new order${fresh.length > 1 ? "s" : ""} arrived`, "info");
        setTimeout(() => setNewOrderIds(new Set()), 6000);
      }
      prevOrderIds.current = incomingIds;
      setOrders(incoming);
      setLastSync(new Date());
      setOnline(true);
    } catch {
      setOnline(false);
      if (!silent) toast("Failed to connect to server.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
    pollingRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.patch(`${API}/api/admin/orders/${orderId}/status`, { approvalStatus: newStatus });
      setOrders(p  => p.map(o  => o._id  === orderId ? { ...o,  approvalStatus: newStatus } : o));
      setSelected(p => p?._id === orderId ? { ...p, approvalStatus: newStatus } : p);
      toast({ Approved: "Order approved — user notified.", Delivered: "Marked as delivered." }[newStatus] || "Status updated.");
    } catch {
      toast("Failed to update status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelMsg.trim()) { toast("Please add a cancellation reason.", "warning"); return; }
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/api/admin/orders/${cancelModal.orderId}`, { data: { message: cancelMsg } });
      setOrders(p  => p.map(o  => o._id  === cancelModal.orderId ? { ...o,  approvalStatus: "Cancelled" } : o));
      setSelected(p => p?._id === cancelModal.orderId ? { ...p, approvalStatus: "Cancelled" } : p);
      setCancelModal({ show: false, orderId: null, userEmail: "", productName: "" });
      setCancelMsg("");
      toast("Order cancelled — email sent to user.");
    } catch (err) {
      toast(err?.response?.data?.error || "Cancellation failed.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCancel = (order) => {
    setCancelMsg("");
    setCancelModal({ show: true, orderId: order._id, userEmail: order.userEmail, productName: order.productName });
  };

  const exportCSV = () => {
    const rows = [["ID", "Product", "Email", "Phone", "Amount", "Tenure", "Status", "Date"]];
    sortedFiltered.forEach(o => rows.push([o._id, o.productName, o.userEmail, o.phone || "", o.totalAmount, o.tenure, o.approvalStatus, fmtDate(o.createdAt)]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `orders_${Date.now()}.csv` });
    a.click();
    toast("CSV exported.", "info");
  };

  const stats = useMemo(() => {
    const pending   = orders.filter(o => o.approvalStatus === "Pending").length;
    const delivered = orders.filter(o => o.approvalStatus === "Delivered").length;
    const revenue   = orders.filter(o => o.approvalStatus !== "Cancelled").reduce((a, c) => a + (c.totalAmount || 0), 0);
    return { total: orders.length, pending, delivered, revenue };
  }, [orders]);

  const sortedFiltered = useMemo(() => {
    const q = search.toLowerCase();
    const r = orders.filter(o => {
      const matchS = !q || o.userEmail?.toLowerCase().includes(q) || o.productName?.toLowerCase().includes(q) || o._id?.includes(q);
      const matchT = tab === "all" || o.approvalStatus === tab;
      return matchS && matchT;
    });
    const sorters = {
      newest:  (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest:  (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      highest: (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0),
      lowest:  (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    };
    return [...r].sort(sorters[sort] || sorters.newest);
  }, [orders, search, tab, sort]);

  const TABS = useMemo(() =>
    ["all", "Pending", "Approved", "Delivered", "Cancelled"].map(t => ({
      key: t, label: t === "all" ? "All" : t,
      count: t === "all" ? orders.length : orders.filter(o => o.approvalStatus === t).length,
    })),
  [orders]);

  const SORT_OPTS = [
    { key: "newest",  label: "Newest First",   icon: ArrowDown  },
    { key: "oldest",  label: "Oldest First",   icon: ArrowUp    },
    { key: "highest", label: "Highest Amount", icon: TrendingUp },
    { key: "lowest",  label: "Lowest Amount",  icon: BarChart3  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased pb-10">
      <Toast toasts={toasts} />
      <CancelModal
        modal={{ ...cancelModal, message: cancelMsg, setMessage: setCancelMsg }}
        onClose={() => setCancelModal({ show: false, orderId: null, userEmail: "", productName: "" })}
        onConfirm={confirmCancel}
        loading={deleteLoading}
      />

      <div className="max-w-350 mx-auto px-4 sm:px-6 md:px-10 pt-20 sm:pt-24 md:pt-28">

        {/* page header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">RentEase Admin</span>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                <Pulse color={online ? "bg-emerald-400" : "bg-red-400"} />
                <span className="text-[10px] font-semibold text-slate-500">{online ? "Live" : "Offline"}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-[2rem] font-black text-slate-900 tracking-tight leading-none">Order Pipeline</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {orders.length} orders
              {stats.pending > 0 && <> · <span className="text-amber-500 font-semibold">{stats.pending} need review</span></>}
              {lastSync      && <> · <span className="text-slate-300">synced {fmtTime(lastSync)}</span></>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={12} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={() => fetchOrders()} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <RefreshCcw size={12} className={loading ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Total Orders" value={stats.total}     icon={Package}     accentColor="text-indigo-600"  accentBg="bg-indigo-50"  sub={`${stats.pending} pending`} spark={[3,7,5,9,6,12,8,stats.total]}     delay={0}    />
          <StatCard label="Pending"      value={stats.pending}   icon={Clock}       accentColor="text-amber-600"   accentBg="bg-amber-50"   sub="Need review"              spark={[2,4,3,6,5,8,7,stats.pending]}   delay={0.06} />
          <StatCard label="Delivered"    value={stats.delivered} icon={Truck}       accentColor="text-emerald-600" accentBg="bg-emerald-50" sub="Active rentals"            spark={[1,3,5,4,7,6,9,stats.delivered]} delay={0.12} />
          <StatCard label="Revenue"      value={stats.revenue}   icon={IndianRupee} accentColor="text-violet-600"  accentBg="bg-violet-50"  sub="Excl. cancelled"           spark={[1000,2000,1500,3000,2500,stats.revenue]} delay={0.18} />
        </div>

        {/* filter bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl sm:rounded-2xl border border-slate-100 w-max sm:w-auto">
                {TABS.map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      tab === key ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab === key ? "bg-white/20" : "bg-slate-200 text-slate-500"}`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0"
            >
              <Search size={14} className="text-slate-500" />
            </button>

            <div className="relative hidden lg:block flex-1 min-w-50">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, emails..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={13} /></button>}
            </div>

            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all whitespace-nowrap"
              >
                <Filter size={12} />
                Sort
                <ChevronDown size={10} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 6,  scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit   ={{ opacity: 0, y: 6,  scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden w-44"
                  >
                    {/* eslint-disable-next-line no-unused-vars */}
                    {SORT_OPTS.map(({ key, label, icon: I }) => (
                      <button key={key} onClick={() => { setSort(key); setShowSort(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-semibold hover:bg-slate-50 transition-colors ${sort === key ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}>
                        <I size={12} className="opacity-50" />{label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* mobile search dropdown */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden">
                <div className="pt-2 flex gap-2">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"><X size={13} /></button>}
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowSort(!showSort)} className="h-full px-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <Filter size={13} /> <ChevronDown size={10} className={showSort ? "rotate-180" : ""} />
                    </button>
                    <AnimatePresence>
                      {showSort && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden w-40">
                          {/* eslint-disable-next-line no-unused-vars */}
                          {SORT_OPTS.map(({ key, label, icon: I }) => (
                            <button key={key} onClick={() => { setSort(key); setShowSort(false); }} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-semibold hover:bg-slate-50 transition-colors ${sort === key ? "text-indigo-600 bg-indigo-50" : "text-slate-600"}`}>
                              <I size={11} className="opacity-50" />{label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(search || tab !== "all") && (
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-50 flex-wrap">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active:</span>
              {tab !== "all" && <span className="flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tab} <button onClick={() => setTab("all")}><X size={9} /></button></span>}
              {search      && <span className="flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">"{search}" <button onClick={() => setSearch("")}><X size={9} /></button></span>}
              <span className="text-[10px] text-slate-400 font-semibold ml-auto">{sortedFiltered.length} result{sortedFiltered.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* main grid */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-7 space-y-2">
            {loading ? (
              <div className="py-16 bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-9 h-9 rounded-full border-[3px] border-violet-100 border-t-[#560BAD]" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading orders...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedFiltered.length > 0 ? sortedFiltered.map(order => (
                  <div key={order._id} className="relative">
                    {newOrderIds.has(order._id) && (
                      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 4, duration: 1 }} className="absolute -top-1 -right-1 z-10 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">New</motion.div>
                    )}
                    <OrderRow order={order} selected={!isMobile && selected?._id === order._id} onClick={() => setSelected(order)} />
                  </div>
                )) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                      <Package size={20} className="text-slate-300" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No orders found</p>
                    <button onClick={() => { setTab("all"); setSearch(""); }} className="text-[11px] text-indigo-500 font-semibold hover:underline">Clear filters</button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <AnimatePresence mode="wait">
              {selected ? (
                <DetailPane key={selected._id} order={selected} onClose={() => setSelected(null)} onStatus={updateStatus} onCancel={openCancel} actionLoading={actionLoading} isMobile={false} />
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl border border-slate-100 border-dashed min-h-100 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100">
                    <Eye size={20} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-400 text-[11px] uppercase tracking-widest mb-2">No Order Selected</p>
                  <p className="text-slate-300 text-[12px] max-w-45 leading-relaxed">Click any order to review details and take action</p>
                  <div className="mt-6 w-full max-w-55 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Quick Filters</p>
                    {Object.entries(STATUS).map(([key, val]) => {
                      const count = orders.filter(o => o.approvalStatus === key).length;
                      return (
                        <button key={key} onClick={() => setTab(key)} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[11px] font-semibold transition-all hover:shadow-sm ${val.pill}`}>
                          <span className="flex items-center gap-2"><val.icon size={11} />{val.label}</span>
                          <span className="font-black">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 pt-5 border-t border-slate-100 w-full">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Recent</p>
                    {orders.slice(0, 3).map(o => (
                      <button key={o._id} onClick={() => setSelected(o)} className="w-full flex items-center gap-2 py-1.5 hover:bg-slate-50 px-2 rounded-xl transition-colors text-left">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS[o.approvalStatus]?.dot || "#94a3b8" }} />
                        <p className="text-[11px] text-slate-500 font-medium truncate flex-1">{o.productName}</p>
                        <p className="text-[10px] text-slate-300 shrink-0">₹{fmt(o.totalAmount)}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {isMobile && selected && (
          <DetailPane key={selected._id} order={selected} onClose={() => setSelected(null)} onStatus={updateStatus} onCancel={openCancel} actionLoading={actionLoading} isMobile={true} />
        )}

        {/* status breakdown */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-base sm:text-lg">Status Breakdown</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Activity size={10} /> Live
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS).map(([key, val]) => {
              const count = orders.filter(o => o.approvalStatus === key).length;
              const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <button key={key} onClick={() => setTab(key)} className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-left hover:shadow-md ${tab === key ? "border-slate-900 bg-slate-900" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: val.dot + "20" }}>
                      <val.icon size={13} style={{ color: val.dot }} />
                    </div>
                    <span className={`text-[10px] font-black ${tab === key ? "text-white/50" : "text-slate-400"}`}>{pct}%</span>
                  </div>
                  <p className={`text-xl sm:text-2xl font-black leading-none mb-1 ${tab === key ? "text-white" : "text-slate-900"}`}>{count}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${tab === key ? "text-white/50" : "text-slate-400"}`}>{val.label}</p>
                  <div className={`mt-2.5 h-1 rounded-full overflow-hidden ${tab === key ? "bg-white/10" : "bg-slate-200"}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${val.track}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* bottom analytics */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Top Products</p>
            {Object.entries(
              orders.reduce((acc, o) => { acc[o.productName] = (acc[o.productName] || 0) + 1; return acc; }, {})
            ).sort(([,a],[,b]) => b - a).slice(0, 4).map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-black text-slate-300 w-4">#{i + 1}</span>
                <p className="flex-1 text-[12px] font-semibold text-slate-700 truncate">{name}</p>
                <span className="text-[11px] font-black text-slate-900">{count}</span>
              </div>
            ))}
            {!orders.length && <p className="text-[12px] text-slate-300 text-center py-3">No data yet</p>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Revenue Breakdown</p>
            {[
              { label: "Gross",     val: orders.reduce((a,c)=>a+(c.totalAmount||0), 0),                                         color: "bg-indigo-400"  },
              { label: "Active",    val: orders.filter(o=>o.approvalStatus!=="Cancelled").reduce((a,c)=>a+(c.totalAmount||0),0), color: "bg-emerald-400" },
              { label: "Cancelled", val: orders.filter(o=>o.approvalStatus==="Cancelled").reduce((a,c)=>a+(c.totalAmount||0),0),color: "bg-red-300"     },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${color}`} /><p className="text-[11px] font-medium text-slate-500">{label}</p></div>
                <p className="text-[12px] font-black text-slate-900">₹{fmt(val)}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">System Status</p>
            <div className="space-y-3">
              {[
                { label: "API Connection", ok: online,     detail: online ? "Connected" : "Offline"        },
                { label: "Auto-Sync",      ok: true,       detail: `Every ${POLL_INTERVAL / 1000}s`         },
                { label: "Email Service",  ok: true,       detail: "Gmail SMTP"                              },
                { label: "Last Sync",      ok: !!lastSync, detail: lastSync ? fmtTime(lastSync) : "—"        },
              ].map(({ label, ok, detail }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
                    <p className="text-[12px] font-medium text-slate-400">{label}</p>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-600">Polling {POLL_INTERVAL / 1000}s · {online ? "🟢 Live" : "🔴 Offline"}</p>
            </div>
          </motion.div>
        </div>

        {/* recent orders table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 sm:mt-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 sm:mb-4">Recent Orders</p>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-140">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Order ID", "Product", "Customer", "Amount", "Status", "Date", ""].map(h => (
                    <th key={h} className="text-left pb-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 pr-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.slice(0, 8).map((o, i) => {
                    const sc = STATUS[o.approvalStatus] || STATUS.Pending;
                    return (
                      <motion.tr key={o._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                        <td className="py-2.5 pr-3"><span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400">#{o._id?.slice(-8).toUpperCase()}</span></td>
                        <td className="py-2.5 pr-3"><p className="text-[12px] font-semibold text-slate-700 max-w-30 truncate">{o.productName}</p></td>
                        <td className="py-2.5 pr-3"><p className="text-[11px] text-slate-500 max-w-30 truncate">{o.userEmail}</p></td>
                        <td className="py-2.5 pr-3"><p className="text-[12px] font-black text-slate-900">₹{fmt(o.totalAmount)}</p></td>
                        <td className="py-2.5 pr-3"><span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${sc.pill}`}>{sc.label}</span></td>
                        <td className="py-2.5 pr-3"><p className="text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(o.createdAt)}</p></td>
                        <td className="py-2.5"><button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5 transition-colors whitespace-nowrap">View <ChevronRight size={10} /></button></td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {!orders.length && <div className="text-center py-8 text-slate-300 text-[12px] font-semibold">No orders yet</div>}
          </div>
        </motion.div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery & Pickup Schedule</p>
              <Truck size={13} className="text-indigo-400" />
            </div>
            {orders.filter(o => o.deliveryDate || o.pickupDate).length === 0 ? (
              <div className="text-center py-6">
                <Truck size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[11px] text-slate-300 font-semibold">No scheduled deliveries yet</p>
                <p className="text-[10px] text-slate-200 mt-0.5">Delivery/pickup dates will appear here once set</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.filter(o => o.deliveryDate || o.pickupDate).slice(0, 5).map(o => {
                  const sc = STATUS[o.approvalStatus] || STATUS.Pending;
                  return (
                    <button key={o._id} onClick={() => setSelected(o)} className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc.dot }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-700 truncate">{o.productName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{o.userEmail}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        {o.deliveryDate && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600">
                            <Truck size={9} />
                            {new Date(o.deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </div>
                        )}
                        {o.pickupDate && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600">
                            <Calendar size={9} />
                            {new Date(o.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Areas</p>
              <MapPin size={13} className="text-violet-400" />
            </div>
            {(() => {
              const areas = orders.reduce((acc, o) => {
                const area = o.serviceArea || o.address?.split(",").slice(-2, -1)[0]?.trim() || "Other";
                acc[area] = (acc[area] || 0) + 1;
                return acc;
              }, {});
              const sorted = Object.entries(areas).sort(([,a],[,b]) => b - a).slice(0, 6);
              if (!sorted.length) return (
                <div className="text-center py-6">
                  <MapPin size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[11px] text-slate-300 font-semibold">No area data available</p>
                </div>
              );
              const max = sorted[0][1];
              return (
                <div className="space-y-2.5">
                  {sorted.map(([area, count]) => (
                    <div key={area} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                      <p className="text-[12px] font-semibold text-slate-600 flex-1 truncate">{area}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / max) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-violet-400 rounded-full"
                          />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        </div>

      </div>
    </div>
  );
}