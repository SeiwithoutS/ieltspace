import { useState } from 'react';
import PageLink from '../navigation/PageLink';
import { useStudyResults, resultGroups, skillNames, type StudyResult, type LearnerSkill, type ResultKind } from '../../lib/learner/study-overview';
import './learner-study.css';

const shortDate = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
const accuracyFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const scopes: Record<StudyResult['scope'], string> = {
  FULL_EXAM: 'Toàn bài', FULL_SKILL: 'Toàn kỹ năng', SECTION: 'Theo phần', QUESTION_GROUP: 'Theo nhóm câu',
};

export default function StudyResults({ recent = false }: { recent?: boolean }) {
  const [kind, setKind] = useState<ResultKind>('all');
  const [skill, setSkill] = useState<LearnerSkill | ''>('');

  if (recent) return <section id="gan-day" aria-label="Bài làm gần đây" className="mx-auto max-w-[1200px] px-6 pt-9">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="m-0 text-xl font-bold">Bài làm gần đây</h2>
      <PageLink page="PracticeHistory" className="text-sm font-semibold">Xem lịch sử luyện tập</PageLink>
    </div>
    <ResultList kind="all" recent />
  </section>;

  return <section className="learner-study-panel" aria-labelledby="practice-results-title">
    <div className="learner-study-results-header">
      <div>
        <h2 id="practice-results-title">Bài đã hoàn thành</h2>
        <p className="learner-study-muted">Kết quả hiển thị theo band kỹ năng hoặc tỷ lệ trả lời đúng.</p>
      </div>
      <div className="learner-study-filters">
        <label>Kỹ năng
          <select className="learner-study-control" value={skill} onChange={event => setSkill(event.currentTarget.value as LearnerSkill | '')}>
            <option value="">Tất cả kỹ năng</option>
            {resultGroups.LR.map(id => <option key={id} value={id}>{skillNames[id]}</option>)}
          </select>
        </label>
        <label>Loại kết quả
          <select className="learner-study-control" value={kind} onChange={event => setKind(event.currentTarget.value as ResultKind)}>
            <option value="all">Tất cả kết quả</option>
            <option value="band">Có điểm band</option>
            <option value="practice">Có tỷ lệ đúng</option>
          </select>
        </label>
      </div>
    </div>
    <ResultList key={`${kind}:${skill}`} kind={kind} skill={skill || undefined} />
  </section>;
}

function ResultList({ kind, skill, recent = false }: {
  kind: ResultKind; skill?: LearnerSkill; recent?: boolean;
}) {
  const { items, next, loading, error, retry, loadMore } = useStudyResults({ kind, skill, group: recent ? undefined : 'LR', limit: recent ? 4 : 15 });

  return <div className="learner-study-result-list" aria-busy={loading}>
    {!!items.length && <ul className={recent ? 'learner-study-recent' : undefined}>
      {items.map(item => {
        const score = item.band !== null ? `Band ${item.band.toFixed(1)}` : item.accuracy !== null
          ? `${accuracyFormat.format(item.accuracy)}% đúng` : 'Chưa có điểm';
        return <li key={item.id} className="learner-study-result">
          <div className="learner-study-result-info">
            <div className="learner-study-result-tags">
              <span className="learner-study-badge" data-skill={item.skill}>{skillNames[item.skill]}</span>
              <span>{scopes[item.scope]}</span>
              {item.form && <span>{item.form === 'GENERAL' ? 'General Training' : 'Academic'}</span>}
            </div>
            <strong className="learner-study-result-title">{item.title}</strong>
            <time dateTime={item.completedAt}>{shortDate.format(new Date(item.completedAt))}</time>
          </div>
          <div className="learner-study-result-score" data-pending={item.band === null && item.accuracy === null}>
            <strong>{score}</strong>
            {item.accuracy !== null && item.correct !== null && item.total !== null && <span>{item.correct}/{item.total} câu</span>}
          </div>
        </li>;
      })}
    </ul>}
    {loading && <p role="status" className="learner-study-empty">Đang tải kết quả…</p>}
    {error && <div role="alert" className="learner-study-empty">{error}{' '}
      <button type="button" className="learner-study-button" onClick={retry}>Thử lại</button>
    </div>}
    {!items.length && !loading && !error && <p className="learner-study-empty">
      {kind === 'all' ? 'Chưa có bài làm đã lưu.' : 'Chưa có kết quả phù hợp với bộ lọc.'}
    </p>}
    {!recent && next && !error && <button type="button" className="learner-study-button" disabled={loading}
      onClick={loadMore}>Xem thêm</button>}
  </div>;
}
