import { useEffect, useState, type ReactNode } from 'react';
import { getUserDetails, retryAccountDeletion, userRoles, type UserDetails } from '../../../lib/admin-users/api';
import { styleOf } from '../../../lib/shared/styles';
import { useAuth } from '../../../lib/auth/auth';
import AccountDialog from './AccountDialog';
import AccountHistory from './AccountHistory';
import AccountChangeDialog from './AccountChangeDialog';
import {
  AccountStatus, CloseIcon, accountAction, closeAction, directoryButton,
  directoryMuted, formatUserDate, roleBadgeStyle, userInitials,
} from './userDirectoryUi';

const sourceLabels = { EMAIL: 'Email', GOOGLE: 'Google', INVITE: 'Quản lý tạo, email mời' };
const missing = 'Chưa ghi nhận';
const unavailable = 'Tạm thời không tải được';
const secondaryAction = accountAction + '; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; flex: 1';
const dangerAction = secondaryAction + '; border-color: #F1B3A3; color: #C0412A';

function DetailsSection({ title, rows }: { title: string; rows: Array<[string, ReactNode]> }) {
  return <section>
    <h3 style={styleOf('font-size: 14px; font-weight: 600; margin: 0 0 4px')}>{title}</h3>
    <dl className="m-0">
      {rows.map(([label, value]) => <div key={label} style={styleOf('display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px')}>
        <dt style={styleOf('color: #706473')}>{label}</dt>
        <dd className="m-0 text-right font-semibold">{value}</dd>
      </div>)}
    </dl>
  </section>;
}

function ProfileDetails({ user, onRetry, onChangeRole, revision }: {
  user: UserDetails; onRetry: () => void; onChangeRole?: () => void; revision: number;
}) {
  const { auth, avatar } = user;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const image = avatar.url && avatar.url !== failedUrl ? avatar.url : null;
  const email = auth.state === 'available' ? auth.email ?? user.email : user.email;
  const authFallback = auth.state === 'unavailable' ? unavailable : missing;
  const verified = auth.state !== 'available' ? authFallback
    : auth.emailVerified === null ? missing : auth.emailVerified ? 'Đã xác minh' : 'Chưa xác minh';
  const lastLoginAt = user.lastLoginAt ?? (auth.state === 'available' ? auth.lastSignInAt : null);
  const avatarUnavailable = avatar.unavailable || (Boolean(avatar.url) && !image);

  return <>
    <div className="flex items-center gap-3.5">
      <span aria-hidden="true" style={styleOf('flex: none; width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #E3ECFD; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; overflow: hidden')}>
        {image ? <img src={image} alt="" referrerPolicy="no-referrer" onError={() => setFailedUrl(image)} className="h-full w-full object-cover" /> : userInitials(user.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div>
          <h3 className="m-0 break-words font-serif text-lg font-semibold">{user.name}</h3>
          <div className={`break-all text-[13px] ${directoryMuted}`}>{email || 'Chưa có email'}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span style={roleBadgeStyle(user.role)}>{userRoles[user.role]}</span>
          {onChangeRole && <button type="button" className="cursor-pointer border-0 bg-transparent px-1 font-sans text-[13px] font-semibold text-[var(--attempt-text-2963cc)] hover:underline" onClick={onChangeRole}>Đổi vai trò</button>}
          <AccountStatus status={user.status} />
        </div>
      </div>
    </div>
    <DetailsSection title="Tài khoản" rows={[
      ['Ngày tạo', formatUserDate(user.createdAt)],
      ['Tạo bằng', user.status === 'INVITED' ? sourceLabels.INVITE : auth.state === 'available' ? (auth.source ? sourceLabels[auth.source] : missing) : authFallback],
      ['Xác minh email', user.status === 'INVITED' ? 'Chờ nhận lời mời' : verified],
      ['Đăng nhập gần nhất', lastLoginAt ? formatUserDate(lastLoginAt, true) : authFallback],
    ]} />
    {user.role === 'LEARNER' && <DetailsSection title="Học tập" rows={[
      ['Bài đã hoàn thành', '—'],
      ['Bonus chấm còn lại', '—'],
      ['Yêu cầu chấm chưa có kết quả', '—'],
    ]} />}
    {user.role === 'TEACHER' && <DetailsSection title="Quyền chấm và giới hạn nhận bài" rows={[
      ['Writing', '—'], ['Speaking', '—'], ['Bài chưa chấm / giới hạn', '—'],
    ]} />}
    <AccountHistory userId={user.id} kind="login" />
    <AccountHistory key={revision} userId={user.id} kind="admin" />
    {(auth.state === 'unavailable' || avatarUnavailable) && <div className="flex flex-wrap items-center gap-3 text-sm">
      {avatarUnavailable && <span className={directoryMuted}>Chưa tải được ảnh đại diện.</span>}
      <button type="button" className={directoryButton} onClick={onRetry}>Thử tải lại chi tiết</button>
    </div>}
  </>;
}

export default function UserDetailsPanel({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const auth = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [action, setAction] = useState<'role' | 'status' | 'delete'>();
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [result, setResult] = useState<{ attempt: number; user?: UserDetails; error?: string }>();

  useEffect(() => {
    let active = true;
    void getUserDetails(id).then(user => {
      if (active) setResult({ attempt, user });
    }).catch((error: unknown) => {
      if (active) setResult({ attempt, error: error instanceof Error ? error.message : 'Không tải được chi tiết người dùng.' });
    });
    return () => { active = false; };
  }, [id, attempt]);

  const retry = () => setAttempt(value => value + 1);
  const details = result?.attempt === attempt ? result : undefined;
  const user = details?.user;
  const canChange = user && user.status !== 'DELETED' && user.id !== auth.user?.id;
  const canChangeAccess = canChange && user.status !== 'INVITED';

  async function retryCleanup() {
    if (cleanupBusy) return;
    setCleanupBusy(true);
    setCleanupMessage('');
    try {
      const result = await retryAccountDeletion(id);
      if (result.cleanup === 'COMPLETE') retry();
      else setCleanupMessage('Chưa hoàn tất dọn dữ liệu. Có thể thử lại.');
    } catch (error) {
      setCleanupMessage(error instanceof Error ? error.message : 'Chưa thể dọn dữ liệu.');
    } finally {
      setCleanupBusy(false);
    }
  }
  return <><AccountDialog
    labelledBy="admin-user-details-title"
    onClose={onClose}
    className="backdrop:bg-[#352637]/[.28]"
    style={styleOf('position: fixed; top: 0; bottom: 0; right: 0; left: auto; margin: 0; padding: 0; height: 100dvh; max-height: none; width: 480px; max-width: 100%; box-sizing: border-box; background: #FFFFFF; color: #352637; border: 0; border-left: 1.5px solid #D6D4D0; box-shadow: -12px 0 32px rgba(53, 38, 55, 0.12); overflow: hidden')}
  >
    {close => <div className="flex h-full min-h-0 flex-col">
      <header style={styleOf('display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px; border-bottom: 1.5px solid #D6D4D0')}>
        <h2 id="admin-user-details-title" style={styleOf('margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473')}>Chi tiết người dùng</h2>
        <button type="button" onClick={close} aria-label="Đóng chi tiết người dùng" style={styleOf(closeAction)}><CloseIcon /></button>
      </header>
      <div aria-busy={!details} className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto p-6">
        {!details && <p role="status" className={`m-0 ${directoryMuted}`}>Đang tải chi tiết người dùng…</p>}
        {details?.error && <div role="alert" className="flex flex-wrap items-center gap-3">
          <span>{details.error}</span>
          <button type="button" className={directoryButton} onClick={retry}>Thử lại</button>
        </div>}
        {user && <ProfileDetails user={user} onRetry={retry} revision={attempt} onChangeRole={canChangeAccess ? () => setAction('role') : undefined} />}
        {user?.cleanupPending && <div className="flex flex-wrap items-center gap-2 text-sm">
          <span role="status">{cleanupMessage || 'Tài khoản đã mất quyền truy cập và đang chờ dọn dữ liệu.'}</span>
          <button type="button" className={directoryButton} disabled={cleanupBusy} onClick={() => void retryCleanup()}>
            {cleanupBusy ? 'Đang dọn…' : 'Thử dọn lại'}
          </button>
        </div>}
      </div>
      {canChange && <footer
        style={styleOf('display: flex; flex-wrap: wrap; gap: 10px; padding: 16px 24px; border-top: 1.5px solid #D6D4D0; background: #FCFBF7')}
      >
        {canChangeAccess && <button type="button" onClick={() => setAction('status')} style={styleOf(secondaryAction)}>{user.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</button>}
        <button type="button" onClick={() => setAction('delete')} style={styleOf(dangerAction)}>Xóa tài khoản</button>
      </footer>}
    </div>}
  </AccountDialog>
  {action && canChange && user.status !== 'DELETED' && <AccountChangeDialog
    kind={action}
    user={{ ...user, status: user.status }}
    onClose={() => setAction(undefined)}
    onChanged={() => {
      setAction(undefined);
      retry();
      onChanged();
    }}
  />}
  </>;
}
