import { useState } from "react";
import Avatar from "../components/ui/Avatar";
import { CategoryTag } from "../components/ui/Badges";
import Button from "../components/ui/Button";
import { Toggle } from "../components/ui/Controls";
import Tabs from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import { CATEGORIES, PRIORITY_LABEL } from "../lib/labels";
import { useStore } from "../store/StoreContext";
import type { Category, NotificationSettings, SlaPolicy } from "../types";

type Tab = "sla" | "categories" | "notifications" | "team" | "integrations";
const RULES_KEY = "supportdesk-category-rules";

// "round-robin" or an agent id
type Rules = Record<Category, string>;
const defaultRules: Rules = {
  accounts: "u-rami",
  hardware: "u-lina",
  network: "u-yazan",
  software: "round-robin",
  access: "u-lina",
  other: "round-robin",
};

function loadRules(): Rules {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    return raw ? { ...defaultRules, ...JSON.parse(raw) } : defaultRules;
  } catch {
    return defaultRules;
  }
}

const NOTIFICATION_ROWS: { key: keyof NotificationSettings; title: string; text: string }[] = [
  { key: "emailOnReply", title: "Email on new reply", text: "Requesters get an email when IT responds" },
  { key: "slaRisk", title: "Notify on SLA risk", text: "Alert the lead 30 minutes before a breach" },
  { key: "dailySummary", title: "Daily summary", text: "Send a digest to the IT team at 8:00" },
  { key: "chatAlerts", title: "Slack / Teams alerts", text: "Post critical tickets to a channel" },
];

export default function SettingsPage() {
  const { slaPolicies, notificationSettings, users, saveSettings } = useStore();
  const toast = useToast();
  const agents = users.filter((u) => u.role === "agent");

  const [tab, setTab] = useState<Tab>("sla");
  const [policies, setPolicies] = useState<SlaPolicy[]>(slaPolicies);
  const [notifs, setNotifs] = useState<NotificationSettings>(notificationSettings);
  const [rules, setRules] = useState<Rules>(loadRules);
  const [savedRules, setSavedRules] = useState<Rules>(loadRules);

  const dirty =
    JSON.stringify(policies) !== JSON.stringify(slaPolicies) ||
    JSON.stringify(notifs) !== JSON.stringify(notificationSettings) ||
    JSON.stringify(rules) !== JSON.stringify(savedRules);

  const setHours = (priority: SlaPolicy["priority"], field: "firstResponseHours" | "resolutionHours", value: string) => {
    const n = Math.max(1, Number(value) || 1);
    setPolicies((list) => list.map((p) => (p.priority === priority ? { ...p, [field]: n } : p)));
  };

  const save = () => {
    saveSettings(policies, notifs);
    try {
      localStorage.setItem(RULES_KEY, JSON.stringify(rules));
    } catch {
      // ignore
    }
    setSavedRules(rules);
    toast("Settings saved");
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <div className="sub">Configure SLA policies, categories and notifications</div>
        </div>
        <Button disabled={!dirty} onClick={save}>
          Save changes
        </Button>
      </div>

      <div className="card">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: "sla", label: "SLA policies" },
            { value: "categories", label: "Categories" },
            { value: "notifications", label: "Notifications" },
            { value: "team", label: "Team & roles" },
            { value: "integrations", label: "Integrations" },
          ]}
        />

        {tab === "sla" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>First response (hours)</th>
                  <th>Resolution target (hours)</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.priority}>
                    <td>
                      <span className={`prio prio--${p.priority}`}>{PRIORITY_LABEL[p.priority]}</span>
                    </td>
                    <td>
                      <input className="input sla-input" type="number" min={1} value={p.firstResponseHours} onChange={(e) => setHours(p.priority, "firstResponseHours", e.target.value)} aria-label={`${p.priority} first response hours`} />
                    </td>
                    <td>
                      <input className="input sla-input" type="number" min={1} value={p.resolutionHours} onChange={(e) => setHours(p.priority, "resolutionHours", e.target.value)} aria-label={`${p.priority} resolution hours`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "categories" &&
          CATEGORIES.map((c) => (
            <div className="row2" key={c}>
              <CategoryTag category={c} />
              <div className="row2__main" />
              <span className="muted">Auto-assign to</span>
              <select className="select select--compact" value={rules[c]} onChange={(e) => setRules({ ...rules, [c]: e.target.value })} aria-label={`Auto-assign ${c}`}>
                <option value="round-robin">Round-robin</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {tab === "notifications" &&
          NOTIFICATION_ROWS.map((row) => (
            <div className="row2" key={row.key}>
              <div className="row2__main">
                <b>{row.title}</b>
                <div className="sub">{row.text}</div>
              </div>
              <Toggle label={row.title} checked={notifs[row.key]} onChange={(v) => setNotifs({ ...notifs, [row.key]: v })} />
            </div>
          ))}

        {tab === "team" &&
          agents.map((a) => (
            <div className="row2" key={a.id}>
              <Avatar name={a.name} size={36} />
              <div className="row2__main">
                <b>{a.name}</b>
                <div className="sub">{a.email}</div>
              </div>
              <span className="pill pill--in_progress">{a.jobTitle}</span>
            </div>
          ))}

        {tab === "integrations" &&
          [
            { name: "Slack", text: "Post critical tickets to a channel", key: "chatAlerts" as const },
            { name: "Microsoft Teams", text: "Notify the IT channel about new tickets" },
            { name: "Active Directory", text: "Sync employees automatically" },
          ].map((i) => (
            <div className="row2" key={i.name}>
              <div className="row2__main">
                <b>{i.name}</b>
                <div className="sub">{i.text}</div>
              </div>
              {i.key ? <Toggle label={i.name} checked={notifs.chatAlerts} onChange={(v) => setNotifs({ ...notifs, chatAlerts: v })} /> : <span className="muted">Coming soon</span>}
            </div>
          ))}
      </div>
    </>
  );
}
