import api from "./api";

export interface DashboardData {
  total_events: number;
  critical_threats: number;
  high_threats: number;
  blocked_sources: number;
  threat_distribution: { critical: number; high: number; medium: number; low: number };
  threat_activity: { time: string; threats: number; events: number }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>("/dashboard");
  return response.data;
}
