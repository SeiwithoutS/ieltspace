import Button from "./Button";

// Phân trang cho các danh sách quản lý: Trước / Trang x / y / Sau (tuỳ chọn thêm « Đầu và Cuối »).
// Là một nav riêng; không đặt bên trong nav khác.
export default function AdminPagination({
  page,
  pages,
  onPage,
  label = "Phân trang",
  showEdges = false,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  label?: string;
  showEdges?: boolean;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label={label} className="ui-pager">
      {showEdges ? (
        <Button size="sm" className="ui-pager__btn" disabled={page <= 1} aria-label="Đến trang đầu" onClick={() => onPage(1)}>
          « Đầu
        </Button>
      ) : null}
      <Button size="sm" className="ui-pager__btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Trước
      </Button>
      <span>{`Trang ${page} / ${pages}`}</span>
      <Button size="sm" className="ui-pager__btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Sau
      </Button>
      {showEdges ? (
        <Button size="sm" className="ui-pager__btn" disabled={page >= pages} aria-label="Đến trang cuối" onClick={() => onPage(pages)}>
          Cuối »
        </Button>
      ) : null}
    </nav>
  );
}
