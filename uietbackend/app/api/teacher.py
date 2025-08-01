# app/api/teacher.py
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from app.db.database import otps, attendance, approved_teachers, approved_students
from app.core.config import SUBJECTS
from app.utils.otp_utils import generate_otp
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import StringIO
import csv
import pytz

class GenerateOtpRequest(BaseModel):
    employee_id: str
    subject: str
    duration_minutes: int
    lat: float
    lng: float

router = APIRouter()

# Timezone definitions
IST = pytz.timezone('Asia/Kolkata')

@router.post("/teacher/generate-otp")
def generate_otp_route(data: GenerateOtpRequest):
    if data.subject not in SUBJECTS:
        raise HTTPException(status_code=400, detail="Invalid subject")
    
    teacher = approved_teachers.find_one({"employee_id": data.employee_id.upper()})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    otp = generate_otp()

    # Store UTC in DB
    now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)
    end_time_utc = now_utc + timedelta(minutes=data.duration_minutes)

    otps.insert_one({
        "otp": otp,
        "subject": data.subject,
        "teacher_id": data.employee_id.upper(),
        "start_time": now_utc,
        "end_time": end_time_utc,
        "location": {"lat": data.lat, "lng": data.lng}
    })

    # Convert to IST for response
    end_time_ist = end_time_utc.astimezone(IST)
    return {
        "otp": otp,
        "subject": data.subject,
        "valid_till": end_time_ist.strftime("%Y-%m-%d %H:%M:%S"),
    }

@router.get("/teacher/view-attendance/{employee_id}")
def view_attendance(employee_id: str):
    teacher = approved_teachers.find_one({"employee_id": employee_id.upper()})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Fetch all OTPs generated by this teacher
    otps_list = list(otps.find({"teacher_id": employee_id.upper()}))
    otp_codes = [o["otp"] for o in otps_list]

    # Find attendance records matching these OTPs
    records = list(attendance.find({"otp": {"$in": otp_codes}}))

    # Convert marked_at to IST for display
    result = []
    for r in records:
        marked_at_utc = r.get("marked_at")
        if marked_at_utc and marked_at_utc.tzinfo is None:
            marked_at_utc = marked_at_utc.replace(tzinfo=pytz.utc)
        marked_at_ist = marked_at_utc.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S") if marked_at_utc else None

        result.append({
            "student_name": r.get("student_name"),
            "roll_no": r.get("roll_no"),
            "subject": r.get("subject"),
            "marked_at": marked_at_ist
        })

    return result

@router.get("/teacher/export-attendance/{employee_id}")
def export_attendance(employee_id: str):
    teacher = approved_teachers.find_one({"employee_id": employee_id.upper()})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Find OTPs generated by this teacher
    otps_list = list(otps.find({"teacher_id": employee_id.upper()}))
    otp_codes = [otp["otp"] for otp in otps_list]

    # Find attendance records matching these OTPs
    records = list(attendance.find({"otp": {"$in": otp_codes}}))

    # Prepare CSV in memory
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student Name", "Roll Number", "Subject", "Date/Time (IST)"])

    for record in records:
        student = approved_students.find_one({"roll_no": record["roll_no"]})
        name = student["full_name"] if student else "Unknown"
        roll_no = record["roll_no"]
        subject = record["subject"]

        marked_at_utc = record.get("marked_at")
        if marked_at_utc and marked_at_utc.tzinfo is None:
            marked_at_utc = marked_at_utc.replace(tzinfo=pytz.utc)
        dt_ist = marked_at_utc.astimezone(IST).strftime("%Y-%m-%d %H:%M:%S") if marked_at_utc else "N/A"

        writer.writerow([name, roll_no, subject, dt_ist])

    output.seek(0)

    filename = f"attendance_{employee_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/teacher/profile/{employee_id}")
def get_teacher_profile(employee_id: str):
    employee_id = employee_id.upper()
    teacher = approved_teachers.find_one({"employee_id": employee_id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher  not found")
    
    # return only required fields (never return sensitive info)
    return {
        "full_name": teacher.get("full_name"),
        "email": teacher.get("email"),      
    }