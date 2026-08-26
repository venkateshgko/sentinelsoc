# SentinelSOC

SentinelSOC is a security operations center (SOC) demo application that combines a modern React dashboard with a FastAPI backend to simulate threat monitoring, incident triage, and operator access control. The project is designed as a polished prototype for showcasing SOC workflows in a web UI while keeping the architecture simple enough to run locally.

## Overview

This repository contains:

- A FastAPI service for dashboard and incident APIs
- A Vite + React frontend for the SOC console
- Browser-based authentication and role management for demo users
- A dashboard with KPI cards, charts, and incident tables
- A simulated access-control layer for admin, write, and read-only users

The app is intended as a demonstration project rather than a production-grade security platform. It is useful for learning system architecture, frontend/backend integration, API design, and the structure of a SOC interface.

## Features

### Security dashboard
- KPI overview for total events, critical threats, high threats, and blocked sources
- Threat activity timeline chart
- Threat distribution donut chart
- Incident table with severity and status metadata
- Refresh controls and responsive dashboard layout

### Incident management
- Incident list loaded from the backend
- Incident status updates via PATCH endpoint
- Status values include Investigating, Active, and Resolved
- Incident data persisted to a local JSON store for demo continuity

### Access control demo
- Admin login flow
- Role-based user access:
  - Administrator
  - Write access
  - Read-only access
- Access-management screen for creating and managing users
- Single-session protection using browser storage for demo enforcement
- Admin logs and audit trail views

### UI experience
- Dark SOC-themed interface
- Sidebar + topbar layout
- Lucide-based iconography
- Interactive chart/tooltips
- Mobile and tablet-friendly responsive behavior

## Architecture

The repository is organized into a small multi-service demo structure:

- frontend: React application and UI components
- backend: FastAPI API and persistence layer
- ai-engine: reserved for AI/analytics extension work
- detection-engine: reserved for threat detection logic
- log-generator: reserved for telemetry ingestion generation
- infrastructure: reserved for deployment-related assets

### Runtime flow

1. The user opens the frontend in the browser.
2. The frontend routes to a login screen when no active session exists.
3. After login, the app loads dashboard and incident data from the backend API.
4. FastAPI serves JSON endpoints, including health, dashboard metrics, and incident CRUD/status updates.
5. The frontend uses a Vite proxy to avoid CORS issues during local development.

## Tech stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn
- SQLAlchemy support included in dependencies
- Local JSON-backed incident persistence for demo use

## Project structure

```text
sentinelsoc/
├── README.md
├── README_LOGIN_ACCESS.md
├── README_SINGLE_SESSION.md
├── README_UPDATED.md
├── ai-engine/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── dashboard.py
│   │   │       ├── health.py
│   │   │       └── incidents.py
│   │   ├── db/
│   │   │   ├── incident_store.py
│   │   │   └── incidents.json
│   │   ├── main.py
│   │   └── ...
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── detection-engine/
├── docs/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
├── infrastructure/
├── log-generator/
└── tests/
```

## Prerequisites

Before running the project, make sure you have:

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- A terminal such as PowerShell, Command Prompt, or Bash

## Quick start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd sentinelsoc
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

On macOS/Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite app usually runs at:

- http://localhost:5173

The frontend is configured to proxy API calls to the backend at http://127.0.0.1:8000.

## Default login

A demo administrator account is seeded in the frontend auth layer:

- Username: admin
- Password: admin@123

This project intentionally uses browser-side localStorage for the demo authentication model. It is not production security and should not be treated as a secure auth implementation.

## Access roles

### Administrator
- Full access to the dashboard and admin tools
- Can manage access control
- Can create, edit, and revoke user accounts
- Can view admin logs

### Write access
- Can access dashboard and monitoring views
- Can modify incident status
- Cannot manage other accounts

### Read-only
- Can view the dashboard and monitoring views
- Cannot change incident state
- Cannot manage users

## API endpoints

### Health
- GET /api/health

### Dashboard
- GET /api/dashboard

### Incidents
- GET /api/incidents
- GET /api/incidents/{incident_id}
- PATCH /api/incidents/{incident_id}

Example for updating an incident status:

```json
{
  "status": "Resolved"
}
```

Allowed values:

- Investigating
- Active
- Resolved

## Data model notes

The incident store currently uses a local JSON file:

- backend/app/db/incidents.json

This makes it easy to demo live updates without a database. It also means the project is intentionally simplified for local development and classroom use.

## Important project note

This repository is a frontend + backend prototype for a SOC dashboard and is not intended as a hardened production deployment. The authentication and session logic are implemented in the browser for demonstration purposes only. For a production system, the following should move to the backend:

- password hashing
- server-side session management
- JWT or secure token issuance
- authorization enforcement
- database-backed user and audit storage

## Troubleshooting

### Backend connection issues
- Confirm the FastAPI server is running on port 8000.
- Verify the frontend dev server is pointing to the correct local API host.
- Check for CORS or proxy mismatches in the Vite config.

### Frontend login not working
- Ensure the browser is not using cached state from an older version of the app.
- Clear localStorage keys for SentinelSOC if needed.
- Start with the seeded admin account: admin / admin@123

### Dependency problems
- Reinstall Python requirements in the backend virtual environment.
- Reinstall Node dependencies in the frontend.

## Future extension ideas

This project is well-suited for expansion into a richer SOC system, including:

- real database-backed persistence
- user authentication with hashed passwords and JWTs
- rule-based and ML-based detection pipelines
- log ingestion from SIEM sources
- alert correlation and enrichment
- threat intelligence integration
- deployment via Docker or Kubernetes

## License

This project is provided for educational and demonstration purposes. Licensing details should be added if this repository is intended for broader reuse or distribution.

## Summary

SentinelSOC demonstrates a realistic SOC dashboard workflow with a polished interface, a lightweight API, and access-control logic suitable for learning and prototyping. It is a strong foundation for a security monitoring app and can easily be extended into a more advanced cyber operations platform.
