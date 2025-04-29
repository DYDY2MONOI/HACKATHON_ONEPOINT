import os
import sys
import ollama  # Import the ollama library
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from preprocessor import (
    PromptPreprocessor,
    DEFAULT_POLITENESS_FILE,
    DEFAULT_CS_KEYWORDS_FILE,
    DEFAULT_NON_CS_KEYWORDS_FILE,
    DEFAULT_BASH_COMMANDS_FILE
)

app = Flask(__name__)

# Configuration
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2:latest')

CORS(app, resources={
    r"/preprocess": {"origins": FRONTEND_URL},
    r"/generate": {"origins": FRONTEND_URL},
    r"/export/*": {"origins": FRONTEND_URL}
})

# Load system prompt
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYSTEM_PROMPT_FILE = os.path.join(BASE_DIR, "system_prompt.md")
SYSTEM_PROMPT_CONTENT = ""
try:
    with open(SYSTEM_PROMPT_FILE, "r", encoding="utf-8") as f:
        SYSTEM_PROMPT_CONTENT = f.read().strip()
    print(f"✅ Loaded system prompt from: {SYSTEM_PROMPT_FILE}")
except FileNotFoundError:
    print(f"⚠️ System prompt not found at: {SYSTEM_PROMPT_FILE}")

# Initialize preprocessor
politeness_file = os.path.join(BASE_DIR, DEFAULT_POLITENESS_FILE)
cs_keywords_file = os.path.join(BASE_DIR, DEFAULT_CS_KEYWORDS_FILE)
non_cs_keywords_file = os.path.join(BASE_DIR, DEFAULT_NON_CS_KEYWORDS_FILE)
bash_commands_file = os.path.join(BASE_DIR, DEFAULT_BASH_COMMANDS_FILE)
try:
    preprocessor_instance = PromptPreprocessor(
        politeness_file=politeness_file,
        cs_keywords_file=cs_keywords_file,
        non_cs_keywords_file=non_cs_keywords_file,
        bash_commands_file=bash_commands_file,
    )
    print("✅ PromptPreprocessor initialized.")
except Exception as e:
    print(f"❌ Failed to initialize PromptPreprocessor: {e}")
    sys.exit(1)

# In-memory example of marked cards
MARKED_CARDS = [
    {
        "id": 1,
        "title": "Objectif lancement MVP",
        "date": "2025-04-28",
        "excerpt": "On doit déployer la V1 avant fin mai.",
        "notes": "Penser à la config CI/CD"
    },
    {
        "id": 2,
        "title": "Rappel réunion client",
        "date": "2025-04-29",
        "excerpt": "Meeting avec X le 2 mai à 10h",
        "notes": ""
    }
]

@app.route('/preprocess', methods=['POST'])
def handle_preprocess():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt or not isinstance(prompt, str):
        return jsonify({"error": "Invalid or missing 'prompt' string"}), 400
    try:
        result = preprocessor_instance.preprocess_prompt(prompt)
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error during prompt preprocessing: {e}")
        return jsonify({"error": "Internal server error during preprocessing."}), 500

@app.route('/generate', methods=['POST'])
def handle_generate():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    user_prompt = data.get('prompt')
    if not user_prompt or not isinstance(user_prompt, str):
        return jsonify({"error": "Invalid or missing 'prompt' string"}), 400

    message = f"{SYSTEM_PROMPT_CONTENT}\nUser's question: {user_prompt}"
    messages = [{"role": "user", "content": message}]
    try:
        response = ollama.chat(model=OLLAMA_MODEL, messages=messages)
        generated_text = response['message']['content']
        return jsonify({"response": generated_text}), 200
    except ollama.ResponseError as e:
        error_message = f"Error with model '{OLLAMA_MODEL}': {e.error}"
        return jsonify({"error": error_message}), 503
    except Exception as e:
        return jsonify({"error": "Internal server error while contacting the model."}), 500

@app.route('/export/json', methods=['GET'])
def export_json():
    """Renvoie un JSON avec la liste des vignettes marquées."""
    return jsonify(cards=MARKED_CARDS), 200

@app.route('/export/pdf', methods=['GET'])
def export_pdf():
    """Génère un PDF à la volée depuis MARKED_CARDS."""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, y, "Export des vignettes marquées")
    p.setFont("Helvetica", 12)
    y -= 30
    for card in MARKED_CARDS:
        if y < 80:
            p.showPage()
            y = height - 40
        p.setFont("Helvetica-Bold", 14)
        p.drawString(40, y, f"{card['title']} — {card['date']}")
        y -= 20
        p.setFont("Helvetica", 11)
        p.drawString(60, y, f"Extrait : {card['excerpt']}")
        y -= 15
        if card.get('notes'):
            p.drawString(60, y, f"Notes   : {card['notes']}")
            y -= 15
        y -= 10
    p.save()
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name="vignettes_marquées.pdf",
        mimetype="application/pdf"
    )

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5001))
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host=host, port=port, debug=debug_mode)
