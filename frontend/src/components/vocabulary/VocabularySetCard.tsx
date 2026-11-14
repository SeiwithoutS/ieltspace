import type { Topic, Word } from "../../data/vocabulary";

type VocabularySetCardProps = {
  topic: Topic;
  title: string;
  index: number;
  entries: readonly Word[];
  onOpen: () => void;
};

export function VocabularySetCard({
  topic, title, index, entries, onOpen,
}: VocabularySetCardProps) {
  return (
    <article className="vocab-set" data-topic={topic}>
      <div className="set-cover">
        <small>VOCABULARY / {String(index).padStart(2, "0")}</small>
        <strong lang="en">{topic}</strong>
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
