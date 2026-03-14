import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductPage from "./components/ProductPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AddProduct from "./pages/AddProduct";
import Checkout from "./pages/Checkout";
import HowItWorks from "./pages/HowItWorks";
import Support from "./pages/Support";
import Footer from "./components/Footer";
import MyRentals from "./pages/MyRentals";
import ProceedToPayment from "./pages/ProceedToPayment";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";

const GlobalStyles = () => (
  <style>{`
    ::-webkit-scrollbar { display: none; }
    body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    html {
      scroll-behavior: auto;
    }
    .go-top-btn {
      background: linear-gradient(145deg, rgba(255,255,255,0.82), rgba(248,243,255,0.65));
      border: 1px solid rgba(255,255,255,0.92);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.80) inset,
        0 -1px 0 rgba(86,11,173,0.08) inset,
        0 8px 24px rgba(86,11,173,0.20),
        0 2px 8px rgba(0,0,0,0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .go-top-btn:hover {
      background: linear-gradient(145deg, #7c3aed, #560BAD);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.22) inset,
        0 8px 28px rgba(86,11,173,0.42),
        0 2px 8px rgba(0,0,0,0.12);
    }
    .go-top-btn::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0) 100%);
      border-radius: inherit;
      pointer-events: none;
    }
  `}</style>
);

function useSmoothScrollToTop() {
  const frameRef = useRef(null);

  const smoothScrollToTop = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const startY = window.scrollY;
    const startTime = performance.now();
    const duration = Math.min(600 + startY * 0.3, 1200);

    const easeInOutQuart = (t) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutQuart(progress);
      window.scrollTo(0, startY * (1 - ease));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  return smoothScrollToTop;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  const frameRef = useRef(null);

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const startY = window.scrollY;
    if (startY === 0) return;

    const startTime = performance.now();
    const duration = Math.min(500 + startY * 0.25, 900);
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeOutCubic(progress);
      window.scrollTo(0, startY * (1 - ease));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [pathname]);

  return null;
}

function GoToTopButton() {
  const [visible, setVisible] = useState(false);
  const smoothScrollToTop = useSmoothScrollToTop();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.88 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={smoothScrollToTop}
          className="go-top-btn fixed bottom-8 right-6 z-50 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group"
          aria-label="Go to top"
        >
          <ArrowUp
            size={18}
            className="text-[#560BAD] group-hover:text-white transition-colors duration-300 relative z-10"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!sessionStorage.getItem("token"));
    };
    window.addEventListener("authChanged", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("authChanged", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <>
      <GlobalStyles />
      <ScrollToTop />
      <GoToTopButton />

      {isLoggedIn && <Banner />}
      {isLoggedIn && <Navbar />}

      <Routes>
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/my-rentals" element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/proceed-to-payment" element={<ProtectedRoute><ProceedToPayment /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard activeTab="overview" /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminRoute><AdminProducts /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminRoute><AdminDashboard activeTab="orders" /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/maintenance" element={<ProtectedRoute><AdminRoute><AdminDashboard activeTab="maintenance" /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/add-product" element={<ProtectedRoute><AdminRoute><AddProduct /></AdminRoute></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/register"} replace />} />
      </Routes>

      {isLoggedIn && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;