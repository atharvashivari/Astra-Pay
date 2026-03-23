import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus } from 'lucide-react';

const BalanceCard = ({ balance, isLoading, onTopUp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full py-6">
        <div className="bg-slate-700/50 p-3 rounded-2xl mb-4">
          <Wallet className="w-8 h-8 text-cyan-400" />
        </div>
        <p className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-sm">Total Balance</p>
        <h2 className="text-5xl font-bold text-white tracking-tight mb-8 font-mono">
          {isLoading ? (
            <span className="text-slate-600 animate-pulse">₹***.**</span>
          ) : (
            `₹${balance ? parseFloat(balance).toFixed(2) : '0.00'}`
          )}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTopUp}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
        >
          <Plus className="w-5 h-5" />
          <span>Add Funds</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
