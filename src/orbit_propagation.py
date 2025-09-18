from poliastro.twobody import Orbit 
from astropy import units as u 
from astropy.time import Time 
from poliastro.bodies import Earth 
from poliastro.twobody.propagation import propagate 
import requests
import os
import json
from datetime import datetime, timedelta

# Celestrak API URLs
CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php"

# Categories of space objects to track
SATELLITE_CATEGORIES = {
    "active": "active",
    "starlink": "starlink",
    "stations": "stations",
    "visual": "visual",
    "weather": "weather",
    "noaa": "noaa",
    "goes": "goes",
    "resource": "resource",
    "sarsat": "sarsat",
    "dmc": "dmc",
    "tdrss": "tdrss",
    "argos": "argos",
    "planet": "planet",
    "spire": "spire"
}

DEBRIS_CATEGORIES = {
    "last-30-days": "last-30-days",
    "debris": "debris",
    "iridium-33-debris": "iridium-33-debris",
    "cosmos-2251-debris": "cosmos-2251-debris",
    "fengyun-1c-debris": "fengyun-1c-debris"
}

# Function to fetch TLE data from Celestrak
def fetch_celestrak_tle(category, format_type="tle"):
    """Fetch TLE data from Celestrak for a specific category
    
    Args:
        category (str): Category of space objects to fetch
        format_type (str): Format of the data (tle, json, csv, etc.)
        
    Returns:
        str or dict: TLE data in the requested format
    """
    params = {"GROUP": category, "FORMAT": format_type}
    
    try:
        response = requests.get(CELESTRAK_URL, params=params)
        response.raise_for_status()
        
        if format_type == "json":
            return response.json()
        else:
            return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching TLE data: {e}")
        return None

# Function to save TLE data to a file
def save_tle_data(data, filename):
    """Save TLE data to a file
    
    Args:
        data (str): TLE data to save
        filename (str): Name of the file to save the data to
    """
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        f.write(data)
    
    print(f"TLE data saved to {filename}")

# Function to check if TLE data needs to be updated
def needs_update(filename, update_interval_hours=24):
    """Check if TLE data needs to be updated
    
    Args:
        filename (str): Name of the file to check
        update_interval_hours (int): Update interval in hours
        
    Returns:
        bool: True if the file needs to be updated, False otherwise
    """
    if not os.path.exists(filename):
        return True
    
    file_time = datetime.fromtimestamp(os.path.getmtime(filename))
    current_time = datetime.now()
    
    return (current_time - file_time) > timedelta(hours=update_interval_hours)

# Function to parse TLE data into satellite objects
def parse_tle_data(tle_data):
    """Parse TLE data into satellite objects
    
    Args:
        tle_data (str): TLE data to parse
        
    Returns:
        list: List of satellite dictionaries
    """
    satellites = []
    lines = tle_data.strip().split('\n')
    
    # Process three lines at a time (name, line1, line2)
    for i in range(0, len(lines), 3):
        if i + 2 < len(lines):
            name = lines[i].strip()
            line1 = lines[i + 1].strip()
            line2 = lines[i + 2].strip()
            
            # Extract basic information from TLE
            try:
                # Satellite catalog number
                norad_id = line1[2:7].strip()
                
                # International designator
                int_designator = line1[9:17].strip()
                
                # Epoch (year and day)
                epoch_year = int(line1[18:20])
                epoch_year = epoch_year + 2000 if epoch_year < 57 else epoch_year + 1900
                epoch_day = float(line1[20:32])
                
                # Calculate epoch date
                epoch_date = datetime(epoch_year, 1, 1) + timedelta(days=epoch_day - 1)
                
                # Mean motion (revolutions per day)
                mean_motion = float(line2[52:63])
                
                # Orbital period in minutes
                period_minutes = 1440.0 / mean_motion if mean_motion > 0 else 0
                
                # Eccentricity
                eccentricity = float("0." + line2[26:33])
                
                # Inclination (degrees)
                inclination = float(line2[8:16])
                
                # Determine object type (satellite or debris)
                # This is a simple heuristic - in reality, you'd need a more sophisticated method
                is_debris = any(debris_cat in name.lower() for debris_cat in ["deb", "debris", "r/b", "rocket"])
                
                # Calculate approximate altitude (km)
                # Using simplified calculation based on mean motion
                semi_major_axis = (8681663.0 / (mean_motion * 2 * 3.14159 / 86400.0) ** 2) ** (1/3)
                altitude = semi_major_axis / 1000.0 - 6371.0  # Earth radius is ~6371 km
                
                satellite = {
                    "name": name,
                    "norad_id": norad_id,
                    "int_designator": int_designator,
                    "epoch": epoch_date.isoformat(),
                    "period_minutes": period_minutes,
                    "inclination": inclination,
                    "eccentricity": eccentricity,
                    "type": "debris" if is_debris else "satellite",
                    "altitude": altitude,
                    "tle_line1": line1,
                    "tle_line2": line2
                }
                
                satellites.append(satellite)
            except Exception as e:
                print(f"Error parsing TLE data for {name}: {e}")
    
    return satellites

# Function to load TLE data from a file
def load_tle_data(filename):
    """Load TLE data from a file
    
    Args:
        filename (str): Name of the file to load the data from
        
    Returns:
        str: TLE data
    """
    if not os.path.exists(filename):
        return None
    
    with open(filename, 'r') as f:
        return f.read()

# Function to convert satellite dictionary to SpaceObject format
def to_space_object(satellite):
    """Convert satellite dictionary to SpaceObject format
    
    Args:
        satellite (dict): Satellite dictionary
        
    Returns:
        dict: SpaceObject dictionary
    """
    # Determine country from international designator
    country_codes = {
        "US": "USA",
        "CIS": "Russia",
        "PRC": "China",
        "ESA": "ESA",
        "FR": "France",
        "JP": "Japan",
        "IN": "India",
        "CA": "Canada",
        "UK": "UK"
    }
    
    # Extract launch year and number from international designator
    int_des = satellite.get("int_designator", "")
    country = "Unknown"
    
    for code, name in country_codes.items():
        if int_des and code in int_des:
            country = name
            break
    
    # Determine status based on type and other factors
    status = "active" if satellite["type"] == "satellite" else "inactive"
    
    # Determine risk level based on altitude and eccentricity
    # This is a simple heuristic - in reality, you'd need a more sophisticated method
    risk_level = "low"
    if satellite["altitude"] < 500:
        risk_level = "high"
    elif satellite["altitude"] < 800:
        risk_level = "medium"
    
    # Create SpaceObject
    space_object = {
        "id": f"SAT-{satellite['norad_id']}" if satellite["type"] == "satellite" else f"DEB-{satellite['norad_id']}",
        "name": satellite["name"],
        "type": satellite["type"],
        "country": country,
        "launchDate": satellite["epoch"].split("T")[0],  # Just the date part
        "altitude": round(satellite["altitude"], 1),
        "inclination": round(satellite["inclination"], 1),
        "period": round(satellite["period_minutes"] / 60, 1),  # Convert to hours
        "status": status,
        "riskLevel": risk_level,
        "lastUpdate": datetime.now().isoformat()
    }
    
    return space_object

# Function to fetch and update all TLE data
def update_all_tle_data(data_dir="data/tle", update_interval_hours=24):
    """Fetch and update all TLE data
    
    Args:
        data_dir (str): Directory to save the TLE data to
        update_interval_hours (int): Update interval in hours
        
    Returns:
        dict: Dictionary of updated categories and parsed objects
    """
    updated_categories = {}
    all_space_objects = []
    
    # Update satellite TLE data
    for category, value in SATELLITE_CATEGORIES.items():
        filename = f"{data_dir}/satellites/{category}.txt"
        
        if needs_update(filename, update_interval_hours):
            print(f"Updating {category} satellite TLE data...")
            tle_data = fetch_celestrak_tle(value)
            
            if tle_data:
                save_tle_data(tle_data, filename)
                updated_categories[category] = True
        
        # Parse TLE data
        tle_data = load_tle_data(filename)
        if tle_data:
            satellites = parse_tle_data(tle_data)
            for satellite in satellites:
                space_object = to_space_object(satellite)
                all_space_objects.append(space_object)
    
    # Update debris TLE data
    for category, value in DEBRIS_CATEGORIES.items():
        filename = f"{data_dir}/debris/{category}.txt"
        
        if needs_update(filename, update_interval_hours):
            print(f"Updating {category} debris TLE data...")
            tle_data = fetch_celestrak_tle(value)
            
            if tle_data:
                save_tle_data(tle_data, filename)
                updated_categories[category] = True
        
        # Parse TLE data
        tle_data = load_tle_data(filename)
        if tle_data:
            debris = parse_tle_data(tle_data)
            for debris_obj in debris:
                space_object = to_space_object(debris_obj)
                all_space_objects.append(space_object)
    
    # Save all space objects to a JSON file
    space_objects_file = f"{data_dir}/space_objects.json"
    with open(space_objects_file, 'w') as f:
        json.dump(all_space_objects, f, indent=2)
    
    print(f"Saved {len(all_space_objects)} space objects to {space_objects_file}")
    
    return {"updated": updated_categories, "space_objects": all_space_objects}

# Function to schedule daily updates
def schedule_daily_updates(data_dir="data/tle", update_hour=3):
    """Schedule daily updates of TLE data
    
    Args:
        data_dir (str): Directory to save the TLE data to
        update_hour (int): Hour of the day to update (0-23)
    """
    import schedule
    import time
    import threading
    
    def update_job():
        print(f"Running scheduled update at {datetime.now().isoformat()}")
        result = update_all_tle_data(data_dir)
        print(f"Updated {len(result['space_objects'])} space objects")
    
    # Schedule the update job
    schedule.every().day.at(f"{update_hour:02d}:00").do(update_job)
    
    # Run the scheduler in a separate thread
    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    print(f"Scheduled daily updates at {update_hour:02d}:00")
    
    # Run an initial update
    update_job()
    
    return scheduler_thread

# Function to get the latest space objects
def get_latest_space_objects(data_dir="data/tle"):
    """Get the latest space objects
    
    Args:
        data_dir (str): Directory where the space objects are stored
        
    Returns:
        list: List of space objects
    """
    space_objects_file = f"{data_dir}/space_objects.json"
    
    if not os.path.exists(space_objects_file):
        # If the file doesn't exist, run an update
        result = update_all_tle_data(data_dir)
        return result["space_objects"]
    
    with open(space_objects_file, 'r') as f:
        return json.load(f)

# Function to propagate orbit using poliastro
def propagate_orbit(tle_line1, tle_line2, time_delta):
    """Propagate orbit using poliastro
    
    Args:
        tle_line1 (str): First line of TLE
        tle_line2 (str): Second line of TLE
        time_delta (float): Time delta in days
        
    Returns:
        Orbit: Propagated orbit
    """
    from poliastro.twobody.orbit import Orbit
    from astropy import time
    
    # Create orbit from TLE
    orbit = Orbit.from_tle(tle_line1, tle_line2)
    
    # Propagate orbit
    new_orbit = orbit.propagate(time_delta * u.day)
    
    return new_orbit

# Example usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Orbital Sentinel TLE Data Manager')
    parser.add_argument('--update', action='store_true', help='Update TLE data')
    parser.add_argument('--schedule', action='store_true', help='Schedule daily updates')
    parser.add_argument('--hour', type=int, default=3, help='Hour of the day to update (0-23)')
    parser.add_argument('--data-dir', type=str, default='data/tle', help='Directory to store TLE data')
    
    args = parser.parse_args()
    
    if args.update:
        # Update all TLE data
        result = update_all_tle_data(args.data_dir)
        print(f"Updated categories: {result['updated']}")
        print(f"Total space objects: {len(result['space_objects'])}")
    elif args.schedule:
        # Schedule daily updates
        scheduler_thread = schedule_daily_updates(args.data_dir, args.hour)
        
        try:
            # Keep the main thread alive
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Stopping scheduler...")
    else:
        # Just print the latest space objects
        space_objects = get_latest_space_objects(args.data_dir)
        print(f"Total space objects: {len(space_objects)}")
        
        # Print a sample of space objects
        print("\nSample space objects:")
        for i, obj in enumerate(space_objects[:5]):
            print(f"{i+1}. {obj['name']} ({obj['type']}) - Altitude: {obj['altitude']} km, Risk: {obj['riskLevel']}")
        
        # Example of using poliastro with TLE data
        # orbit = Orbit.circular(Earth, 700 * u.km)
        # print(orbit)