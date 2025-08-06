from fastapi import WebSocket
from typing import List

class ConnectionManager:
    """
    Clase para gestionar conexiones WebSocket activas.
    Mantiene una lista de conexiones activas y permite enviar mensajes a todos los clientes conectados.
    """

    def __init__(self):
        """
        Inicializa una instancia de ConnectionManager con una lista vacía de conexiones activas.
        """
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        """
        Acepta una nueva conexión WebSocket y la añade a la lista de conexiones activas.

        Args:
            websocket (WebSocket): La conexión WebSocket entrante que se va a aceptar y agregar.
        """
        await websocket.accept()  # Acepta la conexión WebSocket
        self.active_connections.append(websocket)  # Añade la conexión a la lista

    def disconnect(self, websocket: WebSocket):
        """
        Elimina una conexión WebSocket de la lista de conexiones activas.

        Args:
            websocket (WebSocket): La conexión WebSocket que se desconecta y debe ser removida.
        """
        self.active_connections.remove(websocket)  # Remueve la conexión de la lista

    async def broadcast(self, message: str):
        """
        Envía un mensaje de texto a todas las conexiones WebSocket activas.

        Args:
            message (str): El mensaje que será enviado a todos los clientes conectados.
        """
        for connection in self.active_connections:
            await connection.send_text(message)  # Envía el mensaje a cada cliente

# Instancia global del ConnectionManager para ser usada en la aplicación
manager = ConnectionManager()
