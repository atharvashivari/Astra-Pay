import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Eye, EyeOff, Copy, Lock, ShieldCheck, Power } from 'lucide-react';
import toast from 'react-hot-toast';

const CardsPage = () => {
  const { user } = useAuth();
  const [showNumber, setShowNumber] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const cardNumber = showNumber ? "4829 1045 9928 3012" : "•••• •••• •••• 3012";
  const cvv = showNumber ? "842" : "•••";

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 h-full flex flex-col relative z-10 w-full max-w-4xl mx-auto">
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card Visualization */}
        <div className="flex flex-col items-center lg:items-start justify-start relative">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotateY: 15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className={`w-full max-w-md aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 shadow-2xl border ${isFrozen ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]'} backdrop-blur-2xl group`}
          >
            {/* Card Background gradient */}
            <div className={`absolute inset-0 ${isFrozen ? 'bg-gradient-to-br from-blue-900/60 to-black/80' : 'bg-gradient-to-br from-white/10 to-black/80'} z-0`}></div>
            
            {/* Glossy overlay layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-0 opacity-50 pointer-events-none"></div>

            {isFrozen && (
              <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
                  <Lock size={16} className="text-blue-400" />
                  <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">Frozen</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="relative z-20 flex justify-between items-start">
              <span className="font-black italic text-2xl tracking-tighter text-white drop-shadow-md">
                ASTRA<span className="text-white group-hover:text-gray-300 transition-colors">PAY</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="w-6 h-4 border border-white/30 rounded-sm"></div>
                  <div className="absolute w-full h-[1px] bg-white/30 top-1/2 -translate-y-1/2"></div>
                </span>
                <span className="text-xl font-black italic tracking-tighter text-white/90">VISA</span>
              </div>
            </div>

            {/* Card Info */}
            <div className="relative z-20 space-y-4">
              <div className="flex items-end justify-between group/number">
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-[0.15em] text-white/90 drop-shadow-sm">
                  {cardNumber}
                </p>
                <button 
                  onClick={() => copyToClipboard("4829104599283012", "Card Number")}
                  className="opacity-0 group-hover/number:opacity-100 transition-opacity p-2 -mr-2 text-gray-400 hover:text-white focus:outline-none"
                  disabled={isFrozen}
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="flex justify-between items-end text-sm">
                <div className="uppercase tracking-widest">
                  <p className="text-[10px] text-gray-400 font-bold mb-1">Cardholder</p>
                  <p className="font-bold text-white max-w-[150px] truncate">
                    {user?.username || 'GUEST USER'}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="uppercase tracking-widest text-right">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">Expires</p>
                    <p className="font-bold text-white font-mono">12/29</p>
                  </div>
                  <div className="uppercase tracking-widest text-right group/cvv relative">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">CVV</p>
                    <p className="font-bold text-white font-mono flex items-center gap-1 cursor-pointer" onClick={() => {if(showNumber && !isFrozen) copyToClipboard("842", "CVV")}}>
                      {cvv} {showNumber && <Copy size={12} className="opacity-0 group-hover/cvv:opacity-100 transition-opacity" />}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${showNumber ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {showNumber ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg lg:text-base xl:text-lg">Reveal Details</h3>
                <p className="text-gray-400 text-sm">Show card number and CVV</p>
              </div>
            </div>
            <button 
              onClick={() => setShowNumber(!showNumber)}
              disabled={isFrozen}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${showNumber ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
            >
              {showNumber ? 'Hide' : 'Reveal'}
            </button>
          </div>

          <div className="glass p-6 rounded-2xl flex items-center justify-between border border-white/5 shadow-lg">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                <Power size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg lg:text-base xl:text-lg">Freeze Card</h3>
                <p className="text-gray-400 text-sm">Temporarily block all transactions</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsFrozen(!isFrozen);
                if (!isFrozen) setShowNumber(false);
              }}
              className={`px-4 py-2 w-24 rounded-lg font-bold text-sm transition-all focus:outline-none ${isFrozen ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {isFrozen ? 'Unfreeze' : 'Freeze'}
            </button>
          </div>

          <div className="glass p-6 rounded-2xl flex items-start border border-white/5 shadow-lg gap-4">
            <div className="p-3 bg-gray-800/50 text-green-400 rounded-full shrink-0">
               <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Online Security Enabled</h3>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">This card is protected with enterprise AES-256 encryption. Transactions are continuously monitored for fraud.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CardsPage;
