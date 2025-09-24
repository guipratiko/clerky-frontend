import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentInstance, setCurrentInstance] = useState(null);
  const socketRef = useRef(null);

  // Conectar ao servidor WebSocket
  useEffect(() => {
    // Evitar reconexões desnecessárias se já há um socket conectado
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const connectSocket = () => {
      // Limpar socket anterior se existir
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Configurar URL do WebSocket baseado no ambiente
      const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL;
      
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'], // Fallback para polling se WebSocket falhar
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 20,
        timeout: 30000,
        forceNew: true, // Força nova conexão
        upgrade: true,
        rememberUpgrade: true,
        // Configurações específicas para produção
        secure: socketUrl.startsWith('https'),
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
        // Configurações de heartbeat para manter conexão ativa
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Conectado ao WebSocket');
        setConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Desconectado do WebSocket:', reason);
        setConnected(false);
        
        // Reconectar automaticamente em alguns casos
        if (reason === 'io server disconnect') {
          setTimeout(() => {
            newSocket.connect();
          }, 1000);
        }
        
        // Apenas avisar em desconexões importantes
        if (reason !== 'transport close' && reason !== 'transport error' && reason !== 'client namespace disconnect') {
          toast.error('Conexão perdida com o servidor');
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão:', error.message);
        setConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconectado após', attemptNumber, 'tentativas');
        setConnected(true);
        if (attemptNumber > 1) {
          toast.success('Reconectado ao servidor');
        }
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Erro na reconexão:', error.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    // Conectar após um pequeno delay para evitar problemas com React StrictMode
    const timeoutId = setTimeout(connectSocket, 100);

    return () => {
      clearTimeout(timeoutId);
      // Não desconectar imediatamente no cleanup para evitar problemas com React StrictMode
      // A desconexão será feita quando o componente for realmente desmontado
    };
  }, []);

  // Cleanup quando o componente for realmente desmontado
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, []);

  // Entrar em uma instância
  const joinInstance = (instanceName) => {
    if (socket && instanceName) {
      console.log('📱 Entrando na instância:', instanceName);
      
      // Sair da instância anterior se existir
      if (currentInstance && currentInstance !== instanceName) {
        socket.emit('leave-instance', currentInstance);
      }

      socket.emit('join-instance', instanceName);
      setCurrentInstance(instanceName);
    }
  };

  // Sair da instância atual
  const leaveInstance = () => {
    if (socket && currentInstance) {
      console.log('📱 Saindo da instância:', currentInstance);
      socket.emit('leave-instance', currentInstance);
      setCurrentInstance(null);
    }
  };

  // Indicar que está digitando
  const emitTyping = (chatId, isTyping) => {
    if (socket && currentInstance) {
      socket.emit('typing', {
        instanceName: currentInstance,
        chatId,
        isTyping,
      });
    }
  };

  // Marcar mensagens como lidas
  const markAsRead = (chatId, messageIds) => {
    if (socket && currentInstance) {
      socket.emit('mark-as-read', {
        instanceName: currentInstance,
        chatId,
        messageIds,
      });
    }
  };

  // Escutar eventos específicos
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Parar de escutar eventos
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  // Emitir evento personalizado
  const emit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    currentInstance,
    joinInstance,
    leaveInstance,
    emitTyping,
    markAsRead,
    on,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
