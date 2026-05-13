# app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

# Imports katas
from app.katas.core import  Dictionary, get_total, nth_char 

app = FastAPI(
    title="KataOps Engine API",
    description="Evaluates Python Katas in a cloud native enviroment",
    version="1.0.0"
)

# Global instance to keep the dict state in memory temporary
kata_dictionary = Dictionary()

# Data models with Pydantic

class EntryModel(BaseModel):
    word: str
    definition: str

class CostCalculationModel(BaseModel):
    costs: Dict[str, float]
    items: List[str]
    tax: float

class WordsModel(BaseModel):
    words: List[str]

# Endpoints

@app.get("/")
def health_check():
    return {"status" : "ok", "message" : "KataOps Engine API is running"}

# Endpoint 1: Dictionary

@app.post("/api/v1/dictionary/add")
def add_entry(entry: EntryModel):
    kata_dictionary.newentry(entry.word, entry.definition)
    return {"message": f"Entry '{entry.word}' added successfully."}

app.get("/api/v1/dictionary/look/{word}")
def look_entry(word: str):
    return {"word": word, "definition": kata_dictionary.look(word)}

# Endpoint 2: Costs Calculator

@app.post("/api/v1/costs/calculate")
def calculate_total(data: CostCalculationModel):
    total = get_total(data.costs, data.items, data.tax)
    return {"total_cost": total}

# Endpoint 3: Char concatenator

@app.post("/api/v1/strings/concat")
def concatenate_nth_char(data: WordsModel):
    try:
        result = nth_char(data.words)
        return {"result": result}
    except IndexError:
        # Error handling if a word is shorter that it's posittion
        raise HTTPException(status_code=400, detail="A word does not have enough letters for its posittion.u")
