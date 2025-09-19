import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# --- Configuration ---
# We are now using our final, merged dataset.
DATASET_FILE = 'data/final_training_dataset.csv'
MODEL_SAVE_PATH = 'models/rainfall_prediction_model.joblib'

def train_rainfall_model():
    """
    Loads the final prepared dataset, trains a Random Forest Regressor model,
    evaluates its performance, and saves the trained model to a file.
    """
    print("--- Starting Model Training ---")

    # 1. Load the final, clean dataset
    try:
        data = pd.read_csv(DATASET_FILE)
        print("Final training dataset loaded successfully.")
    except FileNotFoundError:
        print(f"❌ Error: The dataset file '{DATASET_FILE}' was not found. Please run create_dataset.py first.")
        return

    # 2. Prepare the data for the model
    # The model will use these features to predict the target.
    features = data[['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh']]
    target = data['rainfall_mm'] # This is what we want to predict

    # 3. Split data into training and testing sets (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    print(f"Data split into {len(X_train)} training samples and {len(X_test)} testing samples.")

    # 4. Initialize and Train the Random Forest Model
    # n_estimators=100 means the model will use 100 decision trees.
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1) # n_jobs=-1 uses all available CPU cores
    print("Training the Random Forest model... (This may take a moment)")
    model.fit(X_train, y_train)
    print("Model training complete.")

    # 5. Evaluate the model on the unseen test data
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"\n--- Model Evaluation ---")
    print(f"Mean Absolute Error on Test Data: {mae:.2f} mm")
    print("This means our model's rainfall predictions are off by an average of {:.2f} mm.".format(mae))

    # 6. Save the trained model to the 'models' folder
    joblib.dump(model, MODEL_SAVE_PATH)
    print(f"\n✅ Success! Trained model saved to '{MODEL_SAVE_PATH}'.")
    print("--- Training Script Finished ---")


if __name__ == "__main__":
    train_rainfall_model()

