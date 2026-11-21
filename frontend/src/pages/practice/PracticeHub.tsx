import React, { useEffect, useState } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import { DesktopRequiredDialog } from "../../components/exams/TestScreenGuard";
import { PracticeCard } from "../../components/practice/PracticeSkillPage";
import { WsCard } from "../../components/practice/PracticeWsPage";
import { styleOf, cssText } from "../../lib/shared/styles";
import {
  getCatalogSets,
  getPracticeItems,
  coverStyle,
  fmtCount,
  skillPage,
  startExam,
  titleMap,
  type CatalogSet,
  type PracticeItem,
  type PracticeSkill,
} from "../../lib/exams/exam-catalog";

type Load<T> = { data: T[]; loading: boolean; error: boolean };

const SKILLS: Array<{
  skill: PracticeSkill;
  title: string;
  sub: string;
  page: "PracticeListening" | "PracticeReading" | "PracticeWriting" | "PracticeSpeaking";
}> = [
  { skill: "LISTENING", title: "IELTS Listening Practice", sub: "Luyện từng Section.", page: "PracticeListening" },
  { skill: "READING", title: "IELTS Reading Practice", sub: "Luyện từng Passage.", page: "PracticeReading" },
  { skill: "WRITING", title: "IELTS Writing Practice", sub: "Luyện riêng từng Task.", page: "PracticeWriting" },
  { skill: "SPEAKING", title: "IELTS Speaking Practice", sub: "Luyện riêng từng Part.", page: "PracticeSpeaking" },
];

const CARD =
  "display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ";
const ROW =
  "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px";
const H2 =
  "margin: 0; font-size: 24px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em";
const LINK =
  "display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none";
const SLIDE = "flex: 1 0 240px; max-width: 320px; scroll-snap-align: start; min-width: 0; ";

function Arrow() {
  return (
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
      <path d="M5 12h14M13 6l6 6-6 6"></path>
    </svg>
  );
}

function Section({
  title,
  sub,
  moreHref,
  state,
  children,
}: {
  title: string;
  sub: string;
  moreHref: string;
  state: Load<unknown>;
  children: React.ReactNode;
}) {
  const note = (t: string) => <div style={styleOf("color: #706473; font-size: 14px")}>{t}</div>;
  return (
    <section style={styleOf("display: flex; flex-direction: column; gap: 20px")}>
      <div
        style={styleOf(
          "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px",
        )}
      >
        <div>
          <h2 style={styleOf(H2)}>{title}</h2>
          <p style={styleOf("margin: 4px 0 0; color: #706473; font-size: 14px")}>{sub}</p>
        </div>
        <a href={"#" + moreHref} style={styleOf(LINK)}>
          {"Xem thêm"}
          <Arrow />
        </a>
      </div>
      {state.loading
        ? note("Đang tải...")
        : state.error
          ? note("Không tải được dữ liệu. Hãy thử lại sau.")
          : state.data.length === 0
            ? note("Chưa có bài.")
            : <div style={styleOf(ROW)}>{children}</div>}
    </section>
  );
}

export default function PracticeHub() {
  const [sets, setSets] = useState<Load<CatalogSet>>({ data: [], loading: true, error: false });
  const [items, setItems] = useState<Record<string, Load<PracticeItem>>>(() =>
    Object.fromEntries(SKILLS.map((s) => [s.skill, { data: [], loading: true, error: false }])),
  );
  const [guard, setGuard] = useState(false);

  useEffect(() => {
    let alive = true;
    getCatalogSets()
      .then((d) => alive && setSets({ data: d, loading: false, error: false }))
      .catch(() => alive && setSets({ data: [], loading: false, error: true }));
    SKILLS.forEach((s) => {
      getPracticeItems(s.skill)
        .then((d) => alive && setItems((st) => ({ ...st, [s.skill]: { data: d, loading: false, error: false } })))
        .catch(() => alive && setItems((st) => ({ ...st, [s.skill]: { data: [], loading: false, error: true } })));
    });
    return () => {
      alive = false;
    };
  }, []);

  const start = (it: PracticeItem) => {
    if (!startExam(skillPage(it.skill), it.examId, it.orderNo)) setGuard(true);
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
              <div style={styleOf("font-size: 13px; color: #706473")}>{"Thư viện đề"}</div>
              <h1
                style={styleOf(
                  "margin: 0; font-size: 36px; line-height: 1.2; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Thư viện đề IELTS"}
              </h1>
              <p style={styleOf("margin: 0; max-width: 720px; font-size: 16px; color: #4B3D4D")}>
                {
                  "Làm đề đủ 4 kỹ năng hoặc luyện riêng từng kỹ năng: Listening, Reading, Writing và Speaking."
                }
              </p>
            </div>
          </section>
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 32px 24px 56px; display: flex; flex-direction: column; gap: 40px",
            )}
          >
            <Section
              title="IELTS Full Tests"
              sub="Bộ đề mới nhất, đủ 4 kỹ năng."
              moreHref="FullTests"
              state={sets}
            >
              {sets.data.slice(0, 4).map((s, i) => (
                <div key={s.id} style={styleOf(CARD + SLIDE)}>
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
                    <span
                      aria-hidden="true"
                      style={styleOf("width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5")}
                    ></span>
                    <span>{s.attemptCount > 0 ? fmtCount(s.attemptCount) + " lượt làm bài" : "—"}</span>
                  </div>
                  <a
                    href={"#ExamDetail?id=" + s.id}
                    style={styleOf(
                      "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                    )}
                  >
                    {"Xem bài test"}
                    <Arrow />
                  </a>
                </div>
              ))}
            </Section>
            {SKILLS.map((k) => {
              const st = items[k.skill];
              const top = st.data.slice(0, 4);
              const titles = titleMap(st.data);
              return (
                <Section key={k.skill} title={k.title} sub={k.sub} moreHref={k.page} state={st}>
                  {top.map((it, i) =>
                    k.skill === "LISTENING" || k.skill === "READING" ? (
                      <PracticeCard
                        key={it.key}
                        item={it}
                        title={titles.get(it.key) || ""}
                        index={i}
                        extra={SLIDE}
                        onStart={start}
                      />
                    ) : (
                      <WsCard
                        key={it.key}
                        item={it}
                        title={titles.get(it.key) || ""}
                        extra={SLIDE}
                        onStart={start}
                      />
                    ),
                  )}
                </Section>
              );
            })}
          </div>
        </div>
      </div>
      <DesktopRequiredDialog isOpen={guard} onClose={() => setGuard(false)} />
    </>
  );
}
