from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False
    center_name: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_admin: bool
    center_name: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ExamCreate(BaseModel):
    title: str

class ExamOut(BaseModel):
    id: int
    title: str
    uploaded_at: datetime
    exam_date: Optional[str] = None
    exam_time: Optional[str] = None
    unlock_time: Optional[datetime] = None
    is_locked: Optional[bool] = None       # computed field added by endpoint

    class Config:
        from_attributes = True

class AssignmentOut(BaseModel):
    id: int
    exam: ExamOut
    assigned_at: datetime

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    action: str
    user_id: int
    details: str
    timestamp: datetime
    previous_hash: str
    current_hash: str

    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    name: str


class SubjectOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    subject_id: int
    question_text: str
    topic: str
    difficulty: str
    marks: int


class QuestionOut(BaseModel):
    id: int
    subject_id: int
    question_text: str
    topic: str
    difficulty: str
    marks: int
    created_at: datetime
    subject: SubjectOut

    class Config:
        from_attributes = True


class BlueprintRuleCreate(BaseModel):
    subject_id: int
    difficulty: str
    question_count: int
    marks: int


class BlueprintRuleOut(BaseModel):
    id: int
    blueprint_id: int
    subject_id: int
    difficulty: str
    question_count: int
    marks: int
    subject: SubjectOut

    class Config:
        from_attributes = True


class BlueprintCreate(BaseModel):
    name: str
    total_marks: int
    rules: List[BlueprintRuleCreate]


class BlueprintOut(BaseModel):
    id: int
    name: str
    total_marks: int
    created_at: datetime
    rules: List[BlueprintRuleOut]

    class Config:
        from_attributes = True
