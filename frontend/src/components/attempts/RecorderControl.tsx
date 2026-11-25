import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import LevelBars from "./LevelBars";
import { formatClock } from "./AttemptTimer";
import { AnswerRecorder, micErrorMessage, streamIsLive } from "../../lib/attempts/mic";
import { useMicLevel } from "../../lib/attempts/use-mic-level";
import type { RecordedAnswer } from "../../lib/attempts/recordings";
import type { SpeakingMode, SpeakingPhase } from "../../lib/attempts/speaking-flow";

interface RecorderControlProps {
  stream: MediaStream | null;
  questionId: string;
  phase: SpeakingPhase;
  mode: SpeakingMode;
  /** Giây đã nói (phase recording). */
  seconds: number;
  /** Giây nói tối đa; 0 là không giới hạn. */
  maxSeconds: number;
  /** Bản ghi đã có của câu này (để nghe lại). */
  answer?: RecordedAnswer;
  /** Nhận bản ghi khi dừng (kể cả bị dừng do hết giờ hoặc rời trang). */
  onRecorded: (questionId: string, answer: RecordedAnswer) => void;
  /**
   * Báo khi bắt đầu dừng một lần ghi: `job` xong sau khi bản ghi đã được giao
   * qua onRecorded. Trang dùng để chờ bản ghi vừa dừng trước khi Lưu và thoát.
   */
  onStopping?: (job: Promise<void>) => void;
  /**
   * Trong lúc ghi, ô này giữ hàm dừng ngay lần ghi và giao bản ghi (dùng khi Lưu
   * và thoát giữa lúc đang nói); không ghi thì là null.
   */
  flushRef?: MutableRefObject<(() => Promise<void>) | null>;
  onStart: () => void;
  onStop: () => void;
  onRerecord: () => void;
  onSkipPrep: () => void;
  /** Practice: bỏ ghi lại, giữ bản cũ. */
  onKeepOld: () => void;
  /** Không ghi được (micro ngắt, recorder lỗi lúc bắt đầu); trang quyết định xử lý. */
  onFail: (message: string) => void;
  /** Micro đang bị ngắt/lỗi: hiện nút bật lại micro. */
  micLost: boolean;
  micError: string;
  onRestoreMic: () => void;
  /** Nút đặt cuối thanh ghi âm (vd "Câu tiếp"). */
  trailing?: ReactNode;
}

const pill =
  "inline-flex items-center justify-center gap-2 [height:40px] [padding:0_16px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] whitespace-nowrap cursor-pointer";
const round =
  "w-12 h-12 [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-c0412a)] [color:var(--attempt-text-on-c0412a)] flex items-center justify-center cursor-pointer";

const icon = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/**
 * Ghi âm một câu. Ghi âm chạy theo `phase` do máy trạng thái quyết định: vào
 * "recording" thì bắt đầu, rời "recording" (dừng tay, hết tối đa, hết giờ tổng
 * hoặc đổi trang) thì dừng và gửi bản ghi qua `onRecorded`.
 */
export default function RecorderControl({
  stream,
  questionId,
  phase,
  mode,
  seconds,
  maxSeconds,
  answer,
  onRecorded,
  onStopping,
  flushRef,
  onStart,
  onStop,
  onRerecord,
  onSkipPrep,
  onKeepOld,
  onFail,
  micLost,
  micError,
  onRestoreMic,
  trailing,
}: RecorderControlProps) {
  const recording = phase === "recording";
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const deliver = useRef(onRecorded);
  deliver.current = onRecorded;
  const fail = useRef(onFail);
  fail.current = onFail;
  const stopping = useRef(onStopping);
  stopping.current = onStopping;
  const { levels } = useMicLevel(stream, recording);

  useEffect(() => {
    if (!recording) return;
    if (!stream || !streamIsLive(stream)) {
      fail.current("Micro đã bị ngắt. Hãy bật lại micro; phần đang nói chưa được ghi.");
      return;
    }
    let recorder: AnswerRecorder;
    try {
      recorder = new AnswerRecorder(stream);
      recorder.start();
    } catch (e) {
      fail.current(micErrorMessage(e));
      return;
    }
    const id = questionId;
    // Dừng một lần duy nhất dù gọi từ Lưu và thoát hay từ dọn dẹp effect.
    let job: Promise<void> | null = null;
    const stopNow = () =>
      (job ??= recorder
        .stop()
        .then((result) => {
          if (result.blob.size > 0) deliver.current(id, result);
        })
        .catch(() => undefined));
    if (flushRef) flushRef.current = stopNow;
    return () => {
      if (flushRef && flushRef.current === stopNow) flushRef.current = null;
      stopping.current?.(stopNow());
    };
  }, [recording, questionId, stream]);

  const url = useMemo(
    () => (answer ? URL.createObjectURL(answer.blob) : ""),
    [answer],
  );
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  // Đổi câu hoặc bắt đầu ghi thì dừng phần đang nghe lại.
  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, [questionId, recording]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  const real = mode === "real";
  const clock = recording
    ? formatClock(seconds) + (maxSeconds > 0 ? " / " + formatClock(maxSeconds) : "")
    : phase === "answered" && answer
      ? formatClock(Math.round(answer.durationMs / 1000))
      : "00:00";
  const hint = (() => {
    if (phase === "preparing")
      return real
        ? "Đang chuẩn bị. Hệ thống tự ghi âm khi hết thời gian chuẩn bị."
        : "Đang chuẩn bị. Bạn có thể bỏ qua để ghi âm ngay.";
    if (phase === "viewing")
      return real
        ? "Hãy đọc câu hỏi. Hệ thống tự ghi âm khi hết giờ đếm."
        : "Hãy đọc câu hỏi. Sau đó bấm nút ghi âm khi bạn sẵn sàng.";
    if (phase === "ready")
      return answer
        ? "Bấm nút đỏ để ghi lại, hoặc giữ bản ghi cũ."
        : "Bấm nút đỏ để bắt đầu ghi âm.";
    if (phase === "recording")
      return real
        ? "Đang ghi âm. Nói xong thì bấm Câu tiếp, không ghi lại được."
        : "Đang ghi âm. Nói xong thì bấm Dừng.";
    if (phase === "micLost")
      return "Micro bị ngắt. Bật lại micro để tiếp tục.";
    if (phase === "answered")
      return real
        ? "Đã ghi xong. Bấm Câu tiếp để sang câu kế."
        : "Đã ghi xong. Bạn có thể nghe lại, ghi lại hoặc sang câu kế.";
    return "";
  })();

  return (
    <div className="[padding:14px_18px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:16px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
      <div className="flex flex-col [gap:10px]">
        <div className="flex flex-wrap items-center [gap:12px_16px]">
          <div className="flex items-center [gap:12px]">
            <div className="[width:120px] shrink-0">
              <LevelBars levels={levels.slice(-15)} height={40} live={recording} />
            </div>
            <div
              className="[font-size:24px] font-bold [letter-spacing:-0.015em] font-sans tabular-nums whitespace-nowrap"
              role="timer"
              aria-label="Thời gian ghi âm"
            >
              {clock}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end [gap:10px] ml-auto">
            {phase === "preparing" && !real && (
              <button type="button" className={pill} onClick={onSkipPrep}>
                {"Bỏ qua chuẩn bị"}
              </button>
            )}
            {micLost && (
              <button type="button" className={pill} onClick={onRestoreMic}>
                {"Bật lại micro"}
              </button>
            )}
            {phase === "ready" && !micLost && (
              <button type="button" className={round} onClick={onStart} aria-label="Bắt đầu ghi âm">
                <svg {...icon}>
                  <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                </svg>
              </button>
            )}
            {phase === "ready" && !real && !!answer && (
              <button type="button" className={pill} onClick={onKeepOld}>
                {"Giữ bản cũ"}
              </button>
            )}
            {recording && !real && (
              <button type="button" className={round} onClick={onStop} aria-label="Dừng ghi âm">
                <span className="w-4 h-4 [border-radius:4px] [background:var(--attempt-text-on-c0412a)]"></span>
              </button>
            )}
            {recording && real && (
              <span className={round} role="img" aria-label="Đang ghi">
                <span className="w-4 h-4 [border-radius:4px] [background:var(--attempt-text-on-c0412a)]"></span>
              </span>
            )}
            {phase === "answered" && !real && (
              <>
                <button type="button" className={pill} onClick={togglePlay} disabled={!answer}>
                  <svg {...icon}>
                    {playing ? <path d="M8 5v14M16 5v14" /> : <path d="M8 5l11 7-11 7z" />}
                  </svg>
                  {playing ? "Tạm dừng" : "Nghe lại"}
                </button>
                <button type="button" className={pill} onClick={onRerecord}>
                  <svg {...icon}>
                    <path d="M21 12a9 9 0 1 1-3-6.7L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                  </svg>
                  {"Ghi lại"}
                </button>
              </>
            )}
            {trailing}
          </div>
        </div>
        {(micLost || micError) && (
          <div role="alert" className="[padding:8px_12px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:13px]">
            {micError || "Micro đã bị ngắt. Hãy bật lại micro."}
          </div>
        )}
        {url && (
          <audio
            ref={audioRef}
            src={url}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        )}
        <div role="status" className="[font-size:13px] [color:var(--attempt-text-706473)]">
          {hint}
        </div>
      </div>
    </div>
  );
}
