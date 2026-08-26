import json
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).resolve().parent / "incidents.json"

DEFAULT_INCIDENTS: list[dict[str, Any]] = [
    {
        "id": "INC-2847",
        "severity": "Critical",
        "threat": "SQL Injection",
        "source": "185.42.17.91",
        "target": "api-gateway-01",
        "time": "2 min ago",
        "status": "Investigating",
    },
    {
        "id": "INC-2846",
        "severity": "High",
        "threat": "Brute Force",
        "source": "103.74.221.18",
        "target": "auth-service",
        "time": "8 min ago",
        "status": "Active",
    },
    {
        "id": "INC-2845",
        "severity": "High",
        "threat": "Port Scanning",
        "source": "45.132.88.41",
        "target": "web-server-02",
        "time": "14 min ago",
        "status": "Active",
    },
    {
        "id": "INC-2844",
        "severity": "Medium",
        "threat": "Suspicious Login",
        "source": "91.201.45.12",
        "target": "admin-panel",
        "time": "21 min ago",
        "status": "Resolved",
    },
]


def _write(items: list[dict[str, Any]]) -> None:
    DATA_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")


def load_incidents() -> list[dict[str, Any]]:
    if not DATA_FILE.exists():
        _write(DEFAULT_INCIDENTS)

    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        _write(DEFAULT_INCIDENTS)
        return [item.copy() for item in DEFAULT_INCIDENTS]


def update_incident_status(incident_id: str, status: str) -> dict[str, Any] | None:
    items = load_incidents()
    for incident in items:
        if incident["id"] == incident_id:
            incident["status"] = status
            _write(items)
            return incident
    return None
