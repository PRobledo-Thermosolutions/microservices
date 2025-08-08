# Herramientas de FastAPI para rutas, dependencias e interceptar errores
import json
from fastapi import APIRouter, Depends, HTTPException, status
# Función que valida el token JWT y obtiene al usuario actual
from auth.services import get_current_user
# Modelo de usuario definido con SQLAlchemy
import users.models as UserModel
# Esquema de datos del usuario para validación
from users.schemas import UserSchema
# Funciones para encriptar contraseñas y actualizar datos
from users.services import encrypt_password, verify_new_info
# Dependencia de la base de datos
from dependencies import db_dependency
from ws.websocket_notifier import notifier  # Importar el notificador
import logging

logger = logging.getLogger(__name__)

# Crea el router del módulo de usuarios
users_router = APIRouter()

# Ruta: Crear un nuevo usuario (protegida)
@users_router.post("/users", status_code=status.HTTP_201_CREATED, tags=["Users"])
async def create_user(
    user: UserSchema, 
    db: db_dependency, 
    current_user: str = Depends(get_current_user)
):
    """
    Crea un nuevo usuario en la base de datos y lo encripta.\n
    Args:\n
        user (UserSchema): Datos del usuario a crear.\n
        db (Session): Objeto de sesión de la base de datos.\n
        current_user (str): Usuario actual.\n
    Returns:\n
        UserSchema: Usuario creado.\n
    Raises:\n
        HTTPException: Si el usuario ya existe.\n
    """
    # Encripta la contraseña antes de guardarla
    hashed_password = encrypt_password(user.password)
    user.password = hashed_password

    # Crea el usuario como objeto SQLAlchemy y lo guarda en la base de datos
    db_user = UserModel.User(**user.dict())
    db.add(db_user)
    db.commit()

    # Preparar datos del usuario para notificación (sin contraseña)
    user_data = {
        "id": db_user.id,
        "email": db_user.email,
        "username": db_user.username,
        "is_active": db_user.is_active
    }

    # Intentar notificar al servidor WebSocket Go
    notification_sent = await notifier.notify_user_created(user_data)
    
    if not notification_sent:
        # Log el error pero no falla la creación del usuario
        logger.warning("No se pudo enviar notificación WebSocket, pero el usuario fue creado")

    return {"message": "Usuario creado exitosamente"}

# Ruta: Obtener un usuario por ID (protegida)
@users_router.get("/users/{user_id}", status_code=status.HTTP_200_OK, tags=["Users"])
async def read_user_by_id(
    user_id: int, 
    db: db_dependency, 
    current_user: str = Depends(get_current_user)
):
    """
    Obtiene un usuario por ID.\n
    Args:\n
        user_id (int): ID del usuario.\n
        db (Session): Objeto de sesión de la base de datos.\n
        current_user (str): Usuario actual.\n
    Returns:\n
        UserSchema: Usuario encontrado.\n
    Raises:\n
        HTTPException: Si el usuario no existe.
    """
    # Busca el usuario por ID
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if user:
        return user
    else:
        # Retorna error si no se encuentra
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

# Ruta: Obtener todos los usuarios (protegida)
@users_router.get("/users", status_code=status.HTTP_200_OK, tags=["Users"])
async def read_users(
    db: db_dependency, 
    current_user: str = Depends(get_current_user)
):
    """
    Obtiene todos los usuarios.\n
    Args:\n
        db (Session): Objeto de sesión de la base de datos.\n
        current_user (str): Usuario actual.\n
    Returns:\n
        list[UserSchema]: Lista de usuarios.
    """
    # Retorna todos los usuarios
    users = db.query(UserModel.User).all()
    return users

# Ruta: Actualizar un usuario por ID (protegida)
@users_router.put("/users/{user_id}", status_code=status.HTTP_200_OK, tags=["Users"])
def update_user(
    user_id: int, 
    updated_user: UserSchema, 
    db: db_dependency, 
    current_user: str = Depends(get_current_user)
):
    """
    Actualiza un usuario por ID.\n
    Args:\n
        user_id (int): ID del usuario a actualizar.
        updated_user (UserSchema): Datos actualizados del usuario.
        db (Session): Objeto de sesión de la base de datos.
        current_user (str): Usuario actual.
    Returns:\n
        UserSchema: Usuario actualizado.
    Raises:\n
        HTTPException: Si el usuario no existe.
    """
    # Busca el usuario
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualiza los campos modificados (incluyendo contraseña encriptada)
    verify_new_info(user, updated_user)

    db.commit()
    db.refresh(user)
    return user

# Ruta: Eliminar un usuario por ID (protegida)
@users_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user(
    user_id: int, 
    db: db_dependency, 
    current_user: str = Depends(get_current_user)
):
    """
    Elimina un usuario por ID.\n
    Args:\n
        user_id (int): ID del usuario a eliminar.
        db (Session): Objeto de sesión de la base de datos.
        current_user (str): Usuario actual.
    """
    # Busca el usuario
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Elimina el usuario
    db.delete(user)
    db.commit()
    return
