# app/api/student.py
from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.db.database import otps, attendance, approved_students
from app.core.config import SUBJECTS
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from io import StringIO
import csv
import pytz
import math
from typing import Optional

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

router = APIRouter()

IST = pytz.timezone('Asia/Kolkata')

class MarkAttendanceRequest(BaseModel):
    roll_no: str
    otp: str
    subject: str
    visitorId: str
    lat: Optional[float]
    lng: Optional[float]


@router.post("/student/markAttendance")
def mark_attendance(req: MarkAttendanceRequest):
    roll_no = req.roll_no.upper()
    otp = req.otp
    subject = req.subject.strip().lower()
    visitor_id = req.visitorId

    SUBJECTS_LOWER = [s.lower() for s in SUBJECTS]
    if subject not in SUBJECTS_LOWER:
        raise HTTPException(status_code=400, detail="Invalid subject")

    student = approved_students.find_one({"roll_no": roll_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    otp_doc = otps.find_one({"otp": otp})
    if not otp_doc:
        raise HTTPException(status_code=404, detail="Invalid OTP")

    now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)

    start_time = otp_doc["start_time"]
    end_time = otp_doc["end_time"]

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=pytz.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=pytz.utc)

    if not (start_time <= now_utc <= end_time):
        raise HTTPException(status_code=400, detail="OTP expired or not active")

    if otp_doc["subject"].strip().lower() != subject:
        raise HTTPException(status_code=400, detail="Subject does not match OTP")

    already_marked = attendance.find_one({"roll_no": roll_no, "otp": otp})
    if already_marked:
        raise HTTPException(status_code=400, detail="Attendance already marked")

    # ✅ location validation
    if req.lat is None or req.lng is None:
        raise HTTPException(status_code=400, detail="Location (lat/lng) required to mark attendance")

    location = otp_doc.get("location")
    if not location or "lat" not in location or "lng" not in location:
        raise HTTPException(status_code=500, detail="Teacher location not available in OTP")

    teacher_lat = location["lat"]
    teacher_lng = location["lng"]
    print("Student location:", req.lat, req.lng)
    print("Teacher location:", teacher_lat, teacher_lng)

    distance = haversine_distance(req.lat, req.lng, teacher_lat, teacher_lng)
    if distance > 100:
        raise HTTPException(status_code=400, detail=f"Too far from teacher's location ({round(distance)} m > 100 m)")

    # ✅ recent device check
    from datetime import timedelta
    fifty_min_ago = now_utc - timedelta(minutes=50)
    recent = attendance.find_one({
        "roll_no": roll_no,
        "visitor_id": visitor_id,
        "marked_at": {"$gte": fifty_min_ago}
    })
    if recent:
        raise HTTPException(status_code=400, detail="Attendance already marked from this device recently (within 50 minutes)")

    attendance.insert_one({
        "roll_no": roll_no,
        "student_name": student["full_name"],
        "subject": subject,
        "otp": otp,
        "visitor_id": visitor_id,
        "marked_at": now_utc,
        "lat": req.lat,
        "lng": req.lng
    })

    return {"message": "Attendance marked successfully"}


@router.get("/student/view-attendance/{roll_no}")
def view_attendance(roll_no: str, subject: str = None):
    roll_no = roll_no.upper()
    query = {"roll_no": roll_no}

    if subject:
        subject = subject.strip().lower()
        SUBJECTS_LOWER = [s.lower() for s in SUBJECTS]
        if subject not in SUBJECTS_LOWER:
            raise HTTPException(status_code=400, detail="Invalid subject")
        query["subject"] = subject

    records = list(attendance.find(query))

    result = []
    for r in records:
        marked_at = r.get("marked_at")
        if marked_at and marked_at.tzinfo is None:
            marked_at = marked_at.replace(tzinfo=pytz.utc)
        marked_at_ist = marked_at.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S") if marked_at else None

        result.append({
            "subject": r["subject"],
            "marked_at": marked_at_ist
        })

    return result

@router.get("/student/check-otp/{otp}")
def check_otp(otp: str):
    otp_doc = otps.find_one({"otp": otp})
    if not otp_doc:
        raise HTTPException(status_code=404, detail="Invalid OTP")

    start_time = otp_doc["start_time"]
    end_time = otp_doc["end_time"]

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=pytz.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=pytz.utc)

    return {
        "subject": otp_doc["subject"],
        "start_time": start_time.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S"),
        "end_time": end_time.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/student/export-attendance/{roll_no}")
async def export_attendance_csv(roll_no: str):
    roll_no = roll_no.upper()
    records = list(attendance.find({"roll_no": roll_no}))

    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found.")

    csv_file = StringIO()
    writer = csv.writer(csv_file)
    writer.writerow(["Subject", "Marked At (IST)"])

    for rec in records:
        subject = rec.get("subject", "")
        marked_at = rec.get("marked_at")
        if marked_at and marked_at.tzinfo is None:
            marked_at = marked_at.replace(tzinfo=pytz.utc)
        marked_at_ist = marked_at.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S") if marked_at else ""

        writer.writerow([subject, marked_at_ist])

    csv_file.seek(0)

    filename = f"attendance_{roll_no}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/student/profile/{roll_no}")
def get_student_profile(roll_no: str):
    roll_no = roll_no.upper()
    student = approved_students.find_one({"roll_no": roll_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # return only required fields (never return sensitive info)
    return {
        "full_name": student.get("full_name"),
        "email": student.get("email"),
        "department": student.get("department"),
        "semester": student.get("semester"),
        "section": student.get("section"),
        "roll_no": student.get("roll_no")
        # add more fields if needed
    }