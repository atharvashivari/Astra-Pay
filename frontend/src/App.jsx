import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import BalanceDisplay from './components/BalanceDisplay';
import TransferForm from './components/TransferForm';
import TransactionList from './components/TransactionList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <div className="space-y-8">
          <header className="flex justify-between items-center border-b-4 border-black pb-4">
            <h2 className="text-3xl font-black uppercase">Dashboard Overview</h2>
            <BalanceDisplay />
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TransferForm />
            <div className="p-6 border-2 border-black bg-gray-50 flex items-center justify-center">
              <p className="font-bold text-gray-500 italic">[ Ad Space / Banner - Wireframe ]</p>
            </div>
          </div>

          <TransactionList />
        </div>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
