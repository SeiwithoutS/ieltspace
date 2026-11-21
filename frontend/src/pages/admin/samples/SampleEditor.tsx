import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import SampleUploadFrame from "./SampleUploadFrame";
import AutoTextarea from "../../../components/exams/lr-editor/AutoTextarea";
import SampleMediaPreview from "../../../components/samples/SampleMediaPreview";
import { VisibilityIcon } from "../../../components/shared/VisibilityIcon";
import type { SampleAssetKind, SampleMediaRef } from "../../../lib/samples/sample-media-types";
import StaffLayout from "../../../components/layout/StaffLayout";
import { sampleApi } from "../../../lib/samples/sample-api";
import {
  SAMPLE_BANDS,
  SAMPLE_STATUS_LABELS,
  SAMPLE_TYPE_LABELS,
  changeSpeakingPart,
  changeWritingType,
  newSampleDocument,
  newSpeakingItem,
  sampleEditorHref,
  sampleErrorMessages,
  wordCount,
  writingTypeOptions,
} from "../../../lib/samples/sample-editor";
import { registerNavigationGuard } from "../../../lib/shared/navigation-guard";
import { replaceSampleEditorHash } from "../../../lib/samples/sample-navigation";
import type {
  AdminSampleDetail,
  SampleDocumentV1,
  SampleEditorPageProps,
  SamplePublicationRequest,
  SampleSkill,
} from "../../../lib/samples/sample-types";

import "./admin-samples.css";

interface SampleEditorProps extends SampleEditorPageProps {
  skill: SampleSkill;
}

type CommonPatch = Partial<
  Pick<
    SampleDocumentV1,
    | "title"
    | "topic"
    | "source"
    | "band"
    | "outlineIntro"
    | "outline"
  >
>;

function documentKey(document: SampleDocumentV1): string {
  return JSON.stringify(document);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="sample-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

/**
 * Markdown giới hạn:
 * - Tiêu đề #, ##, ###
 * - Dòng bắt đầu bằng - hoặc •
 * - **đậm**, *nghiêng*
 *
 * Không dùng HTML thô, không tạo <a> hoặc <img> từ nội dung.
 * URL và HTML được hiển thị dưới dạng văn bản.
 */
function SampleMarkdown({ text }: { text: string }) {
  function inline(value: string) {
    return value
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .map((part, index) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        if (/^\*[^*]+\*$/.test(part)) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }

        return <Fragment key={index}>{part}</Fragment>;
      });
  }

  if (!text.trim()) {
    return <p className="sample-muted">Chưa có nội dung.</p>;
  }

  return (
    <div className="sample-markdown">
      {text.split("\n").map((line, index) => {
        if (!line.trim()) {
          return <div key={index} className="sample-markdown-space" />;
        }

        if (/^#{1,3}\s+/.test(line)) {
          return (
            <h3 key={index}>
              {inline(line.replace(/^#{1,3}\s+/, ""))}
            </h3>
          );
        }

        if (/^\s*[-•]\s+/.test(line)) {
          return (
            <div key={index} className="sample-markdown-bullet">
              <span aria-hidden="true">•</span>
              <span>{inline(line.replace(/^\s*[-•]\s+/, ""))}</span>
            </div>
          );
        }

        return <p key={index}>{inline(line)}</p>;
      })}
    </div>
  );
}

function MarkdownField({
  label,
  value,
  onChange,
  rows = 7,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  // ô soạn ôm nội dung, không có thanh cuộn (giống ô soạn Summary/Note của đề)
  useEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  function format(kind: "bold" | "italic" | "heading" | "list") {
    const element = textarea.current;
    if (!element) return;

    const start = element.selectionStart;
    const end = element.selectionEnd;

    let next: string;

    if (kind === "bold" || kind === "italic") {
      const marker = kind === "bold" ? "**" : "*";

      next =
        value.slice(0, start) +
        marker +
        (value.slice(start, end) || "nội dung") +
        marker +
        value.slice(end);
    } else {
      const prefix = kind === "heading" ? "## " : "- ";
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const foundEnd = value.indexOf("\n", end);
      const lineEnd = foundEnd < 0 ? value.length : foundEnd;

      const lines = value.slice(lineStart, lineEnd).split("\n");
      const remove = lines.every((line) => line.startsWith(prefix));

      next =
        value.slice(0, lineStart) +
        lines
          .map((line) =>
            remove
              ? line.slice(prefix.length)
              : prefix + line.replace(/^(#{1,3}\s+|[-•]\s+)/, ""),
          )
          .join("\n") +
        value.slice(lineEnd);
    }

    onChange(next);
    element.focus();
  }

  return (
    <div className="sample-field">
      <span>{label}</span>

      <div className="sample-markdown-editor">
        <div className="sample-markdown-toolbar" role="toolbar" aria-label={`Định dạng ${label}`}>
          <button type="button" title="In đậm" aria-label="In đậm" onClick={() => format("bold")}><b>B</b></button>
          <button type="button" title="In nghiêng" aria-label="In nghiêng" onClick={() => format("italic")}><i>I</i></button>
          <button type="button" title="Tiêu đề" aria-label="Tiêu đề" onClick={() => format("heading")}>H</button>
          <button type="button" title="Gạch đầu dòng" aria-label="Gạch đầu dòng" onClick={() => format("list")}>•</button>
        </div>
        <textarea
          ref={textarea}
          aria-label={label}
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <small className="sample-muted">
        ## tiêu đề; - gạch đầu dòng; **đậm**, *nghiêng*.
        HTML và liên kết được hiển thị dưới dạng văn bản.
      </small>
    </div>
  );
}

function withMedia(
  current: SampleDocumentV1,
  kind: SampleAssetKind,
  media: SampleMediaRef | null,
  itemId?: string,
): SampleDocumentV1 {
  if (kind === "cover") {
    return { ...current, cover: media };
  }

  if (kind === "prompt-image" && current.skill === "WRITING") {
    return { ...current, promptImage: media };
  }

  if (kind === "audio" && current.skill === "SPEAKING" && itemId) {
    return {
      ...current,
      items: current.items.map(item =>
        item.id === itemId
          ? { ...item, audio: media }
          : item,
      ),
    };
  }

  throw new Error("Không xác định được vị trí gắn media.");
}

export default function SampleEditor({
  skill,
  sampleId,
  sampleType,
}: SampleEditorProps) {
  const [document, setDocument] = useState<SampleDocumentV1>(
    () => newSampleDocument(skill, sampleType),
  );
  const [record, setRecord] = useState<AdminSampleDetail | null>(null);
  const [editing, setEditing] = useState(!sampleId);
  const [loading, setLoading] = useState(Boolean(sampleId));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [undoCount, setUndoCount] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);

  const documentRef = useRef(document);
  const recordRef = useRef<AdminSampleDetail | null>(null);
  const savedRef = useRef(documentKey(document));
  const busyRef = useRef(false);
  const historyRef = useRef<SampleDocumentV1[]>([]);
  const lastFieldRef = useRef("");
  const loadSequenceRef = useRef(0);
  const newDraftRoute = sampleId ? null : `${skill}:${sampleType ?? ""}`;
  const initializedDraftRoute = useRef(newDraftRoute);

  const dirty = documentKey(document) !== savedRef.current;

  function resetHistory() {
    historyRef.current = [];
    lastFieldRef.current = "";
    setUndoCount(0);
  }

  function acceptLoaded(sample: AdminSampleDetail) {
    recordRef.current = sample;
    documentRef.current = sample.document;
    savedRef.current = documentKey(sample.document);

    setRecord(sample);
    setDocument(sample.document);
    setEditing(false);
    resetHistory();
  }

  async function loadFromServer(
    id: string,
    sequence: number,
  ): Promise<void> {
    try {
      const response = await sampleApi.get(id);

      if (sequence !== loadSequenceRef.current) return;

      if (response.sample.document.skill !== skill) {
        throw new Error("SAMPLE_WRONG_EDITOR");
      }

      acceptLoaded(response.sample);
      setLoadFailed(false);
    } catch (error: unknown) {
      if (sequence !== loadSequenceRef.current) return;

      setLoadFailed(true);

      setErrors(
        error instanceof Error && error.message === "SAMPLE_WRONG_EDITOR"
          ? ["Bài này thuộc kỹ năng khác. Hãy mở lại từ danh sách bài mẫu."]
          : sampleErrorMessages(error),
      );
    } finally {
      if (sequence === loadSequenceRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const sequence = ++loadSequenceRef.current;

    // The state initializer already prepared this new draft. Avoid resetting
    // the form after the initial paint, when the user can already type.
    if (newDraftRoute !== null && initializedDraftRoute.current === newDraftRoute) {
      return;
    }
    initializedDraftRoute.current = newDraftRoute;

    // Sau POST tạo bài, URL được bổ sung ID nhưng không cần GET lại.
    if (sampleId && recordRef.current?.id === sampleId) {
      return;
    }

    setErrors([]);
    setNotice("");
    setLoadFailed(false);
    recordRef.current = null;
    setRecord(null);
    resetHistory();

    if (!sampleId) {
      const initial = newSampleDocument(skill, sampleType);

      documentRef.current = initial;
      savedRef.current = documentKey(initial);

      setDocument(initial);
      setEditing(true);
      setLoading(false);
    } else {
      setLoading(true);
      void loadFromServer(sampleId, sequence);
    }

    return () => {
      ++loadSequenceRef.current;
    };

    // Chỉ nạp lại khi đích route đổi, không nạp theo mỗi lần gõ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleId, sampleType, skill, newDraftRoute]);

  useEffect(() => {
    const unregister = registerNavigationGuard(() => {
      if (busyRef.current) {
        window.alert("Đang gửi yêu cầu. Vui lòng đợi hoàn tất trước khi rời trang.");
        return false;
      }

      const changed =
        documentKey(documentRef.current) !== savedRef.current;

      return (
        !changed ||
        window.confirm(
          "Có thay đổi chưa lưu. Rời trang sẽ bỏ các thay đổi này. Bạn có muốn rời đi?",
        )
      );
    });

    function beforeUnload(event: BeforeUnloadEvent) {
      if (
        busyRef.current ||
        documentKey(documentRef.current) !== savedRef.current
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      unregister();
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable)
      ) {
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z" &&
        editing &&
        !busyRef.current
      ) {
        event.preventDefault();

        const previous = historyRef.current.pop();

        if (previous) {
          documentRef.current = previous;
          setDocument(previous);
          setUndoCount(historyRef.current.length);
          lastFieldRef.current = "";
        }
      }
    }

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [editing]);

  function commitDocument(next: SampleDocumentV1, field: string) {
    if (lastFieldRef.current !== field) {
      historyRef.current = [
        ...historyRef.current,
        documentRef.current,
      ].slice(-50);
    }

    lastFieldRef.current = field;
    documentRef.current = next;

    setDocument(next);
    setUndoCount(historyRef.current.length);
    setErrors([]);
    setNotice("");
  }

  function patchCommon(patch: CommonPatch, field: string) {
    update({ ...document, ...patch }, field);
  }

  function undo() {
    if (busyRef.current) return;

    const previous = historyRef.current.pop();
    if (!previous) return;

    documentRef.current = previous;
    setDocument(previous);
    setUndoCount(historyRef.current.length);
    lastFieldRef.current = "";
    setErrors([]);
    setNotice("");
  }

  function cancelEdit() {
    if (busyRef.current) return;

    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;

    if (recordRef.current) {
      acceptLoaded(recordRef.current);
    } else {
      const initial = newSampleDocument(skill, sampleType);

      documentRef.current = initial;
      savedRef.current = documentKey(initial);

      setDocument(initial);
      setEditing(true);
      resetHistory();
    }

    setErrors([]);
    setNotice("Đã bỏ các thay đổi chưa lưu.");
  }

  async function persistDraft(): Promise<AdminSampleDetail> {
    const currentDocument = documentRef.current;
    const currentRecord = recordRef.current;

    if (!currentDocument.title.trim()) {
      throw new Error("SAMPLE_TITLE_REQUIRED");
    }

    const response = currentRecord
      ? await sampleApi.saveDraft(currentRecord.id, {
          revision: currentRecord.revision,
          document: currentDocument,
        })
      : await sampleApi.create({
          document: currentDocument,
        });

    const sample = response.sample;

    recordRef.current = sample;
    documentRef.current = sample.document;
    savedRef.current = documentKey(sample.document);

    setRecord(sample);
    setDocument(sample.document);
    resetHistory();

    if (!currentRecord) {
      const href = sampleEditorHref(skill, sample.id);

      replaceSampleEditorHash(href);
    }

    return sample;
  }

  async function run(
    operation: () => Promise<void>,
  ): Promise<void> {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setErrors([]);
    setNotice("");

    try {
      await operation();
    } catch (error: unknown) {
      setErrors(
        error instanceof Error && error.message === "SAMPLE_TITLE_REQUIRED"
          ? ["Cần nhập tiêu đề trước khi lưu nháp."]
          : sampleErrorMessages(error),
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function update(next: SampleDocumentV1, field: string) {
    if (!editing || busyRef.current) return;
    commitDocument(next, field);
  }

  function uploadMedia(
    kind: SampleAssetKind,
    file: File,
    itemId?: string,
  ) {
    if (!editing || busyRef.current) return;

    const currentRecord = recordRef.current;

    if (!currentRecord && kind !== "cover") {
      setErrors(["Hãy lưu nháp lần đầu trước khi tải media."]);
      return;
    }

    if (kind === "cover" && file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors(["Chọn ảnh đại diện định dạng JPG, PNG hoặc WebP."]);
      return;
    }

    const limit =
      kind === "audio"
        ? 50 * 1024 * 1024
        : 5 * 1024 * 1024;

    if (!file.size || file.size > limit) {
      setErrors([
        !file.size
          ? "Tệp đang rỗng."
          : kind === "audio"
            ? "Audio tối đa 50 MiB."
            : "Ảnh tối đa 5 MiB.",
      ]);
      return;
    }

    void run(async () => {
      const target = currentRecord ?? await persistDraft();
      const response = await sampleApi.uploadAsset(
        target.id,
        kind,
        file,
      );

      const next = withMedia(
        documentRef.current,
        kind,
        response.asset,
        itemId,
      );

      commitDocument(
        next,
        `media-${kind}-${itemId ?? ""}-${response.asset.path}`,
      );

      setNotice(
        kind === "cover"
          ? "Đã tải ảnh đại diện. Bấm Lưu để lưu ảnh vào bản nháp."
          : "Đã tải tệp. Bấm Lưu để gắn tệp vào bài.",
      );
    });
  }

  function removeMedia(
    kind: SampleAssetKind,
    itemId?: string,
  ) {
    if (!editing || busyRef.current) return;

    update(
      withMedia(documentRef.current, kind, null, itemId),
      `remove-media-${kind}-${itemId ?? ""}`,
    );
  }

  function mediaField(
    label: string,
    kind: Exclude<SampleAssetKind, "cover">,
    media: SampleMediaRef | null,
    itemId?: string,
  ) {
    const audio = kind === "audio";

    return (
      <div className="sample-field">
        <span>{label}</span>

        <SampleUploadFrame
          kind={audio ? "audio" : "image"}
          media={media}
          disabled={!record || !editing || busy}
          title={audio ? "Tải tệp audio mẫu" : "Tải hình ảnh"}
          hint={
            audio
              ? "Kéo thả tệp hoặc bấm để chọn (MP3, WAV, M4A tối đa 50 MiB)"
              : "Kéo thả tệp hoặc bấm để chọn (JPG, PNG, WebP tối đa 5 MiB)"
          }
          accept={
            audio
              ? ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a"
              : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          }
          onSelect={(file) => uploadMedia(kind, file, itemId)}
          onRemove={() => removeMedia(kind, itemId)}
        />

        {!record && (
          <small className="sample-muted">Bấm Lưu lần đầu để tải tệp.</small>
        )}
      </div>
    );
  }

  function save() {
    void run(async () => {
      await persistDraft();
      setEditing(false);
      setNotice("Đã lưu bản nháp trên máy chủ.");
    });
  }

  function publication(
    action: SamplePublicationRequest["action"],
  ) {
    const confirmation =
      action === "PUBLISH"
        ? "Lưu nội dung hiện tại rồi công bố bài mẫu?"
        : action === "HIDE"
          ? "Ẩn bài khỏi thư viện? Snapshot công bố vẫn được giữ."
          : "Hiện lại snapshot đã công bố gần nhất? Thao tác này không công bố nội dung nháp mới.";

    if (!window.confirm(confirmation)) return;

    void run(async () => {
      const current =
        action === "PUBLISH"
          ? await persistDraft()
          : recordRef.current;

      if (!current) return;

      const response = await sampleApi.publication(current.id, {
        revision: current.revision,
        action,
      });

      // HIDE / RESTORE chỉ cập nhật metadata.
      // Không thay thế nội dung đang nhập bằng document từ server.
      recordRef.current = response.sample;
      setRecord(response.sample);

      if (action === "PUBLISH") {
        setEditing(false);
      }

      setNotice(
        action === "PUBLISH"
          ? "Đã công bố nội dung vừa lưu."
          : action === "HIDE"
            ? "Đã ẩn bài khỏi thư viện."
            : "Đã hiện lại snapshot công bố gần nhất.",
      );
    });
  }

  function patchSpeakingItem(
    id: string,
    patch: { question?: string; answer?: string },
    field: string,
  ) {
    if (document.skill !== "SPEAKING") return;

    update(
      {
        ...document,
        items: document.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      },
      field,
    );
  }

  const unavailable = loading || loadFailed;
  const status = record?.status ?? "DRAFT";
  const visibilityLabel = status === "PUBLISHED" ? "Ẩn bài" : "Hiện lại bản đã công bố";

  return (
    <StaffLayout
      active="samples"
      crumb={`Quản lý / Bài mẫu / ${skill === "WRITING" ? "Writing" : "Speaking"}`}
      contentClassName="flex flex-col"
    >
      <div className="sample-editor">
        <header className="sample-editor-header">
          <div className="sample-editor-heading">
            <a className="sample-back-link" href="#AdminSamples">← Quản lý bài mẫu</a>
            <h1 className="sample-editor-title">Soạn bài mẫu · {skill === "WRITING" ? "Writing" : "Speaking"}</h1>

            <div className="sample-editor-meta">
              <span className={`sample-chip sample-chip--${status.toLowerCase()}`}>
                {SAMPLE_STATUS_LABELS[status]}
              </span>

              <span className="sample-chip">
                {editing ? "Đang chỉnh sửa" : "Chỉ xem"}
              </span>

              {record && (
                <span className="sample-muted">
                  Revision {record.revision}
                  {record.hasUnpublishedChanges
                    ? " · Có nháp chưa công bố"
                    : ""}
                </span>
              )}

              <span className="sample-muted">
                {dirty ? "Có thay đổi chưa lưu" : "Không có thay đổi chưa lưu"}
              </span>
            </div>
          </div>

          <div className="sample-editor-actions">
            {!unavailable && (
              <>
                {!editing ? (
                  <button className="sample-button sample-button--secondary" type="button" disabled={busy} onClick={() => setEditing(true)}>
                    Chỉnh sửa
                  </button>
                ) : (
                  <>
                    <button className="sample-button sample-button--secondary" type="button" disabled={busy || !undoCount} onClick={undo}>
                      Hoàn tác
                    </button>
                    <button className="sample-button sample-button--secondary" type="button" disabled={busy} onClick={cancelEdit}>
                      Hủy sửa
                    </button>
                    <button className="sample-button sample-button--secondary" type="button" disabled={busy} onClick={save}>
                      Lưu
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="sample-button sample-button--primary"
                  disabled={busy}
                  onClick={() => publication("PUBLISH")}
                >
                  Công bố
                </button>

                {record && record.publishedRevision !== null && status !== "DRAFT" && (
                  <button className="sample-button sample-button--secondary sample-button--icon"
                    type="button"
                    disabled={busy}
                    aria-label={visibilityLabel}
                    title={visibilityLabel}
                    onClick={() => publication(status === "PUBLISHED" ? "HIDE" : "RESTORE")}
                  >
                    <VisibilityIcon visible={status === "PUBLISHED"} />
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {busy && <p role="status">Đang gửi yêu cầu…</p>}
        {loading && <p role="status">Đang tải bài mẫu…</p>}

        {errors.length > 0 && (
          <div className="sample-error" role="alert">
            <strong>Chưa thực hiện được</strong>
            <ul>
              {errors.map((message, index) => <li key={index}>{message}</li>)}
            </ul>
          </div>
        )}

        {notice && <p className="sample-notice" role="status">{notice}</p>}

        {!unavailable && (
          <div className="sample-editor-grid">
            <fieldset
              className="sample-editor-form"
              disabled={!editing || busy}
              aria-label="Nội dung bài mẫu"
            >
              <section className="sample-editor-section">
                <h2>Thông tin chung</h2>

                <Field label="Tiêu đề bài mẫu">
                  <input
                    value={document.title}
                    onChange={(event) =>
                      patchCommon({ title: event.target.value }, "title")
                    }
                  />
                </Field>

                <div className="sample-field-row">
                  <Field label="Chủ đề">
                    <input
                      value={document.topic}
                      onChange={(event) =>
                        patchCommon({ topic: event.target.value }, "topic")
                      }
                    />
                  </Field>

                  <Field label="Nguồn hoặc quý đề — không bắt buộc">
                    <input
                      value={document.source}
                      onChange={(event) =>
                        patchCommon({ source: event.target.value }, "source")
                      }
                    />
                  </Field>
                </div>

                <Field label="Band của bài mẫu">
                  <select
                    value={document.band}
                    onChange={(event) => {
                      const band = SAMPLE_BANDS.find(
                        (value) => String(value) === event.target.value,
                      );

                      if (band !== undefined) {
                        patchCommon({ band }, "band");
                      }
                    }}
                  >
                    {SAMPLE_BANDS.map((band) => (
                      <option key={band} value={band}>{band.toFixed(1)}</option>
                    ))}
                  </select>
                </Field>

                <div className="sample-cover-field" role="group" aria-labelledby="sample-cover-label">
                  {document.cover ? (
                    <SampleMediaPreview sampleId={record?.id} media={document.cover} scope="admin"
                      label="Ảnh đại diện hiện tại" className="sample-cover-preview" />
                  ) : (
                    <div className="sample-cover-preview sample-cover-placeholder" aria-hidden="true">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="sample-cover-info">
                    <h3 id="sample-cover-label">Ảnh đại diện bài mẫu</h3>
                    <small className="sample-muted">
                      Hiển thị trên thẻ bài mẫu sau khi công bố. JPG, PNG hoặc WebP, tối đa 5 MiB.
                    </small>
                    {!record && <small className="sample-muted">Nhập tiêu đề trước khi tải ảnh. Hệ thống sẽ tạo bản nháp nếu cần.</small>}
                    {editing ? (
                      <SampleUploadFrame
                        kind="image"
                        media={document.cover}
                        disabled={busy || (!record && !document.title.trim())}
                        title="Tải ảnh đại diện"
                        hint="Kéo thả tệp hoặc bấm để chọn (JPG, PNG, WebP tối đa 5 MiB)"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onSelect={(file) => uploadMedia("cover", file)}
                        onRemove={() => removeMedia("cover")}
                      />
                    ) : (
                      document.cover && <small className="sample-muted break-all">{document.cover.originalName}</small>
                    )}
                  </div>
                </div>

                {document.skill === "WRITING" ? (
                  <>
                    <div className="sample-field-row">
                      <Field label="Hình thức">
                        <select
                          value={document.form}
                          onChange={(event) => {
                            const form =
                              event.target.value === "GENERAL_TRAINING"
                                ? "GENERAL_TRAINING"
                                : "ACADEMIC";

                            update(
                              changeWritingType(document, form, document.task),
                              "writing-classification",
                            );
                          }}
                        >
                          <option value="ACADEMIC">Academic</option>
                          <option value="GENERAL_TRAINING">General Training</option>
                        </select>
                      </Field>

                      <Field label="Task">
                        <select
                          value={document.task}
                          onChange={(event) =>
                            update(
                              changeWritingType(
                                document,
                                document.form,
                                event.target.value === "1" ? 1 : 2,
                              ),
                              "writing-classification",
                            )
                          }
                        >
                          <option value={1}>Task 1</option>
                          <option value={2}>Task 2</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Dạng bài">
                      <select
                        value={document.writingType}
                        onChange={(event) =>
                          update(
                            changeWritingType(
                              document,
                              document.form,
                              document.task,
                              event.target.value,
                            ),
                            "writing-type",
                          )
                        }
                      >
                        <option value="">Chọn dạng bài</option>
                        {writingTypeOptions(document).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : (
                  <Field label="Part">
                    <select
                      value={document.part}
                      onChange={(event) => {
                        const part =
                          event.target.value === "2"
                            ? 2
                            : event.target.value === "3"
                              ? 3
                              : 1;

                        if (
                          part === 2 &&
                          document.items.length > 1 &&
                          !window.confirm(
                            "Part 2 chỉ giữ câu đầu tiên. " +
                              "Các câu phía sau và tham chiếu audio của chúng " +
                              "sẽ bị bỏ khỏi bản đang soạn. Tiếp tục?",
                          )
                        ) {
                          return;
                        }

                        update(
                          changeSpeakingPart(document, part),
                          "speaking-part",
                        );
                      }}
                    >
                      <option value={1}>Part 1</option>
                      <option value={2}>Part 2</option>
                      <option value={3}>Part 3</option>
                    </select>
                  </Field>
                )}
              </section>

              {document.skill === "WRITING" ? (
                <>
                  <section className="sample-editor-section">
                    <h2>Đề bài</h2>

                    <MarkdownField
                      label="Nội dung đề bài"
                      value={document.prompt}
                      onChange={(prompt) =>
                        update({ ...document, prompt }, "prompt")
                      }
                    />

                    {mediaField("Ảnh đề", "prompt-image", document.promptImage)}

                    {document.sampleType === "WRITING_TASK_1_ACADEMIC" && !document.promptImage && (
                      <p className="sample-warning">
                        Cần ảnh đề đã lưu trong bản nháp để công bố Task 1 Academic.
                      </p>
                    )}
                  </section>

                  <section className="sample-editor-section">
                    <h2>Bài mẫu</h2>

                    <MarkdownField
                      label="Bài mẫu Writing"
                      value={document.essay}
                      rows={15}
                      onChange={(essay) =>
                        update({ ...document, essay }, "essay")
                      }
                    />

                    <p className="sample-muted">
                      {wordCount(document.essay)} từ ·
                      Mức tham khảo của đề: {document.task === 1 ? 150 : 250} từ.
                      Đây là cảnh báo, không phải điều kiện chặn lưu.
                    </p>
                  </section>

                  <section className="sample-editor-section">
                    <h2>Phần dịch — không bắt buộc</h2>

                    <MarkdownField
                      label="Phần dịch tiếng Việt"
                      value={document.translation}
                      onChange={(translation) =>
                        update({ ...document, translation }, "translation")
                      }
                    />
                  </section>
                </>
              ) : (
                <section className="sample-editor-section">
                  <h2>Đề bài và bài mẫu</h2>

                  {document.items.map((item, index) => (
                    <div className="sample-item" key={item.id}>
                      <div className="sample-section-header">
                        <h3>
                          {document.part === 2 ? "Cue card" : `Câu ${index + 1}`}
                        </h3>

                        {document.part !== 2 && document.items.length > 1 && (
                          <button className="sample-button sample-button--secondary"
                            type="button"
                            onClick={() => {
                              if (!window.confirm(`Xóa câu ${index + 1} khỏi bản đang soạn?`)) {
                                return;
                              }

                              update(
                                {
                                  ...document,
                                  items: document.items.filter(
                                    (current) => current.id !== item.id,
                                  ),
                                },
                                `delete-${item.id}`,
                              );
                            }}
                          >
                            Xóa câu
                          </button>
                        )}
                      </div>

                      <Field label={document.part === 2 ? "Cue card" : `Câu hỏi ${index + 1}`}>
                        <AutoTextarea
                          rows={document.part === 2 ? 7 : 3}
                          value={item.question}
                          onChange={(event) =>
                            patchSpeakingItem(
                              item.id,
                              { question: event.target.value },
                              `question-${item.id}`,
                            )
                          }
                        />
                      </Field>

                      <MarkdownField
                        label={`Bài mẫu câu ${index + 1}`}
                        value={item.answer}
                        rows={document.part === 2 ? 12 : 6}
                        onChange={(answer) =>
                          patchSpeakingItem(
                            item.id,
                            { answer },
                            `answer-${item.id}`,
                          )
                        }
                      />

                      <p className="sample-muted">{wordCount(item.answer)} từ</p>
                      {mediaField(`Audio câu ${index + 1}`, "audio", item.audio, item.id)}
                    </div>
                  ))}

                  {document.part !== 2 && (
                    <button className="sample-button sample-button--secondary"
                      type="button"
                      onClick={() =>
                        update(
                          {
                            ...document,
                            items: [...document.items, newSpeakingItem()],
                          },
                          `add-${crypto.randomUUID()}`,
                        )
                      }
                    >
                      + Thêm câu hỏi
                    </button>
                  )}
                </section>
              )}

              <section className="sample-editor-section">
                <h2>Dàn ý — không bắt buộc</h2>

                <Field label="Đoạn giới thiệu dàn ý">
                  <AutoTextarea
                    rows={3}
                    value={document.outlineIntro}
                    onChange={(event) =>
                      patchCommon(
                        { outlineIntro: event.target.value },
                        "outlineIntro",
                      )
                    }
                  />
                </Field>

                <MarkdownField
                  label="Dàn ý"
                  value={document.outline}
                  onChange={(outline) =>
                    patchCommon({ outline }, "outline")
                  }
                />
              </section>
            </fieldset>

            <aside className="sample-editor-preview" aria-label="Xem trước bài đang soạn">
              <p className="sample-muted">
                Xem trước nội dung đang soạn — không phải snapshot công khai.
              </p>

              <span className="sample-chip">
                {SAMPLE_TYPE_LABELS[document.sampleType]}
              </span>

              <h2>{document.title || "Chưa đặt tiêu đề"}</h2>

              <p className="sample-muted">
                {[document.topic, document.source, `Band ${document.band.toFixed(1)}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <SampleMediaPreview sampleId={record?.id} media={document.cover} scope="admin" label="Ảnh bìa bài mẫu" />

              <section className="sample-preview-box sample-preview-prompt">
                <h3>Đề bài</h3>

                {document.skill === "WRITING" ? (
                  <>
                    <SampleMarkdown text={document.prompt} />
                    <SampleMediaPreview sampleId={record?.id} media={document.promptImage} scope="admin" label="Ảnh đề Writing" />
                  </>
                ) : (
                  document.items.map((item, index) => (
                    <div key={item.id}>
                      {document.part !== 2 && <strong>Câu {index + 1}</strong>}
                      <SampleMarkdown text={item.question} />
                    </div>
                  ))
                )}
              </section>

              {(document.outlineIntro.trim() || document.outline.trim()) && (
                <section className="sample-editor-section">
                  <h3>Dàn ý</h3>
                  <SampleMarkdown text={document.outlineIntro} />
                  <SampleMarkdown text={document.outline} />
                </section>
              )}

              <section className="sample-editor-section">
                <h3>Bài mẫu</h3>

                {document.skill === "WRITING" ? (
                  <SampleMarkdown text={document.essay} />
                ) : (
                  document.items.map((item, index) => (
                    <div className="sample-item" key={item.id}>
                      {document.part !== 2 && (
                        <h4>Câu {index + 1}: {item.question}</h4>
                      )}
                      <SampleMarkdown text={item.answer} />
                      <SampleMediaPreview sampleId={record?.id} media={item.audio} scope="admin" label={`Audio mẫu câu ${index + 1}`} />
                    </div>
                  ))
                )}
              </section>

              {document.skill === "WRITING" && document.translation.trim() && (
                <section className="sample-editor-section">
                  <h3>Phần dịch</h3>
                  <SampleMarkdown text={document.translation} />
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
