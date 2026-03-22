import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, X, Info } from 'lucide-react';

const TransactionList = () => {
  const [selectedTx, setSelectedTx] = useState(null);

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await apiClient.get('/wallet/transactions');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl glass text-center">
        <p className="text-gray-500 animate-pulse font-medium">Syncing ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl glass text-center">
        <p className="text-red-500 font-medium">Network error fetching ledger.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      
      {transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map((tx, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="glass p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-pointer shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`shrink-0 p-3 rounded-xl ${tx.status === 'SUCCESS' ? 'bg-secondary/20 text-secondary' : 'bg-gray-800 text-gray-400'}`}>
                   {/* Standardizing to an outgoing/transfer icon for visual consistency in the demo */}
                   <ArrowUpRight size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white text-sm truncate w-full" title={tx.toWallet}>
                    {tx.toWallet}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'} 
                    <span className="opacity-50">•</span> 
                    <span className={tx.status === 'SUCCESS' ? 'text-green-400' : 'text-yellow-500'}>{tx.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-black text-lg text-white">₹{Number(tx.amount).toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 rounded-3xl text-center">
          <Clock className="mx-auto text-gray-600 mb-4" size={40} />
          <p className="text-gray-400 font-medium">No activity yet on this account</p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="relative z-10 glass p-8 rounded-3xl w-full max-w-lg border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900/40"
            >
              <button 
                 onClick={() => setSelectedTx(null)}
                 className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${selectedTx.status === 'SUCCESS' ? 'bg-secondary/20 text-secondary' : 'bg-gray-800 text-gray-400'}`}>
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-white">Transaction Details</h3>
                  <p className="text-gray-400 font-mono text-sm tracking-wider">#{selectedTx.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Amount</span>
                  <span className="text-3xl font-black text-white drop-shadow-md tracking-tighter">₹{Number(selectedTx.amount).toFixed(2)}</span>
                </div>

                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Status</span>
                     <span className={`font-black px-3 py-1 rounded-md text-xs tracking-wider uppercase shadow-sm ${selectedTx.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'}`}>
                       {selectedTx.status}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Date & Time</span>
                     <span className="font-mono text-sm text-white/90">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
                   <div>
                     <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">Sender Wallet</span>
                     <span className="font-mono text-xs sm:text-sm text-white/70 break-all">{selectedTx.fromWallet}</span>
                   </div>
                   <div className="w-full h-[1px] bg-white/5 my-2"></div>
                   <div>
                     <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">Recipient Wallet</span>
                     <span className="font-mono text-xs sm:text-sm text-white break-all font-bold">{selectedTx.toWallet}</span>
                   </div>
                </div>
                
                {selectedTx.traceId && (
                  <div className="bg-black/50 p-3 rounded-xl border border-white/5 text-center mt-6">
                    <span className="text-gray-600 font-bold uppercase text-[10px] tracking-widest block mb-1">Network Trace ID</span>
                    <span className="font-mono text-[10px] sm:text-xs text-gray-500">{selectedTx.traceId}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionList;
