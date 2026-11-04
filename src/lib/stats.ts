// Sample numbers for the charts. The ticket counts on the dashboard come from the real
// store, but there isn't enough history in the seed data for a proper time series,
// so the charts use these fixed values until there is a backend.
export interface DayStat {
  label: string;
  created: number;
  resolved: number;
}

export const WEEK: DayStat[] = [
  { label: "Mon", created: 31, resolved: 26 },
  { label: "Tue", created: 38, resolved: 35 },
  { label: "Wed", created: 29, resolved: 30 },
  { label: "Thu", created: 45, resolved: 41 },
  { label: "Fri", created: 36, resolved: 39 },
  { label: "Sat", created: 22, resolved: 24 },
  { label: "Sun", created: 27, resolved: 25 },
];

export const TODAY: DayStat[] = [
  { label: "08:00", created: 4, resolved: 2 },
  { label: "10:00", created: 9, resolved: 6 },
  { label: "12:00", created: 7, resolved: 8 },
  { label: "14:00", created: 11, resolved: 9 },
  { label: "16:00", created: 6, resolved: 7 },
];

export const MONTH: DayStat[] = [
  { label: "W1", created: 180, resolved: 171 },
  { label: "W2", created: 205, resolved: 198 },
  { label: "W3", created: 192, resolved: 199 },
  { label: "W4", created: 228, resolved: 214 },
];

export const AGENT_STATS = [
  { agentId: "u-rami", resolved: 48, avgTime: "2h 50m", slaMet: 98 },
  { agentId: "u-lina", resolved: 41, avgTime: "3h 20m", slaMet: 96 },
  { agentId: "u-yazan", resolved: 33, avgTime: "4h 05m", slaMet: 91 },
];
