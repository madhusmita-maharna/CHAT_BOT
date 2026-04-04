from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from .env
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Home route
@app.route("/")
def home():
    return "Backend is running 🚀"

# Chat route
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"reply": "Please enter a message"})

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
        Give a clean and structured answer.

        If code is required:
        - Write properly formatted code (multiple lines, readable)
        - Do NOT compress into one line
        - After code, give 3-4 lines explanation

        Rules:
        - No markdown symbols like *, #
        - Keep explanation simple and short
        - Maintain proper spacing and indentation

        Question: {user_message}
        """
    )

    return jsonify({"reply": response.text})

if __name__ == "__main__":
    app.run(debug=True)