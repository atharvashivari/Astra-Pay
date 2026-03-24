import React from 'react';
import BalanceDisplay from '../components/BalanceDisplay';
import TransferForm from '../components/TransferForm';
import TransactionList from '../components/TransactionList';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
      className="max-w-6xl mx-auto"
    >
      
      {/* Responsive Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance Card - prominent focus */}
        <div className="lg:col-span-2 flex flex-col min-h-[300px]">
          <BalanceDisplay />
        </div>

        {/* Quick Transfer Form */}
        <div className="lg:col-span-1 flex flex-col min-h-[400px]">
          <TransferForm />
        </div>

        {/* Transactions list spanning full width underneath */}
        <div className="lg:col-span-3 mt-4">
          <TransactionList />
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
