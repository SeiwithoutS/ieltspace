import { AudioFields } from "./AudioFields";
import { useRef, useState } from "react";
import type { Word } from "../../data/vocabulary";
import { findVocabularyMedia, selectVocabularyImage } from "../../lib/vocabulary/vocabulary-media";

export function WordMediaEditor({ entry, onChange, onWordEntered }: {
  entry: Word; onChange: (change: Partial<Word>) => void; onWordEntered: (word: Word) => void;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [initiallyOpen] = useState(!entry.word);
  const latest = useRef(entry); latest.current = entry;
  async function lookup(type: "audio" | "image") {
    const original = entry;
    setBusy(true); setMessage("");
    try {
      const patch = await findVocabularyMedia(original.word, type);
      if (latest.current.word === original.word && latest.current[type] === original[type]) onChange(patch);
      setMessage(patch.mediaMessage || "Đã cập nhật kết quả tra cứu.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa tra được media."); }
    finally { setBusy(false); }
  }
  return <details open={initiallyOpen || undefined} className="word-media-editor">
    <summary>Chỉnh sửa nội dung và media</summary>
    <div className="word-fields">
      {([["word", "Từ"], ["meaning", "Nghĩa tiếng Việt"], ["phonetic", "Phiên âm"], ["pos", "Từ loại"]] as const).map(([field, label]) => <label key={field}>{label}
        <input value={entry[field]}
          onBlur={field === "word" ? () => onWordEntered(entry) : undefined}
          onChange={event => onChange({ [field]: event.target.value })} />
      </label>)}
      <label className="word-field-wide">Ví dụ
        <textarea value={entry.example} onChange={event => onChange({ example: event.target.value })} />
      </label>
      <label className="word-field-wide">Bản dịch
        <textarea value={entry.translation} onChange={event => onChange({ translation: event.target.value })} />
      </label>
      <label className="word-field-wide">URL ảnh
        <input value={entry.image.startsWith("data:") ? "" : entry.image}
          placeholder={entry.image.startsWith("data:") ? "Đang dùng ảnh đã tải lên" : undefined}
          onChange={event => onChange({ image: event.target.value, imageCredit: undefined })} />
      </label>
      <AudioFields entry={entry} onChange={onChange} />
    </div>
    <div className="word-tools">
      <button type="button" className="vocab-button" disabled={busy || !entry.word.trim()} onClick={() => lookup("image")}>Tìm lại ảnh</button>
      <button type="button" className="vocab-button" disabled={busy || !entry.word.trim()} onClick={() => lookup("audio")}>Tìm lại audio</button>
      {entry.image && <button type="button" className="vocab-button" onClick={() => onChange({ image: "", imageCredit: undefined })}>Bỏ ảnh</button>}
      <small>Bấm vào hình của từ để tải ảnh từ máy.</small>
    </div>
    {!!entry.imageCandidates?.length && <div className="word-image-options" aria-label="Ảnh gợi ý">
      {entry.imageCandidates.map(candidate => <div key={candidate.id}>
        <button type="button" disabled={busy} aria-label={`Dùng ảnh từ ${candidate.source} của ${candidate.credit}`} onClick={async () => {
          const original = entry; setBusy(true);
          try { const patch = await selectVocabularyImage(candidate.id); if (latest.current.word === original.word && latest.current.image === original.image) onChange(patch); }
          catch (error) { setMessage(error instanceof Error ? error.message : "Chưa lấy được ảnh."); }
          finally { setBusy(false); }
        }}><img src={candidate.url} alt={`Ảnh gợi ý cho ${entry.word}`} loading="lazy" /></button>
        <small><a href={candidate.creditUrl} target="_blank" rel="noreferrer">{candidate.credit}</a> / {candidate.source}</small>
      </div>)}
    </div>}
    {(busy || message || entry.mediaMessage) && <p role="status">{busy ? "Đang tra cứu…" : message || entry.mediaMessage}</p>}
  </details>;
}
