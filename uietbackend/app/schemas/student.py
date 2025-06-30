from pydantic import BaseModel, EmailStr, constr
from datetime import date

class StudentRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: constr(regex=r'^\d{10}$')
    dob: date
    gender: str
    address: str
    roll_no: constr(regex=r'^\d+$')
    department: str
    course: str
    semester: int
    section: str
