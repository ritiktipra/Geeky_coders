from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import ADMIN_ID, ADMIN_PASSWORD
from app.db.database import (
    pending_students, approved_students, rejected_students,
    pending_teachers, approved_teachers, rejected_teachers
)
from app.core.email_utils import send_email

router = APIRouter()

class AdminLogin(BaseModel):
    user_id: str
    password: str
    
@router.post("/admin/login")
def admin_login(data: AdminLogin):
    if data.user_id != ADMIN_ID or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"message": "Admin login successful"}

@router.post("/admin/approve/student/{roll_no}")
def approve_student(roll_no: str):
    student = pending_students.find_one({"roll_no": roll_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    pending_students.delete_one({"roll_no": roll_no})
    approved_students.insert_one(student)
    name = student["full_name"]
    email = student["email"]
    subject = "Your account has been approved! 🎉"
    message = f"""
    Hi {name},
    Congratulations! Your student account has been approved on our College Attendance Management System.
    You can now log in and:
    ✅ Mark your attendance using OTP
    ✅ View your attendance history
    ✅ Stay updated with class activities
    If you have any questions, feel free to reach out to our support team.
    Welcome aboard!
    - College Attendance Team
    """

    send_email(email, subject, message)
    return {"message": "Student approved"}

@router.post("/admin/reject/student/{roll_no}")
def reject_student(roll_no: str):
    student = pending_students.find_one({"roll_no": roll_no})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    pending_students.delete_one({"roll_no": roll_no})
    rejected_students.insert_one(student)
    name = student["full_name"]
    email = student["email"]
    subject = "Update on Your Student Account Registration"
    message = f"""
    Hi {name},
    Thank you for registering on our College Attendance Management System.
    After reviewing your application, we regret to inform you that your student account has not been approved at this time.
    If you believe this decision was made in error or if you’d like to provide additional details for reconsideration, please feel free to contact our support team.

    We appreciate your interest and understanding.

    Welcome aboard!
    - College Attendance Team
    """

    send_email(email, subject, message)
    return {"message": "Student rejected"}

# same for teacher
@router.post("/admin/approve/teacher/{employee_id}")
def approve_teacher(employee_id: str):
    emp_id = employee_id.upper()
    teacher = pending_teachers.find_one({"employee_id": emp_id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    pending_teachers.delete_one({"employee_id": emp_id})
    approved_teachers.insert_one(teacher)
    name = teacher["full_name"]
    email = teacher["email"]
    subject = "Your Teacher Account Has Been Approved!"
    message = f"""
    Dear {name},
    Congratulations! Your teacher account has been approved on our College Attendance Management System.
    You can now log in and:
    ✅ Mark your attendance using OTP
    ✅ View your attendance history
    ✅ Stay updated with class activities
    If you have any questions, feel free to reach out to our support team.
    Welcome aboard!
    - College Attendance Team
    """

    send_email(email, subject, message)
    return {"message": "Teacher approved"}

@router.post("/admin/reject/teacher/{employee_id}")
def reject_teacher(employee_id: str):
    emp_id = employee_id.upper()
    teacher = pending_teachers.find_one({"employee_id": emp_id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    pending_teachers.delete_one({"employee_id": emp_id})
    rejected_teachers.insert_one(teacher)
    name = teacher["full_name"]
    email = teacher["email"]
    subject = "Update on Your Teacher Account Registration"
    message = f"""
    Dear {name},
    Thank you for registering on our College Attendance Management System.
    After reviewing your application, we regret to inform you that your teacher account has not been approved at this time.
    If you believe this decision was made in error or you would like to provide additional information, please feel free to contact our support team.

    We appreciate your interest in our system.

    Best regards,  
    - College Attendance Team
    """

    send_email(email, subject, message)
    return {"message": "Teacher rejected"}

# lists
@router.get("/admin/list/pending/students")
def list_pending_students():
    return list(pending_students.find({}, {"_id": 0}))

@router.get("/admin/list/pending/teachers")
def list_pending_teachers():
    return list(pending_teachers.find({}, {"_id": 0}))

@router.get("/admin/list/approved/students")
def list_approved_students():
    return list(approved_students.find({}, {"_id": 0}))

@router.get("/admin/list/approved/teachers")
def list_approved_teachers():
    return list(approved_teachers.find({}, {"_id": 0}))

@router.get("/admin/list/rejected/students")
def list_rejected_students():
    return list(rejected_students.find({}, {"_id": 0}))

@router.get("/admin/list/rejected/teachers")
def list_rejected_teachers():
    return list(rejected_teachers.find({}, {"_id": 0}))
