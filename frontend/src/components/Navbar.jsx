import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
/* eslint-enable no-unused-vars */
import {  AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  ShoppingCart, Menu, X, ChevronRight, LogOut, 
  User as UserIcon, Home, Package, Info, Headphones, 
  Settings, CreditCard, Star, ShieldCheck, Sparkles 
} from "lucide-react";
import LoginButton from "../UI/LoginButton.jsx";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [productDropdown, setProductDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [_activeTab, _setActiveTab] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  let dropdownTimeout;
  const isAdminRoute = location.pathname.startsWith("/admin");

  const syncAuth = useCallback(() => {
    const token = sessionStorage.getItem("token");
    const name = sessionStorage.getItem("userName");
    const storedRole = sessionStorage.getItem("role");
    if (token) {
      setUser(name || "User");
      setRole(storedRole);
    } else {
      setUser(null);
      setRole(null);
    }
  }, []);

  const syncCart = useCallback(() => {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    syncAuth();
    syncCart();
    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, [syncAuth, syncCart]);

  useEffect(() => {
    if (role === "admin" && !isAdminRoute) {
      navigate("/admin");
    }
  }, [role, isAdminRoute, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("role");
    setUser(null);
    setRole(null);
    window.dispatchEvent(new Event("authChanged"));
    setMobileOpen(false);
    navigate("/");
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category}`);
    setProductDropdown(false);
    setMobileOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setProductDropdown(true);
  };

  const handleMouseLeave = () => {
    /*//eslint-disable-next-line react-hooks/exhaustive-deps*/
    dropdownTimeout = setTimeout(() => {
      setProductDropdown(false);
    }, 300);
  };

  const navVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      rotateX: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 } 
    },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="fixed top-4 md:top-11 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-[85%] lg:w-[75%] perspective-1000">
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="animate"
        className={`relative transition-all duration-500 rounded-2xl md:rounded-4xl border ${
          scrolled 
          ? "backdrop-blur-2xl bg-white/70 border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] py-2" 
          : "backdrop-blur-xl bg-white/40 border-white/30 shadow-2xl py-3"
        }`}
      >
        <motion.div 
          className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#560BAD] origin-left rounded-full"
          style={{ scaleX }}
        />

        <div className="flex items-center justify-between h-15 md:h-16.25 px-5 md:px-10 relative z-10">
          <Link
            to={role === "admin" ? "/admin" : "/"}
            className="flex items-center gap-3 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#560BAD] blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
              <img
                src="/finalLogo.png"
                alt="Logo"
                className="h-8 md:h-10 w-auto object-contain relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-[#1a1a2e] leading-none uppercase italic">
                Rent<span className="text-[#560BAD] not-italic">Ease</span>
              </span>
              <span className="text-[10px] font-bold text-[#560BAD] tracking-[0.2em] uppercase opacity-70">Flexible Living</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {!isAdminRoute && role !== "admin" ? (
              <>
                <ModernNavItem to="/" label="Home" icon={<Home size={14}/>} />
                
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  ref={dropdownRef}
                >
                  <button className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-[#1a1a2e]/70 hover:text-[#560BAD] transition-all duration-300">
                    <Package size={14} />
                    <span>Product</span>
                    <motion.div animate={{ rotate: productDropdown ? 180 : 0 }}>
                      <ChevronRight size={14} className="rotate-90" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {productDropdown && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-[120%] left-1/2 -translate-x-1/2 w-100 bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-4xl border border-white p-6 grid grid-cols-2 gap-4"
                      >
                        <CategoryCard 
                          title="Furniture" 
                          desc="Designer pieces" 
                          icon={<Star className="text-amber-500" />}
                          onClick={() => handleCategoryClick("Furniture")}
                        />
                        <CategoryCard 
                          title="Appliances" 
                          desc="Smart living" 
                          icon={<Sparkles className="text-blue-500" />}
                          onClick={() => handleCategoryClick("Appliances")}
                        />
                        <div className="col-span-2 mt-2 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          <span>Verified Quality</span>
                          <span>24/7 Support</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <ModernNavItem to="/how-it-works" label="How it works" icon={<Info size={14}/>} />
                <ModernNavItem to="/support" label="Support" icon={<Headphones size={14}/>} />
                {user && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <ModernNavItem to="/my-rentals" label="My Rentals" icon={<ShieldCheck size={14}/>} />
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <AdminNavItem to="/admin/maintenance" label="Maintenance" />
                <AdminNavItem to="/admin/products" label="Products" />
                <AdminNavItem to="/admin/orders" label="Orders" />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isAdminRoute && role !== "admin" && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { navigate("/checkout"); setMobileOpen(false); }}
                className="relative p-3 bg-white/50 hover:bg-[#560BAD] hover:text-white rounded-2xl transition-all duration-500 shadow-sm border border-white"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-black"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            <div className="hidden md:flex items-center gap-4 ml-2 border-l border-slate-200/50 pl-6">
              {!user ? (
                <LoginButton name="Join Now" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-black text-[#560BAD] tracking-widest opacity-60">Verified User</span>
                    <span className="text-sm font-bold text-[#1a1a2e]">{user}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#fff" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2.5 text-[#560BAD] rounded-xl hover:shadow-lg transition-all border border-[#560BAD]/20"
                  >
                    <LogOut size={18} />
                  </motion.button>
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-3 bg-[#560BAD]/10 text-[#560BAD] rounded-2xl"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white/90"
            >
              <div className="p-8 space-y-6">
                {!isAdminRoute && role !== "admin" ? (
                  <>
                    <MobileLink to="/" icon={<Home />} label="Home" onClick={() => setMobileOpen(false)} />
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em]">Our Collection</p>
                      <button onClick={() => handleCategoryClick("Furniture")} className="flex w-full items-center justify-between text-xl font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl hover:bg-[#560BAD]/5">
                        Furniture <ChevronRight className="text-[#560BAD]"/>
                      </button>
                      <button onClick={() => handleCategoryClick("Appliances")} className="flex w-full items-center justify-between text-xl font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl hover:bg-[#560BAD]/5">
                        Appliances <ChevronRight className="text-[#560BAD]"/>
                      </button>
                    </div>
                    <MobileLink to="/how-it-works" icon={<Info />} label="The Process" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/support" icon={<Headphones />} label="Get Help" onClick={() => setMobileOpen(false)} />
                  </>
                ) : (
                  <div className="space-y-4">
                     <MobileLink to="/admin/maintenance" label="System Logs" onClick={() => setMobileOpen(false)} />
                     <MobileLink to="/admin/products" label="Stock Manager" onClick={() => setMobileOpen(false)} />
                  </div>
                )}

                <div className="pt-8 border-t border-slate-100">
                  {!user ? (
                    <div onClick={() => setMobileOpen(false)} className="w-full">
                      <LoginButton name="Get Started Today" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                        <div className="w-12 h-12 bg-[#560BAD] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#560BAD]/30">
                          <UserIcon size={24}/>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</p>
                          <p className="text-lg font-bold text-slate-800">{user}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-colors"
                      >
                        <LogOut size={20} /> Terminate Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

const ModernNavItem = ({ to, label, icon }) => (
  <Link to={to} className="relative group flex flex-col items-center">
    <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-[#1a1a2e]/70 group-hover:text-[#560BAD] transition-colors duration-300">
      <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4">{icon}</span>
      <span className="relative">
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#560BAD] transition-all duration-300 group-hover:w-full" />
      </span>
    </div>
  </Link>
);

const AdminNavItem = ({ to, label }) => (
  <Link to={to} className="px-5 py-2 rounded-xl bg-[#1a1a2e] text-white text-xs font-black uppercase tracking-widest hover:bg-[#560BAD] transition-all shadow-md">
    {label}
  </Link>
);

const CategoryCard = ({ title, desc, icon, onClick }) => (
  <motion.button
    whileHover={{ y: -5, backgroundColor: "rgba(86, 11, 173, 0.05)" }}
    onClick={onClick}
    className="flex flex-col items-start p-4 rounded-2xl border border-slate-100 transition-all text-left"
  >
    <div className="mb-3 p-2 bg-white rounded-xl shadow-sm border border-slate-50">{icon}</div>
    <p className="font-bold text-slate-800 text-sm">{title}</p>
    <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
  </motion.button>
);

const MobileLink = ({ to, label, icon, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-4 text-2xl font-black text-slate-800 hover:text-[#560BAD] transition-colors group"
  >
    <span className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#560BAD]/10 transition-colors">{icon}</span>
    {label}
  </Link>
);

export default Navbar;