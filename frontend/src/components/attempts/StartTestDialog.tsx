import { accentForeground } from "./appearance";
import React from "react";
import ModePicker from "./ModePicker";
import TimeLimitPicker from "./TimeLimitPicker";
import {
  getTimeLimitConfig,
  resolveTimeLimit,
} from "../../lib/attempts/time-limits";
import {
  READING_PLAYABLE_PASSAGES,
  initialPartsFromSection,
  runnableCount,
} from "../../lib/attempts/part-choice";

import type { AttemptMode, Skill } from "./types";
interface StartProps {
  skill?: Skill;
  cheDo?: AttemptMode;
  title?: string;
  accent?: string;
  /** `section` trên URL (1-based, từ trang chi tiết): phần được chọn sẵn khi hợp lệ. */
  section?: string | null;
  onClose: () => void;
  onStart: (mode: AttemptMode, parts: number[], limitMinutes: number) => void;
}
interface StartState {
  mode?: AttemptMode;
  sel?: number[];
  skill?: Skill;
  /** Chỉ số mức thời gian trong danh sách mức (không lưu số phút để khỏi lệch khi danh sách đổi). */
  limitIndex?: number;
}
interface SkillConfig {
  name: string;
  bg: string;
  fg: string;
  href: string;
  legend: string;
  unit?: string;
  single: boolean;
  parts: [string, string, number][];
  real: string;
  practice: string;
}
interface PartChoice {
  label: string;
  meta: string;
  checked: boolean;
  bg: string;
  toggle: () => void;
  type?: "radio" | "checkbox";
}
class StartTestDialog extends React.Component<StartProps, StartState> {
  renderVals() {
    const P = this.props,
      S = this.state || {},
      self = this;
    const skill = P.skill || "reading";
    const mode = S.mode || P.cheDo || "practice";
    const accent = P.accent || "#2963CC";

    const onAccent = accentForeground(accent);
    const configs: Record<Skill, SkillConfig> = {
      reading: {
        name: "Reading",
        bg: "#DCEDE2",
        fg: "#2E6A48",
        href: "#ReadingTest",
        legend: "Chọn Passage",
        unit: "câu",
        // Trang Reading còn dùng dữ liệu mẫu một passage nên chỉ chọn một; tự mở chọn nhiều khi trang chạy được nhiều passage.
        single: READING_PLAYABLE_PASSAGES <= 1,
        parts: [
          ["Passage 1", "13 câu", 13],
          ["Passage 2", "13 câu", 13],
          ["Passage 3", "14 câu", 14],
        ],
        real: "Làm trọn Reading, đếm ngược 60 phút. Có tính band.",
        practice:
          "Chọn từng phần và mức thời gian (hoặc không giới hạn). Band không tính, chỉ hiện số câu đúng.",
      },
      listening: {
        name: "Listening",
        bg: "#DDE8FC",
        fg: "#2A55B8",
        href: "#ListeningTest",
        legend: "Chọn Section",
        unit: "câu",
        // Listening Practice chỉ làm một Section mỗi lượt.
        single: true,
        parts: [
          ["Section 1", "10 câu", 10],
          ["Section 2", "10 câu", 10],
          ["Section 3", "10 câu", 10],
          ["Section 4", "10 câu", 10],
        ],
        real: "Làm trọn Listening, khoảng 30 phút. Audio tự phát một lần, không tua. Có tính band.",
        practice:
          "Chọn từng Section, đồng hồ đếm lên, nghe và tua tự do. Band không tính, chỉ hiện số câu đúng.",
      },
      writing: {
        name: "Writing",
        bg: "#FBEDBF",
        fg: "#7A5A0E",
        href: "#WritingTest",
        legend: "Chọn một Task",
        unit: "từ",
        single: true,
        parts: [
          ["Task 1", "tối thiểu 150 từ", 0],
          ["Task 2", "tối thiểu 250 từ", 0],
        ],
        real: "Làm trọn 2 Task trong 60 phút, đếm ngược. Bài được lưu, bạn chủ động gửi yêu cầu chấm sau.",
        practice: "Chọn một Task, đồng hồ đếm lên, không giới hạn thời gian.",
      },
      speaking: {
        name: "Speaking",
        bg: "#E8E4FA",
        fg: "#5543B0",
        href: "#SpeakingTest",
        legend: "Chọn Part",
        unit: "phút",
        single: false,
        parts: [
          ["Part 1", "giới thiệu, đời sống", 0],
          ["Part 2", "nói theo thẻ gợi ý", 0],
          ["Part 3", "thảo luận mở rộng", 0],
        ],
        real: "Làm trọn 3 Part theo thứ tự như buổi thi thật, đếm ngược 15 phút. Bài ghi âm được lưu để gửi chấm.",
        practice: "Chọn từng Part và mức thời gian (hoặc không giới hạn), thu âm lại khi muốn.",
      },
    };
    let K = configs[skill];
    if (!K) {
      K = {
        name: "Reading",
        bg: "#DCEDE2",
        fg: "#2E6A48",
        href: "#ReadingTest",
        legend: "Chọn Passage",
        single: false,
        parts: [],
        real: "",
        practice: "",
      };
    }
    const allParts = K.parts.map(function (_, i) {
      return i;
    });
    const preset = initialPartsFromSection(P.section, K.parts.length);
    const sel =
      S.sel && S.skill === skill
        ? S.sel
        : preset
          ? preset
          : skill === "speaking"
            ? allParts
            : [0];
    function setSel(a: number[]) {
      self.setState({ sel: a, skill: skill });
    }
    const parts: PartChoice[] = K.parts.map(function (p, i) {
      const on = sel.indexOf(i) >= 0;
      return {
        label: p[0],
        meta: p[1],
        checked: on,
        bg: on ? "#E3ECFD" : "#FFFFFF",
        toggle: function () {
          if (K.single) {
            setSel([i]);
            return;
          }
          let a = sel.filter(function (x) {
            return x !== i;
          });
          if (!on) {
            a = sel.concat([i]).sort();
          }
          setSel(a);
        },
      };
    });
    const chosen = sel.map(function (i) {
      return K.parts[i];
    });
    const total = chosen.reduce(function (s, p) {
      return s + p[2];
    }, 0);
    const summary =
      chosen.length === 0
        ? "Chưa chọn phần nào."
        : "Đã chọn: " +
          chosen
            .map(function (p) {
              return p[0];
            })
            .join(", ") +
          (total ? " · " + total + " câu" : "");
    parts.forEach(function (p) {
      p.type = K.single ? "radio" : "checkbox";
    });
    const isPractice = mode === "practice";
    const canStart = !isPractice || chosen.length > 0;
    const timeConfig = getTimeLimitConfig({
      skill,
      mode,
      sectionCount: runnableCount(
        chosen.length,
        skill === "reading" ? READING_PLAYABLE_PASSAGES : undefined,
      ),
    });
    const limit = resolveTimeLimit(timeConfig, S.limitIndex);
    return {
      accent: accent,
      onAccent: onAccent,
      skillBg: K.bg,
      skillFg: K.fg,
      title: P.title || "IELTS Recent Actual Tests · Test 1 · " + K.name,
      mode: mode,
      pickMode: (m: AttemptMode) => self.setState({ mode: m }),
      practiceDesc: K.practice,
      realDesc: K.real,
      realTag:
        skill === "reading" || skill === "listening"
          ? "Có tính band"
          : "Như thi thật",
      isSpeaking: skill === "speaking",
      timeConfig: timeConfig,
      limit: limit,
      setLimit: (minutes: number) =>
        self.setState({
          limitIndex: Math.max(0, timeConfig.options.indexOf(minutes)),
        }),
      legend: K.legend,
      isPractice: isPractice,
      partsLegend: K.legend,
      parts: parts,
      partType: K.single ? "radio" : "checkbox",
      showAll: !K.single,
      allChecked: sel.length === K.parts.length,
      toggleAll: function () {
        setSel(sel.length === K.parts.length ? [] : allParts);
      },
      allParts: allParts,
      selected: sel,
      summary: summary,
      canStart: canStart,
      cannotStart: !canStart,
      startHref: K.href,
    };
  }

  static defaultProps = {
    skill: "reading",
    cheDo: "practice",
    title: "IELTS Recent Actual Tests · Test 1 · Reading",
    accent: "#2963CC",
  };
  render() {
    const v = this.renderVals();
    return (
      <>
        <div
          aria-modal="true"
          aria-labelledby="start-title"
          className="[width:680px] [max-width:100%] box-border p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_16px_40px_rgba(53,_38,_55,_0.18)] flex flex-col [gap:18px]"
        >
          <div className="flex items-start [gap:14px]">
            <span
              className="[flex:0_0_44px] w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] flex items-center justify-center"
              style={{ background: v.skillBg, color: v.skillFg }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 5l11 7-11 7z"></path>
              </svg>
            </span>
            <div className="min-w-0">
              <h2
                id="start-title"
                className="m-0 [font-size:22px] [line-height:1.3] [letter-spacing:-0.015em] attempt-sans"
              >
                {"Bắt đầu làm bài"}
              </h2>
              <div className="[color:var(--attempt-text-706473)] [font-size:14px]">
                {v.title}
              </div>
            </div>
          </div>
          <ModePicker
            value={v.mode}
            onChange={v.pickMode}
            practiceDesc={v.practiceDesc}
            realDesc={v.realDesc}
            realTag={v.realTag}
            practiceExtra={
              <>
                <div
                  role="group"
                  aria-label={v.legend}
                  className="flex flex-col gap-2 mt-1"
                >
                  <div className="[font-size:12px] font-semibold [letter-spacing:0.08em] uppercase [color:var(--attempt-text-706473)]">
                    {v.legend}
                  </div>
                  <div className="[border-top:1px_solid_var(--attempt-bg-c5cef5)]">
                    {v.showAll ? (
                      <label className="flex items-center gap-3 [min-height:40px] [padding:0_4px] box-border [border-bottom:1px_solid_var(--attempt-bg-c5cef5)] font-semibold [font-size:14px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.allChecked}
                          onChange={v.toggleAll}
                        />
                        {"Chọn tất cả"}
                      </label>
                    ) : null}
                    {v.parts.map((p, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-3 [min-height:40px] [padding:0_4px] box-border [border-bottom:1px_solid_var(--attempt-bg-c5cef5)] [font-size:14px] cursor-pointer"
                      >
                        <input
                          type={p.type}
                          name="phan"
                          checked={p.checked}
                          onChange={p.toggle}
                        />
                        <span className="font-semibold">{p.label}</span>
                        <span className="ml-auto [color:var(--attempt-text-706473)] [font-size:12px]">
                          {p.meta}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="[font-size:12px] [color:var(--attempt-text-706473)]">
                    {v.summary}
                  </div>
                </div>
                <TimeLimitPicker
                  options={v.timeConfig.options}
                  value={v.limit}
                  onChange={v.setLimit}
                  locked={v.timeConfig.locked}
                />
              </>
            }
          />
          <div className="flex items-start [gap:10px] [padding:12px_14px] rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-e3ecfd)] [font-size:13px] [color:var(--attempt-text-352637)]">
            <span className="[flex:0_0_18px] [margin-top:1px] [color:var(--attempt-text-2963cc)] flex">
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
              {v.isSpeaking
                ? "Thoát hoặc mất kết nối thì đồng hồ vẫn chạy. Các câu đã ghi âm được lưu trên máy này; câu đang nói dở sẽ được làm lại từ đầu."
                : "Thoát hoặc mất kết nối thì đồng hồ tạm dừng, làm tiếp từ thời gian còn lại."}
            </span>
          </div>
          <div className="flex flex-wrap [gap:10px] justify-end">
            <a
              href="#"
              onClick={this.props.onClose}
              className="inline-flex items-center justify-center h-11 [padding:0_22px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
            >
              {"Hủy"}
            </a>
            {v.canStart ? (
              <>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.onStart(
                      v.mode,
                      v.mode === "practice" ? v.selected : v.allParts,
                      v.mode === "practice"
                        ? v.limit
                        : v.timeConfig.defaultValue,
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 [padding:0_24px] rounded-full box-border font-semibold [font-size:14px] no-underline whitespace-nowrap"
                  style={{
                    border: "1.5px solid " + v.accent,
                    background: v.accent,
                    color: v.onAccent,
                  }}
                >
                  {"Bắt đầu"}
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
                </a>
              </>
            ) : null}
            {v.cannotStart ? (
              <>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center h-11 [padding:0_24px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-f3f0ea)] [color:var(--attempt-text-706473)] font-semibold [font-size:14px] whitespace-nowrap [cursor:not-allowed]"
                >
                  {"Chọn ít nhất một phần"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}
export default StartTestDialog;
