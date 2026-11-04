import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Global keyboard shortcuts:  Ctrl/Cmd+K  search,  c  new ticket,  g then d / t  go to dashboard / tickets
export function useShortcuts(openSearch: () => void, isAgent: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    let waitingForG = false;
    let timer: number | undefined;

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
        return;
      }

      // don't hijack typing
      const el = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (waitingForG) {
        waitingForG = false;
        window.clearTimeout(timer);
        if (isAgent && e.key === "d") navigate("/dashboard");
        if (isAgent && e.key === "t") navigate("/tickets");
        return;
      }

      if (e.key === "c") navigate("/tickets/new");
      if (e.key === "g") {
        waitingForG = true;
        timer = window.setTimeout(() => (waitingForG = false), 1000);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, openSearch, isAgent]);
}
