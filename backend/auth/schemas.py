from pydantic import BaseModel

class LoginSchema(BaseModel):
    email: str = None
    password: str = None