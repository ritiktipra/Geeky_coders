from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import admin, register
from .api import auth
from app.api import teacher, student, subjects
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://uietfrontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(register.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(teacher.router)
app.include_router(student.router)
app.include_router(subjects.router)


@app.get("/")
def root():
    return {"message": "College Management API success"}
