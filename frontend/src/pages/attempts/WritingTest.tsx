import { attemptAppearance } from "../../components/attempts/appearance";
import {
  writingTasks,
  writingAnswers,
  writingNotes,
} from "../../data/attempt-samples";
import type {
  ScreenProps,
  AttemptState,
  Snapshot,
} from "../../components/attempts/types";
import React from "react";
import TestTopbar from "../../components/attempts/TestTopbar";
import { getAttemptSync, loadWritingTest } from "../../lib/attempts/attempt-sync";
import { getAuthUser } from "../../lib/auth/auth";
import {
  errorStatus,
  getWritingText,
  type WritingExamDto,
} from "../../lib/attempts/skill-attempts-api";
import { pendingKey, readPendingTexts } from "../../lib/attempts/writing-queue";
import {
  WRITING_DEFAULT_MIN_WORDS,
  WRITING_MAX_CHARS,
  countWords,
  minWordsWarning,
  taskKeyOf,
} from "../../lib/attempts/writing-text";

function newAttemptId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
/** Một Task để hiển thị: lấy từ máy chủ, hoặc từ dữ liệu mẫu khi chưa có đề thật. */
interface TaskView {
  label: string;
  meta: string;
  title: string;
  prompt: string;
  hint: string;
  imageUrl: string | null;
  minWords: number;
}
interface WritingView {
  /** Tên bộ đề (chỉ có khi lấy từ máy chủ). */
  setTitle: string | null;
  tasks: Record<1 | 2, TaskView>;
}
const SUGGESTED_MINUTES: Record<1 | 2, number> = { 1: 20, 2: 40 };
function metaOf(n: 1 | 2, minWords: number): string {
  return (
    "Writing Task " + n + " · tối thiểu " + minWords + " từ · gợi ý " + SUGGESTED_MINUTES[n] + " phút"
  );
}
function sampleView(): WritingView {
  const task = (n: 1 | 2): TaskView => ({
    ...writingTasks[n],
    imageUrl: null,
    minWords: WRITING_DEFAULT_MIN_WORDS[n],
  });
  return { setTitle: null, tasks: { 1: task(1), 2: task(2) } };
}
function dtoToView(dto: WritingExamDto): WritingView {
  const view = sampleView();
  for (const t of dto.tasks) {
    const n = t.taskKey === "task1" ? 1 : 2;
    const minWords = t.minWords > 0 ? t.minWords : WRITING_DEFAULT_MIN_WORDS[n];
    view.tasks[n] = {
      label: "Task " + n,
      meta: metaOf(n, minWords),
      title: t.topic || "Writing Task " + n,
      prompt: t.prompt,
      hint: "",
      imageUrl: t.imageUrl,
      minWords,
    };
  }
  return { setTitle: dto.title, tasks: view.tasks };
}

/** Lấy đề từ máy chủ; lỗi hoặc chưa có backend thì dùng đề mẫu như trước (bài chỉ làm cục bộ). */
export default function WritingTest(props: ScreenProps) {
  const [loaded, setLoaded] = React.useState<{
    view: WritingView;
    offlineSample: boolean;
  } | null>(null);
  React.useEffect(() => {
    let live = true;
    const examId = new URLSearchParams(location.hash.split("?")[1]).get("examId");
    void loadWritingTest(examId).then((dto) => {
      if (!live) return;
      setLoaded(
        dto
          ? { view: dtoToView(dto), offlineSample: false }
          : { view: sampleView(), offlineSample: true },
      );
    });
    return () => {
      live = false;
    };
  }, []);
  if (!loaded)
    return (
      <div
        role="status"
        className="attempt-sans [padding:40px_32px] text-center [color:var(--attempt-text-706473)]"
      >
        {"Đang tải đề…"}
      </div>
    );
  return (
    <WritingRun {...props} exam={loaded.view} offlineSample={loaded.offlineSample} />
  );
}

type RunProps = ScreenProps & { exam: WritingView; offlineSample: boolean };
class WritingRun extends React.Component<RunProps, AttemptState> {
  state: AttemptState = this.props.initialState || {};
  /** Mã lượt do client đặt: khôi phục bài thì lấy lại từ nháp để tạo lượt idempotent. */
  attemptId = this.props.initialState?.writing?.attemptId ?? newAttemptId();
  userId = getAuthUser()?.id;
  examId = new URLSearchParams(location.hash.split("?")[1]).get("examId");
  // Đồng bộ với máy chủ: tạo lượt, tự lưu từng Task, chốt khi Hoàn thành. Lỗi mạng không chặn bài.
  sync = getAttemptSync({
    userId: this.userId,
    examId: this.examId,
    clientAttemptId: this.attemptId,
    mode: this.props.cheDo === "practice" ? "practice" : "real",
    limitMinutes: this.props.limitMinutes ?? 0,
    selectedParts: this.props.selectedParts,
    skill: "WRITING",
    offlineSample: this.props.offlineSample,
    serverId: this.props.initialState?.writing?.serverAttemptId,
  });
  alive = false;
  lastServerId: string | undefined = undefined;
  unsubscribe: (() => void) | undefined;
  /** Văn bản hiện tại của cả hai Task (không đợi setState), dùng cho Hoàn thành. */
  latestTexts: Record<number, string> = { ...(this.props.initialState?.texts || {}) };
  rerender = () => {
    if (this.alive) this.forceUpdate();
  };
  onHide = () => {
    if (document.visibilityState === "hidden") this.sync.texts?.flushOnHide();
  };
  onPageHide = () => this.sync.texts?.flushOnHide();
  hooks(): Partial<Snapshot> {
    const texts = this.sync.texts;
    return {
      persistent: () => true,
      flush: async (options?: { seal?: boolean }) => {
        // Hoàn thành/Không lưu (seal): việc lưu cuối do complete lo hoặc bài sắp bị xóa, không cần lưu thêm ở đây.
        if (!texts || options?.seal) return;
        // Lưu và thoát: đẩy bản mới nhất lên máy chủ (chờ tối đa vài giây; không được thì vẫn còn bản trên máy).
        await Promise.race([
          texts.flush(true),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      },
      // Hoàn thành: lưu lần cuối cả hai Task TRƯỚC khi complete (sau complete máy chủ không nhận sửa nữa).
      complete: async (input: { elapsedSeconds: number; reason: "SUBMITTED" | "TIME_UP" }) => {
        let answered = 0;
        for (const n of [1, 2] as const) {
          const text = this.latestTexts[n];
          if (text !== undefined) texts?.set(taskKeyOf(n), text);
          if ((text ?? "").trim()) answered++;
        }
        if (this.props.offlineSample) return { status: "local" as const, answered };
        const outcome = await this.sync.finish(input.elapsedSeconds, input.reason);
        return { ...outcome, answered };
      },
      cancel: () => this.sync.cancel(),
    };
  }
  publishSnapshot() {
    const saved = this.sync.serverId && !this.props.offlineSample;
    this.props.onSnapshot?.({
      state: {
        ...this.state,
        writing: {
          attemptId: this.attemptId,
          ...(saved ? { serverAttemptId: this.sync.serverId } : {}),
        },
      },
      model: { questions: [] },
      ...this.hooks(),
    });
  }
  /** Vào lại bài: ghép văn bản chưa lưu (máy này) với văn bản đã lưu trên máy chủ. */
  async restore() {
    const saved = this.props.initialState?.writing;
    const queue = this.sync.texts;
    if (!saved || !queue || this.props.offlineSample) return;
    const pending = readPendingTexts(localStorage, pendingKey(this.userId, this.attemptId));
    const local: Record<number, string> = {};
    for (const n of [1, 2] as const) {
      const text = pending[taskKeyOf(n)] ?? this.latestTexts[n] ?? "";
      local[n] = text;
      // Bản trên máy coi là chưa lưu: sẽ được PUT (ghi đè, idempotent) trừ khi trùng bản máy chủ.
      if (text) queue.adopt(taskKeyOf(n), text, false);
      this.latestTexts[n] = text;
    }
    const detail = await this.sync.reconcile();
    const serverId = this.sync.serverId;
    if (!detail || !serverId || !this.alive) {
      // Chưa hỏi được máy chủ: giữ bản trên máy, hàng đợi sẽ lưu khi có mạng.
      if (this.alive && Object.values(local).some(Boolean))
        this.setState({ texts: { ...this.state.texts, ...local } });
      return;
    }
    const merged: Record<number, string> = { ...(this.state.texts || {}) };
    for (const n of [1, 2] as const) {
      try {
        const server = await getWritingText(serverId, taskKeyOf(n));
        if (!this.alive) return;
        if (!local[n] && server.text) {
          merged[n] = server.text;
          queue.adopt(taskKeyOf(n), server.text, true);
          this.latestTexts[n] = server.text;
        } else if (local[n] && local[n] === server.text)
          queue.adopt(taskKeyOf(n), local[n], true);
        else if (local[n]) merged[n] = local[n];
      } catch (e) {
        // 410: nội dung đã hết hạn trên máy chủ, giữ bản trên máy. Lỗi khác: hàng đợi tự thử lại.
        if (local[n]) merged[n] = local[n];
        if (errorStatus(e) === 410) continue;
      }
    }
    if (this.alive) this.setState({ texts: merged });
  }
  componentDidMount() {
    this.alive = true;
    this.props.onBegin?.();
    this.publishSnapshot();
    this.lastServerId = this.sync.serverId;
    void this.sync.ensureCreated().then(() => {
      if (this.alive) this.publishSnapshot();
    });
    void this.restore();
    this.unsubscribe = this.sync.subscribe(() => {
      if (!this.alive) return;
      if (this.sync.serverId !== this.lastServerId) {
        this.lastServerId = this.sync.serverId;
        this.publishSnapshot();
      }
      this.forceUpdate();
    });
    window.addEventListener("pagehide", this.onPageHide);
    document.addEventListener("visibilitychange", this.onHide);
    window.addEventListener("online", this.rerender);
    window.addEventListener("offline", this.rerender);
  }
  componentWillUnmount() {
    this.alive = false;
    this.unsubscribe?.();
    // Rời trang bằng đường khác (liên kết): đẩy nốt bản chưa lưu, best-effort.
    this.sync.texts?.flushOnHide();
    window.removeEventListener("pagehide", this.onPageHide);
    document.removeEventListener("visibilitychange", this.onHide);
    window.removeEventListener("online", this.rerender);
    window.removeEventListener("offline", this.rerender);
  }
  componentDidUpdate(previousProps: RunProps, previousState: AttemptState) {
    if (previousState !== this.state) this.publishSnapshot();
    // Hết giờ: lưu ngay bản mới nhất lên máy chủ, đừng chờ người học chọn Lưu.
    if (!previousProps.timeExpired && this.props.timeExpired)
      void this.sync.texts?.flush(true);
  }
  renderVals() {
    const P = this.props,
      S = this.state || {},
      self = this;
    const real = P.cheDo !== "practice";
    const {fontPct,fs,dark,accent}=attemptAppearance(P,S);
    const t = dark
      ? {
          warnBg: "#352E18",
          warnFg: "#F4D66F",
          bg: "#202125",
          page: "#202125",
          card: "#292A2E",
          line: "#46474D",
          ink: "#F1F2F4",
          muted: "#B2B3B9",
          soft: "#292A2E",
          link: "#8DB0F7",
          sel: "#26314D",
          rule: "#3A3B40",
        }
      : {
          warnBg: "#FBEDBF",
          warnFg: "#7A5A0E",
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
    const TASKS = P.exam.tasks;
    // Đề mẫu giữ bài viết và dàn ý mẫu như trước; đề thật bắt đầu từ trang trống.
    const TEXTS = S.texts || (P.offlineSample ? writingAnswers : {});
    const NOTES = S.notes || (P.offlineSample ? writingNotes : {});
    const cur = TASKS[task];
    const text = TEXTS[task] || "";
    const words = countWords(text);
    const summary = self.sync.texts?.summary();
    const saveStatus = P.offlineSample
      ? "Bài làm thử với đề mẫu, chỉ lưu trên máy này."
      : !navigator.onLine
        ? "Mất kết nối: bài viết vẫn được giữ trên máy này và sẽ tự lưu lên máy chủ khi có mạng."
        : summary && summary.closedKeys.length > 0
          ? "Đã hết thời gian nhận bài: phần chữ mới không lưu lên máy chủ được."
          : summary && summary.failed > 0
            ? "Chưa lưu được lên máy chủ. Bài viết vẫn được giữ trên máy này."
            : !self.sync.serverId || (summary && summary.dirty > 0)
              ? "Đang lưu…"
              : "Đã lưu lên máy chủ.";
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
        "Writing · " +
        (P.exam.setTitle ?? "IELTS Recent Actual Tests · Test 1") +
        (real ? "" : " · " + cur.label),
      crumb:
        "Thư viện đề / " +
        (P.exam.setTitle ?? "IELTS Recent Actual Tests / Test 1"),
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
              // Chuyển Task: lưu Task đang viết lên máy chủ ngay.
              void self.sync.texts?.flush(true);
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
      taskImage: cur.imageUrl,
      saveStatus: saveStatus,
      warning: minWordsWarning(words, cur.minWords),
      notes: NOTES[task] || "",
      setNotes: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
        self.setState({
          notes: setIn(NOTES, task, e && e.target ? e.target.value : ""),
        });
      },
      text: text,
      wordCount: words,
      setText: function (e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e && e.target ? e.target.value : "";
        self.latestTexts = setIn(self.latestTexts, task, value);
        // Hàng đợi giữ bản mới nhất (ghi vào máy ngay) và tự lưu lên máy chủ sau vài giây.
        self.sync.texts?.set(taskKeyOf(task), value);
        self.setState({ texts: setIn(TEXTS, task, value) });
      },
      saveNow: function () {
        void self.sync.texts?.flush(true);
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
              timeWarn={this.props.timeWarn}
              countdown={this.props.countdown}
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
                      className="inline-flex items-center [height:34px] [padding:0_12px] rounded-full [font-size:13px] font-semibold whitespace-nowrap box-border cursor-pointer"
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
                  className="[line-height:1.75] [white-space:pre-line]"
                  style={{ fontSize: v.fs + "px" }}
                >
                  {v.taskPrompt}
                </div>
                {v.taskImage && (
                  <img
                    src={v.taskImage}
                    alt={"Hình của đề " + v.taskLabel}
                    className="[max-width:100%] [height:auto] rounded-xl"
                    style={{ border: "1.5px solid " + v.t.line }}
                  />
                )}
                {v.taskHint && (
                  <div className="[font-size:14px]" style={{ color: v.t.muted }}>
                    {v.taskHint}
                  </div>
                )}
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
                  maxLength={WRITING_MAX_CHARS}
                  onChange={v.setText}
                  onBlur={v.saveNow}
                  className={v.paperStyleClass}
                  style={v.paperStyle}
                ></textarea>
                {v.warning && (
                  <div
                    role="status"
                    className="[padding:10px_14px] rounded-xl [font-size:14px]"
                    style={{ background: v.t.warnBg, color: v.t.warnFg }}
                  >
                    {v.warning}
                  </div>
                )}
                <div
                  role="status"
                  className="[font-size:13px]"
                  style={{ color: v.t.muted }}
                >
                  {v.saveStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
