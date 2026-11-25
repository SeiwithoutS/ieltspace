import type { ReactNode } from 'react';
import StaffLayout from '../layout/StaffLayout';
import PageLink from '../navigation/PageLink';
import { Button, Chip, Icon, SegmentedTabs, buttonClass } from '../shared/ui';
import { gradingSkillName, type Skill } from '../../lib/grading/grading';
import { wsSectionsLabel } from '../../lib/learner/ws-history';
import './teacher-workspace.css';

export function TeacherWorkspace({ active, title, description, children }: {
  active: 'home' | 'grading' | 'exams'; title: string; description: string; children: ReactNode;
}) {
  const crumb = active === 'home' ? 'Tổng quan' : title;
  return <StaffLayout role="TEACHER" active={active} crumb={`Giáo viên / ${crumb}`} contentClassName="teacher-workspace">
    <header className="teacher-heading">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
    {children}
  </StaffLayout>;
}

export function TeacherStats({ items }: { items: { title: string; value: ReactNode; detail: string }[] }) {
  return <dl className="teacher-panel teacher-stats">
    {items.map(item => <div key={item.title}>
      <dt>{item.title}</dt><dd><span>{item.value}</span><small>{item.detail}</small></dd>
    </div>)}
  </dl>;
}

export function SkillFilter({ skill, onChange }: { skill: Skill | ''; onChange: (skill: Skill | '') => void }) {
  return <SegmentedTabs<Skill | ''> label="Kỹ năng" value={skill} onChange={onChange}
    options={[{ value: '', label: 'Tất cả' }, { value: 'WRITING', label: 'Writing' }, { value: 'SPEAKING', label: 'Speaking' }]} />;
}

export function TeacherSkill({ skill }: { skill: Skill }) {
  return <Chip tone={skill === 'WRITING' ? 'skill-W' : 'skill-S'}>{gradingSkillName[skill]}</Chip>;
}

export function AssignmentStatus({ hasDraft }: { hasDraft: boolean }) {
  return <span className={`teacher-pill ${hasDraft ? 'teacher-pill--blue' : 'teacher-pill--amber'}`}>
    {hasDraft && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5" /></svg>}
    {hasDraft ? 'Có bản nháp' : 'Chờ chấm'}
  </span>;
}

export function TeacherReviewLink({ id, label, title }: { id: string; label: string; title: string }) {
  return <PageLink page="TeacherGrade" query={new URLSearchParams({ request: id }).toString()}
    className={buttonClass({ size: 'sm' })} aria-label={`${label} · ${title}`}>{label}</PageLink>;
}

export function TeacherNotice({ children }: { children: ReactNode }) {
  return <aside className="teacher-notice"><Icon name="info" size={18} /><div>{children}</div></aside>;
}

export function TeacherMessage({ error, retry, children }: { error?: string; retry: () => void; children: ReactNode }) {
  return <div className="teacher-message" role={error ? 'alert' : 'status'}>
    <span>{error || children}</span>{error && <Button size="sm" onClick={retry}>Thử lại</Button>}
  </div>;
}

export function teacherScope(skill: Skill, sections: number[] | null) {
  const name = gradingSkillName[skill];
  const scope = wsSectionsLabel(name, sections);
  return scope === 'Cả kỹ năng' ? `${name} · ${scope}` : scope ? `${name} ${scope}` : name;
}
