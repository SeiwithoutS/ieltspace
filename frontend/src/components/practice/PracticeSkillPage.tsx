import React, { useMemo, useState } from "react";
import LearnerHeader from "../navigation/LearnerHeader";
import PracticeSidebar from "./PracticeSidebar";
import Pagination from "./Pagination";
import { usePracticeCatalog } from "./usePracticeCatalog";
import { DesktopRequiredDialog } from "../exams/TestScreenGuard";
import { styleOf, cssText } from "../../lib/shared/styles";
import {
  coverStyle,
  fmtCount,
  formLabel,
  skillPage,
  startExam,
  titleMap,
  type PracticeItem,
} from "../../lib/exams/exam-catalog";

type Sort = "NEW" | "OLD" | "MOST" | "AZ" | "ZA";

const SORTS: Array<[Sort, string]> = [
  ["NEW", "Mới nhất"],
  ["OLD", "Cũ nhất"],
  ["MOST", "Nhiều lượt làm bài nhất"],
  ["AZ", "Từ A đến Z"],
  ["ZA", "Từ Z đến A"],
];

const PER_PAGE = 12;
const H2 =
  "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em";

// Mỗi thẻ là một Section (Listening) hoặc Passage (Reading); tiêu đề là chủ đề của section/passage đó.
export function PracticeCard({
  item,
  title,
  index,
  extra,
  onStart,
}: {
  item: PracticeItem;
  title: string;
  index: number;
  extra: string;
  onStart: (item: PracticeItem) => void;
}) {
  return (
    <article
      title={`${item.setName} ${item.examTitle}`}
      style={styleOf(
        extra +
          "display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
      )}
    >
      <div
        style={styleOf(
          "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: " +
            coverStyle(item.coverUrl, index),
        )}
      >
        <span
          style={styleOf(
            "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
          )}
        >
          {item.questionCount ? item.questionCount + " câu" : "—"}
        </span>
      </div>
      <div style={styleOf("padding: 4px 8px 0")}>
        <div
          style={styleOf(
            "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
          )}
        >
          {title}
        </div>
      </div>
      <div
        style={styleOf(
          "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
        )}
      >
        <span>{item.label + (item.form ? " · " + formLabel(item.form) : "")}</span>
        <span
          aria-hidden="true"
          style={styleOf("width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5")}
        ></span>
        <span>{item.attemptCount > 0 ? fmtCount(item.attemptCount) + " lượt làm bài" : "—"}</span>
      </div>
      <div style={styleOf("margin-top: auto; padding: 4px 8px 0; display: flex")}>
        <a
          href={"#" + skillPage(item.skill)}
          onClick={(e) => {
            e.preventDefault();
            onStart(item);
          }}
          style={styleOf(
            "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
          )}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C0412A"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M10 8.5l5 3.5-5 3.5z" fill="#C0412A" strokeLinejoin="round"></path>
          </svg>
          {"Làm bài"}
        </a>
      </div>
    </article>
  );
}

// Trang luyện Listening (theo Section) hoặc Reading (theo Passage).
export default function PracticeSkillPage({ skill }: { skill: "LISTENING" | "READING" }) {
  const isL = skill === "LISTENING";
  const cat = usePracticeCatalog(skill);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("NEW");
  const [page, setPage] = useState(1);
  const [types, setTypes] = useState<string[]>([]);
  const [guard, setGuard] = useState(false);

  const titles = useMemo(() => titleMap(cat.items), [cat.items]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const title = (it: PracticeItem) => titles.get(it.key) || "";
    const filtered = cat.items.filter((it) => {
      if (types.length > 0 && !types.some((t) => it.questionTypes.indexOf(t) >= 0)) return false;
      return (
        !needle ||
        (title(it) + " " + it.setName + " " + it.examTitle).toLowerCase().indexOf(needle) >= 0
      );
    });
    return filtered.slice().sort((a, b) => {
      if (sort === "OLD") return (a.publishedAt || "").localeCompare(b.publishedAt || "");
      if (sort === "MOST") return b.attemptCount - a.attemptCount;
      if (sort === "AZ") return title(a).localeCompare(title(b));
      if (sort === "ZA") return title(b).localeCompare(title(a));
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    });
  }, [cat.items, q, sort, types, titles]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const suggested = cat.items.slice(0, 4);

  const start = (it: PracticeItem) => {
    if (!startExam(skillPage(it.skill), it.examId, it.orderNo)) setGuard(true);
  };
  const note = (text: string) => (
    <div style={styleOf("color: #706473; font-size: 14px")}>{text}</div>
  );
  const filtersOn = q.trim() !== "" || types.length > 0;
  const clear = () => {
    setQ("");
    setTypes([]);
    setPage(1);
  };
  const unit = isL ? "Section" : "Passage";
  const status = (rows: unknown[]) => {
    if (cat.loading) return note("Đang tải danh sách bài...");
    if (cat.error) return note("Không tải được danh sách bài. Hãy thử lại sau.");
    if (cat.items.length === 0) {
      return note("Chưa có " + unit + " nào được đăng. Bài sẽ hiện ở đây khi đề được đăng.");
    }
    if (rows.length === 0) {
      return (
        <div style={styleOf("display: flex; flex-direction: column; align-items: flex-start; gap: 12px")}>
          {note("Không có bài nào khớp bộ lọc.")}
          {filtersOn ? (
            <button type="button" onClick={clear} style={styleOf("display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 16px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637")}>
              {"Xóa bộ lọc"}
            </button>
          ) : null}
        </div>
      );
    }
    return null;
  };

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
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; display: flex; flex-direction: column; gap: 40px",
            )}
          >
            <div style={styleOf("display: flex; flex-direction: column; gap: 6px")}>
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {isL
                  ? "Thư viện đề / IELTS Listening Practice"
                  : "Thư viện đề / IELTS Reading Practice"}
              </div>
              <p style={styleOf("margin: 0; max-width: 760px; color: #706473; font-size: 15px")}>
                {isL
                  ? "Luyện từng phần nghe riêng lẻ với audio chuẩn thi, chấm ngay và xem transcript sau khi nộp."
                  : "Luyện từng bài đọc riêng lẻ, xem lời giải chỉ rõ đoạn nào trong bài chứa đáp án."}
              </p>
            </div>
            <section style={styleOf("display: flex; flex-direction: column; gap: 20px")}>
              <h2 style={styleOf(H2)}>{"Gợi ý cho bạn"}</h2>
              {status(suggested) || (
                <div
                  style={styleOf(
                    "display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
                  )}
                >
                  {suggested.map((it, i) => (
                    <PracticeCard
                      key={it.key}
                      item={it}
                      title={titles.get(it.key) || ""}
                      index={i}
                      extra="flex: 1 0 240px; max-width: 320px; scroll-snap-align: start; min-width: 0; "
                      onStart={start}
                    />
                  ))}
                </div>
              )}
            </section>
            <section style={styleOf("display: flex; flex-direction: column; gap: 20px")}>
              <h2 style={styleOf(H2)}>{isL ? "Kho Listening Practice" : "Kho Reading Practice"}</h2>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start",
                )}
              >
                <PracticeSidebar
                  search={{
                    value: q,
                    placeholder: "Tìm bài",
                    onChange: (v) => {
                      setQ(v);
                      setPage(1);
                    },
                  }}
                  groups={
                    cat.questionTypes.length > 0
                      ? [
                          {
                            key: "types",
                            title: "Dạng câu hỏi",
                            options: cat.questionTypes.map((t) => ({
                              value: t.code,
                              name: t.name,
                              count: cat.items.filter((it) => it.questionTypes.indexOf(t.code) >= 0).length,
                            })),
                            selected: types,
                            onToggle: (v) => {
                              setTypes(
                                types.indexOf(v) >= 0 ? types.filter((x) => x !== v) : types.concat(v),
                              );
                              setPage(1);
                            },
                          },
                        ]
                      : []
                  }
                  onClear={filtersOn ? clear : undefined}
                  sort={{
                    value: sort,
                    options: SORTS,
                    onPick: (k) => {
                      setSort(k as Sort);
                      setPage(1);
                    },
                  }}
                />
                <div
                  style={styleOf(
                    "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 32px",
                  )}
                >
                  {status(list) || (
                    <>
                      <div
                        style={styleOf(
                          "display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 36px 24px",
                        )}
                      >
                        {shown.map((it, i) => (
                          <PracticeCard
                            key={it.key}
                            item={it}
                            title={titles.get(it.key) || ""}
                            index={i}
                            extra="min-width: 0; "
                            onStart={start}
                          />
                        ))}
                      </div>
                      <Pagination pages={pages} current={cur} onPick={setPage} />
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <DesktopRequiredDialog isOpen={guard} onClose={() => setGuard(false)} />
    </>
  );
}
