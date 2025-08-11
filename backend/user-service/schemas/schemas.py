# Clase base de Pydantic para crear modelos de validación de datos
from pydantic import BaseModel

# Define un esquema para el modelo User
# Este esquema se usa para validar datos entrantes (por ejemplo, en requests)
class UserSchema(BaseModel):
    # Campo email: cadena de texto
    email: str
    # Campo username: cadena de texto
    username: str
    # Campo password: cadena de texto
    password: str
