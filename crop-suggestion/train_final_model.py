import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import pickle

print("Starting final model training with Western Maharashtra dataset...")

# 1. Load the dataset
try:
    df = pd.read_csv('Crop and fertilizer dataset.csv')
    print("Dataset loaded successfully.")
except FileNotFoundError:
    print("Error: 'Crop and fertilizer dataset.csv' not found.")
    exit()

# 2. Prepare the data
df_processed = df.copy()
df_processed.columns = df_processed.columns.str.strip()

# --- THE FIX IS HERE ---
# We are now also dropping the 'Link' column because it contains non-numeric data.
df_processed = df_processed.drop(['District_Name', 'Fertilizer', 'Link'], axis=1)

# Use One-Hot Encoding for 'Soil_color'
df_processed = pd.get_dummies(df_processed, columns=['Soil_color'], drop_first=True)

# Use LabelEncoder for the target 'Crop'
crop_encoder = LabelEncoder()
df_processed['Crop'] = crop_encoder.fit_transform(df_processed['Crop'])

# 3. Define features (X) and target (y)
target = 'Crop'
features = [col for col in df_processed.columns if col != target]

X = df_processed[features]
y = df_processed[target]

print("Data preprocessed successfully.")
print(f"Features being used for training: {features}")

# 4. Split and Train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
print("Training the final model...")
model.fit(X_train, y_train)
print("Model training completed.")

# 5. Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print("---" * 10)
print(f"Final Model Accuracy: {accuracy * 100:.2f}%")
print("---" * 10)

# 6. Save the final model and encoder
with open('final_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

with open('final_crop_encoder.pkl', 'wb') as encoder_file:
    pickle.dump(crop_encoder, encoder_file)
    
print("Final model and crop encoder have been saved successfully!")
print("Files created: 'final_model.pkl', 'final_crop_encoder.pkl'")