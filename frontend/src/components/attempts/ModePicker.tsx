import React from "react";
import type { AttemptMode } from "./types";

interface ModePickerProps {
  value: AttemptMode;
  onChange: (mode: AttemptMode) => void;
  /** Mô tả luật của từng chế độ. */
  practiceDesc: string;
  realDesc: string;
  /** Nhãn nhỏ của Thi thật ("Có tính band" hoặc "Như thi thật"). */
  realTag?: string;
  /** Nội dung hiện bên trong thẻ Luyện tập khi đang chọn (danh sách phần, thời gian). */
  practiceExtra?: React.ReactNode;
  name?: string;
}

const cardClass =
  "[flex:1_1_280px] box-border flex flex-col gap-2 p-4 [border-radius:12px] cursor-pointer";

/** Khối chọn chế độ làm bài, dùng chung cho Speaking, Reading, Listening, Writing. */
export default function ModePicker({
  value,
  onChange,
  practiceDesc,
  realDesc,
  realTag = "Như thi thật",
  practiceExtra,
  name = "cheDo",
}: ModePickerProps) {
  const modes: {
    id: AttemptMode;
    label: string;
    tag: string;
    desc: string;
    tagBg: string;
    tagFg: string;
  }[] = [
    {
      id: "practice",
      label: "Luyện tập",
      tag: "Không tính band",
      desc: practiceDesc,
      tagBg: "var(--attempt-bg-e3ecfd)",
      tagFg: "var(--attempt-text-2963cc)",
    },
    {
      id: "real",
      label: "Thi thật",
      tag: realTag,
      desc: realDesc,
      tagBg: "var(--attempt-bg-352637)",
      tagFg: "var(--attempt-text-on-352637)",
    },
  ];
  return (
    <fieldset className="m-0 p-0 border-0 min-w-0">
      <legend className="p-0 [margin-bottom:10px] [font-size:12px] font-semibold [letter-spacing:0.08em] uppercase [color:var(--attempt-text-706473)]">
        {"Chọn chế độ"}
      </legend>
      <div className="flex flex-wrap gap-3">
        {modes.map((m) => {
          const on = value === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                if (!on) onChange(m.id);
              }}
              className={
                cardClass +
                " hover:[box-shadow:0_0_0_1px_var(--attempt-text-2963cc)] focus-within:[outline:2px_solid_var(--attempt-text-2963cc)] focus-within:[outline-offset:2px]"
              }
              style={{
                background: on
                  ? "var(--attempt-bg-e3ecfd)"
                  : "var(--attempt-bg-ffffff)",
                // Thẻ đang chọn: viền 1.5px + bóng 0.5px (giữ chiều rộng viền, không nhảy bố cục).
                border: on
                  ? "1.5px solid var(--attempt-text-2963cc)"
                  : "1.5px solid var(--attempt-line-d6d4d0)",
                boxShadow: on
                  ? "0 0 0 0.5px var(--attempt-text-2963cc)"
                  : undefined,
              }}
            >
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="flex items-center [gap:10px]">
                  <input
                    type="radio"
                    name={name}
                    value={m.id}
                    checked={on}
                    onChange={() => {
                      if (!on) onChange(m.id);
                    }}
                  />
                  <span className="[font-size:15px] font-bold">{m.label}</span>
                  <span
                    className="ml-auto inline-flex items-center [height:22px] [padding:0_8px] rounded-full [font-size:11px] font-bold whitespace-nowrap"
                    style={{ background: m.tagBg, color: m.tagFg }}
                  >
                    {m.tag}
                  </span>
                </span>
                <span className="[font-size:13px] [line-height:1.5] [color:var(--attempt-text-4b3d4d)]">
                  {m.desc}
                </span>
              </label>
              {on && m.id === "practice" ? practiceExtra : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
