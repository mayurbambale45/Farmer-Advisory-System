import xarray as xr
import pandas as pd

# --- Configuration: Set your target location and file names ---
NETCDF_FILE_PATH = 'data/RF25_ind2024_rfp25.nc' 
TARGET_LATITUDE = 16.85
TARGET_LONGITUDE = 74.58
OUTPUT_CSV_PATH = 'data/extracted_rainfall_2024.csv'

def extract_data_from_netcdf(nc_file, lat, lon, output_csv):
    """
    Reads a gridded NetCDF rainfall file, extracts data for a specific
    latitude and longitude, and saves it to a clean CSV file.
    """
    print(f"--- Starting NetCDF Processing for {nc_file} ---")

    try:
        print("Opening NetCDF file...")
        dataset = xr.open_dataset(nc_file)
        
        print("\n--- Dataset Structure ---")
        print(dataset)
        print("-------------------------\n")

        print(f"Extracting data for coordinates: Lat={lat}, Lon={lon}")
        location_data = dataset.sel(lat=lat, lon=lon, method='nearest')

        df = location_data.to_dataframe()
        df.reset_index(inplace=True)

        # --- FINAL CORRECTION ---
        # The 'Data variables' output showed the rainfall data is named 'rf'.
        # We will now use 'rf' directly in the rename command.
        df.rename(columns={'time': 'date', 'rf': 'rainfall_mm'}, inplace=True)
        
        # This line will now work because the column was renamed successfully.
        final_df = df[['date', 'rainfall_mm']]
        final_df['date'] = pd.to_datetime(final_df['date']).dt.date

        final_df.to_csv(output_csv, index=False)
        print(f"✅ Success! Clean data has been saved to '{output_csv}'")
        print("\n--- Preview of the Extracted Data ---")
        print(final_df.head())
        print("------------------------------------")

    except FileNotFoundError:
        print(f"❌ Error: The file '{nc_file}' was not found. Make sure it's in the 'data' folder.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    extract_data_from_netcdf(NETCDF_FILE_PATH, TARGET_LATITUDE, TARGET_LONGITUDE, OUTPUT_CSV_PATH)


