import React, { useState } from 'react';
import { Search } from 'lucide-react';

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSelectUser({ walletAddress: query });
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search by Wallet Address..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
      </form>
    </div>
  );
};

export default UserSearch;
