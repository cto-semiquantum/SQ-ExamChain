import sys
import os

# Add backend directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine
from app.models.question import Subject, Question

def seed_questions():
    db = SessionLocal()
    
    # 1. Create or get Physics subject
    physics = db.query(Subject).filter(Subject.name == "Physics").first()
    if not physics:
        physics = Subject(name="Physics")
        db.add(physics)
        db.commit()
        db.refresh(physics)
        print("Created Physics subject")
        
    # 2. Create or get Chemistry subject
    chemistry = db.query(Subject).filter(Subject.name == "Chemistry").first()
    if not chemistry:
        chemistry = Subject(name="Chemistry")
        db.add(chemistry)
        db.commit()
        db.refresh(chemistry)
        print("Created Chemistry subject")
        
    # Clear existing questions for Physics and Chemistry to prevent accumulation
    db.query(Question).filter(Question.subject_id.in_([physics.id, chemistry.id])).delete(synchronize_session=False)
    db.commit()
    print("Cleared existing Physics and Chemistry questions to seed fresh 60+60")
    
    # Seed Physics
    # 20 Easy
    for i in range(1, 21):
        q = Question(
            subject_id=physics.id,
            question_text=f"What is Newton's Law of Motion - Case {i}?",
            topic="Mechanics",
            difficulty="Easy",
            marks=2
        )
        db.add(q)
    # 20 Medium
    for i in range(1, 21):
        q = Question(
            subject_id=physics.id,
            question_text=f"Calculate the electric field intensity in setup {i}.",
            topic="Electromagnetism",
            difficulty="Medium",
            marks=3
        )
        db.add(q)
    # 20 Hard
    for i in range(1, 21):
        q = Question(
            subject_id=physics.id,
            question_text=f"Derive Schrodinger's equation for potential barrier {i}.",
            topic="Quantum Mechanics",
            difficulty="Hard",
            marks=5
        )
        db.add(q)

    # Seed Chemistry
    # 20 Easy
    for i in range(1, 21):
        q = Question(
            subject_id=chemistry.id,
            question_text=f"Identify the IUPAC name for compound {i}.",
            topic="Organic Chemistry",
            difficulty="Easy",
            marks=2
        )
        db.add(q)
    # 20 Medium
    for i in range(1, 21):
        q = Question(
            subject_id=chemistry.id,
            question_text=f"Determine the rate constant for first-order reaction {i}.",
            topic="Physical Chemistry",
            difficulty="Medium",
            marks=3
        )
        db.add(q)
    # 20 Hard
    for i in range(1, 21):
        q = Question(
            subject_id=chemistry.id,
            question_text=f"Explain the molecular orbital diagram for complex {i}.",
            topic="Inorganic Chemistry",
            difficulty="Hard",
            marks=5
        )
        db.add(q)
        
    db.commit()
    print("Seeded 60 Physics questions (20 Easy, 20 Medium, 20 Hard)")
    print("Seeded 60 Chemistry questions (20 Easy, 20 Medium, 20 Hard)")
    db.close()

if __name__ == "__main__":
    seed_questions()
