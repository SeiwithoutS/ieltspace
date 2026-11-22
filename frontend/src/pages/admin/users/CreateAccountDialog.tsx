import { useState } from 'react';
import { styleOf } from '../../../lib/shared/styles';
import { createStaffAccount, type StaffAccountInput, type StaffCredentials } from '../../../lib/admin-users/api';
import AccountDialog from './AccountDialog';
import { Button } from '../../../components/shared/ui';
import { CloseIcon, closeButton, directoryField, directoryMuted } from './userDirectoryUi';

const checkboxLabel = 'display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; font-size: 14px; font-weight: 600; cursor: pointer';

function downloadCredentials({ email, temporaryPassword }: StaffCredentials) {
  const file = new Blob([JSON.stringify({ email, temporaryPassword }, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ieltspace-tai-khoan.json';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CreateAccountDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [role, setRole] = useState('teacher');
  const [notice, setNotice] = useState('');
  const [credentials, setCredentials] = useState<StaffCredentials>();
  const [copyStatus, setCopyStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const teacher = role === 'teacher';

  function readAccount(form: HTMLFormElement): StaffAccountInput | undefined {
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const fullName = String(fields.get('fullName') ?? '').trim();
    const email = String(fields.get('email') ?? '').trim();
    if (fullName.length < 2) { setNotice('Vui lòng nhập họ và tên.'); return; }
    if (!teacher) return { fullName, email, role: 'ADMIN' };
    const writing = fields.has('writing'), speaking = fields.has('speaking');
    if (!writing && !speaking) { setNotice('Giáo viên cần ít nhất một quyền chấm.'); return; }
    return { fullName, email, role: 'TEACHER', writing, speaking, maxPending: Number(fields.get('limit')) };
  }

  async function perform(form: HTMLFormElement) {
    if (busy || credentials) return;
    const account = readAccount(form);
    if (!account) return;
    if (account.role === 'ADMIN' && code.length !== 6) {
      setNotice('Hãy nhập mã 6 số từ Google Authenticator.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const created = await createStaffAccount(account, account.role === 'ADMIN' ? code : undefined);
      setCredentials({ email: created.email, temporaryPassword: created.temporaryPassword });
      setCode('');
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Chưa tạo được tài khoản.');
    } finally {
      setBusy(false);
    }
  }

  async function copyCredentials(account: StaffCredentials) {
    try {
      await navigator.clipboard.writeText(`Email: ${account.email}\nMật khẩu tạm: ${account.temporaryPassword}`);
      setCopyStatus('Đã sao chép thông tin đăng nhập.');
    } catch {
      setCopyStatus('Hãy chọn từng ô và sao chép thủ công.');
    }
  }

  return <AccountDialog
    labelledBy="create-title"
    onClose={onClose}
    busy={busy}
    className="backdrop:bg-[#352637]/[.32]"
    style={styleOf('position: fixed; top: min(96px, 18dvh); bottom: auto; width: 560px; max-width: calc(100% - 32px); max-height: calc(100dvh - min(96px, 18dvh) - 16px); box-sizing: border-box; background: #FFFFFF; color: #352637; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); padding: 28px; overflow-y: auto')}
  >
    {close => credentials ? <div className="flex flex-col gap-[18px]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="create-title" className="m-0 font-serif text-[22px] font-semibold">Đã tạo tài khoản</h2>
          <p className={`mb-0 mt-1 text-sm ${directoryMuted}`}>Sao chép hoặc tải thông tin trước khi đóng. Mật khẩu tạm chỉ hiện ở lần tạo này.</p>
        </div>
        <button type="button" onClick={close} aria-label="Đóng" className={closeButton}><CloseIcon /></button>
      </header>
      <label className="grid gap-1.5 text-[13px] font-semibold">
        Email đăng nhập
        <input readOnly value={credentials.email} onFocus={event => event.currentTarget.select()} className={directoryField} />
      </label>
      <label className="grid gap-1.5 text-[13px] font-semibold">
        Mật khẩu tạm
        <input readOnly value={credentials.temporaryPassword} onFocus={event => event.currentTarget.select()} className={directoryField} />
      </label>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button onClick={close}>Đóng</Button>
        <Button onClick={() => downloadCredentials(credentials)}>Tải JSON</Button>
        <Button variant="primary" onClick={() => void copyCredentials(credentials)}>Sao chép thông tin</Button>
      </div>
      {copyStatus && <div role="status" className={`text-sm ${directoryMuted}`}>{copyStatus}</div>}
    </div> : <form className="flex flex-col gap-[18px]" onChange={() => setNotice('')} onSubmit={event => {
      event.preventDefault();
      void perform(event.currentTarget);
    }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="create-title" className="m-0 font-serif text-[22px] font-semibold">Tạo tài khoản Giáo viên hoặc Quản lý</h2>
          <p style={styleOf('font-size: 14px; color: #706473; margin: 4px 0 0')}>Người học tự đăng ký và phải xác minh email, nên không tạo ở đây.</p>
        </div>
        <button type="button" onClick={close} aria-label="Đóng" className={closeButton}><CloseIcon /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Họ và tên
          <input name="fullName" type="text" required disabled={busy} placeholder="Phạm Thị Mai" className={directoryField} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Email
          <input name="email" type="email" required disabled={busy} placeholder="mai@ieltspace.vn" className={directoryField} />
        </label>
      </div>
      <div className={`grid gap-4 ${teacher ? 'sm:grid-cols-2' : ''}`}>
        <div className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          <label htmlFor="create-account-role">Vai trò</label>
          <select id="create-account-role" value={role} disabled={busy} onChange={event => { setRole(event.currentTarget.value); setCode(''); }} className={directoryField}>
            <option value="teacher">Giáo viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>
        {teacher && <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Giới hạn bài chưa chấm
          <input name="limit" type="number" min={1} max={50} defaultValue={10} required disabled={busy} className={directoryField} />
        </label>}
      </div>
      {teacher && <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-semibold">Quyền chấm</legend>
        <div className="flex flex-wrap gap-2.5">
          <label style={styleOf(checkboxLabel)}><input type="checkbox" name="writing" defaultChecked className="m-0 h-4 w-4 accent-[#2963CC]" />Chấm Writing</label>
          <label style={styleOf(checkboxLabel)}><input type="checkbox" name="speaking" className="m-0 h-4 w-4 accent-[#2963CC]" />Chấm Speaking</label>
        </div>
      </fieldset>}
      {!teacher && <div className="grid gap-2 text-sm">
        <label className="grid gap-1.5 font-semibold">
          Mã Google Authenticator
          <input name="security-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            required pattern="[0-9]{6}" disabled={busy} className={directoryField} value={code}
            onChange={event => setCode(event.currentTarget.value.replace(/\D/g, ''))} />
        </label>
        <span className={directoryMuted}>Nhập mã 6 số từ ứng dụng xác thực đã thiết lập trong Hồ sơ cá nhân.</span>
      </div>}
      {notice && <div role="alert" style={styleOf('padding: 10px 14px; border-radius: 12px; font-size: 14px; background: #FBDCD3; border: 1.5px solid #F1B3A3; color: #C0412A')}>{notice}</div>}
      <div style={styleOf('font-size: 13px; color: #706473')}>Tài khoản dùng được ngay. Hãy chuyển thông tin đăng nhập qua kênh riêng cho người nhận.</div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button onClick={close}>Hủy</Button>
        <Button type="submit" variant="primary" disabled={busy}>{busy ? 'Đang tạo…' : 'Tạo tài khoản'}</Button>
      </div>
    </form>}
  </AccountDialog>;
}
