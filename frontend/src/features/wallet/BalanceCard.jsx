import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus } from 'lucide-react';

const BalanceCard = ({ balance, isLoading, onTopUp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full py-6">
        <div className="bg-white/5 p-3 rounded-2xl mb-4 border border-white/10">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-sm">Total Balance</p>
        <h2 className="text-5xl font-bold text-white tracking-tight mb-8 font-mono">
          {isLoading ? (
            <span className="text-gray-600 animate-pulse">₹***.**</span>
          ) : (
            `₹${balance ? parseFloat(balance).toFixed(2) : '0.00'}`
          )}
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTopUp}
          className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-full font-bold shadow-lg shadow-white/10 transition-all hover:shadow-white/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add Funds</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
