# SentinelSOC Backend

FastAPI backend for the SentinelSOC frontend.

## Run

```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

## Incident API

- `GET /api/incidents`
- `GET /api/incidents/{incident_id}`
- `PATCH /api/incidents/{incident_id}`

PATCH body:

```json
{"status":"Resolved"}
```

Allowed statuses: `Investigating`, `Active`, `Resolved`.

Incident status changes are persisted to `app/db/incidents.json`, so they survive frontend refreshes and backend restarts.
