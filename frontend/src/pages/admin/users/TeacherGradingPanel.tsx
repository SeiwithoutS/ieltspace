import { useEffect, useState, type FormEvent } from 'react';
import { Button, ConfirmDialog, Icon, controlClass } from '../../../components/shared/ui';
import { cancelTeacherWork, formatGradingDate, getTeacherWork, gradingSkillName, saveTeacherPermission,
  type QueueItem, type TeacherLoad } from '../../../lib/grading/grading';

function PermissionForm({ item, onSaved }: { item: TeacherLoad; onSaved: (message: string) => void }) {
  const [canGrade, setCanGrade] = useState(item.status === 'ACTIVE');
  const [accepting, setAccepting] = useState(item.accepting);
  const [limit, setLimit] = useState(String(item.maxPending ?? 5));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await saveTeacherPermission(item.teacherId, item.skill, { canGrade, isAccepting: accepting, maxPending: Number(limit) });
      const message = `Đã lưu quyền chấm ${gradingSkillName[item.skill]}.`;
      onSaved(result.status === 'ACTIVE' && !result.accepting
        ? `${message} Bật “Nhận bài mới” để hệ thống phân công tự động.` : message);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa lưu được quyền chấm.');
    } finally { setBusy(false); }
  }
  return <form onSubmit={event => void save(event)} className="grid gap-2 border-0 border-t border-solid border-[var(--attempt-line-d6d4d0)] py-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <strong>{gradingSkillName[item.skill]}</strong>
      <span>{item.assigned} bài đang giao{item.status === 'PENDING_REVOKE' ? ' · Chờ thu hồi quyền' : ''}</span>
    </div>
    <label className="flex items-center gap-2"><input type="checkbox" checked={canGrade} disabled={busy}
      onChange={event => setCanGrade(event.currentTarget.checked)} /> Có quyền chấm {gradingSkillName[item.skill]}</label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={canGrade && accepting} disabled={busy || !canGrade}
      onChange={event => setAccepting(event.currentTarget.checked)} /> Nhận bài mới</label>
    <label className="flex items-center gap-2">Giới hạn nhận bài
      <input className={controlClass() + ' w-24'} type="number" min={0} max={50} step={1} required value={limit}
        onChange={event => setLimit(event.currentTarget.value)} disabled={busy} />
    </label>
    {error && <p role="alert" className="m-0">{error}</p>}
    <Button type="submit" size="sm" disabled={busy} className="justify-self-end">{busy ? 'Đang lưu…' : 'Lưu quyền chấm'}</Button>
  </form>;
}

export default function TeacherGradingPanel({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<Awaited<ReturnType<typeof getTeacherWork>>>();
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [target, setTarget] = useState<QueueItem>();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadError('');
    getTeacherWork(id, page).then(result => {
      if (!active) return;
      if (page > 1 && !result.items.length) setPage(page - 1);
      else setData(result);
    }).catch(error => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Chưa tải được công việc chấm.');
    });
    return () => { active = false; };
  }, [id, page, version]);

  function saved(message: string) {
    setNotice(message);
    setVersion(value => value + 1);
    onChanged();
  }

  async function cancel() {
    if (!target || !reason.trim() || busy) return;
    setBusy(true);
    setActionError('');
    try {
      await cancelTeacherWork(id, target.id, reason.trim());
      setTarget(undefined);
      saved('Đã hủy yêu cầu và hoàn 1 lượt bonus cho người học.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Chưa hủy được yêu cầu.');
    } finally { setBusy(false); }
  }

  return <section className="grid gap-2 text-sm" aria-label="Quyền và bài đang giao">
    <h3 className="m-0 font-semibold">Quyền chấm và giới hạn nhận bài</h3>
    {loadError ? <div role="alert" className="flex flex-wrap items-center gap-2">{loadError}
      <Button size="sm" onClick={() => setVersion(value => value + 1)}>Thử lại</Button></div> : !data ? <p role="status">Đang tải công việc chấm…</p> : <>
      {data.skills.map(item => <PermissionForm key={`${item.skill}:${item.status}:${item.maxPending}:${item.accepting}`}
        item={item} onSaved={saved} />)}
      <h3 className="m-0 font-semibold">Bài đang giao</h3>
      <p className="m-0">Khi giáo viên không thể hoàn thành, chọn bài cần hủy và ghi rõ lý do.</p>
      {!data.items.length && <p className="m-0">Giáo viên không có bài đang giao.</p>}
      {data.items.map(item => <div key={item.id} className="flex flex-wrap items-start justify-between gap-2 border-0 border-t border-solid border-[var(--attempt-line-d6d4d0)] py-2">
        <div><strong>{item.title}</strong><div>{gradingSkillName[item.skill]}{item.assignedAt ? ` · Giao lúc ${formatGradingDate(item.assignedAt)}` : ''}</div></div>
        <Button size="sm" variant="danger" onClick={() => { setTarget(item); setReason(''); setActionError(''); }}>Hủy bài đang giao</Button>
      </div>)}
      {(page > 1 || data.nextPage) && <div className="flex justify-end gap-2">
        <Button size="sm" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Trang trước</Button>
        <Button size="sm" disabled={!data.nextPage} onClick={() => setPage(value => value + 1)}>Trang sau</Button>
      </div>}
    </>}
    {notice && <p role="status" className="m-0">{notice}</p>}
    <ConfirmDialog open={!!target} onClose={() => { if (!busy) setTarget(undefined); }} label="Hủy bài đang giao"
      title="Giáo viên không thể hoàn thành" icon={<Icon name="trash" size={20} />} tone="danger"
      confirmVariant="danger-solid" confirmLabel={busy ? 'Đang hủy…' : 'Hủy và hoàn bonus'} confirmDisabled={busy || !reason.trim()}
      onConfirm={() => void cancel()}>
      <p>Bài {target?.title} sẽ trở về hạn lưu gốc. Người học được hoàn 1 lượt bonus.</p>
      <label className="grid gap-1">Lý do hủy<textarea className={controlClass()} maxLength={500} rows={3}
        disabled={busy} value={reason} onChange={event => setReason(event.currentTarget.value)} /></label>
      {actionError && <p role="alert">{actionError}</p>}
    </ConfirmDialog>
  </section>;
}
