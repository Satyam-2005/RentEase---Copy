import React, { useState, useEffect } from "react";
import axios from "axios";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import {
  Wrench, Search, RefreshCw, X, CheckCircle2, Clock,
  AlertCircle, Mail, Package, Calendar,
  Layers, Trash2, Play, Eye,
  Activity, BarChart2, Download, ShieldAlert, RotateCcw,
} from "lucide-react";

const API     = "http://127.0.0.1:5000";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS_CONFIG = {
  Pending:      { color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-400",   label: "Pending"      },
  "In Progress":{ color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-400",  label: "In Progress"  },
  Resolved:     { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400", label: "Resolved"     },
  Archived:     { color: "text-slate-400",   bg: "bg-slate-50",   border: "border-slate-200",   dot: "bg-slate-300",   label: "Archived"     },
};

const NEXT_STATUS = {
  Pending:       "In Progress",
  "In Progress": "Resolved",
  Resolved:      "Archived",
};

const NEXT_LABEL = {
  Pending:       "Start Repair",
  "In Progress": "Mark Resolved",
  Resolved:      "Archive",
};

const NEXT_ICON = {
  Pending:       Play,
  "In Progress": CheckCircle2,
  Resolved:      Layers,
};

const topBarColor = (dot) => {
  if (dot === "bg-violet-400")  return "bg-linear-to-r from-violet-400 to-purple-500";
  if (dot === "bg-amber-400")   return "bg-linear-to-r from-amber-400 to-orange-400";
  if (dot === "bg-emerald-400") return "bg-linear-to-r from-emerald-400 to-teal-400";
  return "bg-slate-200";
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const AdminDashboard = () => {
  const [requests,        setRequests]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterType,      setFilterType]      = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updatingId,      setUpdatingId]      = useState(null);
  const [deletingId,      setDeletingId]      = useState(null);
  const [toast,           setToast]           = useState(null);
  const [confirmDelete,   setConfirmDelete]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
  fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/maintenance`);
      setRequests(res.data);
    } catch {
      showToast("Failed to load maintenance requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(`${API}/api/maintenance/${id}/status`, { status: newStatus });
      setRequests(prev => prev.map(r => r._id === id ? res.data : r));
      if (selectedRequest?._id === id) setSelectedRequest(res.data);
      showToast(`Status updated to "${newStatus}".`);
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRequest = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/maintenance/${id}`);
      setRequests(prev => prev.filter(r => r._id !== id));
      if (selectedRequest?._id === id) setSelectedRequest(null);
      showToast("Request deleted.");
    } catch {
      showToast("Failed to delete request.", "error");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const exportCSV = () => {
    const rows = [["ID", "Product", "Email", "Issue", "Type", "Status", "Visit Date", "Submitted"]];
    filtered.forEach(r => rows.push([
      r._id, r.productName, r.userEmail, r.issueTitle,
      r.requestType || "Maintenance", r.status,
      fmtDate(r.visitDate), fmtDate(r.createdAt),
    ]));
    const blob = new Blob([rows.map(row => row.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `maintenance_${Date.now()}.csv` });
    a.click();
    showToast("CSV exported.");
  };

  const filtered = requests.filter(r => {
    const q           = search.toLowerCase();
    const matchSearch = r.productName?.toLowerCase().includes(q) || r.userEmail?.toLowerCase().includes(q) || r.issueTitle?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType   = filterType   === "all" || (r.requestType || "Maintenance") === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    all:           requests.length,
    Pending:       requests.filter(r => r.status === "Pending").length,
    "In Progress": requests.filter(r => r.status === "In Progress").length,
    Resolved:      requests.filter(r => r.status === "Resolved").length,
  };

  const typeCounts = {
    Maintenance: requests.filter(r => (r.requestType || "Maintenance") === "Maintenance").length,
    Damage:      requests.filter(r => r.requestType === "Damage").length,
    Return:      requests.filter(r => r.requestType === "Return").length,
    Dispute:     requests.filter(r => r.requestType === "Dispute").length,
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-white to-violet-50/20">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }} className="w-10 h-10 rounded-full border-[3px] border-violet-100 border-t-[#560BAD]" />
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Loading requests...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-violet-50/20 antialiased">

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit   ={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 22 }}
            className={`fixed top-6 right-6 z-500 px-5 py-3.5 rounded-2xl shadow-xl text-[12px] font-bold flex items-center gap-2.5 border backdrop-blur-sm ${
              toast.type === "error"
                ? "bg-white/95 text-red-600 border-red-100 shadow-red-100/40"
                : "bg-white/95 text-emerald-600 border-emerald-100 shadow-emerald-100/40"
            }`}
          >
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.4 }} className={`w-2 h-2 rounded-full ${toast.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit   ={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative p-7 text-center border border-slate-100"
            >
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Delete Request?</h3>
              <p className="text-[12px] text-slate-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-2.5">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all">Cancel</button>
                <button
                  onClick={() => deleteRequest(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  className="flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {deletingId === confirmDelete ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-28">

        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
          <motion.div variants={fadeUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#560BAD] rounded-xl flex items-center justify-center shadow-md shadow-violet-300/40">
                  <Wrench size={15} className="text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#560BAD] bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg">Admin Panel</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                Maintenance <span className="font-light italic text-slate-400">Requests</span>
              </h1>
              <p className="mt-2 text-[12px] text-slate-400 font-medium">Manage repair tickets, damage claims, returns and disputes.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                <Download size={12} /> Export
              </button>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total",       value: counts.all,           icon: BarChart2,    color: "text-slate-700",   bg: "bg-white",      border: "border-slate-200"  },
                  { label: "Pending",     value: counts.Pending,       icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"  },
                  { label: "In Progress", value: counts["In Progress"], icon: Activity,     color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
                  { label: "Resolved",    value: counts.Resolved,      icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                  // eslint-disable-next-line no-unused-vars
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                  <motion.div key={label} whileHover={{ y: -2 }} className={`${bg} ${border} border rounded-2xl px-4 py-3.5 min-w-27.5`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
                      <Icon size={12} className={color} />
                    </div>
                    <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { type: "Maintenance", icon: Wrench,      color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
              { type: "Damage",      icon: ShieldAlert, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100"    },
              { type: "Return",      icon: RotateCcw,   color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100"   },
              { type: "Dispute",     icon: AlertCircle, color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100"  },
              // eslint-disable-next-line no-unused-vars
            ].map(({ type, icon: Icon, color, bg, border }) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilterType(filterType === type ? "all" : type)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                  filterType === type ? `${bg} ${border} shadow-sm` : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg} border ${border} shrink-0`}>
                  <Icon size={13} className={color} />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${filterType === type ? color : "text-slate-500"}`}>{type}</p>
                  <p className={`text-xl font-bold leading-none ${filterType === type ? color : "text-slate-900"}`}>{typeCounts[type]}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by product, email or issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-[13px] font-medium focus:ring-2 focus:ring-violet-100 focus:border-violet-300 outline-none transition-all shadow-sm placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm gap-1">
                {["all", "Pending", "In Progress", "Resolved"].map((st) => (
                  <motion.button
                    key={st}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterStatus(st)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${
                      filterStatus === st ? "bg-[#560BAD] text-white shadow-md shadow-violet-300/40" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {st}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
                onClick={fetchRequests}
                className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm hover:border-violet-300 transition-colors"
              >
                <RefreshCw size={15} className="text-slate-500" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-violet-200">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <Wrench size={44} className="text-violet-200" />
            </motion.div>
            <p className="mt-4 text-slate-600 font-semibold text-[14px]">No requests found.</p>
            <p className="text-slate-400 text-[11px] mt-1">Maintenance requests from users will appear here.</p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((req) => {
                const cfg        = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                const nextStatus = NEXT_STATUS[req.status];
                const NextIcon   = NEXT_ICON[req.status];
                const reqType    = req.requestType || "Maintenance";
                return (
                  <motion.div
                    key={req._id}
                    layout
                    variants={fadeUp}
                    exit={{ opacity: 0, scale: 0.93 }}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-violet-100/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`h-1.5 w-full ${topBarColor(cfg.dot)}`} />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${req.status === "In Progress" ? "animate-pulse" : ""}`} />
                              {cfg.label}
                            </span>
                            {reqType !== "Maintenance" && (
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                reqType === "Damage"  ? "bg-red-50 text-red-600 border-red-100" :
                                reqType === "Return"  ? "bg-blue-50 text-blue-600 border-blue-100" :
                                reqType === "Dispute" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-slate-50 text-slate-500 border-slate-100"
                              }`}>
                                {reqType}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[15px] font-semibold text-slate-900 truncate tracking-tight">{req.issueTitle}</h3>
                          <p className="text-[11px] text-[#560BAD] font-semibold mt-0.5 truncate">{req.productName}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedRequest(req)}
                            className="w-8 h-8 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center hover:bg-violet-100 transition-colors"
                          >
                            <Eye size={13} className="text-violet-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmDelete(req._id)}
                            className="w-8 h-8 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={13} className="text-red-500" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">User</p>
                          <p className="text-[10px] font-semibold text-slate-700 mt-0.5 truncate flex items-center gap-1"><Mail size={8} className="text-[#560BAD] shrink-0" />{req.userEmail}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Visit Date</p>
                          <p className="text-[10px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1"><Calendar size={8} className="text-[#560BAD]" />{fmtDate(req.visitDate)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                          <p className="text-[10px] font-semibold text-slate-700 mt-0.5 flex items-center gap-1"><Clock size={8} className="text-[#560BAD]" />{fmtDate(req.createdAt)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Order ID</p>
                          <p className="text-[10px] font-semibold text-slate-700 mt-0.5 font-mono truncate">#{req.orderId?.slice(-8)}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{req.description}</p>

                      {nextStatus ? (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={updatingId === req._id}
                          onClick={() => updateStatus(req._id, nextStatus)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm disabled:opacity-60 ${
                            req.status === "Pending"
                              ? "bg-[#560BAD] text-white shadow-violet-300/40 hover:bg-violet-700"
                              : req.status === "In Progress"
                              ? "bg-emerald-500 text-white shadow-emerald-300/40 hover:bg-emerald-600"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none"
                          }`}
                        >
                          {updatingId === req._id ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                              Updating...
                            </>
                          ) : (
                            <>{NextIcon && <NextIcon size={12} />} {NEXT_LABEL[req.status]}</>
                          )}
                        </motion.button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100 border-dashed">
                          <CheckCircle2 size={12} /> Archived
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-base">Reports & Analytics</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Activity size={10} /> Live
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Maintenance",   value: typeCounts.Maintenance, color: "text-violet-600", track: "bg-violet-400", bg: "bg-violet-50",  border: "border-violet-100", icon: Wrench      },
              { label: "Damage Claims", value: typeCounts.Damage,      color: "text-red-600",    track: "bg-red-400",    bg: "bg-red-50",     border: "border-red-100",    icon: ShieldAlert },
              { label: "Returns",       value: typeCounts.Return,      color: "text-blue-600",   track: "bg-blue-400",   bg: "bg-blue-50",    border: "border-blue-100",   icon: RotateCcw   },
              { label: "Disputes",      value: typeCounts.Dispute,     color: "text-amber-600",  track: "bg-amber-400",  bg: "bg-amber-50",   border: "border-amber-100",  icon: AlertCircle },
              // eslint-disable-next-line no-unused-vars
            ].map(({ label, value, color, track, bg, border, icon: Icon }) => {
              const pct = requests.length ? Math.round((value / requests.length) * 100) : 0;
              return (
                <div key={label} className={`${bg} ${border} border rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={14} className={color} />
                    <span className={`text-[10px] font-black ${color}`}>{pct}%</span>
                  </div>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
                  <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/60">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${track}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-150 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 24 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit   ={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9  }}
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </motion.button>

              {(() => {
                const cfg        = STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.Pending;
                const nextStatus = NEXT_STATUS[selectedRequest.status];
                const NextIcon   = NEXT_ICON[selectedRequest.status];
                const reqType    = selectedRequest.requestType || "Maintenance";
                return (
                  <>
                    <div className={`h-2 w-full ${topBarColor(cfg.dot)}`} />
                    <div className="p-7">
                      <div className="flex items-start gap-3 mb-5">
                        <div className="w-11 h-11 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center shrink-0">
                          <Wrench size={18} className="text-[#560BAD]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${selectedRequest.status === "In Progress" ? "animate-pulse" : ""}`} />
                              {cfg.label}
                            </span>
                            {reqType !== "Maintenance" && (
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                reqType === "Damage"  ? "bg-red-50 text-red-600 border-red-100" :
                                reqType === "Return"  ? "bg-blue-50 text-blue-600 border-blue-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                              }`}>{reqType}</span>
                            )}
                          </div>
                          <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight leading-snug">{selectedRequest.issueTitle}</h2>
                          <p className="text-[11px] text-[#560BAD] font-semibold">{selectedRequest.productName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        {[
                          { label: "User Email",  val: selectedRequest.userEmail,               icon: Mail     },
                          { label: "Order ID",    val: `#${selectedRequest.orderId?.slice(-8)}`, icon: Package  },
                          { label: "Visit Date",  val: fmtDate(selectedRequest.visitDate),       icon: Calendar },
                          { label: "Submitted",   val: fmtDate(selectedRequest.createdAt),       icon: Clock    },
                          // eslint-disable-next-line no-unused-vars
                        ].map(({ label, val, icon: Icon }) => (
                          <div key={label} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">{label}</p>
                            <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                              <Icon size={9} className="text-[#560BAD] shrink-0" />{val}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Description</p>
                        <p className="text-[12px] text-slate-600 leading-relaxed">{selectedRequest.description}</p>
                      </div>

                      {selectedRequest.damageSeverity && (
                        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert size={11} className="text-red-500" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-red-500">Damage Severity</p>
                          </div>
                          <p className="text-[12px] font-bold text-red-700 capitalize">{selectedRequest.damageSeverity}</p>
                        </div>
                      )}

                      {selectedRequest.returnCondition && (
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <RotateCcw size={11} className="text-blue-500" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-blue-500">Return Condition</p>
                          </div>
                          <p className="text-[12px] font-bold text-blue-700 capitalize">{selectedRequest.returnCondition}</p>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {nextStatus && (
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={updatingId === selectedRequest._id}
                            onClick={() => updateStatus(selectedRequest._id, nextStatus)}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-60 shadow-sm ${
                              selectedRequest.status === "Pending"
                                ? "bg-[#560BAD] text-white shadow-violet-300/40 hover:bg-violet-700"
                                : selectedRequest.status === "In Progress"
                                ? "bg-emerald-500 text-white shadow-emerald-300/40 hover:bg-emerald-600"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none"
                            }`}
                          >
                            {updatingId === selectedRequest._id ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                Updating...
                              </>
                            ) : (
                              <>{NextIcon && <NextIcon size={13} />} {NEXT_LABEL[selectedRequest.status]}</>
                            )}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setConfirmDelete(selectedRequest._id); setSelectedRequest(null); }}
                          className="w-full py-3.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                        >
                          Delete Request
                        </motion.button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;