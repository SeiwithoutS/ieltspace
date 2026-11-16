import { apiFetch } from "../../lib/api";
import StaffLayout from "../../components/layout/StaffLayout";
import { SetDirectory, SetForm } from "./SetDirectory";
import { useEffect, useRef, useState } from "react";
import {
  type VocabularySet,

  type Word,
} from "../../data/vocabulary";
import { importWords, csvHeader } from "../../lib/vocabulary-import";
import { WordCard } from "../../components/vocabulary/WordCard";
import "./vocabulary.css";
import { getVocabularyDraft, saveVocabularyDraft, updateVocabularySet } from "../../lib/vocabulary-api";
import { findVocabularyMedia } from "../../lib/vocabulary-media";
import { WordMediaEditor } from "../../components/vocabulary/WordMediaEditor";

function Editor({ set, onSetUpdate }: { set: VocabularySet; onSetUpdate: (set: VocabularySet) => void }) {
  const [editingInfo, setEditingInfo] = useState(false);
  const topic = set.id;
  const [words, setWords] = useState<Word[]>([]),
    [preview, setPreview] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  async function fillMissingMedia(entry: Word) {
    if (!entry.word.trim()) return;
    await Promise.all((["image", "audio"] as const).map(async field => {
      if (entry[field]) return;
      try {
        const patch = await findVocabularyMedia(entry.word, field);
        setWords(items => items.map(item =>
          item.id === entry.id && item.word === entry.word && !item[field]
            ? { ...item, ...patch } : item));
      } catch {
        setWords(items => items.map(item => item.id === entry.id && item.word === entry.word ? { ...item, mediaMessage: "Chưa tra được media. Kiểm tra đăng nhập, backend và cấu hình API key." } : item));
      }
    }));
  }
  async function upload(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const next = await importWords(f);
      setChosen([]);
      setWords(next);
      setMessage("Đang tìm ảnh và audio cho các từ vừa nhập…");
      const queue = next.values();
      await Promise.all(Array.from({ length: Math.min(4, next.length) }, async () => {
        for (const entry of queue) await fillMissingMedia(entry);
      }));
      setMessage(
        "Đã đọc " + next.length + " từ. Kiểm tra nội dung trước khi lưu.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không đọc được file.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }
  const [revision, setRevision] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setLoadError(""); setRevision(null);
    getVocabularyDraft(topic).then(result => { if (active) { setStatus(result.set.status); setWords(result.words); setRevision(result.revision); } })
      .catch(error => { if (active) setLoadError(error instanceof Error ? error.message : "Không tải được bản nháp."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [topic, reload]);
  const [status,setStatus] = useState("DRAFT");
  async function saveDraft(publish = false) {
    if (busy || revision === null) return;
    setBusy(true); setMessage("");
    try {
      if (words.some(word => !word.word.trim() || !word.meaning.trim())) throw new Error("Mỗi mục cần có từ và nghĩa tiếng Việt.");
      if (words.some(word => word.image.startsWith("data:"))) throw new Error("Ảnh máy/Pixabay cần upload lên Storage trước khi lưu DB. Ở bước lưu nháp này, thay bằng URL HTTPS hoặc xóa ảnh đó.");
      const result = await saveVocabularyDraft(topic, revision, words);
      setRevision(result.revision);
      if (publish) { await publication("publish", result.revision); return; }
      setMessage(`Đã lưu ${result.wordCount} từ vào database, bản nháp ${result.revision}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được bản nháp."); }
    finally { setBusy(false); }
  }
  async function publication(action: "publish" | "hide" | "show", version: number) {
    setBusy(true);
    try {
      const result = await apiFetch<{status:string;revision:number}>(`/admin/vocabulary/sets/${topic}/publication`, {method:"POST",json:{action,revision:version}});
      setStatus(result.status); setRevision(result.revision);
      setMessage(action === "hide" ? "Đã ẩn khỏi thư viện." : "Bộ từ đã hiển thị trong thư viện người học.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa cập nhật được trạng thái."); }
    finally { setBusy(false); }
  }
  const [chosen, setChosen] = useState<string[]>([]);
  const [target, setTarget] = useState("both");
  async function refreshMedia() {
    const selectedWords = words.filter(word => chosen.includes(word.id) && word.word.trim());
    const queue = selectedWords.values();
    const fields: ("image" | "audio")[] = target === "both" ? ["image", "audio"] : target === "audio" ? ["audio"] : ["image"];
    let missing = 0;
    setBusy(true);
    setMessage("Đang tìm lại media…");
    try {
      await Promise.all(Array.from({ length: Math.min(4, selectedWords.length) }, async () => {
        for (const original of queue) {
          for (const field of fields) {
            try {
              const patch = await findVocabularyMedia(original.word, field);
              if (!patch[field]) missing++;
              setWords(current => current.map(item =>
                item.id === original.id && item.word === original.word && item[field] === original[field]
                  ? { ...item, ...patch } : item));
            } catch { missing++; }
          }
        }
      }));
      setMessage(`Đã tra ${selectedWords.length} từ. ${missing} lượt không tìm được URL; các URL cũ được giữ khi tra lỗi.`);
    } finally { setBusy(false); }
  }
  const visible = words.filter(
    (w) =>
      (w.word + " " + w.meaning)
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filter === "all" ||
        (filter === "ready" && w.image && w.audio) ||
        (filter === "image" && !w.image) ||
        (filter === "audio" && !w.audio)),
  );
  if (loading) return <p role="status">Đang tải bản nháp từ database…</p>;
  if (loadError) return <p role="alert">{loadError} <button onClick={() => setReload(value => value + 1)}>Thử lại</button></p>;
  return (
    <>
      <p className="word-feedback">Bấm Lưu bản nháp để ghi từ vào database. Bấm Công bố để cập nhật thư viện người học.</p>
      <button disabled={busy} onClick={() => setEditingInfo(true)}>Thông tin bộ từ</button>
      {editingInfo && <SetForm initial={set} close={() => setEditingInfo(false)} onSave={async updated => {
        if (revision === null) throw new Error("Chưa tải được bản nháp.");
        const result = await updateVocabularySet({ ...updated, status: "DRAFT", revision });
        setRevision(result.revision); onSetUpdate(updated);
      }} />}
      <header className="set-detail-head">
        {set.cover ? <img src={set.cover} alt="" /> : <span className="directory-cover">{set.title.slice(0, 1)}</span>}
        <div><h1>{set.title}</h1><small>{words.length} từ · {status === "PUBLISHED" ? "Công khai" : status === "HIDDEN" ? "Đã ẩn" : "Bản nháp"}</small>{set.description && <p>{set.description}</p>}</div>
      <div className="word-tools">
        <button aria-label={preview ? "Quay lại chỉnh sửa" : "Xem trước"} title={preview ? "Quay lại chỉnh sửa" : "Xem trước"} onClick={() => setPreview(!preview)}>
          {preview ? "Quay lại chỉnh sửa" : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
        {!preview && (
          <>
            <button onClick={() => {
              setSearch("");
              setFilter("all");
              setWords((items) => [{ id: crypto.randomUUID(), word: "", meaning: "", pos: "", phonetic: "", example: "", translation: "", image: "", audio: "" }, ...items]);
            }}>＋ Thêm từ vựng</button>
            <button disabled={busy} onClick={() => saveDraft()}>
              Lưu bản nháp
            </button>
            <button className="word-primary" disabled={busy || !words.length} onClick={() => saveDraft(true)}>Công bố</button>
            {status !== "DRAFT" && <button disabled={busy || revision === null} onClick={() => revision !== null && publication(status === "HIDDEN" ? "show" : "hide",revision)}>{status === "HIDDEN" ? "Hiện lại bộ từ" : "Ẩn bộ từ"}</button>}
          </>
        )}
      </div></header>
      {!preview && (
        <section
          className="word-import"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) void upload(e.dataTransfer.files[0]);
          }}
        >
          <h2>Nhập bộ từ vựng</h2>
          <p>
            Kéo thả Excel (.xlsx) hoặc CSV để thay danh sách đang chỉnh sửa. Tối
            đa 5 MB, 500 từ.
          </p>
          <div className="word-tools">
            <input
              ref={file}
              type="file"
              hidden
              accept=".xlsx,.csv"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
            <button disabled={busy} onClick={() => file.current?.click()}>
              {busy ? "Đang đọc…" : "Chọn file"}
            </button>
            <a
              download="mau-tu-vung.csv"
              href={
                "data:text/csv;charset=utf-8," +
                encodeURIComponent(
                  "\uFEFF" +
                    csvHeader +
                    "\r\nforest,khu rừng,danh từ,/ˈfɒrɪst/,Forests protect wildlife.,Rừng bảo vệ động vật hoang dã.",
                )
              }
            >
              Tải mẫu CSV
            </a>
          </div>
        </section>
      )}
      {message && <p role="status" className="word-feedback">{message}</p>}
      <section className="word-library"><h2>
        {set.title} <small>· {words.length} từ</small>
      </h2>
      {!preview && (
        <>
          <dl className="media-counts">{[
            ["Đủ ảnh và audio",words.filter(w=>w.image && w.audio).length],
            ["Thiếu ảnh",words.filter(w=>!w.image).length],
            ["Thiếu audio",words.filter(w=>!w.audio).length]
          ].map(([label,count])=><div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}</dl>
          <div className="word-tools">
            <input
              aria-label="Tìm mục từ"
              placeholder="Tìm từ hoặc nghĩa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Lọc trạng thái media"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Mọi trạng thái</option>
              <option value="ready">Đủ ảnh và audio</option>
              <option value="image">Thiếu ảnh</option>
              <option value="audio">Thiếu audio</option>
            </select>
          </div>
        </>
      )}
      {!preview && <fieldset className="bulk-media" disabled={busy}>
        <legend>Tìm lại media</legend>
        <label><input type="checkbox" checked={words.length > 0 && words.every(word => chosen.includes(word.id))}
          onChange={event => setChosen(event.target.checked ? words.map(word => word.id) : [])} /> Chọn tất cả ({words.length})</label>
        <select aria-label="Media cần tìm lại" value={target} onChange={event => setTarget(event.target.value)}>
          <option value="both">Ảnh và audio</option><option value="image">Chỉ ảnh</option><option value="audio">Chỉ audio</option>
        </select>
        <button type="button" disabled={!chosen.length} onClick={refreshMedia}>Tìm lại URL ({chosen.length} từ)</button>
      </fieldset>}
      {(preview ? words : visible).map((w) => (
        <div key={w.id} className="vocab-editor-row">
          {!preview && <label className="select-word"><input type="checkbox" disabled={busy} checked={chosen.includes(w.id)}
            onChange={event => setChosen(ids => event.target.checked ? [...ids, w.id] : ids.filter(id => id !== w.id))} /> Chọn {w.word || "từ mới"}</label>}
          <WordCard entry={w} onImageChange={preview ? undefined : patch => setWords(current => current.map(item => item.id === w.id ? { ...item, ...patch } : item))} />
          {!preview && (
            <WordMediaEditor
              onWordEntered={fillMissingMedia}
              entry={w}
              onChange={(patch) =>
                setWords((prev) =>
                  prev.map((item) =>
                    item.id === w.id ? { ...item, ...patch } : item,
                  ),
                )
              }
            />
          )}
        </div>
      ))}
      {!preview && !visible.length && <p>Không có mục từ phù hợp.</p>}</section>
    </>
  );
}
export default function AdminVocabulary() {
  const [selected, setSelected] = useState<VocabularySet | null>(null);
  return (
    <StaffLayout active="vocabulary" crumb="Quản lý / Từ vựng" contentClassName="vocab-admin">
        <div className="vocabulary">
          {selected ? <>
            <button onClick={() => setSelected(null)}>← Danh sách bộ từ</button>

            <Editor key={selected.id} set={selected} onSetUpdate={setSelected} />
          </> : <SetDirectory onOpen={setSelected} />}
        </div>
    </StaffLayout>
  );
}
