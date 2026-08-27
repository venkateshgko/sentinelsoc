import { Activity, AlertTriangle, BarChart3, FileSearch, LayoutDashboard, Settings, Shield, ShieldAlert, UserCog } from "lucide-react";
import { useAuth } from "../../auth";
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Incidents", path: "/incidents", icon: ShieldAlert },
  { name: "Threats", path: "/threats", icon: AlertTriangle },
  { name: "Alerts", path: "/alerts", icon: Activity },
  { name: "Logs", path: "/logs", icon: FileSearch },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Shield size={24} strokeWidth={2} /></div>
        <div className="brand-text">
          <h1>SentinelSOC</h1>
          <span>Security Operations</span>
        </div>
      </div>

      <div className="sidebar-section-title">MONITORING</div>
      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon className="nav-icon" size={25} strokeWidth={1.8} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-section-title system-title">SYSTEM</div>
      <nav className="sidebar-nav">
        {isAdmin && (
          <NavLink to="/access-control" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <UserCog className="nav-icon" size={26} strokeWidth={1.8} />
            <span>Access Control</span>
          </NavLink>
        )}
        <NavLink to="/settings" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Settings className="nav-icon" size={26} strokeWidth={1.8} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>All systems operational</strong>
            <span>Updated just now</span>
          </div>
        </div>
        <div className="version">SentinelSOC v1.0.0</div>
      </div>
    </aside>
  );
}
