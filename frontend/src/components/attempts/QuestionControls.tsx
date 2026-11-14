import React from "react";

interface FlagQuestion {
  flagged: boolean;
  flagAria: string;
  toggleFlag: () => void;
  flagBorder: string;
  flagBg: string;
  flagFg: string;
  flagFill: string;
}
interface ChoiceQuestion {
  name: string;
  options: {
    label: string;
    styleClass: string;
    style: React.CSSProperties;
    checked: boolean;
    pick: () => void;
  }[];
}
export function ReviewFlag({ question }: { question: FlagQuestion }) {
  return (
    <button
      type="button"
      aria-pressed={question.flagged}
      aria-label={question.flagAria}
      onClick={question.toggleFlag}
      className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 h-[30px] text-[13px] font-semibold"
      style={{
        border: "1.5px solid " + question.flagBorder,
        background: question.flagBg,
        color: question.flagFg,
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={question.flagFill}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
      </svg>
      Xem lại
    </button>
  );
}

export function AnswerOptions({
  question,
  fontSize,
}: {
  question: ChoiceQuestion;
  fontSize: number;
}) {
  return question.options.map((option) => (
    <label
      key={option.label}
      className={option.styleClass}
      style={option.style}
    >
      <input
        type="radio"
        name={question.name}
        checked={option.checked}
        onChange={option.pick}
      />
      <span style={{ fontSize }}>{option.label}</span>
    </label>
  ));
}
export function ChoiceQuestionCard({
  question,
  fontSize,
  className,
  style,
  onFocus,
}: {
  question: FlagQuestion & ChoiceQuestion & { n: number; text: string };
  fontSize: number;
  className: string;
  style: React.CSSProperties;
  onFocus: () => void;
}) {
  return (
    <section
      tabIndex={-1}
      data-attempt-question={question.n}
      aria-label={`Câu ${question.n}`}
      onFocus={onFocus}
      className={className}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 leading-normal" style={{ fontSize }}>
          <strong>{question.n}.</strong> {question.text}
        </div>
        <ReviewFlag question={question} />
      </div>
      <AnswerOptions question={question} fontSize={fontSize} />
    </section>
  );
}
