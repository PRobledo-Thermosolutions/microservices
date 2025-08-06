import React, { createContext, useContext, useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

/**
 * Context para manejar WebSocket a nivel global de la aplicación.
 * Permite que cualquier componente pueda escuchar eventos de WebSocket
 * y recibir notificaciones en tiempo real.
 */
const WebSocketContext = createContext(null);

/**
 * Provider del contexto WebSocket que envuelve la aplicación.
 * Maneja la conexión WebSocket y distribuye los mensajes a los componentes suscritos.
 */
export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  
  // Configuración del WebSocket
  const { 
    lastMessage, 
    readyState, 
    sendMessage, 
    error, 
    reconnect,
    connectionState 
  } = useWebSocket('ws://localhost:8000/ws/users', {
    debug: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });

  // Efecto para procesar mensajes entrantes del WebSocket
  useEffect(() => {
    if (lastMessage) {
      console.log('WebSocket message received:', lastMessage);
      
      // Procesar diferentes tipos de eventos
      switch (lastMessage.event) {
        case 'user_created':
          // Evento de usuario creado
          const newUserEvent = {
            ...lastMessage,
            id: Date.now(), // ID único para la notificación
            timestamp: new Date().toISOString(),
            read: false
          };
          
          setUserEvents(prev => [newUserEvent, ...prev]);
          
          // Crear notificación para mostrar al usuario
          setNotifications(prev => [...prev, {
            id: newUserEvent.id,
            type: 'success',
            title: 'Nuevo Usuario Creado',
            message: `Usuario ${lastMessage.user?.username || 'desconocido'} creado exitosamente`,
            timestamp: newUserEvent.timestamp,
            autoHide: true
          }]);
          break;
          
        case 'connection_established':
          // Conexión establecida
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'info',
            title: 'Conectado',
            message: 'Conexión WebSocket establecida correctamente',
            timestamp: new Date().toISOString(),
            autoHide: true
          }]);
          break;
          
        case 'error':
          // Error del servidor
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'error',
            title: 'Error del Servidor',
            message: lastMessage.message || 'Error desconocido',
            timestamp: new Date().toISOString(),
            autoHide: false
          }]);
          break;
          
        default:
          // Otros eventos
          console.log('Unhandled WebSocket event:', lastMessage.event);
      }
    }
  }, [lastMessage]);

  // Función para limpiar notificaciones automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => {
          if (notification.autoHide) {
            const age = Date.now() - new Date(notification.timestamp).getTime();
            return age < 5000; // 5 segundos
          }
          return true;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Función para marcar notificación como leída
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Función para limpiar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Función para marcar evento de usuario como leído
  const markUserEventAsRead = (id) => {
    setUserEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, read: true } : event
      )
    );
  };

  // Función para obtener el estado de conexión legible
  const getConnectionStatus = () => {
    switch (readyState) {
      case connectionState.CONNECTING:
        return { text: 'Conectando...', color: 'orange', status: 'connecting' };
      case connectionState.OPEN:
        return { text: 'Conectado', color: 'green', status: 'connected' };
      case connectionState.CLOSING:
        return { text: 'Cerrando...', color: 'orange', status: 'closing' };
      case connectionState.CLOSED:
        return { text: 'Desconectado', color: 'red', status: 'disconnected' };
      default:
        return { text: 'Desconocido', color: 'gray', status: 'unknown' };
    }
  };

  // Valor del contexto que se proporciona a los componentes hijos
  const contextValue = {
    // Estado de la conexión
    connectionStatus: getConnectionStatus(),
    readyState,
    error,
    
    // Funciones de WebSocket
    sendMessage,
    reconnect,
    
    // Notificaciones
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Eventos de usuarios
    userEvents,
    markUserEventAsRead,
    unreadUserEvents: userEvents.filter(event => !event.read),
    
    // Utilidades
    isConnected: readyState === connectionState.OPEN,
    connectionState
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook para usar el contexto WebSocket en componentes.
 * Proporciona acceso a todas las funcionalidades del WebSocket.
 */
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;