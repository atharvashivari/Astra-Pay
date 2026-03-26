import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Header = ({ title, subtitle }) => {
  const { socketConnected } = useAuth();
 
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{title || 'Overview'}</h2>
        {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-white/10 rounded-full">
        <div className="relative flex h-3 w-3">
          {socketConnected && (
            <motion.span 
              animate={{ scale: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
            ></motion.span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${socketConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></span>
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-black ${socketConnected ? 'text-green-500' : 'text-red-500'}`}>
          {socketConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    </header>
  );
};

export default Header;
