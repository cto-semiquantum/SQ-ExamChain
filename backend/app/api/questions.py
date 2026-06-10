import csv
from io import StringIO
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.question import Subject, Question
from app.schemas import SubjectCreate, SubjectOut, QuestionCreate, QuestionOut


router = APIRouter()

def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admins only."
        )


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # Check if subject name already exists (case-insensitive checks can be done, but let's do a simple filter first)
    existing = db.query(Subject).filter(Subject.name.ilike(subject_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject already exists."
        )
    
    new_subject = Subject(name=subject_in.name.strip())
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject


@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    return db.query(Subject).order_by(Subject.name.asc()).all()


@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    question_in: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == question_in.subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found."
        )
    
    # Validate difficulty
    difficulty = question_in.difficulty.strip().capitalize()
    if difficulty not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Difficulty must be one of: Easy, Medium, Hard."
        )
        
    new_question = Question(
        subject_id=question_in.subject_id,
        question_text=question_in.question_text.strip(),
        topic=question_in.topic.strip(),
        difficulty=difficulty,
        marks=question_in.marks
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question


@router.get("/questions", response_model=List[QuestionOut])
def get_questions(
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    query = db.query(Question)
    if subject_id is not None:
        query = query.filter(Question.subject_id == subject_id)
    return query.order_by(Question.created_at.desc()).all()


@router.delete("/questions/{id}")
def delete_question(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    question = db.query(Question).filter(Question.id == id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found."
        )
    db.delete(question)
    db.commit()
    return {"message": "Question deleted successfully."}


@router.post("/questions/upload-csv")
async def upload_questions_csv(
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found."
        )
        
    contents = await file.read()
    decoded = contents.decode("utf-8")
    
    # Parse CSV content
    csv_reader = csv.DictReader(StringIO(decoded))
    
    questions_added = 0
    errors = []
    
    for idx, row in enumerate(csv_reader, start=1):
        # Clean keys (trim spaces, lower case for checking)
        keys = {k.strip().lower(): k for k in row.keys() if k}
        
        q_key = keys.get("question")
        t_key = keys.get("topic")
        d_key = keys.get("difficulty")
        m_key = keys.get("marks")
        
        if not q_key or not t_key or not d_key or not m_key:
            errors.append(f"Row {idx}: Missing required headers (Question, Topic, Difficulty, Marks).")
            continue
            
        question_text = (row[q_key] or "").strip()
        topic = (row[t_key] or "").strip()
        difficulty_raw = (row[d_key] or "").strip().capitalize()
        marks_raw = (row[m_key] or "").strip()
        
        if not question_text or not topic:
            errors.append(f"Row {idx}: Empty Question Text or Topic.")
            continue
            
        if difficulty_raw not in ["Easy", "Medium", "Hard"]:
            # Fallback or error
            difficulty_raw = "Easy"
            
        try:
            marks = int(marks_raw)
        except ValueError:
            errors.append(f"Row {idx}: Invalid integer for Marks '{marks_raw}'. Defaulting to 1.")
            marks = 1
            
        new_q = Question(
            subject_id=subject_id,
            question_text=question_text,
            topic=topic,
            difficulty=difficulty_raw,
            marks=marks
        )
        db.add(new_q)
        questions_added += 1
        
    db.commit()
    
    return {
        "message": f"Successfully imported {questions_added} questions.",
        "count": questions_added,
        "errors": errors
    }
