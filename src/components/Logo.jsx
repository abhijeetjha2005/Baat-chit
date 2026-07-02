// src/components/Logo.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="mb-10 flex justify-center"
    >
      <div className="w-32 h-32">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 280 280" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="newCircleGrad" x1="25%" y1="20%" x2="75%" y2="85%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#10B981"/>
              <stop offset="100%" stopColor="#14B8A6"/>
            </linearGradient>
            
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <circle cx="140" cy="135" r="125" fill="#064E3B" opacity="0.3" filter="url(#glow)"/>
          <circle cx="140" cy="135" r="115" fill="url(#newCircleGrad)"/>
          <circle cx="140" cy="135" r="88" fill="#0F172A"/>

          <rect x="68" y="78" width="145" height="115" rx="28" fill="#F8FAFC" stroke="#1E2937" strokeWidth="16"/>
          <path d="M92 175 L65 205 L98 188 Z" fill="#F8FAFC"/>

          <rect x="85" y="95" width="105" height="9" rx="4.5" fill="#1E2937"/>
          <rect x="85" y="115" width="118" height="9" rx="4.5" fill="#1E2937"/>
          <rect x="85" y="135" width="72" height="9" rx="4.5" fill="#1E2937"/>
          <rect x="85" y="155" width="95" height="9" rx="4.5" fill="#1E2937"/>

          <circle cx="190" cy="88" r="16" fill="#22C55E" stroke="#0F172A" strokeWidth="5"/>
          
          <text 
            x="140" 
            y="245" 
            textAnchor="middle" 
            fill="#F1F5F9" 
            fontFamily="Arial Black, sans-serif" 
            fontSize="29" 
            fontWeight="900" 
            letterSpacing="1" 
            style={{ filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.4))" }}
          >
            बात-चीत
          </text>
        </svg>
      </div>
    </motion.div>
  );
};

export default Logo;
