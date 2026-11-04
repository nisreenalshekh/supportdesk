import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FilePlus, LayoutGrid, Ticket } from "lucide-react";
import { articles } from "../../data/articles";
import { useStore } from "../../store/StoreContext";

interface Result {
  group: string;
  label: string;
  sub?: string;
  to: string;
  icon: typeof Ticket;
}

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const { tickets, isAgent, currentUser } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();

    const pages: Result[] = [
      { group: "Go to", label: "Report a problem", to: "/tickets/new", icon: FilePlus },
      { group: "Go to", label: "Knowledge base", to: "/knowledge-base", icon: BookOpen },
      ...(isAgent
        ? [
            { group: "Go to", label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
            { group: "Go to", label: "All tickets", to: "/tickets", icon: Ticket },
          ]
        : [{ group: "Go to", label: "My tickets", to: "/my-tickets", icon: Ticket }]),
    ];

    const visibleTickets = tickets.filter((t) => isAgent || t.requesterId === currentUser?.id);
    const ticketResults: Result[] = visibleTickets
      .filter((t) => q && (t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((t) => ({ group: "Tickets", label: t.subject, sub: t.id, to: `/tickets/${t.id}`, icon: Ticket }));

    const articleResults: Result[] = articles
      .filter((a) => q && a.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((a) => ({ group: "Articles", label: a.title, to: `/knowledge-base/${a.slug}`, icon: BookOpen }));

    const matchedPages = q ? pages.filter((p) => p.label.toLowerCase().includes(q)) : pages;
    return [...matchedPages, ...ticketResults, ...articleResults];
  }, [query, tickets, isAgent, currentUser]);

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  let lastGroup = "";
  return (
    <div className="overlay overlay--top" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-label="Search">
        <input
          ref={inputRef}
          className="input palette__input"
          placeholder="Search tickets, articles or jump to a page…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0].to)}
        />
        <div className="palette__list">
          {results.length === 0 && <p className="muted" style={{ padding: 16 }}>No results for "{query}"</p>}
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? <div className="palette__group">{r.group}</div> : null;
            lastGroup = r.group;
            const Icon = r.icon;
            return (
              <div key={r.to + r.label}>
                {header}
                <button className={`palette__item ${i === 0 ? "palette__item--on" : ""}`} onClick={() => go(r.to)}>
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{r.label}</span>
                  {r.sub && <span className="muted">{r.sub}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
