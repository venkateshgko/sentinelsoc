import { useCallback, useEffect, useState } from "react";
import { Activity, AlertOctagon, CircleAlert, CircleDot, Flame, Globe2, RefreshCw, ShieldAlert } from "lucide-react";
import KpiCard from "../components/dashboard/KpiCard";
import ThreatActivityChart from "../components/dashboard/ThreatActivityChart";
import IncidentTable from "../components/dashboard/IncidentTable";
import { getDashboard, type DashboardData } from "../services/dashboardService";
import { getIncidents, type Incident } from "../services/incidentService";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardData, incidentData] = await Promise.all([getDashboard(), getIncidents()]);
      setDashboard(dashboardData);
      setIncidents(incidentData);
      setError(null);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Unable to load live backend data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const distribution = dashboard?.threat_distribution;
  const totalThreats = distribution ? distribution.critical + distribution.high + distribution.medium + distribution.low : 0;
  const [selectedSeverity, setSelectedSeverity] = useState<"critical" | "high" | "medium" | "low" | null>(null);

  const severityData = [
    { key: "critical" as const, label: "Critical", value: distribution?.critical ?? 0, color: "var(--danger)", icon: CircleAlert },
    { key: "high" as const, label: "High", value: distribution?.high ?? 0, color: "var(--warning)", icon: Flame },
    { key: "medium" as const, label: "Medium", value: distribution?.medium ?? 0, color: "var(--info)", icon: ShieldAlert },
    { key: "low" as const, label: "Low", value: distribution?.low ?? 0, color: "#3a4350", icon: CircleDot },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SECURITY OPERATIONS</span>
          <h2>Security Overview</h2>
          <p>Monitor threats, incidents and security activity across your infrastructure.</p>
          {error && <p className="page-error" role="alert">{error}</p>}
        </div>
        <button className="refresh-button dashboard-refresh" onClick={() => void loadData()} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />{loading ? "Loading" : "Refresh"}
        </button>
      </div>

      <div className="kpi-grid">
        <KpiCard title="Total Events" value={loading ? "..." : (dashboard?.total_events ?? 0).toLocaleString()} change="+12.8%" description="vs. previous 24 hours" icon={Activity} />
        <KpiCard title="Critical Threats" value={loading ? "..." : String(dashboard?.critical_threats ?? 0)} change="+2" description="requires immediate action" icon={AlertOctagon} variant="danger" />
        <KpiCard title="High Threats" value={loading ? "..." : String(dashboard?.high_threats ?? 0)} change="+8.4%" description="detected today" icon={ShieldAlert} variant="warning" />
        <KpiCard title="Blocked Sources" value={loading ? "..." : String(dashboard?.blocked_sources ?? 0)} change="+5" description="malicious IP addresses" icon={Globe2} variant="success" />
      </div>

      <div className="dashboard-grid">
        <ThreatActivityChart data={dashboard?.threat_activity} />
        <div className="threat-distribution">
          <div className="chart-header"><div><h3>Threat Distribution</h3><p>By severity level</p></div></div>
          <div className="donut-wrapper">
            <div className={`donut${selectedSeverity ? " has-selection" : ""}`} aria-label="Threat distribution by severity">
              <svg className="donut-svg" viewBox="0 0 120 120" role="img">
                {severityData.map((item, index) => {
                  const previous = severityData.slice(0, index).reduce((sum, current) => sum + current.value, 0);
                  const circumference = 2 * Math.PI * 43;
                  const length = totalThreats ? (item.value / totalThreats) * circumference : 0;
                  const offset = -(previous / Math.max(totalThreats, 1)) * circumference;
                  const selected = selectedSeverity === item.key;
                  const dimmed = selectedSeverity !== null && !selected;
                  return (
                    <circle
                      key={item.key}
                      className={`donut-segment${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}`}
                      cx="60" cy="60" r="43"
                      fill="none"
                      stroke={item.color}
                      strokeWidth={selected ? 12 : 10}
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={offset}
                      onClick={() => setSelectedSeverity(selected ? null : item.key)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.label}: ${item.value}`}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedSeverity(selected ? null : item.key); }}
                    />
                  );
                })}
              </svg>
              <div className="donut-center"><strong>{loading ? "..." : totalThreats}</strong><span>{selectedSeverity ? severityData.find((item) => item.key === selectedSeverity)?.label : "Threats"}</span></div>
            </div>
          </div>
          <div className="distribution-list">
            {severityData.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`distribution-item${selectedSeverity === item.key ? " is-selected" : ""}${selectedSeverity && selectedSeverity !== item.key ? " is-dimmed" : ""}`}
                onClick={() => setSelectedSeverity(selectedSeverity === item.key ? null : item.key)}
                aria-pressed={selectedSeverity === item.key}
              >
                <span><item.icon size={14} strokeWidth={2.1} aria-hidden="true" />{item.label}</span><strong>{item.value}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
      <IncidentTable incidents={incidents} />
    </div>
  );
}
