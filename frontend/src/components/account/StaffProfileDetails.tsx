import { useId, useState, type FormEvent } from "react";
import type { Account } from "../../lib/auth/account";
import { useAuth } from "../../lib/auth/auth";
import { saveAvatar, saveDisplayName } from "../../lib/auth/profile-api";
import { styleOf } from "../../lib/shared/styles";
import AvatarContent from "./AvatarContent";
import { PasswordSettings } from "./ProfileDetails";
import AuthenticatorSettings from "./AuthenticatorSettings";

const card = "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)";
const field = "width: 100%; min-height: 44px; padding: 10px 14px; box-sizing: border-box; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14px";
const avatarAction = "display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px";
const saveAction = "min-height: 44px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font: inherit; font-weight: 600; font-size: 14px";

export default function StaffProfileDetails({ account }: { account: Account }) {
  const temporaryPassword = useAuth().user?.must_change_password === true;
  const formId = useId();
  const [draft, setDraft] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean }>();
  const name = draft ?? account.name;
  const role = account.role === "admin" ? "Quản lý" : "Giáo viên";

  async function save(operation: () => Promise<void>, message: string) {
    if (busy) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      await operation();
      setFeedback({ text: message });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : "Chưa lưu được thay đổi.", error: true });
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = name.trim();
    if (displayName === account.name.trim()) return;
    void save(async () => {
      await saveDisplayName(displayName);
      setDraft(undefined);
    }, "Đã lưu tên hiển thị.");
  }

  return (
    <section aria-label="Thông tin cá nhân" style={styleOf(card)} className="flex flex-col gap-4">
      <h2 className="m-0 text-lg font-semibold">Thông tin cá nhân</h2>
      <div className="flex flex-wrap items-center gap-4">
        <span style={styleOf("width: 72px; height: 72px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #352637")} className="shrink-0">
          <AvatarContent avatar={account.avatar} initials={account.initials} />
        </span>
        <div className="min-w-0 flex-1 break-words">
          <div style={styleOf("font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em")}>{account.name}</div>
          <div style={styleOf("color: #706473")}>{account.email ? `${account.email} · ${role}` : role}</div>
        </div>
        <label style={styleOf(avatarAction)} className="relative cursor-pointer focus-within:outline focus-within:outline-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 16l-5-5-8 9" />
          </svg>
          Đổi ảnh đại diện
          <input type="file" className="sr-only" accept="image/jpeg,image/png" disabled={busy} onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void save(() => saveAvatar(file), "Đã lưu ảnh đại diện.");
          }} />
        </label>
      </div>
      <form id={formId} className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="grid min-w-0 gap-1.5">
          <span className="text-[13px] font-semibold">Tên hiển thị</span>
          <input style={styleOf(field)} value={name} minLength={2} maxLength={100} required disabled={busy}
            onChange={event => setDraft(event.target.value)} />
        </label>
        <label className="grid min-w-0 gap-1.5">
          <span className="text-[13px] font-semibold">Email</span>
          <input style={styleOf(field)} value={account.email} readOnly />
          <span style={styleOf("font-size: 13px; color: #706473")}>Không đổi được</span>
        </label>
      </form>
      {temporaryPassword && <p role="status" className="m-0 text-sm">Bạn đang dùng mật khẩu tạm. Hãy đổi sang mật khẩu riêng.</p>}
      <PasswordSettings staffActions={<button type="submit" form={formId} disabled={busy} style={styleOf(saveAction)} className="cursor-pointer disabled:opacity-50">
        {busy ? "Đang lưu…" : "Lưu thay đổi"}
      </button>} />
      {feedback && <p role={feedback.error ? "alert" : "status"} className="m-0 text-sm">{feedback.text}</p>}
      <div style={styleOf("font-size: 13px; color: #706473")}>
        Vai trò, trạng thái tài khoản và quyền chấm do Quản lý thiết lập, không tự đổi ở đây.
      </div>
      {account.role === 'admin' && <AuthenticatorSettings temporaryPassword={temporaryPassword} />}
    </section>
  );
}
