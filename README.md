# orbital-sentinel-ui-main

## Orbit Propagation and Space Object Tracking

The core orbit propagation and space object tracking logic is in [`src/orbit_propagation.py`](src/orbit_propagation.py). This script provides functionality to:

- Fetch real-time satellite and debris data from Celestrak API
- Parse TLE (Two-Line Element) data for satellites and debris
- Calculate orbital parameters and risk levels
- Automatically schedule daily updates of space object data
- Propagate orbits using the poliastro library

### Data Sources

- Celestrak API for real-time TLE data
- Space-Track.org data integration
- NORAD TLE catalog

### Usage

Run the script with various options:

```bash
# Display current space objects
python src/orbit_propagation.py

# Update TLE data manually
python src/orbit_propagation.py --update

# Schedule daily updates (default at 3:00 AM)
python src/orbit_propagation.py --schedule

# Schedule updates at a specific hour (e.g., 5:00 AM)
python src/orbit_propagation.py --schedule --hour 5

# Specify a custom data directory
python src/orbit_propagation.py --data-dir "custom/data/path"
```"# Orbital-Gardiuan" 
"# Orbital-Guardian" 
