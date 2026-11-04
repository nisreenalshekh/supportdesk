import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSla } from "../../lib/time";
import { CATEGORY_LABEL, PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "../../lib/labels";
import { useStore } from "../../store/StoreContext";
import type { Ticket } from "../../types";
import Avatar from "../ui/Avatar";
import { PriorityBadge, StatusPill } from "../ui/Badges";
import IconButton from "../ui/IconButton";
import Menu from "../ui/Menu";
import { useToast } from "../ui/Toast";

export type SortKey = "id" | "priority" | "status" | "sla";

interface Props {
  tickets: Ticket[];
  // optional features, the dashboard uses the plain version
  selectable?: boolean;
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  sort?: { key: SortKey; dir: "asc" | "desc" };
  onSort?: (key: SortKey) => void;
  rowMenu?: boolean;
  onDelete?: (id: string) => void;
}

export default function TicketTable({ tickets, selectable, selected = [], onSelect, sort, onSort, rowMenu, onDelete }: Props) {
  const { getUser, currentUser, updateTicket } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const allChecked = tickets.length > 0 && tickets.every((t) => selected.includes(t.id));
  const toggleAll = () => onSelect?.(allChecked ? [] : tickets.map((t) => t.id));
  const toggleOne = (id: string) => onSelect?.(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const header = (label: string, key?: SortKey) => {
    if (!key || !onSort) return <th>{label}</th>;
    const arrow = sort?.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : "";
    return (
      <th className="sortable" onClick={() => onSort(key)} aria-sort={sort?.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        {label}
        {arrow}
      </th>
    );
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: 40 }}>
                <input type="checkbox" className="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
              </th>
            )}
            {header("ID", "id")}
            {header("Subject")}
            {header("Priority", "priority")}
            {header("Status", "status")}
            {header("Assignee")}
            {header("SLA", "sla")}
            {rowMenu && <th style={{ width: 48 }} />}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const requester = getUser(t.requesterId);
            const assignee = getUser(t.assigneeId);
            const sla = getSla(t);
            return (
              <tr key={t.id} className="clickable" onClick={() => navigate(`/tickets/${t.id}`)}>
                {selectable && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="checkbox" checked={selected.includes(t.id)} onChange={() => toggleOne(t.id)} aria-label={`Select ${t.id}`} />
                  </td>
                )}
                <td className="ticket-id">{t.id}</td>
                <td className="cell-title">
                  <b>{t.subject}</b>
                  <small>
                    {requester?.name} · {CATEGORY_LABEL[t.category]}
                  </small>
                </td>
                <td>
                  <PriorityBadge priority={t.priority} />
                </td>
                <td>
                  <StatusPill status={t.status} />
                </td>
                <td>
                  {assignee ? (
                    <div className="who">
                      <Avatar name={assignee.name} size={26} />
                      {assignee.name.split(" ")[0]} {assignee.name.split(" ")[1]?.[0]}.
                    </div>
                  ) : (
                    <span className="muted">— Unassigned</span>
                  )}
                </td>
                <td className={`sla ${sla.urgent ? "sla--urgent" : ""}`}>{sla.text}</td>
                {rowMenu && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <Menu
                      width={210}
                      trigger={({ toggle }) => (
                        <IconButton label={`Actions for ${t.id}`} bare onClick={toggle}>
                          <MoreHorizontal size={18} />
                        </IconButton>
                      )}
                    >
                      {(close) => (
                        <>
                          <button
                            onClick={() => {
                              updateTicket(t.id, { assigneeId: currentUser?.id ?? null, status: t.status === "open" ? "in_progress" : t.status });
                              toast(`${t.id} assigned to you`);
                              close();
                            }}
                          >
                            Assign to me
                          </button>
                          <hr />
                          <div className="menu__label">Change status</div>
                          {STATUSES.filter((s) => s !== t.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                updateTicket(t.id, { status: s });
                                toast(`${t.id} marked as ${STATUS_LABEL[s].toLowerCase()}`);
                                close();
                              }}
                            >
                              {STATUS_LABEL[s]}
                            </button>
                          ))}
                          <hr />
                          <div className="menu__label">Change priority</div>
                          {PRIORITIES.filter((p) => p !== t.priority).map((p) => (
                            <button
                              key={p}
                              onClick={() => {
                                updateTicket(t.id, { priority: p });
                                toast(`${t.id} priority set to ${PRIORITY_LABEL[p].toLowerCase()}`);
                                close();
                              }}
                            >
                              {PRIORITY_LABEL[p]}
                            </button>
                          ))}
                          <hr />
                          <button
                            className="danger"
                            onClick={() => {
                              onDelete?.(t.id);
                              close();
                            }}
                          >
                            Delete ticket
                          </button>
                        </>
                      )}
                    </Menu>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
