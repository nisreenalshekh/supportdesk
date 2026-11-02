import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import * as seed from "../data/seed";
import { dueDateFor } from "../lib/time";
import type {
  AppNotification,
  Category,
  Message,
  NotificationSettings,
  Priority,
  SlaPolicy,
  Ticket,
  User,
} from "../types";

const STORAGE_KEY = "supportdesk-state-v1";

interface State {
  users: User[];
  tickets: Ticket[];
  slaPolicies: SlaPolicy[];
  notificationSettings: NotificationSettings;
  notifications: AppNotification[];
  currentUserId: string | null;
  theme: "light" | "dark";
}

export interface NewTicketInput {
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  attachments: string[];
}

type Action =
  | { type: "login"; userId: string }
  | { type: "logout" }
  | { type: "toggleTheme" }
  | { type: "createTicket"; input: NewTicketInput; id: string }
  | { type: "updateTicket"; id: string; patch: Partial<Pick<Ticket, "status" | "priority" | "assigneeId" | "category">> }
  | { type: "deleteTickets"; ids: string[] }
  | { type: "addMessage"; ticketId: string; message: Message }
  | { type: "saveUser"; user: User }
  | { type: "saveSettings"; policies: SlaPolicy[]; notifications: NotificationSettings }
  | { type: "markNotificationsRead" };

function initialState(): State {
  const fresh: State = {
    users: seed.users,
    tickets: seed.tickets,
    slaPolicies: seed.slaPolicies,
    notificationSettings: seed.notificationSettings,
    notifications: seed.notifications,
    currentUserId: null,
    theme: "light",
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...fresh, ...JSON.parse(saved) };
  } catch {
    // corrupted or blocked storage, just start from the seed data
  }
  return fresh;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "login":
      return { ...state, currentUserId: action.userId };
    case "logout":
      return { ...state, currentUserId: null };
    case "toggleTheme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };

    case "createTicket": {
      const now = new Date().toISOString();
      const ticket: Ticket = {
        id: action.id,
        subject: action.input.subject,
        description: action.input.description,
        category: action.input.category,
        priority: action.input.priority,
        status: "open",
        requesterId: state.currentUserId ?? "",
        assigneeId: null,
        createdAt: now,
        assignedAt: null,
        resolvedAt: null,
        slaDueAt: dueDateFor(action.input.priority, state.slaPolicies),
        attachments: action.input.attachments,
        messages: [
          {
            id: `m-${Date.now()}`,
            authorId: state.currentUserId ?? "",
            kind: "reply",
            createdAt: now,
            body: action.input.description,
          },
        ],
      };
      const note: AppNotification = {
        id: `n-${Date.now()}`,
        ticketId: ticket.id,
        text: `New ticket ${ticket.id} was reported`,
        createdAt: now,
        read: false,
      };
      return { ...state, tickets: [ticket, ...state.tickets], notifications: [note, ...state.notifications] };
    }

    case "updateTicket":
      return {
        ...state,
        tickets: state.tickets.map((t) => {
          if (t.id !== action.id) return t;
          const next = { ...t, ...action.patch };
          if (action.patch.status === "resolved" && !t.resolvedAt) next.resolvedAt = new Date().toISOString();
          if (action.patch.status && action.patch.status !== "resolved") next.resolvedAt = null;
          if (action.patch.assigneeId && !t.assignedAt) next.assignedAt = new Date().toISOString();
          // changing priority also moves the SLA deadline
          if (action.patch.priority) next.slaDueAt = dueDateFor(action.patch.priority, state.slaPolicies, new Date(t.createdAt).getTime());
          return next;
        }),
      };

    case "deleteTickets":
      return { ...state, tickets: state.tickets.filter((t) => !action.ids.includes(t.id)) };

    case "addMessage":
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.ticketId ? { ...t, messages: [...t.messages, action.message] } : t,
        ),
      };

    case "saveUser": {
      const exists = state.users.some((u) => u.id === action.user.id);
      return {
        ...state,
        users: exists ? state.users.map((u) => (u.id === action.user.id ? action.user : u)) : [...state.users, action.user],
      };
    }

    case "saveSettings":
      return { ...state, slaPolicies: action.policies, notificationSettings: action.notifications };

    case "markNotificationsRead":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    default:
      return state;
  }
}

interface Store extends State {
  currentUser: User | null;
  isAgent: boolean;
  getUser: (id: string | null) => User | undefined;
  login: (email: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;
  createTicket: (input: NewTicketInput) => string;
  updateTicket: (id: string, patch: Partial<Pick<Ticket, "status" | "priority" | "assigneeId" | "category">>) => void;
  deleteTickets: (ids: string[]) => void;
  addMessage: (ticketId: string, body: string, kind: "reply" | "note") => void;
  saveUser: (user: User) => void;
  saveSettings: (policies: SlaPolicy[], notifications: NotificationSettings) => void;
  markNotificationsRead: () => void;
  switchUser: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked, ignore
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  const store = useMemo<Store>(() => {
    const getUser = (id: string | null) => state.users.find((u) => u.id === id);
    const currentUser = getUser(state.currentUserId) ?? null;

    return {
      ...state,
      currentUser,
      isAgent: currentUser?.role === "agent",
      getUser,

      login: (email) => {
        const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.active);
        if (!user) return false;
        dispatch({ type: "login", userId: user.id });
        return true;
      },
      logout: () => dispatch({ type: "logout" }),
      toggleTheme: () => dispatch({ type: "toggleTheme" }),
      switchUser: (id) => dispatch({ type: "login", userId: id }),

      createTicket: (input) => {
        const highest = state.tickets.reduce((max, t) => Math.max(max, Number(t.id.replace("SD-", ""))), 1000);
        const id = `SD-${highest + 1}`;
        dispatch({ type: "createTicket", input, id });
        return id;
      },
      updateTicket: (id, patch) => dispatch({ type: "updateTicket", id, patch }),
      deleteTickets: (ids) => dispatch({ type: "deleteTickets", ids }),
      addMessage: (ticketId, body, kind) =>
        dispatch({
          type: "addMessage",
          ticketId,
          message: {
            id: `m-${Date.now()}`,
            authorId: state.currentUserId ?? "",
            kind,
            body,
            createdAt: new Date().toISOString(),
          },
        }),
      saveUser: (user) => dispatch({ type: "saveUser", user }),
      saveSettings: (policies, notifications) => dispatch({ type: "saveSettings", policies, notifications }),
      markNotificationsRead: () => dispatch({ type: "markNotificationsRead" }),
    };
  }, [state]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

