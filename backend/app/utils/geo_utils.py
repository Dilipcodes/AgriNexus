"""
AgriNexus / FarmAI - Geospatial Utilities

Provides reusable Haversine distance calculations and nearest APMC market matching.
"""

import math
from typing import List, Dict, Any, Tuple, Optional

# Earth's mean radius in kilometers
EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    
    Args:
        lat1: Latitude of point 1 in decimal degrees
        lon1: Longitude of point 1 in decimal degrees
        lat2: Latitude of point 2 in decimal degrees
        lon2: Longitude of point 2 in decimal degrees
        
    Returns:
        Distance in kilometers (float)
    """
    # Convert decimal degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine formula
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_KM * c


def rank_mandis_by_proximity(
    farmer_lat: float,
    farmer_lng: float,
    mandis: List[Dict[str, Any]],
    filter_district: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Rank candidate mandis by proximity to the farmer's coordinates.
    Optionally prioritize or filter by district.
    
    Returns a list of candidate mandis with an added `distance_km` (float) and `distance_str` (str).
    """
    ranked = []
    for mandi in mandis:
        m_lat = mandi.get("latitude")
        m_lng = mandi.get("longitude")
        if m_lat is None or m_lng is None:
            continue
        
        dist_km = haversine_distance(farmer_lat, farmer_lng, m_lat, m_lng)
        item = dict(mandi)
        item["distance_km"] = round(dist_km, 2)
        item["distance_str"] = f"{dist_km:.1f} km"
        ranked.append(item)

    # If district filter is provided, we can either filter or prioritize same district
    if filter_district:
        same_district = [m for m in ranked if m.get("district", "").lower() == filter_district.lower()]
        other_districts = [m for m in ranked if m.get("district", "").lower() != filter_district.lower()]
        same_district.sort(key=lambda x: x["distance_km"])
        other_districts.sort(key=lambda x: x["distance_km"])
        return same_district + other_districts

    ranked.sort(key=lambda x: x["distance_km"])
    return ranked
