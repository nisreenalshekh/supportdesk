import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import { PriorityBadge } from "../components/ui/Badges";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import TicketTable from "../components/tickets/TicketTable";
import { STATUSES, STATUS_LABEL } from "../lib/labels";
import { getSla } from "../lib/time";
import { useStore } from "../store/StoreContext";
import type { Status } from "../types";

const COLUMN_COLOR: Record<Status, string> = {
  open: "#2563eb",
  in_progress: "#d97706",
  waiting: "#64748b",
  resolved: "#16a34a",
};

export default function BoardPage() {
  const { tickets, currentUser, getUser, updateTicket } = useStore();
  const toast = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);

  // the board shows my tickets, plus anything unassigned that is still open
  const mine = tickets.filter((t) => t.assigneeId === currentUser?.id || (t.status === "open" && !t.assigneeId));

  const drop = (status: Status) => {
    setOverColumn(null);
    const ticket = tickets.find((t) => t.id === dragId);
    setDragId(null);
    if (!ticket || ticket.status === status) return;
    updateTicket(ticket.id, { status, assigneeId: ticket.assigneeId ?? currentUser?.id ?? null });
    toast(`${ticket.id} moved to ${STATUS_LABEL[status]}`);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Assigned to me</h1>
          <div className="sub">Drag tickets between columns to update their status</div>
        </div>
        <div className="view-toggle">
          <Button variant={view === "board" ? "primary" : "ghost"} size="sm" onClick={() => setView("board")}>
            Board
          </Button>
          <Button variant={view === "list" ? "primary" : "ghost"} size="sm" onClick={() => setView("list")}>
            List
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <div className="card">
          <TicketTable tickets={mine} />
        </div>
      ) : (
        <div className="board">
          {STATUSES.map((status) => {
            const items = mine.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className={`column ${overColumn === status ? "column--over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverColumn(status);
                }}
                onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
                onDrop={() => drop(status)}
              >
                <div className="column__title">
                  <span className="dot-sm" style={{ background: COLUMN_COLOR[status] }} />
                  {STATUS_LABEL[status]}
                  <em>{items.length}</em>
                </div>

                {items.map((t) => {
                  const requester = getUser(t.requesterId);
                  const sla = getSla(t);
                  return (
                    <Link
                      to={`/tickets/${t.id}`}
                      key={t.id}
                      className={`kcard ${dragId === t.id ? "kcard--dragging" : ""}`}
                      draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverColumn(null);
                      }}
                    >
                      <div className="kcard__top">
                        <span className="ticket-id">{t.id}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <b>{t.subject}</b>
                      <div className="kcard__foot">
                        <div className="who">
                          <Avatar name={requester?.name ?? "?"} size={24} />
                          {requester?.name.split(" ")[0]}
                        </div>
                        <span className={sla.urgent ? "down" : ""}>{sla.text.replace(" left", "")}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
