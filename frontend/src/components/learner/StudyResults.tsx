import { useEffect, useState } from 'react';
import PageLink from '../navigation/PageLink';
import { getStudyResults, skillNames, type StudyResult, type LearnerSkill, type ResultKind } from '../../lib/learner/study-overview';
import { learnerMuted, studyPanel } from './StudyProgress';

const shortDate = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });
const accuracyFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const scopes: Record<StudyResult['scope'], string> = {
  FULL_EXAM: 'Toàn bài', FULL_SKILL: 'Toàn kỹ năng', SECTION: 'Theo phần', QUESTION_GROUP: 'Theo nhóm câu',
};
const control = 'min-h-9 rounded-lg border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-transparent px-3 text-inherit';

export default function StudyResults({ recent = false }: { recent?: boolean }) {
  const [kind, setKind] = useState<ResultKind>(recent ? 'all' : 'band');
  const [skill, setSkill] = useState<LearnerSkill | ''>('');

  return <section id={recent ? 'gan-day' : 'lich-su'} aria-label={recent ? 'Bài làm gần đây' : 'Lịch sử luyện đề'}
    className={recent ? 'mx-auto max-w-[1200px] px-6 pt-9' : studyPanel}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="m-0 text-xl font-bold">{recent ? 'Bài làm gần đây' : 'Lịch sử luyện đề'}</h2>
      {recent && <PageLink page="StudentHome" className="text-sm font-semibold">Mở Dashboard</PageLink>}
    </div>
    {!recent && <div className="my-3 flex flex-wrap gap-2">
      <div className="grid gap-1 text-sm"><label htmlFor="learner-result-kind">Loại kết quả</label>
        <select id="learner-result-kind" className={control} value={kind} onChange={event => setKind(event.currentTarget.value === 'practice' ? 'practice' : 'band')}>
          <option value="band">Band theo kỹ năng</option>
          <option value="practice">Tỷ lệ đúng bài luyện</option>
        </select>
      </div>
      <div className="grid gap-1 text-sm"><label htmlFor="learner-result-skill">Kỹ năng</label>
        <select id="learner-result-skill" className={control} value={skill} onChange={event => {
          const value = event.currentTarget.value;
          setSkill(Object.prototype.hasOwnProperty.call(skillNames, value) ? value as LearnerSkill : '');
        }}>
          <option value="">Tất cả</option>
          {Object.entries(skillNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>
    </div>}
    <ResultList key={`${kind}:${skill}`} kind={kind} skill={skill || undefined} recent={recent} />
  </section>;
}

function ResultList({ kind, skill, recent }: { kind: ResultKind; skill?: LearnerSkill; recent: boolean }) {
  const [items, setItems] = useState<StudyResult[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [request, setRequest] = useState<{ before?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void getStudyResults({ kind, skill, limit: recent ? 4 : 15, before: request.before }).then(result => {
      if (!active) return;
      setItems(current => request.before ? [...current, ...result.items] : result.items);
      setNext(result.nextCursor);
    }).catch(() => { if (active) setError('Chưa tải được lịch sử kết quả.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [request, recent, skill, kind]);

  return <>
    {kind === 'band' && <p className={`my-2 text-sm ${learnerMuted}`}>Band theo kỹ năng từ kết quả đã lưu. Chưa có band tổng đã lưu.</p>}
    {loading && <p role="status">Đang tải kết quả…</p>}
    {error && <p role="alert">{error} <button type="button" className={control} onClick={() => setRequest(current => ({ ...current }))}>Thử lại</button></p>}
    {!items.length && !loading && !error && <p className={learnerMuted}>{kind === 'band' ? 'Chưa có kết quả band đã lưu.'
      : kind === 'practice' ? 'Chưa có kết quả bài luyện đã lưu.' : 'Chưa có kết quả đã lưu.'}</p>}
    {!!items.length && <ul className={`m-0 grid list-none gap-2 p-0 ${recent ? 'mt-3 sm:grid-cols-2' : ''}`}>
      {items.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] p-3">
        <div className="min-w-0 break-words">
          <strong>{item.title}</strong>
          <div className={`text-sm ${learnerMuted}`}>
            {skillNames[item.skill]}{item.form ? ` · ${item.form === 'GENERAL' ? 'General Training' : 'Academic'}` : ''} · {scopes[item.scope]} ·{' '}
            <time dateTime={item.completedAt}>{shortDate.format(new Date(item.completedAt))}</time>
          </div>
        </div>
        <strong className="tabular-nums">{item.band !== null ? `Band ${item.band.toFixed(1)}` : item.accuracy !== null
          ? `${accuracyFormat.format(item.accuracy)}% đúng${item.correct !== null && item.total !== null ? ` (${item.correct}/${item.total})` : ''}` : '—'}</strong>
      </li>)}
    </ul>}
    {!recent && next && <button type="button" className={`${control} mt-3`} disabled={loading} onClick={() => setRequest({ before: next })}>Xem thêm</button>}
  </>;
}
