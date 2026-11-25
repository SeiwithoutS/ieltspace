import PageLink from '../../components/navigation/PageLink';
import { AssignmentStatus, TeacherMessage, TeacherReviewLink, TeacherSkill, TeacherStats, TeacherWorkspace, teacherScope } from '../../components/grading/TeacherWorkspace';
import { useAuth } from '../../lib/auth/auth';
import { formatGradingDate, gradingSkillName, type Skill } from '../../lib/grading/grading';
import { getTeacherOverview, gradingCapacity, useTeacherData, waitingTime, type TeacherAssignmentLoad } from '../../lib/grading/teacher-workspace';

function acceptance(load: TeacherAssignmentLoad) {
  if (load.status === 'REVOKED') return { label: 'Chưa có quyền', tone: '' };
  if (load.status === 'PENDING_REVOKE') return { label: 'Chờ thu hồi quyền', tone: 'teacher-pill--amber' };
  if (!load.accepting) return { label: 'Dừng nhận bài', tone: '' };
  if (load.assigned >= (load.maxPending ?? 0)) return { label: 'Đã đạt giới hạn', tone: 'teacher-pill--amber' };
  return { label: 'Đang nhận bài', tone: 'teacher-pill--green' };
}

function SkillIcon({ skill }: { skill: Skill }) {
  return <span className="teacher-assignment-icon" data-skill={skill}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {skill === 'WRITING' ? <path d="M15 5l4 4L8 20H4v-4z" />
        : <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>}
    </svg>
  </span>;
}

export default function TeacherHome() {
  const { user } = useAuth();
  const { data, error, retry } = useTeacherData(getTeacherOverview);
  const name = user?.display_name?.trim() || user?.full_name?.trim();
  const capacity = data ? gradingCapacity(data.loads) : null;
  const loadText = data ? `${data.assigned} / ${capacity ?? '—'}` : '—';
  const lastAssigned = data?.loads.map(load => load.lastAssignedAt ?? '').sort().pop();
  const now = Date.now();

  return <TeacherWorkspace active="home" title={name ? `Chào ${name}` : 'Tổng quan'} description="Các bài Writing và Speaking hệ thống đã phân công cho bạn.">
    <TeacherStats items={[
      { title: 'Chờ chấm', value: data ? data.assigned - data.drafts : '—', detail: 'chưa lưu bản nháp' },
      { title: 'Có bản nháp', value: data?.drafts ?? '—', detail: 'chưa công bố' },
      { title: 'Đã công bố tuần này', value: data?.publishedThisWeek ?? '—', detail: 'tính theo giờ Việt Nam' },
      { title: 'Giới hạn nhận bài', value: loadText, detail: 'bài đang giao / giới hạn' },
    ]} />
    <div className="teacher-home-columns">
      <section className="teacher-panel" aria-labelledby="teacher-continue">
        <header className="teacher-panel-head"><h2 className="teacher-section-title" id="teacher-continue">Tiếp tục công việc</h2>
          <PageLink page="TeacherQueue">Xem hàng chờ</PageLink></header>
        {data?.items.length ? <ul className="m-0 list-none p-0">
          {data.items.map(item => <li key={item.id} className="teacher-assignment">
            <SkillIcon skill={item.skill} />
            <div>
              <strong>{teacherScope(item.skill, item.sections)} · {item.title}</strong>
              <div className="teacher-muted">{item.learner}{item.assignedAt ? ` · phân công ${formatGradingDate(item.assignedAt)} · đã chờ chấm ${waitingTime(item.assignedAt, now).toLowerCase()}` : ''}</div>
            </div>
            <TeacherSkill skill={item.skill} /><AssignmentStatus hasDraft={item.hasDraft} />
            <TeacherReviewLink id={item.id} label="Mở bài" title={item.title} />
          </li>)}
        </ul> : <TeacherMessage error={error} retry={retry}>{data ? 'Bạn chưa có bài được phân công.' : 'Đang tải bài được phân công…'}</TeacherMessage>}
      </section>
      <section className="teacher-panel teacher-section-pad">
        <h2 className="teacher-section-title">Trạng thái nhận bài</h2>
        <dl className="teacher-load">
          {data?.loads.map(load => {
            const status = acceptance(load);
            return <div key={load.skill}><dt>Quyền chấm {gradingSkillName[load.skill]}</dt>
              <dd><span className={`teacher-pill ${status.tone}`}>{status.label}</span></dd></div>;
          })}
          <div><dt>Bài đang giao</dt><dd>{loadText}</dd></div>
          <div><dt>Lần nhận bài gần nhất</dt><dd>{lastAssigned ? formatGradingDate(lastAssigned) : '—'}</dd></div>
        </dl>
        <p className="teacher-muted m-0">Quản lý thiết lập quyền và giới hạn. Bạn vẫn có thể chấm nốt bài đã được giao khi dừng nhận bài mới.</p>
      </section>
    </div>
  </TeacherWorkspace>;
}
