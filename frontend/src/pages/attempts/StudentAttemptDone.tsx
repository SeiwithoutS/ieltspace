import { useEffect, useMemo, useRef, useState } from "react";
import AttemptDoneSummary, {
  type DoneRecording,
  type DoneTask,
  type GradingView,
  type UploadView,
} from "../../components/attempts/AttemptDoneSummary";
import DesktopOnly from "../../components/attempts/DesktopOnly";
import WritingTextPopup from "../../components/attempts/WritingTextPopup";
import { ConfirmDialog, Icon } from '../../components/shared/ui';
import { getAttemptSync } from "../../lib/attempts/attempt-sync";
import { clearAttemptDraft, draftKey, loadDraft } from "../../lib/attempts/attempt-storage";
import {
  createDurableRecordingStore,
  purgeRecordings,
  recordingScope,
} from "../../lib/attempts/recordings";
import {
  errorStatus,
  getRecordingUrl,
  getSkillAttempt,
  getGradingRequest,
  requestGrading,
  type SkillAttemptDetail,
} from "../../lib/attempts/skill-attempts-api";
import { compareRecordingIds, recordingLabel } from "../../lib/attempts/recording-files";
import { downloadRecordingsZip, recordingErrorMessage } from "../../lib/attempts/recording-download";
import { downloadWritingDocx, writingContentError } from "../../lib/attempts/writing-download";
import { wsSectionsLabel } from "../../lib/learner/ws-history";
import { cancellationText, formatGradingDate, gradingStatusName, useGradingBalance, type GradingRequest } from '../../lib/grading/grading';
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
  const [detailError, setDetailError] = useState("");
  const [detailRetry, setDetailRetry] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [result, setResult] = useState<{ durationSeconds: number; contentExpiresAt: string | null } | null>(null);
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [upload, setUpload] = useState<UploadView>({ state: "unknown", done: 0, total: 0 });
  // Câu không tải lên được vì quá giờ (từ URL khi đã chốt, từ hàng đợi khi chốt ở nền) và lỗi chốt cố định.
  const [expiredIds, setExpiredIds] = useState<string[]>(() =>
    (query.get("expired") ?? "").split(",").filter(Boolean),
  );
  const [blocked, setBlocked] = useState(false);
  const [grading, setGrading] = useState<GradingView>({ state: "idle" });
  const [gradingRequest, setGradingRequest] = useState<GradingRequest | null>(null);
  const [confirmGrading, setConfirmGrading] = useState(false);
  const balance = useGradingBalance(completed && !sample);
  const retryRef = useRef<() => void>(() => undefined);
  const urls = useRef<string[]>([]);

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
            selectedParts: draft.options.parts,
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

  useEffect(() => {
    return () => {
      urls.current.forEach((u) => URL.revokeObjectURL(u));
      store?.close?.();
    };
  }, [store]);

  // Xác nhận quyền sở hữu và tình trạng của lượt khi mở lại hoặc F5.
  useEffect(() => {
    if (!completed || !serverId) return;
    let active = true;
    setDetailError("");
    getSkillAttempt(serverId)
      .then((d) => {
        if (!active) return;
        if (d.status !== 'COMPLETED' || (d.skill && d.skill !== (writingMode ? 'WRITING' : 'SPEAKING'))) {
          setDetailError('Không tìm thấy bài đã hoàn thành.');
          return;
        }
        setDetail(d);
      })
      .catch((error) => {
        if (active) setDetailError(errorStatus(error) === 404 || errorStatus(error) === 400
          ? 'Không tìm thấy bài đã hoàn thành.' : 'Chưa tải được bài đã hoàn thành.');
      });
    return () => { active = false; };
  }, [completed, serverId, detailRetry, writingMode]);

  useEffect(() => {
    if (!completed || !serverId || sample) return;
    let active = true;
    const refresh = () => getGradingRequest(serverId).then(({ request }) => {
      if (!active) return;
      setGradingRequest(request);
    }).catch(() => undefined);
    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, [completed, serverId, sample]);

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
          if (!stopped) {
            const params = new URLSearchParams(location.hash.split('?')[1]);
            params.set('attempt', outcome.serverId);
            if (outcome.expiredIds.length) params.set('expired', outcome.expiredIds.join(','));
            history.replaceState(history.state, '', '#StudentAttemptDone?' + params.toString());
          }
          clearAttemptDraft(userId, pageName, examId);
          if (!writingMode) await purgeRecordings(recordingScope(userId, examId, sync.clientAttemptId));
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
        .filter((r) => r.status === 'UPLOADED')
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
    } catch (error) {
      throw new Error(recordingErrorMessage(error));
    }
  }

  async function download() {
    if (!serverId || downloading) return;
    setDownloadError("");
    setDownloading(true);
    try {
      if (writingMode) await downloadWritingDocx(serverId, 'Bài Writing');
      else await downloadRecordingsZip(serverId, 'Bài Speaking');
    } catch (error) {
      setDownloadError(writingMode ? writingContentError(error) : recordingErrorMessage(error));
      setDetailRetry(value => value + 1);
    } finally {
      setDownloading(false);
    }
  }

  async function sendGrading() {
    if (!serverId || grading.state === 'sending') return;
    setConfirmGrading(false);
    setGrading({ state: "sending" });
    try {
      const request = await requestGrading(serverId, gradingRequest?.status === 'CANCELLED' ? gradingRequest.id : undefined);
      setGradingRequest(request);
      setGrading({ state: 'idle' });
      setDetailRetry(value => value + 1);
    } catch (e) {
      setGrading({ state: 'error', message: e instanceof Error ? e.message : undefined });
      setDetailRetry(value => value + 1);
    } finally {
      balance.reload();
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
    ? ([1, 2] as const).filter(n => !detail?.sections || detail.sections.includes(n)).map((n) => {
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
  const hasContent = detail && detail.contentStatus !== 'EXPIRED' && detail.contentStatus !== 'DELETED';
  const canViewText = writingMode && !sample && (completed ? !!hasContent : Object.keys(localTexts).length > 0);
  const canDownload = completed && hasContent && !!uploadedCount;
  const pendingRecordings = detail?.recordings.some(row => row.status === 'PENDING');
  const held = detail?.contentStatus === 'HELD';
  const canSend = completed && !!hasContent && !!serverId && !sample && !pendingRecordings &&
    (gradingRequest ? gradingRequest.status === 'CANCELLED' : !held);
  const gradingHint = gradingRequest ? (gradingRequest.status === 'WAITING_ASSIGNMENT'
    ? `Chờ phân công đến ${formatGradingDate(gradingRequest.assignmentDeadline)}.`
    : gradingRequest.status === 'CANCELLED' ? cancellationText(gradingRequest.cancelReason) : gradingStatusName[gradingRequest.status])
    : held ? 'Bài đã được gửi chấm.' : pendingRecordings ? 'Bản ghi chưa tải lên xong.' : undefined;
  const credits = balance.credits;
  const creditHint = balance.error || (credits
    ? `Còn ${credits.free.count} lượt miễn phí, ${credits.bonus.count} lượt bonus.` +
      (credits.free.expiresAt ? ` Lượt miễn phí đặt lại lúc ${formatGradingDate(credits.free.expiresAt)}.` : '') +
      (credits.bonus.expiresAt ? ` Hạn bonus gần nhất là ${formatGradingDate(credits.bonus.expiresAt)}.` : '')
    : undefined);

  return (
    <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-faf9f5)] [font-size:15px] [line-height:1.6] [min-height:100vh] flex items-start justify-center [padding:48px_16px]">
      {completed && !detail ? (
        <div role={detailError ? 'alert' : 'status'} className="attempt-card flex flex-col gap-3">
          <p>{detailError || 'Đang mở bài đã hoàn thành…'}</p>
          {detailError && <button type="button" className="underline" onClick={() => setDetailRetry(value => value + 1)}>Thử lại</button>}
          <button type="button" className="underline" onClick={() => navigate('MyWS')}>Về lịch sử luyện tập</button>
        </div>
      ) : missing ? (
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
          contentStatus={detail?.contentStatus}
          sectionLabel={wsSectionsLabel(writingMode ? 'Writing' : 'Speaking', detail?.sections)}
          recordings={recordings}
          tasks={tasks}
          onViewText={canViewText ? () => setViewText(true) : undefined}
          onDownload={canDownload ? () => void download() : undefined}
          downloading={downloading}
          loadAudio={loadAudio}
          grading={grading}
          onSendGrading={() => setConfirmGrading(true)}
          gradingHint={gradingHint}
          creditHint={creditHint}
          gradingLabel={gradingRequest?.status === 'CANCELLED' ? 'Gửi lại yêu cầu chấm' : undefined}
          notices={downloadError ? [...notices, downloadError] : notices}
          canGrade={canSend}
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
      <ConfirmDialog open={confirmGrading} onClose={() => setConfirmGrading(false)} label="Xác nhận gửi yêu cầu chấm"
        icon={<Icon name="send" size={20} />} title="Gửi yêu cầu chấm" confirmLabel="Gửi yêu cầu"
        confirmDisabled={!canSend} onConfirm={() => void sendGrading()}>
        Bài sẽ dùng 1 lượt hỗ trợ chấm còn hiệu lực. Sau khi gửi, hệ thống có 72 giờ để phân công giáo viên.
      </ConfirmDialog>
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
