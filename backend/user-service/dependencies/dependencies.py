# Generator para declarar el tipo de valor que retorna una función generadora
from typing import Generator
# Fábrica de sesiones desde la configuración de base de datos
from database.database import SessionLocal
# Clase Session de SQLAlchemy para tipar correctamente
from sqlalchemy.orm import Session
# Depends para la inyección de dependencias en FastAPI
from fastapi import Depends
# Annotated permite combinar tipos con dependencias para una escritura más clara y moderna
from typing import Annotated

# Función que provee una sesión de base de datos (SessionLocal) a través de una dependencia
# Usa 'yield' para garantizar que la conexión se cierre después de su uso
def get_db() -> Generator:
    db = SessionLocal()  # Crea una nueva sesión
    try:
        yield db          # La sesión se pasa al endpoint que la necesite
    finally:
        db.close()        # Cierra la sesión al finalizar la solicitud

# db_dependency se define como una anotación reutilizable
# Es una manera más limpia de usar la dependencia de base de datos en múltiples rutas
db_dependency = Annotated[Session, Depends(get_db)]
