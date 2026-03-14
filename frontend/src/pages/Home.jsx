import React, { useState, useEffect } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
/* eslint-enable no-unused-vars */
import {  AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import SeeProductButton from "../UI/SeeProductButton";
import Products from "./Products.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Support from "./Support.jsx";

const WORDS = ["Reimagined.", "Elevated.", "Redefined.", "Simplified."];

const useMouseParallax = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const move = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) / cx);
      y.set((e.clientY - cy) / cy);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return { springX, springY };
};

const FloatingOrb = ({ style, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const WordCycler = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden" style={{ minWidth: "360px" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 60, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -60, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block italic font-light"
          style={{
            background: "linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #38bdf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const StatCard = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="flex flex-col items-center px-6 py-4 rounded-2xl"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(12px)",
    }}
  >
    <span className="text-white font-black text-2xl tracking-tight">{value}</span>
    <span className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-0.5 font-semibold">{label}</span>
  </motion.div>
);

const ImageCard = ({ src, alt, className, style, delay, parallaxX = 0, parallaxY = 0, springX, springY }) => {
  const moveX = useTransform(springX, [-1, 1], [-parallaxX, parallaxX]);
  const moveY = useTransform(springY, [-1, 1], [-parallaxY, parallaxY]);

  return (
    <motion.div
      className={`overflow-hidden rounded-3xl ${className}`}
      style={{ ...style, x: moveX, y: moveY }}
      initial={{ opacity: 0, scale: 0.88, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, zIndex: 50 }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  );
};

const ScrollIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2.2 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
  >
    <span className="text-slate-600 text-[9px] uppercase tracking-[0.35em] font-bold">Scroll</span>
    <motion.div
      className="w-px h-10 bg-linear-to-b from-slate-600 to-transparent"
      animate={{ scaleY: [0, 1, 0], originY: 0 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.div>
);

const NoiseBg = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" style={{ zIndex: 1 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

const Home = () => {
  const { springX, springY } = useMouseParallax();

  const gridX1 = useTransform(springX, [-1, 1], [-18, 18]);
  const gridY1 = useTransform(springY, [-1, 1], [-18, 18]);
  // const gridX2 = useTransform(springX, [-1, 1], [12, -12]);
  // const gridY2 = useTransform(springY, [-1, 1], [12, -12]);

  return (
    <div className="w-full overflow-x-hidden bg-[#080810]">

      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <NoiseBg />

        <FloatingOrb
          delay={0}
          style={{
            width: 700, height: 700,
            top: "-20%", left: "-15%",
            background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
        <FloatingOrb
          delay={2}
          style={{
            width: 500, height: 500,
            bottom: "-10%", right: "-10%",
            background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
        <FloatingOrb
          delay={4}
          style={{
            width: 300, height: 300,
            top: "40%", left: "42%",
            background: "radial-gradient(circle, rgba(192,132,252,0.10) 0%, transparent 70%)",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            x: gridX1,
            y: gridY1,
            zIndex: 1,
          }}
        />

        <div className="relative z-10 w-full max-w-350 mx-auto px-6 sm:px-12 lg:px-20 flex items-center h-full">
          <div className="w-full grid lg:grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center">

            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex items-center gap-3 mb-8"
              >
                <motion.div
                  animate={{ scaleX: [0, 1] }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  className="h-px w-10 origin-left"
                  style={{ background: "linear-gradient(90deg, #c084fc, transparent)" }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.35em]"
                  style={{
                    background: "linear-gradient(90deg, #c084fc, #818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Premium Rentals · Est. 2024
                </span>
              </motion.div>

              <div className="overflow-hidden mb-2">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="text-white font-black leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(3.2rem, 6vw, 5.5rem)" }}
                >
                  Living,
                </motion.h1>
              </div>

              <div className="overflow-hidden mb-2">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(3.2rem, 6vw, 5.5rem)" }}
                >
                  <WordCycler />
                </motion.h1>
              </div>

              <div className="overflow-hidden mb-10">
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="text-white font-black leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(3.2rem, 6vw, 5.5rem)" }}
                >
                  For You.
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                className="text-slate-400 text-lg max-w-sm leading-relaxed mb-10 font-light"
              >
                Own the experience, not the burden. High-quality furniture curated for modern life — delivered, installed, replaced.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className="flex items-center gap-6 mb-12"
              >
                <SeeProductButton name="Explore Catalog" />

                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold group"
                >
                  <span>Watch Demo</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-purple-400"
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="flex items-center gap-3"
              >
                {/* <StatCard value="1.2k+" label="Active Users" delay={1.3} />
                <StatCard value="98%" label="Satisfaction" delay={1.4} />
                <StatCard value="48h" label="Delivery" delay={1.5} /> */}
              </motion.div>
            </div>

            <div className="relative hidden lg:block h-145 xl:h-160">

              <ImageCard
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop"
                alt="Living room"
                className="absolute shadow-2xl"
                style={{
                  width: "68%",
                  height: "80%",
                  top: "0%",
                  left: "0%",
                  border: "1px solid rgba(255,255,255,0.08)",
                  zIndex: 10,
                }}
                delay={0.6}
                parallaxX={10}
                parallaxY={8}
                springX={springX}
                springY={springY}
              />

              <ImageCard
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop"
                alt="Sofa detail"
                className="absolute shadow-2xl"
                style={{
                  width: "48%",
                  height: "50%",
                  bottom: "0%",
                  right: "0%",
                  border: "1px solid rgba(255,255,255,0.08)",
                  zIndex: 20,
                }}
                delay={0.85}
                parallaxX={-14}
                parallaxY={-10}
                springX={springX}
                springY={springY}
              />

              <ImageCard
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400&auto=format&fit=crop"
                alt="Chair"
                className="absolute shadow-xl"
                style={{
                  width: "30%",
                  height: "32%",
                  top: "10%",
                  right: "2%",
                  border: "1px solid rgba(255,255,255,0.06)",
                  zIndex: 15,
                }}
                delay={1.0}
                parallaxX={20}
                parallaxY={-16}
                springX={springX}
                springY={springY}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  bottom: "28%",
                  left: "2%",
                  zIndex: 30,
                  background: "rgba(15,8,30,0.7)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(192,132,252,0.2)",
                  borderRadius: "1.25rem",
                  padding: "16px 20px",
                  width: "200px",
                  x: useTransform(springX, [-1, 1], [-6, 6]),
                  y: useTransform(springY, [-1, 1], [-6, 6]),
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Orders</span>
                </div>
                <p className="text-white font-black text-xl">247</p>
                <p className="text-emerald-400 text-[10px] font-bold mt-0.5">↑ 18% this week</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.7 }}
                style={{
                  position: "absolute",
                  top: "55%",
                  right: "-4%",
                  zIndex: 30,
                  background: "rgba(15,8,30,0.75)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(129,140,248,0.2)",
                  borderRadius: "1rem",
                  padding: "12px 16px",
                  x: useTransform(springX, [-1, 1], [8, -8]),
                  y: useTransform(springY, [-1, 1], [5, -5]),
                }}
              >
                <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold mb-1">Avg. Rating</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-black text-lg">4.9</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5 + i * 0.08 }}
                        className="text-amber-400 text-xs"
                      >★</motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 280, height: 280,
                  top: "10%", left: "20%",
                  background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  zIndex: 5,
                  x: useTransform(springX, [-1, 1], [-20, 20]),
                  y: useTransform(springY, [-1, 1], [-20, 20]),
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute pointer-events-none"
                style={{
                  bottom: "15%", left: "45%",
                  zIndex: 5,
                  x: useTransform(springX, [-1, 1], [10, -10]),
                  y: useTransform(springY, [-1, 1], [-10, 10]),
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(192,132,252,0.15)" strokeWidth="1" strokeDasharray="4 6" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        <ScrollIndicator />

        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #080810)", zIndex: 2 }}
        />
      </section>

      <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

      <main className="bg-white">
        <section className="py-24">
          <Products />
        </section>

        <section className="py-24 bg-gray-50 rounded-t-[60px] shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.05)]">
          <HowItWorks />
        </section>

        <section className="py-24 bg-white">
          <Support />
        </section>
      </main>

      <footer className="bg-[#080810] py-12 px-6 flex justify-between items-center text-gray-600 text-[10px] uppercase tracking-[0.2em]">
        <span>RentEase © 2026</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;