import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Paperclip, Send, Ticket as TicketIcon } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import { CategoryTag, PriorityBadge, StatusPill } from "../components/ui/Badges";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { CATEGORY_LABEL, PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "../lib/labels";
import { formatClock, getSla } from "../lib/time";
import { useStore } from "../store/StoreContext";
import type { Priority, Status } from "../types";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { tickets, users, getUser, currentUser, isAgent, updateTicket, addMessage } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [reply, setReply] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ticket = tickets.find((t) => t.id === id);

  // employees can only open their own tickets
  if (!ticket || (!isAgent && ticket.requesterId !== currentUser?.id)) {
    return (
      <div className="card">
        <EmptyState
          icon={TicketIcon}
          title="Ticket not found"
          text="It may have been deleted, or you don't have access to it."
          action={<Button onClick={() => navigate(isAgent ? "/tickets" : "/my-tickets")}>Back to tickets</Button>}
        />
      </div>
    );
  }

  const requester = getUser(ticket.requesterId);
  const assignee = getUser(ticket.assigneeId);
  const sla = getSla(ticket);
  const agents = users.filter((u) => u.role === "agent");
  const messages = ticket.messages.filter((m) => isAgent || m.kind === "reply");

  const send = () => {
    const body = reply.trim();
    if (!body) return;
    addMessage(ticket.id, body, mode);

    if (mode === "reply" && isAgent) {
      // first agent reply on an unassigned ticket takes it
      if (!ticket.assigneeId) updateTicket(ticket.id, { assigneeId: currentUser?.id ?? null, status: "in_progress" });
      else if (ticket.status === "open") updateTicket(ticket.id, { status: "in_progress" });
    }
    // user answered a question, so the ticket is active again
    if (!isAgent && ticket.status === "waiting") updateTicket(ticket.id, { status: "in_progress" });

    setReply("");
    toast(mode === "note" ? "Internal note added" : "Reply sent");
  };

  const markResolved = () => {
    updateTicket(ticket.id, { status: "resolved" });
    addMessage(ticket.id, "Ticket marked as resolved.", "note");
    toast(`${ticket.id} resolved`);
  };

  // vertical progress tracker
  const fixing = ticket.status === "in_progress" || ticket.status === "waiting";
  const resolved = ticket.status === "resolved";
  const steps = [
    { label: "Reported", at: ticket.createdAt, state: "done" },
    { label: "Assigned to IT", at: ticket.assignedAt, state: ticket.assigneeId ? "done" : "future" },
    { label: "Being fixed", at: null, state: resolved ? "done" : fixing ? "now" : "future" },
    { label: "Resolved & closed", at: ticket.resolvedAt, state: resolved ? "done" : "future" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <Breadcrumbs trail={[{ label: "Tickets", to: isAgent ? "/tickets" : "/my-tickets" }]} current={ticket.id} />
          <h1>{ticket.subject}</h1>
          <div className="ticket-meta">
            <StatusPill status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <CategoryTag category={ticket.category} />
          </div>
        </div>
        {isAgent && (
          <div className="page-head__actions">
            <Button variant="ghost" onClick={() => setReassignOpen(true)}>
              Reassign
            </Button>
            {ticket.status !== "resolved" && (
              <Button variant="success" icon={<Check size={18} />} onClick={() => setConfirmResolve(true)}>
                Mark resolved
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid-detail">
        <div>
          <div className="card">
            <div className="card__head" style={{ paddingBottom: 6 }}>
              <h3>Conversation</h3>
              <span className="sub">{messages.length} updates</span>
            </div>
            <div className="timeline">
              {messages.map((m) => {
                const author = getUser(m.authorId);
                const fromAgent = author?.role === "agent";
                return (
                  <div className="msg" key={m.id}>
                    <Avatar name={author?.name ?? "?"} size={36} />
                    <div className="msg__main">
                      <b>{m.kind === "note" ? "Internal note" : author?.name}</b>{" "}
                      <span className="msg__time">
                        · {formatClock(m.createdAt)}
                        {m.kind === "note" && ` · ${author?.name} · visible to IT only`}
                      </span>
                      <div className={`bubble ${m.kind === "note" ? "bubble--note" : fromAgent ? "bubble--agent" : ""}`}>{m.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {ticket.status !== "resolved" ? (
            <div className="card composer">
              <textarea
                className="textarea"
                style={{ minHeight: 84 }}
                placeholder={mode === "note" ? "Write an internal note (only IT can see it)…" : `Write a reply to ${requester?.name.split(" ")[0]}…`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && send()}
              />
              <div className="composer__bar">
                <div className="composer__tabs">
                  <button type="button" aria-label="Attach a file" onClick={() => fileRef.current?.click()}>
                    <Paperclip size={18} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setReply((r) => `${r}${r ? "\n" : ""}[Attached: ${f.name}]`);
                    }}
                  />
                  <button type="button" className={mode === "reply" ? "on" : ""} onClick={() => setMode("reply")}>
                    Reply
                  </button>
                  {isAgent && (
                    <button type="button" className={mode === "note" ? "on" : ""} onClick={() => setMode("note")}>
                      Internal note
                    </button>
                  )}
                </div>
                <Button icon={<Send size={16} />} disabled={!reply.trim()} onClick={send}>
                  {mode === "note" ? "Add note" : "Send reply"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="sub" style={{ marginTop: 16 }}>
              This ticket is resolved. Open a new ticket if the problem comes back.
            </p>
          )}
        </div>

        <div>
          <div className="card details">
            <div className="card__head">
              <h3>Details</h3>
            </div>
            <dl>
              <dt>Requester</dt>
              <dd>
                <div className="who">
                  <Avatar name={requester?.name ?? "?"} size={24} />
                  {requester?.name}
                </div>
              </dd>
              <dt>Department</dt>
              <dd>{requester?.department}</dd>

              <dt>Assignee</dt>
              <dd>
                {isAgent ? (
                  <select className="select" value={ticket.assigneeId ?? ""} onChange={(e) => updateTicket(ticket.id, { assigneeId: e.target.value || null })}>
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : assignee ? (
                  <div className="who">
                    <Avatar name={assignee.name} size={24} />
                    {assignee.name}
                  </div>
                ) : (
                  <span className="muted">Not assigned yet</span>
                )}
              </dd>

              {isAgent && (
                <>
                  <dt>Status</dt>
                  <dd>
                    <select className="select" value={ticket.status} onChange={(e) => updateTicket(ticket.id, { status: e.target.value as Status })}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </dd>
                  <dt>Priority</dt>
                  <dd>
                    <select className="select" value={ticket.priority} onChange={(e) => updateTicket(ticket.id, { priority: e.target.value as Priority })}>
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_LABEL[p]}
                        </option>
                      ))}
                    </select>
                  </dd>
                </>
              )}

              <dt>Category</dt>
              <dd>{CATEGORY_LABEL[ticket.category]}</dd>
              <dt>Created</dt>
              <dd>{formatClock(ticket.createdAt)}</dd>
              <dt>SLA</dt>
              <dd className={sla.urgent ? "down" : ""}>{sla.text}</dd>
            </dl>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card__head">
              <h3>Ticket progress</h3>
            </div>
            <div className="stepper-v">
              {steps.map((s) => (
                <div key={s.label} className={`stepper-v__row ${s.state === "future" ? "stepper-v__row--future" : ""}`}>
                  <span className={`stepper-v__dot ${s.state === "done" ? "stepper-v__dot--done" : s.state === "now" ? "stepper-v__dot--now" : ""}`}>
                    {s.state === "done" && <Check size={13} />}
                  </span>
                  {s.state === "now" ? <b>{s.label}</b> : s.label}
                  <small>{s.state === "now" ? "now" : s.at ? formatClock(s.at).replace("Today, ", "") : ""}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {confirmResolve && (
        <ConfirmDialog title="Mark as resolved?" message="The requester will be notified that the problem is fixed." confirmLabel="Mark resolved" onClose={() => setConfirmResolve(false)} onConfirm={markResolved} />
      )}

      {reassignOpen && (
        <Modal title="Reassign ticket" onClose={() => setReassignOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {agents.map((a) => (
              <button
                key={a.id}
                className="choice"
                onClick={() => {
                  updateTicket(ticket.id, { assigneeId: a.id });
                  toast(`Assigned to ${a.name}`);
                  setReassignOpen(false);
                }}
              >
                <Avatar name={a.name} size={36} />
                <span>
                  <b>{a.name}</b>
                  <small>{a.jobTitle}</small>
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
