import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OauthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            console.log("OAuth callback received token, authentication successful.");
            // We set the token in the context, which will trigger the profile fetch
            setToken(token);
            toast.success('Successfully logged in with Google!');
            navigate('/');
        } else {
            console.error("OAuth callback failed: No token found in URL.");
            toast.error('Google Sign-In failed.');
            navigate('/login');
        }
    }, [searchParams, navigate, setToken]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-black uppercase text-white tracking-widest">Completing Login...</h2>
            </div>
        </div>
    );
};

export default OauthCallback;
