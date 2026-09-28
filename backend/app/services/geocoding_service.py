"""
AgriNexus / FarmAI - Nominatim Reverse Geocoding Service

Complies with OpenStreetMap Nominatim Usage Policy:
- Custom, identifiable User-Agent
- Minimum 1.0 second throttle between requests
- In-memory coordinate cache
- Clear OpenStreetMap attribution
- Fallback to benchmark on timeout or in DEMO mode
"""

import time
import httpx
from typing import Dict, Any, Optional
from app.models.schemas import Provenance

# In-memory coordinate cache: key = f"{round(lat, 3)},{round(lng, 3)}"
_GEO_CACHE: Dict[str, Dict[str, Any]] = {}
_LAST_REQUEST_TIME = 0.0
USER_AGENT = "AgriNexus-Hackathon-App/1.0 (contact: student-demo@agrinexus.local)"

DEFAULT_LOCATION = {
    "name": "Gorakhpur, Uttar Pradesh",
    "village": "Pipraich Block",
    "district": "Gorakhpur",
    "state": "Uttar Pradesh",
    "provenance": Provenance(
        factor="location",
        source="Demonstration Farm Boundary (Gorakhpur Reference)",
        timestamp_or_period="2026-09-19",
        geographic_scope="Gorakhpur (26.7500, 83.3700)",
        status="demo",
        methodology_note="Reference benchmark location from UI design specification."
    )
}

async def reverse_geocode(lat: float, lng: float, mode: str = "DEMO") -> Dict[str, Any]:
    """
    Reverse geocodes coordinates to village/district/state with strict OSM policy compliance.
    """
    global _LAST_REQUEST_TIME

    if mode == "DEMO":
        return DEFAULT_LOCATION

    cache_key = f"{round(lat, 3)},{round(lng, 3)}"
    if cache_key in _GEO_CACHE:
        return _GEO_CACHE[cache_key]

    # Enforce 1-second rate limit
    now = time.time()
    elapsed = now - _LAST_REQUEST_TIME
    if elapsed < 1.0:
        import asyncio
        await asyncio.sleep(1.0 - elapsed)

    try:
        headers = {"User-Agent": USER_AGENT}
        url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lng}"
        
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, headers=headers)
            _LAST_REQUEST_TIME = time.time()

            if resp.status_code == 200:
                data = resp.json()
                addr = data.get("address", {})
                district = addr.get("state_district") or addr.get("county") or addr.get("city") or "Gorakhpur"
                state = addr.get("state", "Uttar Pradesh")
                village = addr.get("village") or addr.get("suburb") or addr.get("town") or "Rural Field"
                display_name = f"{district}, {state}"

                result = {
                    "name": display_name,
                    "village": village,
                    "district": district,
                    "state": state,
                    "attribution": "Data © OpenStreetMap contributors",
                    "provenance": Provenance(
                        factor="location",
                        source="OpenStreetMap Nominatim Reverse Geocoder",
                        timestamp_or_period="Live Query",
                        geographic_scope=f"Lat: {lat:.4f}, Lng: {lng:.4f}",
                        status="live",
                        methodology_note="Live administrative boundary lookup via OpenStreetMap Nominatim with strict rate limiting."
                    )
                }
                _GEO_CACHE[cache_key] = result
                return result
    except Exception:
        pass # Fallback gracefully on any failure

    return DEFAULT_LOCATION
