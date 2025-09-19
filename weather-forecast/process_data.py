# process_data.py

import pandas as pd

try:
    # Load the two datasets you provided
    conditions_df = pd.read_csv('historical_conditions_2024.csv')
    rainfall_df = pd.read_csv('extracted_rainfall_2024.csv')

    print("Loaded original CSV files...")

    # Convert date columns to the correct format for merging
    conditions_df['date'] = pd.to_datetime(conditions_df['date'])
    rainfall_df['date'] = pd.to_datetime(rainfall_df['date'])

    # Merge the two files into one dataframe
    merged_df = pd.merge(conditions_df, rainfall_df, on='date')
    print("Merged the two datasets...")

    # Create the 'irrigation_needed' target column based on our rule
    # Rule: Irrigation is needed (1) if rainfall is < 1mm AND max temp is > 32°C.
    merged_df['irrigation_needed'] = ((merged_df['rainfall_mm'] < 1) & (merged_df['max_temp_c'] > 32)).astype(int)
    print("Created the 'irrigation_needed' target column...")
    
    # Save the final, complete dataset to a new CSV file
    final_csv_path = 'sangli_training_data_2024.csv'
    merged_df.to_csv(final_csv_path, index=False)

    print(f"\nSUCCESS! ✨")
    print(f"Your new training data has been saved as '{final_csv_path}'")

except FileNotFoundError:
    print("\nERROR: Make sure 'historical_conditions_2024.csv' and 'extracted_rainfall_2024.csv' are in the same folder.")
except Exception as e:
    print(f"An error occurred: {e}")