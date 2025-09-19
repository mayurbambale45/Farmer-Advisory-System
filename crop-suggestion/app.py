from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

# Load the final trained model and the crop encoder
try:
    model = pickle.load(open('final_model.pkl', 'rb'))
    crop_encoder = pickle.load(open('final_crop_encoder.pkl', 'rb'))
except FileNotFoundError:
    print("Error: Model or encoder files not found. Please run train_final_model.py first.")
    exit()

# This is the list of all features the model was trained on
MODEL_FEATURES = [
    'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature',
    'Soil_color_Dark Brown', 'Soil_color_Light Brown', 'Soil_color_Medium Brown',
    'Soil_color_Red', 'Soil_color_Red ', 'Soil_color_Reddish Brown'
]

# Database of default NPK values for different soil types in the region
SOIL_DEFAULTS = {
    "Black": {"N": 85, "P": 50, "K": 100, "pH": 7.0},
    "Red": {"N": 70, "P": 45, "K": 90, "pH": 6.5},
    "Dark Brown": {"N": 90, "P": 55, "K": 105, "pH": 6.8},
    "Default": {"N": 80, "P": 50, "K": 95, "pH": 6.7} # A fallback
}

# --- ROUTES ---

@app.route('/')
def home():
    """Renders the main page."""
    return render_template('index.html')

@app.route('/get_all_defaults', methods=['POST'])
def get_all_defaults():
    """API endpoint to get ALL default values (soil and weather) based on GPS."""
    try:
        data = request.get_json()
        lat = data['lat']
        lon = data['lon']

        # Get Soil Data from SoilGrids
        soil_url = f"https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=wrb_class_name&depth=0-5cm&value=strings"
        soil_response = requests.get(soil_url, timeout=10)
        soil_api_data = soil_response.json()
        soil_class_name = soil_api_data['properties']['layers'][0]['depths'][0]['values']['strings'][0]

        if 'Vertisols' in soil_class_name: soil_type = "Black"
        elif 'Nitisols' in soil_class_name: soil_type = "Red"
        else: soil_type = "Dark Brown"
        
        defaults = SOIL_DEFAULTS.get(soil_type, SOIL_DEFAULTS["Default"])
        defaults['soil_type'] = soil_type

        # Get Weather Data from Open-Meteo
        current_weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
        weather_response = requests.get(current_weather_url, timeout=10)
        defaults['temperature'] = weather_response.json()['current']['temperature_2m']

        today = datetime.utcnow()
        last_year = today - timedelta(days=365)
        historical_weather_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={last_year.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}&daily=precipitation_sum"
        historical_response = requests.get(historical_weather_url, timeout=10)
        precipitation_data = historical_response.json()['daily']['precipitation_sum']
        defaults['rainfall'] = sum(p for p in precipitation_data if p is not None)

        return jsonify(defaults)
    except Exception as e:
        print(f"API Error: {e}")
        defaults = SOIL_DEFAULTS["Default"]
        defaults.update({'soil_type': "Black", 'temperature': 25.0, 'rainfall': 1000})
        return jsonify(defaults)

@app.route('/predict', methods=['POST'])
def predict():
    """Handles the form submission and makes a crop prediction."""
    try:
        # --- THE FIX IS HERE: A more direct way to build the feature list ---

        # 1. Create a DataFrame with all the model features initialized to 0
        input_features = pd.DataFrame([[0]*len(MODEL_FEATURES)], columns=MODEL_FEATURES)

        # 2. Fill in the numeric values from the form
        input_features['Nitrogen'] = float(request.form['Nitrogen'])
        input_features['Phosphorus'] = float(request.form['Phosphorus'])
        input_features['Potassium'] = float(request.form['Potassium'])
        input_features['pH'] = float(request.form['pH'])
        input_features['Rainfall'] = float(request.form['Rainfall'])
        input_features['Temperature'] = float(request.form['Temperature'])

        # 3. Handle the one-hot encoded soil color
        # Get the selected soil color from the form, e.g., "Red"
        selected_soil_color_from_form = request.form['Soil_color']
        # Create the column name that matches the model's features, e.g., "Soil_color_Red"
        soil_color_column_name = 'Soil_color_' + selected_soil_color_from_form
        
        # Check if this column exists in our feature list
        if soil_color_column_name in input_features.columns:
            # Set the value of that column to 1
            input_features[soil_color_column_name] = 1
        
        # 4. Make the prediction
        prediction_encoded = model.predict(input_features)
        
        # 5. Decode the prediction to get the crop name
        crop_name = crop_encoder.inverse_transform(prediction_encoded)[0]

        return render_template('index.html', prediction_text=f"The recommended crop is: {crop_name.title()}")

    except Exception as e:
        return render_template('index.html', prediction_text=f"An error occurred: {e}")

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=5001)