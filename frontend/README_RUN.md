# SentinelSOC Frontend — Run Guide

## Start the frontend

```powershell
cd D:\sentinelsoc\frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite configuration is intentionally simple and does not require `vitest`.

## Theme

Go to **Settings → Theme** and choose **Dark** or **Light**. The choice is stored in the browser and applies to the complete console, including Dashboard, Access Control, Settings, and Login.

## Start the backend

```powershell
cd D:\sentinelsoc\backend
python -m uvicorn main:app --reload --port 8000
```

The backend also remains available through `app.main:app`.
