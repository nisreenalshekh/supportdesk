import type { Priority, SlaPolicy, Ticket } from "../types";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

export const minutesAgo = (m: number) => new Date(Date.now() - m * MIN).toISOString();
export const minutesAhead = (m: number) => new Date(Date.now() + m * MIN).toISOString();

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < MIN) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`;
  if (diff < 24 * HOUR) return `${Math.floor(diff / HOUR)}h ago`;
  const days = Math.floor(diff / (24 * HOUR));
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`;
}

// 90 -> "1h 30m", 25 -> "25m", 3000 -> "2d 2h"
export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `${m}m`;
  if (m < 24 * 60) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${h}h ${rest}m` : `${h}h`;
  }
  const d = Math.floor(m / (24 * 60));
  const h = Math.floor((m % (24 * 60)) / 60);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export interface SlaInfo {
  text: string;
  urgent: boolean; // shown in red
}

export function getSla(ticket: Ticket, now = Date.now()): SlaInfo {
  if (ticket.status === "resolved") return { text: "Resolved", urgent: false };
  if (ticket.status === "waiting") return { text: "Waiting on user", urgent: false };

  const remaining = (new Date(ticket.slaDueAt).getTime() - now) / MIN;
  if (remaining < 0) return { text: `Overdue by ${formatDuration(-remaining)}`, urgent: true };
  if (remaining < 60) return { text: `Breaching in ${formatDuration(remaining)}`, urgent: true };
  if (remaining < 120) return { text: `${formatDuration(remaining)} left`, urgent: true };
  return { text: `${formatDuration(remaining)} left`, urgent: false };
}

export function dueDateFor(priority: Priority, policies: SlaPolicy[], from = Date.now()): string {
  const policy = policies.find((p) => p.priority === priority);
  const hours = policy ? policy.resolutionHours : 24;
  return new Date(from + hours * HOUR).toISOString();
}
