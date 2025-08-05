from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
import users.models as UserModel
from dependencies import db_dependency
from auth.services import create_access_token

auth_router = APIRouter()

@auth_router.post("/login", tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: db_dependency = None):
    user = db.query(UserModel.User).filter(UserModel.User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not bcrypt.checkpw(form_data.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
