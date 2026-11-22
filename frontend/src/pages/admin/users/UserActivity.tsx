import { useEffect, useState } from 'react';
import { getUserActivity, userRoles, type HistoryPage, type LoginEvent, type UserRole } from '../../../lib/admin-users/api';
import { styleOf } from '../../../lib/shared/styles';
import { FilterBar, TextField } from '../../../components/shared/ui';
import { directoryButton, directoryCard, directoryMuted, formatUserDate, loginMethodLabel, roleBadgeStyle, userInitials } from './userDirectoryUi';

export default function UserActivity({ active, onOpen, revision }: { active: boolean; onOpen: (id: string) => void; revision: number }) {
  const [criteria, setCriteria] = useState<{ role: UserRole | ''; page: number }>({ role: '', page: 1 });
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ criteria: typeof criteria; retry: number; data?: HistoryPage<LoginEvent>; error?: string }>();

  useEffect(() => {
    if (!active) return;
    let current = true;
    void getUserActivity(criteria.role, criteria.page).then(data => {
      if (current) setResult({ criteria, retry, data });
    }).catch((error: unknown) => {
      if (current) setResult({ criteria, retry, error: error instanceof Error ? error.message : 'Không tải được hoạt động.' });
    });
    return () => { current = false; };
  }, [active, criteria, retry, revision]);

  const current = result?.criteria === criteria && result.retry === retry ? result : undefined;
  const data = current?.data;
  const nextPage = data?.nextPage;
  return <div className="flex flex-col gap-6">
    <FilterBar
      label="Bộ lọc hoạt động"
      filtered={criteria.role !== ''}
      onClear={() => setCriteria({ role: '', page: 1 })}
    >
      <TextField
        as="select"
        label="Vai trò"
        hideLabel
        value={criteria.role}
        onChange={event => setCriteria({ role: event.currentTarget.value as UserRole | '', page: 1 })}
      >
        <option value="">Tất cả vai trò</option>
        {(Object.keys(userRoles) as UserRole[]).map(role => <option key={role} value={role}>{userRoles[role]}</option>)}
      </TextField>
    </FilterBar>
    <div aria-busy={!current} style={styleOf(directoryCard)}>
      <div tabIndex={0} role="region" aria-label="Bảng hoạt động" className="overflow-x-auto">
        <table aria-label="Hoạt động đăng nhập" className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-0 border-b border-solid border-[var(--attempt-line-d6d4d0)] bg-[var(--attempt-bg-faf9f5)]">
            <tr>{['Người dùng', 'Vai trò', 'Phương thức', 'Đăng nhập lúc'].map(label =>
              <th scope="col" key={label} className={`px-4 py-3 text-[13px] font-semibold ${directoryMuted}`}>{label}</th>
            )}</tr>
          </thead>
          <tbody>
            {!current && <tr><td colSpan={4} className="p-5"><span role="status">Đang tải hoạt động…</span></td></tr>}
            {current?.error && <tr><td colSpan={4} className="p-5"><div role="alert" className="flex flex-wrap items-center gap-3">
              {current.error}<button type="button" className={directoryButton} onClick={() => setRetry(value => value + 1)}>Thử lại</button>
            </div></td></tr>}
            {data?.items.length === 0 && <tr><td colSpan={4} className={`p-5 text-center ${directoryMuted}`}>Chưa ghi nhận hoạt động đăng nhập.</td></tr>}
            {data?.items.map(event => <tr key={event.id} className="border-0 border-t border-solid border-[var(--attempt-line-e6e4e0)]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-solid border-[var(--attempt-line-d6d4d0)] bg-[var(--attempt-bg-e3ecfd)] text-[13px] font-bold">{userInitials(event.name)}</span>
                  <div>
                    <button type="button" aria-haspopup="dialog" onClick={() => onOpen(event.userId)}
                      className="cursor-pointer border-0 bg-transparent p-0 text-left font-sans text-sm font-semibold text-inherit">{event.name}</button>
                    {event.email && <div className={`text-[13px] ${directoryMuted}`}>{event.email}</div>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><span style={roleBadgeStyle(event.role)}>{userRoles[event.role]}</span></td>
              <td className="px-4 py-3">{loginMethodLabel[event.method]}</td>
              <td className="whitespace-nowrap px-4 py-3">{formatUserDate(event.at, true)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {(criteria.page > 1 || nextPage) && <nav aria-label="Phân trang hoạt động" className="flex items-center justify-end gap-2 border-0 border-t border-solid border-[var(--attempt-line-e6e4e0)] px-4 py-3 text-sm">
        <button type="button" className={directoryButton} disabled={criteria.page <= 1}
          onClick={() => { if (criteria.page > 1) setCriteria({ ...criteria, page: criteria.page - 1 }); }}>Trước</button>
        <span>Trang {criteria.page}</span>
        <button type="button" className={directoryButton} disabled={!nextPage}
          onClick={() => { if (nextPage) setCriteria({ ...criteria, page: nextPage }); }}>Sau</button>
      </nav>}
    </div>
  </div>;
}
