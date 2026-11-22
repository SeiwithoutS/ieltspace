import type { ReactNode } from "react";

// Trạng thái rỗng, lỗi, đang tải (DESIGN.md 12.3): căn giữa, padding 48/24 (36/20 khi nằm trong bảng).
export default function EmptyState({
  kind = "empty",
  children,
  action,
  inline,
}: {
  kind?: "empty" | "error" | "loading";
  children: ReactNode;
  // Ví dụ nút "Thử lại" hoặc "Xóa bộ lọc".
  action?: ReactNode;
  inline?: boolean;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={["ui-state", kind === "error" ? "ui-state--error" : "", inline ? "ui-state--inline" : ""].filter(Boolean).join(" ")}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}
