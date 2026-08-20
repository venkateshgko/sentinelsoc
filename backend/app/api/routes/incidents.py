from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.incident_store import load_incidents, update_incident_status

router = APIRouter()

IncidentStatus = Literal["Investigating", "Active", "Resolved"]


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus


@router.get("/incidents")
def get_incidents():
    items = load_incidents()
    return {
        "count": len(items),
        "items": items,
    }


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    for incident in load_incidents():
        if incident["id"] == incident_id:
            return incident

    raise HTTPException(status_code=404, detail="Incident not found")


@router.patch("/incidents/{incident_id}")
def update_incident(incident_id: str, payload: IncidentStatusUpdate):
    incident = update_incident_status(incident_id, payload.status)

    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    return incident
