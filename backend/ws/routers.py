from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ws.manager import manager  # Administrador de conexiones WebSocket

websocket_router = APIRouter()  # Crea un router para rutas WebSocket

@websocket_router.websocket("/ws/users")
async def websocket_users_endpoint(websocket: WebSocket):
    """
    Endpoint WebSocket para la ruta /ws/users.

    Args:
        websocket (WebSocket): Conexión WebSocket entrante.

    Comportamiento:
        - Acepta la conexión WebSocket y la registra en el ConnectionManager.
        - Entra en un bucle infinito para mantener la conexión abierta y recibir mensajes.
        - En caso de desconexión, elimina la conexión de la lista activa.
    """
    await manager.connect(websocket)  # Acepta y registra la conexión
    try:
        while True:
            # Mantiene la conexión activa recibiendo mensajes de texto.
            # Actualmente no procesa mensajes, solo mantiene vivo el socket.
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Cuando el cliente se desconecta, se remueve la conexión del manager
        manager.disconnect(websocket)
