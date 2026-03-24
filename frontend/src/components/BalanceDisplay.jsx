import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Plus } from 'lucide-react';
import AddFundsModal from './AddFundsModal';

// Helper component for Framer Motion rolling number effect
const RollingNumber = ({ value }) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current) => `₹${current.toFixed(2)}`);

  return <motion.span>{display}</motion.span>;
};

const BalanceDisplay = () => {
  const [isAddFundsOpen, setIsAddFundsOpen] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await apiClient.get('/wallet/balance');
      return response.data;
    },
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 p-8 rounded-3xl glass border border-white/10 flex flex-col justify-center items-start relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <h2 className="text-gray-400 font-bold tracking-widest text-sm uppercase mb-3 z-10">Total Balance</h2>
      
      <div className="text-5xl lg:text-7xl font-black tracking-tighter text-white z-10">
        {isLoading ? (
          <span className="animate-pulse text-gray-600">Loading...</span>
        ) : error ? (
          <span className="text-red-500 text-xl font-normal">Error loading</span>
        ) : (
          <RollingNumber value={data?.balance || 0} />
        )}
      </div>

      <div className="absolute bottom-8 right-8 z-20">
        <button 
          onClick={() => setIsAddFundsOpen(true)}
          className="bg-white hover:bg-white/90 text-black px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
        >
          <Plus size={18} /> Add Funds
        </button>
      </div>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
    </motion.div>
  );
};

export default BalanceDisplay;
