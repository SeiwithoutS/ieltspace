import { useEffect, useState } from "react";
import { type Word } from "../../data/vocabulary";
export function WordCard({
  entry,
  children, favorite, onFavorite,
}: {
  entry: Word; favorite?:boolean; onFavorite?:()=>void;
  children?: React.ReactNode;
}) {
  const [error, setError] = useState(""),
    [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
    setError("");
  }, [entry.image, entry.audio]);
  return (
    <article className={"word-card"+(onFavorite?" has-favorite":"")}>
      {onFavorite && <button type="button" className="word-favorite" aria-label={"Yêu thích "+entry.word} aria-pressed={favorite} onClick={onFavorite}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill={favorite?"currentColor":"none"} strokeWidth="1.7"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/></svg></button>}
      {entry.image && !broken ? (
        <img
          src={entry.image}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="word-placeholder" aria-hidden="true">
          {entry.word.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="word-heading flex items-center gap-3 flex-wrap">
          <h3 lang="en">{entry.word}</h3>
          {entry.pos && <small>{({ "danh từ": "(n)", "động từ": "(v)", "tính từ": "(adj)", "trạng từ": "(adv)" } as Record<string,string>)[entry.pos] ?? entry.pos}</small>}

          <span>{entry.phonetic}</span>
          {entry.audio && (
            <button
              type="button"
              className="word-audio"
              aria-label={"Nghe phát âm " + entry.word}
              onClick={async (e) => {
                const player =
                  e.currentTarget.parentElement?.querySelector("audio");
                if (!player) return;
                document.querySelectorAll("audio").forEach((a) => a.pause());
                try {
                  player.currentTime = 0;
                  await player.play();
                  setError("");
                } catch {
                  setError("Chưa phát được audio.");
                }
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4 5 9H2v6h3l6 5V4Z M15 8a6 6 0 0 1 0 8 M18 5a10 10 0 0 1 0 14"/></svg>

            </button>
          )}
          <audio src={entry.audio || undefined} preload="none" />
        </div>
        <strong className="word-meaning">{entry.meaning}</strong>
        {entry.example && <p className="word-example" lang="en">{entry.example.split(new RegExp(`(${entry.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((part, index) => part.toLowerCase() === entry.word.toLowerCase() ? <mark key={index}>{part}</mark> : part)}</p>}
        {entry.translation && (
          <p className="word-translation">{entry.translation}</p>
        )}
        {error && <p role="status">{error}</p>}
        {children}
      </div>
    </article>
  );
}
