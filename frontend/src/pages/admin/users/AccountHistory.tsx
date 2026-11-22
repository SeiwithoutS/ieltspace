import { useEffect, useState } from 'react';
import { getAccountHistory, userRoles, userStatuses, type AccountAudit, type HistoryPage, type LoginEvent } from '../../../lib/admin-users/api';
import { directoryButton, directoryMuted, formatUserDate, loginMethodLabel } from './userDirectoryUi';

const auditLabel = {
  USER_ROLE_CHANGED: 'Đổi vai trò',
  USER_LOCKED: 'Khóa tài khoản',
  USER_UNLOCKED: 'Mở khóa tài khoản',
  USER_DELETED: 'Xóa tài khoản',
  USER_INVITED: 'Tạo lời mời',
  USER_CREATED: 'Tạo tài khoản',
  USER_INVITE_REISSUED: 'Gửi lại lời mời',
  USER_INVITE_ACCEPTED: 'Nhận lời mời',
};

function label(value: string | null) {
  if (value && Object.prototype.hasOwnProperty.call(userRoles, value)) return userRoles[value as keyof typeof userRoles];
  if (value && Object.prototype.hasOwnProperty.call(userStatuses, value)) return userStatuses[value as keyof typeof userStatuses];
  return '—';
}

export default function AccountHistory({ userId, kind, revision = 0 }: { userId: string; kind: 'login' | 'admin'; revision?: number }) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    page: number; retry: number; revision: number;
    data?: HistoryPage<LoginEvent | AccountAudit>; error?: string;
  }>();

  useEffect(() => {
    let active = true;
    void getAccountHistory(userId, kind, page).then(data => {
      if (active) setResult({ page, retry, revision, data });
    }).catch((error: unknown) => {
      if (active) setResult({ page, retry, revision, error: error instanceof Error ? error.message : 'Không tải được lịch sử.' });
    });
    return () => { active = false; };
  }, [userId, kind, page, retry, revision]);

  const current = result?.page === page && result.retry === retry && result.revision === revision ? result : undefined;
  const nextPage = current?.data?.nextPage;
  return <section aria-busy={!current}>
    <h3 className="m-0 mb-1 text-sm font-semibold">{kind === 'login' ? 'Đăng nhập gần đây' : 'Thao tác quản lý'}</h3>
    <div className="border-0 border-t border-solid border-[var(--attempt-line-e6e4e0)] text-[13px]">
      {!current && <p role="status" className={directoryMuted}>Đang tải lịch sử…</p>}
      {current?.error && <div role="alert" className="flex flex-wrap items-center gap-2 py-2">
        {current.error}<button type="button" className={directoryButton} onClick={() => setRetry(value => value + 1)}>Thử lại</button>
      </div>}
      {current?.data?.items.length === 0 && <p className={directoryMuted}>{kind === 'login' ? 'Chưa có lượt đăng nhập nào.' : 'Chưa có thao tác quản lý.'}</p>}
      {current?.data?.items.map(event => <div key={event.id} className="border-0 border-b border-solid border-[var(--attempt-line-e6e4e0)] py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <time dateTime={event.at} className="font-mono">{formatUserDate(event.at, true)}</time>
          <span>{'method' in event ? loginMethodLabel[event.method] : auditLabel[event.action]}</span>
        </div>
        {'action' in event && <>
          <div className={directoryMuted}>{event.actorName || 'Quản lý'} · {label(event.before)} → {label(event.after)}</div>
          {event.reason && <div className="break-words">{event.reason}</div>}
        </>}
      </div>)}
      {(page > 1 || nextPage) && <nav aria-label={kind === 'login' ? 'Phân trang đăng nhập' : 'Phân trang thao tác quản lý'} className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className={directoryButton} disabled={page <= 1} onClick={() => { if (page > 1) setPage(page - 1); }}>Trước</button>
        <span>Trang {page}</span>
        <button type="button" className={directoryButton} disabled={!nextPage} onClick={() => { if (nextPage) setPage(nextPage); }}>Sau</button>
      </nav>}
    </div>
  </section>;
}
