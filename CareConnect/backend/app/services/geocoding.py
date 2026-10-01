"""
Real geocoding via OpenStreetMap's Nominatim API.

No API key needed, but Nominatim's usage policy requires:
  - A descriptive User-Agent identifying the application
  - No more than ~1 request/second (this app's request volume is
    low enough that this isn't a practical concern for a student
    project, but don't loop this in a tight batch job without adding
    a delay)

Docs: https://nominatim.org/release-docs/latest/api/Search/
"""

import os
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

GEOCODE_MAPS_API_KEY = os.getenv("GEOCODE_MAPS_API_KEY")

MANUAL_FALLBACKS = {
    "mayiladuthurai": (11.1024, 79.6524),
    "tiruvannamalai": (12.2260, 79.0747),
    "madurai": (9.9252, 78.1198),
    "salem": (11.6643, 78.1460),
    "coimbatore": (11.0168, 76.9558),
    "chennai": (13.0827, 80.2707),
    "vellore": (12.9165, 79.1325),
    "trichy": (10.7905, 78.7047),
    "tirunelveli": (8.7139, 77.7567),
}

HEADERS = {
    # Nominatim will block requests without a real identifying
    # User-Agent. Replace the contact with your own if you want to be
    # extra polite to the free public instance.
    "User-Agent": "BloodLinkAI/1.0 (student project; contact: example@example.com)"
}


def manual_fallback(query_text: str):
    normalized = query_text.strip().lower()
    for key, coords in MANUAL_FALLBACKS.items():
        if key in normalized:
            return coords
    return None


def geocode_location(query: str):
    """
    Takes a free-text location (e.g. "Meridian Hospitals, Kochi" or
    just "Kochi") and returns (latitude, longitude) as floats, or
    None if it couldn't be geocoded.
    """

    if not query or not query.strip():
        return None

    params = {
        "q": query.strip(),
        "format": "json",
        "limit": 1,
        "countrycodes": "in",
        "email": "example@example.com",
    }

    def parse_nominatim(response):
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
        return None

    def fallback_service(query_text):
        if GEOCODE_MAPS_API_KEY:
            fallback_url = "https://geocode.maps.co/search"
            fallback_params = {
                "q": query_text.strip(),
                "format": "json",
                "limit": 1,
                "api_key": GEOCODE_MAPS_API_KEY,
            }
            try:
                resp = requests.get(fallback_url, params=fallback_params, headers=HEADERS, timeout=5)
                if resp.ok:
                    data = resp.json()
                    if data:
                        return float(data[0]["lat"]), float(data[0]["lon"])
            except Exception:
                pass
        return manual_fallback(query_text)

    try:
        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=HEADERS,
            timeout=5
        )

        if response.status_code == 403 or response.status_code == 429:
            return fallback_service(query)

        response.raise_for_status()
        coords = parse_nominatim(response)
        if coords:
            return coords

        # If the first lookup fails, try a more explicit India-bound query.
        fallback_queries = [
            f"{query.strip()}, India",
        ]
        if "india" not in query.lower():
            fallback_queries.append(f"{query.strip()}, Tamil Nadu, India")

        for fallback_query in fallback_queries:
            params["q"] = fallback_query
            response = requests.get(
                NOMINATIM_URL,
                params=params,
                headers=HEADERS,
                timeout=5
            )

            if response.status_code == 403 or response.status_code == 429:
                return fallback_service(fallback_query)

            response.raise_for_status()
            coords = parse_nominatim(response)
            if coords:
                return coords

        coords = fallback_service(query)
        if coords:
            return coords

        return manual_fallback(query)
    except Exception:
        return fallback_service(query)
