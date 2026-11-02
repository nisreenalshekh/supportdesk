export type Status = "open" | "in_progress" | "waiting" | "resolved";
export type Priority = "critical" | "high" | "medium" | "low";
export type Category = "accounts" | "hardware" | "network" | "software" | "access" | "other";
export type Role = "employee" | "agent";

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  role: Role;
  active: boolean;
}

export interface Message {
  id: string;
  authorId: string;
  body: string;
  createdAt: string; // ISO date
  // "note" messages are internal and only agents can see them
  kind: "reply" | "note";
}

export interface Ticket {
  id: string; // e.g. "SD-1042"
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  assignedAt: string | null;
  resolvedAt: string | null;
  slaDueAt: string;
  messages: Message[];
  attachments: string[]; // file names only, there is no real upload yet
}

export interface SlaPolicy {
  priority: Priority;
  firstResponseHours: number;
  resolutionHours: number;
}

export interface NotificationSettings {
  emailOnReply: boolean;
  slaRisk: boolean;
  dailySummary: boolean;
  chatAlerts: boolean;
}

export interface AppNotification {
  id: string;
  text: string;
  ticketId: string;
  createdAt: string;
  read: boolean;
}
