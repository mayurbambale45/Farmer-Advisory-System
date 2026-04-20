from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import requests
import numpy as np

app = Flask(__name__)
CORS(app)

# --- 1. Load Your Smart Irrigation Model ---
MODEL_PATH = 'irrigation_model_v2.pkl'
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Loaded AI Model: {MODEL_PATH}")
except FileNotFoundError:
    print("❌ Model not found. (Irrigation advice will be generic)")
    model = None

# --- 2. Route: Smart Weather Forecast (For Weather Component) ---
@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        # Fetch 7-day forecast with extended daily variables
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,surface_pressure"
            f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,"
            f"precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_max,"
            f"relative_humidity_2m_min,uv_index_max,sunrise,sunset,apparent_temperature_max,"
            f"apparent_temperature_min"
            f"&timezone=auto&forecast_days=7"
        )
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()

        # AI Prediction for Irrigation
        advice_text = "Data unavailable"
        advice_type = "neutral" 

        if model:
            max_temp = data['daily']['temperature_2m_max'][0]
            humidity = data['current']['relative_humidity_2m']
            rain = data['daily']['precipitation_sum'][0]

            input_df = pd.DataFrame([[max_temp, humidity, rain]], 
                                  columns=['max_temp_c', 'humidity_percent', 'rainfall_mm'])
            
            prediction = model.predict(input_df)[0]
            
            if prediction == 1:
                advice_text = "⚠️ Soil moisture is low. Irrigation is recommended today."
                advice_type = "warning"
            else:
                advice_text = "✅ Moisture levels are good. No irrigation needed."
                advice_type = "success"

        # Build extended daily list (7 days)
        daily = data['daily']
        extended_daily = {}
        for key in daily:
            extended_daily[key] = daily[key]  # pass all fields through

        return jsonify({
            "current": {
                "temp": round(data['current']['temperature_2m']),
                "feels_like": round(data['current'].get('apparent_temperature', data['current']['temperature_2m'])),
                "humidity": data['current']['relative_humidity_2m'],
                "wind": data['current']['wind_speed_10m'],
                "pressure": data['current'].get('surface_pressure', None),
                "weather_code": data['current']['weather_code'],
                "location": "Local Field Sensor"
            },
            "daily_stats": {
                "max_temp": daily['temperature_2m_max'][0],
                "min_temp": daily['temperature_2m_min'][0],
                "rain_mm": daily['precipitation_sum'][0],
                "sunrise": daily.get('sunrise', [None])[0],
                "sunset":  daily.get('sunset',  [None])[0],
                "uv_index": daily.get('uv_index_max', [None])[0],
            },
            "forecast": extended_daily,
            "latitude": float(lat),
            "longitude": float(lon),
            "ai_advice": {
                "text": advice_text,
                "type": advice_type
            }
        })

    except Exception as e:
        print(f"Weather Error: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    print("🚀 Weather & Alert Backend Running on Port 5003...")
    app.run(port=5003, debug=True)