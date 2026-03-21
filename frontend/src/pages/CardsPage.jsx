import React from 'react';

const CardsPage = () => {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="border-b-4 border-black pb-4">
        <h2 className="text-3xl font-black uppercase">Virtual Cards</h2>
        <p className="font-bold text-gray-500 mt-2">Manage your Astra-Pay debit cards.</p>
      </header>
      
      <div className="flex-1 border-4 border-black border-dashed flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-4xl font-black uppercase mb-4">Coming Soon</h3>
          <p className="font-bold text-gray-600">Virtual card issuance is currently in beta.</p>
        </div>
      </div>
    </div>
  );
};

export default CardsPage;
