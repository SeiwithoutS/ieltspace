import { useState } from 'react';
import { styleOf } from '../../../lib/shared/styles';
import { requestInvitationCode, sendStaffInvitation, type StaffInvitation } from '../../../lib/admin-users/api';
import { ApiError } from '../../../lib/shared/api';
import AccountDialog from './AccountDialog';
import { CloseIcon, accountAction, closeAction, directoryButton, directoryMuted, primaryAction } from './userDirectoryUi';

const fieldStyle = 'height: 44px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 10px; background: #FFFFFF; color: #352637; font: inherit; font-size: 14px; outline-color: #2963CC';
const checkboxLabel = 'display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; font-size: 14px; font-weight: 600; cursor: pointer';

export default function CreateAccountDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [role, setRole] = useState('teacher');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [challenge, setChallenge] = useState<string>();
  const [code, setCode] = useState('');
  const teacher = role === 'teacher';

  function resetInvitation() {
    setNotice('');
    setSuccess(false);
    setChallenge(undefined);
    setCode('');
  }

  function readInvitation(form: HTMLFormElement): StaffInvitation | undefined {
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

  async function perform(form: HTMLFormElement, requestCode = false) {
    if (busy || success) return;
    const invitation = readInvitation(form);
    if (!invitation) return;
    if (!teacher && !requestCode && (!challenge || code.length !== 6)) {
      setNotice('Hãy yêu cầu và nhập mã bảo mật.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      if (requestCode) {
        const result = await requestInvitationCode(invitation);
        setChallenge(result.id);
        setCode('');
      } else {
        await sendStaffInvitation(invitation, challenge ? { id: challenge, code } : undefined);
        setNotice('Yêu cầu gửi email mời đã được tiếp nhận. Tài khoản đang chờ kích hoạt.');
        setSuccess(true);
        onChanged();
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Chưa gửi được lời mời.');
      if (error instanceof ApiError && error.code === 'INVITE_EMAIL_FAILED') {
        setChallenge(undefined);
        setCode('');
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  }

  return <AccountDialog
    labelledBy="create-title"
    onClose={onClose}
    busy={busy}
    className="backdrop:bg-[#352637]/[.32]"
    style={styleOf('position: fixed; top: min(96px, 18dvh); bottom: auto; width: 560px; max-width: calc(100% - 32px); max-height: calc(100dvh - min(96px, 18dvh) - 16px); box-sizing: border-box; background: #FFFFFF; color: #352637; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 24px 64px rgba(53, 38, 55, 0.22); padding: 28px; overflow-y: auto')}
  >
    {close => <form className="flex flex-col gap-[18px]" onChange={event => {
      if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'security-code') resetInvitation();
    }} onSubmit={event => {
      event.preventDefault();
      void perform(event.currentTarget);
    }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="create-title" className="m-0 font-serif text-[22px] font-semibold">Tạo tài khoản Giáo viên hoặc Quản lý</h2>
          <p style={styleOf('font-size: 14px; color: #706473; margin: 4px 0 0')}>Người học tự đăng ký và phải xác minh email, nên không tạo ở đây.</p>
        </div>
        <button type="button" onClick={close} aria-label="Đóng" style={styleOf(closeAction)}><CloseIcon /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Họ và tên
          <input name="fullName" type="text" required disabled={busy} placeholder="Phạm Thị Mai" style={styleOf(fieldStyle)} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Email
          <input name="email" type="email" required disabled={busy} placeholder="mai@ieltspace.vn" style={styleOf(fieldStyle)} />
        </label>
      </div>
      <div className={`grid gap-4 ${teacher ? 'sm:grid-cols-2' : ''}`}>
        <div className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          <label htmlFor="create-account-role">Vai trò</label>
          <select id="create-account-role" value={role} disabled={busy} onChange={event => setRole(event.currentTarget.value)} style={styleOf(fieldStyle + '; cursor: pointer')}>
            <option value="teacher">Giáo viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>
        {teacher && <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-semibold">
          Giới hạn bài chưa chấm
          <input name="limit" type="number" min={1} max={50} defaultValue={10} required disabled={busy} style={styleOf(fieldStyle)} />
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
          Mã bảo mật
          <input name="security-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            disabled={!challenge || busy || success} style={styleOf(fieldStyle)} value={code}
            onChange={event => setCode(event.currentTarget.value.replace(/\D/g, ''))} />
        </label>
        <button type="button" className={`${directoryButton} justify-self-start`} disabled={busy || success}
          onClick={event => { if (event.currentTarget.form) void perform(event.currentTarget.form, true); }}>
          {challenge ? 'Gửi mã mới' : 'Gửi mã đến email'}
        </button>
        {challenge && !success && <span role="status" className={directoryMuted}>Hãy kiểm tra email đã xác minh. Mã có hiệu lực 10 phút.</span>}
      </div>}
      {notice && <div role={success ? 'status' : 'alert'} style={styleOf('padding: 10px 14px; border-radius: 12px; font-size: 14px; ' +
        (success ? 'background: #DCEDE2; border: 1.5px solid #D6D4D0; color: #2E6A48' : 'background: #FBDCD3; border: 1.5px solid #F1B3A3; color: #C0412A'))}>{notice}</div>}
      <div style={styleOf('font-size: 13px; color: #706473')}>Hệ thống gửi email mời đặt mật khẩu, không dùng mật khẩu tạm. Tài khoản ở trạng thái Chờ kích hoạt cho đến khi người được mời đặt mật khẩu.</div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={close} style={styleOf(accountAction + '; border: 1.5px solid #F1B3A3; background: #FFFFFF; color: #C0412A')}>Hủy</button>
        <button type="submit" disabled={busy || success} style={styleOf(primaryAction)}>{busy ? 'Đang xử lý…' : 'Tạo và gửi email mời'}</button>
      </div>
    </form>}
  </AccountDialog>;
}
