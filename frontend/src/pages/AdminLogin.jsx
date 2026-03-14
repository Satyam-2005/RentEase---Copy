import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { Mail, Lock, User, ShieldCheck, ArrowRight, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await axios.post("https://rentease-backend-oxyy.onrender.com/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        if (data.user.role !== "admin") {
          showNotification("Access Denied: Not an Administrator", "error");
          setLoading(false);
          return;
        }

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", "admin");
        sessionStorage.setItem("userName", data.user.name);
        window.dispatchEvent(new Event("authChanged"));

        showNotification("Admin Access Granted", "success");
        setTimeout(() => navigate("/admin-dashboard"), 1500);
      } else {
        await axios.post("https://rentease-backend-oxyy.onrender.com/api/auth/register", {
          ...formData,
          role: "admin",
        });

        showNotification("Admin Registered Successfully", "success");
        setIsLogin(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Authentication Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%" }}
            animate={{ opacity: 1, y: 40, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%" }}
            className="fixed left-1/2 z-100 w-full max-w-md px-4"
          >
            <div className={`relative flex items-center gap-4 p-5 rounded-3xl shadow-2xl backdrop-blur-md border ${
              notification.type === "success" 
                ? "bg-white/90 border-emerald-100 text-emerald-900" 
                : "bg-white/90 border-red-100 text-red-900"
            }`}>
              <div className={`p-2 rounded-2xl ${
                notification.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              }`}>
                {notification.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold tracking-tight">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="opacity-40 hover:opacity-100 transition-opacity">
                <X size={18} />
              </button>
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 rounded-full ${
                  notification.type === "success" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-440px bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden relative z-10"
      >
        <div className="p-2 bg-purple-600">
            <p className="text-[10px] text-center font-black uppercase tracking-[0.3em] text-white py-2">
              Security Level: Administrator
            </p>
        </div>

        <div className="p-10 pt-12">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 rounded-4xl mb-6 shadow-xl shadow-purple-200 bg-purple-50 text-purple-600">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {isLogin ? "Admin Login" : "Admin Register"}
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">Secure dashboard access only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Admin Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-purple-100 transition-all text-sm font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-purple-100 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-purple-100 transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-[1.25rem] text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl bg-purple-600 hover:bg-purple-700 shadow-purple-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Enter Dashboard" : "Create Admin"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-400 hover:text-purple-600 font-bold uppercase tracking-widest transition-all"
            >
              {isLogin ? "Need Admin Account?" : "Existing Admin?"} <span className="ml-1 text-purple-600">Switch</span>
            </button>
            <div className="pt-4 border-t border-gray-50">
                <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-[10px] text-gray-300 hover:text-indigo-500 font-black uppercase tracking-widest transition-all"
                >
                Return to Client Portal
                </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-purple-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-indigo-50 rounded-full blur-[120px] opacity-60" />
    </div>
  );
};

export default AdminAuth;