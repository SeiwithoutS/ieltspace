import { useEffect, useState, type FormEvent } from "react";
import Popup from "../../components/attempts/Popup";
import { type VocabularySet } from "../../data/vocabulary";
import { listAdminVocabularySets, createVocabularySet, deleteVocabularySet, type DatabaseVocabularySet } from "../../lib/vocabulary-api";

const coverChoices = [
  ["Tím", "#4338a4", "#6764c4"],
  ["Xanh dương", "#426cb8", "#abc7ef"],
  ["Cam", "#f08b58", "#ffe0a2"],
  ["Xanh lá", "#438261", "#a4d8b5"],
].map(([name, base, highlight]) => ({
  name,
  url: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${base}"/><g fill="${highlight}"><circle cx="245" cy="45" r="42"/><circle cx="25" cy="230" r="104"/></g></svg>`
  ),
}));

interface Props {
  onOpen: (set: VocabularySet) => void;
  onSave?: (set: VocabularySet) => void;
}

export function SetDirectory({ onOpen }: Props) {
  const [deleting, setDeleting] = useState<VocabularySet | null>(null);
  const [status, setStatus] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<VocabularySet | null>(null);
  const [records, setRecords] = useState<DatabaseVocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [removing, setRemoving] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    listAdminVocabularySets().then(result => { if (active) setRecords(result.sets); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "Không tải được danh sách."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);
  const sets = records.map(set => ({ ...set, count: set.wordCount ?? 0, published: set.status === "PUBLISHED" }));
  const published = sets.filter(set => set.published).length;
  const statusOf = (id: string) => records.find(set => set.id === id)?.status === "HIDDEN" ? "Đã ẩn" : records.find(set => set.id === id)?.status === "PUBLISHED" ? "Công khai" : "Bản nháp";
  const visible = sets.filter(set => (status === "Tất cả" || status === statusOf(set.id)) && set.title.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));

  return <>
    <header className="vocab-hero">
      <div><h1>Quản lý bộ từ vựng</h1><p>Nhập từ, quản lý nội dung và công bố bộ từ cho người học.</p></div>
      <button className="word-primary" onClick={() => { setEditing({ id: "", title: "", cover: "" }); }}>＋ Tạo bộ từ</button>
    </header>
    <dl className="set-stats">
      {Object.entries({ "Tổng bộ từ": sets.length, "Tổng số từ": sets.reduce((n, set) => n + set.count, 0), "Đã công bố": published, "Bản nháp": sets.filter(set => statusOf(set.id) === "Bản nháp").length, "Đã ẩn": sets.filter(set => set.status === "HIDDEN").length }).map(([label, count]) =>
        <div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}
    </dl>
    {editing && <SetForm initial={editing} onSave={async set => { const result = await createVocabularySet(set); setRecords(current => [result.set, ...current]); setQuery(""); setStatus("Tất cả"); }} close={() => setEditing(null)} />}
    {deleting && <Popup title="Xóa bộ từ" onCancel={() => setDeleting(null)}>
      <div className="vocabulary set-modal"><h2>Xóa bộ “{deleting.title}”?</h2>
      <p>Bộ nháp này sẽ bị xóa khỏi database. Bộ đã công bố không thể xóa tại bước này.</p>
      <div className="word-tools"><button autoFocus onClick={() => setDeleting(null)}>Hủy</button>
      <button disabled={removing} onClick={async () => {
        setRemoving(true);
        try { await deleteVocabularySet(deleting.id); setRecords(items => items.filter(item => item.id !== deleting.id)); setDeleting(null); }
        catch (error) { setError(error instanceof Error ? error.message : "Không xóa được bộ."); setDeleting(null); }
        finally { setRemoving(false); }
      }}>Xóa bộ từ</button></div></div>
    </Popup>}
    <div className="word-tools"><input aria-label="Tìm bộ từ theo tên" type="search" placeholder="Tìm bộ từ theo tên…" value={query} onChange={e => setQuery(e.target.value)} />
      <div className="vocab-tabs set-filters">{["Tất cả", "Công khai", "Bản nháp", "Đã ẩn"].map(label => <button key={label} aria-pressed={label === status} onClick={() => setStatus(label)}>{label}</button>)}</div>
      </div>
    {loading && <p role="status">Đang tải danh sách từ database…</p>}
    {error && <p role="alert">{error} <button onClick={() => setReload(value => value + 1)}>Thử lại</button></p>}
    <section className="word-library"><h2>Danh sách bộ từ</h2>
      <div className="set-directory">
        <table><thead><tr>{["Tên bộ từ", "Số từ", "Trạng thái", "Thao tác"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{visible.map(set => <tr key={set.id}><td><div className="set-row-title">
          {set.cover ? <img src={set.cover} alt="" className="directory-cover" /> : <span className="directory-cover">{set.title.slice(0, 1)}</span>}
          <strong>{set.title}</strong></div></td><td>{set.count}</td><td>
          <span className="set-status" data-public={set.published}>{statusOf(set.id)}</span></td><td><div className="set-actions">
          <button onClick={() => onOpen(set)}>Mở ›</button>
          <button className="delete-set" aria-label={"Xóa bộ " + set.title} title="Xóa bộ từ" onClick={() => setDeleting(set)}>
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15"/></svg>
          </button>
        </div></td></tr>)}</tbody></table>
        {!loading && !error && !visible.length && <p>Không tìm thấy bộ từ.</p>}
      </div>
    </section>
  </>;
}

export function SetForm({ initial, onSave, close }: { initial: VocabularySet; onSave: (set: VocabularySet) => void | Promise<void>; close: () => void }) {
  const [editing, setEditing] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing || saving) return;
    const title = editing.title.trim();
    if (!title) { setError("Nhập tên bộ từ."); return; }
    setSaving(true);
    try {
      await onSave({ id: editing.id, title, description: editing.description?.trim(), cover: editing.cover.trim() });
      close();

      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Chưa lưu được bộ từ vào database.");
    } finally { setSaving(false); }
  }

  return <Popup title={editing.id ? "Sửa bộ từ" : "Tạo bộ từ mới"} onCancel={close}>
    <form className="vocabulary set-modal" onSubmit={submit}>
      <button type="button" className="modal-close" aria-label="Đóng" onClick={close}>×</button>
      <h2>{editing.id ? "Sửa bộ từ" : "Tạo bộ từ"}</h2>
      <p>{editing.id ? "Cập nhật thông tin bộ từ." : "Bộ mới ở trạng thái Bản nháp. Thêm từ sau khi tạo bộ."}</p>
      <div className="set-form-grid"><div>
        <div className="cover-preview">{editing.cover ? <img src={editing.cover} alt="Ảnh bìa" /> : "Ảnh bìa ngang 3:2"}</div>
        <label>Hoặc tải ảnh bìa<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) {
            setError("Chọn ảnh JPG, PNG hoặc WebP tối đa 1 MB."); return;
          }
          const reader = new FileReader();
          reader.onload = () => { setEditing(current => current === editing ? { ...current, cover: String(reader.result) } : current); setError(""); };
          reader.onerror = () => setError("Chưa đọc được ảnh.");
          reader.readAsDataURL(file);
        }} /></label>
        <div className="cover-options">{coverChoices.map(choice =>
          <button type="button" key={choice.name} aria-label={"Chọn bìa " + choice.name}
            aria-pressed={editing.cover === choice.url} onClick={() => setEditing({ ...editing, cover: choice.url })}>
            <img src={choice.url} alt="" />
          </button>)}</div><small>JPG, PNG hoặc WebP, tối đa 1 MB.</small>
      </div><div className="word-fields">
        <label>Tên bộ từ<input required maxLength={80} autoFocus value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>URL ảnh bìa<input type="url" placeholder="https://…" value={editing.cover.startsWith("data:") ? "" : editing.cover} onChange={e => setEditing({ ...editing, cover: e.target.value })} /></label>

        <label>Mô tả (không bắt buộc)<textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
      </div></div>
      {error && <p role="alert">{error}</p>}
      <div className="word-tools"><button type="button" onClick={close}>Hủy</button><button disabled={saving} className="word-primary">{editing.id ? "Lưu thay đổi" : "＋ Tạo bộ từ"}</button></div>
    </form></Popup>;
}
