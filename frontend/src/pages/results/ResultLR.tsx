import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import { sampleResults } from "../../data/attempt-samples";
import React from "react";
import LearnerHeader from "../../components/attempts/LearnerHeader";
function ResultLR(props: { accent?: string; cheDo?: string; kyNang?: string }) {
  function renderVals() {
    const P = props;
    const accent = P.accent ?? "#2963CC";

    const practice = P.cheDo === "practice",
      listening = P.kyNang === "listening";
    const line = "1.5px solid #D6D4D0";
    const S = sampleResults[listening ? "listening" : "reading"];
    const stats = (practice ? S.prac : S.real).map(function (x, i) {
      return {
        label: x[0],
        value: x[1],
        sub: x[2],
        border: i === 0 ? "none" : line,
      };
    });
    const bars = (practice ? S.bars.prac : S.bars.real).map(function (x) {
      return { label: x[0], pct: x[1] + "%", text: x[2] };
    });
    const transcript = [
      [
        "00:42",
        "Agent",
        "The Old Town Walk runs every ",
        "Saturday",
        " morning, so you would need to book for this weekend.",
        1,
      ],
      [
        "01:05",
        "Agent",
        "We all meet at the ",
        "east",
        " entrance of the park, just by the fountain.",
        2,
      ],
      ["01:20", "Caller", "And how much is it per person?", "", "", 0],
      [
        "01:28",
        "Agent",
        "It is £",
        "12",
        " each, and children under ten go free.",
        3,
      ],
      [
        "01:52",
        "Agent",
        "Please wear ",
        "comfortable shoes",
        " because the route is quite long.",
        4,
      ],
    ].map(function (l) {
      return {
        time: l[0],
        who: l[1],
        before: l[2],
        hit: l[3],
        after: l[4],
        hasAnswer: !!l[5],
        answerN: l[5],
      };
    });
    return {
      accent: accent,
      onAccent: accentForeground(accent),
      skillName: S.name,
      retryHref: S.retry,
      submitNote: practice
        ? "Nộp lúc 09:42, 07/10/2026 · Practice không tính band"
        : "Nộp lúc 09:42, 07/10/2026",
      stats: stats,
      rows: S.rows.map(function (r) {
        return {
          n: r.n,
          chosen: r.chosen,
          correct: r.correct || "",
          explain: r.explain,
          ok: r.ok,
          wrong: !r.ok,
        };
      }),
      bars: bars,
      showTranscript: practice && listening,
      transcript: transcript,
    };
  }

  const v = renderVals();
  return (
    <>
      <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6] [min-height:1120px]">
        <LearnerHeader onAccent={v.onAccent} accent={v.accent}></LearnerHeader>
        <div className="[background:var(--attempt-bg-fcfbf7)] [min-height:1051px]">
          <main className="[max-width:1200px] [margin:0_auto] [padding:36px_24px_56px] flex flex-col gap-6">
            <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
              {"Kết quả / IELTS Recent Actual Tests · Test 1 / " + v.skillName}
            </div>
            <div className="flex justify-between [align-items:flex-end] gap-4">
              <div>
                <h1 className="m-0 [font-size:28px] [line-height:1.25] [letter-spacing:-0.02em] attempt-sans [letter-spacing:-0.015em]">
                  {"Kết quả " + v.skillName}
                </h1>
                <div className="[font-size:15px] [color:var(--attempt-text-706473)] mt-1">
                  {v.submitNote}
                </div>
              </div>
              <div className="flex [gap:10px]">
                <a
                  href={v.retryHref}
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                >
                  {"Làm lại"}
                </a>
                <PageLink
                  page="StudentHome"
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                >
                  {"Về lịch sử"}
                </PageLink>
              </div>
            </div>
            <div className="flex flex-wrap [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden">
              {(v.stats || []).map((st, index) => (
                <React.Fragment key={index}>
                  <div
                    className="[flex:1_1_0] [min-width:160px] [padding:18px_22px]"
                    style={{ borderLeft: st.border }}
                  >
                    <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                      {st.label}
                    </div>
                    <div className="[font-size:28px] font-bold [letter-spacing:-0.02em] [line-height:1.25] font-sans tabular-nums [letter-spacing:-0.015em]">
                      {st.value}
                    </div>
                    <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                      {st.sub}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="flex gap-6 items-start">
              <div className="[flex:1.6_1_0]">
                <div className="[padding:0px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden">
                  <div className="[padding:18px_24px_14px] [font-size:18px] font-semibold">
                    {"Lời giải từng câu"}
                  </div>
                  {(v.rows || []).map((r, index) => (
                    <React.Fragment key={index}>
                      <div className="flex [gap:14px] [padding:16px_24px] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                        <span className="font-bold w-7">{r.n}</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="[font-size:14px]">
                            <b>{"Bạn chọn:"}</b>
                            {" " + r.chosen}
                          </div>
                          {r.wrong ? (
                            <>
                              <div className="[font-size:13px]">
                                <b>{"Đáp án đúng:"}</b>
                                {" " + r.correct}
                              </div>
                            </>
                          ) : null}
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {r.explain}
                          </div>
                        </div>
                        {r.ok ? (
                          <>
                            <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:13px] font-semibold whitespace-nowrap">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M5 12.5l4.5 4.5L19 7"></path>
                              </svg>
                              {"Đúng"}
                            </span>
                          </>
                        ) : null}
                        {r.wrong ? (
                          <>
                            <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:13px] font-semibold whitespace-nowrap">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M6 6l12 12M18 6L6 18"></path>
                              </svg>
                              {"Sai"}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="[flex:1_1_0]">
                <div className="[padding:22px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col gap-3">
                    <div className="[font-size:18px] font-semibold">
                      {"Theo dạng câu hỏi"}
                    </div>
                    {(v.bars || []).map((b, index) => (
                      <React.Fragment key={index}>
                        <div className="flex gap-4 items-center">
                          <div className="[width:170px] [font-size:14px]">
                            {b.label}
                          </div>
                          <div className="flex-1">
                            <div className="h-2 [border-radius:4px] [background:var(--attempt-bg-f3f0ea)] [border:1px_solid_var(--attempt-line-dddbd7)] overflow-hidden">
                              <div
                                className="h-full [background:var(--attempt-bg-2e6a48)]"
                                style={{ width: b.pct }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-semibold [font-size:14px] w-11 [text-align:right]">
                            {b.text}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                    <PageLink
                      page="PracticeLibrary"
                      className="inline-flex items-center justify-center gap-2 h-10 [padding:0_20px] w-full rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                    >
                      {"Luyện thêm dạng yếu"}
                    </PageLink>
                  </div>
                </div>
              </div>
            </div>
            {v.showTranscript ? (
              <>
                <section
                  aria-label="Transcript"
                  className="p-0 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden"
                >
                  <div className="[padding:18px_24px_14px] flex flex-wrap items-center [gap:10px]">
                    <div className="[font-size:18px] font-semibold flex-1">
                      {"Transcript · Section 1"}
                    </div>
                    <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [background:#FCE8A6] [color:var(--attempt-text-352637)] [font-size:13px] font-semibold whitespace-nowrap">
                      {"Đoạn chứa đáp án"}
                    </span>
                  </div>
                  {(v.transcript || []).map((l, index) => (
                    <React.Fragment key={index}>
                      <div className="flex [gap:14px] [padding:14px_24px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] items-start">
                        <span className="[flex:0_0_52px] font-sans tabular-nums [font-size:13px] [color:var(--attempt-text-706473)] [padding-top:2px]">
                          {l.time}
                        </span>
                        <div className="flex-1 min-w-0 [font-size:15px] [line-height:1.7]">
                          <b>{l.who + ":"}</b>
                          {" " + l.before}
                          {l.hasAnswer ? (
                            <>
                              <span className="[background:#FCE8A6] [padding:0_2px] [border-radius:3px]">
                                {l.hit}
                              </span>
                            </>
                          ) : null}
                          {l.after}
                        </div>
                        {l.hasAnswer ? (
                          <>
                            <span className="flex-none inline-flex items-center h-6 [padding:0_8px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-ffffff)] [font-size:12px] font-bold whitespace-nowrap">
                              {"Câu " + l.answerN}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </React.Fragment>
                  ))}
                </section>
              </>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
export default ResultLR;
