import PageLink from "../navigation/PageLink";
import { accentForeground, highlightColors } from "./appearance";
import React from "react";
import type { ReadingTool } from "./types";
interface TopbarState {
  tool?: ReadingTool;
  panelOpen?: boolean;
  fontPct?: number;
  dark?: boolean;
  menuOpen?: boolean;
  colorOpen?: boolean;
  colorId?: string;
}
interface TopbarProps extends TopbarState {
  skill?: string;
  cheDo?: string;
  accent?: string;
  crumb?: string;
  title?: string;
  timeText?: string;
  timeWarn?: boolean;
  hlCount?: number;
  submitLabel?: string;
  submitHref?: string;
  exitHref?: string;
  onExit?: () => void;
  onSubmit?: () => void;
  setTool?: (v: ReadingTool) => void;
  setPanelOpen?: (v: boolean) => void;
  setFont?: (v: number) => void;
  setDark?: (v: boolean) => void;
}
class TestTopbar extends React.Component<TopbarProps, TopbarState> {
  renderVals() {
    const P = this.props,
      S = this.state || {},
      self = this;
    const skill = P.skill || "reading",
      real = (P.cheDo || "practice") === "real";
    const tool = P.setTool
      ? (P.tool ?? "cursor")
      : (S.tool ?? P.tool ?? "cursor");
    const panelOpen = P.setPanelOpen
      ? !!P.panelOpen
      : (S.panelOpen ?? P.panelOpen ?? false);
    const fontPct = P.setFont
      ? (P.fontPct ?? 100)
      : (S.fontPct ?? P.fontPct ?? 100);
    const dark = P.setDark ? !!P.dark : (S.dark ?? P.dark ?? false);
    const menuOpen = S.menuOpen == null ? !!P.menuOpen : S.menuOpen;
    const colorOpen = !!S.colorOpen;
    const colorId = S.colorId || "vang";
    const cur =
      highlightColors.filter(function (c) {
        return c.id === colorId;
      })[0] || highlightColors[0];
    const accent = P.accent || "#2963CC";

    const onAccent = accentForeground(accent);
    const t = dark
      ? {
          bg: "#202125",
          card: "#292A2E",
          line: "#46474D",
          ink: "#F1F2F4",
          muted: "#B2B3B9",
          soft: "#292A2E",
          link: "#8DB0F7",
          sel: "#24395E",
        }
      : {
          bg: "#FCFBF7",
          card: "#FFFFFF",
          line: "#D6D4D0",
          ink: "#352637",
          muted: "#706473",
          soft: "#F3F0EA",
          link: "#2963CC",
          sel: "#E3ECFD",
        };
    const mode = real
      ? {
          bg: dark ? "#F1F2F4" : "#352637",
          fg: dark ? "#202125" : "#FFFFFF",
          label: "Real Test",
        }
      : {
          bg: dark ? "#24395E" : "#E3ECFD",
          fg: dark ? "#8DB0F7" : "#2963CC",
          label: "Practice",
        };
    const warn = real && !!P.timeWarn;
    const timeShown = P.timeText || (real ? "38:05" : "12:40");
    const timeBg = warn ? "#FDE7E7" : t.card,
      timeFg = warn ? "#A12A2A" : t.ink,
      timeBorder = warn ? "#F1B3A3" : t.line;
    const isHL = tool === "highlight";
    const hlCount = P.hlCount == null ? 3 : P.hlCount;
    const steps = fontPct;
    return {
      accent: accent,
      onAccent: onAccent,
      t: t,
      crumb: P.crumb || "Thư viện đề / IELTS Recent Actual Tests / Test 1",
      title: P.title || "Reading · IELTS Recent Actual Tests · Test 1",
      modeLabel: mode.label,
      modeBg: mode.bg,
      modeFg: mode.fg,
      isReal: real,
      isPractice: !real,
      timeShown: timeShown,
      timeBg: timeBg,
      timeFg: timeFg,
      timeBorder: timeBorder,
      timeAria: real
        ? "Thời gian còn lại " + timeShown
        : "Thời gian đã làm " + timeShown,
      isReading: skill === "reading",
      showAa: skill !== "speaking",
      isCursor: !isHL,
      isHighlight: isHL,
      cursorBg: !isHL ? t.sel : "transparent",
      cursorFg: !isHL ? t.link : t.ink,
      cursorBorder: !isHL ? t.link : "transparent",
      hlBg: isHL ? t.sel : "transparent",
      hlFg: isHL ? t.link : t.ink,
      hlBorder: isHL ? t.link : "transparent",
      pickCursor: function () {
        P.setTool ? P.setTool("cursor") : self.setState({ tool: "cursor" });
      },
      pickHighlight: function () {
        P.setTool
          ? P.setTool("highlight")
          : self.setState({ tool: "highlight" });
      },
      colorOpen: colorOpen,
      colorName: cur.name.toLowerCase(),
      colorNow: { fill: dark ? cur.dark : cur.fill, dot: cur.dot },
      toggleColor: function () {
        self.setState({ colorOpen: !colorOpen, menuOpen: false });
      },
      colors: highlightColors.map(function (c) {
        return {
          name: c.name,
          on: c.id === colorId,
          fill: dark ? c.dark : c.fill,
          dot: c.dot,
          border:
            c.id === colorId
              ? "2px solid " + t.link
              : "1.5px solid transparent",
          pick: function () {
            self.setState({ colorId: c.id, colorOpen: false });
            P.setTool
              ? P.setTool("highlight")
              : self.setState({ tool: "highlight" });
          },
        };
      }),
      panelOpen: panelOpen,
      hlCount: hlCount,
      panelBg: panelOpen ? t.sel : t.card,
      panelFg: panelOpen ? t.link : t.ink,
      panelBorder: panelOpen ? t.link : t.line,
      countBg: panelOpen ? t.link : t.soft,
      countFg: panelOpen ? (dark ? "#202125" : "#FFFFFF") : t.ink,
      togglePanel: function () {
        P.setPanelOpen
          ? P.setPanelOpen(!panelOpen)
          : self.setState({ panelOpen: !panelOpen });
      },
      menuOpen: menuOpen,
      aaBg: menuOpen ? t.soft : t.card,
      aaBorder: menuOpen ? t.link : t.line,
      toggleMenu: function () {
        self.setState({ menuOpen: !menuOpen, colorOpen: false });
      },
      closeAll: function () {
        self.setState({ menuOpen: false, colorOpen: false });
      },
      minOp: steps <= 90 ? 0.4 : 1,
      maxOp: steps >= 150 ? 0.4 : 1,
      minCur: steps <= 90 ? "not-allowed" : "pointer",
      maxCur: steps >= 150 ? "not-allowed" : "pointer",
      fontPctShown: steps,
      minDisabled: steps <= 90,
      maxDisabled: steps >= 150,
      fontDown: function () {
        P.setFont
          ? P.setFont(Math.max(90, steps - 10))
          : self.setState({ fontPct: Math.max(90, steps - 10) });
      },
      fontUp: function () {
        P.setFont
          ? P.setFont(Math.min(150, steps + 10))
          : self.setState({ fontPct: Math.min(150, steps + 10) });
      },
      isLight: !dark,
      isDark: dark,
      lightBg: !dark ? t.card : "transparent",
      lightBorder: !dark ? t.line : "transparent",
      darkBg: dark ? t.card : "transparent",
      darkBorder: dark ? t.line : "transparent",
      pickLight: function () {
        P.setDark ? P.setDark(false) : self.setState({ dark: false });
      },
      pickDark: function () {
        P.setDark ? P.setDark(true) : self.setState({ dark: true });
      },
      submitLabel: P.submitLabel || "Nộp bài",
      submitHref: P.submitHref || "#SubmitDialogs",
      exitHref: P.exitHref || "#SubmitDialogs",
    };
  }

  static defaultProps = {
    skill: "reading",
    cheDo: "practice",
    title: "Reading · IELTS Recent Actual Tests · Test 1",
    crumb: "Thư viện đề / IELTS Recent Actual Tests / Test 1",
    timeText: "",
    timeWarn: false,
    tool: "cursor",
    panelOpen: false,
    hlCount: 3,
    fontPct: 100,
    dark: false,
    menuOpen: false,
    submitLabel: "Nộp bài",
    submitHref: "#SubmitDialogs",
    exitHref: "#SubmitDialogs",
    accent: "#2963CC",
  };
  render() {
    const v = this.renderVals();
    return (
      <>
        <div
          className="attempt-sans [font-size:14px] [line-height:1.5] w-full"
          style={{ color: v.t.ink, background: v.t.bg }}
        >
          <header
            className="relative [z-index:30] box-border [min-height:68px] [padding:8px_24px] flex flex-wrap items-center [gap:10px_16px]"
            style={{
              borderBottom: "1.5px solid " + v.t.line,
              background: v.t.bg,
            }}
          >
            <div className="[flex:1_1_280px] flex items-center [gap:14px] min-w-0">
              <PageLink
                page="StudentLanding"
                aria-label="IELTSpace, về trang chủ"
                className="flex items-center no-underline"
              >
                <span
                  className="w-8 h-8 [border-radius:10px] box-border flex items-center justify-center [font-weight:800] [font-size:13px]"
                  style={{
                    border: "1.5px solid " + v.t.line,
                    background: v.accent,
                    color: v.onAccent,
                  }}
                >
                  {"IS"}
                </span>
              </PageLink>
              <div
                className="[padding-left:14px] min-w-0 [flex:0_1_auto]"
                style={{ borderLeft: "1.5px solid " + v.t.line }}
              >
                <div
                  className="[font-size:13px] whitespace-nowrap overflow-hidden [text-overflow:ellipsis]"
                  style={{ color: v.t.muted }}
                >
                  {v.crumb}
                </div>
                <div className="font-semibold whitespace-nowrap overflow-hidden [text-overflow:ellipsis]">
                  {v.title}
                </div>
              </div>
              <span
                className="inline-flex items-center [height:26px] [padding:0_10px] rounded-full [font-size:13px] font-semibold whitespace-nowrap"
                style={{ background: v.modeBg, color: v.modeFg }}
              >
                {v.modeLabel}
              </span>
            </div>
            <div className="ml-auto flex flex-wrap items-center [gap:10px]">
              <span
                role="timer"
                aria-label={v.timeAria}
                className="inline-flex items-center [gap:6px] [height:30px] [padding:0_12px] rounded-full [font-size:13px] font-semibold whitespace-nowrap box-border"
                style={{
                  background: v.timeBg,
                  color: v.timeFg,
                  border: "1.5px solid " + v.timeBorder,
                }}
              >
                {v.isReal ? (
                  <>
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
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="M12 7v5l3 2"></path>
                    </svg>
                  </>
                ) : null}
                {v.isPractice ? (
                  <>
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
                      <circle cx="12" cy="13" r="8"></circle>
                      <path d="M12 9v4l2.5 1.5M9.5 2.5h5M12 2.5V5"></path>
                    </svg>
                  </>
                ) : null}
                <span className="font-sans tabular-nums">{v.timeShown}</span>
                {v.isPractice ? (
                  <>
                    <span className="font-medium">{"đã làm"}</span>
                  </>
                ) : null}
              </span>
              {v.isReading ? (
                <>
                  <div className="relative flex items-center [gap:6px]">
                    <div
                      role="group"
                      aria-label="Công cụ trong bài đọc"
                      className="inline-flex items-center [gap:2px] [padding:3px] [border-radius:10px] box-border"
                      style={{
                        border: "1.5px solid " + v.t.line,
                        background: v.t.card,
                      }}
                    >
                      <button
                        type="button"
                        data-tip="Con trỏ"
                        aria-label="Con trỏ"
                        aria-pressed={v.isCursor}
                        onClick={v.pickCursor}
                        className="toolbar-tooltip inline-flex items-center justify-center [width:38px] [height:34px] p-0 rounded-lg [font-size:13px] font-semibold cursor-pointer whitespace-nowrap box-border"
                        style={{
                          border: "1.5px solid " + v.cursorBorder,
                          background: v.cursorBg,
                          color: v.cursorFg,
                        }}
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
                          <path d="M5 3l14 7-6 2-2 6z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        data-tip="Highlight"
                        aria-label="Highlight"
                        aria-pressed={v.isHighlight}
                        onClick={v.pickHighlight}
                        className="toolbar-tooltip inline-flex items-center justify-center [width:38px] [height:34px] p-0 rounded-lg [font-size:13px] font-semibold cursor-pointer whitespace-nowrap box-border"
                        style={{
                          border: "1.5px solid " + v.hlBorder,
                          background: v.hlBg,
                          color: v.hlFg,
                        }}
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
                          <path d="M15 5l4 4L9 19H5v-4z"></path>
                          <path d="M4 21h8"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        data-tip="Màu highlight"
                        aria-label={
                          "Chọn màu highlight, hiện tại " + v.colorName
                        }
                        aria-haspopup="true"
                        aria-expanded={v.colorOpen}
                        onClick={v.toggleColor}
                        className="toolbar-tooltip inline-flex items-center justify-center gap-1 w-11 [height:34px] p-0 rounded-lg [border:1.5px_solid_transparent] [background:transparent] cursor-pointer box-border"
                        style={{ color: v.t.muted }}
                      >
                        <span
                          className="w-4 h-4 [border-radius:50%] box-border"
                          style={{
                            background: v.colorNow.fill,
                            border: "2px solid " + v.colorNow.dot,
                          }}
                        ></span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </button>
                    </div>
                    {v.colorOpen ? (
                      <>
                        <button
                          type="button"
                          aria-label="Đóng bảng màu"
                          tabIndex={-1}
                          onClick={v.closeAll}
                          className="[position:fixed] [inset:0] [z-index:40] [background:transparent] border-0 p-0 [cursor:default]"
                        ></button>
                        <div
                          role="group"
                          aria-label="Màu highlight"
                          className="absolute [left:0] [top:48px] [z-index:50] [padding:10px] [border-radius:14px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_8px_24px_rgba(53,_38,_55,_0.12)] flex gap-2"
                          style={{
                            border: "1.5px solid " + v.t.line,
                            background: v.t.card,
                          }}
                        >
                          {(v.colors || []).map((c, index) => (
                            <React.Fragment key={index}>
                              <button
                                type="button"
                                aria-label={c.name}
                                aria-pressed={c.on}
                                onClick={c.pick}
                                className="w-11 h-11 p-0 [border-radius:10px] [background:transparent] cursor-pointer flex items-center justify-center box-border"
                                style={{ border: c.border }}
                              >
                                <span
                                  className="[width:22px] [height:22px] [border-radius:50%] box-border"
                                  style={{
                                    background: c.fill,
                                    border: "2.5px solid " + c.dot,
                                  }}
                                ></span>
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    data-tip="Cột Highlight"
                    aria-pressed={v.panelOpen}
                    aria-label="Cột Highlight"
                    onClick={v.togglePanel}
                    className="toolbar-tooltip inline-flex items-center gap-2 h-10 [padding:0_12px] [border-radius:10px] [font-size:13px] font-semibold cursor-pointer whitespace-nowrap box-border"
                    style={{
                      border: "1.5px solid " + v.panelBorder,
                      background: v.panelBg,
                      color: v.panelFg,
                    }}
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
                      <rect x="3" y="4" width="18" height="16" rx="3"></rect>
                      <path d="M15 4v16"></path>
                    </svg>
                    <span
                      className="[min-width:20px] h-5 [padding:0_6px] box-border [border-radius:10px] [font-size:12px] font-bold inline-flex items-center justify-center"
                      style={{ background: v.countBg, color: v.countFg }}
                    >
                      {v.hlCount}
                    </span>
                  </button>
                </>
              ) : null}
              {v.showAa ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      data-tip="Cỡ chữ và giao diện"
                      aria-label="Cỡ chữ và giao diện"
                      aria-haspopup="true"
                      aria-expanded={v.menuOpen}
                      onClick={v.toggleMenu}
                      className="toolbar-tooltip inline-flex items-center justify-center w-11 h-10 p-0 [border-radius:10px] [font-size:16px] font-bold cursor-pointer box-border"
                      style={{
                        border: "1.5px solid " + v.aaBorder,
                        background: v.aaBg,
                        color: v.t.ink,
                      }}
                    >
                      {"Aa"}
                    </button>
                    {v.menuOpen ? (
                      <>
                        <button
                          type="button"
                          aria-label="Đóng menu Aa"
                          tabIndex={-1}
                          onClick={v.closeAll}
                          className="[position:fixed] [inset:0] [z-index:40] [background:transparent] border-0 p-0 [cursor:default]"
                        ></button>
                        <div
                          role="dialog"
                          aria-label="Cỡ chữ và giao diện"
                          className="absolute [right:0] [top:48px] [z-index:50] [width:288px] box-border p-4 [border-radius:18px] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_8px_24px_rgba(53,_38,_55,_0.12)] flex flex-col gap-4"
                          style={{
                            border: "1.5px solid " + v.t.line,
                            background: v.t.card,
                          }}
                        >
                          <div>
                            <div
                              className="[font-size:12px] font-semibold [letter-spacing:0.08em] uppercase mb-2"
                              style={{ color: v.t.muted }}
                            >
                              {"Cỡ chữ"}
                            </div>
                            <div className="flex items-center [gap:10px]">
                              <button
                                type="button"
                                aria-label="Giảm cỡ chữ"
                                disabled={v.minDisabled}
                                onClick={v.fontDown}
                                className="w-11 h-11 [border-radius:10px] flex items-center justify-center"
                                style={{
                                  border: "1.5px solid " + v.t.line,
                                  background: v.t.card,
                                  color: v.t.ink,
                                  cursor: v.minCur,
                                  opacity: v.minOp,
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  aria-hidden="true"
                                >
                                  <path d="M5 12h14"></path>
                                </svg>
                              </button>
                              <div
                                aria-live="polite"
                                className="flex-1 text-center [font-size:18px] font-bold font-sans tabular-nums"
                              >
                                {v.fontPctShown + "%"}
                              </div>
                              <button
                                type="button"
                                aria-label="Tăng cỡ chữ"
                                disabled={v.maxDisabled}
                                onClick={v.fontUp}
                                className="w-11 h-11 [border-radius:10px] flex items-center justify-center"
                                style={{
                                  border: "1.5px solid " + v.t.line,
                                  background: v.t.card,
                                  color: v.t.ink,
                                  cursor: v.maxCur,
                                  opacity: v.maxOp,
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  aria-hidden="true"
                                >
                                  <path d="M5 12h14M12 5v14"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <div
                              className="[font-size:12px] font-semibold [letter-spacing:0.08em] uppercase mb-2"
                              style={{ color: v.t.muted }}
                            >
                              {"Giao diện vùng làm bài"}
                            </div>
                            <div
                              role="group"
                              aria-label="Sáng hoặc tối"
                              className="flex [gap:2px] [padding:3px] [border-radius:10px]"
                              style={{ background: v.t.soft }}
                            >
                              <button
                                type="button"
                                aria-pressed={v.isLight}
                                onClick={v.pickLight}
                                className="flex-1 [height:38px] rounded-lg [font-size:14px] font-semibold cursor-pointer inline-flex items-center justify-center [gap:6px] box-border"
                                style={{
                                  border: "1.5px solid " + v.lightBorder,
                                  background: v.lightBg,
                                  color: v.t.ink,
                                }}
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
                                  <circle cx="12" cy="12" r="4"></circle>
                                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>
                                </svg>
                                {"Sáng"}
                              </button>
                              <button
                                type="button"
                                aria-pressed={v.isDark}
                                onClick={v.pickDark}
                                className="flex-1 [height:38px] rounded-lg [font-size:14px] font-semibold cursor-pointer inline-flex items-center justify-center [gap:6px] box-border"
                                style={{
                                  border: "1.5px solid " + v.darkBorder,
                                  background: v.darkBg,
                                  color: v.t.ink,
                                }}
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
                                  <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>
                                </svg>
                                {"Tối"}
                              </button>
                            </div>
                            <div
                              className="[font-size:13px] mt-2"
                              style={{ color: v.t.muted }}
                            >
                              {"Chỉ đổi vùng làm bài, không đổi cài đặt chung."}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}
              <button
                type="button"
                onClick={this.props.onExit}
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full box-border font-semibold [font-size:14px] no-underline whitespace-nowrap"
                style={{
                  border: "1.5px solid " + v.t.line,
                  background: v.t.card,
                  color: v.t.ink,
                }}
              >
                {"Lưu và thoát"}
              </button>
              <button
                type="button"
                onClick={this.props.onSubmit}
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_22px] rounded-full box-border font-semibold [font-size:14px] no-underline whitespace-nowrap"
                style={{
                  border: "1.5px solid " + v.accent,
                  background: v.accent,
                  color: v.onAccent,
                }}
              >
                {v.submitLabel}
              </button>
            </div>
          </header>
        </div>
      </>
    );
  }
}
export default TestTopbar;
