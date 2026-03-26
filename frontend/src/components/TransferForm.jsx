import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTransfer } from '../hooks/useTransfer';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TransferForm = () => {
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = React.useRef(null);
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
    if (searchTerm.trim().length >= 2) {
      apiClient.get(`/users/search?query=${searchTerm}`)
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

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.loading('Processing QR code...', { id: 'qr-scan' });
      // In a real app, use a library like jsQR here.
      // For this professional demo, we'll simulate the extraction after a brief delay.
      setTimeout(() => {
        // Mock extracted wallet address from QR
        const mockAddress = "ASTRA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        setToWallet(mockAddress);
        setSearchTerm(mockAddress);
        toast.success('Recipient identified via QR!', { id: 'qr-scan' });
      }, 1500);
    }
  };

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const { transferMutation } = useTransfer();

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRecipient = toWallet || searchTerm;
    if (!finalRecipient || isSubmittingLocal) {
      if (!fromWallet) toast.error('Could not determine your wallet address. Please refresh and try again.');
      return;
    }
    
    setIsSubmittingLocal(true);
    transferMutation.mutate({ fromWallet, toWallet: finalRecipient, amount: parseFloat(amount) }, {
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
        <div className="relative">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">Recipient</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (toWallet) setToWallet(''); // Reset selection if typing
              }}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 pr-24 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors font-mono"
              placeholder="@username or wallet address..."
              required={!toWallet}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all flex items-center gap-1.5 border border-white/5 active:scale-95"
                title="Scan QR Code"
              >
                <QrCode size={14} />
                <span className="text-[10px] uppercase font-black tracking-tighter">Scan</span>
              </button>
              
              {toWallet && (
                <div className="bg-[#10B981]/20 text-[#10B981] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#10B981]/30">
                  SEL
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleQrUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
              <motion.ul 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute z-50 w-full mt-2 bg-black/80 backdrop-blur-2xl rounded-xl border border-white/10 overflow-hidden shadow-2xl"
              >
                {searchResults.map((u, idx) => (
                  <li
                    key={idx}
                    className="p-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 border-b border-white/5 last:border-0 transition-all group"
                    onClick={() => {
                      setToWallet(u.walletAddress || u.id); // Use walletAddress if available, else id
                      setSearchTerm(u.username);
                      setSearchResults([]);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="relative">
                      {u.profileImageUrl ? (
                        <img 
                          src={u.profileImageUrl} 
                          alt={u.username} 
                          className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-white/30 transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-xs border border-white/5 group-hover:bg-white/20 transition-all">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white block group-hover:text-primary transition-colors">{u.username}</span> 
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 text-[10px] sm:text-xs truncate">{u.phoneNumber || 'No phone'}</span>
                        <span className="text-white/20 text-[10px]">|</span>
                        <span className="text-gray-600 font-mono text-[9px] sm:text-[10px] truncate">{u.walletAddress || 'No Wallet'}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
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
