import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import apiClient from '../api/axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const stompClientRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      apiClient.get('/auth/me')
        .then(response => {
          const userData = { ...response.data, isAuthenticated: true };
          setUser(userData);
          connectWebSocket(userData.id);
        })
        .catch(error => {
          console.error("Profile fetch failed:", error);
          localStorage.removeItem('jwt_token');
          setToken(null);
          setUser(null);
          disconnectWebSocket();
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('jwt_token');
      setUser(null);
      setLoading(false);
      disconnectWebSocket();
    }

    return () => disconnectWebSocket();
  }, [token]);

  const connectWebSocket = (userId) => {
    if (stompClientRef.current) return;

    const socket = new SockJS('/ws-connect');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP Connected');
        setSocketConnected(true);
        client.subscribe(`/topic/wallet/${userId}`, (message) => {
          console.log('Real-time update received:', message.body);
          
          if (message.body === 'SYNC') {
            queryClient.invalidateQueries(['balance']);
            queryClient.invalidateQueries(['transactions']);
            toast.success('Funds updated!');
          } else {
            const event = JSON.parse(message.body);
            queryClient.invalidateQueries(['balance']);
            queryClient.invalidateQueries(['transactions']);
            if (event.toWallet) {
               toast.success(`Received ${event.amount} Astra-Pay!`);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        setSocketConnected(false);
      },
      onDisconnect: () => {
        console.log('STOMP Disconnected');
        setSocketConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setSocketConnected(false);
    }
  };

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
    loading,
    socketConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
