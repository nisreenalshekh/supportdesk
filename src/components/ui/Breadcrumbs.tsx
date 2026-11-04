import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ trail, current }: { trail: { label: string; to: string }[]; current: string }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {trail.map((t) => (
        <span key={t.to} style={{ display: "contents" }}>
          <Link to={t.to}>{t.label}</Link>
          <ChevronRight size={14} />
        </span>
      ))}
      <b>{current}</b>
    </nav>
  );
}
