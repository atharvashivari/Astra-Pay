import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTransfer } from '../hooks/useTransfer';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search } from 'lucide-react';

const TransferForm = () => {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    apiClient.get('/wallet/balance')
      .then(res => {
        if (res.data?.walletAddress) {
          setFromWallet(res.data.walletAddress);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      apiClient.get(`/users/search?username=${searchTerm}`)
        .then(res => {
          setSearchResults(res.data);
          setShowDropdown(true);
        })
        .catch(() => {
          setSearchResults([]);
          setShowDropdown(false);
        });
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const { transferMutation } = useTransfer();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromWallet || isSubmittingLocal) {
      if (!fromWallet) toast.error('Could not determine your wallet address. Please refresh and try again.');
      return;
    }
    
    setIsSubmittingLocal(true);
    transferMutation.mutate({ fromWallet, toWallet, amount: parseFloat(amount) }, {
      onSettled: () => setIsSubmittingLocal(false),
      onSuccess: () => {
        setToWallet('');
        setAmount('');
        setSearchTerm('');
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-3xl glass flex flex-col relative h-full flex-1 border border-white/5 shadow-xl"
    >
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
        <Send className="text-primary" size={20} /> Quick Transfer
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col h-full">
        {/* Focus Mode Form */}
        <div className="relative z-20">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">Search Recipient</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="@username"
            />
          </div>
          
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
              <motion.ul 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute z-50 w-full mt-2 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl"
              >
                {searchResults.map((u, idx) => (
                  <li
                    key={idx}
                    className="p-3 hover:bg-white/10 cursor-pointer text-sm flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors"
                    onClick={() => {
                      setToWallet(u.walletAddress);
                      setSearchTerm('');
                      setShowDropdown(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{u.username}</span> 
                      <span className="text-gray-500 font-mono text-[10px] sm:text-xs text-ellipsis">{u.walletAddress}</span>
                    </div>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">To Wallet Address</label>
          <input
            type="text"
            value={toWallet}
            onChange={(e) => setToWallet(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 font-mono text-sm placeholder:text-gray-600 transition-colors"
            placeholder="Recipient's wallet UUID..."
            required
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-3xl font-black text-white focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={transferMutation.isPending || isSubmittingLocal || !fromWallet}
          className="mt-auto w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,77,141,0.25)] hover:shadow-[0_0_30px_rgba(255,77,141,0.5)] disabled:opacity-50 disabled:shadow-none transition-all relative overflow-hidden group focus:outline-none flex outline-none"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex flex-1 items-center justify-center gap-2">
            {transferMutation.isPending || isSubmittingLocal ? 'Processing Encryption...' : (
              <>Send Completely <Send size={18} /></>
            )}
          </span>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TransferForm;
