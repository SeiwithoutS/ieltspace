import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { nextMenuIndex } from "../../../lib/shared/menu-nav";
import Icon, { type IconName } from "./Icon";
import "./menu-button.css";

export type MenuButtonItem = {
  key: string;
  label: string;
  icon?: IconName;
  onSelect: () => void;
  disabled?: boolean;
  /** Lý do khóa mục, hiện dưới nhãn và đọc bằng trình đọc màn hình. */
  reason?: string;
};

// Nút ba chấm mở menu thao tác. Menu vẽ qua portal, định vị fixed theo nút để không bị bảng cuộn ngang cắt.
// Mở/đóng bằng click, Esc, click ngoài, Tab; mũi tên/Home/End di chuyển; đóng thì trả focus về nút.
export default function MenuButton({ label, items }: { label: string; items: MenuButtonItem[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - rect.right);
    const below = window.innerHeight - rect.bottom;
    // Dưới nút không đủ chỗ thì mở lên trên.
    setPos(below < items.length * 52 + 24 && rect.top > below
      ? { bottom: window.innerHeight - rect.top + 6, right }
      : { top: rect.bottom + 6, right });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    refs.current[0]?.focus();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) close(false);
    };
    const onMove = () => close(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, close]);

  function onTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    const current = refs.current.findIndex((node) => node === document.activeElement);
    const next = nextMenuIndex(items.length, current, event.key);
    if (next < 0) return;
    event.preventDefault();
    refs.current[next]?.focus();
  }

  function select(item: MenuButtonItem) {
    if (item.disabled) return;
    close(true);
    item.onSelect();
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="ui-menu-btn"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKey}
      >
        <Icon name="more" size={18} />
      </button>
      {open &&
        createPortal(
          <div ref={menu} role="menu" aria-label={label} className="ui-menu" style={pos} onKeyDown={onMenuKey}>
            {items.map((item, index) => (
              <button
                key={item.key}
                ref={(node) => { refs.current[index] = node; }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="ui-menu__item"
                aria-disabled={item.disabled || undefined}
                title={item.disabled ? item.reason : undefined}
                {...(item.disabled && item.reason ? { "aria-description": item.reason } : {})}
                onClick={() => select(item)}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>
                  {item.label}
                  {item.disabled && item.reason && <small>{item.reason}</small>}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
