import { useRef, useState, useEffect } from "react";
import type { Word } from "../../data/vocabulary";
import { uploadVocabularyImage, useVocabularyImagePreview } from "../../lib/vocabulary/vocabulary-media";

export function WordImage({ entry, onChange, onTransfer }: {
  entry: Word;
  onChange?: (patch: Partial<Word>) => void;
  onTransfer?: (active: boolean) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const { source, renew } = useVocabularyImagePreview(entry.image, entry.imagePreview);
  useEffect(() => { setBroken(false); }, [source]);
  const picture = source && !broken
    ? <img src={source} alt="" loading="lazy" onError={() => { setBroken(true); void renew(); }} />
    : <span className="word-placeholder" aria-hidden="true">{entry.word.slice(0, 2) || "+"}</span>;
  return <div className="word-image">
    {onChange ? <>
      <button type="button" className="word-image-button" disabled={uploading} title="Chọn ảnh từ máy" aria-label={`Chọn ảnh cho ${entry.word || "từ mới"}`} onClick={() => file.current?.click()}>{picture}<span className="word-image-hint">Đổi ảnh</span></button>
      <input ref={file} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={async event => {
        const selected = event.target.files?.[0]; event.target.value = "";
        if (!selected || uploading) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type) || selected.size > 1024 * 1024) { setError("Chọn JPG, PNG hoặc WebP tối đa 1 MB."); return; }
        setUploading(true);
        onTransfer?.(true);
        setError("");
        try {
          const stored = await uploadVocabularyImage(selected);
          onChange({ ...stored, imageCredit: undefined });
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : "Chưa tải được ảnh.");
        } finally {
          setUploading(false);
          onTransfer?.(false);
        }
      }} />
    </> : picture}
    {entry.imageCredit && <small className="image-credit">Ảnh: <a href={entry.imageCredit.url} target="_blank" rel="noreferrer">{entry.imageCredit.name}</a> / {entry.imageCredit.source === "Unsplash" ? <a href="https://unsplash.com/?utm_source=ieltspace&utm_medium=referral" target="_blank" rel="noreferrer">Unsplash</a> : entry.imageCredit.source}</small>}
    {error && <small role="alert">{error}</small>}
    {uploading && <small role="status">Đang tải ảnh…</small>}
  </div>;
}
