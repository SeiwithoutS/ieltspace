import React from "react";
import { styleOf, cssText } from "../../../lib/shared/styles";
import StaffLayout from "../../../components/layout/StaffLayout";

interface DashboardState {
  period: "7" | "30" | "custom";
  open: boolean;
  calendarYear: number;
  calendarMonth: number;
  draftFrom: number | null;
  draftTo: number | null;
  appliedFrom: number;
  appliedTo: number;
}

type CalendarClick = React.MouseEvent<HTMLElement>;

class AdminHome extends React.Component<Record<never, never>, DashboardState> {
  state: DashboardState = {
    period: "30",
    open: false,
    calendarYear: 2026,
    calendarMonth: 9,
    draftFrom: null,
    draftTo: null,
    appliedFrom: Date.UTC(2026, 9, 23),
    appliedTo: Date.UTC(2026, 9, 23),
  };

  renderVals() {
    const s = this.state;
    const self = this;
    const TODAY = Date.UTC(2026, 9, 23),
      DAY = 86400000;
    const { period, calendarYear, calendarMonth, draftFrom, draftTo, appliedFrom, appliedTo } = s;
    function padDay(value: number) {
      return (value < 10 ? "0" : "") + value;
    }
    function formatDate(t: number, y = true) {
      const d = new Date(t);
      return (
        padDay(d.getUTCDate()) +
        "/" +
        padDay(d.getUTCMonth() + 1) +
        (y === false ? "" : "/" + d.getUTCFullYear())
      );
    }
    function stop(e: CalendarClick) {
      if (e) {
        e.preventDefault();
      }
    }
    const on =
        "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box",
      off =
        "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box";
    const first = Date.UTC(calendarYear, calendarMonth, 1),
      lead = (new Date(first).getUTCDay() + 6) % 7,
      dim = new Date(Date.UTC(calendarYear, calendarMonth + 1, 0)).getUTCDate();
    const days = [];
    const cellBase =
      "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; text-decoration: none; box-sizing: border-box; ";
    for (let i = 0; i < lead; i++) {
      days.push({
        label: "",
        aria: "",
        st: cellBase,
        pick: function (e: CalendarClick) {
          stop(e);
        },
      });
    }
    for (let d = 1; d <= dim; d++) {
      const t = Date.UTC(calendarYear, calendarMonth, d);
      const future = t > TODAY,
        isEnd = t === draftFrom || t === draftTo,
        inRange = draftFrom != null && draftTo != null && t > draftFrom && t < draftTo;
      let st =
        cellBase +
        "border-radius: " +
        (isEnd ? "50%" : inRange ? "0" : "50%") +
        "; ";
      if (future) {
        st += "color: #BDB6BE; cursor: default";
      } else if (isEnd) {
        st +=
          "background: #352637; color: #FFFFFF; font-weight: 600; cursor: pointer";
      } else if (inRange) {
        st += "background: #E3ECFD; color: #352637; cursor: pointer";
      } else {
        st +=
          "color: #352637; cursor: pointer" +
          (t === TODAY
            ? "; box-shadow: inset 0 0 0 1.5px #2963CC; font-weight: 600"
            : "");
      }
      days.push({
        label: String(d),
        aria: formatDate(t) + (future ? ", chưa có số liệu" : ""),
        st: st,
        pick: function (e: CalendarClick) {
          stop(e);
          if (future) {
            return;
          }
          if (draftFrom == null || draftTo != null) {
            self.setState({ draftFrom: t, draftTo: null });
          } else if (t < draftFrom) {
            self.setState({ draftFrom: t });
          } else {
            self.setState({ draftTo: t });
          }
        },
      });
    }
    const durationDays = Math.round((appliedTo - appliedFrom) / DAY) + 1;
    const label =
      period === "7"
        ? "7 ngày"
        : period === "30"
          ? "30 ngày"
          : durationDays === 1
            ? formatDate(appliedFrom)
            : formatDate(appliedFrom, false) + " – " + formatDate(appliedTo);
    const box =
      "flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 8px 12px; border-radius: 10px; border: 1.5px solid ";
    const picking = draftFrom == null || draftTo != null ? "from" : "to";
    const canApply = draftFrom != null;
    const atEnd = calendarYear === 2026 && calendarMonth === 9;
    return {
      is7: period === "7",
      is30: period === "30",
      isCustom: period === "custom",
      pickerOpen: !!s.open,
      seg7: period === "7" ? on : off,
      seg30: period === "30" ? on : off,
      segCustom: period === "custom" || s.open ? on : off,
      customLabel: period === "custom" ? label : "Tùy chọn",
      summary:
        period === "custom"
          ? "Số liệu từ " +
            formatDate(appliedFrom) +
            " đến " +
            formatDate(appliedTo) +
            " (" +
            durationDays +
            " ngày), cập nhật 09:30 ngày 23/10/2026."
          : "Số liệu " + period + " ngày, cập nhật 09:30 ngày 23/10/2026.",
      rangeIn:
        period === "custom"
          ? "từ " + formatDate(appliedFrom, false) + " đến " + formatDate(appliedTo, false)
          : "trong " + period + " ngày",
      rangePast:
        period === "custom"
          ? "Từ " + formatDate(appliedFrom) + " đến " + formatDate(appliedTo)
          : period + " ngày qua",
      fromText: draftFrom == null ? "dd/mm/yyyy" : formatDate(draftFrom),
      toText: draftTo == null ? (draftFrom == null ? "dd/mm/yyyy" : formatDate(draftFrom)) : formatDate(draftTo),
      fromBox: box + (picking === "from" ? "#2963CC" : "#D6D4D0"),
      toBox: box + (picking === "to" ? "#2963CC" : "#D6D4D0"),
      monthLabel: "Tháng " + (calendarMonth + 1) + ", " + calendarYear,
      days: days,
      nextStyle:
        "width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; box-sizing: border-box; " +
        (atEnd ? "color: #BDB6BE; cursor: default" : "color: #352637"),
      hint:
        picking === "from"
          ? "Chọn ngày bắt đầu. Số liệu có đến hết hôm nay, 23/10/2026."
          : "Chọn ngày kết thúc, hoặc bấm Áp dụng để xem riêng ngày " +
            formatDate(draftFrom ?? TODAY) +
            ".",
      cantApply: !canApply,
      applyStyle:
        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; height: 40px" +
        (canApply ? "" : "; opacity: 0.4; cursor: default"),
      pick7: function (e: CalendarClick) {
        stop(e);
        self.setState({ period: "7", open: false });
      },
      pick30: function (e: CalendarClick) {
        stop(e);
        self.setState({ period: "30", open: false });
      },
      openPicker: function (e: CalendarClick) {
        stop(e);
        const base = period === "custom" ? appliedFrom : null;
        const dd = new Date(base == null ? TODAY : base);
        self.setState({
          open: !s.open,
          draftFrom: period === "custom" ? appliedFrom : null,
          draftTo: period === "custom" ? appliedTo : null,
          calendarYear: dd.getUTCFullYear(),
          calendarMonth: dd.getUTCMonth(),
        });
      },
      closePicker: function (e: CalendarClick) {
        stop(e);
        self.setState({ open: false });
      },
      prevMonth: function (e: CalendarClick) {
        stop(e);
        self.setState({ calendarYear: calendarMonth === 0 ? calendarYear - 1 : calendarYear, calendarMonth: calendarMonth === 0 ? 11 : calendarMonth - 1 });
      },
      nextMonth: function (e: CalendarClick) {
        stop(e);
        if (atEnd) {
          return;
        }
        self.setState({ calendarYear: calendarMonth === 11 ? calendarYear + 1 : calendarYear, calendarMonth: calendarMonth === 11 ? 0 : calendarMonth + 1 });
      },
      apply: function (e: CalendarClick) {
        stop(e);
        if (draftFrom == null) {
          return;
        }
        self.setState({
          period: "custom",
          appliedFrom: draftFrom,
          appliedTo: draftTo == null ? draftFrom : draftTo,
          open: false,
        });
      },
    };
  }

  render() {
    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <StaffLayout
          active="home"
          crumb="Quản lý / Tổng quan"
          contentClassName="p-4 sm:p-6 md:p-8 flex flex-col gap-6"
        >
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: flex-end; gap: 16px",
                  )}
                >
                  <div>
                    <h1
                      style={styleOf(
                        "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                      )}
                    >
                      {"Tổng quan hệ thống"}
                    </h1>
                    <div
                      style={styleOf(
                        "font-size: 15px; color: #706473; margin-top: 4px",
                      )}
                    >
                      {v.summary}
                    </div>
                  </div>
                  <div
                    style={styleOf("display: flex; flex-wrap: wrap; gap: 10px")}
                  >
                    <div style={styleOf("position: relative")}>
                      <div
                        role={"group"}
                        aria-label={"Khoảng thời gian"}
                        style={styleOf(
                          "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                        )}
                      >
                        <a
                          href={"#"}
                          onClick={v.pick7}
                          aria-pressed={v.is7}
                          style={styleOf(v.seg7)}
                        >
                          {"7 ngày"}
                        </a>
                        <a
                          href={"#"}
                          onClick={v.pick30}
                          aria-pressed={v.is30}
                          style={styleOf(v.seg30)}
                        >
                          {"30 ngày"}
                        </a>
                        <a
                          href={"#"}
                          onClick={v.openPicker}
                          aria-haspopup={"dialog"}
                          aria-expanded={v.pickerOpen}
                          aria-pressed={v.isCustom}
                          style={styleOf(v.segCustom)}
                        >
                          <svg
                            width={"15"}
                            height={"15"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <rect
                              x={"3"}
                              y={"5"}
                              width={"18"}
                              height={"16"}
                              rx={"2"}
                            ></rect>
                            <path d={"M3 10h18M8 3v4M16 3v4"}></path>
                          </svg>
                          <span>{v.customLabel}</span>
                        </a>
                      </div>
                      {v.pickerOpen ? (
                        <>
                          <div
                            onClick={v.closePicker}
                            style={styleOf(
                              "position: fixed; inset: 0; z-index: 40",
                            )}
                          ></div>
                          <div
                            role={"dialog"}
                            aria-label={"Chọn khoảng thời gian"}
                            style={styleOf(
                              "position: absolute; right: 0; top: 48px; z-index: 50; width: 352px; box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 16px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 18px; display: flex; flex-direction: column; gap: 14px",
                            )}
                          >
                            <div
                              style={styleOf(
                                "font-size: 16px; font-weight: 600",
                              )}
                            >
                              {"Chọn khoảng thời gian"}
                            </div>
                            <div style={styleOf("display: flex; gap: 10px")}>
                              <div style={styleOf(v.fromBox)}>
                                <span
                                  style={styleOf(
                                    "font-size: 13px; color: #706473",
                                  )}
                                >
                                  {"Từ ngày"}
                                </span>
                                <span
                                  style={styleOf(
                                    "font-weight: 600; font-family: 'IBM Plex Mono', monospace; font-size: 14px",
                                  )}
                                >
                                  {v.fromText}
                                </span>
                              </div>
                              <div style={styleOf(v.toBox)}>
                                <span
                                  style={styleOf(
                                    "font-size: 13px; color: #706473",
                                  )}
                                >
                                  {"Đến ngày"}
                                </span>
                                <span
                                  style={styleOf(
                                    "font-weight: 600; font-family: 'IBM Plex Mono', monospace; font-size: 14px",
                                  )}
                                >
                                  {v.toText}
                                </span>
                              </div>
                            </div>
                            <div
                              style={styleOf(
                                "display: flex; align-items: center; justify-content: space-between",
                              )}
                            >
                              <a
                                href={"#"}
                                onClick={v.prevMonth}
                                aria-label={"Tháng trước"}
                                style={styleOf(
                                  "width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637",
                                )}
                              >
                                <svg
                                  width={"16"}
                                  height={"16"}
                                  viewBox={"0 0 24 24"}
                                  fill={"none"}
                                  stroke={"currentColor"}
                                  strokeWidth={"2"}
                                  strokeLinecap={"round"}
                                  strokeLinejoin={"round"}
                                  aria-hidden={"true"}
                                >
                                  <path d={"M15 18l-6-6 6-6"}></path>
                                </svg>
                              </a>
                              <span
                                style={styleOf(
                                  "font-weight: 600; font-size: 15px",
                                )}
                              >
                                {v.monthLabel}
                              </span>
                              <a
                                href={"#"}
                                onClick={v.nextMonth}
                                aria-label={"Tháng sau"}
                                style={styleOf(v.nextStyle)}
                              >
                                <svg
                                  width={"16"}
                                  height={"16"}
                                  viewBox={"0 0 24 24"}
                                  fill={"none"}
                                  stroke={"currentColor"}
                                  strokeWidth={"2"}
                                  strokeLinecap={"round"}
                                  strokeLinejoin={"round"}
                                  aria-hidden={"true"}
                                >
                                  <path d={"M9 18l6-6-6-6"}></path>
                                </svg>
                              </a>
                            </div>
                            <div
                              style={styleOf(
                                "display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); row-gap: 2px",
                              )}
                            >
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T2"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T3"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T4"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T5"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T6"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"T7"}
                              </div>
                              <div
                                style={styleOf(
                                  "display: flex; align-items: center; justify-content: center; height: 38px; font-size: 13px; height: 30px; font-size: 13px; font-weight: 600; color: #706473",
                                )}
                              >
                                {"CN"}
                              </div>
                              {(v.days || []).map((c, index) => (
                                <React.Fragment key={index}>
                                  <a
                                    href={"#"}
                                    onClick={c.pick}
                                    aria-label={c.aria}
                                    style={styleOf(c.st)}
                                  >
                                    {c.label}
                                  </a>
                                </React.Fragment>
                              ))}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {v.hint}
                            </div>
                            <div
                              style={styleOf(
                                "display: flex; gap: 10px; justify-content: flex-end",
                              )}
                            >
                              <a
                                href={"#"}
                                onClick={v.closePicker}
                                style={styleOf(
                                  "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A; height: 40px",
                                )}
                              >
                                {"Hủy"}
                              </a>
                              <a
                                href={"#"}
                                onClick={v.apply}
                                aria-disabled={v.cantApply}
                                style={styleOf(v.applyStyle)}
                              >
                                {"Áp dụng"}
                              </a>
                            </div>
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div
                      style={styleOf(
                        "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                      )}
                    >
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600",
                        )}
                      >
                        {"Mọi kỹ năng"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                        )}
                      >
                        {"Writing"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                        )}
                      >
                        {"Speaking"}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="shrink-0"
                  style={styleOf(
                    "display: flex; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                  )}
                >
                  <div style={styleOf("flex: 1 1 0; padding: 18px 22px; ")}>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Người dùng"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"1.284"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"1.262 người học · 18 giáo viên · 4 quản lý"}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Bài hoàn thành"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"2.316"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {v.rangeIn}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Yêu cầu chấm tiếp nhận"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"342"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {v.rangeIn}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Bonus đã hoàn"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"19"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"2 giao dịch chờ xử lý"}
                    </div>
                  </div>
                </div>
                <div
                  className="shrink-0"
                  style={styleOf(
                    "display: flex; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                  )}
                >
                  <div style={styleOf("flex: 1 1 0; padding: 18px 22px; ")}>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Chờ phân công"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"7"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"2 yêu cầu còn dưới 12 giờ"}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Đã phân công, chờ chấm"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"23"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"18 giáo viên đang nhận bài"}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Đã có kết quả"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"291"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {v.rangeIn}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Đã hủy"}
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                      )}
                    >
                      {"21"}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"17 quá hạn 72 giờ · 4 giáo viên không thể hoàn thành"}
                    </div>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1.5 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px",
                        )}
                      >
                        <div>
                          <div
                            style={styleOf("font-size: 18px; font-weight: 600")}
                          >
                            {"Bài hoàn thành 7 ngày qua"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {
                              "L/R chấm tự động và W/S đã lưu, tính theo ngày hoàn thành"
                            }
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: flex-end; gap: 12px; height: 150px; padding-top: 10px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 60px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T2"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 84px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T3"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 72px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T4"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 110px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T5"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 96px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T6"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 130px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"T7"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 100%; max-width: 34px; height: 118px; border-radius: 6px 6px 0 0; background: #BFD8F7; border: 1.5px solid #D6D4D0",
                            )}
                          ></div>
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"CN"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px",
                        )}
                      >
                        <div>
                          <div
                            style={styleOf("font-size: 18px; font-weight: 600")}
                          >
                            {"Việc cần xem"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid #E6E4E0",
                        )}
                      >
                        <span style={styleOf("flex: 1; font-size: 14px")}>
                          {
                            "2 yêu cầu sắp quá hạn 72 giờ chờ phân công (Speaking)"
                          }
                        </span>
                        <a
                          href={"AdminGrading.dc.html"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Theo dõi"}
                        </a>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid #E6E4E0",
                        )}
                      >
                        <span style={styleOf("flex: 1; font-size: 14px")}>
                          {
                            "Thầy Quốc Bảo báo không thể hoàn thành 3 bài, cần xác nhận hủy"
                          }
                        </span>
                        <a
                          href={"AdminUsers.dc.html"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Xử lý"}
                        </a>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid #E6E4E0",
                        )}
                      >
                        <span style={styleOf("flex: 1; font-size: 14px")}>
                          {
                            "Lô nhập đề exam_reading_04.xlsx có 3 lỗi, chưa lưu gì"
                          }
                        </span>
                        <a
                          href={"AdminReadingEditor.dc.html"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Xem"}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                    )}
                  >
                    <div
                      style={styleOf(
                        "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 12px; ",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px",
                          )}
                        >
                          <div>
                            <div
                              style={styleOf(
                                "font-size: 18px; font-weight: 600",
                              )}
                            >
                              {"Yêu cầu bị hủy theo nguyên nhân"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {v.rangePast + ", mỗi yêu cầu chỉ tính một lần"}
                            </div>
                          </div>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 16px; align-items: center",
                          )}
                        >
                          <div style={styleOf("width: 210px; font-size: 14px")}>
                            {"Quá 72 giờ chưa phân công"}
                          </div>
                          <div style={styleOf("flex: 1")}>
                            <div
                              style={styleOf(
                                "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                              )}
                            >
                              <div
                                style={styleOf(
                                  "width: 81%; height: 100%; background: #7A5A0E",
                                )}
                              ></div>
                            </div>
                          </div>
                          <span
                            style={styleOf(
                              "font-weight: 600; width: 30px; text-align: right",
                            )}
                          >
                            {"17"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 16px; align-items: center",
                          )}
                        >
                          <div style={styleOf("width: 210px; font-size: 14px")}>
                            {"Giáo viên không thể hoàn thành"}
                          </div>
                          <div style={styleOf("flex: 1")}>
                            <div
                              style={styleOf(
                                "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                              )}
                            >
                              <div
                                style={styleOf(
                                  "width: 19%; height: 100%; background: #B23A24",
                                )}
                              ></div>
                            </div>
                          </div>
                          <span
                            style={styleOf(
                              "font-weight: 600; width: 30px; text-align: right",
                            )}
                          >
                            {"4"}
                          </span>
                        </div>
                        <div style={styleOf("font-size: 13px; color: #706473")}>
                          {
                            "Bonus đã hoàn chỉ tính giao dịch thành công (19). 2 giao dịch đang chờ thử lại được đếm riêng."
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        </StaffLayout>
        {"\n"}
      </>
    );
  }
}

export default AdminHome;
