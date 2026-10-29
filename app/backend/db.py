import os
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

# Project ka main folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# .env file load karo
load_dotenv(os.path.join(BASE_DIR, ".env"))


MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise ValueError("MongoDB URI .env file mein nahi mili!")

# MongoDB connection
client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=15000
)

# Database aur collection
db = client["ExamShieldAI"]
sessions_collection = db["exam_sessions"]

def test_connection():
    try:
        client.admin.command("ping")
        print("MongoDB connected successfully!")
        return True
    except Exception as e:
        print("MongoDB connection failed:", e)
        return False

if __name__ == "__main__":
    test_connection()