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
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
            ></motion.span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${socketConnected ? 'bg-white' : 'bg-white/20'}`}></span>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted">
          {socketConnected ? 'Live Connection' : 'Offline'}
        </span>
      </div>
    </header>
  );
};

export default Header;
