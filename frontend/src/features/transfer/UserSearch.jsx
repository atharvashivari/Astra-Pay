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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
      </form>
    </div>
  );
};

export default UserSearch;
