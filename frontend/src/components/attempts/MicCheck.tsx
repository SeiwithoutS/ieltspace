import { useEffect, useRef, useState } from "react";
import LevelBars from "./LevelBars";
import { AnswerRecorder, micErrorMessage, requestMicStream, stopStream } from "../../lib/attempts/mic";
import { useMicLevel } from "../../lib/attempts/use-mic-level";
import type { RecordedAnswer } from "../../lib/attempts/recordings";

type CheckStep = "idle" | "requesting" | "error" | "ready" | "testing" | "review";

/** Mức âm tối thiểu để coi là micro thu được tiếng (thang 0..1); chỉ dùng để cảnh báo mềm. */
const HEARD_LEVEL = 0.08;
/** Ghi thử quá lâu thì tự dừng (người học không cần bấm dừng). */
const MAX_TEST_SECONDS = 30;

const buttonClass =
  "attempt-hover inline-flex items-center justify-center gap-2 [height:44px] [padding:0_22px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border font-semibold [font-size:14px] whitespace-nowrap cursor-pointer";

/**
 * Bước kiểm tra micro trước khi vào làm bài: xin quyền, ghi thử vài giây, nghe
 * lại. Người học tự bấm dừng ghi thử bất kỳ lúc nào. Chỉ cần đã ghi thử và nghe
 * lại (hoặc bỏ qua nghe lại) là vào được; không đo được tiếng chỉ cảnh báo mềm.
 */
export default function MicCheck({
  onPassed,
  accent,
  onAccent,
}: {
  /** Trao quyền sở hữu stream cho trang làm bài (MicCheck không tự tắt nữa). */
  onPassed: (stream: MediaStream) => void;
  accent: string;
  onAccent: string;
}) {
  const [step, setStep] = useState<CheckStep>("idle");
  const [error, setError] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [spent, setSpent] = useState(0);
  const [listened, setListened] = useState(false);
  const recorderRef = useRef<AnswerRecorder | null>(null);
  const [sample, setSample] = useState<{ answer: RecordedAnswer; url: string } | null>(null);
  const [heard, setHeard] = useState(false);
  const handedOver = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const alive = useRef(true);
  const cancelWait = useRef<(() => void) | null>(null);
  const { levels, peakRef, measurableRef } = useMicLevel(
    stream,
    step === "ready" || step === "testing",
  );

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // Hủy vòng đếm giây ghi thử đang chờ và dừng bản ghi thử còn dở.
      cancelWait.current?.();
      const pending = recorderRef.current;
      recorderRef.current = null;
      void pending?.stop().catch(() => undefined);
      if (!handedOver.current) stopStream(streamRef.current);
    };
  }, []);
  useEffect(
    () => () => {
      if (sample) URL.revokeObjectURL(sample.url);
    },
    [sample],
  );

  async function enableMic() {
    setStep("requesting");
    setError("");
    try {
      const next = await requestMicStream();
      if (!alive.current) {
        stopStream(next);
        return;
      }
      // Bấm "Thử lại" nhiều lần: tắt stream cũ trước khi nhận stream mới.
      stopStream(streamRef.current);
      streamRef.current = next;
      setStream(next);
      setStep("ready");
    } catch (e) {
      if (!alive.current) return;
      setError(micErrorMessage(e));
      setStep("error");
    }
  }

  /** Lỗi ghi thử: tắt hẳn micro để "Thử lại" xin stream mới, không giữ đèn micro. */
  function dropStream(e: unknown) {
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setError(micErrorMessage(e));
    setStep("error");
  }

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      const id = setTimeout(resolve, ms);
      cancelWait.current = () => {
        clearTimeout(id);
        resolve();
      };
    });
  }

  /** Bắt đầu ghi thử; người học bấm "Dừng" bất kỳ lúc nào (xem `stopSample`). */
  async function recordSample() {
    if (!stream) return;
    let recorder: AnswerRecorder;
    try {
      recorder = new AnswerRecorder(stream);
      recorder.start();
    } catch (e) {
      dropStream(e);
      return;
    }
    recorderRef.current = recorder;
    peakRef.current = 0;
    setSpent(0);
    setListened(false);
    setStep("testing");
    for (let i = 1; i <= MAX_TEST_SECONDS; i++) {
      await wait(1000);
      // recorderRef bị xóa nghĩa là người học đã bấm dừng (hoặc rời trang).
      if (recorderRef.current !== recorder) return;
      setSpent(i);
    }
    await stopSample();
  }

  async function stopSample() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    cancelWait.current?.();
    try {
      const answer = await recorder.stop();
      if (!alive.current) return;
      // Không đo được mức âm (trình duyệt cũ, AudioContext không chạy) thì dựa vào việc người học tự nghe lại.
      setHeard(!measurableRef.current || peakRef.current >= HEARD_LEVEL);
      setSample({ answer, url: URL.createObjectURL(answer.blob) });
      setStep("review");
    } catch (e) {
      if (alive.current) dropStream(e);
    }
  }

  function retry() {
    setSample(null);
    setListened(false);
    setStep(stream && stream.active ? "ready" : "idle");
  }

  function pass() {
    if (!stream || !sample) return;
    handedOver.current = true;
    onPassed(stream);
  }

  return (
    <div className="mx-auto [max-width:560px] [padding:40px_32px]">
      <div className="p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
        <div className="flex flex-col [gap:14px]">
          <h2 className="m-0 [font-size:22px] [letter-spacing:-0.015em] attempt-sans">
            {"Kiểm tra micro trước khi làm bài"}
          </h2>
          <p className="m-0 [font-size:14px] [color:var(--attempt-text-4b3d4d)]">
            {
              "Bài Speaking cần ghi âm giọng nói của bạn. Hãy bật micro, nói thử một câu rồi nghe lại. Đồng hồ làm bài bắt đầu chạy khi bạn vào làm bài và không dừng khi bạn thoát ra."
            }
          </p>
          <LevelBars levels={levels} live={step === "ready" || step === "testing"} />

          {step === "idle" && (
            <button
              type="button"
              onClick={enableMic}
              className={buttonClass}
              style={{ background: accent, color: onAccent, borderColor: accent }}
            >
              {"Bật micro"}
            </button>
          )}
          {step === "requesting" && (
            <div role="status" className="[font-size:14px] [color:var(--attempt-text-706473)]">
              {"Đang chờ bạn cho phép dùng micro…"}
            </div>
          )}
          {step === "error" && (
            <>
              <div
                role="alert"
                className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-9d301e)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px]"
              >
                {error}
              </div>
              <button
                type="button"
                onClick={enableMic}
                className={buttonClass + " [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]"}
              >
                {"Thử lại"}
              </button>
            </>
          )}
          {step === "ready" && (
            <>
              <div role="status" className="[font-size:14px] [color:var(--attempt-text-4b3d4d)]">
                {"Micro đã bật. Thanh sóng phải nhảy khi bạn nói. Bấm ghi thử rồi nói một câu."}
              </div>
              <button
                type="button"
                onClick={recordSample}
                className={buttonClass}
                style={{ background: accent, color: onAccent, borderColor: accent }}
              >
                {"Bắt đầu ghi thử"}
              </button>
            </>
          )}
          {step === "testing" && (
            <>
              <div role="status" className="text-center [font-size:15px] font-semibold">
                {"Đang ghi thử, hãy nói một câu… " + spent + " giây"}
              </div>
              <button
                type="button"
                onClick={() => void stopSample()}
                className={buttonClass}
                style={{ background: accent, color: onAccent, borderColor: accent }}
              >
                {"Dừng ghi thử"}
              </button>
            </>
          )}
          {step === "review" && sample && (
            <>
              <audio
                controls
                src={sample.url}
                className="w-full"
                aria-label="Nghe lại bản ghi thử"
                onPlay={() => setListened(true)}
              />
              {heard ? (
                <div role="status" className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-e6f3ec)] [color:var(--attempt-text-24543d)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px]">
                  {"Đã thu được tiếng nói. Nghe lại, nếu giọng rõ thì vào làm bài."}
                </div>
              ) : (
                <div role="alert" className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px]">
                  {"Chưa nghe thấy tiếng nói trong bản ghi thử. Nếu nghe lại vẫn không có tiếng, hãy kiểm tra micro đã chọn đúng và không bị tắt tiếng, rồi ghi thử lại."}
                </div>
              )}
              <div className="flex flex-wrap [gap:10px] justify-end">
                <button
                  type="button"
                  onClick={retry}
                  className={buttonClass + " [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]"}
                >
                  {"Ghi thử lại"}
                </button>
                <button
                  type="button"
                  onClick={pass}
                  className={
                    buttonClass +
                    (listened
                      ? ""
                      : " [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)]")
                  }
                  style={
                    listened
                      ? { background: accent, color: onAccent, borderColor: accent }
                      : undefined
                  }
                >
                  {listened ? "Nghe rõ, vào làm bài" : "Bỏ qua nghe lại, vào làm bài"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
