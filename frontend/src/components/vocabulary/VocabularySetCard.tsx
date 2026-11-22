import type { Word } from "../../data/vocabulary";

type VocabularySetCardProps = {
  topic: string;
  cover?: string;
  title: string;
  index: number;
  entries: readonly Word[];
  onOpen: () => void;
};

export function VocabularySetCard({
  topic, title, cover, index, entries, onOpen,
}: VocabularySetCardProps) {
  return (
    <article className="vocab-set lift" data-topic={topic}>
      <div className="set-cover">
        <small>VOCABULARY / {String(index).padStart(2, "0")}</small>
        {cover ? <img src={cover} alt="" className="set-cover-image" /> : <strong>{title}</strong>}
      </div>
      <div className="set-body">
        <small>{entries.length} từ</small>
        <h2>{title}</h2>
        <p>{entries.slice(0, 3).map((word) => word.word).join(" · ")}</p>
        <button type="button" aria-label={"Mở bộ từ " + title} onClick={onOpen}>
          Mở bộ từ <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
