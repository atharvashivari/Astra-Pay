import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import CardsPage from './pages/CardsPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout title="Overview" subtitle="Welcome back. Here is your financial summary."><Dashboard /></Layout>} />
          <Route path="/transactions" element={<Layout title="Transactions" subtitle="A complete ledger of all your incoming and outgoing transfers."><Transactions /></Layout>} />
          <Route path="/cards" element={<Layout title="Virtual Cards" subtitle="Manage your Astra-Pay debit cards."><CardsPage /></Layout>} />
          <Route path="/profile" element={<Layout title="Account Profile" subtitle="Manage your personal information and security preferences."><Profile /></Layout>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: { primary: '#fff', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#fff', secondary: '#000' },
            }
          }} 
        />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
