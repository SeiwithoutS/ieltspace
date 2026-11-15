import { attemptAppearance } from "../../components/attempts/appearance";
import { focusAttemptQuestion } from "../../components/attempts/focus-question";
import {
  listeningAnswers,
  listeningFlags,
  listeningQuestions,
} from "../../data/attempt-samples";
import type {
  ScreenProps,
  AttemptState,
} from "../../components/attempts/types";
import type { QuestionSummary } from "../../components/attempts/AttemptConfirmation";
import {
  ReviewFlag,
  ChoiceQuestionCard,
} from "../../components/attempts/QuestionControls";
import React from "react";
import TestProgressBar from "../../components/attempts/TestProgressBar";
import TestTopbar from "../../components/attempts/TestTopbar";
class ListeningTest extends React.Component<ScreenProps, AttemptState> {
  state: AttemptState = this.props.initialState || {};
  publishSnapshot() {
    const values = this.renderVals();
    const rows: QuestionSummary[] = [...values.formRows, ...values.questions];
    this.props.onSnapshot?.({
      state: this.state,
      model: {
        questions: rows.map((row) => ({
          n: row.n,
          flagged: row.flagged,
          value: row.value,
          options: row.options?.map((option) => ({ checked: option.checked })),
        })),
      },
    });
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
          opt: "#46474D",
          inputLine: "#46474D",
          chipBg: "#24395E",
          chipFg: "#8DB0F7",
          bar: "#8DB0F7",
          playBg: "#F1F2F4",
          playFg: "#202125",
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
          opt: "#E6E4E0",
          inputLine: "#8E8392",
          chipBg: "#DDE8FC",
          chipFg: "#2A55B8",
          bar: "#2A55B8",
          playBg: "#352637",
          playFg: "#FFFFFF",
        };
    const ANS: Record<number, string> = S.ans || listeningAnswers;
    const FLAG = S.flag || listeningFlags;
    function setAns(n: number, v: string) {
      const a = Object.assign({}, ANS);
      a[n] = v;
      self.setState({ ans: a });
    }
    function flagStyle(fl: boolean) {
      return {
        flagged: fl,
        flagBg: fl ? (dark ? "#5A2735" : "#FBDCD3") : "transparent",
        flagFg: fl ? (dark ? "#F1F2F4" : "#A12A2A") : t.muted,
        flagBorder: fl ? (dark ? "#D2577A" : "#F1B3A3") : t.line,
        flagFill: fl ? "currentColor" : "none",
      };
    }
    function toggleFlag(n: number) {
      const fl = FLAG.indexOf(n) >= 0;
      return function () {
        self.setState({
          flag: fl
            ? FLAG.filter(function (x) {
                return x !== n;
              })
            : FLAG.concat([n]),
        });
      };
    }
    const formRows = [
      { n: 1, before: "Day:", after: "" },
      { n: 2, before: "Meeting point:", after: "entrance" },
      { n: 3, before: "Cost per person: £", after: "" },
    ].map(function (r) {
      const fl = FLAG.indexOf(r.n) >= 0,
        o = flagStyle(fl);
      return {
        n: r.n,
        before: r.before,
        after: r.after,
        hasAfter: !!r.after,
        aria: "Đáp án câu " + r.n,
        value: ANS[r.n] || "",
        set: function (e: React.ChangeEvent<HTMLInputElement>) {
          setAns(r.n, e && e.target ? e.target.value : "");
        },
        flagAria: fl ? "Bỏ cờ xem lại câu " + r.n : "Gắn cờ xem lại câu " + r.n,
        flagged: o.flagged,
        flagBg: o.flagBg,
        flagFg: o.flagFg,
        flagBorder: o.flagBorder,
        flagFill: o.flagFill,
        toggleFlag: toggleFlag(r.n),
      };
    });
    const questions = listeningQuestions.map(function (q) {
      const fl = FLAG.indexOf(q.n) >= 0,
        o = flagStyle(fl);
      return {
        n: q.n,
        text: q.text,
        name: "q" + q.n,
        flagAria: fl ? "Bỏ cờ xem lại câu " + q.n : "Gắn cờ xem lại câu " + q.n,
        flagged: o.flagged,
        flagBg: o.flagBg,
        flagFg: o.flagFg,
        flagBorder: o.flagBorder,
        flagFill: o.flagFill,
        toggleFlag: toggleFlag(q.n),
        options: q.o.map(function (label) {
          const on = ANS[q.n] === label;
          return {
            label: label,
            checked: on,
            styleClass:
              "flex items-center gap-3 [padding:10px_12px] [border-radius:10px] cursor-pointer box-border",
            style: {
              border: "1.5px solid " + (on ? t.link : t.opt),
              background: on ? t.sel : t.card,
              fontWeight: on ? 600 : 400,
            },
            pick: function () {
              setAns(q.n, label);
            },
          };
        }),
      };
    });
    const visibleNumbers = [...formRows, ...questions].map((row) => row.n);
    const groups = [
      {
        label: "Section 1",
        from: visibleNumbers[0],
        to: visibleNumbers[visibleNumbers.length - 1],
        answered: visibleNumbers.filter((n) => ANS[n]?.trim()),
        flagged: visibleNumbers.filter((n) => FLAG.includes(n)),
      },
    ];
    const tabs: [string, boolean][] = [["Section 1", true]];
    const pos = S.pos != null ? S.pos : 102,
      playing = !!S.playing,
      speed = S.speed || "1";
    function formatAudioTime(s: number) {
      const m = Math.floor(s / 60),
        r = s % 60;
      return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
    }
    const speeds = [
      ["0.75", "0.75×"],
      ["1", "1×"],
      ["1.25", "1.25×"],
      ["1.5", "1.5×"],
    ].map(function (s) {
      const on = speed === s[0];
      return {
        label: s[1],
        on: on,
        bg: on ? t.card : "transparent",
        border: on ? t.line : "transparent",
        pick: function () {
          self.setState({ speed: s[0] });
        },
      };
    });
    return {
      t: t,
      accent: accent,
      fs: fs,
      cheDo: real ? "real" : "practice",
      dark: dark,
      fontPct: fontPct,
      isReal: real,
      isPractice: !real,
      title:
        "Listening · IELTS Recent Actual Tests · Test 1" +
        (real ? "" : " · Section 1"),
      crumb: "Thư viện đề / IELTS Recent Actual Tests / Test 1",
      timeText: P.timeText,
      sectionTag: "Section 1",
      hasFigure: !!P.dangHinh,
      qMax: P.dangHinh ? "640px" : "760px",
      setFont: function (v: number) {
        self.setState({ fontPct: v });
      },
      setDark: function (v: boolean) {
        self.setState({ dark: v });
      },
      playing: playing,
      paused: !playing,
      playAria: playing ? "Tạm dừng" : "Phát",
      togglePlay: function () {
        self.setState({ playing: !playing });
      },
      back5: function () {
        self.setState({ pos: Math.max(0, pos - 5) });
      },
      fwd5: function () {
        self.setState({ pos: Math.min(380, pos + 5) });
      },
      seek: function (e: React.ChangeEvent<HTMLInputElement>) {
        self.setState({ pos: Number(e && e.target ? e.target.value : pos) });
      },
      pos: pos,
      posText: formatAudioTime(pos),
      speeds: speeds,
      vol: S.vol != null ? S.vol : 70,
      setVol: function (e: React.ChangeEvent<HTMLInputElement>) {
        self.setState({ vol: Number(e && e.target ? e.target.value : 70) });
      },
      sectionTabs: tabs.map(function (x) {
        return {
          label: x[0],
          bg: x[1] ? t.ink : t.card,
          fg: x[1] ? (dark ? "#202125" : "#FFFFFF") : t.ink,
          border: x[1] ? t.ink : t.line,
        };
      }),
      formRows: formRows,
      questions: questions,
      groups: groups,
      current:
        S.current && visibleNumbers.includes(S.current)
          ? S.current
          : visibleNumbers[0],
      setCurrent: function (n: number) {
        focusAttemptQuestion(n);
      },
    };
  }

  static defaultProps = {
    cheDo: "real",
    coChu: 90,
    toi: false,
    dangHinh: false,
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
              skill="listening"
              cheDo={v.cheDo}
              title={v.title}
              crumb={v.crumb}
              timeText={v.timeText}
              fontPct={v.fontPct}
              dark={v.dark}
              submitLabel="Nộp bài"
              submitHref="#SubmitDialogs"
              exitHref="#SubmitDialogs"
              accent={v.accent}
              setFont={v.setFont}
              setDark={v.setDark}
            ></TestTopbar>
          </div>
          <section
            aria-label="Trình phát audio"
            className="box-border [padding:16px_32px]"
            style={{
              borderBottom: "1.5px solid " + v.t.line,
              background: v.t.card,
            }}
          >
            <div className="flex flex-wrap items-center [gap:12px_20px]">
              <div className="[flex:0_1_220px] min-w-0">
                <div
                  className="[font-size:12px] font-semibold [letter-spacing:0.08em] uppercase"
                  style={{ color: v.t.muted }}
                >
                  {v.sectionTag}
                </div>
                <div className="[font-size:16px] font-bold">
                  {"Booking a guided tour"}
                </div>
              </div>
              {v.isPractice ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Lùi 5 giây"
                      onClick={v.back5}
                      className="w-11 h-11 [border-radius:50%] cursor-pointer flex items-center justify-center"
                      style={{
                        border: "1.5px solid " + v.t.line,
                        background: v.t.card,
                        color: v.t.ink,
                      }}
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
                        <path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"></path>
                        <path d="M10 10v4h2"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label={v.playAria}
                      onClick={v.togglePlay}
                      className="w-12 h-12 [border-radius:50%] cursor-pointer flex items-center justify-center"
                      style={{
                        border: "1.5px solid " + v.t.playBg,
                        background: v.t.playBg,
                        color: v.t.playFg,
                      }}
                    >
                      {v.playing ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M8 5v14M16 5v14"></path>
                          </svg>
                        </>
                      ) : null}
                      {v.paused ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M8 5l11 7-11 7z"></path>
                          </svg>
                        </>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      aria-label="Tiến 5 giây"
                      onClick={v.fwd5}
                      className="w-11 h-11 [border-radius:50%] cursor-pointer flex items-center justify-center"
                      style={{
                        border: "1.5px solid " + v.t.line,
                        background: v.t.card,
                        color: v.t.ink,
                      }}
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
                        <path d="M20 12a8 8 0 1 1-3-6.2M20 4v4h-4"></path>
                        <path d="M10 10v4h2"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="[flex:1_1_260px] [min-width:200px] flex flex-col [gap:2px]">
                    <input
                      type="range"
                      min="0"
                      max="380"
                      value={v.pos}
                      aria-label="Vị trí audio"
                      onChange={v.seek}
                      className="w-full m-0"
                    />
                    <div
                      className="flex justify-between [font-size:13px] font-sans tabular-nums"
                      style={{ color: v.t.muted }}
                    >
                      <span>{v.posText}</span>
                      <span>{"06:20"}</span>
                    </div>
                  </div>
                  <div
                    role="group"
                    aria-label="Tốc độ phát"
                    className="inline-flex [gap:2px] [padding:3px] [border-radius:10px]"
                    style={{ background: v.t.soft }}
                  >
                    {(v.speeds || []).map((sp, index) => (
                      <React.Fragment key={index}>
                        <button
                          type="button"
                          aria-pressed={sp.on}
                          onClick={sp.pick}
                          className="h-9 [min-width:52px] [padding:0_10px] rounded-lg [font-size:13px] font-semibold cursor-pointer box-border"
                          style={{
                            color: v.t.ink,
                            background: sp.bg,
                            border: "1.5px solid " + sp.border,
                          }}
                        >
                          {sp.label}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : null}
              {v.isReal ? (
                <>
                  <span
                    className="inline-flex items-center gap-2 [height:30px] [padding:0_12px] rounded-full [font-size:13px] font-semibold whitespace-nowrap"
                    style={{ background: v.t.chipBg, color: v.t.chipFg }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 9v6h4l5 4V5L8 9z"></path>
                      <path d="M16 9a4 4 0 0 1 0 6"></path>
                    </svg>
                    {"Audio tự phát, chỉ nghe một lần"}
                  </span>
                  <div className="[flex:1_1_260px] [min-width:200px] flex flex-col gap-1">
                    <div
                      role="progressbar"
                      aria-label="Tiến độ audio"
                      aria-valuemin={0}
                      aria-valuemax={380}
                      aria-valuenow={v.pos}
                      className="h-2 [border-radius:4px] overflow-hidden box-border"
                      style={{
                        background: v.t.soft,
                        border: "1px solid " + v.t.line,
                      }}
                    >
                      <div
                        className="h-full"
                        style={{
                          background: v.t.bar,
                          width: `${(100 * v.pos) / 380}%`,
                        }}
                      ></div>
                    </div>
                    <div
                      className="flex justify-between [font-size:13px] font-sans tabular-nums"
                      style={{ color: v.t.muted }}
                    >
                      <span>{"01:42"}</span>
                      <span>{"06:20"}</span>
                    </div>
                  </div>
                </>
              ) : null}
              <label
                className="flex items-center gap-2 [font-size:13px]"
                style={{ color: v.t.muted }}
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
                  <path d="M4 9v6h4l5 4V5L8 9z"></path>
                  <path d="M16 9a4 4 0 0 1 0 6"></path>
                </svg>
                <span className="absolute [width:1px] [height:1px] overflow-hidden [clip:rect(0_0_0_0)]">
                  {"Âm lượng"}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={v.vol}
                  onChange={v.setVol}
                  className="[width:96px] m-0"
                />
              </label>
            </div>
            {v.isReal ? <></> : null}
          </section>
          <div
            className="attempt-workspace flex items-stretch"
            style={{ background: v.t.page }}
          >
            {v.hasFigure ? (
              <>
                <div
                  className="[flex:1_1_0] min-w-0 box-border [padding:32px_24px] [overflow:auto] flex flex-col gap-3"
                  style={{ borderRight: "1.5px solid " + v.t.line }}
                >
                  <div
                    className="[font-size:13px] font-semibold [letter-spacing:0.08em] uppercase"
                    style={{ color: v.t.muted }}
                  >
                    {"Map of the Old Town"}
                  </div>
                  <div
                    className="p-4 [border-radius:22px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
                    style={{
                      border: "1.5px solid " + v.t.line,
                      background: v.t.card,
                    }}
                  >
                    <svg
                      viewBox="0 0 480 360"
                      width="100%"
                      role="img"
                      aria-label="Sơ đồ khu phố cổ với các vị trí được đánh nhãn A đến E"
                      className="block [max-width:100%] [height:auto]"
                    >
                      <rect
                        x="0"
                        y="0"
                        width="480"
                        height="360"
                        rx="12"
                        fill={v.t.soft}
                      ></rect>
                      <path
                        d="M0 190h480M240 0v360"
                        stroke={v.t.line}
                        strokeWidth="14"
                        fill="none"
                      ></path>
                      <rect
                        x="40"
                        y="40"
                        width="150"
                        height="110"
                        rx="8"
                        fill={v.t.card}
                        stroke={v.t.inputLine}
                        strokeWidth="1.5"
                      ></rect>
                      <rect
                        x="290"
                        y="40"
                        width="150"
                        height="110"
                        rx="8"
                        fill={v.t.card}
                        stroke={v.t.inputLine}
                        strokeWidth="1.5"
                      ></rect>
                      <rect
                        x="40"
                        y="230"
                        width="150"
                        height="100"
                        rx="8"
                        fill={v.t.card}
                        stroke={v.t.inputLine}
                        strokeWidth="1.5"
                      ></rect>
                      <rect
                        x="290"
                        y="230"
                        width="150"
                        height="100"
                        rx="8"
                        fill={v.t.card}
                        stroke={v.t.inputLine}
                        strokeWidth="1.5"
                      ></rect>
                      <circle
                        cx="240"
                        cy="190"
                        r="22"
                        fill={v.t.card}
                        stroke={v.t.inputLine}
                        strokeWidth="1.5"
                      ></circle>
                      <g
                        fontFamily="Inter, sans-serif"
                        fontSize="16"
                        fontWeight="700"
                        fill={v.t.ink}
                        textAnchor="middle"
                      >
                        <text x="115" y="101">
                          {"A"}
                        </text>
                        <text x="365" y="101">
                          {"B"}
                        </text>
                        <text x="115" y="285">
                          {"C"}
                        </text>
                        <text x="365" y="285">
                          {"D"}
                        </text>
                        <text x="240" y="196">
                          {"E"}
                        </text>
                      </g>
                      <text
                        x="240"
                        y="352"
                        fontFamily="Inter, sans-serif"
                        fontSize="12"
                        fill={v.t.muted}
                        textAnchor="middle"
                      >
                        {"Entrance"}
                      </text>
                    </svg>
                  </div>
                </div>
              </>
            ) : null}
            <div className="[flex:1_1_0] min-w-0 box-border overflow-y-auto [padding:32px_24px_40px]">
              <div
                className="[margin:0_auto] flex flex-col gap-4"
                style={{ maxWidth: v.qMax }}
              >
                <div
                  className="[font-size:13px] font-semibold [letter-spacing:0.08em] uppercase"
                  style={{ color: v.t.muted }}
                >
                  {
                    "QUESTIONS 1 TO 3 · COMPLETE THE FORM BELOW. WRITE NO MORE THAN TWO WORDS AND/OR A NUMBER."
                  }
                </div>
                <div
                  className="p-6 [border-radius:22px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] box-border flex flex-col gap-3 w-full"
                  style={{
                    border: "1.5px solid " + v.t.line,
                    background: v.t.card,
                  }}
                >
                  <div>
                    <b>{"Tour name:"}</b>
                    {" Old Town Walk"}
                  </div>
                  {(v.formRows || []).map((r, index) => (
                    <React.Fragment key={index}>
                      <div
                        tabIndex={-1}
                        data-attempt-question={r.n}
                        onFocus={() => this.setState({ current: r.n })}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <b>{r.before}</b>
                        <span className="font-bold">{r.n}</span>
                        <input
                          type="text"
                          aria-label={r.aria}
                          placeholder="nhập đáp án"
                          value={r.value}
                          onChange={r.set}
                          className="[width:150px] h-9 box-border [padding:0_10px] rounded-lg"
                          style={{
                            border: "1.5px solid " + v.t.inputLine,
                            background: v.t.card,
                            color: v.t.ink,
                            fontSize: v.fs + "px",
                          }}
                        />
                        {r.hasAfter ? (
                          <>
                            <span>{r.after}</span>
                          </>
                        ) : null}
                        <ReviewFlag question={r} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <div
                  className="[font-size:13px] font-semibold [letter-spacing:0.08em] uppercase"
                  style={{ color: v.t.muted }}
                >
                  {"Questions 4 to 6 · Choose the correct letter, A, B or C."}
                </div>
                {v.questions.map((q) => (
                  <ChoiceQuestionCard
                    key={q.n}
                    question={q}
                    fontSize={v.fs}
                    className="box-border flex flex-col gap-2.5 rounded-[18px] px-5 py-[18px] w-full"
                    style={{
                      border: "1.5px solid " + v.t.line,
                      background: v.t.card,
                    }}
                    onFocus={() => this.setState({ current: q.n })}
                  />
                ))}
              </div>
            </div>
          </div>
          <TestProgressBar
            groups={v.groups}
            current={v.current}
            dark={v.dark}
            accent={v.accent}
            setCurrent={v.setCurrent}
          ></TestProgressBar>
        </div>
      </>
    );
  }
}
export default ListeningTest;
