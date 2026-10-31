import { useAccount } from "../../lib/account";
import React, { useEffect } from "react";
import AccountDropdown from "./AccountDropdown";
export default function AccountMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const account = useAccount("learner");
  const anchor = document
    .querySelector('a[href="AvatarMenu.dc.html"]')
    ?.getBoundingClientRect();
  const right = anchor ? Math.max(12, window.innerWidth - anchor.right) : 24;
  const top = anchor ? anchor.bottom - 44 : 24;
  const dark = document.documentElement.classList.contains("dark");
  const base =
    "display:inline-flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border-radius:8px;font-size:13.5px;text-decoration:none;cursor:pointer;box-sizing:border-box;";
  const on =
    base +
    "background:#FFFFFF;border:1.5px solid #D6D4D0;color:#352637;font-weight:600";
  const off =
    base + "border:1.5px solid transparent;color:#6A5D6C;font-weight:500";
  const v = {
    name: account.name,
    initials: account.initials,
    email: account.email,
    role: "Người học",
    close: onClose,
    isLight: !dark,
    isDark: dark,
    lightStyle: dark ? off : on,
    darkStyle: dark ? on : off,
    setLight: () => {},
    setDark: () => {},
  };
  return (
    <div
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
