import React from 'react';

const AmountInput = ({ amount, onChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Amount</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">₹</span>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-4xl text-white placeholder-gray-700 focus:outline-none focus:border-white text-center font-bold tracking-wider transition-all"
        />
      </div>
    </div>
  );
};

export default AmountInput;
