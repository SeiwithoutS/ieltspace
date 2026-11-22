import { useState } from 'react';
import { applyAccountAction, userRoles, type AccountAction, type UserDetails, type UserRole } from '../../../lib/admin-users/api';
import { styleOf } from '../../../lib/shared/styles';
import AccountDialog from './AccountDialog';
import { Button } from '../../../components/shared/ui';
import { directoryField, directoryMuted } from './userDirectoryUi';

const field = directoryField;
const roles = Object.keys(userRoles) as UserRole[];

export default function AccountChangeDialog({ kind, user, onClose, onChanged }: {
  kind: 'role' | 'status' | 'delete';
  user: UserDetails & { status: 'ACTIVE' | 'LOCKED' | 'INVITED' };
  onClose: () => void;
  onChanged: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [reason, setReason] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requiresCode = user.role === 'ADMIN' || (kind === 'role' && role === 'ADMIN');
  const validAction = reason.trim() && (kind !== 'role' || role !== user.role);
  const status = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
  const actionLabel = kind === 'delete' ? 'Xóa tài khoản' : kind === 'role' ? 'Đổi vai trò' : status === 'LOCKED' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
  const action: AccountAction = {
    previousRole: user.role, previousStatus: user.status, reason: reason.trim(),
    ...(kind === 'role' ? { kind, role } : kind === 'status' ? { kind, status } : { kind }),
  };

  function resetCode() {
    setCode('');
    setError('');
  }

  async function perform() {
    if (!validAction || busy || (requiresCode && !/^\d{6}$/.test(code))) return;
    setBusy(true);
    setError('');
    try {
      await applyAccountAction(user.id, action, requiresCode ? code : undefined);
      onChanged();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thực hiện được thao tác. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  return <AccountDialog
    labelledBy="admin-account-action-title"
    className="backdrop:bg-[#352637]/[.32]"
    style={styleOf('width: 480px; max-width: calc(100% - 32px); max-height: calc(100dvh - 32px); box-sizing: border-box; background: #FFFFFF; color: #352637; border: 1.5px solid #D6D4D0; border-radius: 22px; padding: 24px; overflow-y: auto')}
    busy={busy}
    onClose={onClose}
  >
    {close => <form className="flex flex-col gap-4" onSubmit={event => { event.preventDefault(); void perform(); }}>
      <header>
        <h2 id="admin-account-action-title" className="m-0 font-serif text-xl font-semibold">{actionLabel}</h2>
        <p className={`mb-0 mt-1 text-sm ${directoryMuted}`}>{user.name}</p>
        {kind === 'delete' && <p className={`mb-0 mt-1 text-sm ${directoryMuted}`}>Tài khoản sẽ mất quyền truy cập. Dữ liệu cá nhân sẽ được dọn và lịch sử cần đối soát được giữ lại.</p>}
      </header>
      {kind === 'role' && <div className="grid gap-1.5 text-sm font-semibold">
        <label htmlFor="admin-account-next-role">Vai trò mới</label>
        <select id="admin-account-next-role" value={role} disabled={busy} onChange={event => {
          setRole(event.currentTarget.value as UserRole);
          resetCode();
        }} className={field}>
          {roles.map(option => <option key={option} value={option}>{userRoles[option]}</option>)}
        </select>
      </div>}
      <label className="grid gap-1.5 text-sm font-semibold">
        Lý do
        <textarea value={reason} onChange={event => { setReason(event.currentTarget.value); resetCode(); }}
          disabled={busy} rows={3} maxLength={500} required className={field} />
      </label>
      {requiresCode && <div className="grid gap-2 text-sm">
        <label className="grid gap-1.5 font-semibold">
          Mã Google Authenticator
          <input className={field} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            required pattern="[0-9]{6}" disabled={busy} value={code}
            onChange={event => setCode(event.currentTarget.value.replace(/\D/g, ''))} />
        </label>
        <span className={directoryMuted}>Nhập mã 6 số từ ứng dụng xác thực đã thiết lập trong Hồ sơ cá nhân.</span>
      </div>}
      {error && <div role="alert" className="text-sm text-[var(--attempt-text-c0412a)]">{error}</div>}
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button disabled={busy} onClick={close}>Hủy</Button>
        {/* Khóa cho tới khi nhập Lý do (bắt buộc), đổi vai trò khác vai trò hiện tại và đủ mã 6 số khi cần. */}
        <Button type="submit" variant={kind === 'delete' ? 'danger-solid' : 'primary'} disabled={!validAction || busy || (requiresCode && code.length !== 6)}>
          {busy ? 'Đang xử lý…' : 'Xác nhận'}
        </Button>
      </div>
    </form>}
  </AccountDialog>;
}
