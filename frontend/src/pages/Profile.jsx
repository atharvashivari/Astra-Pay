import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8 h-full flex flex-col">
      <header className="border-b-4 border-black pb-4">
        <h2 className="text-3xl font-black uppercase">User Profile</h2>
        <p className="font-bold text-gray-500 mt-2">Manage your account settings and security.</p>
      </header>
      
      <div className="flex-1 border-4 border-black flex items-center justify-center bg-white p-8">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center text-6xl font-black mx-auto mb-6">
            ?
          </div>
          <h3 className="text-2xl font-black uppercase">Account Details</h3>
          <p className="font-bold text-gray-600">Profile management features will be unlocked soon.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
