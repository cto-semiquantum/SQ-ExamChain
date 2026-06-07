from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.exam import ExamPaper, Assignment
from app.services.crypto_service import decrypt_pdf
from app.services.fingerprint_service import add_fingerprint_to_pdf
from app.services.blockchain_service import add_audit_log
from datetime import datetime
import os

router = APIRouter()

def check_center(current_user: User):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Centers only.")

@router.get("/my-exams")
def get_assigned_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_center(current_user)
    assignments = db.query(Assignment).filter(Assignment.center_id == current_user.id).all()
    now = datetime.utcnow()
    exams = []
    for a in assignments:
        exam = a.exam
        is_locked = bool(exam.unlock_time and now < exam.unlock_time)
        seconds_remaining = None
        if is_locked and exam.unlock_time:
            seconds_remaining = int((exam.unlock_time - now).total_seconds())
        exams.append({
            "exam_id":           exam.id,
            "title":             exam.title,
            "assigned_at":       a.assigned_at,
            "unlock_time":       exam.unlock_time.isoformat() if exam.unlock_time else None,
            "exam_date":         exam.exam_date,
            "exam_time":         exam.exam_time,
            "is_locked":         is_locked,
            "seconds_remaining": seconds_remaining,
        })
    return exams

@router.get("/download/{exam_id}")
def download_exam(exam_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_center(current_user)

    # Verify assignment
    assignment = db.query(Assignment).filter(
        Assignment.exam_id == exam_id,
        Assignment.center_id == current_user.id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Exam not assigned to this center")

    exam = assignment.exam

    # ── Time-Lock Gate ────────────────────────────────────────────────────────
    now = datetime.utcnow()
    if exam.unlock_time and now < exam.unlock_time:
        remaining = exam.unlock_time - now
        total_secs = int(remaining.total_seconds())
        hours, rem = divmod(total_secs, 3600)
        mins, secs  = divmod(rem, 60)
        raise HTTPException(
            status_code=403,
            detail={
                "error":           "PAPER_LOCKED",
                "message":         f"This paper is time-locked. Unlocks at {exam.unlock_time.isoformat()} UTC.",
                "unlock_time":     exam.unlock_time.isoformat(),
                "seconds_remaining": total_secs,
                "time_remaining":  f"{hours:02d}:{mins:02d}:{secs:02d}",
            }
        )
    # ─────────────────────────────────────────────────────────────────────────

    if not os.path.exists(exam.file_path):
        raise HTTPException(status_code=404, detail="Encrypted file not found on server")

    # Read & decrypt
    with open(exam.file_path, "rb") as f:
        encrypted_bytes = f.read()
    try:
        decrypted_bytes = decrypt_pdf(encrypted_bytes)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decrypt file")

    # Log download (and first-unlock event if unlock_time was set)
    timestamp_str = now.isoformat()
    log_entry = add_audit_log(
        db, action="DOWNLOAD_EXAM", user_id=current_user.id,
        details=f"Downloaded exam {exam_id} ('{exam.title}')"
    )

    # Log UNLOCK_EVENT only once — when first downloaded after unlock_time
    unlock_logs = db.query(__import__('app.models.audit', fromlist=['AuditLog']).AuditLog).filter(
        __import__('app.models.audit', fromlist=['AuditLog']).AuditLog.action == "UNLOCK_EVENT",
        __import__('app.models.audit', fromlist=['AuditLog']).AuditLog.details.like(f"%exam {exam_id}%")
    ).first()
    if exam.unlock_time and not unlock_logs:
        add_audit_log(
            db, action="UNLOCK_EVENT", user_id=current_user.id,
            details=f"Paper unlocked for exam {exam_id} ('{exam.title}') at {timestamp_str}"
        )

    # Embed invisible fingerprint
    fingerprinted_bytes = add_fingerprint_to_pdf(
        pdf_bytes   = decrypted_bytes,
        center_id   = current_user.id,
        timestamp   = timestamp_str,
        download_id = log_entry.id,
    )

    headers = {
        "Content-Disposition": f"attachment; filename={exam.title.replace(' ', '_')}.pdf"
    }
    return Response(content=fingerprinted_bytes, media_type="application/pdf", headers=headers)
