# Herramientas para manejo de fechas y expiración de tokens
from datetime import datetime, timedelta
# Herramientas de FastAPI para manejo de errores y dependencias
import bcrypt
from fastapi import Depends, HTTPException, status
# Esquema OAuth2 para autenticación vía token bearer
from fastapi.security import OAuth2PasswordBearer
# Librerías para trabajar con JWT (codificar, decodificar, validar)
from jose import JWTError, jwt
# Configuración de variables de entorno
from dotenv import load_dotenv
import os

# Carga las variables del archivo .env
load_dotenv()

# Configuración del JWT desde variables de entorno
SECRET_KEY = str(os.getenv("SECRET_KEY"))  # Clave secreta para firmar tokens
ALGORITHM = str(os.getenv("ALGORITHM"))    # Algoritmo de firma (ej: HS256)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))  # Minutos de expiración

# Define el esquema OAuth2: se usará en rutas protegidas con "Depends"
# El cliente enviará el token JWT usando el header Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Crea un token JWT con los datos proporcionados (por ejemplo, el ID del usuario).

    Args:
        data (dict): Información a codificar en el token (como {"sub": "1"}).
        expires_delta (timedelta, opcional): Tiempo hasta la expiración del token.

    Returns:
        str: Token JWT firmado y codificado.
    """
    # Copia la información a codificar
    to_encode = data.copy()

    # Define tiempo de expiración (por defecto, el que viene del .env)
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})  # Agrega fecha de expiración al payload

    # Codifica el JWT usando la clave secreta y el algoritmo
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Extrae y valida el token JWT enviado en el header Authorization.
    Si es válido, devuelve el ID del usuario (campo "sub").

    Args:
        token (str): Token JWT extraído automáticamente desde el header por FastAPI.

    Returns:
        str: ID del usuario extraído del token si es válido.

    Raises:
        HTTPException: Si el token no es válido o ha expirado.
    """
    # Excepción que se lanza si hay problemas de autenticación
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decodifica el token usando la clave secreta y algoritmo definidos
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extrae el campo "sub" (sujeto) que debe contener el ID del usuario
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        return user_id
    except JWTError:
        # Si falla la decodificación o está alterado, lanza excepción
        raise credentials_exception
