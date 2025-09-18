from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

# --- Load the Model and Encoders for FERTILIZER prediction ---
try:
    model = pickle.load(open('model.pkl', 'rb'))
    le_district = pickle.load(open('le_district.pkl', 'rb'))
    le_soil = pickle.load(open('le_soil.pkl', 'rb'))
    le_crop = pickle.load(open('le_crop.pkl', 'rb'))
    le_fertilizer = pickle.load(open('le_fertilizer.pkl', 'rb'))
except FileNotFoundError:
    print("Error: One or more .pkl files are missing. Please run the training script again.")
    exit()

# --- Database of Default NPK/pH Values for Mapped Soil Types ---
# This dictionary holds our best guesses for soil properties.
SOIL_DEFAULTS = {
    "Black": {"N": 85, "P": 50, "K": 100, "pH": 7.0},
    "Red": {"N": 70, "P": 45, "K": 90, "pH": 6.5},
    "Clayey": {"N": 75, "P": 60, "K": 110, "pH": 7.2},
    "Default": {"N": 80, "P": 50, "K": 95, "pH": 6.7} # A fallback
}

# --- ROUTES ---

@app.route('/')
def home():
    """Renders the main HTML page with dropdown options."""
    return render_template('index.html',
                           districts=list(le_district.classes_),
                           soils=list(le_soil.classes_),
                           crops=list(le_crop.classes_))

@app.route('/get_environmental_data', methods=['POST'])
def get_environmental_data():
    """
    Main API endpoint to fetch all environmental data from SoilGrids and Open-Meteo.
    """
    try:
        data = request.get_json()
        lat, lon = data['lat'], data['lon']

        # --- 1. Get Soil Data ---
        # Use the scientific classification API from your code snippet
        soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=wrb_class_name&depth=0-5cm&value=strings"
        soil_response = requests.get(soil_url, timeout=15)
        soil_response.raise_for_status()
        soil_api_data = soil_response.json()
        soil_class_name = soil_api_data['properties']['layers'][0]['depths'][0]['values']['strings'][0]

        # Map the scientific name to our simpler categories
        if 'Vertisols' in soil_class_name: # Vertisols are typically black, clay-rich soils
            soil_type_mapped = "Black"
        elif 'Nitisols' in soil_class_name or 'Ferralsols' in soil_class_name: # Common in tropical/red soil areas
            soil_type_mapped = "Red"
        else:
            soil_type_mapped = "Clayey" # A reasonable default for many other soil types
            
        # Get the default NPK and pH values based on the mapped soil type
        defaults = SOIL_DEFAULTS.get(soil_type_mapped, SOIL_DEFAULTS["Default"])
        defaults['soil_color'] = soil_type_mapped # Add the soil color itself to the response

        # --- 2. Get Weather Data ---
        # Current temperature
        current_weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
        weather_response = requests.get(current_weather_url, timeout=15)
        weather_response.raise_for_status()
        defaults['temperature'] = weather_response.json()['current']['temperature_2m']

        # Historical rainfall for the last year
        today = datetime.utcnow()
        last_year = today - timedelta(days=365)
        historical_weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={last_year.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}&daily=rain_sum"
        historical_response = requests.get(historical_weather_url, timeout=15)
        historical_response.raise_for_status()
        precipitation_data = historical_response.json()['daily']['rain_sum']
        defaults['rainfall'] = sum(p for p in precipitation_data if p is not None)

        return jsonify(defaults)

    except Exception as e:
        print(f"--- API ERROR ---: {e}")
        # If any API fails, send a full set of default data so the app doesn't break
        error_defaults = SOIL_DEFAULTS["Default"]
        error_defaults.update({'soil_color': "Black", 'temperature': 25.0, 'rainfall': 1000})
        return jsonify(error_defaults)

@app.route('/predict', methods=['POST'])
def predict():
    """Receives the final form data and predicts the FERTILIZER."""
    # This prediction logic is the same as our previous successful version
    data = request.get_json()
    try:
        encoded_district = le_district.transform([data['district']])[0]
        encoded_soil = le_soil.transform([data['soil_color']])[0]
        encoded_crop = le_crop.transform([data['crop']])[0]
        input_data = np.array([[
            float(data['nitrogen']), float(data['phosphorus']), float(data['potassium']),
            float(data['ph']), float(data['rainfall']), float(data['temperature']),
            encoded_district, encoded_soil, encoded_crop
        ]])
        prediction_encoded = model.predict(input_data)
        prediction_name = le_fertilizer.inverse_transform(prediction_encoded)[0]
        return jsonify({'prediction': prediction_name})
    except Exception as e:
        print(f"--- PREDICTION ERROR ---: {e}")
        return jsonify({'prediction': f"Error during prediction."})

if __name__ == "__main__":
    app.run(debug=True)