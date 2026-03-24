import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(username, password);
    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/');
    } else {
      toast.error(result.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-5xl font-black text-white uppercase tracking-tighter">
          Astra-Pay
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to your wallet or{' '}
          <Link to="/register" className="font-bold text-white border-b-2 border-white hover:text-gray-300">
            register here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 border border-white/10 shadow-2xl sm:px-10 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-gray-600 focus:outline-none focus:border-white sm:text-sm font-medium bg-black text-white rounded-xl transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-white/10 placeholder-gray-600 focus:outline-none focus:border-white sm:text-sm font-medium bg-black text-white rounded-xl transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase text-black bg-white hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
