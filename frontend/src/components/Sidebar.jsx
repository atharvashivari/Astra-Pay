import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen border-r-4 border-black bg-white p-6">
      <h1 className="text-3xl font-black mb-10 uppercase tracking-tighter">Astra-Pay</h1>
      <nav className="space-y-4">
        <div className="p-2 border-2 border-black font-bold bg-gray-200 cursor-default">Dashboard</div>
        <div className="p-2 border-2 border-black font-bold hover:bg-gray-100 cursor-pointer">Transactions</div>
        <div className="p-2 border-2 border-black font-bold hover:bg-gray-100 cursor-pointer">Cards</div>
        <div className="p-2 border-2 border-black font-bold hover:bg-gray-100 cursor-pointer">Profile</div>
        <div className="mt-10 pt-10 border-t-2 border-black font-bold text-red-600 cursor-pointer">Logout</div>
      </nav>
    </div>
  );
};

export default Sidebar;
