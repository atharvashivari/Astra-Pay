import React from 'react';

const TransactionList = () => {
  const dummyTransactions = [
    { id: 1, date: '2024-03-19', type: 'Sent', to: 'wallet_abc_123', amount: 500.00, status: 'Success' },
    { id: 2, date: '2024-03-18', type: 'Received', from: 'wallet_xyz_789', amount: 1200.00, status: 'Success' },
    { id: 3, date: '2024-03-17', type: 'Sent', to: 'wallet_def_456', amount: 150.00, status: 'Failed' },
  ];

  return (
    <div className="p-6 border-2 border-black bg-white">
      <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
      <table className="w-full border-collapse border-2 border-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-black p-2 text-left">Date</th>
            <th className="border-2 border-black p-2 text-left">Type</th>
            <th className="border-2 border-black p-2 text-left">Entity</th>
            <th className="border-2 border-black p-2 text-left">Amount (₹)</th>
            <th className="border-2 border-black p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {dummyTransactions.map((tx) => (
            <tr key={tx.id}>
              <td className="border-2 border-black p-2">{tx.date}</td>
              <td className="border-2 border-black p-2">{tx.type}</td>
              <td className="border-2 border-black p-2">{tx.to || tx.from}</td>
              <td className="border-2 border-black p-2">₹{tx.amount.toFixed(2)}</td>
              <td className="border-2 border-black p-2">{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
