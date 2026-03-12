"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import complaints, auth, analytics

app = FastAPI(
    title="GovTech CRM API",
    description="Multilingual Citizen Complaint & Governance CRM",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "message": "GovTech CRM API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/departments")
def get_departments():
    from data.store import DEPARTMENTS
    return {"departments": list(DEPARTMENTS.values())}

@app.get("/health")
def health():
    return {"status": "healthy"}
