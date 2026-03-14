import React from 'react';
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
/* eslint-enable no-unused-vars */
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

const Banner = () => {
  return (
    <div className="relative w-full bg-[#0f0f1b] overflow-hidden border-b border-white/5 py-2">
      {/* Animated Gradient Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-24 bg-[#560BAD] blur-[100px] rounded-full"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 px-6">
        
        {/* Left Side: Eye-Catching Badge */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xl"
        >
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Limited Access</span>
        </motion.div>

        {/* Middle: The Hook with Animated Highlight */}
        <div className="flex items-center gap-4 overflow-hidden">
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm font-bold text-white tracking-wide text-center"
          >
            Why Buy? <span className="relative inline-block px-1">
              <span className="relative z-10 text-white">Rent what you need</span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute bottom-0 left-0 h-2 bg-[#560BAD]/60 -rotate-1"
              />
            </span> — Save Money, Live Better.
          </motion.p>
        </div>

        {/* Right Side: Micro-Action */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Explore Now 
          <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
        </motion.button>

      </div>

      {/* Aesthetic Bottom Border Pulse */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500 to-transparent"
      />
    </div>
  );
};

export default Banner;