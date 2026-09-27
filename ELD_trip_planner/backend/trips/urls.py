from django.urls import path
from . import views

urlpatterns = [
    path('places/suggest/', views.suggest_places_view, name='suggest_places'),
    path('trips/plan/', views.plan_trip, name='plan_trip'),
    path('trips/<uuid:trip_id>/', views.get_trip, name='get_trip'),
    path('trips/', views.list_trips, name='list_trips'),
]
