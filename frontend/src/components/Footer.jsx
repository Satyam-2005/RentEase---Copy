import React, { useState } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { 
  Facebook, Instagram, Twitter, Mail, Phone, 
  MapPin, Send, ShieldCheck, RefreshCw, 
  CreditCard, ChevronRight, Linkedin, Github, 
  LayoutDashboard, ShoppingBag, Sofa, Tv, HelpCircle, Info
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const exploreLinks = [
    { name: "Home", path: "/", icon: null },
    { name: "Products", path: "/products", icon: null },
    { name: "Appliances", path: "/products?category=Appliances", icon: <Tv size={14}/> },
    { name: "Furniture", path: "/products?category=Furniture", icon: <Sofa size={14}/> },
    { name: "How It Works", path: "/how-it-works", icon: null },
    { name: "Support", path: "/support", icon: null },
    { name: "My Rentals", path: "/my-rentals", icon: <LayoutDashboard size={14}/> },
  ];

  return (
    <footer className="relative bg-[#0B0F19] text-gray-400 pt-24 pb-12 overflow-hidden border-t border-white/5 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1px bg-linear-to-r from-transparent via-[#560BAD]/50 to-transparent" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#560BAD]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-16 lg:grid-cols-12 mb-20"
        >
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block group">
              <h2 className="text-3xl font-black text-white tracking-tighter transition-transform group-hover:scale-105">
                Rent<span className="text-[#560BAD]">Ease</span>
                <span className="text-[#560BAD] inline-block w-2 h-2 rounded-full ml-1 animate-pulse" />
              </h2>
            </Link>
            <p className="text-lg leading-relaxed font-medium text-gray-500 max-w-sm">
              Premium lifestyle, delivered. Elevate your space with flexible rental solutions for the modern home.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#560BAD] group-hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-bold group-hover:text-white transition-colors tracking-wide">satyammahakul2122@gmail.com</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#560BAD] group-hover:text-white transition-all duration-300">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-bold group-hover:text-white transition-colors tracking-wide">+91 8093474190</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Explore Catalogue</h3>
            <ul className="grid grid-cols-1 gap-y-4">
              {exploreLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="group flex items-center gap-3 text-sm font-bold hover:text-white transition-all duration-300"
                  >
                    <div className="w-1 h-1 rounded-full bg-[#560BAD] opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all" />
                    <span className="relative overflow-hidden">
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-1px bg-[#560BAD] transition-all duration-300 group-hover:w-full" />
                    </span>
                    {link.icon && <span className="text-[#560BAD]/50 group-hover:text-[#560BAD] transition-colors">{link.icon}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
            <div className="p-10 bg-linear-to-br from-white/3 to-transparent border border-white/5 rounded-[3rem] relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black text-white mb-2">Join the Club</h3>
                <p className="text-sm font-medium text-gray-500 mb-8">Get early access to new arrivals and exclusive monthly rental credits.</p>
                <form onSubmit={handleSubscribe} className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-medium outline-none focus:border-[#560BAD] transition-all placeholder:text-gray-700"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#560BAD] hover:bg-[#6b1fd1] text-white rounded-xl transition-all flex items-center justify-center shadow-xl shadow-[#560BAD]/20"
                  >
                    {subscribed ? <ShieldCheck size={20} className="animate-bounce" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#560BAD]/10 rounded-full blur-3xl group-hover:bg-[#560BAD]/20 transition-colors" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {[
                  { Icon: Facebook, href: "#" },
                  { Icon: Instagram, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  // eslint-disable-next-line no-unused-vars
                ].map(({ Icon, href }, idx) => (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -8, scale: 1.1 }}
                    href={href}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#560BAD] hover:text-white hover:border-[#560BAD] transition-all"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-1">Status</span>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Systems Operational</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/5 mb-10">
          {[
            { Icon: ShieldCheck, text: "Secured Checkout" },
            { Icon: RefreshCw, text: "Hassle-free Returns" },
            { Icon: CreditCard, text: "No Cost EMI" },
            { Icon: MapPin, text: "Pan India Delivery" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center md:justify-start group cursor-default">
              <item.Icon size={16} className="text-[#560BAD] group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-gray-300 transition-colors">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} <span className="text-white">RentEase</span>. All rights reserved.
          </p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <Link to="/privacy" className="hover:text-[#560BAD] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#560BAD] transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-[#560BAD] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;