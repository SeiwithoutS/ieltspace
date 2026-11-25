import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import ConnectionNotice from "../../components/attempts/ConnectionNotice";
import MicCheck from "../../components/attempts/MicCheck";
import QuestionCard from "../../components/attempts/QuestionCard";
import RecorderControl from "../../components/attempts/RecorderControl";
import type { ScreenProps } from "../../components/attempts/types";
import { speakingTestSample } from "../../data/speaking-test.sample";
import type { SpeakingEditorState } from "../../lib/exams/exam-editor";
import { getAttemptSync, loadSpeakingTest } from "../../lib/attempts/attempt-sync";
import { micErrorMessage, requestMicStream, stopStream, streamIsLive } from "../../lib/attempts/mic";
import {
  getAuthUser,
  isSigningOut,
  onLogoutElsewhere,
} from "../../lib/auth/auth";
import { draftKey, loadDraft } from "../../lib/attempts/attempt-storage";
import {
  createDurableRecordingStore,
  purgeRecordingsExcept,
  recordingPrefix,
  recordingScope,
  type RecordedAnswer,
} from "../../lib/attempts/recordings";
import {
  buildSpeakingSteps,
  canNext,
  expireFlow,
  initFlow,
  keepOld,
  micLostFlow,
  nextStep,
  partProgress,
  rearmFlow,
  rerecord,
  restoreFlowDetailed,
  resumeFlow,
  skipPrep,
  startRecording,
  stopRecording,
  tickFlow,
  type FlowState,
} from "../../lib/attempts/speaking-flow";
import { useEffect, useMemo, useRef, useState } from "react";

function newAttemptId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
/** Quyền micro còn "granted" thì xin stream không hiện hộp hỏi; không thì trả null (cần kiểm tra micro). */
async function silentMicStream(): Promise<MediaStream | null> {
  try {
    const status = await navigator.permissions?.query({
      name: "microphone" as PermissionName,
    });
    if (status?.state !== "granted") return null;
    const next = await requestMicStream();
    return streamIsLive(next) ? next : null;
  } catch {
    return null;
  }
}

const chipBase =
  "inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:13px] font-semibold whitespace-nowrap";
const headerButton =
  "inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border font-semibold [font-size:14px] no-underline whitespace-nowrap";

/** Lấy đề từ máy chủ; lỗi hoặc chưa có backend thì dùng đề mẫu như trước (không chặn người học). */
export default function SpeakingTest(props: ScreenProps) {
  const [test, setTest] = useState<SpeakingEditorState | null>(null);
  // Rơi về đề mẫu: bài chỉ làm cục bộ, không tạo lượt và không tải lên máy chủ.
  const [offlineSample, setOfflineSample] = useState(false);
  useEffect(() => {
    let live = true;
    const examId = new URLSearchParams(location.hash.split("?")[1]).get("examId");
    void loadSpeakingTest(examId).then((loaded) => {
      if (!live) return;
      setOfflineSample(!loaded);
      setTest(loaded ?? speakingTestSample);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!test)
    return (
      <div
        role="status"
        className="attempt-sans [padding:40px_32px] text-center [color:var(--attempt-text-706473)]"
      >
        {"Đang tải đề…"}
      </div>
    );
  return <SpeakingRun {...props} test={test} offlineSample={offlineSample} />;
}

function SpeakingRun({
  test,
  offlineSample = false,
  limitMinutes = 0,
  initialState,
  timeText,
  timeExpired = false,
  timeWarn = false,
  countdown = false,
  cheDo = "Bài thi đầy đủ",
  selectedParts,
  accent = "#2963CC",
  onExit,
  onSubmit,
  onBegin,
  onSnapshot,
}: ScreenProps & { test: SpeakingEditorState; offlineSample?: boolean }) {
  const onAccent = accentForeground(accent);
  const mode = cheDo === "Luyện tập" ? "practice" : "real";
  const practice = mode === "practice";
  const steps = useMemo(
    () =>
      buildSpeakingSteps(
        test,
        selectedParts && selectedParts.length > 0 ? selectedParts : [0, 1, 2],
      ),
    [test, selectedParts],
  );
  const saved = initialState?.speaking;
  const [flow, setFlow] = useState<FlowState>(() => initFlow(steps));
  // Micro đã qua kiểm tra; có stream nghĩa là đã vào làm bài.
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [answers, setAnswers] = useState<Record<string, RecordedAnswer>>({});
  // Vào lại bài đã lưu thì chờ nạp bản ghi từ IndexedDB rồi mới hiện câu hỏi.
  const [loading, setLoading] = useState(!!saved);
  const [attemptId] = useState(() => saved?.attemptId ?? newAttemptId());
  const userId = getAuthUser()?.id;
  const examId = new URLSearchParams(location.hash.split("?")[1]).get("examId");
  // Bản ghi lưu qua RecordingStore: IndexedDB (bền qua đóng tab), lỗi thì giữ trong bộ nhớ.
  const [store] = useState(() =>
    createDurableRecordingStore(recordingScope(userId, examId, attemptId)),
  );
  // Đồng bộ với máy chủ: tạo lượt làm, tải bản ghi ở nền, chốt khi Hoàn thành. Lỗi mạng không chặn bài.
  const [sync] = useState(() =>
    getAttemptSync({
      userId,
      examId,
      clientAttemptId: attemptId,
      mode,
      limitMinutes,
      store,
      offlineSample,
      serverId: saved?.serverAttemptId,
    }),
  );
  const partOf = (id: string) => steps.find((st) => st.id === id)?.part ?? 0;
  /** Bắt đầu làm bài (sau kiểm tra micro hoặc khi vào lại): tạo lượt trên máy chủ, không chờ. */
  function begin() {
    void sync.ensureCreated().then((id) => {
      if (id && alive.current) emitSnapshot();
    });
    onBegin?.();
  }
  // Các câu đã có bản ghi (cập nhật ngay, không chờ render) và các lần lưu đang chạy.
  const answeredIds = useRef(new Set<string>());
  const pendingPuts = useRef(new Set<Promise<unknown>>());
  const flowRef = useRef(flow);
  flowRef.current = flow;
  const armed = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  streamRef.current = stream;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const alive = useRef(true);
  // Dừng ngay lần ghi đang chạy (do RecorderControl đăng ký) để Lưu và thoát giữ được phần đang nói.
  const flushRecorder = useRef<(() => Promise<void>) | null>(null);
  // Đã kết thúc bài (Hoàn thành/Hủy): không nhận thêm bản ghi, để dọn kho xong không còn bản ghi mồ côi.
  const sealed = useRef(false);
  // Đã đăng xuất (tab này hoặc tab khác): kho bản ghi vừa bị dọn, không ghi lại nữa.
  const loggedOut = useRef(false);
  useEffect(
    () =>
      onLogoutElsewhere((who) => {
        if (who === undefined || who === userId) loggedOut.current = true;
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const canWrite = () =>
    !loggedOut.current && !isSigningOut() && getAuthUser()?.id === userId;
  const expiredRef = useRef(timeExpired);
  expiredRef.current = timeExpired;
  // Báo cho người học khi vào lại mà một số bản ghi không còn.
  const [restoreNote, setRestoreNote] = useState("");
  useEffect(() => {
    alive.current = true;
    if (!saved) {
      // Bài mới: bỏ bản ghi sót của lượt khác trên đề này (đã thoát mà không lưu), nhưng giữ lượt
      // mà draft còn hạn đang trỏ tới (tab khác). Draft còn hạn mà không rõ lượt nào thì không dọn.
      const live = loadDraft(draftKey(userId, "SpeakingTest", examId)).draft;
      const liveAttempt = live?.state?.speaking?.attemptId;
      if (!live || liveAttempt) {
        const mine = recordingScope(userId, examId, attemptId);
        const other = liveAttempt
          ? recordingScope(userId, examId, liveAttempt)
          : null;
        void purgeRecordingsExcept(
          recordingPrefix(userId, examId),
          (scope) => scope === mine || scope === other,
        );
      }
      // Mở kho sớm để biết ngay IndexedDB có dùng được không (cảnh báo khi thoát).
      void store
        .ids()
        .catch(() => undefined)
        .then(() => alive.current && emitSnapshot());
    } else {
      void (async () => {
        const found: Record<string, RecordedAnswer> = {};
        try {
          for (const id of await store.ids()) {
            if (!steps.some((st) => st.id === id)) {
              // Bản ghi của câu không còn trong bài đang làm: bỏ.
              void store.remove(id).catch(() => undefined);
              continue;
            }
            // Bản ghi chỉ được ghi vào kho khi câu đã dừng, nên mọi bản ghi còn lại là câu đã xong
            // (kể cả câu xong sau lần lưu draft cuối): giữ, Thi thật không ghi lại được bằng F5.
            const answer = await store.get(id);
            if (answer && answer.blob.size > 0) found[id] = answer;
          }
        } catch {
          // Không đọc được kho: coi như chưa có bản ghi nào, các câu sẽ được làm lại.
        }
        const lostSteps = steps.filter(
          (st) => saved.answered.includes(st.id) && !found[st.id],
        );
        // Đã hết giờ thì không mở micro nữa (hộp hết giờ đang chờ người học chọn Lưu/Không lưu).
        let mic = expiredRef.current ? null : await silentMicStream();
        if (!alive.current) {
          stopStream(mic);
          return;
        }
        if (mic && expiredRef.current) {
          stopStream(mic);
          mic = null;
        }
        answeredIds.current = new Set(Object.keys(found));
        setAnswers(found);
        // Đối chiếu với máy chủ rồi xếp hàng tải các bản ghi chưa lên.
        const versions: Record<string, number> = {};
        for (const [id, a] of Object.entries(found)) versions[id] = a.recordedAt;
        void sync.reconcile(versions).finally(() => {
          for (const [id, a] of Object.entries(found))
            sync.queue.enqueue(id, partOf(id), a.recordedAt);
        });
        const restored = restoreFlowDetailed(
          steps,
          saved,
          Object.keys(found),
          Date.now(),
          mode,
        );
        setFlow(restored.flow);
        const notes: string[] = [];
        if (restored.closedId) {
          const closed = steps.find((st) => st.id === restored.closedId);
          const partNo = closed ? "Part " + (closed.part + 1) + ": " : "";
          notes.push(
            found[restored.closedId]
              ? partNo +
                  "phần bạn đang nói dở được giữ làm đáp án của câu đó. Bài thi đầy đủ không cho ghi lại."
              : closed?.kind === "cue"
                ? partNo +
                  "bài nói đang ghi dở chưa có bản ghi nào nên được tính là để trống. Bài thi đầy đủ không cho ghi lại."
                : partNo +
                  "câu bạn đang làm dở đã được tính là đã xem và để trống. Bài thi đầy đủ không cho ghi lại.",
          );
        }
        if (lostSteps.length > 0) {
          const partsOf = (list: typeof lostSteps) =>
            [...new Set(list.map((st) => "Part " + (st.part + 1)))].join(", ");
          if (practice)
            notes.push(
              "Một số bản ghi âm (" +
                partsOf(lostSteps) +
                ") không còn trên máy này. Bạn sẽ ghi lại từ câu bị thiếu đầu tiên.",
            );
          else {
            const blank = lostSteps.filter((st) => st.kind === "qs");
            const cue = lostSteps.filter((st) => st.kind === "cue");
            if (blank.length)
              notes.push(
                "Bản ghi âm của " +
                  partsOf(blank) +
                  " không còn trên máy này; các câu đó được tính là để trống.",
              );
            if (cue.length)
              notes.push(
                "Bản ghi âm của " +
                  partsOf(cue) +
                  " không còn trên máy này; bạn sẽ làm lại từ phần chuẩn bị.",
              );
          }
        }
        if (notes.length) setRestoreNote(notes.join(" "));
        if (mic) {
          setStream(mic);
          begin();
        }
        setLoading(false);
      })();
    }
    return () => {
      alive.current = false;
      stopStream(streamRef.current);
      store.close?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Micro bị rút/ngắt giữa bài: nghe track "ended"; micError là lý do hiện cho người học.
  const [micLost, setMicLost] = useState(false);
  const [micError, setMicError] = useState("");
  useEffect(() => {
    if (!stream) return;
    const tracks = stream.getAudioTracks();
    const lost = () => {
      setMicError("Micro đã bị ngắt. Hãy bật lại micro.");
      setMicLost(true);
    };
    if (!streamIsLive(stream)) lost();
    tracks.forEach((t) => t.addEventListener("ended", lost));
    return () => tracks.forEach((t) => t.removeEventListener("ended", lost));
  }, [stream]);
  // Đang ghi mà mất micro thì dừng ở phase "micLost", không ghi rỗng trong im lặng.
  useEffect(() => {
    if (micLost && flow.phase === "recording") setFlow(micLostFlow);
  }, [micLost, flow.phase]);

  // Bắt đầu đếm từ lúc vào làm bài (không tính thời gian kiểm tra micro).
  useEffect(() => {
    if (!stream || armed.current) return;
    armed.current = true;
    setFlow((current) => rearmFlow(current, steps));
  }, [stream, steps]);

  const step = steps[flow.index];
  const ticking =
    !!stream &&
    !timeExpired &&
    (flow.phase === "preparing" ||
      flow.phase === "viewing" ||
      flow.phase === "recording");
  useEffect(() => {
    if (!ticking) return;
    // Nhịp dày hơn 1 giây; số giây tính theo giờ thật nên không lệch khi tab bị làm chậm.
    const timer = setInterval(
      () => setFlow((current) => tickFlow(current, steps, mode)),
      250,
    );
    return () => clearInterval(timer);
  }, [ticking, steps, mode]);
  useEffect(() => {
    if (timeExpired) setFlow(expireFlow);
  }, [timeExpired]);

  // Vị trí và câu đã ghi cho phiên làm bài; blob nằm trong IndexedDB, không đi qua snapshot/draft.
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;
  /** Việc dùng cho Lưu và thoát, Hoàn thành, Không lưu; có sẵn cả khi đang khôi phục hoặc chờ kiểm tra micro. */
  function hooks() {
    return {
      // Lưu và thoát / kết thúc: chờ bản ghi đang dừng và đang lưu vào kho xong rồi chốt danh sách câu đã ghi.
      flush: async (options?: { seal?: boolean }) => {
        // Kết thúc bài: từ đây không nhận bản ghi mới (bản đang ghi dở bị bỏ cùng bài).
        if (options?.seal) sealed.current = true;
        else if (
          flushRecorder.current &&
          !practice &&
          steps[flowRef.current.index]
        ) {
          // Thi thật, Lưu và thoát giữa lúc đang ghi (mọi Part, kể cả Part 2 đã qua chuẩn bị): dừng ghi và
          // giữ phần đã nói làm bản ghi của câu. Part 2 còn chuẩn bị không có recorder nên không vào đây.
          // Practice giữ luật cũ (bỏ phần ghi dở, về đầu câu).
          await flushRecorder.current();
          flowRef.current = stopRecording(flowRef.current);
          setFlow(stopRecording);
        }
        await settle();
        emitSnapshot();
      },
      persistent: () => store.persistent(),
      // Hoàn thành/Lưu: tải hết bản ghi còn lại rồi chốt trên máy chủ. Chỉ "completed" mới cho dọn dữ liệu máy.
      complete: async (input: {
        elapsedSeconds: number;
        reason: "SUBMITTED" | "TIME_UP";
      }) => {
        let ids: string[] = [];
        try {
          ids = (await store.ids()).filter((id) => steps.some((st) => st.id === id));
        } catch {
          ids = [...answeredIds.current];
        }
        const known = new Set(sync.queue.items().map((i) => i.questionId));
        for (const id of ids)
          if (!known.has(id))
            sync.queue.enqueue(
              id,
              partOf(id),
              (await store.get(id).catch(() => undefined))?.recordedAt ?? 0,
            );
        if (offlineSample) return { status: "local" as const, answered: ids.length };
        const outcome = await sync.finish(input.elapsedSeconds, input.reason);
        const skipped =
          outcome.status === "completed" ? outcome.expiredIds.length : 0;
        return { ...outcome, answered: ids.length - skipped };
      },
      cancel: () => sync.cancel(),
    };
  }
  function emitSnapshot() {
    // Đang khôi phục hoặc vào lại bài mà chưa qua kiểm tra micro: chưa ghi đè vị trí đã lưu
    // (F5 tiếp ở màn kiểm tra micro không làm mất thêm câu nào), nhưng vẫn cho Hoàn thành/Không lưu
    // (vd hết giờ khi đang khôi phục) đi đúng đường tải lên.
    if (loading || (saved && !streamRef.current)) {
      onSnapshotRef.current?.({ state: initialState, model: null, ...hooks() });
      return;
    }
    const current = flowRef.current;
    const began = !!streamRef.current || !!saved;
    const at = steps[current.index];
    onSnapshotRef.current?.({
      state: {
        ...initialState,
        current: current.index,
        ...(began
          ? {
              speaking: {
                attemptId,
                stepId: at?.id ?? "",
                index: current.index,
                phase: current.phase,
                answered: [...answeredIds.current],
                ...(sync.serverId && !offlineSample
                  ? { serverAttemptId: sync.serverId }
                  : {}),
              },
            }
          : {}),
      },
      model: {
        questions: steps.map((st, i) => ({
          n: i + 1,
          value:
            answeredIds.current.has(st.id) || answersRef.current[st.id]
              ? "đã ghi âm"
              : "",
        })),
      },
      ...hooks(),
    });
  }
  useEffect(() => {
    emitSnapshot();
  }, [flow.index, flow.phase, answers, steps, loading, stream]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Theo dõi một tác vụ lưu/dừng ghi âm để Lưu và thoát chờ đúng. */
  function track(job: Promise<unknown>) {
    pendingPuts.current.add(job);
    void job.finally(() => pendingPuts.current.delete(job));
  }
  /** Chờ mọi tác vụ đang chạy (kể cả cái mới sinh ra trong lúc chờ), tối đa vài giây phòng recorder treo. */
  async function settle() {
    const deadline = Date.now() + 5000;
    while (pendingPuts.current.size > 0 && Date.now() < deadline) {
      await Promise.race([
        Promise.all([...pendingPuts.current]),
        new Promise((resolve) =>
          setTimeout(resolve, Math.max(0, deadline - Date.now())),
        ),
      ]);
    }
  }
  function handleRecorded(id: string, answer: RecordedAnswer) {
    // Bài đã kết thúc hoặc trang đã rời đi: bỏ, không ghi vào kho vừa dọn.
    if (sealed.current || !alive.current || !canWrite()) return;
    const job = store
      .put(id, answer)
      .then(() => {
        if (sealed.current || !alive.current || !canWrite()) return;
        // Chỉ tính vào danh sách câu đã ghi (draft) sau khi lưu xong; kho rơi về bộ nhớ thì
        // bản ghi vẫn nghe lại được trong phiên này nhưng không khôi phục được sau khi tải lại.
        if (store.persistent()) answeredIds.current.add(id);
        setAnswers((current) => ({ ...current, [id]: answer }));
        // Tải lên ở nền ngay khi ghi xong; chưa có mạng thì giữ trong hàng đợi.
        sync.queue.enqueue(id, partOf(id), answer.recordedAt);
      })
      .catch(() => undefined);
    track(job);
  }
  function handleStart() {
    // Ghi lại: bản cũ được giữ đến khi bản mới ghi đè (bản mới lỗi thì vẫn còn bản cũ).
    setFlow((current) => startRecording(current, mode));
  }
  function handleFail(message: string) {
    setMicError(message);
    setMicLost(true);
  }
  async function restoreMic() {
    try {
      const next = await requestMicStream();
      if (!alive.current) {
        stopStream(next);
        return;
      }
      stopStream(streamRef.current);
      setStream(next);
      setMicLost(false);
      setMicError("");
      const id = step?.id;
      const hasAnswer = !!id && !!answersRef.current[id];
      setFlow((current) => resumeFlow(current, mode, hasAnswer));
    } catch (e) {
      if (alive.current) setMicError(micErrorMessage(e));
    }
  }

  const progress = partProgress(steps, flow);
  const last = flow.index >= steps.length - 1;
  // Practice: ghi xong mà chưa có bản ghi hợp lệ thì chưa cho sang câu khác.
  const nextEnabled =
    canNext(flow, mode) &&
    !timeExpired &&
    !(practice && flow.phase === "answered" && !(step && answers[step.id]));
  // Cảnh báo sắp hết giờ theo đồng hồ đếm ngược (Thi thật hoặc Luyện tập có giới hạn).
  const warn = countdown && timeWarn;
  const title = practice
    ? "Luyện Speaking · " +
      progress.map((p) => "Part " + (p.part + 1)).join(", ")
    : "Speaking · " + test.title + " · bài thi đầy đủ";

  return (
    <div className="attempt-screen attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6]">
      <header className="[border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fcfbf7)]">
        <div className="[padding:0_32px] [min-height:68px] flex flex-wrap items-center [gap:12px_20px]">
          <PageLink
            page="StudentLanding"
            className="flex items-center [gap:10px] no-underline [color:var(--attempt-text-352637)] font-bold [font-size:18px]"
          >
            <span
              className="w-8 h-8 [border-radius:10px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border flex items-center justify-center [font-weight:800] [font-size:13px]"
              style={{ background: accent, color: onAccent }}
            >
              {"IS"}
            </span>
            <span>{"IELTSpace"}</span>
          </PageLink>
          <div className="[padding-left:20px] [border-left:1.5px_solid_var(--attempt-line-e6e4e0)]">
            <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
              {practice
                ? "Luyện Speaking"
                : "Thư viện đề / " + test.title + " / Speaking"}
            </div>
            <div className="font-semibold">{title}</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center [gap:10px]">
            <span
              className={
                "inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:13px] font-semibold whitespace-nowrap " +
                (warn
                  ? "[background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)]"
                  : "[background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]")
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 2"></path>
              </svg>
              {timeText}
            </span>
            <button
              type="button"
              onClick={onExit}
              className={
                headerButton +
                " [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]"
              }
            >
              {"Lưu và thoát"}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!stream}
              className={headerButton}
              style={{ background: accent, color: onAccent }}
            >
              {"Hoàn thành"}
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
          </div>
        </div>
      </header>

      {steps.length === 0 ? (
        <div className="[padding:40px_32px] text-center [color:var(--attempt-text-706473)]">
          {"Phần đã chọn chưa có câu hỏi."}
        </div>
      ) : loading ? (
        <div
          role="status"
          className="[padding:40px_32px] text-center [color:var(--attempt-text-706473)]"
        >
          {"Đang khôi phục bài làm của bạn…"}
          <div className="mx-auto [max-width:560px] [margin-top:16px] text-left">
            <ConnectionNotice persistent={store.persistent()} />
          </div>
        </div>
      ) : !stream ? (
        <div className="attempt-workspace [background:var(--attempt-bg-faf9f5)]">
          {saved && (
            <div className="mx-auto [max-width:560px] [padding:24px_32px_0]">
              <div
                role="status"
                className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2963cc)] [font-size:14px]"
              >
                {"Đã khôi phục bài làm đang dở. Đồng hồ vẫn chạy trong lúc bạn rời đi; hãy kiểm tra micro để làm tiếp. " +
                  (practice
                    ? "Câu đang nói dở sẽ được làm lại từ đầu."
                    : "Câu Part 1 hoặc Part 3 đang nói dở sẽ được đóng lại, không làm lại được; Part 2 quay về phần chuẩn bị.")}
              </div>
            </div>
          )}
          <MicCheck
            accent={accent}
            onAccent={onAccent}
            onPassed={(next) => {
              setStream(next);
              begin();
            }}
          />
          <div className="mx-auto [max-width:560px] [padding:0_32px_24px]">
            <ConnectionNotice persistent={store.persistent()} />
          </div>
        </div>
      ) : (
        <div className="attempt-workspace [background:var(--attempt-bg-faf9f5)]">
          <div className="mx-auto [max-width:760px] [padding:24px_24px_32px] flex flex-col [gap:16px]">
            {restoreNote && (
              <div
                role="alert"
                className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:13px]"
              >
                {restoreNote}
              </div>
            )}
            <div className="flex gap-2 flex-wrap" aria-label="Tiến độ các Part">
              {progress.map((p) => {
                const state =
                  p.status === "done"
                    ? " [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)]"
                    : p.status === "current"
                      ? " [background:var(--attempt-bg-352637)] [color:var(--attempt-text-on-352637)]"
                      : " [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]";
                return (
                  <span
                    key={p.part}
                    className={chipBase + state}
                    aria-current={p.status === "current" ? "step" : undefined}
                  >
                    {p.status === "done" && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12.5l4.5 4.5L19 7"></path>
                      </svg>
                    )}
                    {"Part " + (p.part + 1)}
                    {p.status === "current" && p.count > 1
                      ? " · " + p.position + "/" + p.count
                      : ""}
                  </span>
                );
              })}
            </div>
            {flow.phase === "done" || !step ? (
              <div
                role="status"
                className="p-7 [min-height:240px] box-border flex flex-col justify-center gap-2 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
              >
                <h2 className="m-0 [font-size:22px] attempt-sans">
                  {"Bạn đã trả lời hết các câu hỏi"}
                </h2>
                <div className="[color:var(--attempt-text-4b3d4d)]">
                  {"Bấm Hoàn thành ở góc trên để kết thúc bài."}
                </div>
              </div>
            ) : (
              <QuestionCard
                step={step}
                phase={flow.phase}
                seconds={flow.seconds}
                footer={
              <RecorderControl
                stream={stream}
                questionId={step?.id ?? ""}
                phase={flow.phase}
                mode={mode}
                seconds={flow.seconds}
                maxSeconds={step?.maxSeconds ?? 0}
                answer={step ? answers[step.id] : undefined}
                onRecorded={handleRecorded}
                onStopping={track}
                flushRef={flushRecorder}
                onStart={handleStart}
                onStop={() => setFlow(stopRecording)}
                onRerecord={() => setFlow((c) => rerecord(c, mode))}
                onSkipPrep={() => setFlow((c) => skipPrep(c, mode))}
                onKeepOld={() => setFlow((c) => keepOld(c, mode))}
                onFail={handleFail}
                micLost={micLost && !timeExpired}
                micError={timeExpired ? "" : micError}
                onRestoreMic={restoreMic}
                trailing={
                  <button
                    type="button"
                    disabled={!nextEnabled}
                    onClick={() =>
                      setFlow((c) =>
                        nextStep(
                          c,
                          steps,
                          mode,
                          Date.now(),
                          new Set([
                            ...answeredIds.current,
                            ...Object.keys(answersRef.current),
                          ]),
                        ),
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 [height:40px] [padding:0_18px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border font-semibold [font-size:14px] whitespace-nowrap"
                    style={
                      nextEnabled
                        ? { background: accent, color: onAccent, borderColor: accent }
                        : {
                            background: "var(--attempt-bg-f3f0ea)",
                            color: "var(--attempt-text-706473)",
                            cursor: "not-allowed",
                          }
                    }
                  >
                    {last ? "Xong phần thi" : "Câu tiếp"}
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
                }
              />
                }
              />
            )}
            {step?.instr && flow.phase !== "done" && (
              <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                {step.instr}
              </div>
            )}
            <ConnectionNotice persistent={store.persistent()} />
            <div className="[font-size:13px] [color:var(--attempt-text-706473)] text-center">
              {practice
                ? "Bài luyện: bạn được nghe lại và ghi lại từng câu, chỉ bản ghi cuối cùng được lưu. Kết quả chấm là đánh giá cho các Part đã chọn, không phải band toàn kỹ năng."
                : "Bài thi đầy đủ: mỗi câu chỉ ghi âm một lần, không ghi lại. Một đồng hồ chung tính cả thời gian chuẩn bị Part 2."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
