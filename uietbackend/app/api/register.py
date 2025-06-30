from fastapi import APIRouter
from app.schemas.student import StudentRegister
from app.schemas.teacher import TeacherRegister
from app.db.database import pending_students, pending_teachers

router = APIRouter()


@router.post("/register/student")
def register_student(student: StudentRegister):
    student = student.dict()
    student['dob'] = student['dob'].isoformat()  # convert date to string
    pending_students.insert_one(student)
    return {"message": "Registration request submitted"}


@router.post("/register/teacher")
def register_teacher(teacher: TeacherRegister):
    teacher = teacher.dict()
    teacher['dob'] = teacher['dob'].isoformat()  # convert to 'YYYY-MM-DD' string
    pending_teachers.insert_one(teacher)
    return {"message": "Registration request submitted"}
