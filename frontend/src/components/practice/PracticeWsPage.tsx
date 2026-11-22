import React, { useEffect, useMemo, useState } from "react";
import LearnerHeader from "../navigation/LearnerHeader";
import PracticeSidebar, { type SidebarGroup } from "./PracticeSidebar";
import Pagination from "./Pagination";
import { usePracticeCatalog } from "./usePracticeCatalog";
import { DesktopRequiredDialog } from "../exams/TestScreenGuard";
import { styleOf, cssText } from "../../lib/shared/styles";
import {
  skillPage,
  startExam,
  titleMap,
  type PracticeItem,
} from "../../lib/exams/exam-catalog";

const PER_PAGE = 12;
const LABEL_ORDER = ["Task 1 Academic", "Task 1 General", "Task 2", "Part 1", "Part 2", "Part 3"];

function toggled(list: string[], value: string): string[] {
  return list.indexOf(value) >= 0 ? list.filter((x) => x !== value) : list.concat(value);
}

// Thẻ Writing (một Task) hoặc Speaking (một Part); tiêu đề là chủ đề, nhãn Task/Part nằm phía trên.
export function WsCard({
  item,
  title,
  extra,
  onStart,
}: {
  item: PracticeItem;
  title: string;
  extra?: string;
  onStart: (item: PracticeItem) => void;
}) {
  const isW = item.skill === "WRITING";
  const meta = [
    item.minWords ? "tối thiểu " + item.minWords + " từ" : "",
    item.minutes ? item.minutes + " phút" : "",
  ]
    .filter(Boolean)
    .join(", ");
  const desc = [item.setName + " " + item.examTitle, meta].filter(Boolean).join(" · ");
  return (
    <div
      style={styleOf(
        (extra || "") +
          "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
      )}
    >
      <span
        style={styleOf(
          isW
            ? "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center"
            : "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isW ? (
            <path d="M15 5l4 4L8 20H4v-4z"></path>
          ) : (
            <>
              <rect x="9" y="3" width="6" height="11" rx="3"></rect>
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
            </>
          )}
        </svg>
      </span>
      <div
        style={styleOf(
          "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
        )}
      >
        {item.label}
      </div>
      <div
        style={styleOf(
          "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
        )}
      >
        {title}
      </div>
      <div style={styleOf("font-size: 14px; color: #706473; margin-bottom: 14px")}>
        {desc || "—"}
      </div>
      <a
        href={"#" + skillPage(item.skill)}
        onClick={(e) => {
          e.preventDefault();
          onStart(item);
        }}
        style={styleOf(
          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 12px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
        )}
      >
        {"Làm bài"}
      </a>
    </div>
  );
}

// Trang luyện Writing (theo Task) hoặc Speaking (theo Part).
export default function PracticeWsPage({ skill }: { skill: "WRITING" | "SPEAKING" }) {
  const isW = skill === "WRITING";
  const cat = usePracticeCatalog(skill);
  const [q, setQ] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [essay, setEssay] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<"NEW" | "OLD">("NEW");
  const [page, setPage] = useState(1);
  const [guard, setGuard] = useState(false);

  // Đổi từ khóa, lọc hoặc sắp xếp thì về trang 1.
  useEffect(() => {
    setPage(1);
  }, [q, tasks, essay, topics, sort]);

  const titles = useMemo(() => titleMap(cat.items), [cat.items]);

  // Task/Part có thật trong dữ liệu, theo thứ tự cố định.
  const taskOptions = useMemo(() => {
    const seen = new Set(cat.items.map((it) => it.label));
    return LABEL_ORDER.filter((l) => seen.has(l)).map((l) => ({ value: l, name: l }));
  }, [cat.items]);

  // Dạng đề của các Task đang hiện theo lựa chọn Task (không chọn = tất cả).
  const essayFor = (selected: string[]) => {
    const names = new Map(cat.essayTypes.map((o) => [o.code, o.name] as const));
    const seen = new Set<string>();
    for (const it of cat.items) {
      if ((selected.length === 0 || selected.indexOf(it.label) >= 0) && it.essayType) {
        seen.add(it.essayType);
      }
    }
    return [...seen].filter((c) => names.has(c)).map((c) => ({ value: c, name: names.get(c) || c }));
  };
  const essayOptions = isW ? essayFor(tasks) : [];

  const pickTask = (value: string) => {
    const next = toggled(tasks, value);
    const ok = essayFor(next).map((o) => o.value);
    setTasks(next);
    setEssay(essay.filter((c) => ok.indexOf(c) >= 0));
  };

  const cards = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = cat.items.filter((it) => {
      if (tasks.length > 0 && tasks.indexOf(it.label) < 0) return false;
      if (essay.length > 0 && (!it.essayType || essay.indexOf(it.essayType) < 0)) return false;
      if (topics.length > 0 && (!it.topicLabel || topics.indexOf(it.topicLabel) < 0)) return false;
      if (!needle) return true;
      return (
        (titles.get(it.key) + " " + it.label + " " + it.setName + " " + it.examTitle)
          .toLowerCase()
          .indexOf(needle) >= 0
      );
    });
    return out.slice().sort((a, b) =>
      sort === "OLD"
        ? (a.publishedAt || "").localeCompare(b.publishedAt || "")
        : (b.publishedAt || "").localeCompare(a.publishedAt || ""),
    );
  }, [cat.items, q, tasks, essay, topics, sort, titles]);

  const groups: SidebarGroup[] = [];
  if (taskOptions.length > 0) {
    groups.push({
      key: "tasks",
      title: isW ? "Task" : "Part",
      options: taskOptions.map((o) => ({ ...o, count: cat.items.filter((it) => it.label === o.value).length })),
      selected: tasks,
      onToggle: pickTask,
    });
  }
  if (essayOptions.length > 0) {
    groups.push({
      key: "essay",
      title: "Dạng đề bài",
      options: essayOptions.map((o) => ({ ...o, count: cat.items.filter((it) => it.essayType === o.value).length })),
      selected: essay,
      onToggle: (v) => setEssay(toggled(essay, v)),
    });
  }
  if (cat.topics.length > 0) {
    groups.push({
      key: "topics",
      title: "Chủ đề",
      options: cat.topics.map((t) => ({ value: t.name, name: t.name, count: t.count })),
      selected: topics,
      onToggle: (v) => setTopics(toggled(topics, v)),
    });
  }

  const filtersOn = q.trim() !== "" || tasks.length > 0 || essay.length > 0 || topics.length > 0;
  const clear = () => {
    setQ("");
    setTasks([]);
    setEssay([]);
    setTopics([]);
  };

  const pages = Math.max(1, Math.ceil(cards.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = cards.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const start = (it: PracticeItem) => {
    if (!startExam(skillPage(it.skill), it.examId, it.orderNo)) setGuard(true);
  };
  const note = (text: string) => (
    <div style={styleOf("color: #706473; font-size: 14px")}>{text}</div>
  );

  return (
    <>
      <style>
        {cssText(
          "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n",
        )}
      </style>
      <div
        style={styleOf(
          "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6",
        )}
      >
        <LearnerHeader active="exams" />
        <div style={styleOf("background: #FCFBF7")}>
          <main
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; display: flex; flex-direction: column; gap: 32px",
            )}
          >
            <div>
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {isW ? "Thư viện đề / IELTS Writing Practice" : "Thư viện đề / IELTS Speaking Practice"}
              </div>
              <h1
                style={styleOf(
                  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {isW ? "Luyện Writing theo Task" : "Luyện Speaking theo Part"}
              </h1>
              <div style={styleOf("font-size: 15px; color: #706473; margin-top: 4px")}>
                {isW
                  ? "Chọn một Task để luyện riêng dạng bài bạn còn yếu."
                  : "Chọn một Part để luyện riêng dạng bài bạn còn yếu."}
              </div>
            </div>
            <div
              style={styleOf(
                "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; font-size: 14px",
              )}
            >
              <span style={styleOf("flex: 0 0 18px; margin-top: 2px")}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 11v5M12 8h.01"></path>
                </svg>
              </span>
              <span>
                {isW
                  ? "Bài luyện được lưu 14 ngày như bài thi. Bạn làm riêng từng Task, làm xong có thể gửi yêu cầu chấm và nhận điểm cho đúng Task 1 hoặc Task 2 đó."
                  : "Bài luyện được lưu 14 ngày như bài thi. Bạn làm riêng từng Part, làm xong có thể gửi yêu cầu chấm và nhận điểm cho đúng Part 1, 2 hoặc 3 đó. Speaking khi luyện được ghi âm lại trước khi hoàn thành."}
              </span>
            </div>
            <div
              style={styleOf("display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start")}
            >
              <PracticeSidebar
                search={{
                  value: q,
                  placeholder: isW ? "Tìm đề Writing" : "Tìm đề Speaking",
                  onChange: setQ,
                }}
                groups={groups}
                onClear={filtersOn ? clear : undefined}
                sort={{
                  value: sort,
                  options: [
                    ["NEW", "Mới nhất"],
                    ["OLD", "Cũ nhất"],
                  ],
                  onPick: (k) => setSort(k === "OLD" ? "OLD" : "NEW"),
                }}
              />
              <div
                style={styleOf(
                  "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 32px",
                )}
              >
                {cat.loading ? (
                  note("Đang tải danh sách đề...")
                ) : cat.error ? (
                  note("Không tải được danh sách đề. Hãy thử lại sau.")
                ) : cat.items.length === 0 ? (
                  note("Chưa có " + (isW ? "Task" : "Part") + " nào được đăng. Đề sẽ hiện ở đây khi được đăng.")
                ) : cards.length === 0 ? (
                  <div style={styleOf("display: flex; flex-direction: column; align-items: flex-start; gap: 12px")}>
                    {note("Không có đề nào khớp bộ lọc.")}
                    {filtersOn ? (
                      <button type="button" onClick={clear} style={styleOf("display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637")}>
                        {"Xóa bộ lọc"}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <>
                  <div
                    style={styleOf(
                      "display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 36px 24px",
                    )}
                  >
                    {shown.map((it) => (
                      <WsCard key={it.key} item={it} title={titles.get(it.key) || ""} onStart={start} />
                    ))}
                  </div>
                  <Pagination pages={pages} current={cur} onPick={setPage} />
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      <DesktopRequiredDialog isOpen={guard} onClose={() => setGuard(false)} />
    </>
  );
}
