import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import os

print("=" * 60)
print("  CROP RECOMMENDATION MODEL TRAINING")
print("=" * 60)

# -------------------------------------------------------
# 1. Load ALL available CSV datasets and merge them
# -------------------------------------------------------
csv_files = [
    'smart_crop_data.csv',
    'crop_data.csv',
    'Crop_recommendation.csv',
]

dfs = []
for f in csv_files:
    if os.path.exists(f):
        df_temp = pd.read_csv(f)
        # Only use files that have ALL required columns
        required = {'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'Crop'}
        if required.issubset(set(df_temp.columns)):
            # Rename N,P,K if they have alternate column names
            dfs.append(df_temp)
            print(f"✅ Loaded: {f} — {df_temp.shape[0]} rows")
        else:
            print(f"⚠️  Skipped (missing columns): {f}")
    else:
        print(f"⚠️  File not found: {f}")

if not dfs:
    raise FileNotFoundError("No valid CSV files found! Place smart_crop_data.csv in this folder.")

df = pd.concat(dfs, ignore_index=True)
print(f"\n📊 Combined Dataset Shape: {df.shape}")
print(f"📋 Unique Crops: {sorted(df['Crop'].unique())}")

# -------------------------------------------------------
# 2. Handle optional columns: District & Soil Color
# -------------------------------------------------------
has_district = 'District' in df.columns
has_soil = 'Soil Color' in df.columns

le_district = LabelEncoder()
le_soil = LabelEncoder()
le_crop = LabelEncoder()

if has_district:
    df['District'] = df['District'].fillna('Unknown')
    df['District'] = le_district.fit_transform(df['District'])
    print(f"✅ Districts encoded: {list(le_district.classes_)}")
else:
    df['District'] = 0  # dummy column
    le_district.classes_ = ['Unknown']
    print("⚠️  No District column — using dummy encoding")

if has_soil:
    df['Soil Color'] = df['Soil Color'].fillna('Black')
    df['Soil Color'] = le_soil.fit_transform(df['Soil Color'])
    print(f"✅ Soil types encoded: {list(le_soil.classes_)}")
else:
    df['Soil Color'] = 0  # dummy column
    le_soil.classes_ = ['Black']
    print("⚠️  No Soil Color column — using dummy encoding")

df['Crop'] = le_crop.fit_transform(df['Crop'])
print(f"✅ Crop classes: {list(le_crop.classes_)}")

# -------------------------------------------------------
# 3. Define Features and Target
# -------------------------------------------------------
X = df[['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'District', 'Soil Color']]
y = df['Crop']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"\n🔀 Train size: {len(X_train)}, Test size: {len(X_test)}")

# -------------------------------------------------------
# 4. Train Random Forest (Improved Parameters)
# -------------------------------------------------------
print("\n🚀 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=300,       # More trees = better stability
    max_depth=None,         # Let trees grow fully
    min_samples_split=2,
    min_samples_leaf=1,
    class_weight='balanced', # Handle any class imbalance
    random_state=42,
    n_jobs=-1               # Use all CPU cores
)
model.fit(X_train, y_train)

# -------------------------------------------------------
# 5. Evaluate
# -------------------------------------------------------
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Model Accuracy: {acc * 100:.2f}%")
print("\n📈 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_crop.classes_))

# -------------------------------------------------------
# 6. Save Model & Encoders
# -------------------------------------------------------
pickle.dump(model, open('final_model.pkl', 'wb'))
pickle.dump(le_district, open('le_district_crop.pkl', 'wb'))
pickle.dump(le_soil, open('le_soil_crop.pkl', 'wb'))
pickle.dump(le_crop, open('le_crop_target.pkl', 'wb'))

print("\n✅ All models and encoders saved successfully!")
print(f"   Crops supported: {list(le_crop.classes_)}")
print(f"   Districts supported: {list(le_district.classes_)}")
print(f"   Soil types supported: {list(le_soil.classes_)}")
print("=" * 60)