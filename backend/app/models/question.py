from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id   = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    questions = relationship("Question", back_populates="subject", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id            = Column(Integer, primary_key=True, index=True)
    subject_id    = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    topic         = Column(String, nullable=False)
    difficulty    = Column(String, nullable=False)   # Easy | Medium | Hard
    marks         = Column(Integer, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="questions")
