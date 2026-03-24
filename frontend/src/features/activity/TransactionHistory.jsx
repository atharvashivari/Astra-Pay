import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const TransactionHistory = ({ transactions, isLoading }) => {
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-full bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-700 rounded"></div>
                <div className="h-3 w-20 bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="h-5 w-16 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-gray-500 p-8 text-center bg-white/5 rounded-2xl border border-white/10">
        No transaction history found.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'text-white bg-white/10 border-white/20';
      case 'FAILED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'PENDING': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((tx, index) => {
        const isDeposit = tx.type === 'DEPOSIT';
        const isReceived = isDeposit || (user?.walletAddress && tx.toWallet === user?.walletAddress) || (tx.fromWallet !== user?.username && tx.fromWallet !== user?.walletAddress && !isDeposit); // Rough heuristics if user is not fully loaded
        
        return (
          <motion.div
            key={tx.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors group"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full transition-transform group-hover:scale-110 ${isReceived ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {isReceived ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-white font-medium">{isDeposit ? 'Top-Up / Wallet Credit' : (isReceived ? 'Received Funds' : 'Sent Funds')}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center space-x-1 ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    <span className="ml-1">{tx.status}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(tx.createdAt || new Date()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold font-mono text-lg ${isReceived ? 'text-white' : 'text-gray-400'}`}>
                {isReceived ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TransactionHistory;
