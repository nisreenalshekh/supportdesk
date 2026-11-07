import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Plus, Ticket } from "lucide-react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import KpiCard from "../components/ui/KpiCard";
import Tabs from "../components/ui/Tabs";
import { StatusPill } from "../components/ui/Badges";
import { timeAgo } from "../lib/time";
import { useStore } from "../store/StoreContext";
import type { Ticket as TicketType } from "../types";

type Tab = "active" | "resolved" | "all";

// 1 = reported, 2 = assigned, 3 = being fixed, 4 = done
function progressOf(t: TicketType) {
  if (t.status === "resolved") return 4;
  if (t.status === "in_progress" || t.status === "waiting") return 3;
  return t.assigneeId ? 2 : 1;
}

export default function MyTicketsPage() {
  const { tickets, currentUser, getUser } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("active");

  const mine = tickets.filter((t) => t.requesterId === currentUser?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = mine.filter((t) => t.status !== "resolved");
  const resolved = mine.filter((t) => t.status === "resolved");
  const waitingOnMe = mine.filter((t) => t.status === "waiting").length;
  const shown = tab === "active" ? active : tab === "resolved" ? resolved : mine;

  const lastUpdate = (t: TicketType) => {
    const last = t.messages[t.messages.length - 1];
    if (t.status === "resolved" && t.resolvedAt) return `Closed · ${timeAgo(t.resolvedAt)}`;
    if (last && last.authorId !== currentUser?.id) return `${getUser(last.authorId)?.name.split(" ")[0]} ${t.status === "waiting" ? "asked a question" : "replied"} · ${timeAgo(last.createdAt)}`;
    return `Submitted · ${timeAgo(t.createdAt)}`;
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My tickets</h1>
          <div className="sub">Everything you've reported, and where it stands</div>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => navigate("/tickets/new")}>
          Report a problem
        </Button>
      </div>

      <div className="kpis kpis--3">
        <KpiCard label="Active" value={active.length} icon={<Clock size={18} />} color="#d97706" soft="var(--amber-soft)" />
        <KpiCard label="Resolved" value={resolved.length} icon={<CheckCircle2 size={18} />} color="#16a34a" soft="var(--green-soft)" />
        <KpiCard label="Waiting on you" value={waitingOnMe} icon={<AlertTriangle size={18} />} color="#2563eb" soft="var(--blue-soft)" />
      </div>

      <div className="card">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: "active", label: "Active", count: active.length },
            { value: "resolved", label: "Resolved", count: resolved.length },
            { value: "all", label: "All", count: mine.length },
          ]}
        />
        {shown.length === 0 ? (
          <EmptyState icon={Ticket} title="No tickets here" text="When you report a problem it will show up in this list." action={<Button onClick={() => navigate("/tickets/new")}>Report a problem</Button>} />
        ) : (
          shown.map((t) => (
            <div key={t.id} className={`list-row ${t.status === "waiting" ? "list-row--attention" : ""}`} onClick={() => navigate(`/tickets/${t.id}`)}>
              <div className="list-row__main">
                <span className="ticket-id">{t.id}</span>
                <b className="list-row__title">{t.subject}</b>
                <small className="muted">{lastUpdate(t)}</small>
              </div>
              <div className="mini-progress" aria-label={`Progress ${progressOf(t)} of 4`}>
                {[1, 2, 3, 4].map((n) => (
                  <i key={n} className={n <= progressOf(t) ? "on" : ""} />
                ))}
              </div>
              {t.status === "waiting" ? <span className="pill pill--open">Waiting for you</span> : <StatusPill status={t.status} />}
              <ChevronRight size={18} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
