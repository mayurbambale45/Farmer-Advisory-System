import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import pickle

print("Loading the new, robust dataset...")
# Step 1: Load the new dataset
df = pd.read_csv('fertilizer_crop_data.csv')
print("Dataset loaded successfully.")

# Step 2: Clean the data by dropping the irrelevant 'Link' column
if 'Link' in df.columns:
    df = df.drop('Link', axis=1)

print("Cleaned dataset head:")
print(df.head())

# Step 3: Preprocess the data with Label Encoding for all categorical features
print("\nPreprocessing data...")
# Initialize one encoder for each categorical column
le_district = LabelEncoder()
le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fertilizer = LabelEncoder()

# Fit and transform the categorical columns
df['District_Name_Encoded'] = le_district.fit_transform(df['District_Name'])
df['Soil_color_Encoded'] = le_soil.fit_transform(df['Soil_color'])
df['Crop_Encoded'] = le_crop.fit_transform(df['Crop'])
df['Fertilizer_Encoded'] = le_fertilizer.fit_transform(df['Fertilizer'])

# Step 4: Define the new Features (X) and Target (y)
# Notice we are now using all the new powerful features!
feature_cols = [
    'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature',
    'District_Name_Encoded', 'Soil_color_Encoded', 'Crop_Encoded'
]
X = df[feature_cols]
y = df['Fertilizer_Encoded']

# Step 5: Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"\nData split into {len(X_train)} training samples and {len(X_test)} testing samples.")

# Step 6: Build and Train a new Random Forest Model
print("Training a new Random Forest model...")
model = RandomForestClassifier(n_estimators=150, random_state=42) # Using a standard model to get a baseline
model.fit(X_train, y_train)
print("Model training complete.")

# Step 7: Evaluate the new model
print("\nEvaluating the new model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"--- New Model Accuracy: {accuracy * 100:.2f}% ---")
print("This is our new baseline. We expect it to be much higher!")

# Step 8: Save the new model and ALL new encoders
print("\nSaving new model and encoders...")
pickle.dump(model, open('model.pkl', 'wb'))
pickle.dump(le_district, open('le_district.pkl', 'wb'))
pickle.dump(le_soil, open('le_soil.pkl', 'wb'))
pickle.dump(le_crop, open('le_crop.pkl', 'wb'))
pickle.dump(le_fertilizer, open('le_fertilizer.pkl', 'wb'))
print("New model and encoders saved successfully.")