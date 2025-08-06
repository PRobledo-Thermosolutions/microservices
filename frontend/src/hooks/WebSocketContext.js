import React, { createContext, useContext, useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket'; // Ajusta la ruta según tu estructura

/**
 * Context minimalista para manejar WebSocket sin modificar el diseño existente.
 * Solo proporciona la funcionalidad básica de conexión y eventos.
 */
const WebSocketContext = createContext(null);

/**
 * Provider del contexto WebSocket - versión minimalista
 */
export const WebSocketProvider = ({ children }) => {
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
    debug: false, // Sin logs para no interferir
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  });

  // Procesar mensajes entrantes sin mostrar notificaciones visuales
  useEffect(() => {
    if (lastMessage) {
      // Solo procesar eventos de usuarios creados
      if (lastMessage.event === 'user_created') {
        const newUserEvent = {
          ...lastMessage,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          processed: false
        };
        
        setUserEvents(prev => [newUserEvent, ...prev]);
      }
    }
  }, [lastMessage]);

  // Función para marcar evento como procesado
  const markEventAsProcessed = (eventId) => {
    setUserEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, processed: true } : event
      )
    );
  };

  // Función para obtener eventos no procesados
  const getUnprocessedEvents = () => {
    return userEvents.filter(event => !event.processed);
  };

  // Valor mínimo del contexto
  const contextValue = {
    // Estado básico de conexión
    isConnected: readyState === connectionState.OPEN,
    readyState,
    error,
    
    // Funciones básicas
    sendMessage,
    reconnect,
    
    // Eventos de usuarios
    userEvents,
    unprocessedEvents: getUnprocessedEvents(),
    markEventAsProcessed,
    
    // Utilidades
    connectionState
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook para usar el contexto WebSocket
 */
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;