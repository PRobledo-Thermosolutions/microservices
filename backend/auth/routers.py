# Herramientas de FastAPI para definir rutas, dependencias y excepciones
from fastapi import APIRouter, Depends, HTTPException
# Esquema de autenticación por formulario (usuario y contraseña)
from fastapi.security import OAuth2PasswordRequestForm
# Bcrypt para validar contraseñas encriptadas
import bcrypt
# Modelo de usuario para consultas a la base de datos
import users.models as UserModel
# Dependencia de base de datos
from dependencies import db_dependency
# Función que genera el token JWT
from auth.services import create_access_token

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
    user = db.query(UserModel.User).filter(UserModel.User.username == form_data.username).first()

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
