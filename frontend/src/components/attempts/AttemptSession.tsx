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
import "./attempt.css";

export { default as Popup } from "./Popup";
import Popup from "./Popup";

import type { AttemptMode, Snapshot, ScreenProps } from "./types";
import {
  parseAttemptDraft,
  type AttemptOptions,
} from "../../lib/attempts/attempt-draft";
import { useAttemptTimer } from "./AttemptTimer";
import {
  purgeRecordings,
  recordingPrefix,
} from "../../lib/attempts/recordings";
import {
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
      : skill === "Speaking" &&
          (options?.limitMinutes ?? 0) > 0 &&
          initialElapsed >= (options?.limitMinutes ?? 0) * 60
        ? "expired"
        : "",
  );
  const snapshot = useRef<Snapshot>({ state: draft?.state, model: null });
  const real = options?.mode === "real";
  const limitMinutes = options?.limitMinutes ?? 0;
  // Speaking kiểm tra micro trước; đồng hồ chỉ chạy khi trang gọi onBegin.
  // Vào lại bài Speaking đã bắt đầu thì đồng hồ chạy ngay (kể cả lúc kiểm tra lại micro).
  const [begun, setBegun] = useState(
    skill !== "Speaking" || (!!draft && speakingBegan(draft)),
  );
  const timer = useAttemptTimer({
    active: !!options && begun,
    limitSeconds: limitMinutes * 60,
    initialElapsed,
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
    storage.removeItem(key);
    if (skill === "Speaking")
      await purgeRecordings(recordingPrefix(userId, examId));
  }
  // Sau khi hoàn thành/hủy/lưu thoát: không ghi lại draft nữa (kể cả khi trang còn phát snapshot muộn).
  const ended = useRef(false);
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
  function writeDraft() {
    if (!options) return;
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
      }),
    );
    lastWrite.current = now;
  }
  const writeRef = useRef(writeDraft);
  writeRef.current = writeDraft;
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
    window.clearTimeout(writeTimer.current);
    await sealRecordings();
    const result: AttemptResult = {
      elapsedSeconds: timer.elapsedSeconds,
      mode: options.mode,
      limitMinutes,
    };
    onFinish?.(result);
    // TODO: Speaking cần tải bản ghi lên server (idempotent theo khóa câu) và mở AttemptDone
    // trước khi dọn; chưa có API nên bản ghi bị xóa ở đây.
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
      writeDraft();
      ended.current = true;
      window.clearTimeout(writeTimer.current);
      exit();
    } catch {
      setDialog("saveError");
    } finally {
      saving.current = false;
    }
  }
  return (
    <>
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
