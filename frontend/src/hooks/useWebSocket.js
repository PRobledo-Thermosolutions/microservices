// Importación de hooks de React
import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado mejorado para manejar conexiones WebSocket.
 *
 * @param {string} url - La URL del servidor WebSocket al que se desea conectar.
 * @param {Object} options - Opciones de configuración para el WebSocket.
 * @returns {{
 *   lastMessage: any,
 *   readyState: number,
 *   sendMessage: (message: any) => void,
 *   error: string|null,
 *   reconnect: () => void
 * }}
 *
 * - `lastMessage`: Último mensaje recibido desde el WebSocket.
 * - `readyState`: Estado actual de la conexión (0: conectando, 1: abierto, 3: cerrado o con error).
 * - `sendMessage`: Función para enviar mensajes al servidor WebSocket.
 * - `error`: Último error ocurrido en la conexión.
 * - `reconnect`: Función para reconectar manualmente.
 */
const useWebSocket = (url, options = {}) => {
  // Referencia mutable para almacenar la conexión WebSocket sin provocar renders
  const ws = useRef(null);
  const reconnectTimeoutId = useRef(null);
  
  // Configuración por defecto
  const config = {
    reconnectInterval: 3000, // 3 segundos
    maxReconnectAttempts: 5,
    debug: false,
    ...options
  };

  // Estados del hook
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0); // 0: CONNECTING
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Función para logs de debug
  const debugLog = (message) => {
    if (config.debug) {
      console.log(`[WebSocket Debug]: ${message}`);
    }
  };

  // Función para conectar al WebSocket
  const connect = () => {
    try {
      debugLog(`Attempting to connect to: ${url}`);
      setError(null);
      setReadyState(0); // CONNECTING
      
      // Crear nueva conexión WebSocket
      ws.current = new WebSocket(url);

      // Configurar event handlers
      ws.current.onopen = (event) => {
        debugLog('WebSocket connection opened');
        setReadyState(1); // OPEN
        setError(null);
        setReconnectAttempts(0); // Reset contador de reintentos
      };

      ws.current.onclose = (event) => {
        debugLog(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        setReadyState(3); // CLOSED
        
        // Intentar reconectar si no se cerró intencionalmente
        if (event.code !== 1000 && reconnectAttempts < config.maxReconnectAttempts) {
          const nextAttempt = reconnectAttempts + 1;
          setReconnectAttempts(nextAttempt);
          
          debugLog(`Scheduling reconnection attempt ${nextAttempt}/${config.maxReconnectAttempts} in ${config.reconnectInterval}ms`);
          
          reconnectTimeoutId.current = setTimeout(() => {
            connect();
          }, config.reconnectInterval);
        } else if (reconnectAttempts >= config.maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
          debugLog('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (event) => {
        debugLog('WebSocket error occurred');
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setReadyState(3); // Considerar como cerrada
      };

      ws.current.onmessage = (event) => {
        debugLog(`Received message: ${event.data}`);
        try {
          // Intenta parsear el mensaje como JSON
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
          // Si no es JSON, guardarlo como texto plano
          setLastMessage({ text: event.data, type: 'text' });
        }
      };

    } catch (connectionError) {
      console.error('Error creating WebSocket connection:', connectionError);
      setError(`Connection error: ${connectionError.message}`);
      setReadyState(3);
    }
  };

  // Función para reconectar manualmente
  const reconnect = () => {
    debugLog('Manual reconnection triggered');
    setReconnectAttempts(0);
    if (ws.current) {
      ws.current.close(1000, 'Manual reconnection');
    }
    // Limpiar timeout existente
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }
    connect();
  };

  useEffect(() => {
    connect();

    // Cleanup: cerrar la conexión al desmontar el componente
    return () => {
      debugLog('Cleaning up WebSocket connection');
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (ws.current) {
        // Cerrar con código 1000 (cierre normal) para evitar reconexión automática
        ws.current.close(1000, 'Component unmounting');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Se vuelve a conectar si cambia la URL

  /**
   * Envía un mensaje al servidor WebSocket.
   *
   * @param {any} message - El mensaje a enviar, será convertido a JSON.
   * @returns {boolean} - true si se envió exitosamente, false en caso contrario.
   */
  const sendMessage = (message) => {
    try {
      // Solo se envía si la conexión está abierta
      if (ws.current?.readyState === WebSocket.OPEN) {
        const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
        ws.current.send(messageToSend);
        debugLog(`Message sent: ${messageToSend}`);
        return true;
      } else {
        console.warn('WebSocket is not open. Message not sent:', message);
        setError('Cannot send message: WebSocket is not connected');
        return false;
      }
    } catch (sendError) {
      console.error('Error sending WebSocket message:', sendError);
      setError(`Send error: ${sendError.message}`);
      return false;
    }
  };

  // Devuelve el estado y funciones del WebSocket
  return { 
    lastMessage, 
    readyState, 
    sendMessage, 
    error, 
    reconnect,
    connectionState: {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    }
  };
};

export default useWebSocket;