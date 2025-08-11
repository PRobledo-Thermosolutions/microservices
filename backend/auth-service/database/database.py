# Herramientas de SQLAlchemy para conexión y manejo de sesiones
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# Base declarativa para definir modelos
from sqlalchemy.ext.declarative import declarative_base
# Driver pymysql para conectarse a MySQL desde Python
import pymysql
# Carga variables de entorno desde el archivo .env
from dotenv import load_dotenv
import os

# Carga las variables de entorno al entorno de ejecución
load_dotenv()

# Extrae las variables de conexión desde el archivo .env
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Función que crea la base de datos si no existe, usando pymysql directamente
def create_database_if_not_exists():
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS {DB_NAME} "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        connection.commit()
    finally:
        connection.close()

# Ejecuta la función para asegurarse de que la base de datos exista
create_database_if_not_exists()

# Construye la URL de conexión para SQLAlchemy usando pymysql como driver
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Crea el motor de conexión de SQLAlchemy, que gestiona la conexión con la base de datos
engine = create_engine(SQLALCHEMY_DATABASE_URL)
# Crea una clase fábrica de sesiones para interactuar con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base declarativa a partir de la cual se construirán los modelos ORM (tablas)
Base = declarative_base()
