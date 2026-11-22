import { apiFetch } from "../../lib/shared/api";
import StaffLayout from "../../components/layout/StaffLayout";
import { SetDirectory, SetForm, VocabularySetCover, VocabularyStats, statusLabels, statusTone } from "./SetDirectory";
import { Button, Chip, ConfirmDialog, FilterBar, Icon, PageHeader, SearchField, TextField, useToast } from "../../components/shared/ui";
import { useEffect, useRef, useState } from "react";
import type { VocabularySet, Word } from "../../data/vocabulary";
import { importWords } from "../../lib/vocabulary/vocabulary-import";
import { WordCard } from "../../components/vocabulary/WordCard";
import { getVocabularyDraft, saveVocabularyDraft, updateVocabularySet, type DatabaseVocabularySet } from "../../lib/vocabulary/vocabulary-api";
import { findVocabularyMedia } from "../../lib/vocabulary/vocabulary-media";
import { WordMediaEditor } from "../../components/vocabulary/WordMediaEditor";
import { VisibilityIcon } from "../../components/shared/VisibilityIcon";
import { canNavigate, registerNavigationGuard } from "../../lib/shared/navigation-guard";
import "./vocabulary.css";
import "./admin-vocabulary.css";

const mediaFields = ["image", "audio"] as const;
type ImportPhase = "reading" | "saving" | "lookup" | "saving-media";

async function lookupMedia(entry: Word, field: typeof mediaFields[number]): Promise<Partial<Word>> {
  try {
    return await findVocabularyMedia(entry.word, field);
  } catch {
    return { mediaMessage: "Chưa tra được media. Kiểm tra đăng nhập, backend và cấu hình API key." };
  }
}

function Editor({ set, onSetUpdate }: { set: VocabularySet; onSetUpdate: (set: VocabularySet) => void }) {
  const [editingInfo, setEditingInfo] = useState(false);
  // Thông báo tạm (đã lưu, đã xóa...) dùng Toast; tiến trình và lỗi vẫn ở `message` (hiện trên trang).
  const toast = useToast();
  const topic = set.id;
  const [words, setWords] = useState<Word[]>([]),
    [preview, setPreview] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const savedWords = useRef<Word[]>([]);
  const importPhase = useRef<ImportPhase | null>(null);
  const pendingImages = useRef(0);
  function trackImageTransfer(active: boolean) {
    pendingImages.current += active ? 1 : -1;
  }
  const importJob = useRef<AbortController | null>(null);
  useEffect(() => () => importJob.current?.abort(), []);

  useEffect(() => {
    const unregister = registerNavigationGuard(() => {
      if (importPhase.current === "lookup") {
        return window.confirm("Danh sách từ đã lưu. Rời trang sẽ dừng phần tra ảnh và audio còn lại. Bạn muốn rời đi?");
      }
      if (busy || importPhase.current || pendingImages.current > 0) {
        window.alert("Đang xử lý bộ từ. Hãy đợi thao tác hoàn tất trước khi rời trang.");
        return false;
      }
      return words === savedWords.current || window.confirm("Bộ từ có thay đổi chưa lưu. Bạn muốn rời trang?");
    });
    function beforeUnload(event: BeforeUnloadEvent) {
      if (importPhase.current === "lookup") return;
      if (busy || importPhase.current || pendingImages.current > 0 || words !== savedWords.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      unregister();
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [busy, words]);

  async function fillMissingMedia(entry: Word) {
    if (!entry.word.trim()) return;
    await Promise.all(mediaFields.map(async field => {
      if (entry[field]) return;
      const patch = await lookupMedia(entry, field);
      setWords(items => items.map(item =>
        item.id === entry.id && item.word === entry.word && !item[field]
          ? { ...item, ...patch } : item));
    }));
  }

  async function upload(f?: File) {
    if (!f || busy || importPhase.current || revision === null) return;
    const job = new AbortController();
    const { signal } = job;
    importJob.current = job;
    importPhase.current = "reading";
    setBusy(true);
    setMessage("Đang đọc tệp từ vựng…");
    try {
      const next = await importWords(f);
      if (signal.aborted) return;
      if (words.length && !window.confirm(`Thay ${words.length} từ đang chỉnh sửa bằng ${next.length} từ trong tệp và lưu bản nháp?`)) {
        setMessage("");
        return;
      }
      setChosen([]);
      setWords(next);
      importPhase.current = "saving";
      setMessage(`Đang lưu ${next.length} từ vào bản nháp…`);
      const saved = await saveVocabularyDraft(topic, revision, next);
      if (signal.aborted) return;
      savedWords.current = next;
      setRevision(saved.revision);

      importPhase.current = "lookup";
      setMessage(`Đã lưu ${next.length} từ vào bản nháp. Đang tìm ảnh và audio…`);
      const queue = next.entries();
      const enriched = [...next];
      await Promise.all(Array.from({ length: Math.min(4, next.length) }, async () => {
        for (const [index, entry] of queue) {
          if (signal.aborted) break;
          const [image, audio] = await Promise.all(mediaFields.map(field => lookupMedia(entry, field)));
          enriched[index] = { ...entry, ...image, ...audio, mediaMessage: [image.mediaMessage, audio.mediaMessage].filter(Boolean).join(" ") };
        }
      }));
      if (signal.aborted) return;

      setWords(enriched);
      if (enriched.some(word => word.image || word.audio)) {
        importPhase.current = "saving-media";
        const result = await saveVocabularyDraft(topic, saved.revision, enriched);
        if (signal.aborted) return;
        setRevision(result.revision);
      }
      savedWords.current = enriched;
      setMessage("");
      toast.show(`Đã lưu bản nháp ${next.length} từ và hoàn tất tra ảnh, audio. Kiểm tra nội dung trước khi công bố.`, { ms: 6000 });
    } catch (e) {
      if (signal.aborted) return;
      const detail = e instanceof Error ? e.message : "Thao tác không thành công.";
      const context = importPhase.current === "saving-media"
        ? "Danh sách từ đã lưu. Chưa lưu được kết quả tra ảnh và audio."
        : importPhase.current === "saving" ? "Chưa lưu được danh sách vào bản nháp." : "Không đọc được tệp.";
      setMessage(`${context} ${detail}`);
    } finally {
      importPhase.current = null;
      importJob.current = null;
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
    getVocabularyDraft(topic).then(result => { if (active) { savedWords.current = result.words; setStatus(result.set.status); setWords(result.words); setRevision(result.revision); } })
      .catch(error => { if (active) setLoadError(error instanceof Error ? error.message : "Không tải được bản nháp."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [topic, reload]);
  const [status, setStatus] = useState<DatabaseVocabularySet["status"]>("DRAFT");
  async function saveDraft(publish = false) {
    if (busy || revision === null) return;
    if (pendingImages.current > 0) {
      setMessage("Đợi ảnh tải xong trước khi lưu bộ từ.");
      return;
    }
    setBusy(true); setMessage("");
    try {
      if (words.some(word => !word.word.trim() || !word.meaning.trim())) throw new Error("Mỗi mục cần có từ và nghĩa tiếng Việt.");
      if (words.some(word => word.image.startsWith("data:"))) throw new Error("Hãy tải lại ảnh tạm hoặc chọn ảnh đã lưu trước khi lưu bộ từ.");
      const result = await saveVocabularyDraft(topic, revision, words);
      savedWords.current = words;
      setRevision(result.revision);
      if (publish) { await publication("publish", result.revision); return; }
      toast.show(`Đã lưu ${result.wordCount} từ vào database, bản nháp ${result.revision}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không lưu được bản nháp."); }
    finally { setBusy(false); }
  }
  async function publication(action: "publish" | "hide" | "show", version: number) {
    setBusy(true);
    try {
      const result = await apiFetch<{status: DatabaseVocabularySet["status"]; revision: number}>(`/admin/vocabulary/sets/${topic}/publication`, {method:"POST",json:{action,revision:version}});
      setStatus(result.status); setRevision(result.revision);
      setMessage("");
      toast.show(action === "hide" ? "Đã ẩn khỏi thư viện." : "Bộ từ đã hiển thị trong thư viện người học.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa cập nhật được trạng thái."); }
    finally { setBusy(false); }
  }
  const [chosen, setChosen] = useState<string[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const wordListHeading = useRef<HTMLHeadingElement>(null);
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
      setMessage("");
      toast.show(`Đã tra ${selectedWords.length} từ. ${missing} lượt không tìm được URL; các URL cũ được giữ khi tra lỗi.`, { ms: 6000 });
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
  const chosenIds = new Set(chosen);
  const hiddenChosenCount = chosenIds.size - visible.filter(word => chosenIds.has(word.id)).length;

  function removeChosenWords() {
    if (busy || !chosenIds.size) return;
    setWords(current => current.filter(word => !chosenIds.has(word.id)));
    setChosen([]);
    setConfirmingDelete(false);
    setMessage("");
    toast.show(`Đã xóa ${chosenIds.size} từ khỏi danh sách đang chỉnh sửa. Bấm Lưu để lưu thay đổi.`, { ms: 6000 });
    requestAnimationFrame(() => wordListHeading.current?.focus({ preventScroll: true }));
  }

  if (loading) return <p className="vocab-panel vocab-empty" role="status">Đang tải bản nháp…</p>;
  if (loadError) return (
    <div className="vocab-feedback flex flex-wrap items-center justify-between gap-3" role="alert">
      {loadError} <button type="button" className="ui-btn" onClick={() => setReload(value => value + 1)}>Thử lại</button>
    </div>
  );
  const visibilityLabel = status === "HIDDEN" ? "Hiện lại bộ từ" : "Ẩn bộ từ";
  return (
    <>
      {editingInfo && <SetForm initial={set} close={() => setEditingInfo(false)} onSave={async updated => {
        if (revision === null) throw new Error("Chưa tải được bản nháp.");
        const result = await updateVocabularySet({ ...updated, status: "DRAFT", revision });
        setRevision(result.revision); onSetUpdate(updated);
      }} />}
      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={removeChosenWords}
        label="Xóa từ đã chọn"
        width={440}
        tone="danger"
        icon={<Icon name="trash" size={20} />}
        title={`Xóa ${chosenIds.size} từ đã chọn?`}
        cancelVariant="danger"
        confirmVariant="danger-solid"
        confirmClassName="ui-btn--on-solid"
        confirmLabel={<><Icon name="trash" />Xóa từ</>}
      >
        {hiddenChosenCount > 0 && <p>Trong số này có {hiddenChosenCount} từ nằm ngoài bộ lọc hiện tại.</p>}
        <p>Các từ sẽ được bỏ khỏi danh sách đang chỉnh sửa. Bấm Lưu để lưu thay đổi.</p>
      </ConfirmDialog>
      <PageHeader
        className="vocab-detail-header"
        title={set.title}
        description={set.description}
        lead={<VocabularySetCover set={set} size="lg" />}
        meta={
          <div className="vocab-detail-meta">
            <Chip tone={statusTone[status]}>{statusLabels[status]}</Chip>
            <span className="vocab-detail-count">{words.length} từ</span>
          </div>
        }
        actions={
          <>
            <Button className="press" onClick={() => setPreview(!preview)}>
              {preview ? "Quay lại chỉnh sửa" : "Xem trước"}
            </Button>
            {!preview && <Button className="press" disabled={busy} onClick={() => setEditingInfo(true)}>Thông tin bộ từ</Button>}
          </>
        }
      />
      {!preview && (
        <section className="vocab-panel vocab-edit-toolbar" aria-label="Thao tác bộ từ">
          <button type="button" className="ui-btn" disabled={busy} onClick={() => {
            setSearch("");
            setFilter("all");
            setWords(items => [{ id: crypto.randomUUID(), word: "", meaning: "", pos: "", phonetic: "", example: "", translation: "", image: "", audio: "" }, ...items]);
          }}>＋ Thêm từ vựng</button>
          <div className="flex flex-wrap gap-2">
            {status !== "DRAFT" && <button type="button" className="ui-btn ui-btn--icon" disabled={busy || revision === null}
              aria-label={visibilityLabel} title={visibilityLabel}
              onClick={() => revision !== null && publication(status === "HIDDEN" ? "show" : "hide", revision)}>
              <VisibilityIcon visible={status === "PUBLISHED"} />
            </button>}
            <button type="button" className="ui-btn" disabled={busy} onClick={() => saveDraft()}>Lưu</button>
            <button type="button" className="ui-btn ui-btn--primary" disabled={busy || !words.length} onClick={() => saveDraft(true)}>
              Công bố
            </button>
          </div>
        </section>
      )}
      {message && <p role="status" className="vocab-feedback">{message}</p>}
      {toast.node}
      {!preview && (
        <section
          className="vocab-panel vocab-edit-toolbar vocab-import-panel"
          aria-labelledby="vocab-import-title"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) void upload(e.dataTransfer.files[0]);
          }}
        >
          <div className="flex items-start gap-3">
            <span className="vocab-import-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg>
            </span>
            <div>
              <h2 id="vocab-import-title">Nhập từ vựng từ tệp</h2>
              <p>Chọn hoặc kéo thả Excel (.xlsx) hay CSV. Hệ thống lưu bản nháp rồi tra ảnh và audio. Tối đa 5 MB, 500 từ.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={file}
              type="file"
              hidden
              accept=".xlsx,.csv"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
            <button type="button" className="ui-btn" disabled={busy} onClick={() => file.current?.click()}>
              Chọn tệp
            </button>
            <a
              className="ui-btn" download
              href={`${import.meta.env.BASE_URL}templates/mau-tu-vung.xlsx`}
            >
              Tải Excel mẫu
            </a>
          </div>
        </section>
      )}
      <section className="min-w-0 grid gap-4" aria-labelledby="vocab-word-list-title">
      <div className="vocab-section-heading">
        <h2 id="vocab-word-list-title" ref={wordListHeading} tabIndex={-1}>{preview ? "Xem trước danh sách từ" : "Danh sách từ vựng"}</h2>
        <small>{preview ? words.length : visible.length} từ</small>
      </div>
      {!preview && (
        <>
          <VocabularyStats stats={[
            ["Đủ ảnh và audio", words.filter(word => word.image && word.audio).length],
            ["Thiếu ảnh", words.filter(word => !word.image).length],
            ["Thiếu audio", words.filter(word => !word.audio).length],
          ]} />
          <FilterBar
            label="Tìm và lọc từ"
            filtered={Boolean(search || filter !== "all")}
            onClear={() => { setSearch(""); setFilter("all"); }}
          >
            <SearchField label="Tìm mục từ" placeholder="Tìm từ hoặc nghĩa…" value={search} onChange={setSearch} />
            <TextField as="select" label="Lọc trạng thái media" hideLabel value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="all">Mọi trạng thái</option>
              <option value="ready">Đủ ảnh và audio</option>
              <option value="image">Thiếu ảnh</option>
              <option value="audio">Thiếu audio</option>
            </TextField>
          </FilterBar>
          <div className="vocab-panel">
            <fieldset className="vocab-edit-toolbar vocab-bulk-toolbar" aria-label="Thao tác với các từ đã chọn" disabled={busy}>
              <label className="vocab-select-word">
                <input type="checkbox" checked={words.length > 0 && words.every(word => chosenIds.has(word.id))}
                  onChange={event => setChosen(event.target.checked ? words.map(word => word.id) : [])} />
                Chọn tất cả ({words.length})
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <TextField as="select" label="Media cần tìm lại" hideLabel value={target} onChange={event => setTarget(event.target.value)}>
                  <option value="both">Ảnh và audio</option>
                  <option value="image">Chỉ ảnh</option>
                  <option value="audio">Chỉ audio</option>
                </TextField>
                <Button disabled={!chosen.length} onClick={refreshMedia}>Tìm lại URL ({chosen.length} từ)</Button>
                <Button variant="danger" disabled={!chosen.length} onClick={() => setConfirmingDelete(true)}>
                  Xóa từ đã chọn{chosen.length > 0 && ` (${chosen.length})`}
                </Button>
              </div>
            </fieldset>
          </div>
        </>
      )}
      {(preview ? words : visible).map((w) => (
        <div key={w.id} className="vocab-panel vocab-editor-row">
          {!preview && <label className="vocab-select-word"><input type="checkbox" disabled={busy} checked={chosenIds.has(w.id)}
            onChange={event => setChosen(ids => event.target.checked ? [...ids, w.id] : ids.filter(id => id !== w.id))} /> Chọn {w.word || "từ mới"}</label>}
          <fieldset className="m-0 min-w-0 border-0 p-0" disabled={busy}>
            <WordCard entry={w} onImageTransfer={trackImageTransfer} onImageChange={preview ? undefined : patch => setWords(current => current.map(item => item.id === w.id ? { ...item, ...patch } : item))} />
            {!preview && (
              <WordMediaEditor
                onWordEntered={fillMissingMedia}
                onImageTransfer={trackImageTransfer}
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
          </fieldset>
        </div>
      ))}
      {!(preview ? words.length : visible.length) && (
        <p className="vocab-panel vocab-empty">{words.length ? "Không có mục từ phù hợp." : "Bộ từ này chưa có từ nào."}</p>
      )}
      </section>
    </>
  );
}
export default function AdminVocabulary() {
  const [selected, setSelected] = useState<VocabularySet | null>(null);
  return (
    <StaffLayout active="vocabulary" crumb="Quản lý / Từ vựng" contentClassName="vocab-admin p-4 sm:p-6 md:p-8">
        <div className="vocabulary vocab-admin-content">
          {selected ? <>
            <button type="button" className="ui-back" onClick={() => { if (canNavigate()) setSelected(null); }}>← Danh sách bộ từ</button>

            <Editor key={selected.id} set={selected} onSetUpdate={setSelected} />
          </> : <SetDirectory onOpen={setSelected} />}
        </div>
    </StaffLayout>
  );
}
