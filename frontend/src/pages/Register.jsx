/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
/* eslint-enable no-unused-vars */
import axios from "axios";
import { useNavigate } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { Mail, Lock, User, ShieldCheck, ArrowRight, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Single consistent API base — must match your backend port
const API = "https://rentease-backend-oxyy.onrender.com";

const Register = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
      const baseRoute = isAdmin ? "/api/admin" : "/api/auth";
      const action = isLogin ? "/login" : "/register";

      const res = await axios.post(`${API}${baseRoute}${action}`, formData);

      if (isLogin) {
        const data = res.data;

        // Support both API response shapes:
        // Shape A (nested):  { token, user: { name, email, role } }
        // Shape B (flat):    { token, name, email, role }
        const token     = data.token       || data.accessToken              || "";
        const userName  = data.user?.name  || data.name                     || "";
        const userEmail = data.user?.email || data.email || formData.email;
        const role      = data.user?.role  || data.role  || (isAdmin ? "admin" : "user");

        // Save to sessionStorage (active tab)
        sessionStorage.setItem("token",     token);
        sessionStorage.setItem("userName",  userName);
        sessionStorage.setItem("userEmail", userEmail);  // ← THIS is what MyRentals needs
        sessionStorage.setItem("role",      role);

        // Also save to localStorage so page refresh / new tab doesn't lose session
        localStorage.setItem("token",     token);
        localStorage.setItem("userName",  userName);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("role",      role);

        window.dispatchEvent(new Event("authChanged"));

        showNotification(`${isAdmin ? "Admin" : "User"} Access Granted`, "success");

        setTimeout(() => {
          navigate(role === "admin" ? "/admin-dashboard" : "/");
        }, 1500);
      } else {
        showNotification("Account created successfully", "success");
        setIsLogin(true);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Verification Failed", "error");
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
            className="fixed left-1/2 z-50 w-full max-w-md px-4"
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
        className="w-full max-w-110 bg-white border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden relative z-10"
      >
        <div className="flex p-2 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${!isAdmin ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${isAdmin ? "bg-white text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Administrator
          </button>
        </div>

        <div className="p-10 pt-12">
          <div className="text-center mb-10">
            <motion.div
              key={isAdmin ? "admin-icon" : "user-icon"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex p-5 rounded-4xl mb-6 shadow-xl shadow-current/10 ${isAdmin ? "bg-purple-50 text-purple-600" : "bg-indigo-50 text-indigo-600"}`}
            >
              {isAdmin ? <ShieldCheck size={32} strokeWidth={2.5} /> : <User size={32} strokeWidth={2.5} />}
            </motion.div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {isAdmin ? "Admin Portal" : isLogin ? "Welcome Back" : "Join RentEase"}
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">Please enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && !isAdmin && (
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
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-100 transition-all text-sm font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-100 transition-all text-sm font-medium"
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
                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-100 transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.25rem] text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isAdmin 
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-200" 
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              } disabled:bg-gray-200 disabled:shadow-none`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Continue" : "Register"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-gray-400 hover:text-indigo-600 font-bold uppercase tracking-widest transition-all"
              >
                {isLogin ? "Need an account?" : "Have an account?"} <span className="ml-1 text-indigo-600">Switch</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-indigo-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-purple-50 rounded-full blur-[120px] opacity-60" />
    </div>
  );
};

export default Register;