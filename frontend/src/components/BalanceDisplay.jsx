import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';

const BalanceDisplay = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await apiClient.get('/wallet/balance');
      return response.data;
    },
  });

  if (isLoading) return <div className="p-4 border-2 border-black">Loading balance...</div>;
  if (error) return <div className="p-4 border-2 border-black text-red-600">Error loading balance</div>;

  return (
    <div className="p-4 border-2 border-black bg-white inline-block">
      <h2 className="text-xl font-bold">Total Balance: ₹{data?.balance?.toFixed(2) || '0.00'}</h2>
    </div>
  );
};

export default BalanceDisplay;
