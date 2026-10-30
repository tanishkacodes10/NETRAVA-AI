from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import uuid
import time
import json
import os
import sqlite3

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
DATA = os.path.join(ROOT, "datasets")
FRONT = os.path.join(ROOT, "app", "frontend")

DB_PATH = os.path.join(BASE, "exam_shield.db")

app = Flask(
    __name__,
    static_folder=FRONT,
    static_url_path=""
)

# ---------- SQLite Database ----------

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS exam_session_data (
                session_id TEXT PRIMARY KEY,
                session_data TEXT NOT NULL,
                started_at REAL
            )
        """)


def save_log(sid):
    session = SESSIONS[sid]

    with get_connection() as conn:
        conn.execute("""
            INSERT INTO exam_session_data
                (session_id, session_data, started_at)
            VALUES (?, ?, ?)
            ON CONFLICT(session_id)
            DO UPDATE SET
                session_data = excluded.session_data,
                started_at = excluded.started_at
        """, (
            sid,
            json.dumps(session, default=str),
            session.get("started_at", time.time())
        ))


def load_sessions():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT session_id, session_data FROM exam_session_data"
        ).fetchall()

    for row in rows:
        SESSIONS[row["session_id"]] = json.loads(
            row["session_data"]
        )


# ---------- Questions Load ----------

arc = pd.read_csv(
    os.path.join(DATA, "mcq_questions.csv")
)
arc["category"] = "science_basic"

mmlu = pd.read_csv(
    os.path.join(DATA, "mmlu_cs_questions.csv")
)

QUESTIONS = pd.concat(
    [arc, mmlu],
    ignore_index=True
).fillna("")

QUESTIONS["id"] = range(1, len(QUESTIONS) + 1)

VIOLATIONS = {
    "TAB_SWITCH",
    "FULLSCREEN_EXIT",
    "WINDOW_BLUR",
    "NO_FACE",
    "MULTIPLE_FACES",
    "CAMERA_OFF"
}

MAX_WARNINGS = 3
EXAM_QUESTIONS = 10
EXAM_SECONDS = 600

SESSIONS = {}

# Database initialize karo aur saved sessions load karo.
init_db()
load_sessions()


# ---------- Pages ----------

@app.route("/")
def home():
    return send_from_directory(FRONT, "index.html")


# ---------- APIs ----------

@app.route("/api/categories")
def categories():
    return jsonify(
        sorted(QUESTIONS["category"].unique().tolist())
    )


@app.route("/api/start", methods=["POST"])
def start():
    d = request.get_json(silent=True) or {}
    cat = d.get("category")

    pool = QUESTIONS[QUESTIONS["category"] == cat]

    if pool.empty:
        return jsonify({"error": "Invalid category"}), 400

    chosen = pool.sample(n=min(EXAM_QUESTIONS, len(pool)))

    sid = str(uuid.uuid4())[:8]

    SESSIONS[sid] = {
        "session_id": sid,
        "name": d.get("name", "Student"),
        "category": cat,
        "started_at": time.time(),
        "answers_key": {
            int(r.id): int(r.answer)
            for r in chosen.itertuples()
        },
        "events": [],
        "warnings": 0,
        "submitted": False
    }

    qs = [
        {
            "id": int(r.id),
            "question": r.question,
            "options": [
                r.option_A,
                r.option_B,
                r.option_C,
                r.option_D
            ]
        }
        for r in chosen.itertuples()
    ]

    save_log(sid)

    return jsonify({
        "session_id": sid,
        "duration_sec": EXAM_SECONDS,
        "questions": qs
    })


@app.route("/api/event", methods=["POST"])
def event():
    d = request.get_json(silent=True) or {}

    s = SESSIONS.get(d.get("session_id"))

    if not s or s["submitted"]:
        return jsonify({"error": "Invalid session"}), 400

    etype = d.get("type")

    s["events"].append({
        "type": etype,
        "timestamp": d.get("timestamp", time.time())
    })

    if etype in VIOLATIONS:
        s["warnings"] += 1

    save_log(s["session_id"])

    return jsonify({
        "warnings": s["warnings"],
        "auto_submit": s["warnings"] >= MAX_WARNINGS
    })


@app.route("/api/submit", methods=["POST"])
def submit():
    d = request.get_json(silent=True) or {}

    s = SESSIONS.get(d.get("session_id"))

    if not s or s["submitted"]:
        return jsonify({"error": "Invalid session"}), 400

    answers = d.get("answers", {})

    score = sum(
        1
        for qid, correct in s["answers_key"].items()
        if str(answers.get(str(qid), "")) == str(correct)
    )

    s["submitted"] = True
    s["score"] = score
    s["total"] = len(s["answers_key"])

    save_log(s["session_id"])

    return jsonify({
        "score": score,
        "total": s["total"],
        "warnings": s["warnings"]
    })


@app.route("/api/logs/<sid>")
def logs(sid):
    s = SESSIONS.get(sid)

    if not s:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "name": s["name"],
        "warnings": s["warnings"],
        "events": s["events"],
        "score": s.get("score")
    })


@app.route("/api/admin/sessions")
def admin_sessions():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT session_data
            FROM exam_session_data
        """).fetchall()

    out = []

    for row in rows:
        s = json.loads(row["session_data"])

        out.append({
            "session_id": s.get("session_id"),
            "name": s.get("name"),
            "category": s.get("category"),
            "started_at": s.get("started_at"),
            "warnings": s.get("warnings", 0),
            "score": s.get("score"),
            "total": s.get("total"),
            "submitted": s.get("submitted", False),
            "events": s.get("events", [])
        })

    out.sort(
        key=lambda x: x["started_at"] or 0,
        reverse=True
    )

    return jsonify(out)


if __name__ == "__main__":
    app.run(debug=True, port=5000)