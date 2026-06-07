from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.fingerprint_service import extract_fingerprint_from_pdf
from app.services.blockchain_service import add_audit_log

router = APIRouter()

def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized. Admins only.")

@router.post("/check-leak")
async def check_leak(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_admin(current_user)
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes = await file.read()
    fingerprint = extract_fingerprint_from_pdf(file_bytes)
    
    add_audit_log(db, action="INVESTIGATE_LEAK", user_id=current_user.id, details=f"Investigated leaked file: {file.filename}")
    
    if not fingerprint:
        return {"status": "error", "message": "No fingerprint found. The file might have been stripped of metadata or is not from this system."}
        
    center_id = fingerprint.get("center_id")
    if center_id:
        center = db.query(User).filter(User.id == center_id).first()
        center_info = {"id": center.id, "username": center.username, "center_name": center.center_name} if center else "Unknown Center"
        
        return {
            "status": "success",
            "message": "Fingerprint detected!",
            "fingerprint": fingerprint,
            "source_center": center_info
        }
        
    return {"status": "error", "message": "Incomplete fingerprint found."}
