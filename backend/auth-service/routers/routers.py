# Herramientas de FastAPI para definir rutas, dependencias y excepciones
from fastapi import APIRouter, Depends, HTTPException, status
# Esquema de autenticación por formulario (usuario y contraseña)
from fastapi.security import OAuth2PasswordRequestForm
# Bcrypt para validar contraseñas encriptadas
import bcrypt
# Modelo de usuario para consultas a la base de datos
import models.models as LoginModel
# Esquema de datos de la autenticación para validación
from schemas.schemas import LoginSchema
# Dependencia de base de datos
from dependencies.dependencies import db_dependency
# Función que genera el token JWT
from services.services import create_access_token, get_current_user

# Crea el router de autenticación
auth_router = APIRouter()

# Ruta para iniciar sesión y generar un token JWT
@auth_router.post("/login", tags=["Auth"])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),  # Extrae username y password del cuerpo del request (tipo form)
    db: db_dependency = None  # Inyecta la sesión de base de datos
):
    """
    Autenticación de usuarios usando username y password.\n
    Si las credenciales son correctas, retorna un token de acceso JWT.\n

    Args:\n
        form_data (OAuth2PasswordRequestForm): Formulario con username y password.\n
        db (Session): Sesión de base de datos inyectada por FastAPI.\n

    Returns:\n
        dict: Un diccionario con el token JWT y el tipo de token (bearer).\n
    """

    # Busca el usuario por nombre de usuario
    user = db.query(LoginModel.Login).filter(LoginModel.Login.username == form_data.username).first()

    # Si no se encuentra el usuario, retorna error 404
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verifica si la contraseña es correcta
    if not bcrypt.checkpw(form_data.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Genera el token JWT con el ID del usuario como "sub"
    token = create_access_token({"sub": str(user.id)})

    # Retorna el token en formato estándar OAuth2
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@auth_router.get("/current_user", tags=["Auth"])
def read_current_user(
    db: db_dependency = None
):
    """
    Retorna el usuario autenticado actualmente.
    
    Args:
        current_user (User): Usuario autenticado inyectado por la dependencia.
        db (Session): Sesión de base de datos (opcional).

    Returns:
        dict: Información del usuario autenticado.
    """
    return {
        get_current_user
    }

# Ruta: Crear un nuevo usuario (protegida)
@auth_router.post("/create_login", status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def create_user(
    user: LoginSchema,
    db: db_dependency,
):
    """
    Crea un nuevo usuario en la base de datos y lo encripta.\n
    Args:\n
        user (LoginSchema): Datos del usuario a crear.\n
        db (Session): Objeto de sesión de la base de datos.\n
        current_user (str): Usuario actual.\n
    Returns:\n
        LoginSchema: Usuario creado.\n
    Raises:\n
        HTTPException: Si el usuario ya existe.\n
    """

    # Crea el usuario como objeto SQLAlchemy y lo guarda en la base de datos
    db_user = LoginModel.Login(**user.dict())
    db.add(db_user)
    db.commit()

    return {"message": "Usuario creado exitosamente"}

#Ruta: Actualizar un usuario (protegida)
@auth_router.put("/update_login/{user_id}", status_code=status.HTTP_200_OK, tags=["Auth"])
async def update_user(
    user_id: int,
    user: LoginSchema,
    db: db_dependency,
):
    """
    Actualiza un usuario existente en la base de datos.

    Args:
        user_id (int): ID del usuario a actualizar.
        user (LoginSchema): Nuevos datos del usuario.
        db (Session): Sesión de base de datos inyectada por FastAPI.
        current_user (str): Usuario actual (inicialmente inyectado por la dependencia).

    Returns:
        dict: Mensaje de éxito.
    """
    # Busca el usuario por ID
    db_user = db.query(LoginModel.Login).filter(LoginModel.Login.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualiza los campos del usuario
    for field, value in user.dict(exclude_unset=True).items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return {"message": "Usuario actualizado exitosamente"}