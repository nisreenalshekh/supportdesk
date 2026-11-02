import type { Category, Priority, Status } from "../types";

export const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  accounts: "Accounts",
  hardware: "Hardware",
  network: "Network",
  software: "Software",
  access: "Access",
  other: "Other",
};

export const STATUSES: Status[] = ["open", "in_progress", "waiting", "resolved"];
export const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];
export const CATEGORIES: Category[] = ["accounts", "hardware", "network", "software", "access", "other"];
