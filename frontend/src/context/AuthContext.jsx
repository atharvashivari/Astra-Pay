import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Wait for potential token validation

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      apiClient.get('/auth/me')
        .then(response => {
          setUser({ ...response.data, isAuthenticated: true });
        })
        .catch(error => {
          console.error("Profile fetch failed:", error);
          localStorage.removeItem('jwt_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('jwt_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data && response.data.token) {
        setToken(response.data.token);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { username, email, password });
      if (response.data && response.data.token) {
        setToken(response.data.token);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    token,
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
