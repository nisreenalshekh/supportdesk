import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, Inbox } from "lucide-react";
import KpiCard from "../components/ui/KpiCard";
import TicketTable from "../components/tickets/TicketTable";
import { CATEGORIES, CATEGORY_LABEL } from "../lib/labels";
import { MONTH, TODAY, WEEK } from "../lib/stats";
import { getSla } from "../lib/time";
import { useStore } from "../store/StoreContext";

type Range = "today" | "week" | "month";
const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
];
const CATEGORY_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#94a3b8"];
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { currentUser, tickets } = useStore();
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("week");

  const stats = useMemo(() => {
    const unresolved = tickets.filter((t) => t.status !== "resolved");
    const today = new Date().toDateString();
    return {
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      resolvedToday: tickets.filter((t) => t.resolvedAt && new Date(t.resolvedAt).toDateString() === today).length,
      breaches: unresolved.filter((t) => getSla(t).urgent).length,
      attention: [...unresolved]
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.slaDueAt.localeCompare(b.slaDueAt))
        .slice(0, 5),
      byCategory: CATEGORIES.map((c, i) => ({
        category: c,
        count: tickets.filter((t) => t.category === c).length,
        color: CATEGORY_COLORS[i],
      })).filter((c) => c.count > 0),
    };
  }, [tickets]);

  const chartData = range === "today" ? TODAY : range === "month" ? MONTH : WEEK;
  const total = tickets.length || 1;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {currentUser?.name.split(" ")[0]} 👋
          </h1>
          <div className="sub">
            Here's what's happening with support today. {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        <select className="select select--compact" value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range">
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="kpis">
        <KpiCard label="Open tickets" value={stats.open} icon={<Inbox size={18} />} color="#2563eb" soft="var(--blue-soft)" delta="▼ 12%" good onClick={() => navigate("/tickets?status=open")} />
        <KpiCard label="In progress" value={stats.inProgress} icon={<Clock size={18} />} color="#d97706" soft="var(--amber-soft)" delta="▲ 3" good={false} onClick={() => navigate("/tickets?status=in_progress")} />
        <KpiCard label="Resolved today" value={stats.resolvedToday} icon={<CheckCircle2 size={18} />} color="#16a34a" soft="var(--green-soft)" delta="▲ 22%" good onClick={() => navigate("/tickets?status=resolved")} />
        <KpiCard label="SLA at risk" value={stats.breaches} icon={<AlertTriangle size={18} />} color="#e5484d" soft="var(--red-soft)" delta="▲ 1" good={false} onClick={() => navigate("/tickets?sla=urgent")} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__head">
            <h3>Tickets created vs resolved</h3>
            <span className="sub">
              Avg. resolution <b style={{ color: "var(--ink)" }}>3h 42m</b>
            </span>
          </div>
          <div style={{ height: 230, padding: "10px 10px 6px 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 16, top: 10 }}>
                <defs>
                  <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={36} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)" }} />
                <Area type="monotone" dataKey="created" name="Created" stroke="#4f46e5" strokeWidth={2.5} fill="url(#created)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <h3>By category</h3>
          </div>
          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
            {stats.byCategory.map((c) => {
              const pct = Math.round((c.count / total) * 100);
              return (
                <div className="cat-row" key={c.category}>
                  <div className="cat-row__top">
                    <span>{CATEGORY_LABEL[c.category]}</span>
                    <b>{pct}%</b>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head" style={{ paddingBottom: 14 }}>
          <h3>Needs attention</h3>
          <Link to="/tickets" style={{ color: "var(--brand)", fontWeight: 600 }}>
            View all →
          </Link>
        </div>
        <TicketTable tickets={stats.attention} />
      </div>
    </>
  );
}
