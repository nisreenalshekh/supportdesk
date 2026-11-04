import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, Inbox, LayoutGrid, LogOut, Moon, PlusCircle, Repeat, Settings, Sun, Ticket, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "../../store/StoreContext";
import Avatar from "../ui/Avatar";
import Menu from "../ui/Menu";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

function Item({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end={item.to === "/tickets"} className="nav-link" onClick={onNavigate}>
      <Icon size={18} />
      {item.label}
      {item.count ? <span className="nav-count">{item.count}</span> : null}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, isAgent, tickets, users, theme, toggleTheme, logout, switchUser } = useStore();
  const navigate = useNavigate();
  if (!currentUser) return null;

  const unresolved = tickets.filter((t) => t.status !== "resolved");
  const mine = unresolved.filter((t) => t.assigneeId === currentUser.id);

  const workspace: NavItem[] = isAgent
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
        { to: "/tickets", label: "All tickets", icon: Ticket, count: unresolved.length },
        { to: "/board", label: "Assigned to me", icon: User, count: mine.length },
        { to: "/employees", label: "Employees", icon: Users },
      ]
    : [
        { to: "/my-tickets", label: "My tickets", icon: Ticket },
        { to: "/tickets/new", label: "Report a problem", icon: PlusCircle },
      ];

  const resources: NavItem[] = isAgent
    ? [
        { to: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
        { to: "/reports", label: "Reports", icon: BarChart3 },
        { to: "/settings", label: "Settings", icon: Settings },
      ]
    : [{ to: "/knowledge-base", label: "Knowledge base", icon: BookOpen }];

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="logo">
        <span className="logo__mark">
          <Inbox size={19} />
        </span>
        SupportDesk
      </div>

      <nav>
        <div className="nav-section">Workspace</div>
        {workspace.map((item) => (
          <Item key={item.to} item={item} onNavigate={onClose} />
        ))}
        <div className="nav-section">Resources</div>
        {resources.map((item) => (
          <Item key={item.to} item={item} onNavigate={onClose} />
        ))}
      </nav>

      <Menu
        align="left"
        width={236}
        trigger={({ toggle }) => (
          <button className="sidebar__user" onClick={toggle} aria-label="Account menu">
            <Avatar name={currentUser.name} size={38} />
            <span>
              <b>{currentUser.name}</b>
              <small>{currentUser.jobTitle}</small>
            </span>
          </button>
        )}
      >
        {(close) => (
          <>
            <div className="menu__label">Demo: switch role</div>
            {[users.find((u) => u.role === "agent"), users.find((u) => u.role === "employee")].map(
              (u) =>
                u && (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      navigate(u.role === "agent" ? "/dashboard" : "/my-tickets");
                      close();
                    }}
                  >
                    <Repeat size={16} />
                    {u.role === "agent" ? "View as IT agent" : "View as employee"}
                  </button>
                ),
            )}
            <hr />
            <button onClick={toggleTheme}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            <button
              className="danger"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </>
        )}
      </Menu>
    </aside>
  );
}
