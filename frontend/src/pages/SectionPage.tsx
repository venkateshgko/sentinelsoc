import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth";
import { useTheme } from "../theme";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Clock3,
  CircleCheck,
  CircleX,
  ShieldCheck,
  CircleAlert,
  Flame,
  Check,
  ChevronRight,
  FileSearch,
  Globe2,
  Moon,
  Sun,
  CircleDot,
  Search,
  Server,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Waves,
} from "lucide-react";

interface SectionPageProps {
  type: "threats" | "alerts" | "logs" | "analytics" | "settings" | "admin-logs";
}

type Row = {
  id: string;
  title: string;
  severity: string;
  source: string;
  target: string;
  status: string;
  time: string;
};

const incidentRows: Row[] = [
  { id: "INC-2847", title: "SQL Injection", severity: "Critical", source: "185.42.17.91", target: "api-gateway-01", status: "Investigating", time: "2 min ago" },
  { id: "INC-2846", title: "Brute Force", severity: "High", source: "103.74.221.18", target: "auth-service", status: "Active", time: "8 min ago" },
  { id: "INC-2845", title: "Port Scanning", severity: "High", source: "45.132.88.41", target: "web-server-02", status: "Active", time: "14 min ago" },
  { id: "INC-2844", title: "Suspicious Login", severity: "Medium", source: "91.201.45.12", target: "admin-panel", status: "Resolved", time: "21 min ago" },
];

const alertRows: Row[] = [
  { id: "ALT-7712", title: "Repeated authentication failures", severity: "High", source: "103.74.221.18", target: "auth-service", status: "Open", time: "1 min ago" },
  { id: "ALT-7711", title: "SQL injection signature detected", severity: "Critical", source: "185.42.17.91", target: "api-gateway-01", status: "Investigating", time: "2 min ago" },
  { id: "ALT-7710", title: "Unexpected admin login", severity: "Medium", source: "91.201.45.12", target: "admin-panel", status: "Acknowledged", time: "21 min ago" },
  { id: "ALT-7709", title: "Network scan threshold exceeded", severity: "High", source: "45.132.88.41", target: "web-server-02", status: "Open", time: "14 min ago" },
];

const logRows: Row[] = [
  { id: "LOG-92184", title: "POST /api/login 401", severity: "Medium", source: "103.74.221.18", target: "auth-service", status: "Rejected", time: "1 min ago" },
  { id: "LOG-92183", title: "GET /api/users?id=1'", severity: "Critical", source: "185.42.17.91", target: "api-gateway-01", status: "Blocked", time: "2 min ago" },
  { id: "LOG-92182", title: "TCP SYN burst", severity: "High", source: "45.132.88.41", target: "web-server-02", status: "Observed", time: "14 min ago" },
  { id: "LOG-92181", title: "Admin authentication success", severity: "Low", source: "91.201.45.12", target: "admin-panel", status: "Recorded", time: "21 min ago" },
];

function Severity({ value }: { value: string }) {
  return <span className={`severity ${value.toLowerCase()}`}>{value}</span>;
}

function OperationsTable({ rows, search, severity }: { rows: Row[]; search: string; severity: string }) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const sev = severity === "All" || row.severity === severity;
      const text = Object.values(row).join(" ").toLowerCase();
      return sev && (!q || text.includes(q));
    });
  }, [rows, search, severity]);

  return (
    <div className="operations-table-wrap">
      <table className="operations-table">
        <thead><tr><th>ID</th><th>EVENT</th><th>SEVERITY</th><th>SOURCE</th><th>TARGET</th><th>STATUS</th><th>TIME</th><th /></tr></thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td><span className="incident-id">{row.id}</span></td>
              <td><strong>{row.title}</strong></td>
              <td><Severity value={row.severity} /></td>
              <td><span className="mono">{row.source}</span></td>
              <td>{row.target}</td>
              <td><span className={`incident-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
              <td><span className="muted">{row.time}</span></td>
              <td><ChevronRight size={14} className="muted" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filtered.length && <div className="section-empty"><Search size={20} /><strong>No matching records</strong><span>Try a different search or severity filter.</span></div>}
    </div>
  );
}

function ThreatsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  return (
    <div className="section-page">
      <div className="section-heading"><div><span className="eyebrow">THREAT INTELLIGENCE</span><h2>Threat Intelligence</h2><p>Monitor malicious activity and prioritize the threats requiring attention.</p></div><button className="refresh-button"><Activity size={14} /> Live feed</button></div>
      <div className="section-kpis"><div><Globe2 /><span>Threats detected</span><strong>154</strong><small>Last 24 hours</small></div><div><Shield /><span>Critical</span><strong className="danger-text">7</strong><small>Immediate action</small></div><div><TrendingUp /><span>High risk</span><strong className="warning-text">23</strong><small>Active today</small></div><div><Server /><span>Blocked sources</span><strong className="success-text">31</strong><small>Malicious IPs</small></div></div>
      <section className="operations-card"><div className="operations-toolbar"><div><h3>Detected Threats</h3><p>Prioritized indicators from current security activity</p></div><div className="section-filters"><label><Search size={14}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search threats..."/></label><select value={severity} onChange={(e) => setSeverity(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div></div><OperationsTable rows={incidentRows} search={search} severity={severity}/></section>
    </div>
  );
}

function AlertsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  return <div className="section-page"><div className="section-heading"><div><span className="eyebrow">SECURITY OPERATIONS</span><h2>Security Alerts</h2><p>Review, filter and triage alerts generated by SentinelSOC.</p></div><button className="refresh-button"><Activity size={14}/> Refresh</button></div><div className="section-kpis"><div><Activity/><span>Open alerts</span><strong>3</strong><small>Needs triage</small></div><div><Shield/><span>Critical</span><strong className="danger-text">1</strong><small>Escalate now</small></div><div><TrendingUp/><span>High</span><strong className="warning-text">2</strong><small>Investigate</small></div><div><Check/><span>Acknowledged</span><strong className="success-text">12</strong><small>Today</small></div></div><section className="operations-card"><div className="operations-toolbar"><div><h3>Alert Queue</h3><p>Newest alerts requiring analyst review</p></div><div className="section-filters"><label><Search size={14}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search alerts..."/></label><select value={severity} onChange={(e)=>setSeverity(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div></div><OperationsTable rows={alertRows} search={search} severity={severity}/></section></div>;
}

function LogsPage() {
  const [search, setSearch] = useState("");
  return <div className="section-page"><div className="section-heading"><div><span className="eyebrow">EVENT MONITORING</span><h2>Security Logs</h2><p>Search incoming events and inspect the latest activity across protected services.</p></div><button className="refresh-button"><FileSearch size={14}/> Live logs</button></div><div className="log-summary"><div><FileSearch/><strong>18,243</strong><span>Events in the last 24h</span></div><div><Server/><strong>4</strong><span>Services reporting</span></div><div><Shield/><strong>31</strong><span>Sources blocked</span></div></div><section className="operations-card"><div className="operations-toolbar"><div><h3>Event Stream</h3><p>Most recent security-relevant log entries</p></div><label className="wide-search"><Search size={14}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search IP, event, service..."/></label></div><OperationsTable rows={logRows} search={search} severity="All"/></section></div>;
}

function AnalyticsPage() {
  const points = [
    { time: "00:00", events: 420, threats: 32 },
    { time: "02:00", events: 510, threats: 41 },
    { time: "04:00", events: 390, threats: 29 },
    { time: "06:00", events: 680, threats: 48 },
    { time: "08:00", events: 920, threats: 55 },
    { time: "10:00", events: 810, threats: 61 },
    { time: "12:00", events: 1240, threats: 88 },
    { time: "14:00", events: 1080, threats: 74 },
    { time: "16:00", events: 1420, threats: 102 },
    { time: "18:00", events: 1160, threats: 91 },
    { time: "20:00", events: 980, threats: 79 },
    { time: "22:00", events: 710, threats: 58 },
  ];
  const max = Math.max(...points.map((point) => point.events));
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const risks = [
    { name: "Critical", value: 7, tone: "critical", icon: CircleAlert },
    { name: "High", value: 23, tone: "high", icon: Flame },
    { name: "Medium", value: 48, tone: "medium", icon: ShieldAlert },
    { name: "Low", value: 76, tone: "low", icon: CircleDot },
  ];
  const totalRisk = risks.reduce((sum, risk) => sum + risk.value, 0);
  const maxRisk = Math.max(...risks.map((risk) => risk.value));

  return <div className="section-page">
    <div className="section-heading">
      <div><span className="eyebrow">SECURITY ANALYTICS</span><h2>Security Analytics</h2><p>Understand event volume, threat pressure and operational performance.</p></div>
      <button className="refresh-button"><BarChart3 size={14}/> Last 24 hours</button>
    </div>
    <div className="analytics-grid">
      <section className="operations-card analytics-main">
        <div className="operations-toolbar"><div><h3>Event Volume</h3><p>Security events detected throughout the day</p></div></div>
        <div className="bar-chart" role="img" aria-label="Security event volume by time">
          {points.map((point, i) => (
            <div className={`bar-column${hovered === i ? " is-hovered" : ""}${i === 0 ? " first-bar" : ""}${i === points.length - 1 ? " last-bar" : ""}`} key={point.time}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {hovered === i && (
                <div className="bar-tooltip" role="status">
                  <strong>{point.time}</strong>
                  <span><b>Events</b> {point.events.toLocaleString()}</span>
                  <span><b>Threats</b> {point.threats}</span>
                </div>
              )}
              <div className="bar" style={{height:`${Math.max(8,(point.events/max)*100)}%`}}
                aria-label={`${point.time}: ${point.events} events, ${point.threats} threats`}/>
              <span>{point.time}</span>
            </div>
          ))}
        </div>
      </section>
      <section className={`operations-card analytics-side${selectedRisk ? " has-risk-selection" : ""}`}>
        <div className="risk-heading">
          <div><h3>Risk Distribution</h3><p>Current threat severity mix</p></div>
          <div className="risk-total"><strong>{totalRisk}</strong><span>Threats</span></div>
        </div>
        <div className="risk-list" aria-label="Threat severity distribution">
          {risks.map((risk) => {
            const RiskIcon = risk.icon;
            const selected = selectedRisk === risk.name;
            const dimmed = Boolean(selectedRisk) && !selected;
            return (
              <button
                type="button"
                key={risk.name}
                className={`risk-row risk-${risk.tone}${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}`}
                onClick={() => setSelectedRisk(selected ? null : risk.name)}
                aria-pressed={selected}
              >
                <span className="risk-label"><RiskIcon className="risk-icon" size={15} strokeWidth={2.1} aria-hidden="true" />{risk.name}</span>
                <strong>{risk.value}</strong>
                <span className="risk-track"><i style={{ width: `${(risk.value / maxRisk) * 100}%` }} /></span>
                <small>{((risk.value / totalRisk) * 100).toFixed(1)}%</small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
    <div className="analytics-notes">
      <div><Waves/><strong>12.8%</strong><span>Event growth vs previous 24h</span></div>
      <div><Shield/><strong>30</strong><span>Total threats across all severities</span></div>
      <div><Activity/><strong>99.9%</strong><span>Monitoring availability</span></div>
    </div>
  </div>;
}

function AdminLogsPage() {
  const { isAdmin, adminLogs } = useAuth();
  const [logSearch, setLogSearch] = useState("");
  const [logAction, setLogAction] = useState("All");

  if (!isAdmin) return null;

  // Admin Logs is intentionally limited to authentication and account-management
  // activity. Settings changes are not displayed in this audit view.
  const actionLabels: Record<string, string> = {
    LOGIN: "Login",
    LOGIN_FAILED: "Failed login",
    LOGIN_BLOCKED: "Blocked login",
    LOGOUT: "Logout",
    CREATE_ACCOUNT: "Account created",
    PASSWORD_RESET: "Password reset",
    REVOKE_ACCESS: "Access revoked",
    ROLE_CHANGED: "Role changed",
  };

  const visibleActions = new Set(Object.keys(actionLabels));
  const visibleLogs = adminLogs.filter((log) => visibleActions.has(log.action));

  const filteredLogs = visibleLogs.filter((log) => {
    const q = logSearch.trim().toLowerCase();
    const actionMatch = logAction === "All" || log.action === logAction;
    const textMatch = !q || `${log.actor} ${log.action} ${log.target} ${log.details}`.toLowerCase().includes(q);
    return actionMatch && textMatch;
  });



  return <div className="section-page">
    <div className="section-heading">
      <div>
        <span className="eyebrow">SETTINGS · ADMIN LOGS</span>
        <h2>Admin Logs</h2>
        <p>Review admin authentication, account and permission activity.</p>
      </div>
      <div className="admin-log-page-badge"><ShieldCheck size={14}/> ADMIN ONLY</div>
    </div>

    <div className="settings-subnav">
      <NavLink to="/settings" end>General Settings</NavLink>
      <NavLink to="/settings/admin-logs"><ClipboardList size={14}/> Admin Logs</NavLink>
    </div>

    <section className="settings-card admin-logs-card admin-logs-page-card">
      <div className="settings-card-heading admin-logs-heading">
        <div className="placeholder-icon"><ClipboardList size={22}/></div>
        <div>
          <div className="admin-only-label"><ShieldCheck size={13}/> ADMIN ONLY</div>
          <h3>Audit history</h3>
          <p>Records are maintained locally in this browser and show administrator authentication and account activity only.</p>
        </div>
        <div className="admin-log-count"><strong>{visibleLogs.length}</strong><span>records</span></div>
      </div>

      <div className="admin-log-toolbar">
        <label><Search size={14}/><input value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Search actor, action, target..." /></label>
        <select value={logAction} onChange={(e) => setLogAction(e.target.value)} aria-label="Filter admin log action">
          <option>All</option>
          {Object.keys(actionLabels).map((action) => <option key={action} value={action}>{actionLabels[action]}</option>)}
        </select>
      </div>

      <div className="admin-log-table-wrap">
        {filteredLogs.length === 0 ? (
          <div className="admin-log-empty"><ClipboardList size={22}/><strong>No audit records found</strong><span>Administrative activity will appear here automatically.</span></div>
        ) : (
          <div className="admin-log-list">
            {filteredLogs.map((log) => {
              const failed = log.action.includes("FAILED") || log.action.includes("BLOCKED");
              const positive = ["LOGIN", "CREATE_ACCOUNT", "ROLE_CHANGED"].includes(log.action);
              return <div className="admin-log-row" key={log.id}>
                <div className={`admin-log-icon ${failed ? "danger" : positive ? "success" : "neutral"}`}>
                  {failed ? <CircleX size={16}/> : positive ? <CircleCheck size={16}/> : <Clock3 size={16}/>} 
                </div>
                <div className="admin-log-main">
                  <div className="admin-log-topline"><strong>{actionLabels[log.action] ?? log.action}</strong><span>{new Intl.DateTimeFormat(undefined,{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(log.timestamp))}</span></div>
                  <p><b>{log.actor}</b> → <b>{log.target}</b> · {log.details}</p>
                </div>
              </div>;
            })}
          </div>
        )}
      </div>
      <div className="admin-log-footer"><ShieldCheck size={14}/> Admin-only audit trail · {filteredLogs.length} of {visibleLogs.length} records shown.</div>
    </section>
  </div>;
}

function SettingsPage() {
  const { canWrite, isAdmin, user, recordAdminLog } = useAuth();
  const { theme, setTheme } = useTheme();
  const [enabled, setEnabled] = useState({ alerts: true, refresh: true, compact: false });

  const toggle = (key: keyof typeof enabled, title: string) => {
    if (!canWrite) return;
    setEnabled((v) => ({ ...v, [key]: !v[key] }));
    recordAdminLog(user?.username ?? "unknown", "SETTING_CHANGED", title, `${title} ${enabled[key] ? "disabled" : "enabled"}`);
  };

  // Theme is a personal console preference. Every authenticated user can
  // change it, while a fresh login starts in dark mode. Theme changes are
  // intentionally excluded from Admin Logs.
  const changeTheme = (nextTheme: "dark" | "light") => {
    if (nextTheme === theme) return;
    setTheme(nextTheme);
  };

  const items: [keyof typeof enabled,string,string][] = [
    ["alerts","Security notifications","Show new critical and high-severity notifications in the topbar."],
    ["refresh","Automatic refresh","Refresh operational data periodically while the dashboard is open."],
    ["compact","Compact tables","Use tighter table rows for high-volume investigation views."],
  ];

  return <div className="section-page">
    <div className="section-heading">
      <div><span className="eyebrow">SYSTEM</span><h2>System Settings</h2><p>Configure operator preferences for the SentinelSOC console.</p></div>
      <span className="settings-saved"><Check size={14}/> Local settings</span>
    </div>

    <div className="settings-subnav">
      <NavLink to="/settings" end>General Settings</NavLink>
      {isAdmin && <NavLink to="/settings/admin-logs"><ClipboardList size={14}/> Admin Logs</NavLink>}
    </div>

    <section className="settings-card">
      <div className="settings-card-heading"><div className="placeholder-icon"><SlidersHorizontal size={22}/></div><div><h3>Console Preferences</h3><p>These settings are stored locally in this browser.</p></div></div>
      {!canWrite && <div className="readonly-notice">Read-only access: settings changes are disabled for this account.</div>}
      {items.map(([key,title,desc])=><button className="setting-row" key={key} onClick={()=>toggle(key,title)} disabled={!canWrite}><div><strong>{title}</strong><span>{desc}</span></div>{enabled[key] ? <ToggleRight size={31} className="toggle-on"/> : <ToggleLeft size={31} className="toggle-off"/>}</button>)}

      <div className="setting-row theme-setting-row">
        <div>
          <strong>Theme</strong>
          <span>Choose your preferred appearance for the entire SentinelSOC console.</span>
        </div>
        <div className="theme-switch" role="group" aria-label="Theme">
          <button
            type="button"
            className={theme === "dark" ? "active" : ""}
            onClick={() => changeTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            <Moon size={14} /> Dark
          </button>
          <button
            type="button"
            className={theme === "light" ? "active" : ""}
            onClick={() => changeTheme("light")}
            aria-pressed={theme === "light"}
          >
            <Sun size={14} /> Light
          </button>
        </div>
      </div>
    </section>

    <section className="settings-card">
      <div className="settings-card-heading"><div className="placeholder-icon"><Shield size={22}/></div><div><h3>System Information</h3><p>Current SentinelSOC environment</p></div></div>
      <div className="info-grid"><div><span>Application</span><strong>SentinelSOC</strong></div><div><span>Version</span><strong>v1.0.0</strong></div><div><span>Backend</span><strong>FastAPI · Port 8000</strong></div><div><span>Frontend</span><strong>Vite · Port 5173</strong></div></div>
    </section>
  </div>;
}

export default function SectionPage({ type }: SectionPageProps) {
  if (type === "threats") return <ThreatsPage />;
  if (type === "alerts") return <AlertsPage />;
  if (type === "logs") return <LogsPage />;
  if (type === "analytics") return <AnalyticsPage />;
  if (type === "admin-logs") return <AdminLogsPage />;
  return <SettingsPage />;
}
