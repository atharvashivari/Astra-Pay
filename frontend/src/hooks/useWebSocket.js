import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useWebSocket = (userId) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const stompClientRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setSocketConnected(false);
      }
      return;
    }

    const connect = () => {
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
            if (message.body === 'SYNC_WALLET' || message.body === 'SYNC') {
              queryClient.invalidateQueries({ queryKey: ['balance'] });
              queryClient.invalidateQueries({ queryKey: ['transactions'] });
              toast.success('Wallet synced!', {
                icon: '⚡',
                style: {
                  borderRadius: '10px',
                  background: '#000',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)'
                },
              });
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

    connect();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [userId, queryClient]);

  return { socketConnected };
};
