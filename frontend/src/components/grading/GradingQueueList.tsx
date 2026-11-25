import { Button, Chip } from '../shared/ui';
import { cancellationText, formatGradingDate, gradingSkillName, gradingStatusName, type QueueItem } from '../../lib/grading/grading';
import { wsSectionsLabel } from '../../lib/learner/ws-history';

export function GradingQueueList({ items }: { items: QueueItem[] }) {
  if (items.length === 0) return <p className="m-0" role="status">Chưa có yêu cầu ở trạng thái này.</p>;
  return <ul className="m-0 grid list-none gap-3 p-0">
    {items.map(item => {
      const name = gradingSkillName[item.skill];
      const scope = wsSectionsLabel(name, item.sections);
      return <li key={item.id} className="rounded-xl border border-solid border-[var(--attempt-line-d6d4d0)] bg-[var(--attempt-bg-ffffff)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong>{item.title}</strong><Chip>{gradingStatusName[item.status]}</Chip>
        </div>
        <p className="mb-1 mt-2 text-sm">{scope ? `${name} · ${scope}` : name}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>Tiếp nhận {formatGradingDate(item.requestedAt)}</span>
          {item.status === 'WAITING_ASSIGNMENT' && <span>Hạn phân công {formatGradingDate(item.assignmentDeadline)}</span>}
          {item.assignedAt && <span>Giao lúc {formatGradingDate(item.assignedAt)}{item.teacherName ? ` · ${item.teacherName}` : ''}</span>}
          {item.cancelledAt && <span>Hủy {formatGradingDate(item.cancelledAt)} · {cancellationText(item.cancelReason)}</span>}
          {item.bonusExpiresAt && <span>Đã hoàn 1 bonus, hạn {formatGradingDate(item.bonusExpiresAt)}</span>}
        </div>
      </li>;
    })}
  </ul>;
}

export function GradingPagination({ page, nextPage, onPage }: { page: number; nextPage: number | null; onPage: (page: number) => void }) {
  if (page === 1 && !nextPage) return null;
  return <nav className="flex flex-wrap justify-end gap-2" aria-label="Phân trang">
    <Button size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}>Trang trước</Button>
    <Button size="sm" disabled={!nextPage} onClick={() => { if (nextPage) onPage(nextPage); }}>Trang sau</Button>
  </nav>;
}
