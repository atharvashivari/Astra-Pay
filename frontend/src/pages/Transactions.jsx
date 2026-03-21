import React from 'react';
import TransactionList from '../components/TransactionList';

const TransactionsPage = () => {
  return (
    <div className="space-y-8">
      <header className="border-b-4 border-black pb-4">
        <h2 className="text-3xl font-black uppercase">Transaction History</h2>
        <p className="font-bold text-gray-500 mt-2">A complete ledger of all your incoming and outgoing transfers.</p>
      </header>
      
      <TransactionList />
    </div>
  );
};

export default TransactionsPage;
