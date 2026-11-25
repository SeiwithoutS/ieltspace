import { useCallback, useEffect, useState } from 'react';
import { AssignmentStatus, SkillFilter, TeacherMessage, TeacherNotice, TeacherReviewLink, TeacherSkill, TeacherWorkspace, teacherScope } from '../../components/grading/TeacherWorkspace';
import { GradingPagination } from '../../components/grading/GradingQueueList';
import { Button, DataTable, SearchField, SegmentedTabs } from '../../components/shared/ui';
import { formatGradingDate, type Skill } from '../../lib/grading/grading';
import { getTeacherQueue, gradingCapacity, useTeacherData, waitingTime, type AssignmentSort } from '../../lib/grading/teacher-workspace';

const columns = ['Người học', 'Đề bài', 'Kỹ năng', 'Tiếp nhận', 'Phân công', 'Đã chờ chấm', 'Trạng thái', 'Thao tác'];

export default function TeacherQueue() {
  const [skill, setSkill] = useState<Skill | ''>('');
  const [sort, setSort] = useState<AssignmentSort>('oldest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const load = useCallback(() => getTeacherQueue(page, skill, sort, search), [page, skill, sort, search]);
  const { data, error, retry } = useTeacherData(load);
  useEffect(() => {
    if (data && !data.items.length && page > 1) setPage(value => value - 1);
  }, [data, page]);

  const now = Date.now();
  const capacity = data ? gradingCapacity(data.loads) : null;
  const assigned = data?.loads.reduce((sum, item) => sum + item.assigned, 0) ?? 0;
  return <TeacherWorkspace active="grading" title="Hàng chờ chấm" description="Các bài Writing và Speaking đã được hệ thống phân công cho bạn.">
    <div className="teacher-toolbar">
      <SkillFilter skill={skill} onChange={value => { setSkill(value); setPage(1); }} />
      <SegmentedTabs label="Sắp xếp hàng chờ" value={sort}
        options={[{ value: 'oldest', label: 'Chờ lâu nhất' }, { value: 'newest', label: 'Mới phân công' }]}
        onChange={value => { setSort(value); setPage(1); }} />
      <SearchField value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Tìm người học" maxLength={120} />
      <Button size="sm" onClick={retry}>Làm mới</Button>
    </div>
    <section className="teacher-panel" aria-label="Bài được phân công">
      <div className="teacher-table-head">
        <span className="teacher-pill teacher-pill--amber">{data ? `${data.total} bài chờ chấm` : 'Bài chờ chấm'}</span>
        {data && <span className="teacher-pill">Giới hạn {assigned} / {capacity ?? '—'}</span>}
      </div>
      <DataTable label="Danh sách bài được phân công" minWidth={810}>
        <thead><tr>{columns.map(name => <th className="ui-th ui-th--nowrap" scope="col" key={name}>
          {name === 'Thao tác' ? <span className="sr-only">{name}</span> : name}
        </th>)}</tr></thead>
        <tbody>
          {data?.items.map(item => <tr key={item.id}>
            <td className="ui-td"><strong>{item.learner}</strong><div className="teacher-muted">{teacherScope(item.skill, item.sections)}</div></td>
            <td className="ui-td teacher-exam-cell">{item.title}</td>
            <td className="ui-td"><TeacherSkill skill={item.skill} /></td>
            <td className="ui-td ui-td--nowrap">{formatGradingDate(item.requestedAt)}</td>
            <td className="ui-td ui-td--nowrap">{item.assignedAt ? formatGradingDate(item.assignedAt) : '—'}</td>
            <td className="ui-td ui-td--nowrap">{waitingTime(item.assignedAt, now)}</td>
            <td className="ui-td"><AssignmentStatus hasDraft={item.hasDraft} /></td>
            <td className="ui-td"><TeacherReviewLink id={item.id} title={item.title} label={item.hasDraft ? 'Tiếp tục' : 'Chấm bài'} /></td>
          </tr>)}
          {!data?.items.length && <tr><td colSpan={columns.length}><TeacherMessage error={error} retry={retry}>
            {data ? skill || search ? 'Không tìm thấy bài phù hợp.' : 'Bạn chưa có bài được phân công.' : 'Đang tải hàng chờ…'}
          </TeacherMessage></td></tr>}
        </tbody>
      </DataTable>
    </section>
    {data && <GradingPagination page={page} nextPage={data.nextPage} onPage={setPage} />}
    <TeacherNotice>Hàng chờ không có hạn chấm. Chỉ bạn thấy bản nháp. Nếu Quản lý hủy yêu cầu trong lúc bạn đang chấm, hệ thống sẽ từ chối công bố kết quả.</TeacherNotice>
  </TeacherWorkspace>;
}
