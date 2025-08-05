from fastapi import FastAPI
from database import engine
import users.models as UserModel
from users.routers import users_router
from auth.routers import auth_router
from dependencies import db_dependency

app = FastAPI()

UserModel.Base.metadata.create_all(bind=engine)

app.title = "Microservices API FastAPI"
app.version = "0.0.1"

app.include_router(users_router)
app.include_router(auth_router)

db_dependency = db_dependency
