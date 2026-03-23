import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';

const ConfirmTransfer = ({ onConfirm, isPending, amount, recipient }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onConfirm}
      disabled={isPending || !amount || parseFloat(amount) <= 0 || !recipient}
      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
        isPending || !amount || parseFloat(amount) <= 0 || !recipient
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-indigo-500/25'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <Send className="w-5 h-5 mr-2" />
      )}
      {isPending ? 'Processing...' : 'Send Funds'}
    </motion.button>
  );
};

export default ConfirmTransfer;
