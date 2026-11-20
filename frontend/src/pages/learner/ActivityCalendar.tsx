import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { getStudyActivityCalendar, type LearnerActivityCalendar } from '../../lib/learner/study-overview';
import './activity-calendar.css';

const dayMs = 86_400_000;
const weekLabels = ['T2', '', 'T4', '', 'T6', '', ''];
const legend = ['0', '1', '2–3', '4–5', '6+'];
const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeZone: 'UTC' });
const numbers = new Intl.NumberFormat('vi-VN');
const dayOffsets: Partial<Record<string, number>> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };

function activityLevel(total: number) {
  if (total >= 6) return 4;
  if (total >= 4) return 3;
  if (total >= 2) return 2;
  return total;
}

export default function ActivityCalendar() {
  const [year, setYear] = useState<number>();
  const [years, setYears] = useState<number[]>([]);
  const [data, setData] = useState<LearnerActivityCalendar>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void getStudyActivityCalendar(year).then(calendar => {
      if (!active) return;
      setData(calendar);
      setYears(calendar.years);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [year, retry]);

  return <section className="learner-study-panel learner-activity-calendar" aria-labelledby="activity-calendar-title">
    <header className="learner-study-results-header">
      <div>
        <h2 id="activity-calendar-title">Lịch hoạt động học tập</h2>
        <p className="learner-study-muted">Bài thi, bài luyện hoàn thành và phiên Flashcard đủ điều kiện, theo giờ Việt Nam.</p>
      </div>
      {years.length > 0 && <select aria-label="Khoảng thời gian của lịch học tập" className="learner-study-control activity-calendar-year"
        value={year ?? ''} onChange={event => {
          setData(undefined);
          setError(false);
          setYear(event.currentTarget.value ? Number(event.currentTarget.value) : undefined);
        }}>
        <option value="">365 ngày gần đây</option>
        {years.map(value => <option key={value} value={value}>{value}</option>)}
      </select>}
    </header>
    {error ? <div className="learner-study-empty" role="alert">Chưa tải được lịch hoạt động.{' '}
      <button type="button" className="learner-study-button" onClick={() => { setError(false); setRetry(value => value + 1); }}>Thử lại</button>
    </div> : data ? <CalendarGrid key={`${data.startDate}:${data.endDate}`} data={data} />
      : <p className="learner-study-empty" role="status">Đang tải lịch hoạt động…</p>}
  </section>;
}

function CalendarGrid({ data }: { data: LearnerActivityCalendar }) {
  const [selected, setSelected] = useState(data.endDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const start = Date.parse(`${data.startDate}T00:00:00Z`);
  const end = Date.parse(`${data.endDate}T00:00:00Z`);
  const length = (end - start) / dayMs + 1;
  const leading = (new Date(start).getUTCDay() + 6) % 7;
  const weeks = Math.ceil((length + leading) / 7);
  const counts = new Map(data.days.map(day => [day.date, day]));
  const rows = Array.from({ length: 7 }, (_, weekday) =>
    Array.from({ length: weeks }, (_, week) => {
      const index = week * 7 + weekday - leading;
      return index < 0 || index >= length ? null : new Date(start + index * dayMs);
    }));
  const monthLabels = Array.from({ length: weeks }, (_, week) => {
    const dates = rows.map(row => row[week]);
    return dates.find(date => date?.getUTCDate() === 1) ?? (week === 0 ? dates.find(Boolean) : null);
  });
  if (monthLabels[1]) monthLabels[0] = null;
  const point = counts.get(selected);
  const total = data.days.reduce((sum, day) => sum + day.practice + day.flashcards, 0);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollLeft = scroll.scrollWidth;
  }, []);

  function setCalendarDate(date: string, focus: boolean) {
    if (!date) return;
    setSelected(date);
    const button = scrollRef.current?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`);
    if (focus) button?.focus({ preventScroll: true });
    const scroll = scrollRef.current;
    if (!button || !scroll) return;
    const cell = button.getBoundingClientRect();
    const view = scroll.getBoundingClientRect();
    if (cell.left < view.left) scroll.scrollLeft -= view.left - cell.left + 6;
    if (cell.right > view.right) scroll.scrollLeft += cell.right - view.right + 6;
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const offset = dayOffsets[event.key];
    let target: number;
    if (event.key === 'Home') target = start;
    else if (event.key === 'End') target = end;
    else if (offset !== undefined) target = Math.min(end, Math.max(start, date.getTime() + offset * dayMs));
    else return;
    event.preventDefault();
    setCalendarDate(new Date(target).toISOString().slice(0, 10), true);
  }

  return <>
    <p className="activity-calendar-total"><strong>{numbers.format(total)} lượt hoạt động</strong>
      <span> · {numbers.format(data.days.length)} ngày có hoạt động</span></p>
    <div className="activity-calendar-scroll" ref={scrollRef}>
      <div className="activity-calendar-grid" role="grid" aria-label="Hoạt động theo tuần và ngày">
        <div className="activity-calendar-row activity-calendar-months" aria-hidden="true">
          <span />
          {monthLabels.map((date, week) => <span key={week}>{date && `T${date.getUTCMonth() + 1}`}</span>)}
        </div>
        {rows.map((row, weekday) => <div className="activity-calendar-row" role="row" key={weekday}>
          <span role="rowheader">{weekLabels[weekday]}</span>
          {row.map((date, week) => {
            if (!date) return <span key={week} role="gridcell" aria-hidden="true" />;
            const iso = date.toISOString().slice(0, 10);
            const day = counts.get(iso);
            const attempts = day?.practice ?? 0;
            const flashcards = day?.flashcards ?? 0;
            const label = `${dateFormat.format(date)} · ${attempts + flashcards} lượt`;
            return <span role="gridcell" key={week}>
              <button type="button" className="activity-calendar-day" data-date={iso} data-level={activityLevel(attempts + flashcards)}
                aria-label={label} title={label} aria-pressed={iso === selected} tabIndex={iso === selected ? 0 : -1}
                onClick={() => setCalendarDate(iso, false)} onKeyDown={event => moveFocus(event, date)} />
            </span>;
          })}
        </div>)}
      </div>
    </div>
    <footer className="activity-calendar-footer">
      <div className="activity-calendar-selection">
        <label>Ngày <input type="date" aria-label="Ngày xem hoạt động" className="learner-study-control"
          value={selected} min={data.startDate} max={data.endDate}
          onChange={event => {
            const date = event.currentTarget.value;
            if (date >= data.startDate && date <= data.endDate) setCalendarDate(date, false);
          }} /></label>
        <span aria-live="polite"><strong>{point?.practice ?? 0}</strong> bài hoàn thành · <strong>{point?.flashcards ?? 0}</strong> phiên Flashcard</span>
      </div>
      <ul className="activity-calendar-legend" aria-label="Số lượt hoạt động mỗi ngày">
        {legend.map((text, level) => <li key={text}><span data-level={level} aria-hidden="true" />{text}</li>)}
      </ul>
    </footer>
  </>;
}
