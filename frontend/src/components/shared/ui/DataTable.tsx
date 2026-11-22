import type { ReactNode } from "react";

// Thẻ chứa bảng/danh sách: viền 1.5px --ui-line, bo 16, bóng thẻ. Có `title` thì có đầu thẻ (tiêu đề + `aside`).
export function DataCard({
  title,
  aside,
  label,
  overflowVisible,
  children,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  label?: string;
  overflowVisible?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={["ui-card", overflowVisible ? "ui-card--visible" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
    >
      {title ? (
        <header className="ui-card__head">
          <h2 className="ui-card__title">{title}</h2>
          {aside ? <span className="ui-card__aside">{aside}</span> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

// Bảng theo định dạng trang Bộ đề: thead nền --ui-page, chữ 13px/600 --ui-muted, ô 12px 16px, hàng hover theo motion.css.
// Ô dùng class ui-th / ui-td (+ --nowrap, --right, --muted); hàng nhóm dùng <tr className="ui-table__group"><th colSpan>.
// `minWidth` (px) bật cuộn ngang; `fixed` + <colgroup> cho bố cục cột cố định.
export default function DataTable({
  label,
  minWidth,
  fixed,
  className,
  children,
}: {
  label?: string;
  minWidth?: number;
  fixed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="ui-table-scroll"
      role={label ? "region" : undefined}
      aria-label={label}
      tabIndex={label ? 0 : undefined}
    >
      <table
        className={[
          "hov",
          "ui-table",
          fixed ? "ui-table--fixed" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          minWidth
            ? { ["--ui-table-min" as string]: `${minWidth}px` }
            : undefined
        }
      >
        {children}
      </table>
    </div>
  );
}
