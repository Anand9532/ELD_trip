from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection


def root(_request):
    return JsonResponse({
        'service': 'eld-trip-planner-api',
        'status': 'ok',
        'endpoints': {
            'health': '/api/health/',
            'plan_trip': 'POST /api/trips/plan/',
            'list_trips': 'GET /api/trips/',
            'suggest_places': 'GET /api/places/suggest/?q=...',
        },
    })


def health(_request):
    payload = {'status': 'ok', 'service': 'eld-trip-planner-api'}
    status = 200

    try:
        connection.ensure_connection()
        payload['database'] = 'ok'
    except Exception as exc:
        payload['status'] = 'degraded'
        payload['database'] = 'error'
        payload['detail'] = str(exc)
        status = 503

    return JsonResponse(payload, status=status)


urlpatterns = [
    path('', root),
    path('admin/', admin.site.urls),
    path('api/health/', health),
    path('api/', include('trips.urls')),
]
