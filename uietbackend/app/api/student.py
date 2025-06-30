# app/api/student.py
from fastapi import APIRouter, HTTPException, Body, Depends
from datetime import datetime
from app.db.database import otps, attendance, approved_students
from app.core.config import SUBJECTS
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from bson import ObjectId
from io import StringIO
import csv
from app.db.database import attendance

router = APIRouter()

class MarkAttendanceRequest(BaseModel):
    roll_no: str
    otp: str
    subject: str

@router.post("/student/markAttendance")
def mark_attendance(req: MarkAttendanceRequest):
    roll_no = req.roll_no
    otp = req.otp
    subject = req.subject.strip().lower()  # normalize subject input
    # Make SUBJECTS lowercase too, if not already
    SUBJECTS_LOWER = [s.lower() for s in SUBJECTS]

    if subject not in SUBJECTS_LOWER:
        raise HTTPException(status_code=400, detail="Invalid subject")

    student = approved_students.find_one({"roll_no": roll_no.upper()})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    otp_doc = otps.find_one({"otp": otp})
    if not otp_doc:
        raise HTTPException(status_code=404, detail="Invalid OTP")

    now = datetime.utcnow()
    if not (otp_doc["start_time"] <= now <= otp_doc["end_time"]):
        raise HTTPException(status_code=400, detail="OTP expired or not active")

    # Compare subject from OTP (stored in DB) and input subject in lowercase
    if otp_doc["subject"].strip().lower() != subject:
        raise HTTPException(status_code=400, detail="Subject does not match OTP")

    already_marked = attendance.find_one({"roll_no": roll_no.upper(), "otp": otp})
    if already_marked:
        raise HTTPException(status_code=400, detail="Attendance already marked")

    attendance.insert_one({
        "roll_no": roll_no.upper(),
        "student_name": student["full_name"],
        "subject": subject,  # store normalized lowercase subject
        "otp": otp,
        "marked_at": now
    })
    return {"message": "Attendance marked successfully"}


@router.get("/student/view-attendance/{roll_no}")
def view_attendance(roll_no: str, subject: str = None):
    query = {"roll_no": roll_no.upper()}
    if subject:
        if subject not in SUBJECTS:
            raise HTTPException(status_code=400, detail="Invalid subject")
        query["subject"] = subject

    records = list(attendance.find(query))
    return [
        {
            "subject": r["subject"],
            "marked_at": r["marked_at"]
        }
        for r in records
    ]

@router.get("/student/check-otp/{otp}")
def check_otp(otp: str):
    otp_doc = otps.find_one({"otp": otp})
    if not otp_doc:
        raise HTTPException(status_code=404, detail="Invalid OTP")
    return {
        "subject": otp_doc["subject"],
        "start_time": otp_doc["start_time"],
        "end_time": otp_doc["end_time"]
    }

@router.get("/student/export-attendance/{roll_no}")
async def export_attendance_csv(roll_no: str):
    records = list(attendance.find({"roll_no": roll_no}))

    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found.")

    csv_file = StringIO()
    writer = csv.writer(csv_file)
    writer.writerow(["Subject", "Marked At"])

    for rec in records:
        subject = rec.get("subject", "")
        marked_at = str(rec.get("marked_at", ""))
        writer.writerow([subject, marked_at])

    csv_file.seek(0)

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_{roll_no}.csv"}
    )