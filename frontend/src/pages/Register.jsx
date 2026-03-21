import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Auto-login happens inside context if backend sends token in response.
    const result = await register(username, email, password);
    if (result.success) {
      toast.success('Successfully registered!');
      navigate('/');
    } else {
      toast.error(result.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-black text-gray-900 uppercase tracking-tighter">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have a wallet?{' '}
          <Link to="/login" className="font-bold text-black border-b-2 border-black hover:text-gray-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-black text-gray-900 uppercase">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-2 border-black placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm font-bold bg-gray-50 text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 uppercase">Email Address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-2 border-black placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm font-bold bg-gray-50 text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 uppercase">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border-2 border-black placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm font-bold bg-gray-50 text-black"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-black uppercase text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Registering...' : 'Create Wallet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
