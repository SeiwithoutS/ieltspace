import "./attempt.css";
import { DesktopContext } from "./DesktopOnly";
import React, { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PopupProps {
  children: React.ReactNode;
  title: string;
  labelledBy?: string;
  onCancel?: () => void;
}
export default function Popup({
  children,
  title,
  labelledBy,
  onCancel,
}: PopupProps) {
  const enabled = useContext(DesktopContext);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (enabled) element?.showModal();
    return () => {
      element?.close();
      opener?.focus();
    };
  }, [enabled]);
  return createPortal(
    <dialog
      ref={ref}
      aria-label={title}
      aria-labelledby={labelledBy}
      className="attempt-popup max-w-full p-0"
      onCancel={(event) => {
        event.preventDefault();
        onCancel?.();
      }}
    >
      {children}
    </dialog>,
    document.body,
  );
}
