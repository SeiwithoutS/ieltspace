import { styleOf } from "../../../lib/shared/styles";

// Ảnh bìa nhỏ 48x32 bo 8 (size "lg": rộng tới 120, tỉ lệ 3:2). Ba nguồn: `src` (ảnh), `background` (nền CSS, ví dụ ảnh mẫu
// hoặc ảnh tải lên) kèm `text` viết tắt, hoặc rỗng (viền nét đứt nền --ui-surface-soft, hiện `initial` nếu có).
// `onImageError` cho nơi cần tự gia hạn URL ảnh (Từ vựng).
export default function CoverThumb({
  src,
  background,
  text,
  initial,
  size = "sm",
  raised,
  onImageError,
}: {
  src?: string | null;
  background?: string | null;
  text?: string;
  initial?: string;
  size?: "sm" | "lg";
  // Ảnh rỗng vẫn có bóng và hiệu ứng hover như ảnh có nền (giữ nguyên danh sách Bộ đề).
  raised?: boolean;
  onImageError?: () => void;
}) {
  const lg = size === "lg" ? " ui-cover--lg" : "";
  if (src)
    return (
      <img
        src={src}
        alt=""
        className={"ui-cover" + lg}
        onError={onImageError}
      />
    );
  if (background) {
    return (
      <span
        aria-hidden="true"
        className={"thumb-h ui-cover" + lg}
        style={styleOf("background: " + background)}
      >
        {text ? <span className="ui-cover__text">{text}</span> : null}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={
        (raised ? "thumb-h ui-cover--raised " : "") +
        "ui-cover ui-cover--empty" +
        lg
      }
    >
      {initial ? <span className="ui-cover__text">{initial}</span> : null}
    </span>
  );
}
