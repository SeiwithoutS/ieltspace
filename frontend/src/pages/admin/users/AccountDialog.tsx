import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type Props = {
  labelledBy: string;
  style: CSSProperties;
  className?: string;
  onClose: () => void;
  busy?: boolean;
  children: (close: () => void) => ReactNode;
};

export default function AccountDialog({ labelledBy, style, className, onClose, busy, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = dialog.current;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    return () => { element?.close(); };
  }, []);

  function close() {
    if (busy) return;
    dialog.current?.close();
    opener.current?.focus({ preventScroll: true });
    onClose();
  }

  return <dialog
    ref={dialog}
    aria-labelledby={labelledBy}
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { if (event.target === event.currentTarget) close(); }}
    className={className}
    style={style}
  >
    {children(close)}
  </dialog>;
}
