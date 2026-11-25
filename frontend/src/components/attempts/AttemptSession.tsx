import {focusAttemptQuestion} from "./focus-question";
import AttemptConfirmation, {
  type ConfirmationKind,
} from "./AttemptConfirmation";
import React, { useEffect, useRef, useState } from "react";
import StartTestDialog from "./StartTestDialog";
import {
  getAuthUser,
  isSigningOut,
  navigate,
  onLogoutElsewhere,
} from "../../lib/auth/auth";
import {
  errorStatus,
  getSkillAttemptTimed,
  type SkillAttemptDetail,
} from "../../lib/attempts/skill-attempts-api";
import {
  estimateOffsetMs,
  resolveClock,
  type ServerAttemptTime,
} from "../../lib/attempts/server-clock";
import "./attempt.css";

export { default as Popup } from "./Popup";
import Popup from "./Popup";

import type { AttemptMode, Snapshot, ScreenProps } from "./types";
import {
  parseAttemptDraft,
  type AttemptOptions,
  type FinishedInfo,
} from "../../lib/attempts/attempt-draft";
import { clampElapsed } from "../../lib/attempts/finish-flow";
import { useAttemptTimer } from "./AttemptTimer";
import {
  purgeRecordings,
  recordingPrefix,
} from "../../lib/attempts/recordings";
import {
  clearAttemptDraft,
  draftKey,
  loadDraft,
  speakingBegan,
  speakingEpoch,
  sweepAttemptStorage,
} from "../../lib/attempts/attempt-storage";
/** Cả 4 kỹ năng lưu draft bền (localStorage, hạn 24 giờ); Speaking còn có bản ghi âm ở IndexedDB. */
function draftStorage(): Storage {
  return localStorage;
}
/** Tự lưu draft Speaking không dày hơn mức này (đổi phase liên tiếp gộp thành một lần ghi). */
const AUTOSAVE_MIN_MS = 1000;
function readDraft(
  key: string,
  skill: string,
  userId: string | undefined,
  examId: string | null,
) {
  const { draft, expired } = loadDraft(key);
  // Draft hết hạn: Speaking bỏ luôn bản ghi âm của đề này, không để giọng nói nằm lại máy.
  if (expired && skill === "Speaking")
    void purgeRecordings(recordingPrefix(userId, examId));
  return draft;
}
/** Giờ Thi thật của draft cũ (chưa lưu mức thời gian). */
const LEGACY_REAL_MINUTES: Record<string, number> = {
  Speaking: 14,
  Listening: 30,
  Writing: 60,
  Reading: 60,
};
/** Trang xác nhận hoàn thành bài Speaking (trang Người học, tên theo tiền tố Student). */
function doneUrl(examId: string | null, extra: Record<string, string>): string {
  const params = new URLSearchParams(extra);
  if (examId) params.set("examId", examId);
  return "StudentAttemptDone?" + params.toString();
}
export interface AttemptResult {
  elapsedSeconds: number;
  mode: AttemptMode;
  limitMinutes: number;
}
export default function AttemptSession({
  page,
  Screen,
  onFinish,
}: {
  page: string;
  Screen: React.ComponentType<ScreenProps>;
  onFinish?: (result: AttemptResult) => void;
}) {
  const skill = page.replace("Test", "");
  const query = new URLSearchParams(location.hash.split("?")[1]);
  const userId = getAuthUser()?.id;
  const examId = query.get("examId");
  const key = draftKey(userId, page, examId);
  const storage = draftStorage();
  const [draft] = useState(() => readDraft(key, skill, userId, examId));
  const [options, setOptions] = useState<AttemptOptions | undefined>(() => {
    if (!draft) return undefined;
    const legacy = draft.options.limitMinutes === undefined;
    return {
      ...draft.options,
      limitMinutes: legacy
        ? draft.options.mode === "real"
          ? (LEGACY_REAL_MINUTES[skill] ?? 0)
          : 0
        : draft.options.limitMinutes,
    };
  });
  // Mốc bắt đầu tính giờ của bài Speaking đã bắt đầu (draft cũ hoặc đặt lúc onBegin).
  const [initialEpoch] = useState(() =>
    draft && skill === "Speaking" && speakingBegan(draft)
      ? speakingEpoch(draft)
      : undefined,
  );
  // Vào lại bài Speaking đã có lượt trên máy chủ: gốc thời gian là startedAt/deadlineAt của máy chủ
  // (nháp sửa được nên chỉ là dự phòng), xem server-clock.ts.
  const serverAttemptId =
    skill === "Speaking" && draft && !draft.finished && initialEpoch !== undefined
      ? draft.state?.speaking?.serverAttemptId
      : undefined;
  const [clock, setClock] = useState<
    "none" | "checking" | "server" | "draft" | "completed" | "gone"
  >(serverAttemptId ? "checking" : "none");
  const clockRef = useRef(clock);
  clockRef.current = clock;
  // Mốc đang dùng cho đồng hồ (đổi khi áp mốc máy chủ) và giới hạn do máy chủ quy định (giây).
  const [epoch, setEpoch] = useState(initialEpoch);
  const [serverLimit, setServerLimit] = useState<number | null>(null);
  const startEpoch = useRef<number | undefined>(initialEpoch);
  const [initialElapsed] = useState(() => {
    if (!draft) return 0;
    if (initialEpoch !== undefined)
      return Math.max(0, Math.floor((Date.now() - initialEpoch) / 1000));
    return draft.options.limitMinutes === undefined &&
      draft.options.mode === "real"
      ? Math.max(0, (LEGACY_REAL_MINUTES[skill] ?? 0) * 60 - draft.seconds)
      : draft.seconds;
  });
  // Vào lại bài Speaking đã hết giờ: hiện hộp hết giờ ngay, không xin micro nữa.
  const [dialog, setDialog] = useState<ConfirmationKind | "start" | "">(() =>
    !draft
      ? "start"
      : // Đang chờ máy chủ: chưa kết luận hết giờ, sẽ quyết định khi có gốc thời gian.
        !serverAttemptId &&
          skill === "Speaking" &&
          (options?.limitMinutes ?? 0) > 0 &&
          initialElapsed >= (options?.limitMinutes ?? 0) * 60
        ? "expired"
        : "",
  );
  const snapshot = useRef<Snapshot>({ state: draft?.state, model: null });
  // Speaking đã Hoàn thành/Lưu nhưng chưa chốt được trên máy chủ: mở lại đề thì sang trang xác nhận.
  const redirectDone = skill === "Speaking" && !!draft?.finished;
  const finishedInfo = useRef<FinishedInfo | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (redirectDone) navigate(doneUrl(examId, {}));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const real = options?.mode === "real";
  // Giới hạn do máy chủ quy định (từ deadlineAt) thắng mức đã chọn trong nháp.
  const limitSeconds = serverLimit ?? (options?.limitMinutes ?? 0) * 60;
  const limitMinutes = Math.ceil(limitSeconds / 60);
  // Speaking kiểm tra micro trước; đồng hồ chỉ chạy khi trang gọi onBegin.
  // Vào lại bài Speaking đã bắt đầu thì đồng hồ chạy ngay (kể cả lúc kiểm tra lại micro).
  const [begun, setBegun] = useState(
    skill !== "Speaking" || (!!draft && speakingBegan(draft)),
  );
  const timer = useAttemptTimer({
    active: !!options && begun && (clock === "none" || clock === "server" || clock === "draft"),
    limitSeconds,
    initialElapsed,
    epoch,
    onExpire: () => setDialog("expired"),
  });
  const elapsedRef = useRef(timer.elapsedSeconds);
  elapsedRef.current = timer.elapsedSeconds;
  const written = ["Writing", "Speaking"].includes(skill);
  useEffect(() => {
    void sweepAttemptStorage();
  }, [skill]);
  useEffect(() => {
    // Speaking không dùng hộp mất mạng: dải ConnectionNotice tự đổi nội dung, bài vẫn chạy.
    if (!options || skill === "Speaking") return;
    function offline() {
      setDialog((current) => (current === "expired" ? current : "offline"));
    }
    function online() {
      setDialog((current) => (current === "offline" ? "" : current));
    }
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, [options, skill]);
  function exit() {
    navigate(
      "ExamDetail" +
        (query.has("examId")
          ? "?examId=" + encodeURIComponent(query.get("examId") || "")
          : ""),
    );
  }
  /** Xóa draft và bản ghi âm đã lưu trên máy của đề này (hoàn thành, hủy, hết hạn). */
  async function clearStored() {
    // Từ đây mọi đường ghi draft (autosave, pagehide, unmount) bị chặn.
    ended.current = true;
    window.clearTimeout(writeTimer.current);
    clearAttemptDraft(userId, page, examId);
    storage.removeItem(key);
    if (skill === "Speaking")
      await purgeRecordings(recordingPrefix(userId, examId));
    // Dọn lại lần cuối, phòng có bản ghi chen vào trong lúc chờ dọn bản ghi âm.
    clearAttemptDraft(userId, page, examId);
    storage.removeItem(key);
  }
  // Sau khi hoàn thành/hủy/lưu thoát: không ghi lại draft nữa (kể cả khi trang còn phát snapshot muộn).
  const ended = useRef(redirectDone);
  const ending = useRef(false);
  const lastWrite = useRef(0);
  // Đã đăng xuất (tab này hoặc tab khác): dữ liệu local đã bị dọn, không ghi lại nữa.
  const loggedOut = useRef(false);
  useEffect(
    () =>
      onLogoutElsewhere((who) => {
        if (who === undefined || who === userId) loggedOut.current = true;
      }),
    [userId],
  );
  const writeTimer = useRef<number | undefined>(undefined);
  /** Ghi draft ngay bây giờ; ném lỗi nếu trình duyệt không lưu được. */
  function writeDraft(force = false) {
    if (!options) return;
    // Đã chốt/hủy: không ghi lại draft (chỉ lần ghi bản `finished` chủ động mới được vượt).
    if (ended.current && !force) return;
    // Phiên đã đổi/đang đăng xuất: không ghi bài của người dùng cũ xuống máy.
    if (loggedOut.current || isSigningOut() || getAuthUser()?.id !== userId)
      throw new Error("Phiên đăng nhập đã thay đổi");
    const now = Date.now();
    const epoch = skill === "Speaking" ? startEpoch.current : undefined;
    storage.setItem(
      key,
      JSON.stringify({
        options,
        // Speaking: giây đã dùng tính tại đúng lúc lưu từ mốc tuyệt đối.
        seconds:
          epoch !== undefined
            ? Math.max(0, Math.floor((now - epoch) / 1000))
            : elapsedRef.current,
        state: snapshot.current.state,
        savedAt: now,
        ...(epoch !== undefined ? { startedAtEpoch: epoch } : {}),
        ...(finishedInfo.current ? { finished: finishedInfo.current } : {}),
      }),
    );
    lastWrite.current = now;
  }
  const writeRef = useRef<() => void>(() => writeDraft());
  writeRef.current = () => writeDraft();
  /**
   * Speaking tự lưu draft mỗi khi vị trí/bản ghi đổi và khi rời trang, để F5,
   * đóng tab hay trình duyệt sập đều vào lại được (Thi thật không lách được bằng F5).
   */
  function autosave(immediate = false) {
    if (
      skill !== "Speaking" ||
      ended.current ||
      startEpoch.current === undefined ||
      !snapshot.current.state?.speaking
    )
      return;
    const wait = immediate
      ? 0
      : lastWrite.current + AUTOSAVE_MIN_MS - Date.now();
    const run = () => {
      window.clearTimeout(writeTimer.current);
      writeTimer.current = undefined;
      if (ended.current) return;
      try {
        writeRef.current();
      } catch {
        // Tự lưu im lặng; lỗi chỉ báo khi người học chủ động Lưu và thoát.
      }
    };
    if (wait <= 0) run();
    else if (writeTimer.current === undefined)
      writeTimer.current = window.setTimeout(run, wait);
  }
  const autosaveRef = useRef(autosave);
  autosaveRef.current = autosave;
  useEffect(() => {
    if (skill !== "Speaking" || !options) return;
    const flushNow = () => autosaveRef.current(true);
    const hidden = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    window.addEventListener("pagehide", flushNow);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flushNow);
      document.removeEventListener("visibilitychange", hidden);
      // Rời trang bằng đường khác (liên kết): chốt lần cuối.
      flushNow();
      window.clearTimeout(writeTimer.current);
    };
  }, [skill, options]);
  // Vào lại bài Speaking đã có lượt trên máy chủ: hỏi máy chủ để lấy gốc thời gian.
  // Chưa hỏi được (mất mạng, lỗi) thì dùng mốc trong nháp, thử lại khi có mạng và áp mốc máy chủ khi hỏi được.
  useEffect(() => {
    if (!serverAttemptId) return;
    let live = true;
    let inFlight = false;
    let retry: number | undefined;
    let giveUp: number | undefined;
    const draftLimit = (options?.limitMinutes ?? 0) * 60;
    const expiredAt = (from: number | undefined, limit: number) =>
      from !== undefined &&
      limit > 0 &&
      Math.floor((Date.now() - from) / 1000) >= limit;
    const stop = () => {
      window.clearTimeout(giveUp);
      window.clearInterval(retry);
      window.removeEventListener("online", check);
    };
    function fallback() {
      if (clockRef.current !== "checking" || retry !== undefined) return;
      setClock("draft");
      if (expiredAt(initialEpoch, draftLimit)) setDialog("expired");
      retry = window.setInterval(() => void check(), 10000);
      window.addEventListener("online", check);
    }
    async function check() {
      if (inFlight || ended.current || clockRef.current === "server") return;
      inFlight = true;
      let server: ServerAttemptTime;
      let offsetMs = 0;
      let detail: SkillAttemptDetail | undefined;
      try {
        const got = await getSkillAttemptTimed(serverAttemptId as string);
        detail = got.detail;
        server = {
          ok: true,
          status: got.detail.status,
          startedAt: got.detail.startedAt,
          deadlineAt: got.detail.deadlineAt,
        };
        offsetMs = estimateOffsetMs({
          sentAt: got.timing.sentAt,
          receivedAt: got.timing.receivedAt,
          dateHeader: got.timing.date,
        });
      } catch (e) {
        server = { ok: false, httpStatus: errorStatus(e) };
      }
      inFlight = false;
      if (!live || ended.current) return;
      const result = resolveClock({
        server,
        draftEpoch: initialEpoch,
        now: Date.now(),
        offsetMs,
      });
      if (result.kind === "completed") {
        // Đã chốt ở thiết bị/tab khác: sang trang xác nhận và dọn nháp, bản ghi trên máy.
        stop();
        setClock("completed");
        const uploaded = (detail?.recordings ?? []).filter(
          (r) => r.status === "UPLOADED",
        ).length;
        await clearStored();
        navigate(
          doneUrl(examId, {
            attempt: serverAttemptId as string,
            elapsed: String(detail?.elapsedSeconds ?? 0),
            answered: String(uploaded),
          }),
        );
      } else if (result.kind === "gone") {
        // Lượt đã bị xóa/hủy: nháp này không còn dùng được, mở lại như bài mới.
        stop();
        setClock("gone");
        await clearStored();
        window.setTimeout(() => location.reload(), 2500);
      } else if (result.kind === "server") {
        stop();
        const first = clockRef.current === "checking";
        startEpoch.current = result.epoch;
        setEpoch(result.epoch);
        if (result.limitSeconds !== null) setServerLimit(result.limitSeconds);
        setClock("server");
        // Lần đầu có gốc thời gian: hết giờ thì mở hộp hết giờ ngay, không xin micro.
        if (first && expiredAt(result.epoch, result.limitSeconds ?? draftLimit))
          setDialog("expired");
      } else if (clockRef.current === "checking") {
        fallback();
      }
    }
    giveUp = window.setTimeout(fallback, 4000);
    void check();
    return () => {
      live = false;
      stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /** Chờ bản ghi đang lưu dở xong và chặn bản ghi mới, để dọn xong không còn bản ghi mồ côi. */
  async function sealRecordings() {
    try {
      await snapshot.current.flush?.({ seal: true });
    } catch {
      // Lưu bản ghi lỗi: vẫn dọn.
    }
  }
  async function finish() {
    if (!options || ending.current) return;
    ending.current = true;
    ended.current = true;
    setBusy(true);
    window.clearTimeout(writeTimer.current);
    await sealRecordings();
    const epoch = startEpoch.current;
    let elapsedSeconds =
      skill === "Speaking" && epoch !== undefined
        ? Math.max(0, Math.floor((Date.now() - epoch) / 1000))
        : timer.elapsedSeconds;
    if (limitSeconds > 0) elapsedSeconds = Math.min(elapsedSeconds, limitSeconds);
    elapsedSeconds = clampElapsed(elapsedSeconds);
    const result: AttemptResult = {
      elapsedSeconds,
      mode: options.mode,
      limitMinutes,
    };
    onFinish?.(result);
    if (skill === "Speaking" && snapshot.current.complete) {
      // Chỉ dọn bản ghi và draft sau khi tải lên đủ và chốt thành công trên máy chủ.
      const reason = dialog === "expired" ? "TIME_UP" : "SUBMITTED";
      const outcome = await snapshot.current.complete({ elapsedSeconds, reason });
      if (outcome.status === "local") {
        // Đề mẫu: không có gì trên máy chủ, dọn máy rồi báo đây là bài làm thử.
        await clearStored();
        navigate(
          doneUrl(examId, {
            sample: "1",
            elapsed: String(elapsedSeconds),
            answered: String(outcome.answered),
          }),
        );
      } else if (outcome.status === "completed") {
        await clearStored();
        navigate(
          doneUrl(examId, {
            attempt: outcome.serverId,
            elapsed: String(outcome.durationSeconds),
            answered: String(outcome.answered),
            ...(outcome.expiredIds.length
              ? { expired: outcome.expiredIds.join(",") }
              : {}),
          }),
        );
      } else {
        // Giữ draft và bản ghi trên máy; trang xác nhận tiếp tục tải lên và chốt ở nền.
        finishedInfo.current = {
          elapsedSeconds,
          reason,
          answered: outcome.answered,
          finishedAt: Date.now(),
          ...(outcome.serverId ? { serverAttemptId: outcome.serverId } : {}),
        };
        try {
          writeDraft(true);
        } catch {
          // Không ghi được draft: bản ghi vẫn còn trong IndexedDB/bộ nhớ của phiên này.
        }
        navigate(doneUrl(examId, { elapsed: String(elapsedSeconds) }));
      }
      return;
    }
    await clearStored();
    navigate(
      written
        ? "MyWS"
        : "ResultLR?skill=" +
            skill.toLowerCase() +
            "&mode=" +
            options.mode +
            "&elapsed=" +
            result.elapsedSeconds,
    );
  }
  async function discard() {
    if (ending.current) return;
    ending.current = true;
    ended.current = true;
    window.clearTimeout(writeTimer.current);
    await sealRecordings();
    // "Không lưu": xóa lượt trên máy chủ (lỗi mạng thì xếp hàng xóa sau) rồi dọn dữ liệu trên máy.
    try {
      await snapshot.current.cancel?.();
    } catch {
      // Không chặn người học thoát.
    }
    await clearStored();
    exit();
  }
  const saving = useRef(false);
  async function save() {
    if (!options || saving.current) return;
    saving.current = true;
    try {
      // Chờ bản ghi âm đang lưu dở (IndexedDB) xong rồi mới chốt draft.
      try {
        await snapshot.current.flush?.();
      } catch {
        // Lưu bản ghi lỗi: draft vẫn ghi; câu thiếu bản ghi sẽ được làm lại khi vào lại.
      }
      writeDraft(true);
      ended.current = true;
      window.clearTimeout(writeTimer.current);
      exit();
    } catch {
      setDialog("saveError");
    } finally {
      saving.current = false;
    }
  }
  if (redirectDone) return null;
  if (clock === "checking" || clock === "completed" || clock === "gone")
    return (
      <div
        role="status"
        className="attempt-sans [padding:40px_32px] text-center [color:var(--attempt-text-706473)]"
      >
        {clock === "gone"
          ? "Bài làm này không còn trên máy chủ (đã hủy hoặc bị xóa). Đang mở lại như bài mới…"
          : clock === "completed"
            ? "Bài làm này đã được hoàn thành ở nơi khác. Đang chuyển sang trang xác nhận…"
            : "Đang đối chiếu giờ làm bài với máy chủ…"}
      </div>
    );
  return (
    <>
      {clock === "draft" && (
        <div
          role="status"
          className="fixed z-50 [bottom:12px] [left:50%] [transform:translateX(-50%)] [max-width:560px] [padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:13px]"
        >
          {
            "Chưa đối chiếu được giờ làm bài với máy chủ nên đồng hồ đang tính theo dữ liệu trên máy này. Khi có kết nối, giờ sẽ được cập nhật theo máy chủ và có thể thay đổi vài giây."
          }
        </div>
      )}
      {options && (
        <Screen
          onSnapshot={(value) => {
            snapshot.current = value;
            autosave();
          }}
          initialState={draft?.state}
          timeText={timer.timeText}
          timeWarn={timer.timeWarn}
          countdown={timer.countdown}
          timeExpired={dialog === "expired"}
          limitMinutes={limitMinutes}
          onBegin={() => {
            if (skill === "Speaking") startEpoch.current ??= Date.now();
            setBegun(true);
            autosave();
          }}
          task={(options.parts[0] ?? 0) + 1}
          selectedParts={options.parts}
          cheDo={
            skill === "Speaking"
              ? real
                ? "Bài thi đầy đủ"
                : "Luyện tập"
              : options.mode
          }
          onExit={() => setDialog("exit")}
          onSubmit={() => setDialog("submit")}
        />
      )}
      {dialog === "start" && (
        <Popup title="Bắt đầu làm bài" onCancel={exit}>
          <StartTestDialog
            skill={
              page === "ReadingTest"
                ? "reading"
                : page === "ListeningTest"
                  ? "listening"
                  : page === "WritingTest"
                    ? "writing"
                    : "speaking"
            }
            title={skill}
            onClose={exit}
            onStart={(mode: AttemptMode, parts: number[], limit: number) => {
              setOptions({ mode, parts, limitMinutes: limit });
              setDialog("");
            }}
          />
        </Popup>
      )}
      {options && dialog && dialog !== "start" && (
        <Popup
          labelledBy="attempt-confirm-title"
          title={skill}
          onCancel={dialog === "expired" ? undefined : () => setDialog("")}
        >
          <AttemptConfirmation
            kind={dialog}
            skill={skill}
            real={real}
            busy={busy}
            memoryOnly={
              snapshot.current.persistent
                ? !snapshot.current.persistent()
                : false
            }
            model={dialog === "submit" ? snapshot.current.model : null}
            back={() => setDialog("")}
            save={save}
            finish={finish}
            discard={discard}
            jump={(n) => {
              setDialog("");
              requestAnimationFrame(()=>focusAttemptQuestion(n));
            }}
          />
        </Popup>
      )}
    </>
  );
}
