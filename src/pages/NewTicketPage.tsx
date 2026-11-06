import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Button from "../components/ui/Button";
import { ChoiceCard, Field, Segmented, SearchInput } from "../components/ui/Controls";
import FileDropzone from "../components/ui/FileDropzone";
import { useToast } from "../components/ui/Toast";
import { articles } from "../data/articles";
import { CATEGORY_ICON } from "../lib/categoryIcons";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "../lib/labels";
import { useStore } from "../store/StoreContext";
import type { Category, Priority } from "../types";

const DRAFT_KEY = "supportdesk-draft";

const CATEGORY_CHOICES: { value: Category; title: string; subtitle: string }[] = [
  { value: "accounts", title: "Account & login", subtitle: "Password, locked out" },
  { value: "hardware", title: "Printer & hardware", subtitle: "Offline, paper jam, devices" },
  { value: "network", title: "Network", subtitle: "Wi-Fi, internet, VPN" },
  { value: "software", title: "Software", subtitle: "App errors, installs" },
  { value: "access", title: "Access request", subtitle: "Files, folders, systems" },
  { value: "other", title: "Something else", subtitle: "Not sure" },
];

const URGENCY: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical · can't work" },
];

interface Draft {
  category: Category | null;
  subject: string;
  description: string;
  priority: Priority;
  attachments: string[];
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function NewTicketPage() {
  const { createTicket, slaPolicies } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  // the knowledge base "still stuck?" button pre-fills these
  const prefilled: Draft | null = params.get("subject")
    ? { category: (params.get("category") as Category) || null, subject: params.get("subject") ?? "", description: "", priority: "medium", attachments: [] }
    : null;
  const initial = prefilled ?? loadDraft();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(initial?.category ?? null);
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [attachments, setAttachments] = useState<string[]>(initial?.attachments ?? []);
  const [errors, setErrors] = useState<{ category?: string; subject?: string; description?: string }>({});
  const [help, setHelp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dirty = Boolean(subject || description || attachments.length);

  // autosave the draft, and warn before closing the tab with unsaved text
  useEffect(() => {
    if (!dirty) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, subject, description, priority, attachments }));
  }, [category, subject, description, priority, attachments, dirty]);

  useEffect(() => {
    if (!dirty || submitting) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, submitting]);

  const suggestions = useMemo(() => {
    const q = help.trim().toLowerCase();
    return q ? articles.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 4) : [];
  }, [help]);

  const firstResponse = slaPolicies.find((p) => p.priority === priority)?.firstResponseHours ?? 8;

  const next = () => {
    if (step === 1) {
      if (!category) return setErrors({ category: "Please choose what kind of problem it is" });
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      const e: typeof errors = {};
      if (subject.trim().length < 5) e.subject = "Please write a short subject (at least 5 characters)";
      if (description.trim().length < 15) e.description = "Tell us a bit more so we can help (at least 15 characters)";
      setErrors(e);
      if (Object.keys(e).length === 0) setStep(3);
    }
  };

  const submit = () => {
    if (!category) return;
    setSubmitting(true);
    const id = createTicket({ subject: subject.trim(), description: description.trim(), category, priority, attachments });
    localStorage.removeItem(DRAFT_KEY);
    toast(`Ticket ${id} submitted`);
    navigate(`/tickets/submitted/${id}`);
  };

  const stepClass = (n: number) => (n < step ? "steps__item--done" : n === step ? "steps__item--current" : "");

  return (
    <>
      <div className="hero">
        <h2>How can IT help you today?</h2>
        <p>Report a problem and we'll keep you updated until it's fixed.</p>
        <div className="hero__search">
          <SearchInput value={help} onChange={setHelp} placeholder={'Search for a quick fix, e.g. "reset password", "printer offline"…'} />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((a) => (
                <Link key={a.slug} to={`/knowledge-base/${a.slug}`}>
                  <span>{a.title}</span>
                  <span className="muted">{a.readMinutes} min read</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="wizard">
        <div className="steps">
          {["Category", "Describe issue", "Review & submit"].map((label, i) => (
            <div key={label} className={`steps__item ${stepClass(i + 1)}`}>
              <span className="steps__num">{i + 1 < step ? <Check size={14} /> : i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="card card__body" style={{ padding: 28 }}>
          {step === 1 && (
            <Field label="What kind of problem is it?" error={errors.category}>
              <div className="choices">
                {CATEGORY_CHOICES.map((c) => (
                  <ChoiceCard key={c.value} icon={CATEGORY_ICON[c.value]} title={c.title} subtitle={c.subtitle} selected={category === c.value} onClick={() => { setCategory(c.value); setErrors({}); }} />
                ))}
              </div>
            </Field>
          )}

          {step === 2 && (
            <>
              <Field label="Subject" error={errors.subject}>
                <input className={`input ${errors.subject ? "input--error" : ""}`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the problem" maxLength={90} />
              </Field>
              <Field label="Describe what's happening" hint="The more detail, the faster we fix it" error={errors.description}>
                <textarea className={`textarea ${errors.description ? "input--error" : ""}`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What were you doing? What did you expect? Any error message?" />
              </Field>
              <Field label="How urgent is it?">
                <Segmented options={URGENCY} value={priority} onChange={setPriority} />
              </Field>
              <Field label="Attachments">
                <FileDropzone files={attachments} onChange={setAttachments} />
              </Field>
            </>
          )}

          {step === 3 && category && (
            <div className="review">
              <div className="review__section">
                <dl>
                  <dt>Category</dt>
                  <dd>{CATEGORY_LABEL[category]}</dd>
                </dl>
                <Button variant="link" onClick={() => setStep(1)}>Edit</Button>
              </div>
              <div className="review__section">
                <dl>
                  <dt>Subject</dt>
                  <dd>{subject}</dd>
                  <dt>Description</dt>
                  <dd style={{ whiteSpace: "pre-wrap" }}>{description}</dd>
                  <dt>Urgency</dt>
                  <dd>{PRIORITY_LABEL[priority]}</dd>
                  <dt>Attachments</dt>
                  <dd>{attachments.length ? attachments.join(", ") : "None"}</dd>
                </dl>
                <Button variant="link" onClick={() => setStep(2)}>Edit</Button>
              </div>
            </div>
          )}

          <div className="wizard__foot" style={{ marginTop: 8 }}>
            <span className="sub">
              Expected first response: <b style={{ color: "var(--ink)" }}>within {firstResponse === 1 ? "1 hour" : `${firstResponse} hours`}</b>
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button iconRight={<ArrowRight size={16} />} onClick={next}>
                  Continue
                </Button>
              ) : (
                <Button loading={submitting} onClick={submit}>
                  Submit ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
