import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const TransactionList = () => {
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      
      {transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map((tx, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={tx.id}
              className="glass p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors"
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
    </div>
  );
};

export default TransactionList;
