from pydantic import BaseModel, EmailStr, constr
from datetime import date

class TeacherRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: constr(regex=r'^\d{10}$')
    dob: date
    gender: str
    address: str
    employee_id: str
    subject: str
