from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.question import Subject, Question
from app.models.blueprint import Blueprint, BlueprintRule
from app.schemas import BlueprintCreate, BlueprintOut


router = APIRouter()

def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Admins only."
        )


@router.post("/blueprints", response_model=BlueprintOut, status_code=status.HTTP_201_CREATED)
def create_blueprint(
    blueprint_in: BlueprintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)

    # 1. Validation Logic: Check if enough questions exist in the Question Bank
    # We will accumulate errors to give a comprehensive message
    validation_errors = []
    
    # Store subjects fetched to print friendly names in error messages
    subjects_cache = {}

    for rule in blueprint_in.rules:
        # Standardize difficulty string comparison
        diff = rule.difficulty.strip().capitalize()
        if diff not in ["Easy", "Medium", "Hard"]:
            validation_errors.append(f"Invalid difficulty '{rule.difficulty}'. Must be Easy, Medium, or Hard.")
            continue
            
        # Get subject name
        if rule.subject_id not in subjects_cache:
            sub = db.query(Subject).filter(Subject.id == rule.subject_id).first()
            if not sub:
                validation_errors.append(f"Subject ID {rule.subject_id} not found.")
                continue
            subjects_cache[rule.subject_id] = sub.name

        subject_name = subjects_cache[rule.subject_id]

        # Query available questions count
        available_count = db.query(Question).filter(
            Question.subject_id == rule.subject_id,
            Question.difficulty == diff
        ).count()

        if available_count < rule.question_count:
            validation_errors.append(
                f"{subject_name} {diff} Required: {rule.question_count}, Available: {available_count}."
            )

    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not Enough Questions: " + " | ".join(validation_errors)
        )

    # 2. Database transaction: Save Blueprint and Rules
    new_blueprint = Blueprint(
        name=blueprint_in.name.strip(),
        total_marks=blueprint_in.total_marks
    )
    db.add(new_blueprint)
    db.commit()
    db.refresh(new_blueprint)

    for rule in blueprint_in.rules:
        diff = rule.difficulty.strip().capitalize()
        new_rule = BlueprintRule(
            blueprint_id=new_blueprint.id,
            subject_id=rule.subject_id,
            difficulty=diff,
            question_count=rule.question_count,
            marks=rule.marks
        )
        db.add(new_rule)

    db.commit()
    db.refresh(new_blueprint)
    return new_blueprint


@router.get("/blueprints", response_model=List[BlueprintOut])
def get_blueprints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    return db.query(Blueprint).order_by(Blueprint.created_at.desc()).all()


@router.delete("/blueprints/{id}")
def delete_blueprint(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)
    blueprint = db.query(Blueprint).filter(Blueprint.id == id).first()
    if not blueprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blueprint not found."
        )
    db.delete(blueprint)
    db.commit()
    return {"message": "Blueprint deleted successfully."}
