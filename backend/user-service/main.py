# Clase principal de FastAPI para crear la aplicación
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Motor de base de datos SQLAlchemy configurado en database.py
from database.database import engine
# Modelos del módulo de usuarios para crear las tablas en la base de datos
import models.models as UserModel
# Routers definidos para usuarios, autenticación y websockets
from routers.routers import users_router
# Dependencia para obtener la sesión de base de datos
from dependencies.dependencies import db_dependency

# Crea la instancia principal de la aplicación FastAPI
app = FastAPI()

# Crea todas las tablas definidas en los modelos (si no existen ya en la base de datos)
UserModel.Base.metadata.create_all(bind=engine)

# Define el título y la versión de la API (esto se muestra en la documentación Swagger)
app.title = "User Service FastAPI"
app.version = "0.0.1"

# CONFIGURACIÓN CORS MEJORADA - Incluye configuración específica para WebSockets
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra el router del módulo de usuarios y de autenticación con la aplicación principal
app.include_router(users_router)

# Asigna explícitamente la dependencia de la base de datos (no es necesario si no se usa aquí)
db_dependency = db_dependency

@app.get("/", tags=["Health"])
async def root():
    return {"message": "API funcionando con WebSocket externo en Go"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "service": "fastapi-api"}