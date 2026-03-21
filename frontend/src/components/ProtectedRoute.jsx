import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black uppercase text-2xl">Loading...</div>;
  }

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render children components inside Layout
  return <Outlet />;
};

export default ProtectedRoute;
