from pymongo import MongoClient
from app.core.config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client["uietattendance"]

# collections
pending_students = db["pending_students"]
approved_students = db["approved_students"]
rejected_students = db["rejected_students"]

pending_teachers = db["pending_teachers"]
approved_teachers = db["approved_teachers"]
rejected_teachers = db["rejected_teachers"]

otps = db["otps"]
attendance = db["attendance"]