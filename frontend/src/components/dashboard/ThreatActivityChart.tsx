import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ShieldAlert } from "lucide-react";

interface ThreatActivityPoint { time: string; threats: number; events: number; }
interface Props { data?: ThreatActivityPoint[]; }

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: string | number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const events = payload.find((item) => item.dataKey === "events")?.value ?? 0;
  const threats = payload.find((item) => item.dataKey === "threats")?.value ?? 0;

  return (
    <div className="soc-chart-tooltip" role="status">
      <div className="soc-tooltip-time">{label}</div>
      <div className="soc-tooltip-row events"><Activity size={13} /><span>Events</span><strong>{Number(events).toLocaleString()}</strong></div>
      <div className="soc-tooltip-row threats"><ShieldAlert size={13} /><span>Threats</span><strong>{Number(threats).toLocaleString()}</strong></div>
    </div>
  );
}

export default function ThreatActivityChart({ data = [] }: Props) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div><h3>Threat Activity</h3><p>Security events detected over the last 24 hours</p></div>
        <select defaultValue="24h" aria-label="Chart time range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select>
      </div>
      <div className="chart-legend"><span><i className="legend-threats" />Threats</span><span><i className="legend-events" />Events</span></div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} padding={{ left: 6, right: 6 }} />
            <YAxis tickLine={false} axisLine={false} width={34} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "rgba(154,131,255,.62)", strokeWidth: 1, strokeDasharray: "4 5" }}
              wrapperStyle={{ outline: "none" }}
              allowEscapeViewBox={{ x: false, y: false }}
            />
            <Area type="monotone" dataKey="events" stroke="#4da3ff" strokeWidth={2.2} fill="transparent" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: "#4da3ff" }} />
            <Area type="monotone" dataKey="threats" stroke="#7c5cff" strokeWidth={2.2} fill="rgba(124,92,255,0.13)" activeDot={{ r: 4.5, stroke: "#fff", strokeWidth: 2, fill: "#7c5cff" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
