import React from "react";
import { styleOf, cssText } from "../../../lib/shared/styles";
import StaffLayout from "../../../components/layout/StaffLayout";
import { dashboardDate, getAdminStatistics, vietnamToday, type AdminStatistics } from "../../../lib/admin-users/statistics";

const DAY = 86_400_000;
const numberFormat = new Intl.NumberFormat("vi-VN");
const updatedFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short",
});
const displayCount = (value: number | null | undefined) => value == null ? "—" : numberFormat.format(value);
const cardSurface = "border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden";
const linkStyle = "display: inline-flex; align-items: center; justify-content: center; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; color: #352637; font-weight: 600; text-decoration: none";

interface DashboardState {
  period: "7" | "30" | "custom";
  open: boolean;
  calendarYear: number;
  calendarMonth: number;
  draftFrom: number | null;
  draftTo: number | null;
  appliedFrom: number;
  appliedTo: number;
  stats?: AdminStatistics;
  error?: string;
}

type CalendarClick = React.MouseEvent<HTMLElement>;

class AdminHome extends React.Component<Record<never, never>, DashboardState> {
  private initialDay = vietnamToday();
  private requestId = 0;
  state: DashboardState = {
    period: "30",
    open: false,
    calendarYear: new Date(this.initialDay).getUTCFullYear(),
    calendarMonth: new Date(this.initialDay).getUTCMonth(),
    draftFrom: null,
    draftTo: null,
    appliedFrom: this.initialDay - 29 * DAY,
    appliedTo: this.initialDay,
  };

  componentDidMount() {
    this.loadStatistics();
  }

  componentDidUpdate(_props: Record<never, never>, previous: DashboardState) {
    if (previous.appliedFrom !== this.state.appliedFrom || previous.appliedTo !== this.state.appliedTo) {
      this.loadStatistics();
    }
  }

  componentWillUnmount() {
    this.requestId++;
  }

  private loadStatistics = () => {
    const requestId = ++this.requestId;
    const { appliedFrom, appliedTo } = this.state;
    this.setState({ stats: undefined, error: undefined });
    void getAdminStatistics(appliedFrom, appliedTo).then(stats => {
      if (requestId === this.requestId) this.setState({ stats });
    }).catch((error: unknown) => {
      if (requestId === this.requestId) this.setState({
        error: error instanceof Error ? error.message : "Chưa tải được thống kê.",
      });
    });
  };

  renderVals() {
    const s = this.state;
    const self = this;
    const TODAY = vietnamToday();
    const { period, calendarYear, calendarMonth, draftFrom, draftTo, appliedFrom, appliedTo } = s;
    const stats = s.stats?.from === dashboardDate(appliedFrom) && s.stats.to === dashboardDate(appliedTo) ? s.stats : undefined;
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
    const atEnd = Date.UTC(calendarYear, calendarMonth) >= Date.UTC(new Date(TODAY).getUTCFullYear(), new Date(TODAY).getUTCMonth());
    return {
      is7: period === "7",
      is30: period === "30",
      isCustom: period === "custom",
      pickerOpen: !!s.open,
      seg7: period === "7" ? on : off,
      seg30: period === "30" ? on : off,
      segCustom: period === "custom" || s.open ? on : off,
      customLabel: period === "custom" ? label : "Tùy chọn",
      stats,
      summary: `Số liệu từ ${formatDate(appliedFrom)} đến ${formatDate(appliedTo)} (giờ Việt Nam).`
        + (stats ? ` Cập nhật ${updatedFormat.format(new Date(stats.measuredAt))}.` : ""),
      rangeIn:
        period === "custom"
          ? "từ " + formatDate(appliedFrom, false) + " đến " + formatDate(appliedTo, false)
          : "trong " + period + " ngày",
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
          ? "Chọn ngày bắt đầu. Ngày hiện tại là " + formatDate(TODAY) + "."
          : "Chọn ngày kết thúc, hoặc bấm Áp dụng để xem riêng ngày " +
            formatDate(draftFrom ?? TODAY) +
            ".",
      cantApply: !canApply,
      applyStyle:
        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; box-sizing: border-box; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap; cursor: pointer; font-family: inherit; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; height: 40px" +
        (canApply ? "" : "; opacity: 0.4; cursor: default"),
      pick7: function (e: CalendarClick) {
        stop(e);
        const today = vietnamToday();
        self.setState({ period: "7", open: false, appliedFrom: today - 6 * DAY, appliedTo: today });
      },
      pick30: function (e: CalendarClick) {
        stop(e);
        const today = vietnamToday();
        self.setState({ period: "30", open: false, appliedFrom: today - 29 * DAY, appliedTo: today });
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
    const { stats } = v;
    const loginDate = stats?.loginHistoryFrom?.split("-").reverse().join("/");
    const metricRows = [
      [
        ["Tổng hồ sơ", stats?.accountsTotal, "Mọi trạng thái · hiện tại"],
        ["Tài khoản mới", stats?.accountsNew, v.rangeIn],
        ["Tài khoản có đăng nhập", stats?.usersSignedIn, loginDate ? `Nhật ký từ ${loginDate}` : v.rangeIn],
        ["Lượt khóa tài khoản", stats?.accountLocks, v.rangeIn],
      ],
      [
        ["Tài khoản đang khóa", stats?.accountsLocked, "Hiện tại"],
        ["Phiên Flashcard hợp lệ", stats?.flashcardSessions, v.rangeIn],
        ["Người ôn Flashcard", stats?.flashcardLearners, v.rangeIn],
        ["Phiếu hỗ trợ", stats?.supportReports, stats?.supportReports == null ? "Chưa có nguồn thống kê" : v.rangeIn],
      ],
    ] as const;
    const chart = stats?.dailyFlashcards.map(point => {
      const [, month, day] = point.day.split("-");
      return { ...point, label: day + "/" + month };
    }) ?? [];
    const maxSessions = Math.max(1, ...chart.map(point => point.sessions));
    const followUps = [
      ["Tài khoản đang khóa", stats?.accountsLocked, "AdminUsers.dc.html"],
      ["Phiếu hỗ trợ", stats?.supportReports, "AdminReports.dc.html"],
    ] as const;
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
                    "position: relative; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px",
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
                    <div>
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
                            className="absolute left-0 top-full z-50 mt-2 w-full max-w-[352px] sm:left-auto sm:right-0"
                            style={styleOf(
                              "box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 16px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 18px; display: flex; flex-direction: column; gap: 14px",
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
                  </div>
                </div>
                {this.state.error ? <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
                  <span>{this.state.error}</span>
                  <button type="button" className="rounded-full border border-solid border-[var(--attempt-line-d6d4d0)] bg-transparent px-4 py-2 text-inherit" onClick={this.loadStatistics}>Thử lại</button>
                </div> : !v.stats && <div role="status" className="sr-only">Đang tải thống kê…</div>}
                <div aria-busy={!v.stats && !this.state.error} className="flex shrink-0 flex-col gap-6">
                  {metricRows.map((row, index) => (
                    <div key={index} className="grid grid-cols-2 xl:grid-cols-4" style={styleOf(cardSurface)}>
                      {row.map(([title, count, description]) => (
                        <div key={title} className="min-w-0 border border-solid border-[var(--attempt-line-e6e4e0)] px-4 py-4 sm:px-[22px] sm:py-[18px]">
                          <div className="text-[13px] text-[var(--attempt-text-706473)]">{title}</div>
                          <div className="break-words font-mono text-[28px] font-bold leading-tight tracking-tight">{displayCount(count)}</div>
                          <div className="text-[13px] text-[var(--attempt-text-706473)]">{description}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex min-w-0 flex-[1.5_1_420px] flex-col gap-6">
                    <section className="p-6" style={styleOf(cardSurface)} aria-labelledby="admin-flashcard-chart">
                      <h2 id="admin-flashcard-chart" className="m-0 text-lg font-semibold">Phiên Flashcard theo ngày</h2>
                      <div className="text-[13px] text-[var(--attempt-text-706473)]">Tối đa 7 ngày cuối của khoảng đã chọn</div>
                      {chart.length ? (
                        <div className="flex h-[150px] items-end gap-3 pt-2.5" role="img" aria-label={chart.map(point => point.label + ': ' + point.sessions + ' phiên').join(', ')}>
                          {chart.map(point => (
                            <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-1.5" title={point.day + ' · ' + point.sessions + ' phiên'}>
                              <span aria-hidden="true" className="text-xs">{displayCount(point.sessions)}</span>
                              {point.sessions > 0 && <div aria-hidden="true" className="w-full max-w-[34px] rounded-t-md bg-[var(--attempt-bg-bfd8f7,#BFD8F7)]" style={{ height: point.sessions / maxSessions * 95 }} />}
                              <span aria-hidden="true" className="text-xs text-[var(--attempt-text-706473)]">{point.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : <div className="flex h-[150px] items-end text-[var(--attempt-text-706473)]">—</div>}
                    </section>
                    <section className="p-6" style={styleOf(cardSurface)}>
                      <h2 className="mb-3.5 mt-0 text-lg font-semibold">Việc cần xem</h2>
                      {followUps.map(([title, count, href]) => (
                        <div key={title} className="flex items-center gap-3 border-0 border-t border-solid border-[var(--attempt-line-e6e4e0)] py-2.5 text-sm">
                          <span className="flex-1">{title}</span>
                          <span>{displayCount(count)}</span>
                          <a href={href} style={styleOf(linkStyle)}>Xem</a>
                        </div>
                      ))}
                    </section>
                  </div>
                  <section className="min-w-0 flex-[1_1_320px] p-6" style={styleOf(cardSurface)}>
                    <h2 className="m-0 text-lg font-semibold">Trạng thái tài khoản hiện tại</h2>
                    <div className="mb-3.5 text-[13px] text-[var(--attempt-text-706473)]">Toàn hệ thống</div>
                    {([
                      ["Đang hoạt động", stats?.accountsActive, "#2963CC"],
                      ["Đang khóa", stats?.accountsLocked, "#B23A24"],
                    ] as const).map(([title, count, color]) => (
                      <div key={title} className="flex items-center gap-4 pb-3 text-sm">
                        <span className="w-32">{title}</span>
                        <span aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--attempt-bg-f3f0ea)]">
                          <span className="block h-full" style={{ backgroundColor: color, width: stats?.accountsTotal ? (count ?? 0) / stats.accountsTotal * 100 + "%" : 0 }} />
                        </span>
                        <span className="min-w-8 text-right font-semibold">{displayCount(count)}</span>
                      </div>
                    ))}
                  </section>
                </div>
        </StaffLayout>
        {"\n"}
      </>
    );
  }
}

export default AdminHome;
