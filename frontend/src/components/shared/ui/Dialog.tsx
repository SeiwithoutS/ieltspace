import {
  useEffect,
  useRef,
  type FormEventHandler,
  type ReactNode,
} from "react";
import Icon from "./Icon";

// Báo cho Toast (top layer) đưa mình lên lại khi một dialog modal mở hoặc đóng.
export const TOP_LAYER_EVENT = "ui:top-layer-change";

// Hộp thoại dựa trên <dialog> native: showModal, Esc và bấm nền mờ gọi onClose, trả focus cho phần tử đã mở.
// Nội dung chỉ được dựng khi `open` (giống cách trang cũ dựng/gỡ overlay).
export default function Dialog({
  open,
  onClose,
  label,
  width = 460,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  width?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      el.showModal();
      // Phần tử có data-autofocus được focus sau showModal (autoFocus của React chạy khi dialog còn đóng nên vô hiệu).
      el.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      window.dispatchEvent(new Event(TOP_LAYER_EVENT));
    } else if (!open && el.open) {
      el.close();
      window.dispatchEvent(new Event(TOP_LAYER_EVENT));
      opener.current?.focus?.();
    }
  }, [open]);

  // Dialog dựng/gỡ theo điều kiện bị gỡ khi đang mở: đóng, trả focus cho phần tử đã mở và báo Toast ra lại ngoài.
  useEffect(() => {
    const el = ref.current;
    return () => {
      const wasOpen = !!el?.open;
      if (wasOpen) el?.close();
      window.dispatchEvent(new Event(TOP_LAYER_EVENT));
      if (wasOpen) opener.current?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      aria-label={label}
      style={{ ["--ui-dialog-w" as string]: `${width}px` }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        // Bấm ra ngoài khung (vào nền mờ) thì đóng; bấm vào thanh cuộn của chính hộp thì không.
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        const outside =
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom;
        if (outside) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}

// Khung nội dung hộp thoại biểu mẫu (padding 24, khoảng cách 18). `as="form"` cho hộp thoại có nút submit.
// Form tắt kiểm tra mặc định của trình duyệt: lỗi ô nhập hiện ngay dưới ô (viền đỏ + câu báo) qua TextField.
export function DialogBody({
  as = "div",
  onSubmit,
  className,
  children,
}: {
  as?: "div" | "form";
  onSubmit?: FormEventHandler<HTMLFormElement>;
  className?: string;
  children: ReactNode;
}) {
  const cls = ["ui-dlg", className ?? ""].filter(Boolean).join(" ");
  return as === "form" ? (
    <form className={cls} onSubmit={onSubmit} noValidate>
      {children}
    </form>
  ) : (
    <div className={cls}>{children}</div>
  );
}

// Đầu hộp thoại: tiêu đề serif 22px, mô tả 14px và nút đóng.
export function DialogHead({
  title,
  description,
  onClose,
}: {
  title: ReactNode;
  description?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="ui-dlg__head">
      <div>
        <h2 className="ui-dlg__title">{title}</h2>
        {description ? <p className="ui-dlg__sub">{description}</p> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="ui-dlg__close"
        >
          <Icon name="close" size={18} />
        </button>
      ) : null}
    </div>
  );
}

// Chân hộp thoại: các nút căn phải.
export function DialogFoot({ children }: { children: ReactNode }) {
  return <div className="ui-dlg__foot">{children}</div>;
}
