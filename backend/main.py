from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user, exam, audit, question, blueprint # important for Base.metadata.create_all to find the models
from app.api import auth, admin, center, investigate, questions, blueprints
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SQ ExamChain API", version="1.0.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(center.router, prefix="/center", tags=["Center"])
app.include_router(investigate.router, prefix="/investigate", tags=["Investigate"])
app.include_router(questions.router, tags=["Question Bank"])
app.include_router(blueprints.router, tags=["Blueprint Engine"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SQ ExamChain API"}
