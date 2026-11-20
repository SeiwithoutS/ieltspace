import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Account } from '../../lib/auth/account';
import { changePassword } from '../../lib/auth/auth';
import { deleteAvatar, getAvatarOptions, getPasswordOptions, saveAvatar, saveDisplayName, sendPasswordSetupEmail } from '../../lib/auth/profile-api';
import AvatarContent from './AvatarContent';

const border = 'border-[var(--attempt-line-d6d4d0,#D6D4D0)]';
const row = `flex flex-wrap items-center justify-between gap-3 py-3 border-0 border-t border-solid ${border}`;
const muted = 'text-[var(--attempt-text-706473,#706473)]';
const action = `min-h-9 px-4 rounded-full border border-solid ${border} bg-transparent text-inherit text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;
const staffAction = `inline-flex min-h-11 items-center gap-2 rounded-full border border-solid ${border} bg-[var(--attempt-bg-ffffff)] px-5 text-sm font-semibold text-inherit cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;
const input = `min-h-10 w-full max-w-sm box-border px-3 rounded-lg border border-solid ${border} bg-transparent text-inherit text-sm`;

type Feedback = { text: string; error?: boolean };

function Status({ value }: { value: Feedback | null }) {
  if (!value) return null;
  return <p role={value.error ? 'alert' : 'status'} className="m-0 text-sm">{value.text}</p>;
}

export function PasswordSettings({ staffActions }: { staffActions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Awaited<ReturnType<typeof getPasswordOptions>>>();
  const [busy, setBusy] = useState<'change' | 'email' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function showForm() {
    setOpen(true);
    setOptions(undefined);
    setFeedback(null);
    try {
      setOptions(await getPasswordOptions());
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Chưa tải được phương thức đăng nhập.', error: true });
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get('currentPassword') ?? '');
    const newPassword = String(data.get('newPassword') ?? '');
    if (newPassword !== data.get('confirmation')) {
      setFeedback({ text: 'Mật khẩu nhập lại chưa khớp.', error: true });
      return;
    }
    setBusy('change');
    setFeedback(null);
    try {
      const code = String(data.get('authenticatorCode') ?? '') || undefined;
      await changePassword(currentPassword, newPassword, code);
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Chưa đổi được mật khẩu.', error: true });
    } finally { setBusy(null); }
  }

  async function sendSetup() {
    if (busy) return;
    setBusy('email');
    setFeedback(null);
    try {
      const { message } = await sendPasswordSetupEmail();
      setFeedback({ text: message });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Chưa gửi được liên kết.', error: true });
    } finally { setBusy(null); }
  }

  const toggle = <button type="button" className={staffActions ? staffAction : action}
    aria-expanded={open} disabled={!!busy} onClick={() => open ? setOpen(false) : void showForm()}>
    {staffActions && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>}
    {open ? 'Đóng' : 'Đổi mật khẩu'}
  </button>;

  return <div className={staffActions ? 'grid gap-3' : row}>
    {staffActions
      ? <div className="flex flex-wrap items-start gap-2.5">{toggle}{staffActions}</div>
      : <><span className={muted}>Mật khẩu</span>{toggle}</>}
    {open && <div className="w-full grid gap-3">
      {options?.google && <div className="grid gap-2 justify-items-start">
        <p className="m-0 text-sm">Bạn có thể tiếp tục dùng Google. Nếu chưa có mật khẩu IELTSpace, hãy thiết lập qua email đã xác minh.</p>
        {options.canSendSetupEmail
          ? <button type="button" className={action} disabled={!!busy} onClick={() => void sendSetup()}>{busy === 'email' ? 'Đang gửi…' : 'Gửi email thiết lập mật khẩu'}</button>
          : <p className={`m-0 text-sm ${muted}`}>Tài khoản chưa có email xác minh để nhận liên kết.</p>}
      </div>}
      <form className="grid gap-3" onSubmit={submit}>
        <fieldset disabled={!!busy} className="m-0 p-0 border-0 grid gap-2 min-w-0 justify-items-start">
          <label className="grid gap-1 w-full text-sm">Mật khẩu hiện tại
            <input name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required className={input} />
          </label>
          <label className="grid gap-1 w-full text-sm">Mật khẩu mới
            <input name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className={input} />
          </label>
          <label className="grid gap-1 w-full text-sm">Nhập lại mật khẩu mới
            <input name="confirmation" type="password" autoComplete="new-password" maxLength={128} required className={input} />
          </label>
          {options?.authenticator && <label className="grid gap-1 w-full text-sm">Mã Google Authenticator
            <input name="authenticatorCode" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
              maxLength={6} required className={input} />
          </label>}
          <button type="submit" className={action}>{busy === 'change' ? 'Đang cập nhật…' : 'Lưu mật khẩu mới'}</button>
        </fieldset>
      </form>
      <Status value={feedback} />
    </div>}
  </div>;
}

export default function ProfileDetails({ account }: { account: Account }) {
  const [maxBytes, setMaxBytes] = useState<number>();
  useEffect(() => {
    let active = true;
    void getAvatarOptions().then(options => { if (active) setMaxBytes(options.maxBytes); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const maxMiB = maxBytes ? maxBytes / (1024 * 1024) : undefined;
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function save(operation: () => Promise<void>, success: string) {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await operation();
      setFeedback({ text: success });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Chưa lưu được thay đổi.', error: true });
    } finally { setBusy(false); }
  }

  function chooseAvatar(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size === 0 || (maxBytes && file.size > maxBytes)) {
      setFeedback({ text: `Chọn ảnh JPG hoặc PNG${maxMiB ? ` tối đa ${maxMiB} MB` : ''}.`, error: true });
      return;
    }
    void save(() => saveAvatar(file), 'Đã lưu ảnh đại diện.');
  }

  return <section aria-label="Thông tin cá nhân" className={`bg-[var(--attempt-bg-ffffff,#FFFFFF)] rounded-[22px] border border-solid ${border} p-4 sm:p-7 grid gap-3 shadow-sm`}>
    <h2 className="m-0 text-lg font-bold">Thông tin cá nhân</h2>
    <div className="flex flex-wrap items-center gap-3 pb-2">
      <span className={`w-[72px] h-[72px] shrink-0 rounded-full border border-solid ${border} bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] grid place-items-center text-xl font-bold`}>
        <AvatarContent avatar={account.avatar} initials={account.initials} />
      </span>
      <div className="flex-1 min-w-24">
        <div className="font-semibold">Ảnh đại diện</div>
        <div className={`text-sm ${muted}`}>JPG hoặc PNG{maxMiB ? `, tối đa ${maxMiB} MB.` : '.'}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className={`inline-flex items-center relative ${action} ${busy ? 'opacity-50' : ''} focus-within:outline focus-within:outline-2`}>
          {account.avatar ? 'Đổi ảnh' : 'Tải ảnh'}
          <input className="sr-only" type="file" accept="image/jpeg,image/png" disabled={busy} onChange={event => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) chooseAvatar(file);
          }} />
        </label>
        {account.avatar && <button type="button" disabled={busy} className={action} onClick={() => void save(deleteAvatar, 'Đã gỡ ảnh đại diện.')}>Gỡ ảnh</button>}
      </div>
    </div>
    <div className={row}>
      {editing ? <form className="w-full flex flex-wrap items-end gap-2" onSubmit={event => {
        event.preventDefault();
        const displayName = String(new FormData(event.currentTarget).get('displayName') ?? '').trim();
        void save(async () => { await saveDisplayName(displayName); setEditing(false); }, 'Đã lưu tên hiển thị.');
      }}>
        <label className="grid gap-1 flex-1 min-w-32 text-sm">Tên hiển thị
          <input name="displayName" defaultValue={account.name} minLength={2} maxLength={100} required autoFocus disabled={busy} className={input} />
        </label>
        <button type="submit" disabled={busy} className={action}>Lưu tên</button>
        <button type="button" disabled={busy} className={action} onClick={() => setEditing(false)}>Hủy</button>
      </form> : <>
        <span className={muted}>Tên hiển thị</span>
        <div className="flex flex-wrap items-center gap-2 max-w-full"><strong className="break-all">{account.name}</strong>
          <button type="button" disabled={busy} className={action} onClick={() => setEditing(true)}>Chỉnh sửa</button>
        </div>
      </>}
    </div>
    <div className={row}><span className={muted}>Email đăng nhập</span><strong className="break-all">{account.email || 'Chưa có email'}</strong></div>
    {busy && <p role="status" className="m-0 text-sm">Đang lưu thay đổi…</p>}
    <Status value={feedback} />
    <PasswordSettings />
  </section>;
}
