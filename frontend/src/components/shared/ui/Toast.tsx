import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { TOAST_MS } from "../../../lib/shared/toast";
import { TOP_LAYER_EVENT } from "./Dialog";

export type ToastAction = {
  label: string;
  onClick?: () => void;
  href?: string;
};

type PopoverEl = HTMLDivElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

// Toast là popover="manual" (top layer) nên luôn nằm trên <dialog> modal. Phần còn lại của trang bị inert khi một
// dialog modal mở, nên khi có dialog đang mở Toast được đưa vào trong dialog đó (cùng top layer, vẫn bấm được),
// rồi showPopover lại để lên trên cùng. Dialog báo mở/đóng qua TOP_LAYER_EVENT.
function useTopLayerHost(open: boolean) {
  const [host] = useState<PopoverEl>(() => {
    const el = document.createElement("div") as PopoverEl;
    el.className = "ui-toast";
    el.setAttribute("role", "status");
    el.setAttribute("popover", "manual");
    return el;
  });
  const place = useCallback(() => {
    const modal = Array.from(
      document.querySelectorAll<HTMLDialogElement>("dialog[open]"),
    )
      .filter((d) => d.matches(":modal"))
      .pop();
    const parent = modal ?? document.body;
    // Toast đang hiện mà chỉ đổi chỗ: không chạy lại animation vào.
    let shown = false;
    try {
      shown = host.matches(":popover-open");
    } catch {
      /* trình duyệt không hỗ trợ :popover-open */
    }
    if (shown) host.classList.add("ui-toast--moved");
    try {
      host.hidePopover?.();
    } catch {
      /* chưa mở */
    }
    if (host.parentNode !== parent) parent.appendChild(host);
    try {
      host.showPopover?.();
    } catch {
      /* trình duyệt không hỗ trợ Popover: giữ position fixed + z-index */
    }
  }, [host]);

  useLayoutEffect(() => {
    if (!open) {
      host.classList.remove("ui-toast--moved");
      try {
        host.hidePopover?.();
      } catch {
        /* chưa mở */
      }
      host.remove();
      return;
    }
    place();
    window.addEventListener(TOP_LAYER_EVENT, place);
    return () => window.removeEventListener(TOP_LAYER_EVENT, place);
  }, [open, host, place]);

  useEffect(() => () => host.remove(), [host]);
  return host;
}

// Thông báo nổi giữa đáy màn hình (role=status). `action` (Hoàn tác) và `link` là hai chỗ đặt liên kết/nút.
export default function Toast({
  open,
  children,
  action,
  link,
}: {
  open: boolean;
  children: ReactNode;
  action?: ToastAction | null;
  link?: ToastAction | null;
}) {
  const host = useTopLayerHost(open);
  if (!open) return null;
  const render = (a: ToastAction) => (
    <a
      href={a.href ?? "#"}
      className="ui-toast__action"
      onClick={(e) => {
        if (a.onClick) {
          e.preventDefault();
          a.onClick();
        }
      }}
    >
      {a.label}
    </a>
  );
  return createPortal(
    <>
      <span>{children}</span>
      {action ? render(action) : null}
      {link ? render(link) : null}
    </>,
    host,
  );
}

// Hook cho trang function: show(message, options) tự đóng sau TOAST_MS (hoặc options.ms). Render `node` ở cuối trang.
export function useToast() {
  const [state, setState] = useState<{
    message: string;
    action?: ToastAction | null;
    link?: ToastAction | null;
  } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setState(null);
  }, []);
  const show = useCallback(
    (
      message: string,
      opts?: {
        action?: ToastAction | null;
        link?: ToastAction | null;
        ms?: number;
      },
    ) => {
      window.clearTimeout(timer.current);
      setState({ message, action: opts?.action, link: opts?.link });
      timer.current = window.setTimeout(
        () => setState(null),
        opts?.ms ?? TOAST_MS,
      );
    },
    [],
  );
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const node = (
    <Toast open={!!state} action={state?.action} link={state?.link}>
      {state?.message}
    </Toast>
  );
  return { show, hide, node };
}
