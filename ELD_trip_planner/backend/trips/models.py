from django.db import models
import uuid


class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Inputs
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used_hours = models.FloatField(default=0)
    trip_start_time = models.DateTimeField()

    # Optional metadata for the log header
    driver_name = models.CharField(max_length=120, blank=True, default='')
    co_driver_name = models.CharField(max_length=120, blank=True, default='')
    carrier_name = models.CharField(max_length=200, blank=True, default='')
    main_office_address = models.CharField(max_length=255, blank=True, default='')
    truck_number = models.CharField(max_length=50, blank=True, default='')
    trailer_number = models.CharField(max_length=50, blank=True, default='')

    # Computed
    total_distance_miles = models.FloatField(null=True, blank=True)
    total_duration_minutes = models.FloatField(null=True, blank=True)

    # Stored as JSON for simplicity
    route_geometry = models.JSONField(null=True, blank=True)   # GeoJSON LineString
    events = models.JSONField(null=True, blank=True)           # list of timeline events
    daily_logs = models.JSONField(null=True, blank=True)       # list of per-day logs
    coords = models.JSONField(null=True, blank=True)           # {current:[lng,lat], pickup:..., dropoff:...}

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Trip {self.id} ({self.current_location} → {self.dropoff_location})'
