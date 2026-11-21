import React, { useEffect, useId, useState } from "react";
import { styleOf } from "../../lib/shared/styles";

const CARD =
  "padding: 20px 20px 22px; border: 1.5px solid #E6E4E0; border-radius: 16px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04)";
const GROUP_TITLE =
  "font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #4B3D4D; margin-bottom: 4px";
const ROW =
  "display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; font-size: 15px; cursor: pointer";
const BOX = "width: 18px; height: 18px; margin: 0; flex: 0 0 18px; accent-color: #2963CC";
const DIVIDER =
  "display: flex; flex-direction: column; padding-top: 18px; margin-top: 14px; border-top: 1px solid #F3F0EA; ";
const LINK_BTN =
  "display: inline-block; margin-top: 4px; padding: 0; border: 0; background: transparent; font: inherit; font-size: 13px; font-weight: 600; color: #2963CC; text-decoration: none; cursor: pointer; text-align: left";
const BTN =
  "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637";

export type SidebarOption = {
  value: string;
  name: string;
  // Số thẻ có giá trị này (hiện cạnh tên).
  count?: number;
};

export type SidebarGroup = {
  key: string;
  title: string;
  options: SidebarOption[];
  selected: string[];
  onToggle: (value: string) => void;
  // Số lựa chọn hiện trước khi bấm "Xem tất cả" (mặc định 5).
  max?: number;
};

export type SidebarSort = {
  value: string;
  options: Array<[string, string]>;
  onPick: (key: string) => void;
};

// Dưới 768px sidebar thu thành nút "Bộ lọc" mở ra dạng panel.
function useNarrow(): boolean {
  const query = "(max-width: 767px)";
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setNarrow(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return narrow;
}

// Sidebar "Tìm kiếm" + "Bộ lọc" của các trang luyện đề (khung theo canvas thư viện đề).
export default function PracticeSidebar({
  search,
  groups,
  sort,
  onClear,
}: {
  search: { value: string; placeholder: string; onChange: (value: string) => void };
  groups: SidebarGroup[];
  sort: SidebarSort;
  // Có lọc đang bật (từ khóa hoặc nhóm) thì hiện nút "Xóa bộ lọc".
  onClear?: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [panel, setPanel] = useState(false);
  const uid = useId();
  const panelId = uid + "-panel";
  const sortName = uid + "-sort";
  const narrow = useNarrow();
  const active = groups.reduce((n, g) => n + g.selected.length, 0) + (search.value.trim() ? 1 : 0);

  const aside = (
    <aside
      className="content-sidebar"
      id={panelId}
      aria-label="Tìm kiếm và bộ lọc"
      style={styleOf(
        narrow
          ? "flex: 1 1 100%; width: 100%; display: flex; flex-direction: column; gap: 20px"
          : "flex: 1 1 260px; max-width: 280px; display: flex; flex-direction: column; gap: 20px",
      )}
    >
      <div style={styleOf(CARD)}>
        <label
          htmlFor="practice-search"
          style={styleOf("display: block; font-size: 18px; font-weight: 600; margin-bottom: 12px")}
        >
          {"Tìm kiếm"}
        </label>
        <div
          style={styleOf(
            "display: flex; height: 42px; border-radius: 10px; overflow: hidden; border: 1.5px solid #E6E4E0; background: #F6F4EF",
          )}
        >
          <input
            id="practice-search"
            type="search"
            placeholder={search.placeholder}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            style={styleOf(
              "flex: 1; min-width: 0; border: 0; background: transparent; padding: 0 12px; font: inherit; font-size: 14px; color: #352637; outline: none",
            )}
          />
          <span
            aria-hidden="true"
            style={styleOf(
              "width: 44px; flex: 0 0 44px; display: flex; align-items: center; justify-content: center; background: #352637; color: #FFFFFF",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M20 20l-4-4"></path>
            </svg>
          </span>
        </div>
      </div>
      <div style={styleOf(CARD)}>
        <div
          style={styleOf(
            "display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px",
          )}
        >
          <div style={styleOf("font-size: 18px; font-weight: 600")}>{"Bộ lọc"}</div>
          {onClear && active > 0 ? (
            <button
              type="button"
              onClick={onClear}
              style={styleOf(
                "padding: 0; border: 0; background: transparent; font: inherit; font-size: 13px; font-weight: 600; color: #2963CC; cursor: pointer",
              )}
            >
              {"Xóa bộ lọc"}
            </button>
          ) : null}
        </div>
        {groups.map((g, gi) => {
          const max = g.max ?? 5;
          const all = !!open[g.key];
          const shown = all ? g.options : g.options.slice(0, max);
          return (
            <div
              key={g.key}
              role="group"
              aria-label={g.title}
              style={styleOf(gi === 0 ? "display: flex; flex-direction: column; " : DIVIDER)}
            >
              <div style={styleOf(GROUP_TITLE)}>{g.title + " (" + g.options.length + ")"}</div>
              {shown.map((o) => (
                <label key={o.value} style={styleOf(ROW)}>
                  <span>
                    {o.name}
                    {o.count !== undefined ? (
                      <span style={styleOf("color: #706473; font-size: 13px")}>
                        {" (" + o.count + ")"}
                      </span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={g.selected.indexOf(o.value) >= 0}
                    onChange={() => g.onToggle(o.value)}
                    style={styleOf(BOX)}
                  />
                </label>
              ))}
              {g.options.length > max ? (
                <button
                  type="button"
                  aria-expanded={all}
                  onClick={() => setOpen({ ...open, [g.key]: !all })}
                  style={styleOf(LINK_BTN)}
                >
                  {all ? "Thu gọn" : "Xem tất cả"}
                </button>
              ) : null}
            </div>
          );
        })}
        <div
          role="group"
          aria-label="Sắp xếp theo"
          style={styleOf(groups.length === 0 ? "display: flex; flex-direction: column; " : DIVIDER)}
        >
          <div style={styleOf(GROUP_TITLE)}>{"Sắp xếp theo"}</div>
          {sort.options.map(([k, label]) => (
            <label key={k} style={styleOf(ROW)}>
              <span>{label}</span>
              <input
                type="radio"
                name={sortName}
                checked={sort.value === k}
                onChange={() => sort.onPick(k)}
                style={styleOf(BOX)}
              />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );

  if (!narrow) return aside;
  return (
    <div style={styleOf("flex: 1 1 100%; display: flex; flex-direction: column; gap: 16px")}>
      <button
        type="button"
        aria-expanded={panel}
        aria-controls={panelId}
        onClick={() => setPanel(!panel)}
        style={styleOf(BTN)}
      >
        {active > 0 ? "Bộ lọc (" + active + ")" : "Bộ lọc"}
      </button>
      {panel ? aside : null}
    </div>
  );
}
