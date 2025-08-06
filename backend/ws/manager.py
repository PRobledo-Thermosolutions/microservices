from fastapi import WebSocket
from typing import List
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Clase mejorada para gestionar conexiones WebSocket activas.
    Mantiene una lista de conexiones activas y permite enviar mensajes a todos los clientes conectados.
    Incluye manejo de errores y logging para debugging.
    """

    def __init__(self):
        """
        Inicializa una instancia de ConnectionManager con una lista vacía de conexiones activas.
        """
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Acepta una nueva conexión WebSocket y la añade a la lista de conexiones activas.

        Args:
            websocket (WebSocket): La conexión WebSocket entrante que se va a aceptar y agregar.
        """
        await websocket.accept()  # Acepta la conexión WebSocket
        self.active_connections.append(websocket)  # Añade la conexión a la lista
        logger.info(f"New WebSocket connection accepted. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """
        Elimina una conexión WebSocket de la lista de conexiones activas.

        Args:
            websocket (WebSocket): La conexión WebSocket que se desconecta y debe ser removida.
        """
        try:
            self.active_connections.remove(websocket)  # Remueve la conexión de la lista
            logger.info(f"WebSocket connection removed. Total connections: {len(self.active_connections)}")
        except ValueError:
            logger.warning("Attempted to remove WebSocket connection that wasn't in active list")

    async def broadcast(self, message: str):
        """
        Envía un mensaje de texto a todas las conexiones WebSocket activas.
        Maneja conexiones cerradas automáticamente.

        Args:
            message (str): El mensaje que será enviado a todos los clientes conectados.
        """
        if not self.active_connections:
            logger.info("No active WebSocket connections to broadcast to")
            return

        # Lista para almacenar conexiones que fallan
        failed_connections = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message to connection: {str(e)}")
                failed_connections.append(connection)

        # Remover conexiones que fallaron
        for failed_connection in failed_connections:
            try:
                self.active_connections.remove(failed_connection)
                logger.info(f"Removed failed connection. Total connections: {len(self.active_connections)}")
            except ValueError:
                pass  # La conexión ya fue removida

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Envía un mensaje personal a una conexión WebSocket específica.

        Args:
            message (str): El mensaje a enviar.
            websocket (WebSocket): La conexión WebSocket específica.
        """
        try:
            await websocket.send_text(message)
            logger.info("Personal message sent successfully")
        except Exception as e:
            logger.error(f"Failed to send personal message: {str(e)}")
            # Remover la conexión si falló
            self.disconnect(websocket)

    def get_connection_count(self) -> int:
        """
        Retorna el número de conexiones activas.

        Returns:
            int: Número de conexiones WebSocket activas.
        """
        return len(self.active_connections)

    async def send_json(self, data: dict, websocket: WebSocket = None):
        """
        Envía datos JSON a una conexión específica o a todas las conexiones.

        Args:
            data (dict): Los datos a enviar como JSON.
            websocket (WebSocket, optional): Conexión específica. Si es None, envía a todas.
        """
        message = json.dumps(data)
        
        if websocket:
            await self.send_personal_message(message, websocket)
        else:
            await self.broadcast(message)

# Instancia global del ConnectionManager para ser usada en la aplicación
manager = ConnectionManager()