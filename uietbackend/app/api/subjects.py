# app/api/subjects.py
from fastapi import APIRouter
from app.core.config import SUBJECTS

router = APIRouter()

@router.get("/subjects")
def get_subjects():
    return SUBJECTS
