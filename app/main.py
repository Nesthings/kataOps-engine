import os
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import List, Dict
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

# Imports katas and database
from app.katas.core import get_total, nth_char 
from app.database import get_db, DictionaryEntry, init_db

app = FastAPI(
    title="KataOps Engine API",
    description="Evaluates Python Katas with Cloud Persistence",
    version="1.0.0"
)

# Initializes database when startup
@app.on_event("startup")
def on_startup():
    init_db()

# --- MODELS ---
class EntryModel(BaseModel):
    word: str
    definition: str

class CostCalculationModel(BaseModel):
    costs: Dict[str, float]
    items: List[str]
    tax: float

class WordsModel(BaseModel):
    words: List[str]

# - 1. FRONTEND CONFIG -
BASE_DIR = "/code"
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

# - 2. API ENDPOINTS -

@app.get("/api/health")
def health_check():
    return {"status" : "ok", "message" : "KataOps Engine API is running"}

#  KATA 1: DICTIONARY WITH RDS FUNCTIONALITY ---

@app.post("/api/v1/dictionary/add")
def add_entry(entry: EntryModel, request: Request, db: Session = Depends(get_db)):
    # Extract the device type from the HTTP headers
    user_agent = request.headers.get("user-agent", "Unknown Device")
    
    # Verify if the wordalready exists
    existing = db.query(DictionaryEntry).filter(DictionaryEntry.word == entry.word).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"The word '{entry.word}' is already in the database.")
        
    # Save it in Postgresql
    new_entry = DictionaryEntry(
        word=entry.word, 
        definition=entry.definition,
        user_agent=user_agent
    )
    db.add(new_entry)
    db.commit()
    return {"message": f"Entry '{entry.word}' safely stored in Cloud DB."}

@app.get("/api/v1/dictionary/look/{word}")
def look_entry(word: str, db: Session = Depends(get_db)):
    db_entry = db.query(DictionaryEntry).filter(DictionaryEntry.word == word).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Word not found in database.")
    
    return {
        "word": db_entry.word, 
        "definition": db_entry.definition,
        "metadata": {
            "device": db_entry.user_agent,
            "timestamp": db_entry.created_at
        }
    }

@app.get("/api/v1/dictionary/all")
def get_all_entries(db: Session = Depends(get_db)):
    entries = db.query(DictionaryEntry).all()
    # Data formated for frontend to present them nice
    result = {
        e.word: {
            "definition": e.definition, 
            "device": e.user_agent, 
            "added_at": str(e.created_at)
        } for e in entries
    }
    return {"dictionary": result}

# KATA 2: TAX CALCULATOR

@app.post("/api/v1/costs/calculate")
def calculate_total(data: CostCalculationModel):
    total = get_total(data.costs, data.items, data.tax)
    return {"total_cost": total}

@app.post("/api/v1/strings/concat")
def concatenate_nth_char(data: WordsModel):
    try:
        result = nth_char(data.words)
        return {"result": result}
    except IndexError:
        raise HTTPException(status_code=400, detail="A word is too short.")

# KATA 3: WORDS CONCAT-
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if not full_path.startswith("api"):
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not found")