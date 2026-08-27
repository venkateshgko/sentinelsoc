import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "danger" | "warning" | "success";
}

export default function KpiCard({ title, value, change, description, icon: Icon, variant = "default" }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${variant}`}><Icon size={18} /></div>
      <div className="kpi-content">
        <div className="kpi-heading"><span>{title}</span><span className={`kpi-change ${variant}`}>{change}</span></div>
        <strong>{value}</strong>
        <span className="kpi-description">{description}</span>
      </div>
    </div>
  );
}
