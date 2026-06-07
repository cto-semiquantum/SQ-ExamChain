from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ExamPaper(Base):
    __tablename__ = "exam_papers"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, index=True)
    file_path   = Column(String)                       # Path to the encrypted file
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    exam_date   = Column(String, nullable=True)        # e.g. "2026-06-15"
    exam_time   = Column(String, nullable=True)        # e.g. "10:00"
    unlock_time = Column(DateTime, nullable=True)      # UTC datetime when paper becomes downloadable

    assignments = relationship("Assignment", back_populates="exam")

class Assignment(Base):
    __tablename__ = "assignments"

    id          = Column(Integer, primary_key=True, index=True)
    exam_id     = Column(Integer, ForeignKey("exam_papers.id"))
    center_id   = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)

    exam   = relationship("ExamPaper", back_populates="assignments")
    center = relationship("User")
