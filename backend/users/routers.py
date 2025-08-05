from fastapi import APIRouter, HTTPException, status
import users.models as UserModel
from users.schemas import UserSchema
from users.services import encrypt_password, verify_new_info
from dependencies import db_dependency

users_router = APIRouter()

@users_router.post("/users", status_code=status.HTTP_201_CREATED, tags=["Users"])
def create_user(user: UserSchema, db: db_dependency):
    hashed_password = encrypt_password(user.password)
    user.password = hashed_password
    db_user = UserModel.User(**user.dict())
    db.add(db_user)
    db.commit()
    
@users_router.get("/users/{user_id}", status_code=status.HTTP_200_OK, tags=["Users"])
async def read_user_by_id(user_id: int, db: db_dependency):
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if user:
        return user
    else:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

@users_router.get("/users", status_code=status.HTTP_200_OK, tags=["Users"])
async def read_users(db: db_dependency):
    users = db.query(UserModel.User).all()
    return users

@users_router.put("/users/{user_id}", status_code=status.HTTP_200_OK, tags=["Users"])
def update_user(user_id: int, updated_user: UserSchema, db: db_dependency):
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    verify_new_info(user, updated_user)

    db.commit()
    db.refresh(user)
    return user

@users_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Users"])
def delete_user(user_id: int, db: db_dependency):
    user = db.query(UserModel.User).filter(UserModel.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(user)
    db.commit()
    return