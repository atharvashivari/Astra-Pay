import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TransferForm = () => {
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: async (transferData) => {
      const idempotencyKey = uuidv4();
      return apiClient.post('/wallet/transfer', transferData, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
      });
    },
    onSuccess: () => {
      alert('Transfer Successful!');
      queryClient.invalidateQueries(['balance']);
      setToWallet('');
      setAmount('');
    },
    onError: (error) => {
      alert('Transfer Failed: ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    transferMutation.mutate({ toWallet, amount: parseFloat(amount) });
  };

  return (
    <div className="p-6 border-2 border-black bg-white max-w-md">
      <h2 className="text-2xl font-bold mb-4">Transfer Funds</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold">To Wallet Address:</label>
          <input
            type="text"
            value={toWallet}
            onChange={(e) => setToWallet(e.target.value)}
            className="w-full border-2 border-black p-2"
            required
          />
        </div>
        <div>
          <label className="block font-bold">Amount (₹):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border-2 border-black p-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={transferMutation.isPending}
          className="bg-blue-600 text-white font-bold py-2 px-4 border-2 border-black hover:bg-blue-700 disabled:bg-gray-400"
        >
          {transferMutation.isPending ? 'Processing...' : 'Send Money'}
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
