import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Smartphone, Bell, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
    biometrics: true,
    darkMode: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div className="space-y-8 h-full flex flex-col max-w-5xl mx-auto w-full relative z-10">
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Info Card */}
        <div className="lg:col-span-1 space-y-6">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass p-8 rounded-3xl border border-white/5 shadow-xl text-center relative overflow-hidden group"
           >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
             
             <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-6 text-white border-4 border-white/10 shadow-2xl relative z-10">
               {user?.username?.charAt(0).toUpperCase() || '?'}
             </div>
             
             <h3 className="text-2xl font-black uppercase text-white tracking-tight relative z-10">{user?.username || 'Guest'}</h3>
             
             <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 font-medium bg-black/30 w-max mx-auto px-4 py-2 rounded-full border border-white/5 relative z-10">
               <Mail size={16} className="text-white" />
               <span className="text-sm">{user?.email || 'user@astrapay.dev'}</span>
             </div>

             <div className="mt-8 pt-8 border-t border-white/5 text-left relative z-10 space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Member Since</p>
                 <p className="font-mono text-white text-sm">March 2026</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Account Status</p>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                   <span className="font-bold text-green-400 uppercase text-xs sm:text-sm tracking-wider">Active & Verified</span>
                 </div>
               </div>
             </div>
           </motion.div>

           <motion.button 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             onClick={logout}
             className="w-full glass p-4 rounded-2xl flex items-center justify-center gap-2 text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
           >
             <LogOut size={20} /> Sign Out
           </motion.button>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-2 space-y-6">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass p-8 rounded-3xl border border-white/5 shadow-xl"
           >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                <Shield className="text-white" size={24} /> Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg">Two-Factor Authentication</h4>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <Toggle active={settings.twoFactor} onClick={() => toggleSetting('twoFactor')} />
                </div>
                
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg flex items-center gap-2">Biometric Login <Smartphone size={16} className="text-gray-500 hidden sm:block"/></h4>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Use FaceID or Fingerprint on supported devices.</p>
                  </div>
                  <Toggle active={settings.biometrics} onClick={() => toggleSetting('biometrics')} />
                </div>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="glass p-8 rounded-3xl border border-white/5 shadow-xl"
           >
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                <Bell className="text-white" size={24} /> Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg">Push Notifications</h4>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Receive alerts for transfers and account activity.</p>
                  </div>
                  <Toggle active={settings.notifications} onClick={() => toggleSetting('notifications')} />
                </div>

                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg">Midnight Theme</h4>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Enable the dark neon aesthetic across the app.</p>
                  </div>
                  <Toggle active={settings.darkMode} onClick={() => toggleSetting('darkMode')} disabled={true} />
                </div>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

// Reusable toggle component
const Toggle = ({ active, onClick, disabled = false }) => (
  <button 
    onClick={!disabled ? onClick : undefined}
    className={`w-14 h-8 rounded-full p-1 transition-colors relative focus:outline-none shrink-0 ${active && !disabled ? 'bg-white' : (active && disabled ? 'bg-white/50' : 'bg-gray-700')} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <motion.div 
      animate={{ x: active ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`w-6 h-6 rounded-full shadow-md ${active && !disabled ? 'bg-black' : 'bg-white'}`}
    />
  </button>
);

export default ProfilePage;
