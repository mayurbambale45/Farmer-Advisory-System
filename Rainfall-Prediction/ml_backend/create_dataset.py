import pandas as pd

# --- Configuration ---
RAINFALL_FILE = 'data/extracted_rainfall_2024.csv'
CONDITIONS_FILE = 'data/historical_conditions_2024.csv'
FINAL_DATASET_FILE = 'data/final_training_dataset.csv'

def merge_datasets():
    """
    Merges the rainfall data with the weather conditions data to create
    the final, complete dataset for model training.
    """
    print("--- Starting Dataset Merge Process ---")
    try:
        print(f"Loading rainfall data from {RAINFALL_FILE}...")
        df_rain = pd.read_csv(RAINFALL_FILE)

        print(f"Loading conditions data from {CONDITIONS_FILE}...")
        df_conditions = pd.read_csv(CONDITIONS_FILE)

        print("Merging the two datasets on the 'date' column...")
        final_df = pd.merge(df_rain, df_conditions, on='date')

        final_df.to_csv(FINAL_DATASET_FILE, index=False)

        print(f"✅ Success! Final training dataset saved to '{FINAL_DATASET_FILE}'")
        print("\n--- Preview of the Final Dataset ---")
        print(final_df.head())
        print("------------------------------------")

    except FileNotFoundError as e:
        print(f"❌ Error: A file was not found. Details: {e}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    merge_datasets()