
import pandas as pd
import requests
import time
import numpy as np

def geocode_clinic(clinic_name, address, api_key):
    """
    Geocode a clinic using both name and address for better accuracy
    Returns: (latitude, longitude, formatted_address, place_id, success)
    """
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    
    # Combine clinic name and address for better geocoding results
    full_query = f"{clinic_name}, {address}"
    
    params = {
        'address': full_query,
        'key': api_key
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        
        if data['status'] == 'OK' and len(data['results']) > 0:
            result = data['results'][0]
            location = result['geometry']['location']
            formatted_address = result['formatted_address']
            place_id = result.get('place_id', None)
            
            return location['lat'], location['lng'], formatted_address, place_id, True
        else:
            print(f"Primary geocoding failed for: {clinic_name}")
            print(f"Status: {data['status']}")
            
            # Fallback: Try with just the address if the combined query fails
            print("Trying fallback with address only...")
            return geocode_address_only(address, api_key)
            
    except requests.exceptions.RequestException as e:
        print(f"Request error for: {clinic_name} - Error: {e}")
        return None, None, None, None, False
    except Exception as e:
        print(f"Unexpected error for: {clinic_name} - Error: {e}")
        return None, None, None, None, False

def geocode_address_only(address, api_key):
    """
    Fallback function to geocode using only the address
    """
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        
        if data['status'] == 'OK' and len(data['results']) > 0:
            result = data['results'][0]
            location = result['geometry']['location']
            formatted_address = result['formatted_address']
            place_id = result.get('place_id', None)
            
            print("✓ Fallback geocoding successful")
            return location['lat'], location['lng'], formatted_address, place_id, True
        else:
            print(f"✗ Fallback also failed - Status: {data['status']}")
            return None, None, None, None, False
            
    except Exception as e:
        print(f"✗ Fallback error: {e}")
        return None, None, None, None, False

def generate_google_maps_links(lat, lng, place_id=None, clinic_name=None):
    """Generate Google Maps link formats for location details"""
    links = {}
    
    if lat is not None and lng is not None:
        # Option 1: Coordinate-based search (shows location details)
        links['coordinate_search'] = f"https://www.google.com/maps/search/{lat},{lng}"
        
        # Option 2: Place ID link (most reliable if available)
        if place_id:
            links['place_id'] = f"https://www.google.com/maps/place/?q=place_id:{place_id}"
    
    return links

def process_clinic_addresses(csv_file_path, api_key, output_file_path=None):
    """
    Process the clinic CSV file and geocode addresses
    """
    # Read the CSV file
    print("Loading CSV file...")
    df = pd.read_csv(csv_file_path)
    
    print(f"Loaded {len(df)} records")
    print("Columns found:", df.columns.tolist())
    
    # Initialize new columns if they don't exist
    if 'new lat' not in df.columns:
        df['new lat'] = None
    if 'new lng' not in df.columns:
        df['new lng'] = None
    if 'place_id' not in df.columns:
        df['place_id'] = None
    
    # Counter for successful geocoding
    successful_geocodes = 0
    failed_geocodes = 0
    
    # Process each row
    for index, row in df.iterrows():
        # Get the clinic name and full address
        clinic_name = row['name']
        full_address = row['Full Address']
        
        print(f"\nProcessing {index + 1}/{len(df)}: {clinic_name}")
        print(f"Address: {full_address}")
        
        # Skip if either name or address is empty or NaN
        if (pd.isna(clinic_name) or str(clinic_name).strip() == '' or 
            pd.isna(full_address) or str(full_address).strip() == ''):
            print("Skipping - empty name or address")
            failed_geocodes += 1
            continue
        
        # Geocode using both clinic name and address
        lat, lng, formatted_address, place_id, success = geocode_clinic(clinic_name, full_address, api_key)
        
        if success:
            # Update the DataFrame
            df.at[index, 'new lat'] = lat
            df.at[index, 'new lng'] = lng
            df.at[index, 'place_id'] = place_id
            
            if place_id:
                print(f"✓ Success with Place ID: ({lat:.6f}, {lng:.6f})")
            else:
                print(f"✓ Success with coordinates: ({lat:.6f}, {lng:.6f})")
            
            print(f"  Google result: {formatted_address[:80]}{'...' if len(formatted_address) > 80 else ''}")
            successful_geocodes += 1
        else:
            print("✗ Failed to geocode")
            failed_geocodes += 1
        
        # Rate limiting - Google allows 50 requests per second
        # Using a more conservative 1 request every 0.1 seconds (10 per second)
        time.sleep(0.1)
        
        # Progress update every 10 records
        if (index + 1) % 10 == 0:
            print(f"\n--- Progress: {index + 1}/{len(df)} completed ---")
            print(f"Successful: {successful_geocodes}, Failed: {failed_geocodes}")
    
    # Summary
    print(f"\n=== FINAL SUMMARY ===")
    print(f"Total records processed: {len(df)}")
    print(f"Successful geocodes: {successful_geocodes}")
    print(f"Failed geocodes: {failed_geocodes}")
    print(f"Success rate: {(successful_geocodes/len(df)*100):.1f}%")
    
    # Save the results
    if output_file_path is None:
        output_file_path = csv_file_path.replace('.csv', '_with_geocoding.csv')
    
    df.to_csv(output_file_path, index=False)
    print(f"\nResults saved to: {output_file_path}")
    
    return df

# Additional utility functions
def validate_coordinates(df):
    """Validate the geocoded coordinates are reasonable for Malaysia"""
    malaysia_bounds = {
        'lat_min': 0.85,   # Southern tip of Malaysia
        'lat_max': 7.36,   # Northern tip of Malaysia
        'lng_min': 99.64,  # Western edge of Malaysia
        'lng_max': 119.27  # Eastern edge of Malaysia
    }
    
    valid_coords = 0
    invalid_coords = 0
    
    for index, row in df.iterrows():
        lat = pd.to_numeric(row['new lat'], errors='coerce')
        lng = pd.to_numeric(row['new lng'], errors='coerce')
        
        if pd.notna(lat) and pd.notna(lng):
            if (malaysia_bounds['lat_min'] <= lat <= malaysia_bounds['lat_max'] and 
                malaysia_bounds['lng_min'] <= lng <= malaysia_bounds['lng_max']):
                valid_coords += 1
            else:
                invalid_coords += 1
                print(f"⚠️  Coordinates outside Malaysia bounds: {row['name']} ({lat:.6f}, {lng:.6f})")
    
    print(f"\nCoordinate validation:")
    print(f"Valid coordinates (within Malaysia): {valid_coords}")
    print(f"Invalid coordinates (outside Malaysia): {invalid_coords}")
    
    return df

# Example usage
if __name__ == "__main__":
    # Configuration
    API_KEY = "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" # Replace with your actual API key
    INPUT_CSV = "input_file.csv"  # Replace with your CSV file path
    OUTPUT_CSV = "output_file.csv"  # Output file name
    
    # Process the file
    try:
        result_df = process_clinic_addresses(INPUT_CSV, API_KEY, OUTPUT_CSV)
        print("\n✓ Processing completed successfully!")
        
        # Display sample results
        print("\nSample of geocoded results:")
        sample_cols = ['name', 'Full Address', 'new lat', 'new lng', 'place_id']
        available_cols = [col for col in sample_cols if col in result_df.columns]
        print(result_df[available_cols].head(3).to_string(index=False))
        
        # Validate coordinates are within Malaysia bounds
        validate_coordinates(result_df)
        
        # Show statistics about Place IDs
        place_id_count = result_df['place_id'].notna().sum()
        total_successful = result_df['new lat'].notna().sum()
        
        print(f"\nGeocoding Statistics:")
        print(f"Total successful geocodes: {total_successful}/{len(result_df)}")
        print(f"Records with Place ID: {place_id_count}/{total_successful}")
        print(f"Records with coordinates only: {total_successful - place_id_count}/{total_successful}")
        
    except FileNotFoundError:
        print(f"Error: Could not find the input CSV file '{INPUT_CSV}'")
        print("Please check the file path and try again.")
    except Exception as e:
        print(f"An error occurred: {e}")