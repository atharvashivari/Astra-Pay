import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, CreditCard, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all font-medium text-sm",
      isActive 
        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
        : "text-gray-400 hover:text-white hover:bg-white/5"
    );

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 h-[calc(100vh-3rem)] glass rounded-3xl p-6 flex flex-col relative overflow-hidden shrink-0"
    >
      {/* Subtle top-left glow inside the sidebar */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-10 z-10">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
          <span className="font-black text-xl text-black">A</span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Astra<span>Pay</span></h1>
      </div>

      <nav className="space-y-2 flex-1 z-10">
        <NavLink to="/" className={linkClass} end>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/transactions" className={linkClass}>
          <ArrowRightLeft size={18} /> Transactions
        </NavLink>
        <NavLink to="/cards" className={linkClass}>
          <CreditCard size={18} /> Cards
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <User size={18} /> Profile
        </NavLink>
      </nav>

      <div className="pt-6 border-t border-white/10 mt-auto z-10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all font-medium text-sm focus:outline-none"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
