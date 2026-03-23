import React from 'react';

const AmountInput = ({ amount, onChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-400 mb-2">Amount</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">₹</span>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl px-8 py-6 text-4xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-center font-light tracking-wider transition-all"
        />
      </div>
    </div>
  );
};

export default AmountInput;
