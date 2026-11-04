import { CATEGORY_ICON } from "../../lib/categoryIcons";
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL } from "../../lib/labels";
import type { Category, Priority, Status } from "../../types";

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill pill--${status}`}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`prio prio--${priority}`}>{PRIORITY_LABEL[priority]}</span>;
}

export function CategoryTag({ category }: { category: Category }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className="cat">
      <Icon size={14} />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
