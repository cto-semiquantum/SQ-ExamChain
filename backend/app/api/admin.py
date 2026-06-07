from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.exam import ExamPaper, Assignment
from app.models.audit import AuditLog
from app.schemas import ExamOut, AssignmentOut, AuditLogOut
from app.services.crypto_service import encrypt_pdf
from app.services.blockchain_service import add_audit_log, verify_blockchain
from datetime import datetime, timezone
from typing import Optional
import os

router = APIRouter()

def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")

def _exam_to_dict(exam: ExamPaper) -> dict:
    """Convert ExamPaper ORM object to dict with computed is_locked field."""
    now = datetime.utcnow()
    is_locked = True
    if exam.unlock_time is None or now >= exam.unlock_time:
        is_locked = False
    return {
        "id":          exam.id,
        "title":       exam.title,
        "uploaded_at": exam.uploaded_at,
        "exam_date":   exam.exam_date,
        "exam_time":   exam.exam_time,
        "unlock_time": exam.unlock_time,
        "is_locked":   is_locked,
    }

@router.post("/upload")
async def upload_exam(
    title:       str           = Form(...),
    file:        UploadFile    = File(...),
    exam_date:   Optional[str] = Form(None),   # "YYYY-MM-DD"
    exam_time:   Optional[str] = Form(None),   # "HH:MM"
    unlock_time: Optional[str] = Form(None),   # ISO datetime string e.g. "2026-06-07T10:00"
    db:          Session       = Depends(get_db),
    current_user: User         = Depends(get_current_user)
):
    check_admin(current_user)

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Parse unlock_time
    unlock_dt = None
    if unlock_time:
        try:
            unlock_dt = datetime.fromisoformat(unlock_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid unlock_time format. Use ISO 8601.")

    # Read and encrypt PDF
    file_bytes      = await file.read()
    encrypted_bytes = encrypt_pdf(file_bytes)

    # Save to disk
    os.makedirs("../papers", exist_ok=True)
    safe_title = title.replace(' ', '_').replace('/', '-')
    file_path  = f"../papers/{safe_title}_{file.filename}.enc"
    with open(file_path, "wb") as f:
        f.write(encrypted_bytes)

    # Save to DB
    new_exam = ExamPaper(
        title       = title,
        file_path   = file_path,
        exam_date   = exam_date,
        exam_time   = exam_time,
        unlock_time = unlock_dt,
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    lock_info = f" | Unlocks: {unlock_dt.isoformat()}" if unlock_dt else " | No lock set"
    add_audit_log(db, action="UPLOAD_EXAM", user_id=current_user.id,
                  details=f"Uploaded exam {new_exam.id} ({title}){lock_info}")

    return _exam_to_dict(new_exam)

@router.post("/assign", response_model=AssignmentOut)
def assign_exam(
    exam_id:   int     = Form(...),
    center_id: int     = Form(...),
    db:        Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)

    exam = db.query(ExamPaper).filter(ExamPaper.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    center = db.query(User).filter(User.id == center_id, User.is_admin == False).first()
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")

    assignment = db.query(Assignment).filter(
        Assignment.exam_id == exam_id, Assignment.center_id == center_id
    ).first()
    if assignment:
        raise HTTPException(status_code=400, detail="Already assigned")

    new_assignment = Assignment(exam_id=exam_id, center_id=center_id)
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    add_audit_log(db, action="ASSIGN_EXAM", user_id=current_user.id,
                  details=f"Assigned exam {exam_id} to center {center_id}")

    return new_assignment

@router.get("/exams")
def list_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    exams = db.query(ExamPaper).order_by(ExamPaper.id.desc()).all()
    return [_exam_to_dict(e) for e in exams]

@router.get("/centers")
def list_centers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    centers = db.query(User).filter(User.is_admin == False).all()
    return [{"id": c.id, "username": c.username, "center_name": c.center_name} for c in centers]

@router.get("/audit-logs", response_model=list[AuditLogOut])
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    return db.query(AuditLog).order_by(AuditLog.id.desc()).all()

@router.get("/verify-blockchain")
def verify_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    is_valid = verify_blockchain(db)
    return {"is_valid": is_valid}

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    now            = datetime.utcnow()
    total_exams    = db.query(ExamPaper).count()
    total_centers  = db.query(User).filter(User.is_admin == False).count()
    total_downloads= db.query(AuditLog).filter(AuditLog.action == "DOWNLOAD_EXAM").count()
    total_events   = db.query(AuditLog).count()

    # Upcoming unlocks: locked papers whose unlock_time is in the future
    upcoming = db.query(ExamPaper).filter(
        ExamPaper.unlock_time != None,
        ExamPaper.unlock_time > now
    ).order_by(ExamPaper.unlock_time.asc()).all()

    upcoming_data = [
        {
            "id":          e.id,
            "title":       e.title,
            "unlock_time": e.unlock_time.isoformat() if e.unlock_time else None,
            "exam_date":   e.exam_date,
            "exam_time":   e.exam_time,
        }
        for e in upcoming
    ]

    return {
        "total_exams":       total_exams,
        "total_centers":     total_centers,
        "total_downloads":   total_downloads,
        "total_events":      total_events,
        "upcoming_unlocks":  upcoming_data,
    }
