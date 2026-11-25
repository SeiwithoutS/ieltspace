import { useEffect, useState, type ReactNode } from "react";
import "./question-card.css";
import { formatClock } from "./AttemptTimer";
import {
  VIEW_SECONDS,
  parseCueCard,
  type SpeakingPhase,
  type SpeakingStep,
} from "../../lib/attempts/speaking-flow";

interface QuestionCardProps {
  step: SpeakingStep;
  phase: SpeakingPhase;
  /** Giây còn lại (preparing, viewing) hoặc đã nói (recording). */
  seconds: number;
  /** Khu ghi âm đặt trong cùng thẻ, dưới phần câu hỏi. */
  footer?: ReactNode;
}

const chip =
  "inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [font-size:13px] font-semibold whitespace-nowrap";

function statusOf(step: SpeakingStep, phase: SpeakingPhase, seconds: number) {
  if (phase === "preparing")
    return { text: "Chuẩn bị", time: formatClock(seconds), total: step.prepSeconds, tone: "blue" };
  if (phase === "viewing")
    return { text: "Đọc câu hỏi", time: seconds + " giây", total: VIEW_SECONDS, tone: "blue" };
  if (phase === "ready") return { text: "Sẵn sàng ghi âm", time: "", total: 0, tone: "violet" };
  if (phase === "recording") return { text: "Đang ghi âm", time: "", total: 0, tone: "red" };
  if (phase === "micLost") return { text: "Micro bị ngắt", time: "", total: 0, tone: "red" };
  return { text: "Đã trả lời", time: "", total: 0, tone: "green" };
}

const tones: Record<string, [string, string]> = {
  blue: ["var(--attempt-bg-e3ecfd)", "var(--attempt-text-2963cc)"],
  violet: ["var(--attempt-bg-e8e4fa)", "var(--attempt-text-5543b0)"],
  red: ["var(--attempt-bg-fbdcd3)", "var(--attempt-text-c0412a)"],
  green: ["var(--attempt-bg-dcede2)", "var(--attempt-text-2e6a48)"],
};

function Face({ step }: { step: SpeakingStep }) {
  const cue = step.kind === "cue" ? parseCueCard(step.text) : null;
  return (
    <div className="flex flex-col [gap:12px]">
      <div className="[font-size:12px] font-semibold [letter-spacing:.08em] uppercase [color:var(--attempt-text-706473)]">
        {"Part " + (step.part + 1) + (step.kind === "cue" ? " · cue card" : " · câu " + (step.index + 1) + "/" + step.count)}
        {step.topic ? " · " + step.topic : ""}
      </div>
      {cue ? (
        <>
          <h2 className="m-0 [font-size:22px] [line-height:1.35] [letter-spacing:-0.015em] attempt-sans">
            {cue.title}
          </h2>
          <div className="[font-size:16px] [line-height:1.8] [color:var(--attempt-text-352637)]">
            {cue.lines.map((line, i) =>
              line.bullet ? (
                <div key={i} className="flex [gap:8px] [padding-left:4px]">
                  <span aria-hidden="true">{"•"}</span>
                  <span>{line.text}</span>
                </div>
              ) : (
                <div key={i}>{line.text}</div>
              ),
            )}
          </div>
        </>
      ) : (
        <h2 className="m-0 [font-size:28px] [line-height:1.4] [letter-spacing:-0.015em] attempt-sans">
          {step.text}
        </h2>
      )}
    </div>
  );
}

const cardClass =
  "box-border overflow-hidden [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]";
const topClass = "[padding:24px_28px] [min-height:200px] box-border";

/**
 * Flashcard câu hỏi: mỗi lúc chỉ hiện một câu. Đổi câu thì thẻ cũ trượt ra, thẻ
 * mới trượt vào (tắt khi người dùng chọn giảm chuyển động). `footer` (khu ghi
 * âm) nằm trong cùng thẻ, bên dưới đường kẻ, nên trượt/lật cùng thẻ.
 */
export default function QuestionCard({ step, phase, seconds, footer }: QuestionCardProps) {
  const [shown, setShown] = useState(step);
  const [leaving, setLeaving] = useState<SpeakingStep | null>(null);
  if (step.id !== shown.id) {
    setLeaving(shown);
    setShown(step);
  }
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), 400);
    return () => clearTimeout(timer);
  }, [leaving]);

  const status = statusOf(step, phase, seconds);
  const [toneBg, toneFg] = tones[status.tone];
  const percent =
    status.total > 0
      ? Math.max(0, Math.min(100, ((status.total - seconds + 1) / status.total) * 100))
      : 0;
  return (
    <div className="qcard-stage">
      {leaving && (
        <div className={"qcard-out " + cardClass} aria-hidden="true">
          <div className={topClass}>
            <Face step={leaving} />
          </div>
        </div>
      )}
      <div key={shown.id} className={"qcard-in " + cardClass} role="group" aria-label="Câu hỏi hiện tại">
        <div className={topClass + " flex flex-col [gap:14px]"}>
          <span className={chip + " self-start"} style={{ background: toneBg, color: toneFg }}>
            {/* Chỉ đổi trạng thái mới được đọc; số giây đổi mỗi nhịp nên nằm ngoài vùng live. */}
            <span aria-live="polite">{status.text}</span>
            {status.time && <span className="tabular-nums">{"· " + status.time}</span>}
          </span>
          <Face step={shown} />
          {status.total > 0 && (
            <div
              role="progressbar"
              aria-label="Thời gian còn lại"
              aria-valuemin={0}
              aria-valuemax={status.total}
              aria-valuenow={seconds}
              className="[height:6px] rounded-full [background:var(--attempt-bg-f3f0ea)] overflow-hidden"
            >
              <div
                className="qcard-bar h-full rounded-full"
                style={{ width: percent + "%", background: toneFg }}
              />
            </div>
          )}
        </div>
        {footer && (
          <div className="[padding:16px_28px_18px] [border-top:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-faf9f5)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
