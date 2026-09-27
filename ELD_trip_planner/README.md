# ELD Trip Planner — Full-Stack Assessment

A Django + React app that takes trip details, calculates an HOS-compliant route with required stops, and generates drawn FMCSA Driver's Daily Log (RODS) sheets.

## What it does

**Inputs**
- Current location
- Pickup location
- Dropoff location
- Current cycle used (hours, in the 70hr/8day window)

**Outputs**
- Map of the route (current → pickup → dropoff)
- Trip timeline showing every driving segment, 30-minute break, 10-hour rest, fuel stop, pickup, and dropoff
- One or more drawn ELD daily log sheets with the 24-hour grid, duty-status polyline, totals, and remarks

## Assumptions

Per the assessment prompt:
- Property-carrying driver, 70hr/8day cycle
- No adverse driving conditions
- 1 hour for pickup and 1 hour for dropoff (on-duty not driving)
- Fueling stop every 1,000 miles (15 minutes, on-duty not driving)

Encoded HOS rules:
- 11-hour driving limit per duty window
- 14-hour duty window
- 10-hour off-duty period required to reset
- 30-minute break required after 8 cumulative driving hours
- 70-hour / 8-day rolling cycle, with 34-hour restart inserted when exhausted

## Tech stack

- **Backend:** Django 4.2 + Django REST Framework
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS v4 + Shadcn-style UI + Framer Motion + Lottie + Zustand + React Query
- **Routing:** OSRM public demo (`router.project-osrm.org`)
- **Geocoding:** Nominatim public demo (`nominatim.openstreetmap.org`)
- **DB:** SQLite locally, Postgres-ready via `DATABASE_URL`

> ⚠️ The public OSRM/Nominatim demos have usage policies. For production, self-host or switch to a paid provider (Mapbox, OpenRouteService paid tier, etc.).

## Project layout

```
eld-trip-planner/
├── backend/                  # Django + DRF API
│   ├── eld_project/          # Django settings/urls/wsgi
│   ├── trips/                # Trip model, serializers, views, urls
│   ├── hos/                  # HOS rules + simulation engine + daily-log builder
│   ├── routing/              # Nominatim + OSRM service
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile              # for Render/Railway
│   └── .env.example
└── frontend/                 # Next.js 15 + App Router
    ├── app/                  # Pages (dashboard, trip-planner, route-analysis, etc.)
    ├── components/           # layout, dashboard, hero, trip, map, hos, logs, charts, ui
    ├── hooks/
    ├── store/
    ├── services/
    ├── types/
    ├── lib/
    ├── package.json
    └── .env.example
```

## Local development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # edit if needed
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
Visit http://localhost:8000/api/health/ to verify.

### Frontend
```bash
cd frontend
pnpm install
cp .env.example .env                                 # default points to localhost:8000
pnpm dev
```
Open http://localhost:3000.

## API

### `POST /api/trips/plan/`
Plan a trip and generate daily logs.

Request:
```json
{
  "current_location": "Los Angeles, CA",
  "pickup_location": "Phoenix, AZ",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used_hours": 10,
  "driver_name": "John Driver",
  "carrier_name": "Acme Trucking Co.",
  "main_office_address": "123 Freight Way, Dallas, TX",
  "truck_number": "T-101",
  "trailer_number": "TR-22"
}
```

Response: full `Trip` object with `route_geometry`, `events`, `daily_logs`, and `coords`.

### `GET /api/trips/<uuid>/`
Fetch a previously created trip.

### `GET /api/trips/`
List recent trips.

## Deployment

### Backend → Render / Railway / Fly.io

Deploy from the **same monorepo** as the frontend. Set the platform **root directory** to `backend`.

#### Option A — Render Blueprint (recommended)

1. Push the repo to GitHub.
2. In [Render](https://render.com) → **New** → **Blueprint**, connect the repo.
3. Render reads `render.yaml` at the repo root (creates API + Postgres).
4. After deploy, set:
   - `DJANGO_ALLOWED_HOSTS` → your Render hostname (e.g. `eld-trip-planner-api.onrender.com`)
   - `CORS_ALLOWED_ORIGINS` → your Vercel URL (e.g. `https://your-app.vercel.app`)
5. Health check: `GET https://your-api.onrender.com/api/health/`

#### Option B — Manual web service

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Build Command | `bash build.sh` |
| Start Command | `gunicorn eld_project.wsgi:application -c gunicorn.conf.py` |
| Pre-deploy / Release | `python manage.py migrate --noinput` |

**Required environment variables (production):**

| Variable | Example |
|----------|---------|
| `DJANGO_SECRET_KEY` | long random string |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `your-api.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `DATABASE_URL` | Postgres connection string (recommended) |
| `PYTHON_VERSION` | `3.12.4` (required — do not use 3.14; psycopg breaks) |

**Optional:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `WEB_CONCURRENCY` | `2` | Gunicorn workers |
| `GUNICORN_TIMEOUT` | `120` | Trip planning can be slow (geocoding + routing) |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

Files included for deployment: `backend/Procfile`, `backend/gunicorn.conf.py`, `backend/build.sh`, `backend/runtime.txt`.

### Frontend → Vercel

1. Push the repo to GitHub.
2. In [Vercel](https://vercel.com), **Import Project** and select the repository.
3. Set **Root Directory** to `frontend` (important — the app is not at the repo root).
4. Vercel auto-detects **Next.js** and uses `pnpm` from `packageManager` in `package.json`.
5. Add **Environment Variable** (Production, Preview, and Development):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_BASE` | `https://your-api.onrender.com` (your deployed Django API URL, no trailing slash) |

6. Deploy. Default build command: `pnpm build`, output: Next.js App Router.

7. On the **backend**, set `CORS_ALLOWED_ORIGINS` to include your Vercel URL, e.g.  
   `https://your-app.vercel.app` (and `https://your-app-*.vercel.app` for preview deploys if needed).

**Local frontend env:** copy `frontend/.env.example` to `frontend/.env` and point at `http://localhost:8000`.

## How the HOS engine works

`backend/hos/engine.py` runs a deterministic timeline simulation:

1. Drive `current → pickup`, slicing driving time into segments so we can interleave:
   - 30-minute break when cumulative driving hits 8 hours
   - 10-hour off-duty rest when driving hits 11 hours OR duty window hits 14 hours
   - Fuel stop every 1,000 miles
2. Insert 1-hour pickup block (on-duty not driving).
3. Drive `pickup → dropoff` with the same slicing logic.
4. Insert 1-hour dropoff block.
5. If the 70-hour cycle exhausts during the trip, insert a 34-hour restart.

`backend/hos/daily_logs.py` then splits the event timeline across UTC calendar days and computes the per-status totals for each daily log. Each day is guaranteed to sum to 24h.

The frontend `components/logs/daily-log-sheet.tsx` renders the resulting per-day data as an SVG that mirrors the FMCSA RODS form: 4 duty rows × 24 hour columns × quarter-hour ticks, a polyline showing duty-status changes, totals column, and a remarks band underneath.

## Known limitations / improvements you can make

- Sleeper-berth split (7/3 or 8/2) not yet handled — currently uses single 10-hour off-duty resets.
- Personal conveyance and yard moves not modeled.
- Adverse-conditions exception not modeled.
- Stop markers on the map are approximated by miles fraction along the polyline (no per-segment lat/lng from OSRM).
- Logs use UTC days; you may want to add a home-terminal timezone selector.
- No authentication; trip history is publicly listable.

## License

MIT (or your choice).
