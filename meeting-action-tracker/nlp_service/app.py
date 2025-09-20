from flask import Flask, request, jsonify
from nlp_pipeline import extract_tasks_from_file
import traceback

app = Flask(__name__)

@app.route("/extract-action-items", methods=["POST"])
def extract_action_items():
    try:
        data = request.json
        file_type = data.get("file_type")
        file_path = data.get("file_path")
        tasks = extract_tasks_from_file(file_type, file_path)
        return jsonify({"success": True, "tasks": tasks})
    except Exception as e:
        print("Error:", e)
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
