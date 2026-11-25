import { useEffect, useMemo, useRef, useState } from "react";
import AttemptDoneSummary, {
  type DoneRecording,
  type DoneTask,
  type GradingView,
  type UploadView,
} from "../../components/attempts/AttemptDoneSummary";
import DesktopOnly from "../../components/attempts/DesktopOnly";
import WritingTextPopup from "../../components/attempts/WritingTextPopup";
import { getAttemptSync } from "../../lib/attempts/attempt-sync";
import { clearAttemptDraft, draftKey, loadDraft } from "../../lib/attempts/attempt-storage";
import {
  createDurableRecordingStore,
  purgeRecordings,
  recordingPrefix,
  recordingScope,
} from "../../lib/attempts/recordings";
import {
  errorCode,
  errorStatus,
  getRecordingUrl,
  getSkillAttempt,
  requestGrading,
  type SkillAttemptDetail,
} from "../../lib/attempts/skill-attempts-api";
import { compareRecordingIds, recordingLabel } from "../../lib/attempts/recording-files";
import { getAuthUser, navigate } from "../../lib/auth/auth";
import { pendingKey, readPendingTexts, toUploadSummary } from "../../lib/attempts/writing-queue";
import { WRITING_DEFAULT_MIN_WORDS, countWords, taskKeyOf, type WritingTaskKey } from "../../lib/attempts/writing-text";

/**
 * Trang xác nhận hoàn thành bài Speaking hoặc Writing (`skill=writing` trên URL). Hai trường hợp:
 * - Đã chốt trên máy chủ: URL có `attempt` (mã lượt), dữ liệu lấy từ máy chủ.
 * - Chưa tải lên/lưu đủ / chưa chốt được: draft còn `finished`, bản ghi (Speaking) hoặc văn bản (Writing)
 *   còn trên máy; trang tiếp tục tải lên/lưu và chốt ở nền, xong mới dọn dữ liệu trên máy.
 */
function partOf(id: string): number {
  const m = /^p(\d+)q/.exec(id);
  return m ? Math.max(0, Number(m[1]) - 1) : 0;
}

function Body() {
  const query = useMemo(() => new URLSearchParams(location.hash.split("?")[1]), []);
  const examId = query.get("examId");
  const userId = getAuthUser()?.id;
  const writingMode = query.get("skill") === "writing";
  const pageName = writingMode ? "WritingTest" : "SpeakingTest";
  const serverParam = query.get("attempt");
  // Bài làm thử với đề mẫu: không có lượt trên máy chủ.
  const sample = query.get("sample") === "1";
  const [draft] = useState(() => loadDraft(draftKey(userId, pageName, examId)).draft);
  const finished = serverParam ? undefined : draft?.finished;
  const progress = writingMode ? draft?.state?.writing : draft?.state?.speaking;
  const clientId = progress?.attemptId;

  const [completed, setCompleted] = useState(!!serverParam);
  const [serverId, setServerId] = useState<string | undefined>(
    serverParam ?? finished?.serverAttemptId ?? progress?.serverAttemptId,
  );
  const [detail, setDetail] = useState<SkillAttemptDetail | null>(null);
  const [result, setResult] = useState<{ durationSeconds: number; contentExpiresAt: string | null } | null>(null);
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [upload, setUpload] = useState<UploadView>({ state: "unknown", done: 0, total: 0 });
  // Câu không tải lên được vì quá giờ (từ URL khi đã chốt, từ hàng đợi khi chốt ở nền) và lỗi chốt cố định.
  const [expiredIds, setExpiredIds] = useState<string[]>(() =>
    (query.get("expired") ?? "").split(",").filter(Boolean),
  );
  const [blocked, setBlocked] = useState(false);
  const [grading, setGrading] = useState<GradingView>({ state: "idle" });
  const retryRef = useRef<() => void>(() => undefined);
  const urls = useRef<string[]>([]);
  const alive = useRef(true);

  const store = useMemo(
    () =>
      clientId && finished && !writingMode
        ? createDurableRecordingStore(recordingScope(userId, examId, clientId))
        : null,
    [clientId, finished, userId, examId, writingMode],
  );
  const sync = useMemo(
    () =>
      clientId && finished && (store || writingMode) && draft
        ? getAttemptSync({
            userId,
            examId,
            clientAttemptId: clientId,
            mode: draft.options.mode,
            limitMinutes: draft.options.limitMinutes ?? 0,
            ...(store ? { store } : {}),
            skill: writingMode ? "WRITING" : "SPEAKING",
            serverId: finished.serverAttemptId ?? progress?.serverAttemptId,
          })
        : null,
    [clientId, finished, store, draft, userId, examId, progress?.serverAttemptId, writingMode],
  );
  // Writing: văn bản còn trên máy (nháp + bản chờ lưu), để xem lại và để lưu nốt.
  const [localTexts] = useState<Partial<Record<WritingTaskKey, string>>>(() => {
    if (!writingMode || !finished || !clientId) return {};
    const pending = readPendingTexts(localStorage, pendingKey(userId, clientId));
    const out: Partial<Record<WritingTaskKey, string>> = {};
    for (const n of [1, 2] as const) {
      const text = pending[taskKeyOf(n)] ?? draft?.state?.texts?.[n] ?? "";
      if (text) out[taskKeyOf(n)] = text;
    }
    return out;
  });
  const [viewText, setViewText] = useState(false);

  // Lượt đã chốt trên máy chủ (URL có mã lượt): dọn draft còn sót của đề này.
  useEffect(() => {
    if (serverParam || sample) clearAttemptDraft(userId, pageName, examId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      urls.current.forEach((u) => URL.revokeObjectURL(u));
      store?.close?.();
    };
  }, [store]);

  // Đã chốt: lấy chi tiết từ máy chủ. Máy chủ lỗi thì trang vẫn hiện số liệu từ URL.
  useEffect(() => {
    if (!completed || !serverId) return;
    getSkillAttempt(serverId)
      .then((d) => alive.current && setDetail(d))
      .catch(() => undefined);
  }, [completed, serverId]);

  // Chưa chốt: dựng hàng đợi từ bản ghi trên máy, tải lên và chốt ở nền.
  useEffect(() => {
    if (completed || !sync || (!store && !writingMode) || !finished) return;
    let stopped = false;
    let running = false;
    const summaryOf = () => (sync.texts ? toUploadSummary(sync.texts.summary()) : sync.summary());
    const refreshView = () => {
      if (stopped) return;
      const s = summaryOf();
      setServerId(sync.serverId);
      setExpiredIds(s.expiredIds);
      const offline = !navigator.onLine;
      setUpload({
        state: !sync.serverId || s.failed > 0 || offline ? "incomplete" : "uploading",
        done: s.done,
        total: s.total,
      });
    };
    async function tryFinalize() {
      if (running || stopped || !sync || (!store && !writingMode) || !finished) return;
      running = true;
      try {
        const outcome = await sync.finish(finished.elapsedSeconds, finished.reason, 20_000);
        // Máy chủ đã chốt thì dọn máy dù người học vừa rời trang (không để draft `finished` nằm lại).
        if (outcome.status === "completed") {
          clearAttemptDraft(userId, pageName, examId);
          if (!writingMode) await purgeRecordings(recordingPrefix(userId, examId));
          clearAttemptDraft(userId, pageName, examId);
        }
        if (stopped) return;
        if (outcome.status === "incomplete" && outcome.permanent) {
          // Máy chủ từ chối cố định: dừng thử lại để khỏi lặp mãi.
          stopped = true;
          setBlocked(true);
          refreshView();
          return;
        }
        if (outcome.status === "completed") {
          setExpiredIds(outcome.expiredIds);
          sync.dispose();
          setResult({
            durationSeconds: outcome.durationSeconds,
            contentExpiresAt: outcome.contentExpiresAt,
          });
          setServerId(outcome.serverId);
          setCompleted(true);
          setUpload({ state: "done", done: summaryOf().done, total: summaryOf().total });
        } else refreshView();
      } finally {
        running = false;
      }
    }
    retryRef.current = () => {
      void (sync.texts ? sync.texts.flush(true) : sync.queue.drain()).then(() => tryFinalize());
      void sync.ensureCreated().then(() => tryFinalize());
    };
    void (async () => {
      if (sync.texts) {
        // Writing: nạp văn bản còn trên máy vào hàng đợi (nếu hàng đợi chưa có), rồi lưu và chốt.
        for (const [key, text] of Object.entries(localTexts) as [WritingTaskKey, string][])
          if (sync.texts.text(key) === undefined) sync.texts.adopt(key, text, false);
        refreshView();
        void tryFinalize();
        return;
      }
      if (!store) return;
      let ids: string[] = [];
      try {
        ids = await store.ids();
      } catch {
        ids = [];
      }
      setLocalIds(ids.sort(compareRecordingIds));
      const known = new Set(sync.queue.items().map((i) => i.questionId));
      for (const id of ids)
        if (!known.has(id))
          sync.queue.enqueue(id, partOf(id), (await store.get(id).catch(() => undefined))?.recordedAt ?? 0);
      refreshView();
      void tryFinalize();
    })();
    const off = sync.subscribe(refreshView);
    const timer = window.setInterval(() => void tryFinalize(), 15_000);
    const online = () => {
      sync.queue.kick();
      sync.texts?.kick();
      void tryFinalize();
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", refreshView);
    return () => {
      stopped = true;
      off();
      window.clearInterval(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", refreshView);
    };
  }, [completed, sync, store, finished, userId, examId, writingMode, localTexts, pageName]);
  const recordings: DoneRecording[] = completed
    ? (detail?.recordings ?? [])
        .map((r) => r.questionId)
        .sort(compareRecordingIds)
        .map((id) => ({ id, label: recordingLabel(id) }))
    : localIds.map((id) => ({ id, label: recordingLabel(id) }));

  async function loadAudio(id: string): Promise<string | null> {
    // Còn bản ghi trên máy thì nghe ngay, không cần tải về.
    if (store) {
      const answer = await store.get(id).catch(() => undefined);
      if (answer) {
        const url = URL.createObjectURL(answer.blob);
        urls.current.push(url);
        return url;
      }
    }
    if (!serverId || !completed) return null;
    try {
      return (await getRecordingUrl(serverId, id)).url;
    } catch {
      return null;
    }
  }

  async function sendGrading() {
    if (!serverId) return;
    setGrading({ state: "sending" });
    try {
      await requestGrading(serverId);
      setGrading({ state: "sent" });
    } catch (e) {
      if (errorStatus(e) === 501 || errorCode(e) === "GRADING_NOT_AVAILABLE")
        setGrading({ state: "unavailable" });
      else
        setGrading({
          state: "error",
          message: e instanceof Error && e.message ? e.message : undefined,
        });
    }
  }

  const num = (key: string) => {
    const value = Number(query.get(key));
    return query.get(key) !== null && Number.isFinite(value) && value >= 0 ? value : null;
  };
  const elapsed =
    detail?.elapsedSeconds ??
    result?.durationSeconds ??
    finished?.elapsedSeconds ??
    num("elapsed");
  const uploadedCount = writingMode
    ? detail?.tasks?.filter((t) => t.wordCount > 0).length
    : detail?.recordings.filter((r) => r.status === "UPLOADED").length;
  const answered = completed
    ? (uploadedCount ?? num("answered"))
    : sample
      ? num("answered")
    : (finished?.answered ?? localIds.length);
  const uploadView: UploadView = completed
    ? {
        state: "done",
        done: uploadedCount ?? upload.done,
        total: uploadedCount ?? upload.total,
      }
    : sample
      ? { state: "local", done: 0, total: 0 }
      : upload;
  const missing = !completed && !finished && !sample;
  const notices: string[] = [];
  if (sample)
    notices.push(
      writingMode
        ? "Đây là bài làm thử với đề mẫu, không lưu lên máy chủ và không gửi chấm được."
        : "Đây là bài làm thử với đề mẫu, không lưu lên máy chủ. Bản ghi chỉ ở trên máy này và không gửi chấm được.",
    );
  for (const id of expiredIds)
    notices.push(
      writingMode
        ? (id === "task1" ? "Task 1" : "Task 2") + " không lưu lên được vì quá giờ nhận bài."
        : recordingLabel(id) + " không tải lên được vì quá giờ.",
    );
  if (blocked)
    notices.push(
      "Máy chủ không nhận việc chốt bài này nên hệ thống đã dừng thử lại. " +
        (writingMode ? "Bài viết" : "Bản ghi") +
        " vẫn còn trên máy; hãy liên hệ hỗ trợ nếu cần.",
    );

  // Writing: số từ từng Task (từ máy chủ khi đã chốt, từ bản trên máy khi chưa).
  const tasks: DoneTask[] | undefined = writingMode && !(completed && !detail)
    ? ([1, 2] as const).map((n) => {
        const key = taskKeyOf(n);
        const server = completed ? detail?.tasks?.find((t) => t.taskKey === key) : undefined;
        return {
          key,
          label: "Task " + n,
          words: server ? server.wordCount : countWords(localTexts[key] ?? ""),
          minWords: WRITING_DEFAULT_MIN_WORDS[n],
        };
      })
    : undefined;
  const canViewText = writingMode && !sample && (completed ? !!serverId : Object.keys(localTexts).length > 0);

  return (
    <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-faf9f5)] [font-size:15px] [line-height:1.6] [min-height:100vh] flex items-start justify-center [padding:48px_16px]">
      {missing ? (
        <div role="status" className="[padding:40px_32px] text-center [color:var(--attempt-text-706473)]">
          {"Không tìm thấy bài làm cần xác nhận. "}
          <button type="button" className="underline" onClick={() => navigate("StudentHome")}>
            {"Về trang chủ"}
          </button>
        </div>
      ) : (
        <AttemptDoneSummary
          skill={writingMode ? "Writing" : "Speaking"}
          elapsedSeconds={elapsed}
          answered={answered}
          upload={uploadView}
          onRetryUpload={() => retryRef.current()}
          expiresAt={detail?.contentExpiresAt ?? result?.contentExpiresAt ?? null}
          recordings={recordings}
          tasks={tasks}
          onViewText={canViewText ? () => setViewText(true) : undefined}
          loadAudio={loadAudio}
          grading={grading}
          onSendGrading={() => void sendGrading()}
          notices={notices}
          canGrade={completed && !!serverId && !sample}
          onHome={() => navigate("StudentHome")}
          onHistory={() => navigate("MyWS")}
        />
      )}
      {viewText && (
        <WritingTextPopup
          title={"Bài Writing vừa hoàn thành"}
          {...(completed && serverId ? { attemptId: serverId } : { texts: localTexts })}
          onClose={() => setViewText(false)}
        />
      )}
    </div>
  );
}

export default function StudentAttemptDone() {
  return (
    <DesktopOnly>
      <Body />
    </DesktopOnly>
  );
}
