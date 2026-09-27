from datetime import datetime, timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Trip
from .serializers import TripInputSerializer, TripSerializer
from routing.service import RoutingError, plan_route, suggest_places
from hos.engine import simulate_trip
from hos.daily_logs import build_daily_logs


@api_view(['POST'])
def plan_trip(request):
    """
    POST /api/trips/plan/
    Body: TripInputSerializer fields.
    Returns: persisted Trip with route, events, daily_logs.
    """
    serializer = TripInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    start_time = data.get('trip_start_time') or datetime.now(tz=timezone.utc)

    # 1. Geocode + route the trip (current -> pickup -> dropoff)
    try:
        route = plan_route(
            data['current_location'],
            data['pickup_location'],
            data['dropoff_location'],
        )
    except RoutingError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Run HOS simulation
    sim = simulate_trip(
        leg1_miles=route['leg1_miles'],
        leg1_duration_min=route['leg1_duration_min'],
        leg2_miles=route['leg2_miles'],
        leg2_duration_min=route['leg2_duration_min'],
        start_time=start_time,
        current_cycle_used_hours=data['current_cycle_used_hours'],
        pickup_location=data['pickup_location'],
        dropoff_location=data['dropoff_location'],
        current_location=data['current_location'],
    )

    # 3. Build per-day RODS logs
    daily_logs = build_daily_logs(sim['events'])

    # 4. Persist
    trip = Trip.objects.create(
        current_location=data['current_location'],
        pickup_location=data['pickup_location'],
        dropoff_location=data['dropoff_location'],
        current_cycle_used_hours=data['current_cycle_used_hours'],
        trip_start_time=start_time,
        driver_name=data.get('driver_name', ''),
        co_driver_name=data.get('co_driver_name', ''),
        carrier_name=data.get('carrier_name', ''),
        main_office_address=data.get('main_office_address', ''),
        truck_number=data.get('truck_number', ''),
        trailer_number=data.get('trailer_number', ''),
        total_distance_miles=route['total_miles'],
        total_duration_minutes=route['total_duration_min'],
        route_geometry=route['geometry'],
        events=sim['events'],
        daily_logs=daily_logs,
        coords=route['coords'],
    )

    return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_trip(request, trip_id):
    try:
        trip = Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(TripSerializer(trip).data)


@api_view(['GET'])
def suggest_places_view(request):
    """GET /api/places/suggest/?q=new+york"""
    q = (request.query_params.get('q') or '').strip()
    if len(q) < 2:
        return Response({'results': []})

    try:
        results = suggest_places(q, limit=6)
    except RoutingError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'results': results})


@api_view(['GET'])
def list_trips(request):
    trips = Trip.objects.all()[:50]
    return Response(TripSerializer(trips, many=True).data)
