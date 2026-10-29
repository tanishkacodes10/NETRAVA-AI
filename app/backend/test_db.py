import os
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=15000
)

try:
    print(client.admin.command("ping"))
    print("MongoDB connected successfully!")
except Exception as e:
    print("Connection error:", e)
finally:
    client.close()