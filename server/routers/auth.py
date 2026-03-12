"""
Auth router — Supabase Cloud PostgreSQL login.
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase
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
    res = supabase.table('users').select('*').eq('email', body.email).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = res.data[0]
    if user["password"] != body.password:
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
    res = supabase.table('users').select('*').eq('email', body.email).execute()
    if res.data and len(res.data) > 0:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"u_{secrets.token_hex(6)}"
    
    new_user = {
        "id": user_id,
        "email": body.email,
        "name": body.name,
        "password": body.password,
        "role": "citizen",
        "preferred_language": body.preferred_language,
        "phone": body.phone,
    }
    
    insert_res = supabase.table('users').insert(new_user).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to register user")
        
    user = insert_res.data[0]
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

@router.get("/users")
def list_users():
    res = supabase.table('users').select('*').execute()
    return [
        {"id": u["id"], "email": u["email"], "name": u["name"], "role": u["role"]}
        for u in res.data
    ]

# --- Role-Based Access Control Helpers ---

def get_current_user(x_user_email: str = Header(None)):
    if not x_user_email:
        raise HTTPException(status_code=401, detail="Authentication required. Missing X-User-Email header.")
    
    res = supabase.table('users').select('*').eq('email', x_user_email).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid user.")
        
    return res.data[0]

def get_optional_user(x_user_email: str = Header(None)):
    if not x_user_email:
        return None
    res = supabase.table('users').select('*').eq('email', x_user_email).execute()
    if not res.data or len(res.data) == 0:
        return None
    return res.data[0]

def require_role(allowed_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied. Insufficient permissions.")
        return user
    return role_checker
