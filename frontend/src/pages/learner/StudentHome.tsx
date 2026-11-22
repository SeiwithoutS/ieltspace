import { useEffect, useState } from 'react';
import { useAccount } from '../../lib/auth/account';
import { getStudyDashboard, skillNames, type DashboardRange, type LearnerDashboard, type LearnerSkill } from '../../lib/learner/study-overview';
import LearnerHeader from '../../components/navigation/LearnerHeader';
import PageLink from '../../components/navigation/PageLink';
import ActivityCalendar from './ActivityCalendar';
import '../../components/learner/learner-study.css';
import './learner-dashboard.css';

const numbers = new Intl.NumberFormat('vi-VN');
const percent = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 0 });
const skills = Object.keys(skillNames) as LearnerSkill[];
const metricPaths = [
  'M8 3h8l4 4v14H4V3h4zM8 11h8M8 15h6',
  'M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM7 3h10M7 12h10M7 15h5',
  'M3 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3V5zM21 5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6V5z',
  'M4 5h16v15H4zM8 3v4m8-4v4M4 9h16m-15 6 2 2 4-4',
];
const displayDate = (date: string) => date.slice(8) + '/' + date.slice(5, 7);
const series = [
  { key: 'practice', label: 'Bài hoàn thành' },
  { key: 'flashcards', label: 'Phiên Flashcard' },
] as const;

export default function StudentHome() {
  const { id } = useAccount();
  const [days, setDays] = useState<DashboardRange>(7);
  return <div className="learner-study-page learner-dashboard">
    <LearnerHeader active="home" />
    <main className="learner-study-main">
      <header className="learner-study-header dashboard-header">
        <div>
          <h1>Dashboard của bạn</h1>
          <p>Theo dõi tiến độ luyện đề và ôn từ vựng theo thời gian.</p>
        </div>
        <PageLink className="learner-study-button" page="PracticeHistory">Lịch sử luyện tập <span aria-hidden="true">→</span></PageLink>
      </header>
      <div className="learner-study-period">
        <h2>Tiến độ học tập</h2>
        <div className="learner-study-segments" role="group" aria-label="Khoảng thời gian">
          {([7, 30] as const).map(range => <button key={range} type="button" aria-pressed={range === days}
            onClick={() => setDays(range)}>{range} ngày</button>)}
        </div>
      </div>
      <DashboardContent key={`${id}:${days}`} days={days} />
      <ActivityCalendar key={id} />
    </main>
  </div>;
}

function DashboardContent({ days }: { days: DashboardRange }) {
  const [data, setData] = useState<LearnerDashboard | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    void getStudyDashboard(days).then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [days, retry]);

  if (error) return <div className="learner-study-panel learner-study-state" role="alert">
    <p>Chưa tải được tiến độ học tập.</p>
    <button type="button" className="learner-study-button" onClick={() => { setError(false); setRetry(value => value + 1); }}>Thử lại</button>
  </div>;
  if (!data) return <p className="learner-study-panel learner-study-state" role="status">Đang tải tiến độ học tập…</p>;

  const activeDays = data.days.filter(day => day.practice || day.flashcards).length;
  const stats = [
    ['Bài đã hoàn thành', data.practice],
    ['Phiên Flashcard', data.flashcards],
    ['Từ vựng đã ôn', data.reviewedWords],
    ['Ngày có hoạt động', activeDays],
  ] as const;
  const greatestSkill = Math.max(1, ...skills.map(skill => data.skills[skill] ?? 0));

  return <>
    <dl className="learner-study-metrics">
      {stats.map(([label, value], index) => <div key={label} className="learner-study-panel learner-study-metric">
        <span className="learner-study-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={metricPaths[index]} /></svg></span>
        <dt>{label}</dt>
        <dd>{numbers.format(value)}</dd>
      </div>)}
    </dl>
    <div className="learner-study-charts">
      <ActivityChart data={data} />
      <section className="learner-study-panel dashboard-skills" aria-labelledby="skill-chart-title">
        <h2 id="skill-chart-title">Luyện tập theo kỹ năng</h2>
        <p className="learner-study-muted">Số lượt hoàn thành trong từng kỹ năng.</p>
        <ul className="learner-study-skill-chart">
          {skills.map(skill => {
            const count = data.skills[skill] ?? 0;
            return <li key={skill} data-skill={skill}>
              <div><span>{skillNames[skill]}</span><strong>{numbers.format(count)}</strong></div>
              <div className="learner-study-skill-track" aria-hidden="true"><span style={{ width: `${count / greatestSkill * 100}%` }} /></div>
            </li>;
          })}
        </ul>
        <PageLink className="learner-study-link" page="PracticeHub">Chọn bài luyện <span aria-hidden="true">→</span></PageLink>
      </section>
    </div>
    <ActivityMix data={data} />
  </>;
}

function ActivityChart({ data }: { data: LearnerDashboard }) {
  const [selected, setSelected] = useState(data.days.length - 1);
  const last = data.days.length - 1;
  const day = data.days[selected];
  const start = data.days[0].date;
  const end = data.days[last].date;
  const step = Math.max(1, Math.ceil(Math.max(...data.days.map(({ practice, flashcards }) => Math.max(practice, flashcards))) / 4));
  const top = step * 4;
  const x = (index: number) => index * 100 / last;
  const y = (value: number) => 100 - value / top * 100;
  const labelIndices = [...new Set([0, Math.round(last / 3), Math.round(last * 2 / 3), last])];

  return <section className="learner-study-panel dashboard-activity" aria-labelledby="activity-chart-title">
    <h2 id="activity-chart-title">Hoạt động theo ngày</h2>
    <p className="learner-study-muted"><time dateTime={start}>{displayDate(start)}</time> – <time dateTime={end}>{displayDate(end)}</time> · Giờ Việt Nam</p>
    {data.practice > 0 || data.flashcards > 0 ? <>
      <div className="learner-study-legend">
        {series.map(({ key, label }) => <span key={key}><i data-series={key} aria-hidden="true" />{label}</span>)}
      </div>
      <div className="dashboard-chart" aria-hidden="true">
        <div className="dashboard-chart-scale">{[4, 3, 2, 1, 0].map(value => <span key={value}>{numbers.format(value * step)}</span>)}</div>
        <div className="dashboard-chart-plot">
          <svg className="dashboard-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {series.map(({ key }) => {
              const points = data.days.map((entry, index) => `${x(index)},${y(entry[key])}`).join(' ');
              return <g key={key} data-series={key}>
                <polygon points={`0,100 ${points} 100,100`} />
                <polyline points={points} vectorEffect="non-scaling-stroke" />
              </g>;
            })}
          </svg>
          <div className="dashboard-chart-guide" style={{ left: `${x(selected)}%` }}>
            {series.map(({ key }) => <span key={key} data-series={key} style={{ top: `${y(day[key])}%` }} />)}
          </div>
          {labelIndices.map(index => <span key={index} className="dashboard-chart-label" style={{ left: `${x(index)}%` }}>
            {displayDate(data.days[index].date)}
          </span>)}
        </div>
      </div>
      <div className="dashboard-selected-day">
        <label>Ngày <select aria-label="Ngày xem số liệu" className="learner-study-control" value={selected}
          onChange={event => setSelected(Number(event.currentTarget.value))}>
          {data.days.map(({ date }, index) => <option key={date} value={index}>{displayDate(date)}</option>)}
        </select></label>
        <div aria-live="polite">{series.map(({ key, label }) => <span key={key} data-series={key}>
          {label} <strong>{numbers.format(day[key])}</strong>
        </span>)}</div>
      </div>
      <details className="learner-study-chart-details">
        <summary>Xem số liệu theo ngày</summary>
        <table>
          <thead><tr><th scope="col">Ngày</th><th scope="col">Bài hoàn thành</th><th scope="col">Phiên Flashcard</th></tr></thead>
          <tbody>{data.days.map(entry => <tr key={entry.date}><th scope="row"><time dateTime={entry.date}>{displayDate(entry.date)}</time></th>
            <td>{numbers.format(entry.practice)}</td><td>{numbers.format(entry.flashcards)}</td></tr>)}</tbody>
        </table>
      </details>
    </> : <p className="learner-study-empty">Chưa có hoạt động trong khoảng thời gian này.</p>}
  </section>;
}

function ActivityMix({ data }: { data: LearnerDashboard }) {
  const total = data.practice + data.flashcards;
  const practiceShare = total ? data.practice / total : 0;
  const roundedPractice = Math.round(practiceShare * 100);
  const shares = { practice: roundedPractice / 100, flashcards: (100 - roundedPractice) / 100 };
  return <section className="learner-study-panel dashboard-mix" aria-labelledby="activity-mix-title">
    <div className="dashboard-ring" aria-hidden="true" style={{
      background: total ? `conic-gradient(var(--study-blue) ${practiceShare * 100}%, var(--study-green) 0)` : undefined,
    }}><span><strong>{numbers.format(total)}</strong>Lượt</span></div>
    <div>
      <h2 id="activity-mix-title">Cơ cấu hoạt động</h2>
      <p className="learner-study-muted">Tỷ trọng giữa luyện đề và ôn Flashcard.</p>
      <dl>{series.map(({ key, label }) => <div key={key} data-series={key}>
        <dt>{label}</dt><dd>{numbers.format(data[key])} <span>· {total ? percent.format(shares[key]) : '—'}</span></dd>
      </div>)}</dl>
    </div>
    <PageLink className="learner-study-button" page="Vocab">Mở bộ từ vựng <span aria-hidden="true">→</span></PageLink>
  </section>;
}
