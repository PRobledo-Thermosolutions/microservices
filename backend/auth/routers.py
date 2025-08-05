from fastapi import APIRouter, HTTPException
import bcrypt
import users.models as UserModel
from auth.schemas import LoginSchema
from dependencies import db_dependency

auth_router = APIRouter()

@auth_router.post("/login", tags=["Auth"])
def login(login_req: LoginSchema, db: db_dependency):
    user = db.query(UserModel.User).filter(UserModel.User.email == login_req.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not bcrypt.checkpw(login_req.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "message": "Inicio de sesión exitoso",
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }
