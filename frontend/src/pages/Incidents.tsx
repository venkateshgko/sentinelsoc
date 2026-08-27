import { useEffect, useMemo, useState } from "react";
import { Activity, ChevronRight, RefreshCw, Search, ShieldAlert, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { getIncidents, updateIncidentStatus, type Incident } from "../services/incidentService";
import { useAuth } from "../auth";

export default function Incidents() {
  const { canWrite } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentStatus, setIncidentStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  async function loadIncidents() {
    try {
      setLoading(true);
      setError("");
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
      setError("Unable to load incidents from the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIncidents();
  }, []);

  useEffect(() => {
    if (!selectedIncident) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedIncident(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIncident]);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSeverity = severity === "All" || incident.severity === severity;
      const matchesSearch = !query || [
        incident.id,
        incident.threat,
        incident.source,
        incident.target,
        incident.status,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesSeverity && matchesSearch;
    });
  }, [incidents, search, severity]);

  const criticalCount = incidents.filter((incident) => incident.severity === "Critical").length;
  const highCount = incidents.filter((incident) => incident.severity === "High").length;
  const activeCount = incidents.filter(
    (incident) => incident.status === "Active" || incident.status === "Investigating",
  ).length;

  function openIncident(incident: Incident) {
    setSelectedIncident(incident);
    setIncidentStatus(incident.status);
  }

  function chooseIncidentStatus(status: string) {
    setIncidentStatus(status);
    setStatusError("");
  }

  async function saveIncidentStatus() {
    if (!canWrite || !selectedIncident || !incidentStatus || incidentStatus === selectedIncident.status) return;

    try {
      setSavingStatus(true);
      setStatusError("");
      const updated = await updateIncidentStatus(
        selectedIncident.id,
        incidentStatus as "Investigating" | "Active" | "Resolved",
      );

      setIncidents((current) =>
        current.map((incident) => incident.id === updated.id ? updated : incident),
      );
      setSelectedIncident(updated);
      setIncidentStatus(updated.status);
    } catch (err) {
      console.error("Failed to update incident status:", err);
      setStatusError("Unable to save the incident status. Check that the backend is running.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="incidents-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SECURITY OPERATIONS</span>
          <h2>Security Incidents</h2>
          <p>Investigate, manage and track security incidents across your infrastructure.</p>
          {error && <p className="page-error" role="alert">{error}</p>}
        </div>

        <button className="refresh-button" onClick={() => void loadIncidents()} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      <div className="incident-summary-grid">
        <div className="incident-summary-card">
          <Activity size={18} aria-hidden="true" />
          <span>Total Incidents</span>
          <strong>{loading ? "..." : incidents.length}</strong>
        </div>
        <div className="incident-summary-card critical-card">
          <ShieldAlert size={18} aria-hidden="true" />
          <span>Critical</span>
          <strong>{loading ? "..." : criticalCount}</strong>
        </div>
        <div className="incident-summary-card high-card">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>High</span>
          <strong>{loading ? "..." : highCount}</strong>
        </div>
        <div className="incident-summary-card active-card">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Active</span>
          <strong>{loading ? "..." : activeCount}</strong>
        </div>
      </div>

      <section className="incident-card incidents-list-card">
        <div className="incident-header incident-page-header">
          <div>
            <h3>All Security Incidents</h3>
            <p>Latest detected and investigated threats</p>
          </div>

          <div className="incident-filters">
            <label className="incident-search" aria-label="Search incidents">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search incidents..."
              />
            </label>

            <select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity">
              <option value="All">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="incident-loading">Loading security incidents...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="incident-empty">
            <ShieldAlert size={22} />
            <strong>No incidents found</strong>
            <span>Try changing your search or severity filter.</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="incidents-full-table">
              <thead>
                <tr>
                  <th>INCIDENT</th>
                  <th>SEVERITY</th>
                  <th>THREAT</th>
                  <th>SOURCE</th>
                  <th>TARGET</th>
                  <th>TIME</th>
                  <th>STATUS</th>
                  <th aria-label="Details" />
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td><span className="incident-id">{incident.id}</span></td>
                    <td><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                    <td><span className="threat-name">{incident.threat}</span></td>
                    <td><span className="mono">{incident.source}</span></td>
                    <td>{incident.target}</td>
                    <td><span className="muted">{incident.time}</span></td>
                    <td><span className={`incident-status ${incident.status.toLowerCase()}`}>{incident.status}</span></td>
                    <td>
                      <button className="table-action" onClick={() => openIncident(incident)} aria-label={`View ${incident.id}`}>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedIncident && (
        <div className="incident-modal-backdrop" onMouseDown={() => setSelectedIncident(null)}>
          <div className="incident-modal" role="dialog" aria-modal="true" aria-labelledby="incident-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="incident-modal-header">
              <div>
                <span className="eyebrow">INCIDENT DETAILS</span>
                <h3 id="incident-detail-title">{selectedIncident.id}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedIncident(null)} aria-label="Close details">
                <X size={18} />
              </button>
            </div>

            <div className="incident-detail-grid">
              <div><span>Severity</span><strong className={`severity ${selectedIncident.severity.toLowerCase()}`}>{selectedIncident.severity}</strong></div>
              <div><span>Status</span><strong className={`incident-status ${incidentStatus.toLowerCase()}`}>{incidentStatus}</strong></div>
              <div><span>Threat</span><strong>{selectedIncident.threat}</strong></div>
              <div><span>Source</span><strong className="mono">{selectedIncident.source}</strong></div>
              <div><span>Target</span><strong>{selectedIncident.target}</strong></div>
              <div><span>Detected</span><strong>{selectedIncident.time}</strong></div>
            </div>

            {!canWrite && <div className="readonly-notice">Read-only access: you can investigate incidents, but status changes require Write access.</div>}
            <div className="incident-actions">
              <div className="incident-status-control">
                <label htmlFor="incident-status">Incident Status</label>
                <select
                  id="incident-status"
                  value={incidentStatus}
                  onChange={(event) => chooseIncidentStatus(event.target.value)}
                  disabled={savingStatus || !canWrite}
                >
                  <option value="Investigating">Investigating</option>
                  <option value="Active">Active</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="incident-action-buttons">
                <button
                  className="secondary-action-button"
                  onClick={() => {
                    setIncidentStatus(selectedIncident.status);
                    setStatusError("");
                  }}
                  disabled={savingStatus || incidentStatus === selectedIncident.status}
                >
                  Cancel Changes
                </button>
                <button
                  className="resolve-button"
                  onClick={() => void saveIncidentStatus()}
                  disabled={!canWrite || savingStatus || incidentStatus === selectedIncident.status}
                >
                  {savingStatus ? "Saving..." : incidentStatus === "Resolved" ? "Save Resolved" : "Save Status"}
                </button>
              </div>
            </div>
            {statusError && <p className="page-error incident-status-error" role="alert">{statusError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
