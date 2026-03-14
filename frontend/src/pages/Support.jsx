import React, { useState } from "react";
import axios from "axios";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { Mail, Phone, Clock, ShieldCheck, Send, Loader2, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

export default function Support() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const faqs = [
    { question: "How does renting work?", answer: "Browse products, select your rental tenure, complete checkout, and we’ll deliver & install at your location." },
    { question: "What is the minimum rental period?", answer: "Minimum rental tenure is generally 3 months depending on the product category." },
    { question: "Is the security deposit refundable?", answer: "Yes, it is fully refundable after pickup and successful quality inspection." },
    { question: "Can I cancel my subscription?", answer: "Yes, cancellation is allowed after the minimum tenure period is completed." },
  ];

  const features = [
    { icon: <Clock className="w-5 h-5" />, title: "Always On", desc: "24/7 Availability", color: "bg-blue-50 text-blue-600" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Protected", desc: "Secure Help", color: "bg-emerald-50 text-emerald-600" },
    { icon: <Phone className="w-5 h-5" />, title: "Instant", desc: "Quick Response", color: "bg-orange-50 text-orange-600" },
    { icon: <Mail className="w-5 h-5" />, title: "Email", desc: "support@rentease.com", color: "bg-purple-50 text-purple-600" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      await axios.post("https://rentease-backend-oxyy.onrender.com/api/support", form);
      setStatus({ loading: false, success: true, error: null });
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus((prev) => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || "Server Error" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 antialiased pt-28 pb-20 selection:bg-purple-100 selection:text-purple-900">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <header className="max-w-3xl mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-1px w-8 bg-purple-600"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-600">Help Center</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.1]"
          >
            Smooth support for <br />
            <span className="text-slate-400 italic font-light font-serif">your experience.</span>
          </motion.h1>
        </header>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {features.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
            >
              <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{item.title}</h3>
              <p className="text-sm font-semibold text-slate-800">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Inquiry Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MessageSquare size={120} />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Send a Message</h2>
              <p className="text-slate-400 text-sm mb-10 font-medium">We usually respond within a few hours.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full bg-slate-50/50 border border-slate-100 focus:border-purple-300 focus:bg-white px-6 py-4 rounded-2xl outline-none transition-all duration-300 placeholder:text-slate-300" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      className="w-full bg-slate-50/50 border border-slate-100 focus:border-purple-300 focus:bg-white px-6 py-4 rounded-2xl outline-none transition-all duration-300 placeholder:text-slate-300" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Reason for contact</label>
                  <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-purple-300 focus:bg-white px-6 py-4 rounded-2xl outline-none transition-all duration-300 placeholder:text-slate-300" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Message</label>
                  <textarea rows="4" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} 
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-purple-300 focus:bg-white px-6 py-4 rounded-2xl outline-none transition-all duration-300 resize-none placeholder:text-slate-300" placeholder="Tell us more about your inquiry..." />
                </div>

                <button type="submit" disabled={status.loading} 
                  className="group relative w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.25em] overflow-hidden transition-all active:scale-[0.98] disabled:bg-slate-200">
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    {status.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </span>
                </button>

                <AnimatePresence>
                  {status.success && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                      className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-widest bg-emerald-50 py-4 rounded-2xl border border-emerald-100">
                      <CheckCircle className="w-4 h-4" /> Delivered Successfully
                    </motion.div>
                  )}
                  {status.error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                      className="text-red-500 text-center font-bold text-[11px] uppercase tracking-widest bg-red-50 py-4 rounded-2xl border border-red-100">
                      {status.error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-5 pt-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 ml-2">Popular Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  className={`rounded-3xl border transition-all duration-500 ${openFAQ === index ? 'bg-white border-purple-100 shadow-xl shadow-purple-500/5' : 'bg-transparent border-slate-200 hover:border-slate-300'}`}
                >
                  <button onClick={() => setOpenFAQ(openFAQ === index ? null : index)} className="w-full text-left px-8 py-6 flex justify-between items-center group">
                    <span className={`text-sm font-bold transition-colors duration-300 ${openFAQ === index ? 'text-purple-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{faq.question}</span>
                    <div className={`transition-all duration-500 ${openFAQ === index ? 'rotate-180 text-purple-600' : 'text-slate-300'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 text-slate-400 text-[13px] leading-relaxed font-medium">
                          <div className="pt-4 border-t border-slate-50">{faq.answer}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}