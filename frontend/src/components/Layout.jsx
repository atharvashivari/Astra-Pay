import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="flex bg-[#050505] min-h-screen text-white bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent">
      {/* Floating Sidebar Container */}
      <div className="p-6">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 pl-0 overflow-auto"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
