import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import os

print("=" * 60)
print("  FERTILIZER ADVISORY MODEL TRAINING")
print("=" * 60)

# -------------------------------------------------------
# 1. Load ALL available CSV datasets and merge them
# -------------------------------------------------------
csv_files = [
    'fertilizer_data.csv',          # Main comprehensive dataset
    'fertilizer_crop_data.csv',     # Additional data if available
]

dfs = []
for f in csv_files:
    if os.path.exists(f):
        df_temp = pd.read_csv(f)
        # Required columns check
        required = {'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'Fertilizer', 'Crop Type'}
        if required.issubset(set(df_temp.columns)):
            dfs.append(df_temp)
            print(f"✅ Loaded: {f} — {df_temp.shape[0]} rows")
        else:
            print(f"⚠️  Skipped (missing columns): {f} | Cols: {list(df_temp.columns)}")
    else:
        print(f"⚠️  File not found: {f}")

if not dfs:
    raise FileNotFoundError("No valid fertilizer CSV files found!")

df = pd.concat(dfs, ignore_index=True)

# Drop any exact duplicates
original_len = len(df)
df = df.drop_duplicates()
print(f"\n📊 Combined Dataset: {original_len} rows  →  {len(df)} rows (after dedup)")
print(f"📋 Unique Fertilizers: {sorted(df['Fertilizer'].unique())}")
print(f"📋 Unique Crops: {sorted(df['Crop Type'].unique())}")

# -------------------------------------------------------
# 2. Encode Categoricals
# -------------------------------------------------------
le_district = LabelEncoder()
le_soil = LabelEncoder()
le_crop = LabelEncoder()
le_fertilizer = LabelEncoder()

has_district = 'District' in df.columns
has_soil = 'Soil Color' in df.columns

if has_district:
    df['District'] = df['District'].fillna('Unknown')
    df['District'] = le_district.fit_transform(df['District'])
    print(f"\n✅ Districts: {list(le_district.classes_)}")
else:
    df['District'] = 0
    le_district.classes_ = ['Unknown']

if has_soil:
    df['Soil Color'] = df['Soil Color'].fillna('Black')
    df['Soil Color'] = le_soil.fit_transform(df['Soil Color'])
    print(f"✅ Soil types: {list(le_soil.classes_)}")
else:
    df['Soil Color'] = 0
    le_soil.classes_ = ['Black']

df['Crop Type'] = le_crop.fit_transform(df['Crop Type'])
df['Fertilizer'] = le_fertilizer.fit_transform(df['Fertilizer'])
print(f"✅ Fertilizer classes: {list(le_fertilizer.classes_)}")
print(f"✅ Crop classes: {list(le_crop.classes_)}")

# -------------------------------------------------------
# 3. Features & Target
# -------------------------------------------------------
X = df[['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'District', 'Soil Color', 'Crop Type']]
y = df['Fertilizer']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"\n🔀 Train size: {len(X_train)}, Test size: {len(X_test)}")

# -------------------------------------------------------
# 4. Train Model (Improved)
# -------------------------------------------------------
print("\n🚀 Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# -------------------------------------------------------
# 5. Evaluate
# -------------------------------------------------------
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Model Accuracy: {acc * 100:.2f}%")
print("\n📈 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le_fertilizer.classes_))

# -------------------------------------------------------
# 6. Save
# -------------------------------------------------------
pickle.dump(model,        open('model.pkl', 'wb'))
pickle.dump(le_district,  open('le_district.pkl', 'wb'))
pickle.dump(le_soil,      open('le_soil.pkl', 'wb'))
pickle.dump(le_crop,      open('le_crop.pkl', 'wb'))
pickle.dump(le_fertilizer,open('le_fertilizer.pkl', 'wb'))

print("\n✅ All models and encoders saved successfully!")
print(f"   Fertilizers supported: {list(le_fertilizer.classes_)}")
print(f"   Crops supported:       {list(le_crop.classes_)}")
print(f"   Districts supported:   {list(le_district.classes_)}")
print("=" * 60)