import React, { useEffect, useMemo, useState } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import { DesktopRequiredDialog } from "../../components/exams/TestScreenGuard";
import { styleOf, cssText } from "../../lib/shared/styles";
import { useAuth } from "../../lib/auth/auth";
import {
  getCatalogSets,
  getInProgress,
  getPracticeItems,
  coverStyle,
  fmtCount,
  latestTests,
  skillPage,
  startExam,
  testTitle,
  type CatalogForm,
  type CatalogSet,
  type InProgressAttempt,
  type PracticeItem,
} from "../../lib/exams/exam-catalog";

type Tab = "ALL" | CatalogForm;

type Group = { id: string; orderNo: number; title: string; sets: CatalogSet[] };

function groupSets(sets: CatalogSet[], tab: Tab, q: string): Group[] {
  const needle = q.trim().toLowerCase();
  const byCat = new Map<string, Group>();
  for (const s of sets) {
    if (tab !== "ALL" && s.forms.indexOf(tab) < 0) continue;
    if (needle && s.name.toLowerCase().indexOf(needle) < 0) continue;
    let g = byCat.get(s.category.id);
    if (!g) {
      const n = s.category.name;
      g = {
        id: s.category.id,
        orderNo: s.category.orderNo,
        title: /^ielts\b/i.test(n) ? "Bộ " + n : "Bộ IELTS " + n,
        sets: [],
      };
      byCat.set(s.category.id, g);
    }
    g.sets.push(s);
  }
  return Array.from(byCat.values()).sort((a, b) => a.orderNo - b.orderNo);
}

const CHIP =
  "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-size: 14px; font-weight: 600";
const CARD =
  "scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)";
const ROW =
  "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px";
const H2 =
  "margin: 0; font-size: 24px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em";
const DOT = "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5";

function Icon({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function FullTests() {
  const [sets, setSets] = useState<CatalogSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("ALL");
  const [q, setQ] = useState("");
  const [allItems, setAllItems] = useState<PracticeItem[]>([]);
  const [doing, setDoing] = useState<InProgressAttempt[]>([]);
  const auth = useAuth();
  const learner = auth.user?.role === "LEARNER";
  const [guard, setGuard] = useState(false);

  useEffect(() => {
    let alive = true;
    getCatalogSets()
      .then((d) => alive && (setSets(d), setLoading(false)))
      .catch(() => alive && (setLoading(false), setError(true)));
    // Khối "Bài test mới nhất" (Listening/Reading cả bài); lỗi ở đây không chặn phần còn lại.
    Promise.all([getPracticeItems("LISTENING"), getPracticeItems("READING")])
      .then(([l, r]) => {
        if (alive) setAllItems([...l, ...r]);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Đang làm dở: chỉ khi đã đăng nhập; lỗi tải thì ẩn khối, không chặn phần còn lại.
  useEffect(() => {
    if (!learner) {
      setDoing([]);
      return;
    }
    let alive = true;
    getInProgress()
      .then((d) => alive && setDoing(d))
      .catch(() => alive && setDoing([]));
    return () => {
      alive = false;
    };
  }, [learner, auth.user?.id]);

  const groups = useMemo(() => groupSets(sets, tab, q), [sets, tab, q]);
  // Bài đang làm dở không lặp lại trong "Bài test mới nhất".
  const latest = useMemo(
    () => latestTests(allItems, 6, new Set(doing.map((d) => d.examSkillId))),
    [allItems, doing],
  );

  const tabs: Array<[Tab, string]> = [
    ["ALL", "Tất cả"],
    ["ACADEMIC", "Academic"],
    ["GENERAL", "General Training"],
  ];

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
          <section
            style={styleOf(
              "background: linear-gradient(135deg, #E3ECFD 0%, #E6F3EC 100%); border-bottom: 1.5px solid #D6D4D0",
            )}
          >
            <div
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 36px 24px 32px; display: flex; flex-direction: column; gap: 12px",
              )}
            >
              <div style={styleOf("font-size: 13px; color: #706473")}>
                {"Thư viện đề / IELTS Full Tests"}
              </div>
              <h1
                style={styleOf(
                  "margin: 0; font-size: 36px; line-height: 1.2; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"IELTS Full Tests"}
              </h1>
              <p style={styleOf("margin: 0; max-width: 720px; font-size: 16px; color: #4B3D4D")}>
                {
                  "Làm đề đủ 4 kỹ năng với giao diện giống thi trên máy. Listening và Reading chấm ngay. Bài Writing và Speaking được lưu 14 ngày, bạn chọn gửi giáo viên chấm khi cần."
                }
              </p>
              <div
                style={styleOf("display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px")}
              >
                <span style={styleOf(CHIP)}>
                  <Icon>
                    <path d="M12 3l9 5-9 5-9-5z"></path>
                    <path d="M3 13l9 5 9-5"></path>
                  </Icon>
                  {"Đề mới mỗi quý"}
                </span>
                <span style={styleOf(CHIP)}>
                  <Icon>
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </Icon>
                  {"Tính giờ như thi thật"}
                </span>
                <span style={styleOf(CHIP)}>
                  <Icon>
                    <path d="M5 12.5l4.5 4.5L19 7"></path>
                  </Icon>
                  {"Lời giải chi tiết"}
                </span>
              </div>
            </div>
          </section>
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 32px 24px 56px; display: flex; flex-direction: column; gap: 32px",
            )}
          >
            {doing.length > 0 ? (
              <section style={styleOf("display: flex; flex-direction: column; gap: 20px")}>
                <h2 style={styleOf(H2)}>{"Đang làm dở"}</h2>
                <div style={styleOf(ROW)}>
                  {doing.map((d) => {
                    const pct = d.total > 0 ? Math.min(100, Math.round((d.answered / d.total) * 100)) : 0;
                    return (
                      <div
                        key={d.skillAttemptId}
                        style={styleOf(CARD + "; flex: 1 0 240px; max-width: 320px")}
                      >
                        <div style={styleOf("padding: 4px 8px 0")}>
                          <div
                            style={styleOf(
                              "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                            )}
                          >
                            {testTitle(d) + (d.sectionOrderNo ? " · " + (d.skill === "LISTENING" ? "Section " : "Passage ") + d.sectionOrderNo : "")}
                          </div>
                        </div>
                        <div style={styleOf("padding: 0 8px; display: flex; flex-direction: column; gap: 6px")}>
                          <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={d.total}
                            aria-valuenow={d.answered}
                            style={styleOf("height: 8px; border-radius: 999px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden")}
                          >
                            <div
                              style={styleOf(
                                "height: 100%; border-radius: 999px; background: #2963CC; width: " + pct + "%",
                              )}
                            ></div>
                          </div>
                          <span style={styleOf("font-size: 14px; color: #706473")}>
                            {d.answered + "/" + d.total + " câu"}
                          </span>
                        </div>
                        <div style={styleOf("margin-top: auto; padding: 4px 8px 0; display: flex")}>
                          <a
                            href={"#" + skillPage(d.skill)}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!startExam(skillPage(d.skill), d.examId, d.sectionOrderNo ?? undefined)) setGuard(true);
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
                              stroke="#2963CC"
                              strokeWidth="2"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="9"></circle>
                              <path d="M10 9v6M14 9v6"></path>
                            </svg>
                            {"Làm tiếp"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {latest.length > 0 ? (
              <section style={styleOf("display: flex; flex-direction: column; gap: 20px")}>
                <h2 style={styleOf(H2)}>{"Bài test mới nhất"}</h2>
                <div style={styleOf(ROW)}>
                  {latest.map((t) => (
                    <div
                      key={t.key}
                      style={styleOf(CARD + "; flex: 1 0 240px; max-width: 320px")}
                    >
                      <div style={styleOf("padding: 4px 8px 0")}>
                        <div
                          style={styleOf(
                            "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                          )}
                        >
                          {t.title}
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                        )}
                      >
                        <span>
                          {t.attemptCount > 0 ? fmtCount(t.attemptCount) + " lượt làm bài" : "—"}
                        </span>
                        <span aria-hidden="true" style={styleOf(DOT)}></span>
                        <span>{t.questionCount > 0 ? t.questionCount + " câu" : "—"}</span>
                      </div>
                      <div style={styleOf("margin-top: auto; padding: 4px 8px 0; display: flex")}>
                        <a
                          href={"#" + skillPage(t.skill)}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!startExam(skillPage(t.skill), t.examId)) setGuard(true);
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
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            <div style={styleOf("display: flex; gap: 14px; align-items: center; flex-wrap: wrap")}>
              <div
                style={styleOf(
                  "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                )}
              >
                {tabs.map(([key, label]) => (
                  <span
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => setTab(key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setTab(key);
                      }
                    }}
                    style={styleOf(
                      tab === key
                        ? "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600; cursor: pointer"
                        : "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500; cursor: pointer",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; width: 300px; box-sizing: border-box; border: 1.5px solid #D6D4D0; border-radius: 10px; background: #FFFFFF; color: #706473; font-size: 14px",
                )}
              >
                <Icon size={18}>
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M20 20l-4-4"></path>
                </Icon>
                <input
                  type="search"
                  aria-label="Tìm bộ đề"
                  placeholder="Tìm bộ đề"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={styleOf(
                    "flex: 1; min-width: 0; border: 0; background: transparent; font: inherit; font-size: 14px; color: #352637; outline: none",
                  )}
                />
              </div>
            </div>
            {loading ? (
              <div style={styleOf("color: #706473; font-size: 14px")}>
                {"Đang tải danh sách bộ đề..."}
              </div>
            ) : error ? (
              <div style={styleOf("color: #706473; font-size: 14px")}>
                {"Không tải được danh sách bộ đề. Hãy thử lại sau."}
              </div>
            ) : groups.length === 0 ? (
              <div style={styleOf("color: #706473; font-size: 14px")}>
                {"Chưa có bộ đề phù hợp."}
              </div>
            ) : (
              groups.map((g) => (
                <section
                  key={g.id}
                  style={styleOf("display: flex; flex-direction: column; gap: 20px")}
                >
                  <div
                    style={styleOf(
                      "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px",
                    )}
                  >
                    <h2 style={styleOf(H2)}>{g.title}</h2>
                  </div>
                  <div style={styleOf(ROW)}>
                    {g.sets.map((s, i) => (
                      <div
                        key={s.id}
                        style={styleOf(CARD + "; flex: 1 0 240px; max-width: 320px")}
                      >
                        <div
                          style={styleOf(
                            "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: " +
                              coverStyle(s.coverUrl, i),
                          )}
                        >
                          {s.isNew ? (
                            <span
                              style={styleOf(
                                "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 11px; font-weight: 700; line-height: 1.4; white-space: nowrap",
                              )}
                            >
                              {"Mới"}
                            </span>
                          ) : null}
                        </div>
                        <div style={styleOf("padding: 4px 8px 0")}>
                          <div
                            style={styleOf(
                              "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                            )}
                          >
                            {s.name}
                          </div>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                          )}
                        >
                          <span>{s.testCount + " bài test"}</span>
                          <span aria-hidden="true" style={styleOf(DOT)}></span>
                          <span>
                            {s.attemptCount > 0 ? fmtCount(s.attemptCount) + " lượt làm bài" : "—"}
                          </span>
                        </div>
                        <a
                          href={"#ExamDetail?id=" + s.id}
                          style={styleOf(
                            "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                          )}
                        >
                          {"Xem bài test"}
                          <Icon>
                            <path d="M5 12h14M13 6l6 6-6 6"></path>
                          </Icon>
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
      <DesktopRequiredDialog isOpen={guard} onClose={() => setGuard(false)} />
    </>
  );
}
