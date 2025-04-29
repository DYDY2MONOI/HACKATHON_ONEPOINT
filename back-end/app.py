import os
import sys
import ollama # Import the ollama library
from flask import Flask, request, jsonify
from flask_cors import CORS
from preprocessor import PromptPreprocessor, DEFAULT_POLITENESS_FILE, \
                         DEFAULT_CS_KEYWORDS_FILE, DEFAULT_NON_CS_KEYWORDS_FILE, \
                         DEFAULT_BASH_COMMANDS_FILE

app = Flask(__name__)

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2:latest')

CORS(app, resources={
    r"/preprocess": {"origins": FRONTEND_URL},
    r"/generate": {"origins": FRONTEND_URL}
})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"Base directory: {BASE_DIR}")

SYSTEM_PROMPT_FILE = os.path.join(BASE_DIR, "system_prompt.md")
SYSTEM_PROMPT_CONTENT = ""

try:
    with open(SYSTEM_PROMPT_FILE, "r", encoding="utf-8") as f:
        SYSTEM_PROMPT_CONTENT = f.read().strip()
    if SYSTEM_PROMPT_CONTENT:
        print(f"✅ Successfully loaded system prompt from: {SYSTEM_PROMPT_FILE}")
    else:
        print(f"⚠️ Warning: System prompt file found but is empty: {SYSTEM_PROMPT_FILE}")
except FileNotFoundError:
    print(f"⚠️ Warning: System prompt file not found at: {SYSTEM_PROMPT_FILE}")
    print("   Continuing without a system prompt.")
except Exception as e:
    print(f"❌ Error loading system prompt file ({SYSTEM_PROMPT_FILE}): {e}")
    print("   Continuing without a system prompt.")

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
    print("✅ Flask App: PromptPreprocessor initialized successfully.")
except ValueError as e:
    print(f"❌ CRITICAL ERROR: Failed to initialize PromptPreprocessor: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ CRITICAL ERROR: An unexpected error occurred during preprocessor initialization: {e}")
    sys.exit(1)

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

    print(f"Received request for model generation. Model: '{OLLAMA_MODEL}'")
    print(f"   User Prompt: '{user_prompt[:100]}...'")

    messages = []
    if SYSTEM_PROMPT_CONTENT:
        messages.append({'role': 'system', 'content': SYSTEM_PROMPT_CONTENT})
        print("Prepending loaded system prompt.")
    else:
        print("No system prompt loaded or file was empty/missing.")

    messages.append({'role': 'user', 'content': user_prompt})

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=messages
        )
        generated_text = response['message']['content']
        print(f"Model '{OLLAMA_MODEL}' generated response: '{generated_text[:100]}...'")
        return jsonify({"response": generated_text}), 200

    except ollama.ResponseError as e:
         print(f"❌ Ollama Response Error [/generate]: {e.error}")
         error_message = f"Error interacting with the local model ('{OLLAMA_MODEL}'). Details: {e.error}"
         return jsonify({"error": error_message}), 503
    except Exception as e:
        print(f"❌ Unexpected Error [/generate]: {e}")
        return jsonify({"error": "An internal server error occurred while contacting the local model."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5001))
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"🚀 Starting Flask server on {host}:{port} (Debug: {debug_mode})")
    print(f"   Using Ollama model: {OLLAMA_MODEL}")
    print(f"   Ensure Ollama service is running and model '{OLLAMA_MODEL}' is pulled.")
    app.run(host=host, port=port, debug=debug_mode)

