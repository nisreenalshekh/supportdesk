import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Plus } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import { Field } from "../components/ui/Controls";
import IconButton from "../components/ui/IconButton";
import Menu from "../components/ui/Menu";
import Modal from "../components/ui/Modal";
import Tabs from "../components/ui/Tabs";
import { useToast } from "../components/ui/Toast";
import { useStore } from "../store/StoreContext";
import type { User } from "../types";

const DEPARTMENTS = ["Sales", "Finance", "Engineering", "Operations", "HR", "IT"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blank = (): User => ({ id: "", name: "", email: "", department: "Sales", jobTitle: "", role: "employee", active: true });

export default function EmployeesPage() {
  const { users, tickets, saveUser } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [dept, setDept] = useState("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  const countFor = (d: string) => (d === "all" ? users.length : users.filter((u) => u.department === d).length);
  const shown = users.filter((u) => dept === "all" || u.department === dept);
  const openCount = (id: string) => tickets.filter((t) => t.requesterId === id && t.status !== "resolved").length;

  const save = () => {
    if (!editing) return;
    const e: Record<string, string> = {};
    if (editing.name.trim().length < 3) e.name = "Enter the full name";
    if (!EMAIL_RE.test(editing.email)) e.email = "Enter a valid email";
    else if (users.some((u) => u.email === editing.email && u.id !== editing.id)) e.email = "This email is already used";
    setError(e);
    if (Object.keys(e).length) return;

    saveUser({ ...editing, id: editing.id || `u-${Date.now()}` });
    toast(editing.id ? "Employee updated" : "Employee added");
    setEditing(null);
  };

  const departments = [...new Set(users.map((u) => u.department))];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Employees</h1>
          <div className="sub">
            {users.length} people · {departments.length} departments
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => { setError({}); setEditing(blank()); }}>
          Add employee
        </Button>
      </div>

      <div className="card">
        <Tabs active={dept} onChange={setDept} tabs={[{ value: "all", label: "All", count: countFor("all") }, ...departments.map((d) => ({ value: d, label: d, count: countFor(d) }))]} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Tickets</th>
                <th>Status</th>
                <th style={{ width: 48 }} />
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="who">
                      <Avatar name={u.name} size={36} />
                      <div className="cell-title">
                        <b>{u.name}</b>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.jobTitle}</td>
                  <td>
                    <b>{openCount(u.id)}</b> open
                  </td>
                  <td>
                    <span className={`pill ${u.active ? "pill--active" : "pill--away"}`}>{u.active ? "Active" : "Away"}</span>
                  </td>
                  <td>
                    <Menu
                      width={190}
                      trigger={({ toggle }) => (
                        <IconButton label={`Actions for ${u.name}`} bare onClick={toggle}>
                          <MoreHorizontal size={18} />
                        </IconButton>
                      )}
                    >
                      {(close) => (
                        <>
                          <button onClick={() => { setError({}); setEditing(u); close(); }}>Edit</button>
                          <button onClick={() => navigate(`/tickets?q=${encodeURIComponent(u.name)}`)}>View tickets</button>
                          <hr />
                          <button
                            className={u.active ? "danger" : ""}
                            onClick={() => {
                              saveUser({ ...u, active: !u.active });
                              toast(u.active ? `${u.name} deactivated` : `${u.name} reactivated`);
                              close();
                            }}
                          >
                            {u.active ? "Deactivate" : "Reactivate"}
                          </button>
                        </>
                      )}
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal
          title={editing.id ? "Edit employee" : "Add employee"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </>
          }
        >
          <Field label="Full name" error={error.name}>
            <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label="Work email" error={error.email}>
            <input className="input" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Department">
              <select className="select" value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Job title">
              <input className="input" value={editing.jobTitle} onChange={(e) => setEditing({ ...editing, jobTitle: e.target.value })} />
            </Field>
          </div>
          <Field label="Status">
            <select className="select" value={editing.active ? "active" : "away"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "active" })}>
              <option value="active">Active</option>
              <option value="away">Away</option>
            </select>
          </Field>
        </Modal>
      )}
    </>
  );
}
