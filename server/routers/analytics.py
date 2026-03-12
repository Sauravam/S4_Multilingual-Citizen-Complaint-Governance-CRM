"""
Analytics router — trends, department stats, heatmap data via Supabase.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from collections import defaultdict
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import supabase
from data.store import DEPARTMENTS # Still used for naming config
from .auth import require_role

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(require_role(["admin"]))]
)

def parse_date(iso_str: str):
    try:
        return datetime.fromisoformat(iso_str[:10])
    except:
        return None

# Fetch all complaints from supabase for analytics processing
def fetch_all_complaints():
    res = supabase.table('complaints').select('*').execute()
    return res.data or []

@router.get("/summary")
def get_summary():
    complaints = fetch_all_complaints()
    total = len(complaints)
    by_status = defaultdict(int)
    by_category = defaultdict(int)
    by_severity = defaultdict(int)
    resolved_times = []

    for c in complaints:
        by_status[c["status"]] += 1
        by_category[c["category"]] += 1
        by_severity[c["severity"]] += 1
        if c.get("resolved_at") and c.get("submitted_at"):
            try:
                # Handle varying ISO formats natively from Postgres
                submitted = datetime.fromisoformat(c["submitted_at"].replace('Z', '+00:00'))
                resolved = datetime.fromisoformat(c["resolved_at"].replace('Z', '+00:00'))
                resolved_times.append((resolved - submitted).days)
            except:
                pass

    avg_resolution = round(sum(resolved_times) / len(resolved_times), 1) if resolved_times else 0

    return {
        "total": total,
        "by_status": dict(by_status),
        "by_category": dict(by_category),
        "by_severity": dict(by_severity),
        "avg_resolution_days": avg_resolution,
        "resolution_rate": round(by_status.get("resolved", 0) / total * 100, 1) if total else 0,
    }

@router.get("/trends")
def get_trends():
    """Returns complaint counts per day for the last 30 days."""
    complaints = fetch_all_complaints()
    today = datetime.utcnow().date()
    days = {str(today - timedelta(days=i)): 0 for i in range(29, -1, -1)}

    for c in complaints:
        d = parse_date(c["submitted_at"])
        if d:
            key = str(d.date())
            if key in days:
                days[key] += 1

    trend_data = [{"date": k, "count": v} for k, v in days.items()]

    # Add some variety for categories
    category_trends = defaultdict(lambda: defaultdict(int))
    for c in complaints:
        d = parse_date(c["submitted_at"])
        if d:
            key = str(d.date())
            category_trends[c["category"]][key] += 1

    return {"daily_trends": trend_data, "category_trends": dict(category_trends)}

@router.get("/departments")
def get_department_stats():
    complaints = fetch_all_complaints()
    dept_stats = defaultdict(lambda: {"total": 0, "resolved": 0, "pending": 0, "avg_days": []})

    for c in complaints:
        dept = c.get("department", "GENERAL")
        dept_stats[dept]["total"] += 1
        if c["status"] == "resolved":
            dept_stats[dept]["resolved"] += 1
            if c.get("resolved_at") and c.get("submitted_at"):
                try:
                    days = (datetime.fromisoformat(c["resolved_at"].replace('Z', '+00:00')) -
                            datetime.fromisoformat(c["submitted_at"].replace('Z', '+00:00'))).days
                    dept_stats[dept]["avg_days"].append(days)
                except:
                    pass
        else:
            dept_stats[dept]["pending"] += 1

    result = []
    for dept_id, stats in dept_stats.items():
        dept_info = DEPARTMENTS.get(dept_id, {"name": dept_id})
        avg = round(sum(stats["avg_days"]) / len(stats["avg_days"]), 1) if stats["avg_days"] else 0
        result.append({
            "department_id": dept_id,
            "department_name": dept_info["name"],
            "total": stats["total"],
            "resolved": stats["resolved"],
            "pending": stats["pending"],
            "resolution_rate": round(stats["resolved"] / stats["total"] * 100, 1) if stats["total"] else 0,
            "avg_resolution_days": avg,
        })

    result.sort(key=lambda x: x["total"], reverse=True)
    return {"departments": result}

@router.get("/heatmap")
def get_heatmap():
    """Returns geo-coordinates for complaint heatmap."""
    complaints = fetch_all_complaints()
    points = []
    for c in complaints:
        if c.get("latitude") and c.get("longitude"):
            points.append({
                "id": c["id"],
                "lat": c["latitude"],
                "lng": c["longitude"],
                "category": c["category"],
                "severity": c["severity"],
                "status": c["status"],
                "location": c["location"],
            })
    return {"points": points}

@router.get("/languages")
def get_language_stats():
    """Language distribution of submitted complaints."""
    complaints = fetch_all_complaints()
    by_language = defaultdict(int)
    for c in complaints:
        lang = c.get("original_language", "en")
        by_language[lang] += 1
    return {"by_language": dict(by_language)}
