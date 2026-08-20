import api from "./api";

export interface Incident {
  id: string;
  severity: string;
  threat: string;
  source: string;
  target: string;
  time: string;
  status: string;
}

export interface IncidentsResponse {
  count: number;
  items: Incident[];
}

export async function getIncidents(): Promise<Incident[]> {
  const response = await api.get<IncidentsResponse>("/incidents");
  return response.data.items;
}

export async function updateIncidentStatus(
  incidentId: string,
  status: "Investigating" | "Active" | "Resolved",
): Promise<Incident> {
  const response = await api.patch<Incident>(`/incidents/${incidentId}`, { status });
  return response.data;
}
