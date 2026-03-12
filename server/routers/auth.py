"""
Auth router — mock JWT-style login for demo.
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from data.store import USERS
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    preferred_language: str = "en"
    phone: str = ""

@router.post("/login")
def login(body: LoginRequest):
    user = USERS.get(body.email)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_hex(24)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "preferred_language": user.get("preferred_language", "en"),
        }
    }

@router.post("/register")
def register(body: RegisterRequest):
    if body.email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"u{len(USERS) + 1}"
    USERS[body.email] = {
        "id": user_id,
        "email": body.email,
        "name": body.name,
        "password": body.password,
        "role": "citizen",
        "preferred_language": body.preferred_language,
        "phone": body.phone,
    }
    token = secrets.token_hex(24)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": body.email,
            "name": body.name,
            "role": "citizen",
            "preferred_language": body.preferred_language,
        }
    }

@router.get("/users")
def list_users():
    return [
        {"id": u["id"], "email": u["email"], "name": u["name"], "role": u["role"]}
        for u in USERS.values()
    ]

# --- Role-Based Access Control Helpers ---

def get_current_user(x_user_email: str = Header(None)):
    if not x_user_email:
        raise HTTPException(status_code=401, detail="Authentication required. Missing X-User-Email header.")
    user = USERS.get(x_user_email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user.")
    return user

def require_role(allowed_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied. Insufficient permissions.")
        return user
    return role_checker
