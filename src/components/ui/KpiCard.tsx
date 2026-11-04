import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string; // icon colour
  soft: string; // icon background
  delta?: string;
  good?: boolean; // green when true, red when false
  deltaSuffix?: string;
  onClick?: () => void;
}

export default function KpiCard({ label, value, icon, color, soft, delta, good = true, deltaSuffix = "vs last week", onClick }: Props) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className="card kpi" onClick={onClick}>
      <div className="kpi__label">
        <span className="kpi__icon" style={{ background: soft, color }}>
          {icon}
        </span>
        {label}
      </div>
      <div className="kpi__value">{value}</div>
      {delta && (
        <div className="kpi__delta">
          <b className={good ? "up" : "down"}>{delta}</b> {deltaSuffix}
        </div>
      )}
    </Tag>
  );
}
