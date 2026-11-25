import { useCallback, useState } from 'react';
import { SkillFilter, TeacherMessage, TeacherNotice, TeacherReviewLink, TeacherSkill, TeacherStats, TeacherWorkspace, teacherScope } from '../../components/grading/TeacherWorkspace';
import { Button, DataTable, SearchField, SegmentedTabs, controlClass } from '../../components/shared/ui';
import type { Skill } from '../../lib/grading/grading';
import { formatReviewDay } from '../../lib/grading/review';
import { getTeacherHistory, useTeacherData, type HistoryPeriod } from '../../lib/grading/teacher-workspace';

const columns = ['Người học', 'Đề bài', 'Kỹ năng', 'Điểm', 'Ngày công bố', 'Nội dung bài', 'Thao tác'];
const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' });

export default function TeacherHistory() {
  const [skill, setSkill] = useState<Skill | ''>('');
  const [mode, setMode] = useState<'7' | '30' | 'range'>('30');
  const [period, setPeriod] = useState<HistoryPeriod>({ days: 30 });
  const [range, setRange] = useState(() => {
    const now = Date.now();
    return { from: day.format(now - 29 * 86_400_000), to: day.format(now) };
  });
  const [search, setSearch] = useState('');
  const load = useCallback(() => getTeacherHistory(skill, period, search), [skill, period, search]);
  const { data, error, retry } = useTeacherData(load);

  return <TeacherWorkspace active="exams" title="Lịch sử chấm" description="Xem lại các kết quả bạn đã công bố.">
    <TeacherStats items={[
      { title: 'Tuần này', value: data?.totals.week ?? '—', detail: 'bài đã công bố' },
      { title: 'Tháng này', value: data?.totals.month ?? '—', detail: 'bài đã công bố' },
      { title: 'Writing / Speaking', value: data ? `${data.totals.writing} / ${data.totals.speaking}` : '—', detail: 'trong tháng này' },
    ]} />
    <div className="teacher-toolbar">
      <SkillFilter skill={skill} onChange={setSkill} />
      <SegmentedTabs label="Khoảng thời gian" value={mode}
        options={[{ value: '7', label: '7 ngày' }, { value: '30', label: '30 ngày' }, { value: 'range', label: 'Tùy chọn' }]}
        onChange={value => { setMode(value); if (value !== 'range') setPeriod({ days: Number(value) }); }} />
      <SearchField value={search} onChange={setSearch} placeholder="Tìm người học" maxLength={120} />
    </div>
    {mode === 'range' && <form className="teacher-range" onSubmit={event => { event.preventDefault(); setPeriod(range); }}>
      <label>Từ ngày<input type="date" required className={controlClass()} value={range.from} max={range.to || undefined}
        onChange={event => setRange(value => ({ ...value, from: event.target.value }))} /></label>
      <label>Đến ngày<input type="date" required className={controlClass()} value={range.to} min={range.from || undefined}
        onChange={event => setRange(value => ({ ...value, to: event.target.value }))} /></label>
      <Button type="submit" variant="primary">Áp dụng</Button>
    </form>}
    <section className="teacher-panel" aria-label="Kết quả đã công bố">
      <DataTable label="Danh sách kết quả đã công bố" minWidth={680}>
        <thead><tr>{columns.map(name => <th className="ui-th ui-th--nowrap" scope="col" key={name}>
          {name === 'Thao tác' ? <span className="sr-only">{name}</span> : name}
        </th>)}</tr></thead>
        <tbody>
          {data?.items.map(item => <tr key={item.id}>
            <td className="ui-td"><strong>{item.learner}</strong><div className="teacher-muted">{teacherScope(item.skill, item.sections)}</div></td>
            <td className="ui-td teacher-exam-cell">{item.title}</td>
            <td className="ui-td"><TeacherSkill skill={item.skill} /></td>
            <td className="ui-td tabular-nums">{item.overall?.toFixed(1) ?? '—'}</td>
            <td className="ui-td ui-td--nowrap">{formatReviewDay(item.publishedAt)}</td>
            <td className="ui-td"><span className={`teacher-pill ${item.expired ? '' : 'teacher-pill--green'}`}>
              {item.expired ? 'Nội dung đã hết hạn' : item.expiresAt ? `Còn đến ${formatReviewDay(item.expiresAt)}` : 'Còn lưu'}
            </span></td>
            <td className="ui-td"><TeacherReviewLink id={item.id} title={item.title} label={item.expired ? 'Xem điểm' : 'Xem'} /></td>
          </tr>)}
          {!data?.items.length && <tr><td colSpan={columns.length}><TeacherMessage error={error} retry={retry}>
            {data ? 'Chưa có kết quả phù hợp.' : 'Đang tải lịch sử chấm…'}
          </TeacherMessage></td></tr>}
        </tbody>
      </DataTable>
    </section>
    <TeacherNotice>Khi nội dung bài hết hạn, bạn vẫn xem được điểm và nhận xét đã gửi.</TeacherNotice>
  </TeacherWorkspace>;
}
