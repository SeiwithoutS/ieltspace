import { useEffect, useState } from 'react';
import StaffLayout from '../../../components/layout/StaffLayout';
import { listUsers, userRoles, userStatuses, type DirectoryFilters, type UserDirectory } from '../../../lib/admin-users/api';
import { styleOf } from '../../../lib/shared/styles';
import { AdminPagination, Button, EmptyState, FilterBar, SearchField, TextField } from '../../../components/shared/ui';
import CreateAccountDialog from './CreateAccountDialog';
import UserActivity from './UserActivity';
import UserDetailsPanel from './UserDetailsPanel';
import { AccountStatus, directoryCard, directoryMuted, formatUserDate, roleBadgeStyle, userInitials } from './userDirectoryUi';

const initialFilters: DirectoryFilters = { q: '', role: '', status: '', page: 1 };
const grid = 'display: grid; grid-template-columns: minmax(230px, 2.2fr) 120px minmax(140px, 1.1fr) 110px 170px 170px 24px';
const headerCell = 'padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473';
const tableColumns = ['Người dùng', 'Vai trò', 'Quyền chấm · bài/giới hạn', 'Ngày tạo', 'Đăng nhập gần nhất', 'Trạng thái'];
const tabs = [
  { id: 'directory', label: 'Danh sách người dùng' },
  { id: 'activity', label: 'Hoạt động' },
] as const;
type UserTab = typeof tabs[number]['id'];
const roles = Object.keys(userRoles) as Array<keyof typeof userRoles>;
const statuses = Object.keys(userStatuses) as Array<keyof typeof userStatuses>;

type ListResult = {
  filters: DirectoryFilters;
  attempt: number;
} & ({ data: UserDirectory; error?: never } | { data?: never; error: string });

export default function AdminUsers() {
  const [filters, setFilters] = useState(initialFilters);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ListResult>();
  const [selected, setSelected] = useState<string | undefined>(() => new URLSearchParams(location.hash.split('?')[1]).get('userId') ?? undefined);
  const [tab, setTab] = useState<UserTab>('directory');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const data = await listUsers(filters);
        if (active) setResult({ filters, attempt, data });
      } catch (error) {
        if (active) setResult({
          filters,
          attempt,
          error: error instanceof Error ? error.message : 'Không tải được danh sách người dùng.',
        });
      }
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters, attempt]);

  const current = result?.filters === filters && result.attempt === attempt ? result : undefined;
  const { data, error } = current ?? {};
  const counts = result?.data?.counts;
  const sameSearch = result?.filters.q === filters.q
    && result.filters.role === filters.role && result.filters.status === filters.status;
  const pagination = sameSearch ? result.data : undefined;
  const numPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  function updateFilters(next: Partial<Omit<DirectoryFilters, 'page'>>) {
    setFilters(previous => ({ ...previous, ...next, page: 1 }));
  }

  function goToPage(page: number) {
    setFilters(previous => ({ ...previous, page }));
  }

  return (
    <StaffLayout active="users" crumb="Quản lý / Người dùng" contentClassName="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 style={styleOf("margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif")}>Người dùng</h1>
          <div style={styleOf('font-size: 15px; color: #706473; margin-top: 4px')}>Tài khoản Người học, Giáo viên và Quản lý; quyền chấm và giới hạn nhận bài của Giáo viên.</div>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} aria-haspopup="dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Tạo tài khoản
        </Button>
      </header>
      <div role="tablist" aria-label="Người dùng và hoạt động" style={styleOf('align-self: flex-start; display: flex; flex-wrap: wrap; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA')}>
        {tabs.map(({ id, label }) => <button
          key={id}
          id={`admin-users-tab-${id}`}
          type="button"
          role="tab"
          tabIndex={tab === id ? 0 : -1}
          aria-selected={tab === id}
          aria-controls={`admin-users-panel-${id}`}
          onClick={() => setTab(id)}
          onKeyDown={event => {
            const next = event.key === 'Home' ? 'directory' : event.key === 'End' ? 'activity'
              : ['ArrowLeft', 'ArrowRight'].includes(event.key) ? (id === 'directory' ? 'activity' : 'directory') : undefined;
            if (!next) return;
            event.preventDefault();
            setTab(next);
            document.getElementById(`admin-users-tab-${next}`)?.focus();
          }}
          style={styleOf('min-height: 34px; padding: 0 14px; border-radius: 8px; font-family: inherit; font-size: 13px; cursor: pointer; ' +
            (tab === id ? 'background: #FFFFFF; border: 1.5px solid #D6D4D0; font-weight: 600; color: #352637' : 'background: transparent; border: 1.5px solid transparent; font-weight: 500; color: #706473'))}
        >{label}</button>)}
      </div>
      <section id="admin-users-panel-directory" role="tabpanel" aria-labelledby="admin-users-tab-directory" hidden={tab !== 'directory'}>
        <div className="flex flex-col gap-6">
          <FilterBar
            label="Bộ lọc người dùng"
            count={pagination ? `${pagination.total} / ${pagination.counts.all} tài khoản` : undefined}
            filtered={Boolean(filters.q || filters.role || filters.status)}
            onClear={() => updateFilters({ q: '', role: '', status: '' })}
          >
            <SearchField
              value={filters.q}
              maxLength={150}
              onChange={q => updateFilters({ q })}
              placeholder="Tìm theo tên hoặc email"
              label="Tìm người dùng"
            />
            <TextField
              as="select"
              label="Vai trò"
              hideLabel
              value={filters.role}
              onChange={event => updateFilters({ role: event.currentTarget.value as DirectoryFilters['role'] })}
            >
              <option value="">Tất cả vai trò</option>
              {roles.map(role => (
                <option key={role} value={role}>{userRoles[role]}{counts ? ` (${counts.byRole[role]})` : ''}</option>
              ))}
            </TextField>
            <TextField
              as="select"
              label="Trạng thái"
              hideLabel
              value={filters.status}
              onChange={event => updateFilters({ status: event.currentTarget.value as DirectoryFilters['status'] })}
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(status => (
                <option key={status} value={status}>{userStatuses[status]}{counts ? ` (${counts.byStatus[status]})` : ''}</option>
              ))}
            </TextField>
          </FilterBar>

          <section aria-label="Kết quả tìm người dùng" aria-busy={!current} className="shrink-0" style={styleOf(directoryCard)}>
            {!current && <EmptyState kind="loading" inline>Đang tải danh sách người dùng…</EmptyState>}
            {error && <EmptyState kind="error" inline action={<Button size="sm" onClick={() => setAttempt(value => value + 1)}>Thử lại</Button>}>{error}</EmptyState>}
            {data && (data.items.length > 0 ? (
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Bảng danh sách người dùng">
                  <div role="table" aria-label="Danh sách người dùng" className="min-w-[1000px]">
                    <div role="row" style={styleOf(grid + '; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0')}>
                      {tableColumns.map(column => <div key={column} role="columnheader" style={styleOf(headerCell)}>{column}</div>)}
                      <div role="columnheader" aria-label="Chi tiết" />
                    </div>
                      {data.items.map(user => (
                        <div key={user.id} role="row" onClick={event => {
                          event.currentTarget.querySelector('button')?.focus({ preventScroll: true });
                          setSelected(user.id);
                        }}
                          className="hover:bg-[var(--attempt-bg-faf9f5,#FAF9F5)]"
                          style={styleOf(grid + '; border-top: 1px solid #E6E4E0; color: #352637; cursor: pointer; ' +
                            (selected === user.id ? 'background: #E3ECFD' : user.status === 'DELETED' ? 'opacity: 0.6' : ''))}
                        >
                          <div role="cell" className="flex min-w-0 items-center gap-3 px-4 py-3">
                            <span aria-hidden="true" style={styleOf('flex: none; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #E3ECFD; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px')}>{userInitials(user.name)}</span>
                            <div className="min-w-0">
                              <button type="button" aria-haspopup="dialog" onClick={event => { event.stopPropagation(); setSelected(user.id); }} className="block max-w-full cursor-pointer break-words border-0 bg-transparent p-0 text-left font-sans text-sm font-semibold text-inherit">
                                {user.name}
                              </button>
                              {user.email && <span className={`block truncate text-[13px] ${directoryMuted}`}>{user.email}</span>}
                            </div>
                          </div>
                          <div role="cell" className="flex items-center px-4 py-3"><span style={roleBadgeStyle(user.role)}>{userRoles[user.role]}</span></div>
                          <div role="cell" className="flex items-center px-4 py-3 text-sm">—</div>
                          <div role="cell" className="flex items-center px-4 py-3 text-sm">{formatUserDate(user.createdAt)}</div>
                          <div role="cell" className="flex items-center px-4 py-3 text-sm">{user.lastLoginAt ? formatUserDate(user.lastLoginAt, true) : '—'}</div>
                          <div role="cell" className="flex items-center px-4 py-3"><AccountStatus status={user.status} /></div>
                          <div role="cell" className={`flex items-center ${directoryMuted}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : <EmptyState inline>Không tìm thấy tài khoản phù hợp.</EmptyState>)}
            {pagination && numPages > 1 && (
              <footer className="flex flex-wrap items-center justify-end gap-3 px-4 py-3">
                <AdminPagination label="Phân trang người dùng" page={data?.page ?? filters.page} pages={numPages} onPage={page => {
                  if (data) goToPage(page);
                }} />
              </footer>
            )}
          </section>
          <div style={styleOf('display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; font-size: 14px')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
            </svg>
            <span>Khóa tài khoản Người học không hủy yêu cầu chấm đang hoạt động. Xóa tài khoản Người học hủy các yêu cầu chưa có kết quả và không hoàn bonus.</span>
          </div>
        </div>
      </section>
      <section id="admin-users-panel-activity" role="tabpanel" aria-labelledby="admin-users-tab-activity" tabIndex={0} hidden={tab !== 'activity'}>
        <UserActivity active={tab === 'activity'} onOpen={setSelected} revision={attempt} />
      </section>

      {selected && <UserDetailsPanel key={selected} id={selected} onClose={() => setSelected(undefined)} onChanged={() => setAttempt(value => value + 1)} />}
      {createOpen && <CreateAccountDialog onClose={() => setCreateOpen(false)} onChanged={() => setAttempt(value => value + 1)} />}
    </StaffLayout>
  );
}
