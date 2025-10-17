from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
from receipt import scan_receipt

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"message": "FairShare Receipt API is running 🚀"})

@app.route("/scan-receipt", methods=["POST"])
def scan_receipt_endpoint():
    """POST /scan-receipt — Accepts a file and returns parsed items."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
        file.save(temp.name)
        temp_path = temp.name

    try:
        items = scan_receipt(temp_path)
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(temp_path)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
