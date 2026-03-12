"""
Auth router — MongoDB Atlas based login.
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import users_collection
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
async def login(body: LoginRequest):
    user = await users_collection.find_one({"email": body.email})
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_hex(24)
    return {
        "token": token,
        "user": {
            "id": user.get("id") or str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "preferred_language": user.get("preferred_language", "en"),
        }
    }

@router.post("/register")
async def register(body: RegisterRequest):
    if await users_collection.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = await users_collection.count_documents({})
    user_id = f"u{user_count + 1}"
    
    new_user = {
        "id": user_id,
        "email": body.email,
        "name": body.name,
        "password": body.password,
        "role": "citizen",
        "preferred_language": body.preferred_language,
        "phone": body.phone,
    }
    
    await users_collection.insert_one(new_user)
    
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
async def list_users():
    users = await users_collection.find().to_list(length=100)
    return [
        {
            "id": u.get("id") or str(u["_id"]), 
            "email": u["email"], 
            "name": u["name"], 
            "role": u["role"]
        }
        for u in users
    ]

# --- Role-Based Access Control Helpers ---

async def get_current_user(x_user_email: str = Header(None)):
    if not x_user_email:
        raise HTTPException(status_code=401, detail="Authentication required. Missing X-User-Email header.")
    
    user = await users_collection.find_one({"email": x_user_email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user.")
    return user

def require_role(allowed_roles: list[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied. Insufficient permissions.")
        return user
    return role_checker
