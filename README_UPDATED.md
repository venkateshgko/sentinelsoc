# SentinelSOC — Full UI Update

This build combines the requested frontend improvements in one project.

## Included
- Fixed left sidebar and topbar that remain in place while content scrolls.
- Current date shown in the topbar.
- SentinelSOC browser title and shield favicon.
- Lucide React icons throughout the interface.
- Premium KPI/card hover and neon highlight effects.
- Premium Threat Activity chart tooltip with Events/Threats values, guide cursor and active points.
- Analytics Event Volume hover tooltip, including safe first/last-bar positioning.
- Interactive Risk Distribution selection: selected severity highlights and other severities dim.
- Interactive sidebar navigation hover/active states.
- Topbar search focus with Ctrl+K shortcut and notification panel.
- Incidents search/filter/refresh/detail modal with Escape-to-close and status updates.
- Analytics and operational tables with improved hover/focus states.
- Responsive layouts for tablet/mobile widths.
- Reduced-motion support.
- Frontend package name changed from `frontend` to `sentinelsoc`.

## Run

### Backend
```powershell
cd D:\sentinelsoc\backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend
```powershell
cd D:\sentinelsoc\frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend uses the Vite `/api` proxy to reach FastAPI on `127.0.0.1:8000`.

## Authentication & access control

The frontend now opens with a SentinelSOC login screen.

Demo administrator credentials:
- Admin name: `admin`
- Password: `admin@123`

The administrator can open **Access Control** from the sidebar and create operator accounts with:
- **Read-only** — can view the SOC, but incident status changes are disabled.
- **Write access** — can view and modify incident status.
- **Administrator** — the seeded `admin` account can manage access, reset operator passwords, and revoke accounts.

This is intentionally implemented as a browser-side demo authentication layer using `localStorage`, suitable for a college/demo project. It is **not production authentication**: passwords are not securely hashed and access is not enforced by the backend. For a production deployment, move authentication, sessions/tokens, password hashing, and authorization checks into the backend.

## Access Control layout update
- Active account rows now keep the user, session metrics, permissions, and actions in a clean left-to-right desktop layout.
- The account list supports horizontal scrolling on narrower widths instead of crushing or clipping the row content.
- The horizontal scrollbar is styled to match the SentinelSOC purple theme.
