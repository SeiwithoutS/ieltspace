import { useAccount } from "../../lib/auth/account";
import React, { useEffect, useRef } from "react";
import AccountDropdown from "./AccountDropdown";
export default function AccountMenu({ opener, onClose }: { opener: HTMLElement; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const close = () => { onClose(); opener.focus(); };
  useEffect(() => {
    opener.setAttribute("aria-expanded", "true");
    root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => opener.setAttribute("aria-expanded", "false");
  }, [opener]);
  const account = useAccount("learner");
  const anchor = opener.getBoundingClientRect();
  const right = Math.max(12, window.innerWidth - anchor.right);
  const top = anchor.bottom - 44;
  const dark = document.documentElement.classList.contains("dark");
  const base =
    "display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border-radius:8px;font-size:13px;text-decoration:none;cursor:pointer;box-sizing:border-box;";
  const on =
    base +
    "background:#FFFFFF;border:1.5px solid #D6D4D0;color:#352637;font-weight:600";
  const off =
    base + "border:1.5px solid transparent;color:#706473;font-weight:500";
  const v = {
    name: account.name,
    initials: account.initials,
    avatar: account.avatar,
    email: account.email,
    role: "Người học",
    close,
    isLight: !dark,
    isDark: dark,
    lightStyle: dark ? off : on,
    darkStyle: dark ? on : off,
    setLight: () => {},
    setDark: () => {},
  };
  return (
    <div
      ref={root}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault(); close(); return;
        }
        const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]') ?? []);
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (event.key === "Home") items[0]?.focus();
        else if (event.key === "End") items[items.length - 1]?.focus();
        else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          const step = event.key === "ArrowDown" ? 1 : -1;
          items[(index + step + items.length) % items.length]?.focus();
        } else return;
        event.preventDefault();
      }}
      style={{
        position: "fixed",
        right,
        top,
        zIndex: 1000,
        fontFamily: "'Inter','Be Vietnam Pro','Segoe UI',system-ui,sans-serif",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      <AccountDropdown v={v} learner />
    </div>
  );
}
