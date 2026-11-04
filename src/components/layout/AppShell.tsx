import { useCallback, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Plus, Search } from "lucide-react";
import { useShortcuts } from "../../hooks/useShortcuts";
import { useStore } from "../../store/StoreContext";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import CommandPalette from "./CommandPalette";
import NotificationsMenu from "./NotificationsMenu";
import Sidebar from "./Sidebar";

export default function AppShell() {
  const { isAgent } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useShortcuts(openSearch, isAgent);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-backdrop ${sidebarOpen ? "sidebar-backdrop--open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <main className="main">
        <header className="topbar">
          <IconButton label="Open menu" className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={18} />
          </IconButton>
          <button className="topbar__search" onClick={openSearch}>
            <Search size={18} />
            <span>Search tickets, people, articles…</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="topbar__spacer" />
          <NotificationsMenu />
          <Button icon={<Plus size={18} />} onClick={() => navigate("/tickets/new")}>
            <span className="btn-label">{isAgent ? "New ticket" : "Report a problem"}</span>
          </Button>
        </header>

        <Outlet />
      </main>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
