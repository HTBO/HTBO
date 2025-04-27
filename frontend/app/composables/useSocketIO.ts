import { io, Socket } from 'socket.io-client';

export function useSocketIO() {
    const runtimeConfig = useRuntimeConfig();
    const socket = ref<Socket | null>(null);
    const isConnected = ref(false);
    const authStore = useAuthStore();
  
    const connect = () => {
      if (isConnected.value || !authStore.isAuthenticated) return;
  
      const baseURL = runtimeConfig.public.apiBaseUrl.replace('/api', '');
      
      socket.value = io(baseURL, {
        auth: {
          token: authStore.token
        }
      });
  
      socket.value.on('connect', () => {
        isConnected.value = true;
        console.log('WebSocket connected');
      });
  
      socket.value.on('disconnect', () => {
        isConnected.value = false;
        console.log('WebSocket disconnected');
      });
  
      socket.value.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err.message);
      });
    };
  
    const disconnect = () => {
      if (!socket.value) return;
      
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    };
  
    return {
      socket,
      isConnected,
      connect,
      disconnect
    };
  }