"""
Complaints router — core CRUD + AI integration + duplicate detection + escalation via Supabase.
Role enforcement:
  - Citizen: can submit complaints, view their own, escalate
  - Officer: can view department complaints, update status
  - Admin: read-only access to all complaints
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase
from services.ai_service import (
    classify_complaint, translate_text, detect_language,
    auto_assign_department
)
from .auth import require_role, get_current_user, get_optional_user
from data.store import DEPARTMENTS

router = APIRouter(prefix="/complaints", tags=["complaints"])

SLA_DAYS = 7

# --- Indian States List ---
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Chandigarh", "Puducherry", "Jammu and Kashmir", "Ladakh",
]

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location: str
    state: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: str = "en"
    citizen_email: str = "anonymous@gov.in"
    category: Optional[str] = None
    image_base64: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    note: str = ""
    officer_email: str = ""

class AssignUpdate(BaseModel):
    department: str
    officer_email: str

class EscalationRequest(BaseModel):
    reason: str = ""

def generate_complaint_id() -> str:
    import uuid
    year = datetime.now().year
    short_uuid = str(uuid.uuid4())[:6].upper()
    return f"GOV-{year}-{short_uuid}"

def is_sla_breached(complaint: dict) -> bool:
    if complaint.get("status") in ("resolved", "rejected"):
        return False
    submitted = complaint.get("submitted_at", "")
    if not submitted:
        return False
    try:
        submitted_dt = datetime.fromisoformat(submitted.replace('Z', '+00:00'))
        if submitted_dt.tzinfo is None:
            submitted_dt = submitted_dt.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - submitted_dt).days >= SLA_DAYS
    except:
        return False

# --- Endpoints ---

@router.get("/states")
def list_states():
    """Returns list of Indian states for the submit form."""
    return {"states": INDIAN_STATES}

@router.get("")
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    department: Optional[str] = None,
    state: Optional[str] = None,
    citizen_email: Optional[str] = None,
    limit: int = Query(50, le=100),
    user: dict = Depends(get_current_user)
):
    query = supabase.table('complaints').select('*')

    # Role-Based Data Isolation
    if user["role"] == "citizen":
        query = query.eq("citizen_email", user["email"])
    elif user["role"] == "officer":
        assigned_dept = user.get("department")
        if assigned_dept:
            query = query.eq("department", assigned_dept)
    elif user["role"] == "admin":
        pass  # Admin sees everything
    else:
        raise HTTPException(status_code=403, detail="Unknown role")

    if status:
        query = query.eq("status", status)
    if category:
        query = query.eq("category", category)
    if department and user["role"] in ["admin", "officer"]:
        query = query.eq("department", department)
    if state and user["role"] == "admin":
        query = query.eq("state", state)
    if citizen_email and user["role"] == "admin":
        query = query.eq("citizen_email", citizen_email)

    query = query.order("submitted_at", desc=True).limit(limit)
    res = query.execute()

    complaints = res.data or []
    
    # Add SLA flag to each complaint
    for c in complaints:
        c["sla_breached"] = is_sla_breached(c)

    return {"complaints": complaints, "total": len(complaints)}

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str, user: dict = Depends(get_optional_user)):
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = res.data[0]

    # Officers can only view complaints in their department
    if user:
        if user["role"] == "officer" and complaint.get("department") != user.get("department"):
            raise HTTPException(status_code=403, detail="Officers can only view complaints in their own department.")

    # Add SLA flag and duplicate count
    complaint["sla_breached"] = is_sla_breached(complaint)
    
    # Check for similar/duplicate complaints (same location + category)
    if complaint.get("category") and complaint.get("location"):
        dup_res = supabase.table("complaints").select("id").eq(
            "category", complaint["category"]
        ).eq("location", complaint["location"]).neq("id", complaint_id).execute()
        complaint["similar_count"] = len(dup_res.data) if dup_res.data else 0
    else:
        complaint["similar_count"] = 0

    return complaint

# --- CITIZEN ONLY: Submit a new complaint ---
@router.post("", status_code=201)
def create_complaint(body: ComplaintCreate, user: dict = Depends(require_role(["citizen"]))):
    detected_lang = detect_language(body.description) if body.language == "en" else body.language
    translation_result = translate_text(body.description, detected_lang)
    english_description = translation_result["translated_text"] if translation_result["translated"] else body.description

    ai_result = classify_complaint(body.title, english_description)
    category = body.category or ai_result["category"]
    dept_id = auto_assign_department(category)
    complaint_id = generate_complaint_id()

    # --- Duplicate Detection ---
    duplicate_info = None
    if body.location:
        existing = supabase.table("complaints").select("id, title, status").eq(
            "category", category
        ).eq("location", body.location).neq("status", "resolved").neq("status", "rejected").limit(5).execute()
        if existing.data and len(existing.data) > 0:
            duplicate_info = {
                "similar_count": len(existing.data),
                "similar_ids": [c["id"] for c in existing.data[:3]],
                "message": f"{len(existing.data)} similar complaint(s) already reported at this location."
            }

    # --- Image Upload to Supabase Storage ---
    media_urls = []
    if body.image_base64:
        try:
            import base64
            import mimetypes
            
            # Extract base64 prefix if exists (e.g. data:image/png;base64,...)
            header, encoded = body.image_base64.split(",", 1) if "," in body.image_base64 else ("", body.image_base64)
            file_bytes = base64.b64decode(encoded)
            
            # Determine extension
            ext = ".jpg"
            if "image/png" in header: ext = ".png"
            elif "image/jpeg" in header: ext = ".jpg"
            elif "image/webm" in header: ext = ".webm"
            
            filename = f"{complaint_id}{ext}"
            
            # Upload to Supabase 'evidence' bucket
            res = supabase.storage.from_("evidence").upload(
                path=filename,
                file=file_bytes,
                file_options={"content-type": header.split(";")[0].replace("data:", "") if header else "image/jpeg"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_("evidence").get_public_url(filename)
            media_urls.append(public_url)
        except Exception as e:
            print(f"Failed to upload image: {e}")
            pass

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
        "state": body.state,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "department": dept_id,
        "assigned_to": None,
        "citizen_email": user["email"],
        "media_urls": media_urls,
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

    result = {
        "complaint": insert_res.data[0],
        "message": f"Complaint {complaint_id} submitted successfully.",
        "department_assigned": DEPARTMENTS.get(dept_id, {}).get("name", dept_id),
    }
    if duplicate_info:
        result["duplicate_warning"] = duplicate_info

    return result

# --- CITIZEN ONLY: Escalate a complaint ---
@router.post("/{complaint_id}/escalate")
def escalate_complaint(complaint_id: str, body: EscalationRequest, user: dict = Depends(require_role(["citizen"]))):
    """Citizen can escalate a complaint if it's been open too long or not being resolved."""
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = res.data[0]

    # Only the citizen who submitted can escalate
    if complaint["citizen_email"] != user["email"]:
        raise HTTPException(status_code=403, detail="You can only escalate your own complaints.")

    # Cannot escalate if already resolved/rejected
    if complaint["status"] in ("resolved", "rejected"):
        raise HTTPException(status_code=400, detail="Cannot escalate a resolved or rejected complaint.")

    now = datetime.utcnow().isoformat()
    history = complaint.get("history", [])

    # Change severity to critical if not already
    new_severity = "critical" if complaint.get("severity") != "critical" else complaint["severity"]
    
    history.append({
        "status": complaint["status"],
        "note": f"⚠️ ESCALATED by citizen. Reason: {body.reason or 'Delayed resolution'}",
        "officer": "SYSTEM",
        "timestamp": now,
    })

    updates = {
        "severity": new_severity,
        "updated_at": now,
        "history": history,
    }

    update_res = supabase.table("complaints").update(updates).eq("id", complaint_id).execute()
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to escalate complaint")

    return {
        "complaint": update_res.data[0],
        "message": f"Complaint {complaint_id} has been escalated to CRITICAL priority."
    }

# --- OFFICER & ADMIN: Update complaint status ---
@router.patch("/{complaint_id}/status")
def update_status(complaint_id: str, body: StatusUpdate, user: dict = Depends(require_role(["officer", "admin"]))):
    res = supabase.table("complaints").select("*").eq("id", complaint_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = res.data[0]

    # Officers can only update their own department; Admin can update anything
    if user["role"] == "officer" and complaint.get("department") != user.get("department"):
        raise HTTPException(status_code=403, detail="This complaint is not assigned to your department.")

    valid_statuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    now = datetime.utcnow().isoformat()

    history = complaint.get("history", [])
    history.append({
        "status": body.status,
        "note": body.note or f"Status updated to {body.status}.",
        "officer": user["email"],
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

# --- OFFICER & ADMIN: Assign complaint to department ---
@router.patch("/{complaint_id}/assign")
def assign_complaint(complaint_id: str, body: AssignUpdate, user: dict = Depends(require_role(["officer", "admin"]))):
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
