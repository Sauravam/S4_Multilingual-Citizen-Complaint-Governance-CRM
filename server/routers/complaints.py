"""
Complaints router — core CRUD + AI integration via Supabase.
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase
from services.ai_service import (
    classify_complaint, translate_text, detect_language,
    auto_assign_department
)
from .auth import require_role, get_current_user, get_optional_user
# We need to preserve DEPARTMENTS if we still use it for auto-assign mapping
from data.store import DEPARTMENTS 

router = APIRouter(prefix="/complaints", tags=["complaints"])

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: str = "en"
    citizen_email: str = "anonymous@gov.in"
    category: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    note: str = ""
    officer_email: str = ""

class AssignUpdate(BaseModel):
    department: str
    officer_email: str

def generate_complaint_id() -> str:
    # A simple ID generator for the cloud
    import uuid
    from datetime import datetime
    year = datetime.now().year
    short_uuid = str(uuid.uuid4())[:6].upper()
    return f"GOV-{year}-{short_uuid}"

@router.get("")
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    department: Optional[str] = None,
    citizen_email: Optional[str] = None,
    limit: int = Query(50, le=100),
    user: dict = Depends(get_current_user)
):
    query = supabase.table('complaints').select('*')
    
    # Enforce Role-Based Data Isolation
    if user["role"] == "citizen":
        query = query.eq("citizen_email", user["email"])
    elif user["role"] == "officer":
        assigned_dept = user.get("department")
        if assigned_dept:
             query = query.eq("department", assigned_dept)
    elif user["role"] == "admin":
        pass
    else:
        raise HTTPException(status_code=403, detail="Unknown role")

    if status:
        query = query.eq("status", status)
    if category:
        query = query.eq("category", category)
    if department and user["role"] == "admin":
        query = query.eq("department", department)
    if citizen_email and user["role"] == "admin":
        query = query.eq("citizen_email", citizen_email)
    
    query = query.order("submitted_at", desc=True).limit(limit)
    res = query.execute()
    
    complaints = res.data or []
    return {"complaints": complaints, "total": len(complaints)}

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str, user: dict = Depends(get_optional_user)):
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint = res.data[0]
    
    # Enforce data isolation if logged in
    if user:
        if user["role"] == "citizen" and complaint["citizen_email"] != user["email"]:
            raise HTTPException(status_code=403, detail="Access denied")
        if user["role"] == "officer" and complaint.get("department") != user.get("department"):
            raise HTTPException(status_code=403, detail="Access denied")
        
    return complaint

@router.post("", status_code=201)
def create_complaint(body: ComplaintCreate):
    # Detect language if not provided or confirm
    detected_lang = detect_language(body.description) if body.language == "en" else body.language

    # Translate to English if needed
    translation_result = translate_text(body.description, detected_lang)
    english_description = translation_result["translated_text"] if translation_result["translated"] else body.description

    # AI Classification
    ai_result = classify_complaint(body.title, english_description)
    category = body.category or ai_result["category"]

    # Auto-assign department
    dept_id = auto_assign_department(category)

    # Generate ID
    complaint_id = generate_complaint_id()

    now = datetime.utcnow().isoformat()
    complaint = {
        "id": complaint_id,
        "title": body.title,
        "description": english_description,
        "original_text": body.description,
        "original_language": detected_lang,
        "translated": translation_result.get("translated", False),
        "category": category,
        "subcategory": ai_result["subcategory"],
        "severity": ai_result["severity"],
        "status": "submitted",
        "location": body.location,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "department": dept_id,
        "assigned_to": None,
        "citizen_email": body.citizen_email,
        "media_urls": [],
        "history": [
            {"status": "submitted", "note": "Complaint received and registered.", "timestamp": now}
        ],
        "ai_classification": ai_result,
        "translation_info": translation_result if translation_result["translated"] else None,
        "submitted_at": now,
        "updated_at": now
    }

    insert_res = supabase.table("complaints").insert(complaint).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to save complaint")

    return {
        "complaint": insert_res.data[0],
        "message": f"Complaint {complaint_id} submitted successfully.",
        "department_assigned": DEPARTMENTS.get(dept_id, {}).get("name", dept_id),
    }

@router.patch("/{complaint_id}/status")
def update_status(complaint_id: str, body: StatusUpdate, user: dict = Depends(require_role(["officer", "admin"]))):
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint = res.data[0]

    valid_statuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    now = datetime.utcnow().isoformat()
    
    # Append to history
    history = complaint.get("history", [])
    history.append({
        "status": body.status,
        "note": body.note or f"Status updated to {body.status}.",
        "officer": body.officer_email,
        "timestamp": now,
    })
    
    updates = {
        "status": body.status,
        "updated_at": now,
        "history": history
    }
    if body.status == "resolved":
        updates["resolved_at"] = now

    update_res = supabase.table("complaints").update(updates).eq("id", complaint_id).execute()
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update status")
        
    return update_res.data[0]

@router.patch("/{complaint_id}/assign")
def assign_complaint(complaint_id: str, body: AssignUpdate, user: dict = Depends(require_role(["admin"]))):
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    complaint = res.data[0]
    now = datetime.utcnow().isoformat()
    
    history = complaint.get("history", [])
    
    updates = {
        "department": body.department,
        "assigned_to": body.officer_email,
        "updated_at": now
    }

    if complaint["status"] == "submitted":
        updates["status"] = "under_review"
        history.append({
            "status": "under_review",
            "note": f"Assigned to {DEPARTMENTS.get(body.department, {}).get('name', body.department)}.",
            "timestamp": now,
        })
        
    updates["history"] = history

    update_res = supabase.table("complaints").update(updates).eq("id", complaint_id).execute()
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to assign complaint")
        
    return update_res.data[0]
