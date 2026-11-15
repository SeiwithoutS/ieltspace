import { accentForeground } from "./appearance";
import React from "react";
import type { ProgressGroup } from "./types";
interface ProgressProps {
  groups?: ProgressGroup[];
  current?: number;
  dark?: boolean;
  accent?: string;
  setCurrent?: (n: number) => void;
}
interface ProgressCell {
  n: number;
  flagged: boolean;
  isCurrent: boolean;
  style: React.CSSProperties;
  aria: string;
  pick: () => void;
}
class TestProgressBar extends React.Component<
  ProgressProps,
  { current?: number }
> {
  renderVals() {
    const P = this.props,
      S = this.state || {},
      self = this;
    const groups =
      P.groups && P.groups.length
        ? P.groups
        : [
            {
              label: "Passage 1",
              from: 1,
              to: 13,
              answered: [1, 2, 3, 4],
              flagged: [3],
            },
            { label: "Passage 2", from: 14, to: 26, answered: [], flagged: [] },
            { label: "Passage 3", from: 27, to: 40, answered: [], flagged: [] },
          ];
    const hasHandler = typeof P.setCurrent === "function";
    const current = hasHandler
      ? P.current == null
        ? 7
        : P.current
      : S.current == null
        ? P.current == null
          ? 7
          : P.current
        : S.current;
    function go(n: number) {
      if (hasHandler) {
        P.setCurrent?.(n);
      } else {
        self.setState({ current: n });
      }
    }
    const dark = !!P.dark;
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
          chipOn: "#F1F2F4",
          chipOnFg: "#202125",
        }
      : {
          bg: "#FCFBF7",
          card: "#FFFFFF",
          line: "#D6D4D0",
          ink: "#352637",
          muted: "#706473",
          soft: "#F3F0EA",
          chipOn: "#352637",
          chipOnFg: "#FFFFFF",
        };
    let idx = 0;
    groups.forEach(function (g, i) {
      if (current >= g.from && current <= g.to) {
        idx = i;
      }
    });
    const g0 = groups[idx];
    const cells: ProgressCell[] = [];
    for (let q = g0.from; q <= g0.to; q++) {
      const isAns = (g0.answered || []).indexOf(q) >= 0,
        isFlag = (g0.flagged || []).indexOf(q) >= 0,
        isCur = q === current;
      cells.push({
        n: q,
        flagged: isFlag,
        isCurrent: isCur,
        style: {
          background: isAns ? accent : t.card,
          color: isAns ? onAccent : t.ink,
          border:
            (isCur ? "2px" : "1.5px") +
            " solid " +
            (isCur ? t.ink : isAns ? accent : t.line),
          boxShadow: isCur ? "inset 0 0 0 2px " + t.card : undefined,
        },
        aria:
          "Câu " +
          q +
          (isCur ? ", đang xem" : "") +
          (isAns ? ", đã làm" : ", chưa làm") +
          (isFlag ? ", đã gắn cờ xem lại" : ""),
        pick: function () {
          go(q);
        },
      });
    }
    function short(l: string) {
      const m = String(l).match(/^(\S)\S*\s+(\d+)/);
      return m ? m[1] + m[2] : l;
    }
    const blocks = groups.map(function (g, i) {
      const open = i === idx,
        c = (g.answered || []).length + "/" + (g.to - g.from + 1);
      return {
        open: open,
        closed: !open,
        label: g.label,
        short: short(g.label),
        count: c,
        cells: open ? cells : [],
        aria: open
          ? g.label + ", đã làm " + c
          : g.label + ", đã làm " + c + ", chuyển tới câu " + g.from,
        pick: function () {
          go(g.from);
        },
      };
    });
    const nx = groups[idx + 1];
    return {
      t: t,
      accent: accent,
      onAccent: onAccent,
      blocks: blocks,
      hasNext: !!nx,
      nextLabel: nx ? "Câu " + nx.from + "–" + nx.to : "",
      goNext: function () {
        if (nx) {
          go(nx.from);
        }
      },
    };
  }

  static defaultProps = {
    groups: [
      {
        label: "Passage 1",
        from: 1,
        to: 13,
        answered: [1, 2, 3, 4],
        flagged: [3],
      },
      { label: "Passage 2", from: 14, to: 26, answered: [], flagged: [] },
      { label: "Passage 3", from: 27, to: 40, answered: [], flagged: [] },
    ],
    current: 7,
    dark: false,
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
          <nav
            aria-label="Tiến độ làm bài"
            className="box-border [min-height:80px] [padding:10px_24px] flex flex-wrap items-center [gap:10px_20px]"
            style={{ borderTop: "1.5px solid " + v.t.line, background: v.t.bg }}
          >
            <div className="[flex:1_1_520px] min-w-0 flex justify-center">
              <div
                className="inline-flex flex-wrap items-center gap-2 [padding:6px_10px] [border-radius:14px] [max-width:100%] box-border"
                style={{
                  border: "1.5px solid " + v.t.line,
                  background: v.t.card,
                }}
              >
                {(v.blocks || []).map((b, index) => (
                  <React.Fragment key={index}>
                    {b.open ? (
                      <>
                        <div className="inline-flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center [height:34px] [padding:0_12px] [border-radius:10px] [font-size:13px] font-bold whitespace-nowrap"
                            style={{
                              background: v.t.chipOn,
                              color: v.t.chipOnFg,
                            }}
                            aria-label={b.aria}
                          >
                            {b.label}
                            <span
                              className="[margin-left:8px] [padding-left:8px] font-sans tabular-nums font-semibold"
                              style={{ borderLeft: "1.5px solid " + v.t.muted }}
                            >
                              {b.count}
                            </span>
                          </span>
                          {(b.cells || []).map((c, index) => (
                            <React.Fragment key={index}>
                              <button
                                type="button"
                                aria-label={c.aria}
                                aria-current={c.isCurrent}
                                onClick={c.pick}
                                className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg p-0 text-[13px] font-semibold cursor-pointer box-border"
                                style={c.style}
                              >
                                {c.n}
                                {c.flagged ? (
                                  <>
                                    <span
                                      className="absolute [top:-6px] [right:-5px] flex [color:var(--attempt-text-c0412a)] [border-radius:50%] [padding:1px]"
                                      style={{ background: v.t.card }}
                                    >
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M5 21V4M5 4h11l-2 4 2 4H5"></path>
                                      </svg>
                                    </span>
                                  </>
                                ) : null}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </>
                    ) : null}
                    {b.closed ? (
                      <>
                        <button
                          type="button"
                          aria-label={b.aria}
                          onClick={b.pick}
                          className="inline-flex items-center [gap:6px] [height:34px] [padding:0_12px] [border-radius:10px] [border:1.5px_solid_transparent] [font-size:13px] font-semibold cursor-pointer whitespace-nowrap box-border"
                          style={{ background: v.t.soft, color: v.t.muted }}
                        >
                          {b.short}
                          <span className="font-sans tabular-nums">
                            {b.count}
                          </span>
                        </button>
                      </>
                    ) : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex-none ml-auto">
              {v.hasNext ? (
                <>
                  <button
                    type="button"
                    onClick={v.goNext}
                    className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [font-size:14px] font-semibold cursor-pointer whitespace-nowrap box-border"
                    style={{
                      border: "1.5px solid " + v.accent,
                      background: v.accent,
                      color: v.onAccent,
                    }}
                  >
                    {v.nextLabel}
                    <svg
                      width="18"
                      height="18"
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
                  </button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      </>
    );
  }
}
export default TestProgressBar;
