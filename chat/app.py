from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

# --- 1. CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"  # Best free model on Groq

# --- 2. CORS HEADERS ---
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# --- 3. SYSTEM INSTRUCTIONS PER LANGUAGE ---
BASE_PROMPTS = {
    "en": (
        "You are AgriAssist, a professional AI agriculture expert for farmers across India. "
        "Provide concise, practical, actionable advice relevant to the farmer's crop, region, and season. "
        "Keep answers short (2-4 sentences) in simple language that a farmer can understand. "
        "{location_context}"
    ),
    "hi": (
        "आप एग्रीअसिस्ट हैं, भारत भर के किसानों के लिए एक पेशेवर एआई कृषि सलाहकार। "
        "किसान की फसल, क्षेत्र और मौसम के अनुसार हिंदी में संक्षिप्त, व्यावहारिक सलाह दें। "
        "उत्तर 2-4 वाक्यों में सरल भाषा में रखें। "
        "{location_context}"
    ),
    "mr": (
        "तुम्ही ॲग्री असिस्ट आहात, भारतभरातील शेतकऱ्यांसाठी एक व्यावसायिक AI कृषी सल्लागार. "
        "शेतकऱ्याच्या पीक, प्रदेश आणि हंगामानुसार मराठीत थोडक्यात, व्यावहारिक सल्ला द्या. "
        "उत्तरे 2-4 वाक्यांत सोप्या भाषेत ठेवा. "
        "{location_context}"
    )
}

LOCATION_CONTEXT = {
    "en": (
        "The farmer is currently located at {location_name} "
        "(coordinates: {lat}°N, {lon}°E). "
        "Current weather: {temp}°C, humidity {humidity}%, wind {wind} km/h. "
        "Today's rainfall: {rain}mm. "
        "Use this location and weather context to give more relevant advice."
    ),
    "hi": (
        "किसान वर्तमान में {location_name} "
        "(निर्देशांक: {lat}°N, {lon}°E) में स्थित हैं। "
        "मौजूदा मौसम: {temp}°C, आर्द्रता {humidity}%, हवा {wind} km/h, आज वर्षा {rain}mm। "
        "इस स्थान और मौसम के आधार पर प्रासंगिक सलाह दें।"
    ),
    "mr": (
        "शेतकरी सध्या {location_name} "
        "(निर्देशांक: {lat}°N, {lon}°E) येथे आहेत. "
        "सध्याचे हवामान: {temp}°C, आर्द्रता {humidity}%, वारा {wind} km/h, आजचा पाऊस {rain}mm. "
        "या स्थान आणि हवामानाच्या आधारे संबंधित सल्ला द्या."
    )
}

# --- 4. CHAT ROUTE ---
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        user_msg = data.get('message', '').strip()
        lang = data.get('lang', 'en')

        # Location context from frontend (optional)
        location = data.get('location', {})
        location_name = location.get('name', '')
        lat  = location.get('lat', '')
        lon  = location.get('lon', '')
        temp = location.get('temp', '')
        humidity = location.get('humidity', '')
        wind = location.get('wind', '')
        rain = location.get('rain', '')

        if not user_msg:
            return jsonify({"reply": "Please say something."})

        # Build location context string
        if location_name and lat:
            loc_ctx = LOCATION_CONTEXT.get(lang, LOCATION_CONTEXT['en']).format(
                location_name=location_name,
                lat=lat, lon=lon,
                temp=temp, humidity=humidity,
                wind=wind, rain=rain
            )
        else:
            loc_ctx = ""

        # Build the system prompt with location injected
        base = BASE_PROMPTS.get(lang, BASE_PROMPTS['en'])
        system_instruction = base.format(location_context=loc_ctx)

        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user",   "content": user_msg}
            ],
            temperature=0.7,
            max_tokens=350,
        )

        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"❌ Groq Error: {e}")
        return jsonify({"reply": f"Service error: {str(e)}"})

# --- 5. START ---
if __name__ == '__main__':
    print("🚀 AgriAssist Chat Service running on Port 5005 (Groq / LLaMA-3.3-70B)...")
    app.run(host='0.0.0.0', port=5005, debug=True)