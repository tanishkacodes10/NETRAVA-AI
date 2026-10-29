import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

BASE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE, ".env"))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
DATA = os.path.join(ROOT, "datasets")

arc = pd.read_csv(os.path.join(DATA, "mcq_questions.csv"))
arc["category"] = "science_basic"
mmlu = pd.read_csv(os.path.join(DATA, "mmlu_cs_questions.csv"))
df = pd.concat([arc, mmlu], ignore_index=True).fillna("")

docs = []
for i, r in enumerate(df.itertuples(), start=1):
    docs.append({
        "qid": i,
        "category": r.category,
        "question": r.question,
        "options": [r.option_A, r.option_B, r.option_C, r.option_D],
        "answer": int(r.answer),
    })

client = MongoClient(os.getenv("MONGO_URI"))
db = client["examshield"]
db.questions.drop()
db.questions.insert_many(docs)

print("Inserted:", db.questions.count_documents({}))
for c in db.questions.distinct("category"):
    print(c, "->", db.questions.count_documents({"category": c}))