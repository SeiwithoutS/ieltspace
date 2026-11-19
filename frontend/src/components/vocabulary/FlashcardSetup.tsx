import { useEffect, useRef, useState } from "react";
import type { Word } from "../../data/vocabulary";

export type FlashcardSource = { title: string; words: Word[] };
export type FlashcardSettings = { count: number; minutes: number; shuffle: boolean };

export function FlashcardSetup({ source, onStart, onBack }: {
  source: FlashcardSource;
  onStart: (settings: FlashcardSettings) => void;
  onBack: () => void;
}) {
  const available = source.words.length;
  const [count, setCount] = useState(String(Math.min(10, available)));
  const [minutes, setMinutes] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);
  const cardCount = Number(count);

  return (
    <form className="flash-panel flash-setup mx-auto" onSubmit={(event) => {
      event.preventDefault();
      if (Number.isInteger(cardCount) && cardCount >= 1 && cardCount <= available) {
        onStart({ count: cardCount, minutes, shuffle });
      }
    }}>
      <button type="button" className="flash-back" onClick={onBack}>← Chọn nguồn khác</button>
      <h2 ref={title} tabIndex={-1}>Thiết lập phiên ôn</h2>
      <p className="flash-muted">{source.title} · {available} từ có thể ôn</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flash-field">
          Số thẻ
          <input type="number" min={1} max={available} step={1} required value={count} onChange={(event) => setCount(event.currentTarget.value)} />
        </label>
        <label className="flash-field">
          Thời gian
          <select value={minutes} onChange={(event) => setMinutes(Number(event.currentTarget.value))}>
            <option value={0}>Không giới hạn</option>
            <option value={2}>2 phút</option>
            <option value={5}>5 phút</option>
            <option value={10}>10 phút</option>
            <option value={15}>15 phút</option>
          </select>
        </label>
      </div>
      <label className="flash-check">
        <input type="checkbox" checked={shuffle} onChange={(event) => setShuffle(event.currentTarget.checked)} />
        Xáo trộn thứ tự thẻ
      </label>
      <p className="flash-muted">Lật thẻ để xem nghĩa, rồi chọn mức độ ghi nhớ của bạn.</p>
      <button type="submit" className="vocab-primary">Bắt đầu ôn</button>
    </form>
  );
}
