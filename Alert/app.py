from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/get_alerts', methods=['GET'])
def get_alerts():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Coordinates required'}), 400

    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        res = requests.get(url, timeout=10)
        data = res.json()

        alerts = []
        
        # 1. FLOOD & RAIN RISKS
        today_rain = data['daily']['precipitation_sum'][0]
        if today_rain > 65:
            alerts.append({
                "id": 1, "type": "critical", "title": "Flash Flood Warning",
                "desc": f"Extreme rainfall ({today_rain}mm) detected. Evacuate low-lying fields immediately."
            })
        elif today_rain > 35:
            alerts.append({
                "id": 2, "type": "warning", "title": "Heavy Rain Alert",
                "desc": f"Heavy rain ({today_rain}mm) expected. Avoid spraying chemicals today."
            })

        # 2. TEMPERATURE RISKS
        max_temp = data['daily']['temperature_2m_max'][0]
        min_temp = data['daily']['temperature_2m_min'][0]
        
        if max_temp > 40:
             alerts.append({
                "id": 3, "type": "critical", "title": "Heatwave Emergency",
                "desc": f"Extreme heat ({max_temp}°C). Irrigate crops immediately to prevent wilting."
            })
        elif min_temp < 5:
             alerts.append({
                "id": 4, "type": "warning", "title": "Frost Advisory",
                "desc": f"Freezing temperatures ({min_temp}°C) tonight. Cover sensitive saplings."
            })

        # 3. PEST & DISEASE (The "Smart" Part)
        humidity = data['current']['relative_humidity_2m']
        if humidity > 85 and max_temp > 25:
             alerts.append({
                "id": 5, "type": "info", "title": "Fungal Blight Risk",
                "desc": "High humidity and heat detected. Conditions are ideal for fungal growth. Scout fields."
            })

        # 4. WIND RISKS
        wind = data['current']['wind_speed_10m']
        if wind > 30:
            alerts.append({
                "id": 6, "type": "warning", "title": "High Wind Alert",
                "desc": f"Strong winds ({wind} km/h). Secure polyhouses and tall crops."
            })

        return jsonify({"alerts": alerts})

    except Exception as e:
        print(f"Alert Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Alert System Backend Running on Port 5010...")
    app.run(port=5010, debug=True)
