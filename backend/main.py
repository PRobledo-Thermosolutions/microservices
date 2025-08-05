from typing import Union
from fastapi import FastAPI, HTTPException, Depends, status, Form
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import bcrypt

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

class UserModel(BaseModel):
    email: str = None
    username: str = None
    password: str = None
    is_active: bool = None

class LoginModel(BaseModel):
    username: str = None
    password: str = None
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def encrypt_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_new_info(user: UserModel, updated_user: UserModel):
    for field, value in updated_user.dict(exclude_unset=True).items():
        if field == "password":
            user.password = encrypt_password(value)
        else:
            setattr(user, field, value)
        
db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserModel, db: db_dependency):
    hashed_password = encrypt_password(user.password)
    user.password = hashed_password
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    
@app.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def read_user(user_id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        return user
    else:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@app.put("/users/{user_id}", status_code=status.HTTP_200_OK)
def update_user(user_id: int, updated_user: UserModel, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    verify_new_info(user, updated_user)

    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(user)
    db.commit()
    return

@app.post("/login")
def login(login_req: LoginModel, db: db_dependency):
    user = db.query(models.User).filter(models.User.username == login_req.username).first()

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
