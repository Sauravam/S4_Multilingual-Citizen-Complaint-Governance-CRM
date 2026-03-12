"""
In-memory data store — department and category mappings only.
All user/complaint data is stored in Supabase.
"""

# ---------------- Departments ----------------
DEPARTMENTS = {
    "PWD": {"id": "PWD", "name": "Public Works Department", "head": "officer2@gov.in"},
    "WATER": {"id": "WATER", "name": "Water & Sanitation Board", "head": "officer3@gov.in"},
    "ELEC": {"id": "ELEC", "name": "Electricity Department", "head": "officer4@gov.in"},
    "ENV": {"id": "ENV", "name": "Environment & Waste Dept.", "head": "officer5@gov.in"},
    "HEALTH": {"id": "HEALTH", "name": "Public Health Department", "head": "officer6@gov.in"},
    "POLICE": {"id": "POLICE", "name": "Law & Order / Police", "head": "officer7@gov.in"},
    "REVENUE": {"id": "REVENUE", "name": "Revenue & Land Records", "head": "officer8@gov.in"},
    "GENERAL": {"id": "GENERAL", "name": "General Administration", "head": "officer@gov.in"},
}

# Category → Department mapping (used by AI auto-routing)
CATEGORY_TO_DEPT = {
    "roads": "PWD",
    "water": "WATER",
    "electricity": "ELEC",
    "garbage": "ENV",
    "sanitation": "WATER",
    "health": "HEALTH",
    "safety": "POLICE",
    "land": "REVENUE",
    "other": "GENERAL",
}
