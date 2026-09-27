"""Gunicorn configuration for production (Render, Railway, Fly.io, etc.)."""
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"
workers = int(os.environ.get('WEB_CONCURRENCY', 2))
threads = int(os.environ.get('GUNICORN_THREADS', 1))
timeout = int(os.environ.get('GUNICORN_TIMEOUT', 120))
keepalive = int(os.environ.get('GUNICORN_KEEPALIVE', 5))
worker_class = os.environ.get('GUNICORN_WORKER_CLASS', 'sync')
loglevel = os.environ.get('LOG_LEVEL', 'info').lower()
accesslog = '-'
errorlog = '-'
capture_output = True

# Trip planning calls external geocoding/routing APIs — allow long requests.
graceful_timeout = 30
max_requests = int(os.environ.get('GUNICORN_MAX_REQUESTS', 1000))
max_requests_jitter = 50
