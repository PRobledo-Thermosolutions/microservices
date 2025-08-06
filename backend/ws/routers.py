from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ws.manager import manager  # Administrador de conexiones WebSocket
import logging
import json

websocket_router = APIRouter()  # Crea un router para rutas WebSocket

# Configurar logging para debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@websocket_router.websocket("/ws/users")
async def websocket_users_endpoint(websocket: WebSocket):
    """
    Endpoint WebSocket mejorado para la ruta /ws/users.

    Args:
        websocket (WebSocket): Conexión WebSocket entrante.

    Comportamiento:
        - Acepta la conexión WebSocket con manejo de headers CORS.
        - Registra la conexión en el ConnectionManager.
        - Mantiene la conexión activa y maneja desconexiones adecuadamente.
    """
    # Log de intento de conexión
    logger.info(f"Attempting WebSocket connection from: {websocket.client}")
    
    try:
        # Verificar headers de origen si es necesario (opcional, para seguridad adicional)
        origin = websocket.headers.get("origin")
        logger.info(f"WebSocket connection origin: {origin}")
        
        # Acepta y registra la conexión
        await manager.connect(websocket)
        logger.info("WebSocket connection established successfully")
        
        # Envía un mensaje de confirmación de conexión
        await websocket.send_text(json.dumps({
            "event": "connection_established",
            "message": "Connected to WebSocket successfully"
        }))
        
        # Mantiene la conexión activa
        while True:
            try:
                # Recibe mensajes del cliente
                message = await websocket.receive_text()
                logger.info(f"Received message: {message}")
                
                # Opcionalmente, puedes procesar el mensaje aquí
                # Por ejemplo, echo del mensaje recibido
                try:
                    parsed_message = json.loads(message)
                    # Procesar mensaje según tu lógica de negocio
                    response = {
                        "event": "message_received",
                        "data": parsed_message
                    }
                    await websocket.send_text(json.dumps(response))
                except json.JSONDecodeError:
                    # Si no es JSON válido, responder con error
                    error_response = {
                        "event": "error",
                        "message": "Invalid JSON format"
                    }
                    await websocket.send_text(json.dumps(error_response))
                    
            except WebSocketDisconnect:
                logger.info("Client disconnected normally")
                break
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                # Enviar error al cliente si la conexión sigue activa
                try:
                    error_response = {
                        "event": "error",
                        "message": f"Server error: {str(e)}"
                    }
                    await websocket.send_text(json.dumps(error_response))
                except:
                    # Si no se puede enviar el error, la conexión probablemente esté cerrada
                    break
                    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected during connection process")
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        # Asegurar que la conexión se remueva del manager
        try:
            manager.disconnect(websocket)
            logger.info("WebSocket connection cleaned up")
        except ValueError:
            # La conexión ya fue removida
            pass