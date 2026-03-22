import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShieldCheck } from 'lucide-react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

const AddFundsModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const { data } = await apiClient.post('/payments/create-order', { amount: Number(amount) });
      const { orderId } = data;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SLE7mvITAOsDDj', // User needs to provide this
        amount: Number(amount) * 100, // paise
        currency: 'INR',
        name: 'Astra-Pay',
        description: 'Wallet Top-up',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Payment captured by razorpay. Send to backend for solid verification!
            toast.loading("Verifying payment...", { id: "verify-toast" });
            await apiClient.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success(`Payment of ₹${amount} successful!`, { id: "verify-toast" });
            
            // Optimistically update balance
            const previousBalance = queryClient.getQueryData(['balance']);
            if (previousBalance) {
              queryClient.setQueryData(['balance'], {
                ...previousBalance,
                balance: parseFloat(previousBalance.balance) + parseFloat(amount),
              });
            }
            
            setTimeout(() => {
               queryClient.invalidateQueries({ queryKey: ['balance'] });
               queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }, 1000); 
            
            onClose();
            setAmount('');
          } catch (error) {
            console.error(error);
            toast.error("Payment verification failed!", { id: "verify-toast" });
          }
        },
        prefill: {
          name: user?.username || 'GUEST USER',
          email: user?.email || 'guest@astrapay.dev',
        },
        theme: {
          color: '#FF4D8D', // Primary neon pink
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        setIsProcessing(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (error) {
       console.error(error);
       toast.error('Failed to initiate payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          />
          <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ type: "spring", stiffness: 300, damping: 25 }}
             className="relative z-10 glass p-8 rounded-3xl w-full max-w-sm border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900/40"
          >
            <button 
               onClick={onClose}
               className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                <Plus size={32} />
              </div>
              <h3 className="font-black text-2xl text-white uppercase tracking-wider">Top Up Wallet</h3>
              <p className="text-gray-400 text-sm mt-1">Add funds securely via Razorpay</p>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2 block text-center">Amount to Add (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-3xl font-black text-white text-center focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(255,77,141,0.25)] hover:shadow-[0_0_30px_rgba(255,77,141,0.5)] disabled:opacity-50 disabled:shadow-none transition-all focus:outline-none"
              >
                {isProcessing ? 'Connecting...' : 'Proceed to Pay'}
              </motion.button>
              
              <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-4">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Secured by Razorpay. 100% Safe.</span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddFundsModal;
