import { useState } from "react";

export function WordNote({ word, value, onSave }: {
  word: string;
  value: string;
  onSave: (note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return <div className="word-note">
    {editing ? <form onSubmit={(event) => {
      event.preventDefault();
      onSave(draft);
      setEditing(false);
    }}>
      <label>Ghi chú cho {word}
        <textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className="word-tools">
        <button className="word-primary" type="submit">Lưu ghi chú</button>
        <button type="button" onClick={() => setEditing(false)}>Hủy</button>
      </div>
    </form> : <>
      <p><strong>Ghi chú:</strong> {value || "Chưa có ghi chú."}</p>
      <button className="word-note-edit" type="button" aria-label={"Sửa ghi chú cho " + word}
        onClick={() => { setDraft(value); setEditing(true); }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m16 3 5 5-12 12H4v-5L16 3Z M13 6l5 5" /></svg>
        <span>Sửa</span>
      </button>
    </>}
  </div>;
}
