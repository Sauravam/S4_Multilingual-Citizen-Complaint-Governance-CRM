"""
Complaints router — core CRUD + AI integration.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.store import COMPLAINTS, DEPARTMENTS, complaint_counter
import data.store as store
from services.ai_service import (
    classify_complaint, translate_text, detect_language,
    auto_assign_department, generate_complaint_id, LANGUAGES
)

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

@router.get("")
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    department: Optional[str] = None,
    citizen_email: Optional[str] = None,
    limit: int = Query(50, le=100),
):
    complaints = list(store.COMPLAINTS.values())
    if status:
        complaints = [c for c in complaints if c["status"] == status]
    if category:
        complaints = [c for c in complaints if c["category"] == category]
    if department:
        complaints = [c for c in complaints if c["department"] == department]
    if citizen_email:
        complaints = [c for c in complaints if c["citizen_email"] == citizen_email]
    # Sort newest first
    complaints.sort(key=lambda x: x["submitted_at"], reverse=True)
    return {"complaints": complaints[:limit], "total": len(complaints)}

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str):
    complaint = store.COMPLAINTS.get(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
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
    store.complaint_counter += 1
    complaint_id = generate_complaint_id(store.complaint_counter)

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
        "submitted_at": now,
        "updated_at": now,
        "resolved_at": None,
        "history": [
            {"status": "submitted", "note": "Complaint received and registered.", "timestamp": now}
        ],
        "ai_classification": ai_result,
        "translation_info": translation_result if translation_result["translated"] else None,
    }

    store.COMPLAINTS[complaint_id] = complaint
    return {
        "complaint": complaint,
        "message": f"Complaint {complaint_id} submitted successfully.",
        "department_assigned": DEPARTMENTS.get(dept_id, {}).get("name", dept_id),
    }

@router.patch("/{complaint_id}/status")
def update_status(complaint_id: str, body: StatusUpdate):
    complaint = store.COMPLAINTS.get(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    valid_statuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"]
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    now = datetime.utcnow().isoformat()
    complaint["status"] = body.status
    complaint["updated_at"] = now
    if body.status == "resolved":
        complaint["resolved_at"] = now

    complaint["history"].append({
        "status": body.status,
        "note": body.note or f"Status updated to {body.status}.",
        "officer": body.officer_email,
        "timestamp": now,
    })
    return complaint

@router.patch("/{complaint_id}/assign")
def assign_complaint(complaint_id: str, body: AssignUpdate):
    complaint = store.COMPLAINTS.get(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now = datetime.utcnow().isoformat()
    complaint["department"] = body.department
    complaint["assigned_to"] = body.officer_email
    complaint["updated_at"] = now

    if complaint["status"] == "submitted":
        complaint["status"] = "under_review"
        complaint["history"].append({
            "status": "under_review",
            "note": f"Assigned to {DEPARTMENTS.get(body.department, {}).get('name', body.department)}.",
            "timestamp": now,
        })
    return complaint
