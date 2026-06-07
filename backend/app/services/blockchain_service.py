import hashlib
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def calculate_hash(action: str, user_id: int, details: str, timestamp: str, previous_hash: str) -> str:
    """Calculates SHA-256 hash of the log entry."""
    record_string = f"{action}{user_id}{details}{timestamp}{previous_hash}"
    return hashlib.sha256(record_string.encode('utf-8')).hexdigest()

def add_audit_log(db: Session, action: str, user_id: int, details: str) -> AuditLog:
    """Appends a new record to the blockchain audit log."""
    
    # Get the last block to find the previous_hash
    last_log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    previous_hash = last_log.current_hash if last_log else "GENESIS"
    
    new_log = AuditLog(
        action=action,
        user_id=user_id,
        details=details,
        previous_hash=previous_hash
    )
    
    # We must commit first to get the timestamp, or we can set timestamp manually before commit
    # To keep it deterministic, let's set the hash after we define the object fully
    import datetime
    now = datetime.datetime.utcnow()
    new_log.timestamp = now
    
    current_hash = calculate_hash(action, user_id, details, now.isoformat(), previous_hash)
    new_log.current_hash = current_hash
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log

def verify_blockchain(db: Session) -> bool:
    """Verifies the integrity of the audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    
    for i in range(1, len(logs)):
        current_log = logs[i]
        prev_log = logs[i-1]
        
        # 1. Check if previous_hash matches the actual previous log's current_hash
        if current_log.previous_hash != prev_log.current_hash:
            return False
            
        # 2. Re-calculate the current log's hash and ensure it hasn't been tampered with
        recalculated_hash = calculate_hash(
            current_log.action,
            current_log.user_id,
            current_log.details,
            current_log.timestamp.isoformat(),
            current_log.previous_hash
        )
        if current_log.current_hash != recalculated_hash:
            return False
            
    return True
