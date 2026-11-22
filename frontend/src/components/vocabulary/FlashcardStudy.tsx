import { useEffect, useRef, useState } from "react";
import type { CardReview, FlashcardResult, FlashcardSubmission } from "../../lib/vocabulary/flashcard-history";
import { clockLabel } from "../../lib/vocabulary/flashcard-history";
import type { FlashcardSource } from "./FlashcardSetup";
import { WordCefrTag } from "./WordCefrTag";

export type StudySession = FlashcardSource & {
  id: string;
  startedAt: number;
  minutes: number;
};

export function FlashcardStudy({ session, onFinish }: {
  session: StudySession;
  onFinish: (result: FlashcardSubmission) => void;
}) {
  const [reviews, setReviews] = useState<CardReview[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [now, setNow] = useState(session.startedAt);
  const finished = useRef(false);
  const cardButton = useRef<HTMLButtonElement>(null);
  const word = session.words[reviews.length];
  const deadline = session.minutes > 0 ? session.startedAt + session.minutes * 60_000 : null;
  const remaining = deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));

  function finish(reason: FlashcardResult["reason"], evaluated: CardReview[]) {
    if (finished.current) return;
    finished.current = true;
    const finishedAt = Date.now();
    onFinish({
      id: session.id, title: session.title, finishedAt,
      source: session.source, cardIds: session.words.map(item => item.id),
      elapsedSeconds: Math.max(0, Math.round((finishedAt - session.startedAt) / 1000)),
      cardCount: session.words.length, reason, reviews: evaluated,
    });
  }

  useEffect(() => {
    if (deadline === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (remaining === 0) finish("timeout", reviews);
  }, [remaining, reviews, onFinish, session]);

  useEffect(() => {
    cardButton.current?.focus();
  }, [word.id]);

  function review(remembered: boolean) {
    if (!flipped || finished.current) return;
    if (deadline !== null && Date.now() >= deadline) {
      finish("timeout", reviews);
      return;
    }
    const next = [...reviews, { wordId: word.id, remembered }];
    if (next.length === session.words.length) finish("completed", next);
    else {
      setReviews(next);
      setFlipped(false);
    }
  }

  return (
    <section className="flash-study mx-auto" aria-label="Phiên ôn flashcard">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2>{session.title}</h2>
          <p className="flash-muted" aria-live="polite">Thẻ {reviews.length + 1} / {session.words.length}</p>
        </div>
        {remaining !== null && <span className="flash-timer" role="timer" aria-label={"Còn " + clockLabel(remaining)}>{clockLabel(remaining)}</span>}
      </div>
      <progress className="flash-progress" aria-label="Số thẻ đã đánh giá" value={reviews.length} max={session.words.length} />
      <button ref={cardButton} type="button" className="flash-card-face" onClick={() => setFlipped((value) => !value)}>
        <span className="flash-face-label inline-flex flex-wrap items-center justify-center gap-2">
          {flipped ? "Nghĩa tiếng Việt" : "Từ tiếng Anh"}
          <WordCefrTag tag={word.tag} />
        </span>
        {flipped ? <>
          <strong>{word.meaning}</strong>
          {word.example && <span lang="en" className="flash-example">{word.example}</span>}
          {word.translation && <span className="flash-muted">{word.translation}</span>}
        </> : <>
          <strong lang="en">{word.word}</strong>
          <span className="flash-muted">{[word.phonetic, word.pos].filter(Boolean).join(" · ")}</span>
        </>}
        <span className="flash-flip-label">{flipped ? "Xem mặt trước" : "Lật thẻ"}</span>
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="flash-forgot" disabled={!flipped} onClick={() => review(false)}>Chưa nhớ</button>
        <button type="button" className="flash-remembered" disabled={!flipped} onClick={() => review(true)}>Đã nhớ</button>
      </div>
      <button type="button" className="flash-back" onClick={() => finish("stopped", reviews)}>Kết thúc phiên</button>
    </section>
  );
}
