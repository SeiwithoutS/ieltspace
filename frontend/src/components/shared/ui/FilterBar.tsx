import { useId, type ReactNode } from "react";
import Button from "./Button";

// Hàng lọc đặt thẳng trên bảng: [ô tìm] [tab...] ... đếm kết quả, "Xóa bộ lọc" khi đang lọc.
// `more` là phần lọc thêm, thu gọn sau nút "Lọc thêm".
export default function FilterBar({
  children,
  count,
  filtered,
  onClear,
  more,
  moreOpen,
  onToggleMore,
  moreActive,
  label,
}: {
  children: ReactNode;
  count?: ReactNode;
  filtered?: boolean;
  onClear?: () => void;
  more?: ReactNode;
  moreOpen?: boolean;
  onToggleMore?: () => void;
  // Số lọc đang bật bên trong phần "Lọc thêm" (hiện trên nút).
  moreActive?: number;
  label: string;
}) {
  const moreId = useId();
  return (
    <section aria-label={label} className="ui-filterbar">
      {children}
      {more ? (
        <Button size="sm" aria-expanded={!!moreOpen} aria-controls={moreId} onClick={onToggleMore}>
          {moreActive ? `Lọc thêm (${moreActive})` : "Lọc thêm"}
        </Button>
      ) : null}
      <span className="ui-filterbar__spacer" />
      {count !== undefined ? (
        <span className="ui-filterbar__count" role="status" aria-live="polite">
          {count}
        </span>
      ) : null}
      {filtered && onClear ? (
        <Button size="xs" onClick={onClear}>
          Xóa bộ lọc
        </Button>
      ) : null}
      {more && moreOpen ? (
        <div id={moreId} className="ui-filterbar__more">
          {more}
        </div>
      ) : null}
    </section>
  );
}
