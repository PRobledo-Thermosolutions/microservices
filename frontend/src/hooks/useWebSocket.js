import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const ws = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);

  useEffect(() => {
    ws.current = new WebSocket(url);
    
    ws.current.onopen = () => setReadyState(1);
    ws.current.onclose = () => setReadyState(3);
    ws.current.onerror = () => setReadyState(3);
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { lastMessage, readyState, sendMessage };
};

export default useWebSocket;