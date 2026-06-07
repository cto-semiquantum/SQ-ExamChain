import sys
import os

# Add backend directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        new_admin = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
            center_name="Central Admin HQ"
        )
        db.add(new_admin)
        print("Created admin user (admin / admin123)")
        
    # Check if test center exists
    center = db.query(User).filter(User.username == "center1").first()
    if not center:
        new_center = User(
            username="center1",
            hashed_password=get_password_hash("center123"),
            is_admin=False,
            center_name="Test Exam Center A"
        )
        db.add(new_center)
        print("Created center user (center1 / center123)")
        
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_db()
