import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Inbox } from "lucide-react";
import { ConfirmDialog } from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { SearchInput } from "../components/ui/Controls";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import Tabs from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import TicketTable from "../components/tickets/TicketTable";
import type { SortKey } from "../components/tickets/TicketTable";
import { CATEGORIES, CATEGORY_LABEL, PRIORITIES, PRIORITY_LABEL, STATUS_LABEL } from "../lib/labels";
import { getSla } from "../lib/time";
import { useStore } from "../store/StoreContext";
import type { Status, Ticket } from "../types";

const PAGE_SIZE = 7;
const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_RANK = { open: 0, in_progress: 1, waiting: 2, resolved: 3 };

type Tab = "all" | Status;

function toCsv(tickets: Ticket[], nameOf: (id: string | null) => string) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["ID", "Subject", "Requester", "Category", "Priority", "Status", "Assignee", "Created"];
  const rows = tickets.map((t) =>
    [t.id, t.subject, nameOf(t.requesterId), CATEGORY_LABEL[t.category], PRIORITY_LABEL[t.priority], STATUS_LABEL[t.status], nameOf(t.assigneeId), t.createdAt].map(esc).join(","),
  );
  return [head.join(","), ...rows].join("\n");
}

export default function TicketsPage() {
  const { tickets, users, getUser, currentUser, updateTicket, deleteTickets } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "id", dir: "desc" });

  // all filters live in the URL so the page can be linked / refreshed
  const tab = (params.get("status") as Tab) || "all";
  const priority = params.get("priority") ?? "";
  const category = params.get("category") ?? "";
  const assignee = params.get("assignee") ?? "";
  const query = params.get("q") ?? "";
  const slaOnly = params.get("sla") === "urgent";
  const page = Number(params.get("page") ?? 1);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
    setSelected([]);
  };

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      waiting: tickets.filter((t) => t.status === "waiting").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    }),
    [tickets],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = tickets.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (priority && t.priority !== priority) return false;
      if (category && t.category !== category) return false;
      if (assignee === "none" && t.assigneeId) return false;
      if (assignee && assignee !== "none" && t.assigneeId !== assignee) return false;
      if (slaOnly && !(t.status !== "resolved" && getSla(t).urgent)) return false;
      if (q) {
        const requester = getUser(t.requesterId)?.name.toLowerCase() ?? "";
        if (!(t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || requester.includes(q))) return false;
      }
      return true;
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      switch (sort.key) {
        case "priority":
          return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
        case "status":
          return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
        case "sla":
          return a.slaDueAt.localeCompare(b.slaDueAt) * dir;
        default:
          return (Number(a.id.slice(3)) - Number(b.id.slice(3))) * dir;
      }
    });
  }, [tickets, tab, priority, category, assignee, query, slaOnly, sort, getUser]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const agents = users.filter((u) => u.role === "agent");
  const hasFilters = Boolean(priority || category || assignee || query || slaOnly);

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const exportCsv = () => {
    const nameOf = (id: string | null) => getUser(id)?.name ?? "";
    const blob = new Blob([toCsv(filtered, nameOf)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tickets.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} tickets`);
  };

  const bulkAssign = () => {
    selected.forEach((id) => {
      const t = tickets.find((x) => x.id === id);
      if (t && t.status !== "resolved") updateTicket(id, { assigneeId: currentUser?.id ?? null, status: t.status === "open" ? "in_progress" : t.status });
    });
    toast(`${selected.length} tickets assigned to you`);
    setSelected([]);
  };

  const bulkResolve = () => {
    selected.forEach((id) => updateTicket(id, { status: "resolved" }));
    toast(`${selected.length} tickets resolved`);
    setSelected([]);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>All tickets</h1>
          <div className="sub">Track every request from the moment it's reported until it's closed</div>
        </div>
        <Button variant="ghost" icon={<Download size={16} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <div className="card">
        <Tabs
          active={tab}
          onChange={(v) => setParam("status", v === "all" ? "" : v)}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            { value: "open", label: "Open", count: counts.open },
            { value: "in_progress", label: "In progress", count: counts.in_progress },
            { value: "waiting", label: "Waiting", count: counts.waiting },
            { value: "resolved", label: "Resolved", count: counts.resolved },
          ]}
        />

        <div className="filters">
          <div className="grow">
            <SearchInput value={query} onChange={(v) => setParam("q", v)} placeholder="Filter by subject, ID or requester…" />
          </div>
          <select className="select select--compact" value={priority} onChange={(e) => setParam("priority", e.target.value)} aria-label="Priority">
            <option value="">Priority: All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <select className="select select--compact" value={category} onChange={(e) => setParam("category", e.target.value)} aria-label="Category">
            <option value="">Category: All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <select className="select select--compact" value={assignee} onChange={(e) => setParam("assignee", e.target.value)} aria-label="Assignee">
            <option value="">Assignee: Anyone</option>
            <option value="none">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {(hasFilters || tab !== "all") && (
            <Button variant="link" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </Button>
          )}
        </div>

        {pageItems.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No tickets found"
            text={hasFilters ? "Try changing or clearing your filters." : "Nothing here yet."}
            action={hasFilters ? <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button> : undefined}
          />
        ) : (
          <TicketTable tickets={pageItems} selectable selected={selected} onSelect={setSelected} sort={sort} onSort={onSort} rowMenu onDelete={setToDelete} />
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={(p) => setParam("page", String(p))} />
      </div>

      {selected.length > 0 && (
        <div className="bulk-bar">
          <b>{selected.length} selected</b>
          <Button size="sm" variant="ghost" onClick={bulkAssign}>
            Assign to me
          </Button>
          <Button size="sm" variant="success" onClick={bulkResolve}>
            Resolve
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Cancel
          </Button>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          danger
          title={`Delete ${toDelete}?`}
          message="This removes the ticket and its whole conversation. You can't undo this."
          confirmLabel="Delete"
          onClose={() => setToDelete(null)}
          onConfirm={() => {
            deleteTickets([toDelete]);
            toast(`${toDelete} deleted`);
            navigate("/tickets", { replace: true });
          }}
        />
      )}
    </>
  );
}
