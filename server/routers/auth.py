"""
Auth router — Supabase Cloud PostgreSQL login.
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase
import secrets
from database import supabase
import secrets
from passlib.context import CryptContext

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Departments ---
DEPARTMENTS = {
    "PWD": "Public Works Department",
    "WATER": "Water & Sanitation Board",
    "ELEC": "Electricity Department",
    "ENV": "Environment & Waste Dept.",
    "HEALTH": "Public Health Department",
    "POLICE": "Law & Order / Police",
    "REVENUE": "Revenue & Land Records",
    "GENERAL": "General Administration",
}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "citizen"
    department: Optional[str] = None
    preferred_language: str = "en"
    phone: str = ""

@router.post("/login")
def login(body: LoginRequest):
    res = supabase.table('users').select('*').eq('email', body.email).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user = res.data[0]
    
    # Handle both old plain-text users and new hashed users
    try:
        is_valid = pwd_context.verify(body.password, user["password"])
    except ValueError:
        # Fallback if old plain-text database entry
        is_valid = user["password"] == body.password
        
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = secrets.token_hex(24)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "department": user.get("department", ""),
            "preferred_language": user.get("preferred_language", "en"),
        }
    }

@router.post("/register")
def register(body: RegisterRequest):
    # Validate role
    if body.role not in ("citizen", "officer", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be citizen, officer, or admin.")
    
    # Officers MUST have a department
    if body.role == "officer":
        if not body.department or body.department not in DEPARTMENTS:
            raise HTTPException(status_code=400, detail=f"Officers must select a department. Valid: {list(DEPARTMENTS.keys())}")
    
    res = supabase.table('users').select('*').eq('email', body.email).execute()
    if res.data and len(res.data) > 0:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"u_{secrets.token_hex(6)}"
    hashed_password = pwd_context.hash(body.password)
    
    new_user = {
        "id": user_id,
        "email": body.email,
        "name": body.name,
        "password": hashed_password,
        "role": body.role,
        "department": body.department if body.role == "officer" else None,
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
            "department": user.get("department", ""),
            "preferred_language": user.get("preferred_language", "en"),
        }
    }

@router.get("/departments")
def list_departments():
    """Returns department list for officer registration."""
    return {"departments": [{"id": k, "name": v} for k, v in DEPARTMENTS.items()]}

@router.get("/users")
def list_users():
    res = supabase.table('users').select('*').execute()
    return [
        {"id": u["id"], "email": u["email"], "name": u["name"], "role": u["role"], "department": u.get("department", "")}
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
