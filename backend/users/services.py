from users.schemas import UserSchema
import bcrypt

def encrypt_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_new_info(user: UserSchema, updated_user: UserSchema):
    for field, value in updated_user.dict(exclude_unset=True).items():
        if field == "password":
            user.password = encrypt_password(value)
        else:
            setattr(user, field, value)