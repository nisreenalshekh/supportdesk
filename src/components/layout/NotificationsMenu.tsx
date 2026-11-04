import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../lib/time";
import { useStore } from "../../store/StoreContext";
import IconButton from "../ui/IconButton";
import Menu from "../ui/Menu";

export default function NotificationsMenu() {
  const { notifications, markNotificationsRead, isAgent, currentUser, tickets } = useStore();
  const navigate = useNavigate();

  // employees only see notifications about their own tickets
  const visible = notifications.filter((n) => {
    if (isAgent) return true;
    const ticket = tickets.find((t) => t.id === n.ticketId);
    return ticket?.requesterId === currentUser?.id;
  });
  const unread = visible.filter((n) => !n.read).length;

  return (
    <Menu
      width={320}
      trigger={({ toggle }) => (
        <IconButton label="Notifications" dot={unread > 0} onClick={toggle}>
          <Bell size={18} />
        </IconButton>
      )}
    >
      {(close) => (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 10px 6px" }}>
            <b>Notifications</b>
            {unread > 0 && (
              <button style={{ width: "auto", padding: "2px 6px", color: "var(--brand)", fontWeight: 600, fontSize: 13 }} onClick={markNotificationsRead}>
                Mark all read
              </button>
            )}
          </div>
          {visible.length === 0 && <p className="muted" style={{ padding: 10 }}>You're all caught up.</p>}
          {visible.slice(0, 6).map((n) => (
            <button
              key={n.id}
              className={`notif-item ${n.read ? "" : "notif-item--unread"}`}
              onClick={() => {
                navigate(`/tickets/${n.ticketId}`);
                close();
              }}
            >
              {n.text}
              <small>{timeAgo(n.createdAt)}</small>
            </button>
          ))}
        </>
      )}
    </Menu>
  );
}
