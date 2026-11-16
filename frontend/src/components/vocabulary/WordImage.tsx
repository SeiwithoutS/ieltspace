import { useRef, useState, useEffect } from "react";
import type { Word } from "../../data/vocabulary";

export function WordImage({ entry, onChange }: { entry: Word; onChange?: (patch: Partial<Word>) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setBroken(false); }, [entry.image]);
  const picture = entry.image && !broken
    ? <img src={entry.image} alt="" loading="lazy" onError={() => setBroken(true)} />
    : <span className="word-placeholder" aria-hidden="true">{entry.word.slice(0, 2) || "+"}</span>;
  return <div className="word-image">
    {onChange ? <>
      <button type="button" className="word-image-button" title="Chọn ảnh từ máy" aria-label={`Chọn ảnh cho ${entry.word || "từ mới"}`} onClick={() => file.current?.click()}>{picture}<span className="word-image-hint">Đổi ảnh</span></button>
      <input ref={file} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={event => {
        const selected = event.target.files?.[0]; event.target.value = "";
        if (!selected) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type) || selected.size > 1024 * 1024) { setError("Chọn JPG, PNG hoặc WebP tối đa 1 MB."); return; }
        const reader = new FileReader();
        reader.onload = () => { onChange({ image: String(reader.result), imageCredit: undefined }); setError(""); };
        reader.onerror = () => setError("Không đọc được ảnh.");
        reader.readAsDataURL(selected);
      }} />
    </> : picture}
    {entry.imageCredit && <small className="image-credit">Ảnh: <a href={entry.imageCredit.url} target="_blank" rel="noreferrer">{entry.imageCredit.name}</a> / {entry.imageCredit.source === "Unsplash" ? <a href="https://unsplash.com/?utm_source=ieltspace&utm_medium=referral" target="_blank" rel="noreferrer">Unsplash</a> : entry.imageCredit.source}</small>}
    {error && <small role="alert">{error}</small>}
  </div>;
}
