import pandas as pd

# --- Configuration ---
# The name of the hourly data file you download from Open-Meteo
HOURLY_DATA_FILE = 'data/open_meteo_hourly_2024.csv' 
# The final, clean daily data file we will create
OUTPUT_DAILY_FILE = 'data/historical_conditions_2024.csv'

def convert_hourly_to_daily():
    """
    Reads a CSV file with hourly weather data and aggregates it into a
    daily summary (min/max temps, mean humidity/wind) for model training.
    """
    print("--- Starting Hourly to Daily Data Conversion ---")
    try:
        # 1. Load the hourly data CSV
        # We skip the first few rows of the Open-Meteo file which are header info.
        print(f"Loading hourly data from {HOURLY_DATA_FILE}...")
        df = pd.read_csv(HOURLY_DATA_FILE, skiprows=3)

        # 2. Convert the 'time' column to datetime objects
        df['time'] = pd.to_datetime(df['time'])
        
        # 3. Set the 'time' column as the index for resampling
        df.set_index('time', inplace=True)

        # 4. Resample the data to a daily ('D') frequency
        # This is the key step. We group the hourly data by day.
        print("Aggregating hourly data into daily summaries...")
        daily_df = df.resample('D').agg({
            'temperature_2m (°C)': ['max', 'min'],
            'relativehumidity_2m (%)': 'mean',
            'windspeed_10m (km/h)': 'mean'
        })

        # 5. Clean up the column names
        daily_df.columns = ['max_temp_c', 'min_temp_c', 'humidity_percent', 'wind_speed_kmh']
        
        # Round the values to make them clean
        daily_df = daily_df.round(2)

        # 6. Reset the index to turn the date back into a column
        daily_df.reset_index(inplace=True)
        daily_df.rename(columns={'time': 'date'}, inplace=True)
        daily_df['date'] = pd.to_datetime(daily_df['date']).dt.date
        
        # 7. Save the final daily data to a new CSV
        daily_df.to_csv(OUTPUT_DAILY_FILE, index=False)
        
        print(f"✅ Success! Daily conditions data saved to '{OUTPUT_DAILY_FILE}'")
        print("\n--- Preview of the Final Daily Data ---")
        print(daily_df.head())
        print("---------------------------------------")

    except FileNotFoundError:
        print(f"❌ Error: The file '{HOURLY_DATA_FILE}' was not found. Please download it from Open-Meteo and place it in the 'data' folder.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")


if __name__ == "__main__":
    convert_hourly_to_daily()
