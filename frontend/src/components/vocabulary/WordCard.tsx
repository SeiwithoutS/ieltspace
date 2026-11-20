import { useEffect, useState } from "react";
import { WordImage } from "./WordImage";
import { type Word } from "../../data/vocabulary";
export function WordCard({
  entry,
  children, favorite, onFavorite, onImageChange, onImageTransfer,
}: {
  entry: Word; favorite?:boolean; onFavorite?:()=>void;
  children?: React.ReactNode;
  onImageChange?: (patch: Partial<Word>) => void;
  onImageTransfer?: (active: boolean) => void;
}) {
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
  }, [entry.image, entry.audio, entry.audioUs, entry.audioUk]);
  async function pronounce(accent: "US" | "UK", player: HTMLAudioElement) {
    setError("");
    document.querySelectorAll("audio").forEach((audio) => audio.pause());
    window.speechSynthesis?.cancel();
    const suffix = new RegExp("-" + (accent === "US" ? "us" : "(uk|gb)") + "[.]mp3(?:[?#]|$)", "i");
    const selected = entry.audioCandidates?.find(item => item.url === entry.audio);
    const recording = (accent === "US" ? entry.audioUs : entry.audioUk) || (selected?.accent === accent || suffix.test(entry.audio) ? entry.audio : entry.audioCandidates?.find(item => item.accent === accent)?.url);
    if (recording) {
      player.src = recording;
      try {
        await player.play();
        return;
      } catch {
        // Fall back to the matching system voice when the recording is unavailable.
      }
    }
    const lang = accent === "US" ? "en-US" : "en-GB";
    const synth = window.speechSynthesis;
    const voice = synth?.getVoices().find((item) => item.lang.replace("_", "-").toLowerCase() === lang.toLowerCase());
    if (!voice) {
      setError(`Thiết bị chưa có giọng ${accent} để phát từ này.`);
      return;
    }
    const phrase = new SpeechSynthesisUtterance(entry.word);
    phrase.lang = lang;
    phrase.voice = voice;
    phrase.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") setError("Chưa phát được audio.");
    };
    synth.speak(phrase);
  }
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);
  return (
    <article className={"word-card"+(onFavorite?" has-favorite":"")}>
      {onFavorite && <button type="button" className="word-favorite" aria-label={"Yêu thích "+entry.word} aria-pressed={favorite} onClick={onFavorite}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill={favorite?"currentColor":"none"} strokeWidth="1.7"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/></svg></button>}
      <WordImage entry={entry} onChange={onImageChange} onTransfer={onImageTransfer} />
      <div className="min-w-0 flex-1">
        <div className="word-heading flex items-center gap-3 flex-wrap">
          <h3 lang="en">{entry.word}</h3>
          {entry.pos && <small>{({ "danh từ": "(n)", "động từ": "(v)", "tính từ": "(adj)", "trạng từ": "(adv)" } as Record<string,string>)[entry.pos] ?? entry.pos}</small>}

          <div className="word-pronunciations">
            <span className="word-phonetic">{entry.phonetic}</span>
            {(["US", "UK"] as const).map((accent) => (
              <button
                key={accent}
                type="button"
                className="word-audio"
                title={`Nghe giọng ${accent}`}
                aria-label={`Nghe phát âm ${accent} của ${entry.word}`}
                onClick={(event) => {
                  const player = event.currentTarget.parentElement?.querySelector("audio");
                  if (player) void pronounce(accent, player);
                }}
              >
                <svg
                  aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"
                  fill="none" stroke="currentColor" strokeWidth="1.7"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <path d="M15 8a6 6 0 0 1 0 8" />
                  <path d="M18 5a10 10 0 0 1 0 14" />
                </svg>
                <span>{accent}</span>
              </button>
            ))}
            {entry.audio && !(["US", "UK"] as (string | undefined)[]).includes(entry.audioCandidates?.find(item => item.url === entry.audio)?.accent) && !/-(us|uk|gb)[.]mp3/i.test(entry.audio) && <button type="button" className="word-audio" onClick={async event => {
              const player = event.currentTarget.parentElement?.querySelector("audio");
              if (!player) return;
              document.querySelectorAll("audio").forEach(audio => audio.pause());
              window.speechSynthesis?.cancel(); player.src = entry.audio;
              try { await player.play(); setError(""); } catch { setError("Không phát được URL audio đã chọn."); }
            }}>{/-au[.]mp3/i.test(entry.audio) ? "Nghe AU" : "Nghe bản đã chọn"}</button>}
            <audio preload="none" />
          </div>
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
