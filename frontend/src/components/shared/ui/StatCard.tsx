import type { KeyboardEvent, ReactNode } from "react";

export type StatTone = "skill-L" | "skill-R" | "skill-W" | "skill-S";

// Lưới thẻ thống kê. `min` là bề rộng tối thiểu mỗi thẻ (px).
export function StatGrid({
  min = 220,
  label,
  children,
}: {
  min?: number;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="ui-stat-grid"
      role={label ? "group" : undefined}
      aria-label={label}
      style={{ ["--ui-stat-min" as string]: `${min}px` }}
    >
      {children}
    </div>
  );
}

// Thẻ thống kê / ô kỹ năng: [icon] nhãn [action] / số lớn + đơn vị / dòng phụ / hàng chip (children).
// `tone` tô icon và viền khi chọn; `onSelect` biến thẻ thành nút bật/tắt (aria-pressed = selected).
export default function StatCard({
  label,
  value,
  unit,
  sub,
  icon,
  tone,
  selected,
  onSelect,
  action,
  children,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  selected?: boolean;
  onSelect?: () => void;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const interactive = !!onSelect;
  const cls = [
    "ui-stat",
    tone ? `ui-stat--${tone}` : "",
    selected ? "ui-stat--selected" : "",
    interactive ? "lift" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const body = (
    <>
      <div className="ui-stat__head">
        {icon ? <span className="ui-stat__icon">{icon}</span> : null}
        <span className="ui-stat__label">{label}</span>
        {action}
      </div>
      <div className="ui-stat__num">
        <span className="ui-stat__value">{value}</span>
        {unit ? <span className="ui-stat__unit">{unit}</span> : null}
      </div>
      {sub ? <div className="ui-stat__sub">{sub}</div> : null}
      {children ? <div className="ui-stat__chips">{children}</div> : null}
    </>
  );
  if (!interactive) return <article className={cls}>{body}</article>;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={!!selected}
      className={cls}
      onClick={onSelect}
      onKeyDown={onKey}
    >
      {body}
    </div>
  );
}
