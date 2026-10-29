from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import uuid, time, json, os

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
DATA = os.path.join(ROOT, "datasets")
LOGS = os.path.join(ROOT, "logs")
FRONT = os.path.join(ROOT, "app", "frontend")
os.makedirs(LOGS, exist_ok=True)

app = Flask(__name__, static_folder=FRONT, static_url_path="")

# ---------- Questions load ----------
arc = pd.read_csv(os.path.join(DATA, "mcq_questions.csv"))
arc["category"] = "science_basic"
mmlu = pd.read_csv(os.path.join(DATA, "mmlu_cs_questions.csv"))
QUESTIONS = pd.concat([arc, mmlu], ignore_index=True).fillna("")
QUESTIONS["id"] = range(1, len(QUESTIONS) + 1)   # unique ids

VIOLATIONS = {"TAB_SWITCH", "FULLSCREEN_EXIT", "WINDOW_BLUR",
              "NO_FACE", "MULTIPLE_FACES", "CAMERA_OFF"}
MAX_WARNINGS = 3
EXAM_QUESTIONS = 10
EXAM_SECONDS = 600

SESSIONS = {}

def save_log(sid):
    with open(os.path.join(LOGS, f"{sid}.json"), "w") as f:
        json.dump(SESSIONS[sid], f, indent=2, default=str)

# ---------- Pages ----------
@app.route("/")
def home():
    return send_from_directory(FRONT, "index.html")

# ---------- APIs ----------
@app.route("/api/categories")
def categories():
    return jsonify(sorted(QUESTIONS["category"].unique().tolist()))

@app.route("/api/start", methods=["POST"])
def start():
    d = request.get_json()
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
        "answers_key": {int(r.id): int(r.answer) for r in chosen.itertuples()},
        "events": [],
        "warnings": 0,
        "submitted": False,
    }
    qs = [{"id": int(r.id), "question": r.question,
           "options": [r.option_A, r.option_B, r.option_C, r.option_D]}
          for r in chosen.itertuples()]
    save_log(sid)
    return jsonify({"session_id": sid, "duration_sec": EXAM_SECONDS, "questions": qs})

@app.route("/api/event", methods=["POST"])
def event():
    d = request.get_json()
    s = SESSIONS.get(d.get("session_id"))
    if not s or s["submitted"]:
        return jsonify({"error": "Invalid session"}), 400
    etype = d.get("type")
    s["events"].append({"type": etype,
                        "timestamp": d.get("timestamp", time.time())})
    if etype in VIOLATIONS:
        s["warnings"] += 1
    save_log(s["session_id"])
    return jsonify({"warnings": s["warnings"],
                    "auto_submit": s["warnings"] >= MAX_WARNINGS})

@app.route("/api/submit", methods=["POST"])
def submit():
    d = request.get_json()
    s = SESSIONS.get(d.get("session_id"))
    if not s:
        return jsonify({"error": "Invalid session"}), 400
    answers = d.get("answers", {})
    score = sum(1 for qid, correct in s["answers_key"].items()
                if answers.get(str(qid)) == correct)
    s["submitted"] = True
    s["score"] = score
    s["total"] = len(s["answers_key"])
    save_log(s["session_id"])
    return jsonify({"score": score, "total": s["total"], "warnings": s["warnings"]})

@app.route("/api/logs/<sid>")
def logs(sid):
    s = SESSIONS.get(sid)
    if not s:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"name": s["name"], "warnings": s["warnings"],
                    "events": s["events"], "score": s.get("score")})
@app.route("/api/admin/sessions")
def admin_sessions():
    out = []
    for fn in os.listdir(LOGS):
        if fn.endswith(".json"):
            with open(os.path.join(LOGS, fn)) as f:
                s = json.load(f)
            out.append({
                "session_id": s.get("session_id"),
                "name": s.get("name"),
                "category": s.get("category"),
                "started_at": s.get("started_at"),
                "warnings": s.get("warnings", 0),
                "score": s.get("score"),
                "total": s.get("total"),
                "submitted": s.get("submitted", False),
                "events": s.get("events", []),
            })
    out.sort(key=lambda x: x["started_at"] or 0, reverse=True)
    return jsonify(out)

if __name__ == "__main__":
    app.run(debug=True, port=5000)