import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import type { Incident } from "../../services/incidentService";

interface Props { incidents?: Incident[]; }

export default function IncidentTable({ incidents = [] }: Props) {
  return (
    <div className="incident-card">
      <div className="incident-header">
        <div><h3>Recent Security Incidents</h3><p>Latest detected and investigated threats</p></div>
        <button className="view-all">View all <ArrowUpRight size={14} /></button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Incident</th><th>Severity</th><th>Threat</th><th>Source</th><th>Target</th><th>Time</th><th>Status</th><th /></tr></thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td className="incident-id">#{incident.id}</td>
                <td><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                <td className="threat-name">{incident.threat}</td>
                <td className="mono">{incident.source}</td>
                <td className="mono">{incident.target}</td>
                <td className="muted">{incident.time}</td>
                <td><span className={`incident-status ${incident.status.toLowerCase().replace(" ", "-")}`}>{incident.status}</span></td>
                <td><button className="table-action" aria-label={`More actions for ${incident.id}`}><MoreHorizontal size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
