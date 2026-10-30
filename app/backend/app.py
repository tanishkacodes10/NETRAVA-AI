import os
import time
import json
import uuid

import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from psycopg.types.json import Json

from db import get_connection


# ---------- Paths and Configuration ----------

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))

DATA = os.path.join(ROOT, "datasets")

# Teammate's React frontend location.
# Flask serves the built frontend from this directory if it exists.
FRONT = os.path.join(ROOT, "app", "frontend-react", "dist")

app = Flask(
    __name__,
    static_folder=FRONT if os.path.isdir(FRONT) else None,
    static_url_path=""
)


# ---------- Exam Configuration ----------

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


# ---------- PostgreSQL Database ----------

def init_db():
    """Initialize the exam session table in PostgreSQL."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS exam_session_data (
                session_id TEXT PRIMARY KEY,
                session_data JSONB NOT NULL,
                started_at DOUBLE PRECISION
            )
        """)

    print("PostgreSQL exam session table initialized successfully!")


def save_log(sid):
    """Save or update an exam session in PostgreSQL."""
    session = SESSIONS.get(sid)

    if session is None:
        raise ValueError(f"Session not found: {sid}")

    with get_connection() as conn:
        conn.execute("""
            INSERT INTO exam_session_data
                (session_id, session_data, started_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (session_id)
            DO UPDATE SET
                session_data = EXCLUDED.session_data,
                started_at = EXCLUDED.started_at
        """, (
            sid,
            Json(session),
            session.get("started_at", time.time())
        ))


def load_sessions():
    """Restore previously saved sessions from PostgreSQL."""
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT session_id, session_data
            FROM exam_session_data
        """).fetchall()

    for row in rows:
        session_data = row["session_data"]

        if isinstance(session_data, str):
            session_data = json.loads(session_data)

        SESSIONS[row["session_id"]] = session_data

    print(f"Restored {len(SESSIONS)} exam session(s).")


# ---------- Questions ----------

def load_questions():
    """Load and validate question datasets."""
    mcq_path = os.path.join(DATA, "mcq_questions.csv")
    mmlu_path = os.path.join(DATA, "mmlu_cs_questions.csv")

    if not os.path.isfile(mcq_path):
        raise FileNotFoundError(
            f"Question dataset not found: {mcq_path}"
        )

    if not os.path.isfile(mmlu_path):
        raise FileNotFoundError(
            f"Question dataset not found: {mmlu_path}"
        )

    arc = pd.read_csv(mcq_path)
    arc["category"] = "science_basic"

    mmlu = pd.read_csv(mmlu_path)

    questions = pd.concat(
        [arc, mmlu],
        ignore_index=True
    ).fillna("")

    required_columns = {
        "category",
        "question",
        "option_A",
        "option_B",
        "option_C",
        "option_D",
        "answer"
    }

    missing = required_columns.difference(questions.columns)

    if missing:
        raise ValueError(
            "Question datasets are missing required columns: "
            + ", ".join(sorted(missing))
        )

    questions["id"] = range(1, len(questions) + 1)

    return questions


QUESTIONS = load_questions()


# ---------- Initialize Database ----------

init_db()
load_sessions()


# ---------- Frontend ----------

@app.route("/")
def home():
    """Serve the built React frontend when available."""
    index_path = os.path.join(FRONT, "index.html")

    if not os.path.isfile(index_path):
        return jsonify({
            "error": "Frontend index.html was not found.",
            "expected_path": index_path,
            "hint": (
                "Run the React development server from "
                "app/frontend-react, or build the frontend "
                "before serving it through Flask."
            )
        }), 404

    return send_from_directory(FRONT, "index.html")


# ---------- API: Categories ----------

@app.route("/api/categories", methods=["GET"])
def categories():
    return jsonify(
        sorted(QUESTIONS["category"].unique().tolist())
    )


# ---------- API: Start Exam ----------

@app.route("/api/start", methods=["POST"])
def start():
    data = request.get_json(silent=True) or {}

    category = data.get("category")

    if not category:
        return jsonify({
            "error": "Category is required"
        }), 400

    pool = QUESTIONS[QUESTIONS["category"] == category]

    if pool.empty:
        return jsonify({
            "error": "Invalid category"
        }), 400

    chosen = pool.sample(
        n=min(EXAM_QUESTIONS, len(pool))
    )

    session_id = str(uuid.uuid4())[:8]

    answers_key = {}

    for row in chosen.itertuples(index=False):
        try:
            question_id = int(row.id)
            correct_answer = int(row.answer)
        except (TypeError, ValueError, OverflowError):
            return jsonify({
                "error": (
                    "A selected question has an invalid "
                    "ID or answer"
                )
            }), 500

        answers_key[question_id] = correct_answer

    session = {
        "session_id": session_id,
        "name": str(data.get("name") or "Student"),
        "category": category,
        "started_at": time.time(),
        "answers_key": answers_key,
        "events": [],
        "warnings": 0,
        "submitted": False
    }

    SESSIONS[session_id] = session

    questions_for_exam = []

    for row in chosen.itertuples(index=False):
        questions_for_exam.append({
            "id": int(row.id),
            "question": str(row.question),
            "options": [
                str(row.option_A),
                str(row.option_B),
                str(row.option_C),
                str(row.option_D)
            ]
        })

    try:
        save_log(session_id)

    except Exception:
        SESSIONS.pop(session_id, None)

        app.logger.exception(
            "Failed to save a new exam session"
        )

        return jsonify({
            "error": (
                "Could not save exam session "
                "to PostgreSQL"
            )
        }), 500

    return jsonify({
        "session_id": session_id,
        "duration_sec": EXAM_SECONDS,
        "questions": questions_for_exam
    })


# ---------- API: Exam Monitoring Events ----------

@app.route("/api/event", methods=["POST"])
def event():
    data = request.get_json(silent=True) or {}

    session_id = data.get("session_id")
    session = SESSIONS.get(session_id)

    if not session or session.get("submitted"):
        return jsonify({
            "error": "Invalid session"
        }), 400

    event_type = data.get("type")

    if (
        not isinstance(event_type, str)
        or not event_type.strip()
    ):
        return jsonify({
            "error": "Event type is required"
        }), 400

    session["events"].append({
        "type": event_type,
        "timestamp": data.get(
            "timestamp",
            time.time()
        )
    })
# Ignore duplicate events and startup-related browser noise.
# Only count explicit monitoring violations.
if event_type in VIOLATIONS:
    now = time.time()
    last_event = session.get("last_violation_event")

    # Prevent the same violation from being counted repeatedly
    # within a short interval.
    if (
        not last_event
        or last_event.get("type") != event_type
        or now - last_event.get("timestamp", 0) > 3
    ):
        session["warnings"] = session.get("warnings", 0) + 1
        session["last_violation_event"] = {
            "type": event_type,
            "timestamp": now
        }

    try:
        save_log(session_id)

    except Exception:
        app.logger.exception(
            "Failed to save exam event"
        )

        return jsonify({
            "error": "Could not save event to PostgreSQL"
        }), 500

    return jsonify({
        "warnings": session["warnings"],
        "auto_submit": (
            session["warnings"] >= MAX_WARNINGS
        )
    })


# ---------- API: Submit Exam ----------

@app.route("/api/submit", methods=["POST"])
def submit():
    data = request.get_json(silent=True) or {}

    session_id = data.get("session_id")
    session = SESSIONS.get(session_id)

    if not session or session.get("submitted"):
        return jsonify({
            "error": "Invalid session"
        }), 400

    answers = data.get("answers", {})

    if not isinstance(answers, dict):
        return jsonify({
            "error": "Answers must be an object"
        }), 400

    score = sum(
        1
        for question_id, correct in
        session["answers_key"].items()
        if str(
            answers.get(str(question_id), "")
        ) == str(correct)
    )

    session["submitted"] = True
    session["score"] = score
    session["total"] = len(session["answers_key"])

    try:
        save_log(session_id)

    except Exception:
        # Restore the in-memory state if saving fails.
        session["submitted"] = False
        session.pop("score", None)
        session.pop("total", None)

        app.logger.exception(
            "Failed to save exam submission"
        )

        return jsonify({
            "error": (
                "Could not save submission "
                "to PostgreSQL"
            )
        }), 500

    return jsonify({
        "score": score,
        "total": session["total"],
        "warnings": session["warnings"]
    })


# ---------- API: Exam Logs ----------

@app.route("/api/logs/<sid>", methods=["GET"])
def logs(sid):
    session = SESSIONS.get(sid)

    if not session:
        return jsonify({
            "error": "Not found"
        }), 404

    return jsonify({
        "name": session.get("name"),
        "warnings": session.get("warnings", 0),
        "events": session.get("events", []),
        "score": session.get("score")
    })


# ---------- API: Admin Sessions ----------

@app.route("/api/admin/sessions", methods=["GET"])
def admin_sessions():
    try:
        with get_connection() as conn:
            rows = conn.execute("""
                SELECT session_data
                FROM exam_session_data
            """).fetchall()

        output = []

        for row in rows:
            session = row["session_data"]

            if isinstance(session, str):
                session = json.loads(session)

            output.append({
                "session_id": session.get("session_id"),
                "name": session.get("name"),
                "category": session.get("category"),
                "started_at": session.get("started_at"),
                "warnings": session.get("warnings", 0),
                "score": session.get("score"),
                "total": session.get("total"),
                "submitted": session.get(
                    "submitted",
                    False
                ),
                "events": session.get("events", [])
            })

        output.sort(
            key=lambda item: item["started_at"] or 0,
            reverse=True
        )

        return jsonify(output)

    except Exception:
        app.logger.exception(
            "Failed to retrieve admin sessions"
        )

        return jsonify({
            "error": "Could not retrieve admin sessions"
        }), 500


# ---------- Run Server ----------

if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )