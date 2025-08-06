// Importación de hooks de React
import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para manejar conexiones WebSocket.
 *
 * @param {string} url - La URL del servidor WebSocket al que se desea conectar.
 * @returns {{
 *   lastMessage: any,
 *   readyState: number,
 *   sendMessage: (message: any) => void
 * }}
 *
 * - `lastMessage`: Último mensaje recibido desde el WebSocket.
 * - `readyState`: Estado actual de la conexión (0: conectando, 1: abierto, 3: cerrado o con error).
 * - `sendMessage`: Función para enviar mensajes al servidor WebSocket.
 */
const useWebSocket = (url) => {
  // Referencia mutable para almacenar la conexión WebSocket sin provocar renders
  const ws = useRef(null);

  // Estado para almacenar el último mensaje recibido
  const [lastMessage, setLastMessage] = useState(null);

  // Estado para reflejar el estado actual de la conexión
  const [readyState, setReadyState] = useState(0); // 0: CONNECTING

  useEffect(() => {
    // Inicializa la conexión WebSocket
    ws.current = new WebSocket(url);

    // Cuando la conexión se abre correctamente
    ws.current.onopen = () => setReadyState(1); // 1: OPEN

    // Cuando la conexión se cierra
    ws.current.onclose = () => setReadyState(3); // 3: CLOSED

    // En caso de error en la conexión
    ws.current.onerror = () => setReadyState(3); // también se considera cerrada

    // Cuando se recibe un mensaje desde el servidor
    ws.current.onmessage = (event) => {
      try {
        // Intenta parsear el mensaje como JSON
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        // En caso de error al parsear, lo muestra en consola
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Cleanup: cerrar la conexión al desmontar el componente
    return () => {
      ws.current?.close();
    };
  }, [url]); // Se vuelve a conectar si cambia la URL

  /**
   * Envía un mensaje al servidor WebSocket.
   *
   * @param {any} message - El mensaje a enviar, será convertido a JSON.
   */
  const sendMessage = (message) => {
    // Solo se envía si la conexión está abierta
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  // Devuelve el último mensaje, el estado de conexión, y la función para enviar mensajes
  return { lastMessage, readyState, sendMessage };
};

export default useWebSocket;
