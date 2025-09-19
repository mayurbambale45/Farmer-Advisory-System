from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Initialize the Flask application
app = Flask(__name__)

# --- Load the Trained Model ---
# This line is the most important. It loads the "AI brain" you created.
try:
    MODEL_PATH = 'models/rainfall_prediction_model.joblib'
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"❌ Error: Model file not found at {MODEL_PATH}. Please run train_model.py first.")
    model = None

# --- Define the Prediction API Endpoint ---
# This creates the "phone line" that your Node.js app will call.
# It listens for POST requests at the URL '/predict'.
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model is not loaded.'}), 500

    # 1. Get the JSON data sent from the Node.js application
    input_data = request.get_json()
    
    # 2. Validate the incoming data
    if not input_data:
        return jsonify({'error': 'No input data provided'}), 400
        
    try:
        # 3. Convert the input data into a pandas DataFrame
        # The structure must exactly match the features the model was trained on.
        features_df = pd.DataFrame([input_data])
        
        # 4. Ensure the column order is the same as in training (very important!)
        required_columns = ['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh']
        features_df = features_df[required_columns]

        # 5. Use the loaded model to make a prediction
        prediction = model.predict(features_df)
        
        # The model returns a list/array, so we get the first (and only) element.
        predicted_rainfall = prediction[0]
        
        # 6. Send the answer back as a clean JSON response
        return jsonify({'predicted_rainfall_mm': round(predicted_rainfall, 2)})

    except (KeyError, TypeError) as e:
        return jsonify({'error': f'Invalid input data format. Make sure it includes {required_columns}. Error: {e}'}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred during prediction: {e}'}), 500

# --- Run the Flask App ---
if __name__ == '__main__':
    print("🚀 Starting Flask API server...")
    # We set host='0.0.0.0' to make the API accessible from your Node.js app.
    # The default port is 5000.
    app.run(host='0.0.0.0', port=5000)


