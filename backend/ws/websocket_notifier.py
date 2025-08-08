import httpx
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class WebSocketNotifier:
    """
    Cliente para enviar notificaciones al servidor WebSocket de Go
    """
    
    def __init__(self, websocket_server_url: str = "http://localhost:8080"):
        self.base_url = websocket_server_url
        self.timeout = 5.0
    
    async def notify_user_created(self, user_data: Dict[str, Any]) -> bool:
        """
        Notifica al servidor WebSocket sobre la creación de un nuevo usuario
        
        Args:
            user_data: Diccionario con los datos del usuario
            
        Returns:
            bool: True si la notificación fue exitosa, False en caso contrario
        """
        try:
            url = f"{self.base_url}/api/notify/user-created"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=user_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    logger.info(f"Notificación de usuario creado enviada exitosamente: {user_data}")
                    return True
                else:
                    logger.error(f"Error enviando notificación: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error conectando con servidor WebSocket: {str(e)}")
            return False
    
    async def check_websocket_health(self) -> bool:
        """
        Verifica si el servidor WebSocket está disponible
        """
        try:
            url = f"{self.base_url}/health"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                return response.status_code == 200
                
        except Exception as e:
            logger.error(f"Error verificando salud del servidor WebSocket: {str(e)}")
            return False

# Instancia global del notificador
notifier = WebSocketNotifier()
