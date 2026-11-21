import { useRef, useState, type DragEvent } from "react";
import type { SampleMediaRef } from "../../../lib/samples/sample-media-types";

interface Props {
  kind: "audio" | "image";
  media: SampleMediaRef | null;
  /** Khóa thao tác (chưa có bản nháp, đang xem, đang bận). */
  disabled?: boolean;
  title: string;
  hint: string;
  accept: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const ICONS = {
  audio: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z",
  image:
    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

/** Khung tải tệp (kéo thả hoặc bấm chọn), cùng kiểu khung ghi âm/ảnh của editor đề. */
export default function SampleUploadFrame({
  kind,
  media,
  disabled = false,
  title,
  hint,
  accept,
  onSelect,
  onRemove,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function pick(file?: File) {
    if (file && !disabled) onSelect(file);
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    pick(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="sample-upload">
      {media ? (
        <div className="sample-upload-file">
          <div className="sample-upload-file-info">
            <span className="sample-upload-dot" aria-hidden="true" />
            <span className="sample-upload-name" title={media.originalName}>{media.originalName}</span>
            <span className="sample-upload-size">({(media.sizeBytes / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <div className="sample-upload-actions">
            <button type="button" disabled={disabled} onClick={() => input.current?.click()}>
              {kind === "audio" ? "Thay tệp" : "Thay ảnh"}
            </button>
            <span aria-hidden="true">|</span>
            <button type="button" className="sample-upload-remove" disabled={disabled} onClick={onRemove}>
              Xóa
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label={title}
          className={`sample-upload-zone${dragOver ? " is-over" : ""}${disabled ? " is-disabled" : ""}`}
          onClick={() => { if (!disabled) input.current?.click(); }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!disabled) input.current?.click();
            }
          }}
          onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={drop}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[kind]} />
          </svg>
          <strong>{title}</strong>
          <small>{hint}</small>
        </div>
      )}
      <input
        ref={input}
        hidden
        type="file"
        accept={accept}
        aria-label={title}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          pick(file);
        }}
      />
    </div>
  );
}
