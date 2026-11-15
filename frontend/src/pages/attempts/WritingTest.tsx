import { attemptAppearance } from "../../components/attempts/appearance";
import {
  writingTasks,
  writingAnswers,
  writingNotes,
} from "../../data/attempt-samples";
import type {
  ScreenProps,
  AttemptState,
} from "../../components/attempts/types";
import React from "react";
import TestTopbar from "../../components/attempts/TestTopbar";
class WritingTest extends React.Component<ScreenProps, AttemptState> {
  state: AttemptState = this.props.initialState || {};
  publishSnapshot() {
    this.props.onSnapshot?.({ state: this.state, model: { questions: [] } });
  }
  componentDidMount() {
    this.publishSnapshot();
  }
  componentDidUpdate(_previousProps: ScreenProps, previousState: AttemptState) {
    if (previousState !== this.state) this.publishSnapshot();
  }
  renderVals() {
    const P = this.props,
      S = this.state || {},
      self = this;
    const real = P.cheDo !== "practice";
    const {fontPct,fs,dark,accent}=attemptAppearance(P,S);
    const t = dark
      ? {
          bg: "#202125",
          page: "#202125",
          card: "#292A2E",
          line: "#46474D",
          ink: "#F1F2F4",
          muted: "#B2B3B9",
          soft: "#292A2E",
          link: "#8DB0F7",
          sel: "#24395E",
          rule: "#3A3B40",
        }
      : {
          bg: "#FCFBF7",
          page: "#FAF9F5",
          card: "#FFFFFF",
          line: "#D6D4D0",
          ink: "#352637",
          muted: "#706473",
          soft: "#F3F0EA",
          link: "#2963CC",
          sel: "#E3ECFD",
          rule: "#E6E4E0",
        };
    const task: 1 | 2 =
      Number(S.task != null ? S.task : P.task || 2) === 1 ? 1 : 2;
    const TASKS = writingTasks;
    const TEXTS = S.texts || writingAnswers;
    const NOTES = S.notes || writingNotes;
    const cur = TASKS[task];
    const text = TEXTS[task] || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    function setIn(map: Record<number, string>, key: number, val: string) {
      const c = Object.assign({}, map);
      c[key] = val;
      return c;
    }
    const tabs: number[] = real ? [1, 2] : [task];
    return {
      t: t,
      accent: accent,
      fs: fs,
      cheDo: real ? "real" : "practice",
      dark: dark,
      fontPct: fontPct,
      title:
        "Writing · IELTS Recent Actual Tests · Test 1" +
        (real ? "" : " · " + cur.label),
      crumb: "Thư viện đề / IELTS Recent Actual Tests / Test 1",
      timeText: P.timeText,
      setFont: function (v: number) {
        self.setState({ fontPct: v });
      },
      setDark: function (v: boolean) {
        self.setState({ dark: v });
      },
      taskTabs: tabs.map(function (n) {
        const on = n === task;
        return {
          label: "Task " + n,
          on: on,
          locked: !real,
          bg: on ? t.ink : t.card,
          fg: on ? (dark ? "#202125" : "#FFFFFF") : t.ink,
          border: on ? t.ink : t.line,
          pick: function () {
            if (real) {
              self.setState({ task: n });
            }
          },
        };
      }),
      taskLabel: cur.label,
      taskMeta: cur.meta,
      taskTitle: cur.title,
      taskPrompt: cur.prompt,
      taskHint: cur.hint,
      notes: NOTES[task] || "",
      setNotes: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
        self.setState({
          notes: setIn(NOTES, task, e && e.target ? e.target.value : ""),
        });
      },
      text: text,
      wordCount: words,
      setText: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
        self.setState({
          texts: setIn(TEXTS, task, e && e.target ? e.target.value : ""),
        });
      },
      paperStyleClass:
        "block w-full box-border [min-height:540px] [padding:0_20px] rounded-xl [background-attachment:local] [line-height:30px] [resize:vertical]",
      paperStyle: {
        border: "1.5px solid " + t.line,
        backgroundColor: t.card,
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0, transparent 29px, " +
          t.rule +
          " 29px, " +
          t.rule +
          " 30px)",
        color: t.ink,
        fontSize: fs + "px",
      },
    };
  }

  static defaultProps = {
    cheDo: "real",
    task: "2",
    toi: false,
    coChu: 100,
    accent: "#2963CC",
  };
  render() {
    const v = this.renderVals();
    return (
      <>
        <div
          className="attempt-screen attempt-sans [font-size:15px] [line-height:1.6]"
          style={{ color: v.t.ink, background: v.t.bg }}
        >
          <div className="relative [z-index:30]">
            <TestTopbar
              onExit={this.props.onExit}
              onSubmit={this.props.onSubmit}
              skill="writing"
              cheDo={v.cheDo}
              title={v.title}
              crumb={v.crumb}
              timeText={v.timeText}
              fontPct={v.fontPct}
              dark={v.dark}
              submitLabel="Hoàn thành"
              submitHref="#SubmitDialogs"
              exitHref="#SubmitDialogs"
              accent={v.accent}
              setFont={v.setFont}
              setDark={v.setDark}
            ></TestTopbar>
          </div>
          <div
            className="attempt-workspace flex flex-wrap items-stretch"
            style={{ background: v.t.page }}
          >
            <div
              className="[flex:1_1_420px] min-w-0 box-border [padding:24px_32px] flex flex-col gap-4"
              style={{ borderRight: "1.5px solid " + v.t.line }}
            >
              <div role="group" aria-label="Chọn Task" className="flex gap-2">
                {(v.taskTabs || []).map((tab, index) => (
                  <React.Fragment key={index}>
                    <button
                      type="button"
                      aria-pressed={tab.on}
                      onClick={tab.pick}
                      className="inline-flex items-center [height:30px] [padding:0_12px] rounded-full [font-size:13px] font-semibold whitespace-nowrap box-border cursor-pointer"
                      style={{
                        border: "1.5px solid " + tab.border,
                        background: tab.bg,
                        color: tab.fg,
                      }}
                    >
                      {tab.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <div
                className="p-7 [border-radius:22px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col gap-3"
                style={{
                  border: "1.5px solid " + v.t.line,
                  background: v.t.card,
                }}
              >
                <div
                  className="[font-size:13px] font-semibold [letter-spacing:0.08em] uppercase"
                  style={{ color: v.t.muted }}
                >
                  {v.taskMeta}
                </div>
                <h2 className="m-0 [font-size:22px] [line-height:1.3] attempt-sans [letter-spacing:-0.015em]">
                  {v.taskTitle}
                </h2>
                <div
                  className="[line-height:1.75]"
                  style={{ fontSize: v.fs + "px" }}
                >
                  {v.taskPrompt}
                </div>
                <div className="[font-size:14px]" style={{ color: v.t.muted }}>
                  {v.taskHint}
                </div>
              </div>
              <section
                aria-label="Notes"
                className="[padding:20px_24px] [border-radius:22px] flex flex-col [gap:10px]"
                style={{
                  border: "1.5px solid " + v.t.line,
                  background: v.t.card,
                }}
              >
                <div className="flex items-center gap-2 font-semibold">
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
                    <path d="M6 3h9l4 4v14H6z"></path>
                    <path d="M9 12h7M9 16h5"></path>
                  </svg>
                  {"Notes · dàn ý"}
                </div>
                <textarea
                  aria-label={"Notes dàn ý của " + v.taskLabel}
                  placeholder="Ghi dàn ý, ý chính, từ vựng muốn dùng…"
                  rows={5}
                  value={v.notes}
                  onChange={v.setNotes}
                  className="block w-full box-border [padding:10px_12px] [border-radius:10px] [font-size:14px] [line-height:1.6] [resize:vertical]"
                  style={{
                    border: "1.5px solid " + v.t.line,
                    background: v.t.soft,
                    color: v.t.ink,
                  }}
                ></textarea>
              </section>
              <div
                className="flex [gap:10px] items-start [padding:12px_16px] rounded-xl [font-size:14px]"
                style={{
                  background: v.t.sel,
                  border: "1.5px solid " + v.t.line,
                }}
              >
                <span
                  className="[flex:0_0_18px] [margin-top:2px] flex"
                  style={{ color: v.t.link }}
                >
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
                  {
                    "Chọn Hoàn thành để lưu bài trong 14 ngày. Hoàn thành không tự gửi chấm và không dùng lượt; bạn chủ động gửi yêu cầu chấm sau."
                  }
                </span>
              </div>
            </div>
            <div className="[flex:1.15_1_480px] min-w-0 box-border [padding:24px_32px]">
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <label htmlFor="bai-lam" className="font-semibold flex-1">
                    {"Bài làm của bạn · " + v.taskLabel}
                  </label>
                  <span
                    className="inline-flex items-center [height:26px] [padding:0_10px] rounded-full [font-size:13px] font-semibold whitespace-nowrap"
                    style={{
                      border: "1.5px solid " + v.t.line,
                      background: v.t.soft,
                      color: v.t.muted,
                    }}
                  >
                    {v.wordCount + " từ"}
                  </span>
                </div>
                <textarea
                  id="bai-lam"
                  placeholder="Bắt đầu viết bài của bạn ở đây…"
                  value={v.text}
                  onChange={v.setText}
                  className={v.paperStyleClass}
                  style={v.paperStyle}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default WritingTest;
