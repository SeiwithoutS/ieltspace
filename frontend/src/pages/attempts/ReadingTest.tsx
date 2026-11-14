import {
  highlightColors,
  attemptAppearance,
} from "../../components/attempts/appearance";
import { focusAttemptQuestion } from "../../components/attempts/focus-question";
import {
  readingHighlightText,
  readingHighlights,
  readingAnswers,
  readingFlags,
  readingQuestions,
} from "../../data/attempt-samples";
import type {
  HighlightId,
  HighlightNote,
  ReadingTool,
} from "../../components/attempts/types";
import type {
  ScreenProps,
  AttemptState,
} from "../../components/attempts/types";
import type { QuestionSummary } from "../../components/attempts/AttemptConfirmation";
import { ChoiceQuestionCard } from "../../components/attempts/QuestionControls";
import React from "react";
import TestProgressBar from "../../components/attempts/TestProgressBar";
import TestTopbar from "../../components/attempts/TestTopbar";
interface HighlightView {
  on: boolean;
  off: boolean;
  bg: string;
  dot: string;
  hasNote: boolean;
  popOpen: boolean;
  toggle: () => void;
  openNote: () => void;
  remove: () => void;
  colors: {
    name: string;
    on: boolean;
    fill: string;
    dot: string;
    border: string;
    pick: () => void;
  }[];
}
interface HighlightCard {
  text: string;
  note: string;
  dot: string;
  fill: string;
  active: boolean;
  styleClass: string;
  style: React.CSSProperties;
  pick: () => void;
  setNote: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  remove: () => void;
}
class ReadingTest extends React.Component<ScreenProps, AttemptState> {
  private _drag = false;
  state: AttemptState = this.props.initialState || {};
  publishSnapshot() {
    const values = this.renderVals();
    const rows: QuestionSummary[] = values.questions;
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
    const real = P.cheDo === "real";
    const {fontPct,fs,dark,accent}=attemptAppearance(P,S);
    const tool = S.congCu != null ? S.congCu : P.congCu || "cursor";
    const panelOpen = S.panelOpen != null ? S.panelOpen : !!P.cotHighlight;
    const split = S.split != null ? S.split : 50;
    const asideW = panelOpen ? 340 : 0;
    const empty = !!P.trongHighlight;
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
          divider: "#3A3B40",
          opt: "#46474D",
          note: "#33343A",
          sub: "#B2B3B9",
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
          divider: "#E6E4E0",
          opt: "#E6E4E0",
          note: "#F3F0EA",
          sub: "#4B3D4D",
        };
    function colorOf(id: string) {
      return (
        highlightColors.filter(function (c) {
          return c.id === id;
        })[0] || highlightColors[0]
      );
    }
    const TEXT = readingHighlightText;
    const HL = S.hl || readingHighlights;
    const pop = S.pop !== undefined ? S.pop : P.hienPopover ? "h2" : null;
    const active = S.active || null;
    function setHL(k: HighlightId, patch: Partial<HighlightNote>) {
      const c = { ...HL };
      c[k] = Object.assign({}, HL[k], patch);
      self.setState({ hl: c });
    }
    const vals: Record<string, HighlightView> = {};
    const cards: HighlightCard[] = [];
    let count = 0;
    (["h1", "h2", "h3"] as const).forEach(function (k) {
      const d = HL[k],
        col = colorOf(d.color),
        on = d.on && !empty;
      if (on) {
        count++;
      }
      vals[k] = {
        on: on,
        off: !on,
        bg: dark ? col.dark : col.fill,
        dot: col.dot,
        hasNote: !!d.note,
        popOpen: on && pop === k,
        toggle: function () {
          self.setState({ pop: pop === k ? null : k });
        },
        openNote: function () {
          self.setState({ pop: null, panelOpen: true, active: k });
        },
        remove: function () {
          setHL(k, { on: false });
          self.setState({ pop: null });
        },
        colors: highlightColors.map(function (c) {
          return {
            name: c.name,
            on: c.id === d.color,
            fill: dark ? c.dark : c.fill,
            dot: c.dot,
            border:
              c.id === d.color
                ? "2px solid " + t.link
                : "1.5px solid transparent",
            pick: function () {
              setHL(k, { color: c.id });
            },
          };
        }),
      };
      if (on) {
        cards.push({
          text: TEXT[k],
          note: d.note,
          dot: col.dot,
          fill: dark ? col.dark : col.fill,
          active: active === k,
          styleClass:
            "relative overflow-hidden box-border [padding:14px_14px_8px_20px] [border-radius:14px]",
          style: {
            background: t.card,
            border:
              active === k ? "2px solid " + t.link : "1.5px solid " + t.line,
          },
          pick: function () {
            self.setState({ active: active === k ? null : k });
          },
          setNote: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
            setHL(k, { note: e && e.target ? e.target.value : "" });
          },
          remove: function () {
            setHL(k, { on: false });
          },
        });
      }
    });
    const ANS: Record<number, string> = S.ans || readingAnswers;
    const FLAG = S.flag || readingFlags;
    const questions = readingQuestions.map(function (q) {
      const fl = FLAG.indexOf(q.n) >= 0;
      return {
        n: q.n,
        text: q.text,
        name: "q" + q.n,
        flagged: fl,
        flagAria: fl ? "Bỏ cờ xem lại câu " + q.n : "Gắn cờ xem lại câu " + q.n,
        flagBg: fl ? (dark ? "#5A2735" : "#FBDCD3") : "transparent",
        flagFg: fl ? (dark ? "#F1F2F4" : "#A12A2A") : t.muted,
        flagBorder: fl ? (dark ? "#D2577A" : "#F1B3A3") : t.line,
        flagFill: fl ? "currentColor" : "none",
        toggleFlag: function () {
          self.setState({
            flag: fl
              ? FLAG.filter(function (x) {
                  return x !== q.n;
                })
              : FLAG.concat([q.n]),
          });
        },
        options: q.o.map(function (label, i) {
          const key = "ABC"[i],
            on = ANS[q.n] === key;
          return {
            label: key + ". " + label,
            checked: on,
            styleClass:
              "flex items-center gap-3 [padding:11px_14px] [border-radius:10px] cursor-pointer box-border",
            style: {
              border: "1.5px solid " + (on ? t.link : t.opt),
              background: on ? t.sel : t.card,
              fontWeight: on ? 600 : 400,
            },
            pick: function () {
              const a = Object.assign({}, ANS);
              a[q.n] = key;
              self.setState({ ans: a });
            },
          };
        }),
      };
    });
    const visibleNumbers = questions.map((row) => row.n);
    const groups = [
      {
        label: "Passage 1",
        from: visibleNumbers[0],
        to: visibleNumbers[visibleNumbers.length - 1],
        answered: visibleNumbers.filter((n) => ANS[n]?.trim()),
        flagged: visibleNumbers.filter((n) => FLAG.includes(n)),
      },
    ];
    const tabs: [string, boolean][] = [["Passage 1", true]];
    return {
      t: t,
      accent: accent,
      fs: fs,
      cheDo: real ? "real" : "practice",
      dark: dark,
      tool: tool,
      panelOpen: panelOpen,
      fontPct: fontPct,
      title:
        "Reading · IELTS Recent Actual Tests · Test 1" +
        (real ? "" : " · Passage 1"),
      crumb: "Thư viện đề / IELTS Recent Actual Tests / Test 1",
      timeText: P.timeText,
      hlCount: count,
      setTool: function (v: ReadingTool) {
        self.setState({ congCu: v });
      },
      setPanel: function (v: boolean) {
        self.setState({ panelOpen: v });
      },
      setFont: function (v: number) {
        self.setState({ fontPct: v });
      },
      setDark: function (v: boolean) {
        self.setState({ dark: v });
      },
      closePanel: function () {
        self.setState({ panelOpen: false });
      },
      leftBasis: "calc((100% - " + (asideW + 12) + "px) * " + split / 100 + ")",
      splitNow: Math.round(split),
      dragStart: function (e: React.PointerEvent<HTMLDivElement>) {
        if (e && e.currentTarget && e.currentTarget.setPointerCapture) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (x) {}
        }
        self._drag = true;
        if (e && e.preventDefault) e.preventDefault();
      },
      dragMove: function (e: React.PointerEvent<HTMLDivElement>) {
        if (!self._drag || !e || !e.currentTarget) return;
        const parent = e.currentTarget.parentElement;
        if (!parent) return;
        const box = parent.getBoundingClientRect();
        const k = box.width / (parent.offsetWidth || box.width);
        const usable = box.width - (asideW + 12) * k;
        if (usable <= 0) return;
        const v = ((e.clientX - box.left - 6 * k) / usable) * 100;
        self.setState({ split: Math.max(30, Math.min(70, v)) });
      },
      dragEnd: function () {
        self._drag = false;
      },
      splitKey: function (e: React.KeyboardEvent<HTMLDivElement>) {
        if (!e) return;
        const d = e.key === "ArrowLeft" ? -2 : e.key === "ArrowRight" ? 2 : 0;
        if (e.key === "Home") {
          self.setState({ split: 30 });
          return;
        }
        if (e.key === "End") {
          self.setState({ split: 70 });
          return;
        }
        if (d) {
          if (e.preventDefault) e.preventDefault();
          self.setState({ split: Math.max(30, Math.min(70, split + d)) });
        }
      },
      isHighlightTool: tool === "highlight",
      readCursor: tool === "highlight" ? "crosshair" : "text",
      passageTabs: tabs.map(function (x) {
        return {
          label: x[0],
          bg: x[1] ? t.ink : t.card,
          fg: x[1] ? (dark ? "#202125" : "#FFFFFF") : t.ink,
          border: x[1] ? t.ink : t.line,
        };
      }),
      h1: vals.h1,
      h2: vals.h2,
      h3: vals.h3,
      questions: questions,
      cards: cards,
      showCards: count > 0,
      showEmpty: count === 0,
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
    cheDo: "practice",
    coChu: 100,
    toi: false,
    congCu: "cursor",
    cotHighlight: false,
    trongHighlight: false,
    hienPopover: false,
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
              skill="reading"
              cheDo={v.cheDo}
              title={v.title}
              crumb={v.crumb}
              timeText={v.timeText}
              tool={v.tool}
              panelOpen={v.panelOpen}
              hlCount={v.hlCount}
              fontPct={v.fontPct}
              dark={v.dark}
              submitLabel="Nộp bài"
              submitHref="#SubmitDialogs"
              exitHref="#SubmitDialogs"
              accent={v.accent}
              setTool={v.setTool}
              setPanelOpen={v.setPanel}
              setFont={v.setFont}
              setDark={v.setDark}
            ></TestTopbar>
          </div>
          <div
            className="attempt-workspace flex items-stretch"
            style={{ background: v.t.page }}
          >
            <div
              className="min-w-0 box-border [padding:24px_28px] overflow-y-auto"
              style={{ flex: "0 0 " + v.leftBasis }}
            >
              <div className="[padding:12px_4px]">
                <div
                  className="[font-size:13px] font-semibold [letter-spacing:0.08em] uppercase"
                  style={{ color: v.t.muted }}
                >
                  {"Passage 1"}
                </div>
                <h2 className="[margin:6px_0_16px] [font-size:24px] [line-height:1.3] attempt-sans [letter-spacing:-0.015em]">
                  {"Urban green spaces"}
                </h2>
                <div
                  className="[line-height:1.75] flex flex-col [gap:14px]"
                  style={{
                    fontSize: v.fs + "px",
                    color: v.t.ink,
                    cursor: v.readCursor,
                  }}
                >
                  <div className="m-0 flex [gap:14px] items-start">
                    <span
                      aria-hidden="true"
                      className="[flex:0_0_30px] [width:30px] [height:30px] [border-radius:50%] [font-size:14px] font-bold [line-height:1] flex items-center justify-center [margin-top:-2px]"
                      style={{ background: v.t.soft, color: v.t.ink }}
                    >
                      {"A"}
                    </span>
                    <div className="[flex:1_1_0] min-w-0">
                      {
                        "Urban green spaces provide more than attractive scenery. Studies suggest that spending time in parks can "
                      }
                      <span className="relative">
                        {v.h1.on ? (
                          <>
                            <button
                              type="button"
                              onClick={v.h1.toggle}
                              aria-haspopup="true"
                              aria-expanded={v.h1.popOpen}
                              className="border-0 [padding:0_2px] m-0 [font:inherit] [color:inherit] cursor-pointer [border-radius:3px] [text-align:inherit]"
                              style={{
                                background: v.h1.bg,
                                borderBottom: "2px solid " + v.h1.dot,
                              }}
                            >
                              {"reduce stress and encourage physical activity"}
                              {v.h1.hasNote ? (
                                <>
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-label="Có ghi chú"
                                    role="img"
                                    className="[vertical-align:-1px] [margin-left:3px]"
                                  >
                                    <path d="M4 5h16v11H9l-5 4z"></path>
                                  </svg>
                                </>
                              ) : null}
                            </button>
                            {v.h1.popOpen ? (
                              <>
                                <div
                                  role="dialog"
                                  aria-label="Tùy chọn highlight"
                                  className="absolute [left:0] [top:100%] mt-2 [z-index:20] [width:236px] box-border p-2 [border-radius:14px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_8px_24px_rgba(53,_38,_55,_0.14)] [font-size:14px] [line-height:1.5] font-medium [white-space:normal] [text-align:left] flex flex-col [gap:2px]"
                                  style={{
                                    border: "1.5px solid " + v.t.line,
                                    background: v.t.card,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={v.h1.openNote}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [font:inherit] font-semibold cursor-pointer"
                                    style={{ color: v.t.ink }}
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
                                      <path d="M4 5h16v11H9l-5 4z"></path>
                                    </svg>
                                    {"Ghi chú"}
                                  </button>
                                  <div className="[padding:6px_10px_8px]">
                                    <div className="font-semibold [margin-bottom:6px]">
                                      {"Đổi màu"}
                                    </div>
                                    <div className="flex [gap:6px]">
                                      {(v.h1.colors || []).map((c, index) => (
                                        <React.Fragment key={index}>
                                          <button
                                            type="button"
                                            aria-label={c.name}
                                            aria-pressed={c.on}
                                            onClick={c.pick}
                                            className="w-8 h-8 p-0 [border-radius:50%] [background:transparent] cursor-pointer flex items-center justify-center box-border"
                                            style={{ border: c.border }}
                                          >
                                            <span
                                              className="w-5 h-5 [border-radius:50%] box-border"
                                              style={{
                                                background: c.fill,
                                                border: "2px solid " + c.dot,
                                              }}
                                            ></span>
                                          </button>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={v.h1.remove}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [color:var(--attempt-text-c0412a)] [font:inherit] font-semibold cursor-pointer"
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
                                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>
                                    </svg>
                                    {"Xóa"}
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </>
                        ) : null}
                        {v.h1.off ? (
                          <>{"reduce stress and encourage physical activity"}</>
                        ) : null}
                      </span>
                      {"."}
                    </div>
                  </div>
                  <div className="m-0 flex [gap:14px] items-start">
                    <span
                      aria-hidden="true"
                      className="[flex:0_0_30px] [width:30px] [height:30px] [border-radius:50%] [font-size:14px] font-bold [line-height:1] flex items-center justify-center [margin-top:-2px]"
                      style={{ background: v.t.soft, color: v.t.ink }}
                    >
                      {"B"}
                    </span>
                    <div className="[flex:1_1_0] min-w-0">
                      {
                        "In one city, a former car park was transformed into a community garden in 2019. "
                      }
                      <span className="relative">
                        {v.h2.on ? (
                          <>
                            <button
                              type="button"
                              onClick={v.h2.toggle}
                              aria-haspopup="true"
                              aria-expanded={v.h2.popOpen}
                              className="border-0 [padding:0_2px] m-0 [font:inherit] [color:inherit] cursor-pointer [border-radius:3px] [text-align:inherit]"
                              style={{
                                background: v.h2.bg,
                                borderBottom: "2px solid " + v.h2.dot,
                              }}
                            >
                              {
                                "Local residents now grow vegetables there and take part in weekend workshops."
                              }
                              {v.h2.hasNote ? (
                                <>
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-label="Có ghi chú"
                                    role="img"
                                    className="[vertical-align:-1px] [margin-left:3px]"
                                  >
                                    <path d="M4 5h16v11H9l-5 4z"></path>
                                  </svg>
                                </>
                              ) : null}
                            </button>
                            {v.h2.popOpen ? (
                              <>
                                <div
                                  role="dialog"
                                  aria-label="Tùy chọn highlight"
                                  className="absolute [left:0] [top:100%] mt-2 [z-index:20] [width:236px] box-border p-2 [border-radius:14px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_8px_24px_rgba(53,_38,_55,_0.14)] [font-size:14px] [line-height:1.5] font-medium [white-space:normal] [text-align:left] flex flex-col [gap:2px]"
                                  style={{
                                    border: "1.5px solid " + v.t.line,
                                    background: v.t.card,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={v.h2.openNote}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [font:inherit] font-semibold cursor-pointer"
                                    style={{ color: v.t.ink }}
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
                                      <path d="M4 5h16v11H9l-5 4z"></path>
                                    </svg>
                                    {"Ghi chú"}
                                  </button>
                                  <div className="[padding:6px_10px_8px]">
                                    <div className="font-semibold [margin-bottom:6px]">
                                      {"Đổi màu"}
                                    </div>
                                    <div className="flex [gap:6px]">
                                      {(v.h2.colors || []).map((c, index) => (
                                        <React.Fragment key={index}>
                                          <button
                                            type="button"
                                            aria-label={c.name}
                                            aria-pressed={c.on}
                                            onClick={c.pick}
                                            className="w-8 h-8 p-0 [border-radius:50%] [background:transparent] cursor-pointer flex items-center justify-center box-border"
                                            style={{ border: c.border }}
                                          >
                                            <span
                                              className="w-5 h-5 [border-radius:50%] box-border"
                                              style={{
                                                background: c.fill,
                                                border: "2px solid " + c.dot,
                                              }}
                                            ></span>
                                          </button>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={v.h2.remove}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [color:var(--attempt-text-c0412a)] [font:inherit] font-semibold cursor-pointer"
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
                                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>
                                    </svg>
                                    {"Xóa"}
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </>
                        ) : null}
                        {v.h2.off ? (
                          <>
                            {
                              "Local residents now grow vegetables there and take part in weekend workshops."
                            }
                          </>
                        ) : null}
                      </span>
                      {
                        " The project is managed by volunteers rather than a private company."
                      }
                    </div>
                  </div>
                  <div className="m-0 flex [gap:14px] items-start">
                    <span
                      aria-hidden="true"
                      className="[flex:0_0_30px] [width:30px] [height:30px] [border-radius:50%] [font-size:14px] font-bold [line-height:1] flex items-center justify-center [margin-top:-2px]"
                      style={{ background: v.t.soft, color: v.t.ink }}
                    >
                      {"C"}
                    </span>
                    <div className="[flex:1_1_0] min-w-0">
                      {
                        "Although maintaining these spaces requires funding, supporters argue that "
                      }
                      <span className="relative">
                        {v.h3.on ? (
                          <>
                            <button
                              type="button"
                              onClick={v.h3.toggle}
                              aria-haspopup="true"
                              aria-expanded={v.h3.popOpen}
                              className="border-0 [padding:0_2px] m-0 [font:inherit] [color:inherit] cursor-pointer [border-radius:3px] [text-align:inherit]"
                              style={{
                                background: v.h3.bg,
                                borderBottom: "2px solid " + v.h3.dot,
                              }}
                            >
                              {
                                "the benefits to public health make the investment worthwhile"
                              }
                              {v.h3.hasNote ? (
                                <>
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-label="Có ghi chú"
                                    role="img"
                                    className="[vertical-align:-1px] [margin-left:3px]"
                                  >
                                    <path d="M4 5h16v11H9l-5 4z"></path>
                                  </svg>
                                </>
                              ) : null}
                            </button>
                            {v.h3.popOpen ? (
                              <>
                                <div
                                  role="dialog"
                                  aria-label="Tùy chọn highlight"
                                  className="absolute [left:0] [top:100%] mt-2 [z-index:20] [width:236px] box-border p-2 [border-radius:14px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_8px_24px_rgba(53,_38,_55,_0.14)] [font-size:14px] [line-height:1.5] font-medium [white-space:normal] [text-align:left] flex flex-col [gap:2px]"
                                  style={{
                                    border: "1.5px solid " + v.t.line,
                                    background: v.t.card,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={v.h3.openNote}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [font:inherit] font-semibold cursor-pointer"
                                    style={{ color: v.t.ink }}
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
                                      <path d="M4 5h16v11H9l-5 4z"></path>
                                    </svg>
                                    {"Ghi chú"}
                                  </button>
                                  <div className="[padding:6px_10px_8px]">
                                    <div className="font-semibold [margin-bottom:6px]">
                                      {"Đổi màu"}
                                    </div>
                                    <div className="flex [gap:6px]">
                                      {(v.h3.colors || []).map((c, index) => (
                                        <React.Fragment key={index}>
                                          <button
                                            type="button"
                                            aria-label={c.name}
                                            aria-pressed={c.on}
                                            onClick={c.pick}
                                            className="w-8 h-8 p-0 [border-radius:50%] [background:transparent] cursor-pointer flex items-center justify-center box-border"
                                            style={{ border: c.border }}
                                          >
                                            <span
                                              className="w-5 h-5 [border-radius:50%] box-border"
                                              style={{
                                                background: c.fill,
                                                border: "2px solid " + c.dot,
                                              }}
                                            ></span>
                                          </button>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={v.h3.remove}
                                    className="flex items-center [gap:10px] h-10 [padding:0_10px] border-0 [border-radius:10px] [background:transparent] [color:var(--attempt-text-c0412a)] [font:inherit] font-semibold cursor-pointer"
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
                                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>
                                    </svg>
                                    {"Xóa"}
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </>
                        ) : null}
                        {v.h3.off ? (
                          <>
                            {
                              "the benefits to public health make the investment worthwhile"
                            }
                          </>
                        ) : null}
                      </span>
                      {"."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Kéo để đổi độ rộng bài đọc và câu hỏi"
              aria-valuemin={30}
              aria-valuemax={70}
              aria-valuenow={v.splitNow}
              tabIndex={0}
              onPointerDown={v.dragStart}
              onPointerMove={v.dragMove}
              onPointerUp={v.dragEnd}
              onPointerCancel={v.dragEnd}
              onKeyDown={v.splitKey}
              className="rsz [flex:0_0_12px] w-3 box-border [cursor:col-resize] [touch-action:none] flex items-center justify-center"
              style={{
                background: v.t.bg,
                borderLeft: "1.5px solid " + v.t.line,
                borderRight: "1.5px solid " + v.t.line,
              }}
            >
              <span
                className="rgrip w-1 h-9 [border-radius:2px] [opacity:0.6]"
                style={{ background: v.t.muted }}
              ></span>
            </div>
            <div className="[flex:1_1_0] min-w-0 box-border [padding:24px_28px] flex flex-col [gap:14px] overflow-y-auto">
              <div>
                <div
                  className="inline-flex items-center [height:30px] [padding:0_12px] rounded-full [font-size:13px] font-bold"
                  style={{ background: v.t.sel, color: v.t.link }}
                >
                  {"Questions 1–4"}
                </div>
                <div
                  className="mt-2 [font-size:14px]"
                  style={{ color: v.t.muted }}
                >
                  {"Choose the correct letter, A, B or C."}
                </div>
              </div>
              <div
                className="[padding:4px_24px_8px] [border-radius:22px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
                style={{
                  border: "1.5px solid " + v.t.line,
                  background: v.t.card,
                }}
              >
                {v.questions.map((q) => (
                  <ChoiceQuestionCard
                    key={q.n}
                    question={q}
                    fontSize={v.fs}
                    className="flex flex-col gap-2 py-[18px]"
                    style={{ borderBottom: "1px solid " + v.t.divider }}
                    onFocus={() => this.setState({ current: q.n })}
                  />
                ))}
                <div
                  className="[margin:14px_0_10px] [padding:12px_14px] [border-radius:10px] [font-size:14px]"
                  style={{ background: v.t.note, color: v.t.sub }}
                >
                  {"Câu bỏ trống được tính là chưa đúng."}
                </div>
              </div>
            </div>
            {v.panelOpen ? (
              <>
                <aside
                  aria-label="Cột Highlight"
                  className="[flex:0_0_340px] [width:340px] box-border flex flex-col overflow-y-auto"
                  style={{
                    borderLeft: "1.5px solid " + v.t.line,
                    background: v.t.bg,
                  }}
                >
                  <div className="flex items-center justify-between [padding:16px_20px_12px]">
                    <span
                      className="inline-flex items-center gap-2 h-8 [padding:0_14px] rounded-full [font-size:14px] font-semibold box-border"
                      style={{ border: "1.5px solid " + v.t.ink }}
                    >
                      {"Highlight " + v.hlCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Đóng cột Highlight"
                      onClick={v.closePanel}
                      className="w-11 h-11 [border-radius:50%] border-0 [background:transparent] cursor-pointer flex items-center justify-center"
                      style={{ color: v.t.muted }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6L6 18"></path>
                      </svg>
                    </button>
                  </div>
                  {v.showCards ? (
                    <>
                      <div className="[padding:4px_20px_24px] flex flex-col gap-3">
                        {(v.cards || []).map((c, index) => (
                          <React.Fragment key={index}>
                            <div className={c.styleClass} style={c.style}>
                              <span
                                className="absolute [left:0] [top:0] [bottom:0] [width:5px]"
                                style={{ background: c.dot }}
                              ></span>
                              <button
                                type="button"
                                aria-pressed={c.active}
                                aria-label="Đi tới đoạn đã tô trong bài đọc"
                                onClick={c.pick}
                                className="block w-full [text-align:left] p-0 border-0 [background:transparent] [color:inherit] [font:inherit] cursor-pointer"
                              >
                                <span
                                  className="[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden [font-size:14px] [line-height:1.5] [padding:0_2px] [border-radius:3px]"
                                  style={{ background: c.fill }}
                                >
                                  {c.text}
                                </span>
                                <span
                                  className="block [margin-top:6px] [font-size:12px] font-semibold [letter-spacing:0.08em] uppercase"
                                  style={{ color: v.t.muted }}
                                >
                                  {"Passage 1"}
                                </span>
                              </button>
                              <textarea
                                aria-label="Ghi chú cho đoạn đã tô"
                                placeholder="Thêm ghi chú…"
                                rows={2}
                                value={c.note}
                                onChange={c.setNote}
                                className="block w-full box-border mt-2 [padding:8px_10px] [border-radius:10px] [font-size:13px] [line-height:1.5] [resize:none]"
                                style={{
                                  border: "1.5px solid " + v.t.line,
                                  background: v.t.soft,
                                  color: v.t.ink,
                                }}
                              ></textarea>
                              <div className="flex justify-end [margin-top:6px]">
                                <button
                                  type="button"
                                  onClick={c.remove}
                                  className="inline-flex items-center [gap:6px] h-9 [padding:0_10px] [border-radius:10px] border-0 [background:transparent] [color:var(--attempt-text-c0412a)] [font-size:13px] font-semibold cursor-pointer"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path>
                                  </svg>
                                  {"Xóa"}
                                </button>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {v.showEmpty ? (
                    <>
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 [padding:24px_24px_40px] text-center">
                        <span
                          className="[width:56px] [height:56px] [border-radius:16px] flex items-center justify-center"
                          style={{
                            border: "1.5px solid " + v.t.line,
                            background: v.t.sel,
                            color: v.t.link,
                          }}
                        >
                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M15 5l4 4L9 19H5v-4z"></path>
                            <path d="M4 21h8"></path>
                          </svg>
                        </span>
                        <div className="[font-size:18px] font-semibold">
                          {"Chưa có highlight"}
                        </div>
                        <div
                          className="[font-size:14px]"
                          style={{ color: v.t.muted }}
                        >
                          {
                            "Các đoạn bạn tô sẽ hiện ở đây để xem lại, thêm ghi chú hoặc xóa."
                          }
                        </div>
                        <div
                          className="w-full box-border mt-1 p-4 [border-radius:14px] [text-align:left] flex flex-col gap-3 [font-size:14px]"
                          style={{
                            border: "1.5px solid " + v.t.line,
                            background: v.t.card,
                          }}
                        >
                          <div className="flex gap-3 items-start">
                            <span
                              className="[flex:0_0_24px] w-6 h-6 [border-radius:50%] [font-size:12px] font-bold flex items-center justify-center"
                              style={{ background: v.t.soft }}
                            >
                              {"1"}
                            </span>
                            <span>
                              {"Quét đoạn muốn đánh dấu trong bài đọc."}
                            </span>
                          </div>
                          <div className="flex gap-3 items-start">
                            <span
                              className="[flex:0_0_24px] w-6 h-6 [border-radius:50%] [font-size:12px] font-bold flex items-center justify-center"
                              style={{ background: v.t.soft }}
                            >
                              {"2"}
                            </span>
                            <span>
                              {"Chọn "}
                              <b>{"Highlight"}</b>
                              {" trên thanh vừa hiện ra."}
                            </span>
                          </div>
                        </div>
                        <div
                          className="[font-size:13px] [margin-top:6px]"
                          style={{ color: v.t.muted }}
                        >
                          {"Muốn tô liên tục? Bật công cụ "}
                          <b>{"Highlight"}</b>
                          {" trên thanh trên trước khi quét."}
                        </div>
                      </div>
                    </>
                  ) : null}
                </aside>
              </>
            ) : null}
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
export default ReadingTest;
