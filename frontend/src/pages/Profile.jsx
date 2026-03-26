import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Smartphone, Bell, LogOut, Edit2, Camera, X, Check } from 'lucide-react';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phoneNumber: user?.phoneNumber || '',
    profileImageUrl: user?.profileImageUrl || ''
  });
  
  const [settings, setSettings] = useState({
    notifications: true,
    twoFactor: false,
    biometrics: true,
    darkMode: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put('/users/profile', editData);
      setUser(prev => ({ ...prev, ...response.data }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
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
             
             <div className="relative mx-auto mb-6 w-max">
                <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-5xl font-black mx-auto text-white border-4 border-white/10 shadow-2xl relative z-10 overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                {!user?.googleSub && (
                  <button 
                   onClick={() => setIsEditing(true)}
                   className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg z-20 hover:scale-110 transition-transform border border-black/10"
                  >
                    <Camera size={16} />
                  </button>
                )}
              </div>
             
             <h3 className="text-2xl font-black uppercase text-white tracking-tight relative z-10">{user?.username || 'Guest'}</h3>
             
             <div className="mt-4 space-y-2 relative z-10">
                 <div className="flex items-center justify-center gap-2 text-gray-400 font-medium bg-black/30 w-full px-4 py-2 rounded-full border border-white/5">
                   {user?.googleSub ? <img src="https://www.google.com/favicon.ico" className="w-3 h-3 grayscale" alt="Google" /> : <Mail size={14} className="text-white/70" />}
                   <span className="text-sm truncate">{user?.email || 'user@astrapay.dev'}</span>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-gray-400 font-medium bg-black/30 w-full px-4 py-2 rounded-full border border-white/5">
                   <Smartphone size={14} className="text-white/70" />
                   <span className="text-sm">{user?.phoneNumber || 'No phone set'}</span>
                 </div>
              </div>

              {/* QR Code Section */}
              <div className="mt-8 p-4 bg-white/[0.03] rounded-2xl border border-white/5 relative z-10 group/qr">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Your Wallet QR</p>
                <div className="aspect-square w-32 mx-auto bg-white p-2 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover/qr:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all">
                  <QrCodeDisplay />
                </div>
              </div>

             <div className="mt-8 pt-6 border-t border-white/5 text-left relative z-10 space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Member Since</p>
                 <p className="font-mono text-white text-sm">March 2026</p>
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Account Status</p>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                     <span className="font-bold text-green-400 uppercase text-xs tracking-wider">Verified</span>
                   </div>
                 </div>
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 glass rounded-lg text-white/50 hover:text-white transition-colors"
                 >
                   <Edit2 size={18} />
                 </button>
               </div>
             </div>
           </motion.div>

           <motion.button 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             onClick={logout}
             className="w-full glass p-4 rounded-2xl flex items-center justify-center gap-2 text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20 shadow-lg"
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
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors group">
                  <div>
                    <h4 className="font-bold text-white text-base md:text-lg group-hover:text-white transition-colors">Two-Factor Authentication</h4>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <Toggle active={settings.twoFactor} onClick={() => toggleSetting('twoFactor')} />
                </div>
                
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors group">
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

                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/50 transition-colors opacity-60">
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

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Profile Image URL</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={editData.profileImageUrl}
                    onChange={(e) => setEditData({...editData, profileImageUrl: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Phone Number</label>
                  <input 
                    type="tel"
                    placeholder="+91 99999 00000"
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 glass py-4 rounded-2xl text-white font-bold hover:bg-white/5 transition-colors border border-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-tight hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    Save Changes <Check size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QrCodeDisplay = () => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/wallet/qr')
      .then(res => {
        setQrCode(res.data.qrCode);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg animate-pulse" />;
  if (!qrCode) return <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-[8px] uppercase font-bold">Error</div>;

  return <img src={qrCode} alt="Wallet QR" className="w-full h-full object-contain mix-blend-multiply" />;
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
