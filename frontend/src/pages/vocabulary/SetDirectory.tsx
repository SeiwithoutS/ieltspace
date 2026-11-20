import { useEffect, useRef, useState, type FormEvent } from "react";
import Popup from "../../components/attempts/Popup";
import { StaffDataTable } from "../../components/shared/StaffDataTable";
import { type VocabularySet } from "../../data/vocabulary";
import { listAdminVocabularySets, createVocabularySet, deleteVocabularySet, type DatabaseVocabularySet } from "../../lib/vocabulary/vocabulary-api";
import { isManagedVocabularyImage, uploadVocabularyImage, useVocabularyImagePreview } from "../../lib/vocabulary/vocabulary-media";

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

type SetStatus = DatabaseVocabularySet["status"];

const statusLabels: Record<SetStatus, string> = {
  PUBLISHED: "Công khai",
  DRAFT: "Bản nháp",
  HIDDEN: "Đã ẩn",
};
const statusOptions = ["", "PUBLISHED", "DRAFT", "HIDDEN"] as const;

export function VocabularySetStatus({ status }: { status: SetStatus }) {
  return <span className="vocab-status" data-status={status}>{statusLabels[status]}</span>;
}

export function VocabularyStats({ stats }: { stats: readonly (readonly [string, number | string])[] }) {
  return (
    <dl className="vocab-stats">
      {stats.map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}
    </dl>
  );
}

export function VocabularySearch({ label, placeholder, value, onSearch }: {
  label: string; placeholder: string; value: string; onSearch: (value: string) => void;
}) {
  return (
    <label className="vocab-search">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>
      <input aria-label={label} type="search" placeholder={placeholder} value={value} onChange={event => onSearch(event.target.value)} />
    </label>
  );
}

export function SetDirectory({ onOpen }: { onOpen: (set: VocabularySet) => void }) {
  const [deleting, setDeleting] = useState<VocabularySet | null>(null);
  const [status, setStatus] = useState<SetStatus | "">("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
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
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const visible = records.filter(set => (!status || status === set.status) && set.title.toLocaleLowerCase("vi").includes(normalizedQuery));
  const stats = [
    ["Tổng bộ từ", records.length],
    ["Tổng số từ", records.reduce((total, set) => total + (set.wordCount ?? 0), 0)],
    ["Công khai", records.filter(set => set.status === "PUBLISHED").length],
    ["Bản nháp", records.filter(set => set.status === "DRAFT").length],
    ["Đã ẩn", records.filter(set => set.status === "HIDDEN").length],
  ] as const;

  return <>
    <header className="vocab-page-header">
      <div><h1>Quản lý bộ từ vựng</h1><p>Nhập từ, quản lý nội dung và công bố bộ từ cho người học.</p></div>
      <button type="button" className="vocab-button vocab-button-primary" onClick={() => setCreating(true)} aria-haspopup="dialog">＋ Tạo bộ từ</button>
    </header>
    <VocabularyStats stats={stats.map(([label, count]) => [label, loading || (error && !records.length) ? "—" : count])} />
    {creating && <SetForm initial={{ id: "", title: "", cover: "" }} onSave={async set => {
      const result = await createVocabularySet(set);
      setRecords(current => [result.set, ...current]);
      setQuery("");
      setStatus("");
      setError("");
    }} close={() => setCreating(false)} />}
    {deleting && <Popup title="Xóa bộ từ" onCancel={() => setDeleting(null)}>
      <div className="vocabulary vocab-set-dialog vocab-delete-dialog"><h2>Xóa bộ “{deleting.title}”?</h2>
      <p>Bộ nháp này sẽ bị xóa khỏi database. Bộ đã công bố không thể xóa tại bước này.</p>
      <div className="vocab-dialog-actions"><button type="button" className="vocab-button" autoFocus onClick={() => setDeleting(null)}>Hủy</button>
      <button type="button" className="vocab-button vocab-button-danger" disabled={removing} onClick={async () => {
        setRemoving(true);
        try { await deleteVocabularySet(deleting.id); setRecords(items => items.filter(item => item.id !== deleting.id)); setDeleting(null); }
        catch (error) { setError(error instanceof Error ? error.message : "Không xóa được bộ."); setDeleting(null); }
        finally { setRemoving(false); }
      }}>Xóa bộ từ</button></div></div>
    </Popup>}
    <section className="vocab-panel" aria-labelledby="vocab-filter-title">
      <div className="vocab-section-heading">
        <h2 id="vocab-filter-title">Tìm và lọc bộ từ</h2>
        {(query || status) && <button type="button" className="vocab-button" onClick={() => { setQuery(""); setStatus(""); }}>Xóa bộ lọc</button>}
      </div>
      <div className="vocab-filter-row">
        <VocabularySearch label="Tìm bộ từ theo tên" placeholder="Tìm theo tên bộ từ" value={query} onSearch={setQuery} />
        <div className="vocab-tabs vocab-admin-tabs" role="group" aria-label="Trạng thái bộ từ">
          {statusOptions.map(option => <button type="button" key={option} aria-pressed={option === status} onClick={() => setStatus(option)}>{option ? statusLabels[option] : "Tất cả"}</button>)}
        </div>
      </div>
    </section>

    {error && <div className="vocab-feedback flex flex-wrap items-center justify-between gap-3" role="alert">
      <span>{error}</span>
      <button type="button" className="vocab-button" onClick={() => setReload(value => value + 1)}>Tải lại danh sách</button>
    </div>}
    <section className="vocab-panel" aria-labelledby="vocab-list-title" aria-busy={loading}>
      <div className="vocab-section-heading">
        <h2 id="vocab-list-title">Danh sách bộ từ</h2>
        {!loading && <small role="status">{visible.length} bộ từ</small>}
      </div>
      {loading ? <p className="vocab-empty" role="status">Đang tải danh sách…</p> : (
        <StaffDataTable className="vocab-directory-table" label="Bảng danh sách bộ từ">
          <thead><tr>{["Tên bộ từ", "Số từ", "Trạng thái", "Thao tác"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
          <tbody>
            {visible.map(set => <tr key={set.id}>
              <td>
                <div className="flex items-center gap-3">
                  <VocabularySetCover set={set} />
                  <strong className="break-words">{set.title}</strong>
                </div>
              </td>
              <td className="tabular-nums">{set.wordCount ?? 0}</td>
              <td><VocabularySetStatus status={set.status} /></td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" className="vocab-button" aria-label={`Mở bộ ${set.title}`} onClick={() => onOpen(set)}>Mở <span aria-hidden="true">›</span></button>
                  <button type="button" className="vocab-button vocab-button-icon vocab-button-danger" aria-label={`Xóa bộ ${set.title}`}
                    title={set.status === "DRAFT" ? "Xóa bộ từ" : "Chỉ xóa được bộ từ ở trạng thái bản nháp"} disabled={set.status !== "DRAFT"} onClick={() => setDeleting(set)}>
                    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15"/></svg>
                  </button>
                </div>
              </td>
            </tr>)}
            {!visible.length && <tr><td className="vocab-empty" colSpan={4}>
              {error ? "Chưa tải được danh sách." : query || status ? "Không có bộ từ phù hợp với bộ lọc." : "Chưa có bộ từ nào."}
            </td></tr>}
          </tbody>
        </StaffDataTable>
      )}
    </section>
  </>;
}

export function VocabularySetCover({ set }: { set: VocabularySet }) {
  const { source, renew } = useVocabularyImagePreview(set.cover, set.coverPreview);
  return source ? <img src={source} alt="" className="vocab-set-cover" onError={() => void renew()} /> :
    <span className="vocab-set-cover" aria-hidden="true">{set.title.slice(0, 1)}</span>;
}

export function SetForm({ initial, onSave, close }: { initial: VocabularySet; onSave: (set: VocabularySet) => void | Promise<void>; close: () => void }) {
  const coverInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const managed = isManagedVocabularyImage(editing.cover);
  const { source: coverSource, renew } = useVocabularyImagePreview(editing.cover, editing.coverPreview);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    const title = editing.title.trim();
    if (!title) { setError("Nhập tên bộ từ."); return; }
    setSaving(true);
    try {
      await onSave({ id: editing.id, title, description: editing.description?.trim(), cover: editing.cover.trim(), coverPreview: editing.coverPreview });
      close();

      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Chưa lưu được bộ từ vào database.");
    } finally { setSaving(false); }
  }

  return <Popup title={editing.id ? "Sửa bộ từ" : "Tạo bộ từ mới"} onCancel={close}>
    <form className="vocabulary vocab-set-dialog" onSubmit={submit}>
      <button type="button" className="vocab-button vocab-button-icon vocab-dialog-close" aria-label="Đóng" onClick={close}>×</button>
      <h2>{editing.id ? "Sửa bộ từ" : "Tạo bộ từ"}</h2>
      <p>{editing.id ? "Cập nhật thông tin bộ từ." : "Bộ mới ở trạng thái Bản nháp. Thêm từ sau khi tạo bộ."}</p>
      <div className="set-form-grid"><div>
        <div className="cover-preview">{coverSource ? <img src={coverSource} alt="Ảnh bìa" onError={() => void renew()} /> : "Ảnh bìa ngang 3:2"}</div>
        <input ref={coverInput} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={async e => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || uploading || saving) return;
          if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) {
            setError("Chọn ảnh JPG, PNG hoặc WebP tối đa 1 MB."); return;
          }
          setUploading(true);
          setError("");
          try {
            const { image, imagePreview } = await uploadVocabularyImage(file);
            setEditing(current => ({ ...current, cover: image, coverPreview: imagePreview }));
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : "Chưa tải được ảnh bìa.");
          } finally {
            setUploading(false);
          }
        }} />
        <button type="button" className="vocab-button vocab-upload-cover" disabled={uploading || saving} onClick={() => coverInput.current?.click()}>{uploading ? "Đang tải ảnh…" : "Tải ảnh bìa lên"}</button>
        <div className="cover-options">{coverChoices.map(choice =>
          <button type="button" key={choice.name} aria-label={"Chọn bìa " + choice.name}
            disabled={uploading} aria-pressed={editing.cover === choice.url} onClick={() => setEditing({ ...editing, cover: choice.url, coverPreview: undefined })}>
            <img src={choice.url} alt="" />
          </button>)}</div><small>JPG, PNG hoặc WebP, tối đa 1 MB.</small>
      </div><div className="word-fields">
        <label>Tên bộ từ<input required maxLength={80} autoFocus placeholder="Ví dụ: Từ vựng chủ đề Môi trường" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>URL ảnh bìa<input type="url" disabled={uploading} placeholder="https://…" value={managed || editing.cover.startsWith("data:") ? "" : editing.cover} onChange={e => setEditing({ ...editing, cover: e.target.value, coverPreview: undefined })} /></label>

        <label>Mô tả (không bắt buộc)<textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
      </div></div>
      {error && <p role="alert" className="vocab-feedback">{error}</p>}
      <div className="vocab-dialog-actions"><button type="button" className="vocab-button" onClick={close}>Hủy</button><button type="submit" disabled={saving || uploading} className="vocab-button vocab-button-primary">{saving ? "Đang lưu…" : editing.id ? "Lưu thay đổi" : "＋ Tạo bộ từ"}</button></div>
    </form></Popup>;
}
