# Esquema de usuario (usado como tipo de entrada)
from users.schemas import UserSchema
# Librería bcrypt para el hash seguro de contraseñas
import bcrypt

# Función para encriptar contraseñas antes de almacenarlas
def encrypt_password(plain_password: str) -> str:
    """
    Encripta una contraseña en texto plano usando bcrypt.

    Args:
        plain_password (str): Contraseña sin encriptar.

    Returns:
        str: Contraseña encriptada en formato string.
    """
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

# Función para actualizar los campos de un usuario si han sido modificados
def verify_new_info(user: UserSchema, updated_user: UserSchema):
    """
    Actualiza los campos del usuario original con los nuevos datos proporcionados.

    Args:
        user (UserSchema): Usuario original que será actualizado.
        updated_user (UserSchema): Datos nuevos que pueden reemplazar a los anteriores.

    Notas:
        - Si el campo actualizado es 'password', se encripta antes de reemplazar.
        - Se excluyen campos no enviados (None) usando `exclude_unset=True`.
    """
    for field, value in updated_user.dict(exclude_unset=True).items():
        if field == "password":
            user.password = encrypt_password(value)
        else:
            setattr(user, field, value)
