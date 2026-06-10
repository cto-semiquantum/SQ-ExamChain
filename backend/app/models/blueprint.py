from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Blueprint(Base):
    __tablename__ = "blueprints"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, index=True, nullable=False)
    total_marks = Column(Integer, default=0, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    rules = relationship("BlueprintRule", back_populates="blueprint", cascade="all, delete-orphan")


class BlueprintRule(Base):
    __tablename__ = "blueprint_rules"

    id             = Column(Integer, primary_key=True, index=True)
    blueprint_id   = Column(Integer, ForeignKey("blueprints.id"), nullable=False)
    subject_id     = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    difficulty     = Column(String, nullable=False)   # Easy | Medium | Hard
    question_count = Column(Integer, nullable=False)
    marks          = Column(Integer, nullable=False)

    blueprint = relationship("Blueprint", back_populates="rules")
    subject   = relationship("Subject")
