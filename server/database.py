import os
from motor.motor_asyncio import AsyncIOMotorClient

# Provided MongoDB URL
MONGODB_URL = "mongodb+srv://shivrajambhore01_db_user:CqWlvwJnp1aw85QPCqWlvwJnp1aw85QP@cluster0.yogpa5z.mongodb.net/?appName=Cluster0"

client = AsyncIOMotorClient(MONGODB_URL)
db = client.govtech_crm

# Collections
users_collection = db.users
complaints_collection = db.complaints
departments_collection = db.departments
