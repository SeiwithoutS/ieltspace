import { useEffect, useState, type FormEvent } from 'react';
import { getStudyGoals, saveStudyGoal, type GoalValues, type StudyGoal } from '../../lib/auth/study-goals';

const fields = [
  ['overall', 'Band mục tiêu tổng'], ['listening', 'Listening'], ['reading', 'Reading'],
  ['writing', 'Writing'], ['speaking', 'Speaking'],
] as const;
const options = Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
const timeFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' });
const formControl = 'box-border min-h-10 w-full rounded-lg border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#fff)] px-3 text-inherit';
const button = 'min-h-10 cursor-pointer rounded-full border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-transparent px-4 text-inherit font-semibold disabled:opacity-60';

export default function StudyGoals() {
  const [history, setHistory] = useState<StudyGoal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const current = history[0];

  useEffect(() => {
    let active = true;
    setError('');
    void getStudyGoals().then(data => {
      if (active) { setHistory(data.history); setLoaded(true); }
    }).catch(() => { if (active) setError('Chưa tải được mục tiêu học tập.'); });
    return () => { active = false; };
  }, [retry]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const readBand = (key: keyof GoalValues) => {
      const value = form.get(key);
      return value == null || value === '' ? null : Number(value);
    };
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const data = await saveStudyGoal({
        overall: readBand('overall'), listening: readBand('listening'), reading: readBand('reading'),
        writing: readBand('writing'), speaking: readBand('speaking'), dailySessions: Number(form.get('dailySessions')),
      });
      setHistory(data.history);
      setMessage('Đã lưu mục tiêu học tập.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa lưu được mục tiêu.');
    } finally { setBusy(false); }
  }

  return <section aria-label="Mục tiêu học tập" className="grid gap-3 rounded-[22px] border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#fff)] p-4 sm:p-7 shadow-sm">
    <h2 className="m-0 text-lg font-bold">Mục tiêu học tập</h2>
    <p className="m-0 text-sm">Band từ 0 đến 9, theo bước 0,5. Nhập band tổng riêng với mục tiêu từng kỹ năng.</p>
    {!loaded && !error && <p role="status" className="m-0">Đang tải mục tiêu…</p>}
    {error && <p role="alert" className="m-0">{error} {!loaded && <button type="button" className={button} onClick={() => setRetry(value => value + 1)}>Thử lại</button>}</p>}
    {loaded && <>
      <form key={current?.id ?? 'new'} className="grid gap-3" onSubmit={save}>
        <fieldset disabled={busy} className="m-0 grid min-w-0 grid-cols-1 gap-3 border-0 p-0 sm:grid-cols-2">
          {fields.map(([field, label]) => <label key={field} className="grid gap-1 text-sm">{label}
            <select name={field} className={formControl} defaultValue={current?.[field]?.toFixed(1) ?? ''}>
              <option value="">Chưa đặt</option>
              {options.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>)}
          <label className="grid gap-1 text-sm">Số phiên học mỗi ngày
            <input type="number" name="dailySessions" min={1} max={2147483647} step={1} required className={formControl} defaultValue={current?.dailySessions ?? 1} />
          </label>
        </fieldset>
        <button type="submit" disabled={busy} className={`${button} justify-self-start`}>{busy ? 'Đang lưu…' : 'Lưu mục tiêu'}</button>
      </form>
      {message && <p role="status" className="m-0 text-sm">{message}</p>}
      {current && <details>
        <summary className="cursor-pointer font-semibold">Lịch sử mục tiêu</summary>
        <ol className="grid gap-2 pl-5 text-sm">
          {history.map(goal => <li key={goal.id}>
            <time dateTime={goal.effectiveFrom}>{timeFormat.format(new Date(goal.effectiveFrom))}</time>
            {' · '}{goal.dailySessions} phiên/ngày
            <div>{fields.map(([field, label]) => `${label}: ${goal[field]?.toFixed(1) ?? '—'}`).join(' · ')}</div>
          </li>)}
        </ol>
      </details>}
    </>}
  </section>;
}
