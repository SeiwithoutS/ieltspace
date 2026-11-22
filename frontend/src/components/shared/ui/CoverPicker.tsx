import type { ChangeEvent, ReactNode } from "react";
import { styleOf } from "../../../lib/shared/styles";
import Icon from "./Icon";

export type CoverPreset = {
  name: string;
  // Một trong hai: nền CSS (ảnh mẫu của bộ đề) hoặc URL ảnh (bìa mẫu của bộ từ).
  background?: string;
  src?: string;
  selected?: boolean;
  onPick: () => void;
};

// Cột chọn ảnh bìa trong hộp thoại tạo/sửa (theo hộp "Tạo bộ đề mới"): khung xem trước 240×160 bo 12,
// nút "Tải ảnh lên" rộng hết cột, hàng ảnh mẫu 48×32, câu báo lỗi/cảnh báo và ghi chú định dạng.
// Nền xem trước qua styleOf để chế độ tối của ảnh mẫu giữ như cũ.
export default function CoverPicker({
  src,
  background,
  label,
  overlay,
  onFile,
  accept = "image/png,image/jpeg,image/webp",
  uploadLabel = "Tải ảnh lên",
  disabled,
  presets,
  message,
  messageTone = "bad",
  note,
  onImageError,
}: {
  src?: string | null;
  background?: string | null;
  label?: string;
  // Nội dung đè lên ảnh (ví dụ chữ viết tắt trên ảnh mẫu).
  overlay?: ReactNode;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  uploadLabel?: ReactNode;
  disabled?: boolean;
  presets?: CoverPreset[];
  message?: ReactNode;
  messageTone?: "bad" | "warn";
  note?: ReactNode;
  onImageError?: () => void;
}) {
  const has = !!(src || background);
  return (
    <div className="ui-coverpick">
      <div
        role="img"
        aria-label={label ?? (has ? "Ảnh bìa đã chọn" : "Chưa có ảnh bìa")}
        className={
          "thumb-h ui-coverpick__frame" +
          (has ? "" : " ui-coverpick__frame--empty")
        }
        style={
          !src && background ? styleOf("background: " + background) : undefined
        }
      >
        {src ? <img src={src} alt="" onError={onImageError} /> : null}
        {overlay}
        {!has ? (
          <span className="ui-coverpick__none">
            <Icon name="image" size={26} strokeWidth={1.8} />
            Ảnh bìa ngang 3:2
          </span>
        ) : null}
      </div>
      <label
        className="ui-btn ui-btn--sm ui-coverpick__upload"
        aria-disabled={disabled ? "true" : undefined}
      >
        <Icon name="upload" size={15} />
        {uploadLabel}
        <input
          type="file"
          accept={accept}
          onChange={onFile}
          disabled={disabled}
          className="ui-coverpick__file"
        />
      </label>
      {presets && presets.length ? (
        <div className="ui-coverpick__presets">
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              title={p.name}
              aria-label={"Chọn ảnh mẫu " + p.name}
              aria-pressed={!!p.selected}
              disabled={disabled}
              onClick={p.onPick}
              className="ui-coverpick__preset"
              style={
                p.background
                  ? styleOf("background: " + p.background)
                  : undefined
              }
            >
              {p.src ? <img src={p.src} alt="" /> : null}
            </button>
          ))}
        </div>
      ) : null}
      {message ? (
        <div
          role={messageTone === "bad" ? "alert" : "status"}
          className={
            "an-rise ui-coverpick__msg ui-coverpick__msg--" + messageTone
          }
        >
          {message}
        </div>
      ) : null}
      {note ? <div className="ui-coverpick__note">{note}</div> : null}
    </div>
  );
}
