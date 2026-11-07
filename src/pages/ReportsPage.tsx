import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Download, Inbox, Smile, CheckCircle2 } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import KpiCard from "../components/ui/KpiCard";
import { AGENT_STATS, MONTH, TODAY, WEEK } from "../lib/stats";
import { useStore } from "../store/StoreContext";

type Range = "today" | "week" | "month";

export default function ReportsPage() {
  const { getUser } = useStore();
  const [range, setRange] = useState<Range>("week");
  const data = range === "today" ? TODAY : range === "month" ? MONTH : WEEK;
  const created = data.reduce((sum, d) => sum + d.created, 0);
  const resolved = data.reduce((sum, d) => sum + d.resolved, 0);
  const onTime = Math.round(resolved * 0.94);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <div className="sub">Support performance. The numbers on this page are sample data until a backend is connected.</div>
        </div>
        <div className="page-head__actions">
          <select className="select select--compact" value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range">
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <Button icon={<Download size={16} />} onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="kpis">
        <KpiCard label="Tickets created" value={created} icon={<Inbox size={18} />} color="#2563eb" soft="var(--blue-soft)" delta="▲ 8%" good={false} />
        <KpiCard label="Avg. first response" value="18m" icon={<Clock size={18} />} color="#d97706" soft="var(--amber-soft)" delta="▼ 6m" good />
        <KpiCard label="Avg. resolution" value="3h 42m" icon={<CheckCircle2 size={18} />} color="#16a34a" soft="var(--green-soft)" delta="▼ 24m" good />
        <KpiCard label="Satisfaction" value="4.7/5" icon={<Smile size={18} />} color="#7c3aed" soft="#f1e9ff" delta="▲ 0.2" good />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h3>Created vs resolved</h3>
          </div>
          <div style={{ height: 260, padding: "10px 10px 6px 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 0, right: 16, top: 10 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={36} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--gray-soft)" }} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)" }} />
                <Legend iconType="square" />
                <Bar dataKey="created" name="Created" fill="#6366f1" radius={[5, 5, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#a5b4fc" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>SLA compliance</h3>
          </div>
          <div style={{ height: 200, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ v: 94 }, { v: 6 }]} dataKey="v" innerRadius={62} outerRadius={82} startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill="#16a34a" />
                  <Cell fill="var(--gray-soft)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", pointerEvents: "none" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>94%</div>
                <small className="muted">within SLA</small>
              </div>
            </div>
          </div>
          <p className="sub" style={{ textAlign: "center", paddingBottom: 18 }}>
            {onTime} of {resolved} tickets resolved on time
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card__head" style={{ paddingBottom: 12 }}>
          <h3>Team performance</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Resolved</th>
                <th>Avg. time</th>
                <th>SLA met</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_STATS.map((a) => (
                <tr key={a.agentId}>
                  <td>
                    <div className="who">
                      <Avatar name={getUser(a.agentId)?.name ?? "?"} size={30} />
                      <b>{getUser(a.agentId)?.name}</b>
                    </div>
                  </td>
                  <td>{a.resolved}</td>
                  <td>{a.avgTime}</td>
                  <td>
                    <b className="up">{a.slaMet}%</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
