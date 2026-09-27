from rest_framework import serializers
from .models import Trip


class TripInputSerializer(serializers.Serializer):
    """Incoming trip plan request."""
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_used_hours = serializers.FloatField(min_value=0, max_value=70)
    trip_start_time = serializers.DateTimeField(required=False)

    driver_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    co_driver_name = serializers.CharField(required=False, allow_blank=True, max_length=120)
    carrier_name = serializers.CharField(required=False, allow_blank=True, max_length=200)
    main_office_address = serializers.CharField(required=False, allow_blank=True, max_length=255)
    truck_number = serializers.CharField(required=False, allow_blank=True, max_length=50)
    trailer_number = serializers.CharField(required=False, allow_blank=True, max_length=50)


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
