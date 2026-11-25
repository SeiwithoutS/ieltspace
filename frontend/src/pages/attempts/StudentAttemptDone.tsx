import { useEffect, useMemo, useRef, useState } from "react";
import AttemptDoneSummary, {
  type DoneRecording,
  type GradingView,
  type UploadView,
} from "../../components/attempts/AttemptDoneSummary";
import DesktopOnly from "../../components/attempts/DesktopOnly";
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
import { getAuthUser, navigate } from "../../lib/auth/auth";

/**
 * Trang xác nhận hoàn thành bài Speaking. Hai trường hợp:
 * - Đã chốt trên máy chủ: URL có `attempt` (mã lượt), dữ liệu lấy từ máy chủ.
 * - Chưa tải lên đủ / chưa chốt được: draft còn `finished`, bản ghi còn trên máy; trang tiếp tục
 *   tải lên và chốt ở nền, xong mới dọn dữ liệu trên máy.
 */
function labelOf(id: string): string {
  const m = /^p(\d+)q(\d+)$/.exec(id);
  if (!m) return id;
  return Number(m[1]) === 2 ? "Part 2" : "Part " + m[1] + " · Câu " + (Number(m[2]) + 1);
}
function partOf(id: string): number {
  const m = /^p(\d+)q/.exec(id);
  return m ? Math.max(0, Number(m[1]) - 1) : 0;
}
const orderOf = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

function Body() {
  const query = useMemo(() => new URLSearchParams(location.hash.split("?")[1]), []);
  const examId = query.get("examId");
  const userId = getAuthUser()?.id;
  const serverParam = query.get("attempt");
  // Bài làm thử với đề mẫu: không có lượt trên máy chủ.
  const sample = query.get("sample") === "1";
  const [draft] = useState(() => loadDraft(draftKey(userId, "SpeakingTest", examId)).draft);
  const finished = serverParam ? undefined : draft?.finished;
  const progress = draft?.state?.speaking;
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
      clientId && finished
        ? createDurableRecordingStore(recordingScope(userId, examId, clientId))
        : null,
    [clientId, finished, userId, examId],
  );
  const sync = useMemo(
    () =>
      clientId && finished && store && draft
        ? getAttemptSync({
            userId,
            examId,
            clientAttemptId: clientId,
            mode: draft.options.mode,
            limitMinutes: draft.options.limitMinutes ?? 0,
            store,
            serverId: finished.serverAttemptId ?? progress?.serverAttemptId,
          })
        : null,
    [clientId, finished, store, draft, userId, examId, progress?.serverAttemptId],
  );

  // Lượt đã chốt trên máy chủ (URL có mã lượt): dọn draft còn sót của đề này.
  useEffect(() => {
    if (serverParam || sample) clearAttemptDraft(userId, "SpeakingTest", examId);
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
    if (completed || !sync || !store || !finished) return;
    let stopped = false;
    let running = false;
    const refreshView = () => {
      if (stopped) return;
      const s = sync.summary();
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
      if (running || stopped || !sync || !store || !finished) return;
      running = true;
      try {
        const outcome = await sync.finish(finished.elapsedSeconds, finished.reason, 20_000);
        // Máy chủ đã chốt thì dọn máy dù người học vừa rời trang (không để draft `finished` nằm lại).
        if (outcome.status === "completed") {
          clearAttemptDraft(userId, "SpeakingTest", examId);
          await purgeRecordings(recordingPrefix(userId, examId));
          clearAttemptDraft(userId, "SpeakingTest", examId);
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
          setUpload({ state: "done", done: sync.summary().done, total: sync.summary().total });
        } else refreshView();
      } finally {
        running = false;
      }
    }
    retryRef.current = () => {
      void sync.queue.drain().then(() => tryFinalize());
      void sync.ensureCreated().then(() => tryFinalize());
    };
    void (async () => {
      let ids: string[] = [];
      try {
        ids = await store.ids();
      } catch {
        ids = [];
      }
      setLocalIds(ids.sort(orderOf));
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
  }, [completed, sync, store, finished, userId, examId]);
  const recordings: DoneRecording[] = completed
    ? (detail?.recordings ?? [])
        .map((r) => r.questionId)
        .sort(orderOf)
        .map((id) => ({ id, label: labelOf(id) }))
    : localIds.map((id) => ({ id, label: labelOf(id) }));

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
  const uploadedCount = detail?.recordings.filter((r) => r.status === "UPLOADED").length;
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
    notices.push("Đây là bài làm thử với đề mẫu, không lưu lên máy chủ. Bản ghi chỉ ở trên máy này và không gửi chấm được.");
  for (const id of expiredIds)
    notices.push(labelOf(id) + " không tải lên được vì quá giờ.");
  if (blocked)
    notices.push("Máy chủ không nhận việc chốt bài này nên hệ thống đã dừng thử lại. Bản ghi vẫn còn trên máy; hãy liên hệ hỗ trợ nếu cần.");

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
          skill="Speaking"
          elapsedSeconds={elapsed}
          answered={answered}
          upload={uploadView}
          onRetryUpload={() => retryRef.current()}
          expiresAt={detail?.contentExpiresAt ?? result?.contentExpiresAt ?? null}
          recordings={recordings}
          loadAudio={loadAudio}
          grading={grading}
          onSendGrading={() => void sendGrading()}
          notices={notices}
          canGrade={completed && !!serverId && !sample}
          onHome={() => navigate("StudentHome")}
          onHistory={() => navigate("MyWS")}
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
