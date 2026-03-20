import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';

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
      <div className="p-6 border-2 border-black bg-white">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <p className="text-gray-500 italic">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-2 border-black bg-white">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <p className="text-red-500">Error loading transactions.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border-2 border-black bg-white">
      <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
      {transactions && transactions.length > 0 ? (
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-2 border-black p-2 text-left">Date</th>
              <th className="border-2 border-black p-2 text-left">From</th>
              <th className="border-2 border-black p-2 text-left">To</th>
              <th className="border-2 border-black p-2 text-left">Amount (₹)</th>
              <th className="border-2 border-black p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border-2 border-black p-2">
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="border-2 border-black p-2 font-mono text-xs">{tx.fromWallet}</td>
                <td className="border-2 border-black p-2 font-mono text-xs">{tx.toWallet}</td>
                <td className="border-2 border-black p-2">₹{Number(tx.amount).toFixed(2)}</td>
                <td className={`border-2 border-black p-2 font-bold ${tx.status === 'SUCCESS' ? 'text-green-600' : tx.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {tx.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 italic">No transactions found.</p>
      )}
    </div>
  );
};

export default TransactionList;
