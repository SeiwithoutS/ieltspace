import { useState } from 'react';
import PageLink from '../navigation/PageLink';
import { useLearningProgress } from '../../lib/learner/study-overview';

export const studyPanel = 'min-w-0 rounded-[22px] border border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#fff)] p-4 sm:p-6 shadow-sm';
export const learnerMuted = 'text-[var(--attempt-text-706473,#706473)]';
const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', timeZone: 'UTC' });

function Flame({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.2-5.1-3.4-8.4-.8 1.7-1.7 2.7-2.8 3.4C11.5 7.3 10.4 5.1 9 3c0 5-3 7.4-3 12a6 6 0 0 0 6 6Z" />
  </svg>;
}

export default function StudyProgress({ userId }: { userId: string }) {
  const { data, error, retry, checkIn } = useLearningProgress(userId);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const target = data?.goal?.dailySessions ?? null;
  const remaining = data && target !== null ? Math.max(0, target - data.todaySessions) : null;
  const advance = data && target !== null ? Math.min(data.todaySessions, target) : 0;

  async function handleCheckIn() {
    if (checkingIn || data?.checkedInToday) return;
    setCheckingIn(true);
    setCheckInError('');
    try { await checkIn(); }
    catch (cause) { setCheckInError(cause instanceof Error ? cause.message : 'Chưa điểm danh được. Vui lòng thử lại.'); }
    finally { setCheckingIn(false); }
  }

  return <section aria-label="Mục tiêu hôm nay" className={`${studyPanel} flex flex-1 flex-col gap-3.5`}>
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="m-0 text-lg font-bold">Mục tiêu hôm nay</h2>
      <PageLink page="Profile" className="text-sm font-semibold">{data?.goal ? 'Sửa mục tiêu' : 'Đặt mục tiêu'}</PageLink>
    </div>
    {error && <p role="alert" className="m-0">{error} <button type="button" onClick={retry}>Thử lại</button></p>}
    {!data && !error && <p role="status" className="m-0">Đang tải tiến độ…</p>}
    {data && <>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full p-[8px] sm:h-[104px] sm:w-[104px]"
          style={{ background: `conic-gradient(#2963cc ${target ? advance / target * 100 : 0}%, var(--attempt-line-d6d4d0,#e8dfd0) 0)` }}>
          <div className="grid h-full w-full place-content-center rounded-full bg-[var(--attempt-bg-ffffff,#fff)] text-center">
            <strong className="text-xl leading-none tabular-nums">{data.todaySessions}{target !== null ? `/${target}` : ''}</strong>
            <span className={`mt-1 text-xs ${learnerMuted}`}>phiên</span>
          </div>
        </div>
        <div className="min-w-0">
          {target !== null && <progress className="sr-only" aria-label="Tiến độ phiên luyện tập hôm nay" value={advance} max={target} />}
          <strong className="text-sm">{remaining === null ? 'Chưa đặt số phiên mỗi ngày'
            : remaining === 0 ? 'Đã đạt mục tiêu hôm nay' : `Còn ${remaining} phiên luyện tập`}</strong>
          <p className={`mb-0 mt-1 text-sm ${learnerMuted}`}>Band mục tiêu tổng: {data.goal?.overall?.toFixed(1) ?? 'Chưa đặt'}</p>
          {data.goal && <div className={`text-xs ${learnerMuted}`}>
            {([['Listening', data.goal.listening], ['Reading', data.goal.reading], ['Writing', data.goal.writing], ['Speaking', data.goal.speaking]] as const)
              .filter(([, band]) => band !== null).map(([skill, band]) => `${skill} ${band?.toFixed(1)}`).join(' · ')}
          </div>}
        </div>
      </div>
      <div className="grid gap-2 border-0 border-t border-solid border-[var(--attempt-line-d6d4d0,#D6D4D0)] pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2">
            <strong className="inline-flex items-center gap-1 text-sm"><Flame className="h-4 w-4" />{data.currentStreak ? `Chuỗi đăng nhập ${data.currentStreak} ngày` : 'Chuỗi đăng nhập'}</strong>
            <span className={`text-xs ${learnerMuted}`}>Kỷ lục: {data.longestStreak} ngày</span>
          </div>
          <button type="button" className="min-h-8 rounded-full border border-solid border-[#2963cc] bg-transparent px-2.5 text-xs font-semibold text-[var(--attempt-text-2963cc,#2963cc)] disabled:opacity-60"
            disabled={data.checkedInToday || checkingIn} onClick={() => void handleCheckIn()}>
            {checkingIn ? 'Đang điểm danh…' : data.checkedInToday ? 'Đã điểm danh' : 'Điểm danh'}
          </button>
        </div>
        {checkInError && <p role="alert" className="m-0 text-sm">{checkInError}</p>}
        <ul aria-label="Điểm danh đăng nhập tuần này" className="m-0 grid list-none grid-cols-7 gap-1 p-0 text-center text-xs">
          {data.checkInDays.map(day => {
            const date = new Date(`${day.date}T00:00:00Z`);
            const label = `${shortDay.format(date)}: ${day.checkedIn ? 'Đã điểm danh' : day.date > data.today ? 'Chưa đến ngày' : 'Chưa điểm danh'}`;
            return <li key={day.date} aria-label={label} title={label} aria-current={day.date === data.today ? 'date' : undefined} className="grid justify-items-center gap-1">
              <span className={`grid h-6 w-6 place-items-center rounded-full border ${day.checkedIn
                ? 'border-solid border-[#2963cc] bg-[#2963cc] text-white'
                : 'border-dashed border-[var(--attempt-line-d6d4d0,#D6D4D0)]'}`}>
                {day.checkedIn && <Flame className="h-3.5 w-3.5" />}
              </span>
              <time dateTime={day.date}>{weekday.format(date)}</time>
            </li>;
          })}
        </ul>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <span>{data.flashcards.sessions} phiên Flashcard · {data.flashcards.reviewedWords} từ đã ôn · {data.flashcards.forgottenWords} từ chưa nhớ</span>
        <PageLink page="Flashcard">Ôn Flashcard</PageLink>
      </div>
    </>}
  </section>;
}
