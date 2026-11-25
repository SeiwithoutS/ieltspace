import { useEffect, useState } from 'react';
import StaffLayout from '../../../components/layout/StaffLayout';
import { GradingPagination, GradingQueueList } from '../../../components/grading/GradingQueueList';
import { Button, PageHeader, SegmentedTabs } from '../../../components/shared/ui';
import { navigate } from '../../../lib/auth/auth';
import { getAdminQueue, getAdminTeacherLoads, gradingSkillName } from '../../../lib/grading/grading';

const tabs = [
  { value: 'WAITING_ASSIGNMENT', label: 'Chờ phân công' },
  { value: 'ASSIGNED', label: 'Đang chấm' },
  { value: 'LOADS', label: 'Tải giáo viên' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const;
type Tab = (typeof tabs)[number]['value'];
type Queue = Awaited<ReturnType<typeof getAdminQueue>>;
type Loads = Awaited<ReturnType<typeof getAdminTeacherLoads>>;
type View = { kind: 'requests'; data: Queue } | { kind: 'loads'; data: Loads };

export default function AdminGrading() {
  const [tab, setTab] = useState<Tab>('WAITING_ASSIGNMENT');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState<View>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setView(undefined);
    setError('');
    const fetchView: Promise<View> = tab === 'LOADS'
      ? getAdminTeacherLoads(page).then(data => ({ kind: 'loads', data }))
      : getAdminQueue(tab, page).then(data => ({ kind: 'requests', data }));
    fetchView.then(value => {
      if (!active) return;
      if (page > 1 && !value.data.items.length) setPage(page - 1);
      else setView(value);
    }).catch(error => {
      if (active) setError(error instanceof Error ? error.message : 'Chưa tải được dữ liệu hỗ trợ chấm.');
    });
    return () => { active = false; };
  }, [tab, page, revision]);

  return <StaffLayout active="grading" crumb="Quản lý / Theo dõi hỗ trợ chấm" contentClassName="flex min-w-0 flex-col gap-5 p-4 sm:p-6 md:p-8">
    <PageHeader title="Theo dõi hỗ trợ chấm" description="Hàng đợi, tải giáo viên và lượt bonus đã hoàn."
      actions={<Button onClick={() => setRevision(value => value + 1)}>Làm mới</Button>} />
    <SegmentedTabs options={[...tabs]} value={tab} onChange={value => { setTab(value); setPage(1); }} label="Dữ liệu hỗ trợ chấm" />
    {error ? <p role="alert">{error}</p> : !view ? <p role="status">Đang tải dữ liệu…</p> : <>
      {view.kind === 'requests' ? <GradingQueueList items={view.data.items} /> : view.data.items.length ? <div className="grid gap-3">
        {view.data.items.map(item => <div key={item.teacherId + item.skill}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-solid border-[var(--attempt-line-d6d4d0)] p-4 text-sm">
          <div>
            <strong>{item.name} · {gradingSkillName[item.skill]}</strong>
            <p className="m-0">{item.assigned}/{item.maxPending ?? '—'} bài · {item.accountStatus === 'LOCKED' ? 'Tài khoản bị khóa'
              : item.status === 'PENDING_REVOKE' ? 'Chờ thu hồi quyền' : item.accepting ? 'Đang nhận bài' : 'Dừng nhận bài'}</p>
          </div>
          <Button size="sm" onClick={() => navigate('AdminUsers?userId=' + encodeURIComponent(item.teacherId))}>Mở hồ sơ giáo viên</Button>
        </div>)}
      </div> : <p role="status">Chưa có giáo viên.</p>}
      <GradingPagination page={page} nextPage={view.data.nextPage} onPage={setPage} />
    </>}
  </StaffLayout>;
}
