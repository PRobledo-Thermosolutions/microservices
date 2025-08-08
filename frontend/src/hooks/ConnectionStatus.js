import React from 'react';
import { useWebSocketContext } from '../hooks/WebSocketContext';
import '../styles/ConnectionStatus.css';

const ConnectionStatus = () => {
  const { 
    connectionStatus, 
    isConnected, 
    reconnect,
    sendTestMessage,
    error,
    serverUrl
  } = useWebSocketContext();

  const handleReconnect = () => {
    console.log('Attempting manual reconnection...');
    reconnect();
  };

  const handleTestMessage = () => {
    const sent = sendTestMessage();
    if (sent) {
      console.log('Test message sent successfully');
    } else {
      console.warn('Failed to send test message');
    }
  };

  return (
    <div className="connection-status">
      <div className="status-header">
        <h3>Estado de Conexión WebSocket</h3>
      </div>
      
      <div className="status-info">
        <div className="status-item">
          <span className="label">Estado:</span>
          <span 
            className={`status-indicator ${connectionStatus.status}`}
            style={{ color: connectionStatus.color }}
          >
            {connectionStatus.text}
          </span>
        </div>
        
        <div className="status-item">
          <span className="label">Servidor:</span>
          <span className="server-url">{serverUrl}</span>
        </div>
        
        {error && (
          <div className="status-item error">
            <span className="label">Error:</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>
      
      <div className="status-actions">
        {!isConnected && (
          <button 
            onClick={handleReconnect}
            className="reconnect-button"
          >
            🔄 Reconectar
          </button>
        )}
        
        {isConnected && (
          <button 
            onClick={handleTestMessage}
            className="test-button"
          >
            📤 Enviar Mensaje de Prueba
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;