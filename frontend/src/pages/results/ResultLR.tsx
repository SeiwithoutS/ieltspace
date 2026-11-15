import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import { sampleResults } from "../../data/attempt-samples";
import React from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="m-0 [font-size:28px] [line-height:1.25] [letter-spacing:-0.02em] attempt-sans [letter-spacing:-0.015em]">
                  {"Kết quả " + v.skillName}
                </h1>
                <div className="[font-size:15px] [color:var(--attempt-text-706473)] mt-1">
                  {v.submitNote}
                </div>
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <a
                  href={v.retryHref}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-white text-[var(--attempt-text-352637,#352637)] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#F3F0EA]"
                >
                  {"Làm lại"}
                </a>
                <PageLink
                  page="StudentHome"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-[1.5px] border-[#352637] bg-[#352637] text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#221824]"
                >
                  {"Về lịch sử"}
                </PageLink>
              </div>
            </div>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-3 divide-y min-[400px]:divide-y-0 min-[400px]:divide-x divide-[var(--attempt-line-d6d4d0,#D6D4D0)] border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-[22px] bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-sm overflow-hidden">
              {(v.stats || []).map((st, index) => (
                <div key={index} className="p-4 sm:p-5 flex flex-col gap-0.5">
                  <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                    {st.label}
                  </div>
                  <div className="text-2xl sm:text-[28px] font-bold tracking-tight font-sans tabular-nums text-[var(--attempt-text-352637,#352637)]">
                    {st.value}
                  </div>
                  <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                    {st.sub}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:flex-[1.6] min-w-0">
                <div className="[padding:0px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden">
                  <div className="[padding:18px_24px_14px] [font-size:18px] font-semibold">
                    {"Lời giải từng câu"}
                  </div>
                  {(v.rows || []).map((r, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col gap-2 p-4 sm:p-5 border-t border-[var(--attempt-line-e6e4e0,#E6E4E0)] first:border-t-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm sm:text-base text-[var(--attempt-text-352637,#352637)]">
                            {"Câu " + r.n}
                          </span>
                          {r.ok ? (
                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-dcede2,#DCEDE2)] text-[var(--attempt-text-2e6a48,#2E6A48)] text-xs font-semibold whitespace-nowrap">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7" />
                              </svg>
                              Đúng
                            </span>
                          ) : null}
                          {r.wrong ? (
                            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-fbdcd3,#FBDCD3)] text-[var(--attempt-text-c0412a,#C0412A)] text-xs font-semibold whitespace-nowrap">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" />
                              </svg>
                              Sai
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-1 text-sm">
                          <div>
                            <b>Bạn chọn:</b> {" " + r.chosen}
                          </div>
                          {r.wrong ? (
                            <div>
                              <b>Đáp án đúng:</b> {" " + r.correct}
                            </div>
                          ) : null}
                          <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)] mt-0.5">
                            {r.explain}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="w-full lg:flex-1 min-w-0 order-first lg:order-none">
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
