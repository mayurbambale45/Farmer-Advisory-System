from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import json

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = "AIzaSyAH3kBM2gfoKzJPE19DHzeu1ND4uUXX_Gg"
client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.0-flash"

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*" 
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route('/irrigation-plan', methods=['POST', 'OPTIONS'])
def irrigation_plan():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    data = {}
    try:
        data = request.get_json()
        crop_type         = data.get('cropType', 'Unknown crop')
        soil_type         = data.get('soilType', 'Loam')
        field_size        = data.get('fieldSize', 1)
        irrigation_method = data.get('irrigationMethod', 'Drip')

        prompt = f"""
You are an expert irrigation advisor for farmers in Maharashtra, India.

Farmer details:
- Crop: {crop_type}
- Soil Type: {soil_type}
- Field Size: {field_size} acres
- Irrigation Method: {irrigation_method}
- Season: Current season in Maharashtra

Based on these details, provide a concise irrigation plan in this exact JSON format (no extra text):
{{
  "frequency": "e.g. Every 2 days / Twice a week",
  "waterAmount": "e.g. 500 liters per acre per session",
  "notes": "2-3 sentences of key advice for this crop and soil combination."
}}

Return ONLY the raw JSON object, nothing else.
"""
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )
        raw_text = response.text.strip().strip("```json").strip("```").strip()
        try:
            plan = json.loads(raw_text)
            return jsonify(plan)
        except Exception as json_err:
            print(f"❌ JSON Parse Error: {json_err} | Raw: {raw_text}")
            raise Exception("Failed to parse AI response")

    except Exception as e:
        print(f"❌ Irrigation Error: {e}")
        return jsonify({
            "frequency": "Every 2-3 days",
            "waterAmount": "400-600 liters per acre",
            "notes": f"General plan for {data.get('cropType','your crop')} on {data.get('soilType','your soil')}. Monitor soil moisture regularly and adjust based on rainfall."
        })

if __name__ == '__main__':
    print("🚀 Irrigation Service running on Port 5006 (google.genai SDK)...")
    app.run(host='0.0.0.0', port=5006, debug=True)
