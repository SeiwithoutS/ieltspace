import type { ReactNode } from "react";

export type SegmentedOption<T extends string> = { value: T; label: ReactNode; badge?: number; disabled?: boolean };

// Nhóm nút chọn theo DESIGN.md 12.4: role="group", mỗi mục là nút có aria-pressed.
export default function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="ui-seg">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="ui-seg__item"
          aria-pressed={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.badge ? <span className="ui-seg__badge">{o.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
