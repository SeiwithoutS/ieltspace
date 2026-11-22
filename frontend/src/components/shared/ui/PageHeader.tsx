import type { ReactNode } from "react";

// Đầu trang quản lý: [back] / tiêu đề serif 28px + mô tả / nút hành động bên phải.
// `lead` (ví dụ ảnh bìa) và `meta` (nhãn, dòng phụ dưới tiêu đề) dùng cho trang chi tiết.
export default function PageHeader({
  title,
  description,
  back,
  actions,
  lead,
  meta,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  back?: ReactNode;
  actions?: ReactNode;
  lead?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const detail = lead !== undefined;
  return (
    <>
      {back}
      <div
        className={[
          "ui-pageheader",
          detail ? "ui-pageheader--detail" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {lead}
        <div className="ui-pageheader__main">
          <h1 className="ui-pageheader__title">{title}</h1>
          {description ? (
            <div className="ui-pageheader__desc">{description}</div>
          ) : null}
          {meta}
        </div>
        {actions ? (
          <div className="ui-pageheader__actions">{actions}</div>
        ) : null}
      </div>
    </>
  );
}
