import type { ReactNode } from "react";
import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)} />
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className={o.value === value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ChoiceProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}

export function ChoiceCard({ icon: Icon, title, subtitle, selected, onClick }: ChoiceProps) {
  return (
    <button type="button" className={`choice ${selected ? "choice--on" : ""}`} aria-pressed={selected} onClick={onClick}>
      <span className="choice__icon">
        <Icon size={20} />
      </span>
      <span>
        <b>{title}</b>
        <small>{subtitle}</small>
      </span>
    </button>
  );
}

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  trailing?: ReactNode;
  onFocus?: () => void;
}

export function SearchInput({ value, onChange, placeholder, trailing, onFocus }: SearchProps) {
  return (
    <div className="input-icon">
      <Search size={18} />
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={placeholder} aria-label={placeholder} />
      {trailing && <span className="trailing">{trailing}</span>}
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <span className="label">
        {label}
        {hint && <span className="hint">{hint}</span>}
      </span>
      {children}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
