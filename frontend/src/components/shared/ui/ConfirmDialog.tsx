import type { ReactNode } from "react";
import Button, { type ButtonVariant } from "./Button";
import Dialog from "./Dialog";

export type ConfirmTone = "danger" | "success" | "warning" | "neutral";
export type ConfirmItem = {
  count: ReactNode;
  text: ReactNode;
  dotColor: string;
};

// Hộp xác nhận: icon tròn 44px theo tone, tiêu đề serif, nội dung, danh sách tùy chọn, Hủy + xác nhận.
// `info`: chỉ một nút đóng (ví dụ "Đã hiểu"), không có xác nhận.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  icon,
  tone = "neutral",
  items,
  label,
  width = 460,
  cancelLabel = "Hủy",
  cancelVariant = "secondary",
  confirmLabel = "Xác nhận",
  confirmVariant = "primary",
  confirmClassName,
  confirmDisabled,
  info,
  infoLabel = "Đã hiểu",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: ReactNode;
  children?: ReactNode;
  icon: ReactNode;
  tone?: ConfirmTone;
  items?: ConfirmItem[];
  label: string;
  width?: number;
  cancelLabel?: string;
  cancelVariant?: ButtonVariant;
  confirmLabel?: ReactNode;
  confirmVariant?: ButtonVariant;
  confirmClassName?: string;
  confirmDisabled?: boolean;
  info?: boolean;
  infoLabel?: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} label={label} width={width}>
      <div className="ui-confirm">
        <span className={`ui-confirm__icon ui-confirm__icon--${tone} an-check`}>
          {icon}
        </span>
        <div className="ui-confirm__title">{title}</div>
        {children ? <div className="ui-confirm__text">{children}</div> : null}
        {items && items.length ? (
          <div className="ui-confirm__list">
            {items.map((it, i) => (
              <div key={i} className="ui-confirm__item an-rise">
                <span
                  className="ui-confirm__dot"
                  style={{ background: it.dotColor }}
                ></span>
                <span>
                  <b>{it.count}</b> {it.text}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="ui-confirm__actions">
          {info ? (
            <Button variant="primary" className="press" onClick={onClose}>
              {infoLabel}
            </Button>
          ) : (
            <>
              <Button
                variant={cancelVariant}
                className="press"
                onClick={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant}
                className={["press", confirmClassName ?? ""]
                  .filter(Boolean)
                  .join(" ")}
                disabled={confirmDisabled}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
