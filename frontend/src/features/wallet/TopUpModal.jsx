import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CreditCard } from 'lucide-react';

const TopUpModal = ({ isOpen, onClose, onTopUp, isPending }) => {
  const [amount, setAmount] = useState('');

  const handleTopUp = () => {
    if (amount && parseFloat(amount) > 0) {
      onTopUp(amount);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          
          <div className="flex justify-between items-center p-6 border-b border-slate-800/80 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-cyan-400" />
              Add Funds via Razorpay
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 relative z-10">
            <div className="mb-6 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-cyan-400 transition-colors">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-4 text-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
              />
            </div>
            <button
              onClick={handleTopUp}
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all ${
                isPending || !amount || parseFloat(amount) <= 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/25'
              }`}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isPending ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TopUpModal;
