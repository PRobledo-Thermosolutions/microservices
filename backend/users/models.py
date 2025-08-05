# Tipos de columnas y tipos de datos de SQLAlchemy
from sqlalchemy import Boolean, Column, Integer, String
# Base declarativa desde tu configuración de base de datos
from database import Base

# Define la clase User como una tabla de la base de datos usando SQLAlchemy ORM
class User(Base):
    # Nombre de la tabla en la base de datos
    __tablename__ = "users"

    # Columna ID: clave primaria, autoincremental e indexada para búsquedas rápidas
    id = Column(Integer, primary_key=True, index=True)
    # Columna email: única, indexada, hasta 255 caracteres
    email = Column(String(255), unique=True, index=True)
    # Columna username: única, hasta 50 caracteres
    username = Column(String(50), unique=True)
    # Columna password: hasta 255 caracteres
    password = Column(String(255))
    # Columna is_active: indica si el usuario está activo (por defecto, sí)
    is_active = Column(Boolean, default=True)
