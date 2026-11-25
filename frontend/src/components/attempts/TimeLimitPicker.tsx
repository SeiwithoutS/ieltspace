import { useId } from "react";
import { limitLabel } from "../../lib/attempts/time-limits";

interface TimeLimitPickerProps {
  /** Các mức theo phút; 0 là không giới hạn. */
  options: number[];
  value: number;
  onChange: (minutes: number) => void;
  /** Cố định (Thi thật, full test): hiện mức nhưng không cho đổi. */
  locked?: boolean;
  label?: string;
  hint?: string;
  name?: string;
}

export default function TimeLimitPicker({
  options,
  value,
  onChange,
  locked = false,
  label = "Thời gian làm bài",
  hint,
  name = "thoiGian",
}: TimeLimitPickerProps) {
  const id = useId();
  if (options.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      <label
        htmlFor={id}
        className="flex items-center [gap:8px] [font-size:12px] font-semibold [letter-spacing:0.08em] uppercase [color:var(--attempt-text-706473)]"
      >
        {label}
        {locked && (
          <span className="inline-flex items-center [height:22px] [padding:0_8px] rounded-full [font-size:11px] font-bold normal-case [letter-spacing:0] [background:var(--attempt-bg-f3f0ea)] [color:var(--attempt-text-706473)]">
            {"Cố định"}
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={locked}
          onChange={(e) => onChange(Number(e.target.value))}
          className={
            "w-full [height:44px] box-border [padding:0_40px_0_14px] [border-radius:10px] [border:1.5px_solid_var(--attempt-line-8e8392)] [color:var(--attempt-text-352637)] [font-size:14px] font-semibold appearance-none attempt-select focus-visible:[outline:2px_solid_var(--attempt-text-2963cc)] focus-visible:[outline-offset:2px] " +
            (locked
              ? "[background:var(--attempt-bg-f3f0ea)] [cursor:not-allowed]"
              : "[background:var(--attempt-bg-ffffff)] cursor-pointer hover:[border-color:var(--attempt-line-6a5d6c)]")
          }
        >
          {options.map((minutes) => (
            <option key={minutes} value={minutes}>
              {limitLabel(minutes)}
            </option>
          ))}
        </select>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="absolute [right:12px] [top:13px] [pointer-events:none] [color:var(--attempt-text-706473)]"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </div>
      {hint && (
        <div className="[font-size:12px] [color:var(--attempt-text-706473)]">
          {hint}
        </div>
      )}
    </div>
  );
}
