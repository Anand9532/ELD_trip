"""
Routing service using free open infrastructure:
- Nominatim for geocoding
- OSRM public demo for routing

Notes:
- Public demos have usage limits / etiquette. For production use, self-host or use a paid provider.
- All distances are returned in MILES, durations in MINUTES.
"""
import time
import requests
from django.conf import settings


class RoutingError(Exception):
    pass


_METERS_PER_MILE = 1609.344


def _nominatim_headers():
    return {'User-Agent': settings.NOMINATIM_USER_AGENT}


def geocode(query: str):
    """Return (lng, lat, display_name) for a textual location."""
    results = suggest_places(query, limit=1)
    if not results:
        raise RoutingError(f'Could not geocode location: "{query}"')
    first = results[0]
    return first['lng'], first['lat'], first['display_name']


def suggest_places(query: str, limit: int = 6):
    """Return place suggestions for autocomplete."""
    if not query or not query.strip():
        return []

    url = f'{settings.NOMINATIM_BASE_URL}/search'
    params = {
        'q': query.strip(),
        'format': 'json',
        'limit': min(max(limit, 1), 10),
        'addressdetails': 0,
        'countrycodes': 'us',
    }
    try:
        resp = requests.get(url, params=params, headers=_nominatim_headers(), timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingError(f'Place search failed: {exc}') from exc

    data = resp.json()
    return [
        {
            'display_name': item.get('display_name', ''),
            'lng': float(item['lon']),
            'lat': float(item['lat']),
        }
        for item in data
        if item.get('display_name')
    ]


def osrm_route(coords):
    """
    coords: list of (lng, lat) tuples in order.
    Returns dict: distance_miles, duration_min, geometry (GeoJSON LineString), legs.
    """
    coord_str = ';'.join(f'{lng},{lat}' for lng, lat in coords)
    url = f'{settings.OSRM_BASE_URL}/route/v1/driving/{coord_str}'
    params = {
        'overview': 'full',
        'geometries': 'geojson',
        'steps': 'false',
    }
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingError(f'Routing failed: {exc}') from exc

    data = resp.json()
    if data.get('code') != 'Ok' or not data.get('routes'):
        raise RoutingError(f'OSRM error: {data.get("code")} {data.get("message", "")}')

    route = data['routes'][0]
    legs = route.get('legs', [])

    return {
        'distance_miles': route['distance'] / _METERS_PER_MILE,
        'duration_min': route['duration'] / 60.0,
        'geometry': route['geometry'],
        'legs': [
            {
                'distance_miles': leg['distance'] / _METERS_PER_MILE,
                'duration_min': leg['duration'] / 60.0,
            }
            for leg in legs
        ],
    }


def plan_route(current_loc: str, pickup_loc: str, dropoff_loc: str):
    """Geocode three locations and route current -> pickup -> dropoff."""
    cur_lng, cur_lat, _ = geocode(current_loc)
    # Light delay to respect Nominatim policy (1 req/sec)
    time.sleep(1)
    pu_lng, pu_lat, _ = geocode(pickup_loc)
    time.sleep(1)
    do_lng, do_lat, _ = geocode(dropoff_loc)

    route = osrm_route([(cur_lng, cur_lat), (pu_lng, pu_lat), (do_lng, do_lat)])

    if len(route['legs']) < 2:
        raise RoutingError('Routing did not return two legs as expected')

    leg1 = route['legs'][0]
    leg2 = route['legs'][1]

    return {
        'total_miles': route['distance_miles'],
        'total_duration_min': route['duration_min'],
        'leg1_miles': leg1['distance_miles'],
        'leg1_duration_min': leg1['duration_min'],
        'leg2_miles': leg2['distance_miles'],
        'leg2_duration_min': leg2['duration_min'],
        'geometry': route['geometry'],
        'coords': {
            'current': [cur_lng, cur_lat],
            'pickup': [pu_lng, pu_lat],
            'dropoff': [do_lng, do_lat],
        },
    }
