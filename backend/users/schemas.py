from pydantic import BaseModel

class UserSchema(BaseModel):
    email: str = None
    username: str = None
    password: str = None
    is_active: bool = None
    
