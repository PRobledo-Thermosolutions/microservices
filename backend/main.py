# Clase principal de FastAPI para crear la aplicación
from fastapi import FastAPI
# Motor de base de datos SQLAlchemy configurado en database.py
from database import engine
# Modelos del módulo de usuarios para crear las tablas en la base de datos
import users.models as UserModel
# Routers definidos para usuarios y autenticación
from users.routers import users_router
from auth.routers import auth_router
# Dependencia para obtener la sesión de base de datos
from dependencies import db_dependency

# Crea la instancia principal de la aplicación FastAPI
app = FastAPI()

# Crea todas las tablas definidas en los modelos (si no existen ya en la base de datos)
UserModel.Base.metadata.create_all(bind=engine)

# Define el título y la versión de la API (esto se muestra en la documentación Swagger)
app.title = "Microservices API FastAPI"
app.version = "0.0.1"

# Registra el router del módulo de usuarios y de autenticación con la aplicación principal
app.include_router(users_router)
app.include_router(auth_router)

# Asigna explícitamente la dependencia de la base de datos (no es necesario si no se usa aquí)
db_dependency = db_dependency
