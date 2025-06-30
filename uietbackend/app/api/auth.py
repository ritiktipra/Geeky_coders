from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date
from app.db.database import approved_students, approved_teachers

router = APIRouter()

class StudentLoginRequest(BaseModel):
    roll_no: str
    dob: date

class TeacherLoginRequest(BaseModel):
    employee_id: str
    dob: date

@router.post("/login/student")
def login_student(data: StudentLoginRequest):
    student = approved_students.find_one({"roll_no": data.roll_no})
    if not student or str(student["dob"]) != str(data.dob):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful"}

@router.post("/login/teacher")
def login_teacher(data: TeacherLoginRequest):
    teacher = approved_teachers.find_one({"employee_id": data.employee_id.upper()})
    if not teacher or str(teacher["dob"]) != str(data.dob):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful"}
