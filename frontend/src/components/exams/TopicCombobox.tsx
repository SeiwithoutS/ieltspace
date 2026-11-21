import React, { useState } from "react";
import { styleOf } from "../../lib/shared/styles";

// Combobox "Chọn hoặc gõ để tạo mới", cùng markup và style với ô Danh mục trong pop-up tạo bộ đề (AdminExams).
export default function TopicCombobox({
  value,
  options,
  onChange,
  disabled,
  maxLength = 60,
  label = "Chủ đề",
  placeholder = "Chọn hoặc gõ để tạo chủ đề",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const id = React.useId();

  const query = q.trim();
  const ql = query.toLowerCase();
  const base =
    "display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 40px; padding: 0 12px; border-radius: 8px; box-sizing: border-box; font-size: 14px; text-decoration: none; color: #352637; ";
  const pool = Array.from(new Set(value ? [...options, value] : options)).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
  const list: Array<{ label: string; on: boolean; st: string; pick: (e: React.MouseEvent) => void }> = pool
    .filter((o) => !ql || o.toLowerCase().indexOf(ql) >= 0)
    .map((o) => {
      const on = o === value;
      return {
        label: o,
        on,
        st: base + (on ? "background: #E3ECFD; font-weight: 600" : "font-weight: 500"),
        pick: (e) => {
          e.preventDefault();
          onChange(o);
          setOpen(false);
          setQ("");
        },
      };
    });
  if (query && !pool.some((o) => o.toLowerCase() === ql)) {
    list.push({
      label: "Tạo chủ đề “" + query + "”",
      on: false,
      st: base + "font-weight: 600; color: #2963CC",
      pick: (e) => {
        e.preventDefault();
        onChange(query.slice(0, maxLength));
        setOpen(false);
        setQ("");
      },
    });
  }
  const rows = list.length
    ? list
    : [{ label: "Không có chủ đề khớp", on: false, st: base + "color: #706473", pick: (e: React.MouseEvent) => e.preventDefault() }];

  return (
    <div style={styleOf("display: flex; flex-direction: column; gap: 6px")}>
      <span
        id={id + "-label"}
        style={styleOf("font-size: 13px; font-weight: 700; color: #352637")}
      >
        {label}
      </span>
      <div style={styleOf("position: relative")}>
        {open ? (
          <div
            aria-hidden="true"
            onClick={() => {
              setOpen(false);
              setQ("");
            }}
            style={styleOf("position: fixed; inset: 0; z-index: 4")}
          ></div>
        ) : null}
        <div style={styleOf("position: relative; z-index: 5")}>
          <input
            role="combobox"
            aria-expanded={open}
            aria-controls={id + "-list"}
            aria-autocomplete="list"
            aria-labelledby={id + "-label"}
            autoComplete="off"
            disabled={disabled}
            maxLength={maxLength}
            value={open ? q : value}
            placeholder={placeholder}
            onFocus={() => {
              if (!open) {
                setOpen(true);
                setQ("");
              }
            }}
            onChange={(e) => {
              setOpen(true);
              setQ(e.target.value);
            }}
            style={styleOf(
              "display: block; width: 100%; height: 44px; box-sizing: border-box; padding: 0 40px 0 12px; border-radius: 10px; border: 1.5px solid #8E8392; background: #FFFFFF; color: #352637; font: inherit; font-size: 15px",
            )}
          />
          <span
            aria-hidden="true"
            style={styleOf(
              "position: absolute; right: 14px; top: 14px; display: flex; color: #706473; pointer-events: none",
            )}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </span>
          {open ? (
            <ul
              id={id + "-list"}
              role="listbox"
              aria-label={label}
              style={styleOf(
                "list-style: none; margin: 6px 0 0; padding: 6px; position: absolute; left: 0; right: 0; top: 100%; max-height: 240px; overflow-y: auto; box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 12px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 12px 28px rgba(53, 38, 55, 0.16)",
              )}
            >
              {value ? (
                <li role="option" aria-selected={false} style={styleOf("margin: 0")}>
                  <a
                    href="#"
                    className="press"
                    onClick={(e) => {
                      e.preventDefault();
                      onChange("");
                      setOpen(false);
                      setQ("");
                    }}
                    style={styleOf(base + "font-weight: 500; color: #706473")}
                  >
                    <span>{"Bỏ chủ đề"}</span>
                  </a>
                </li>
              ) : null}
              {rows.map((o, i) => (
                <li key={i} role="option" aria-selected={o.on} style={styleOf("margin: 0")}>
                  <a href="#" onClick={o.pick} className="press" style={styleOf(o.st)}>
                    <span>{o.label}</span>
                    {o.on ? (
                      <span style={styleOf("display: flex; color: #2963CC")}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12l5 5 9-10"></path>
                        </svg>
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
