import { useEffect, useState, type FormEvent } from 'react';
import { getStudyGoals, saveStudyGoal, type GoalValues, type StudyGoal } from '../../lib/auth/study-goals';
import '../learner/learner-study.css';

const skills = [
  ['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking'],
] as const;
const bands = Array.from({ length: 19 }, (_, index) => (index / 2).toFixed(1));
const sessionOptions = Array.from({ length: 10 }, (_, index) => index + 1);
const date = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' });
const time = new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

function BandField({ name, label, value }: { name: keyof Omit<GoalValues, 'dailySessions'>; label: string; value?: number | null }) {
  return <label>{label}
    <select name={name} className="learner-study-control" defaultValue={value?.toFixed(1) ?? ''}>
      <option value="">Chưa đặt</option>
      {bands.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}

function DailySessions({ saved }: { saved: number }) {
  const [selected, setSelected] = useState(sessionOptions.includes(saved) ? String(saved) : 'custom');
  return <div className="learner-study-daily">
    <label>Số phiên học mỗi ngày
      <select name={selected === 'custom' ? undefined : 'dailySessions'} className="learner-study-control" value={selected}
        onChange={event => setSelected(event.target.value)}>
        {sessionOptions.map(value => <option key={value} value={value}>{value}</option>)}
        <option value="custom">Số phiên khác</option>
      </select>
    </label>
    {selected === 'custom' && <label>Nhập số phiên
      <input type="number" name="dailySessions" min={1} max={2147483647} step={1} required
        className="learner-study-control" defaultValue={saved > sessionOptions.length ? saved : undefined} />
    </label>}
  </div>;
}

export default function StudyGoals() {
  const [history, setHistory] = useState<StudyGoal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const [reset, setReset] = useState(0);
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
    const readBand = (key: string) => {
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

  function cancel() {
    setError('');
    setMessage('');
    setReset(value => value + 1);
  }

  return <>
    <section className="learner-study-panel learner-goals" aria-labelledby="learner-goals-title">
      <h2 id="learner-goals-title">Mục tiêu học tập</h2>
      <p className="learner-study-muted">Band từ 0 đến 9, theo bước 0,5. Mục tiêu tổng được nhập riêng.</p>
      {!loaded && !error && <p role="status">Đang tải mục tiêu…</p>}
      {loaded && <form key={`${current?.id ?? 'new'}:${reset}`} onSubmit={save}>
        <fieldset disabled={busy}>
          <div className="learner-goal-primary">
            <BandField name="overall" label="Band mục tiêu tổng" value={current?.overall} />
            <DailySessions saved={current?.dailySessions ?? 1} />
          </div>
          <h3>Band mục tiêu theo kỹ năng (tùy chọn)</h3>
          <div className="learner-goal-skills">
            {skills.map(([name, label]) => <BandField key={name} name={name} label={label} value={current?.[name]} />)}
          </div>
          <p className="learner-study-muted learner-goal-hint">Một phiên học là một lượt làm bài đã hoàn thành hoặc một phiên Flashcard đủ điều kiện.</p>
          <div className="learner-study-actions">
            <button type="button" className="learner-study-button learner-study-cancel" onClick={cancel}>Hủy</button>
            <button type="submit" className="learner-study-button learner-study-primary">{busy ? 'Đang lưu…' : 'Lưu mục tiêu'}</button>
          </div>
        </fieldset>
      </form>}
      {message && <p role="status" className="learner-goal-success">{message}</p>}
      {error && <div role="alert" className="learner-goal-error">{error}{' '}
        {!loaded && <button type="button" className="learner-study-button" onClick={() => setRetry(value => value + 1)}>Thử lại</button>}
      </div>}
    </section>
    {current && <details className="learner-study-panel learner-goal-history">
      <summary><span>Lịch sử đã lưu</span><span className="learner-goal-count">{history.length} lần lưu</span></summary>
      <ol>
        {history.map((goal, index) => {
          const savedAt = new Date(goal.effectiveFrom);
          return <li key={goal.id} className="learner-goal-record">
            <header><time dateTime={goal.effectiveFrom}>{date.format(savedAt)} · {time.format(savedAt)}</time>
              {index === 0 && <span className="learner-study-badge">Đang áp dụng</span>}
            </header>
            <dl>
              <div><dt>Band tổng</dt><dd>{goal.overall?.toFixed(1) ?? '—'}</dd></div>
              <div><dt>Phiên/ngày</dt><dd>{goal.dailySessions}</dd></div>
              {skills.map(([key, name]) => <div key={key}><dt>{name}</dt><dd>{goal[key]?.toFixed(1) ?? '—'}</dd></div>)}
            </dl>
          </li>;
        })}
      </ol>
    </details>}
  </>;
}
