import { useRef, type KeyboardEvent } from 'react';
import { useAccount } from '../../lib/auth/account';
import { navigate } from '../../lib/auth/auth';
import type { ResultGroup } from '../../lib/learner/study-overview';
import StudyResults from '../../components/learner/StudyResults';
import LearnerHeader from '../../components/navigation/LearnerHeader';
import PageLink from '../../components/navigation/PageLink';
import MyWS from '../results/MyWS';
import { listeningReadingExamples } from '../../data/practice-history.sample';
import '../../components/learner/learner-study.css';

const tabs = [
  { group: 'LR', name: 'Listening & Reading' },
  { group: 'WS', name: 'Writing & Speaking' },
] as const;

const canPreviewHistory = import.meta.env.DEV || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

function historyQuery(group: ResultGroup, sample: boolean) {
  const params = new URLSearchParams();
  if (group === 'WS') params.set('tab', 'ws');
  if (sample) params.set('demo', '1');
  return params.toString();
}

export default function PracticeHistory({ historyGroup = 'LR', previewHistory = false }: { historyGroup?: ResultGroup; previewHistory?: boolean }) {
  const { id } = useAccount();
  const sample = canPreviewHistory && previewHistory;
  const tabRefs = useRef<Record<ResultGroup, HTMLButtonElement | null>>({ LR: null, WS: null });

  function selectTab(group: ResultGroup) {
    if (group === historyGroup) return;
    const query = historyQuery(group, sample);
    navigate(query ? `PracticeHistory?${query}` : 'PracticeHistory');
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    let next: ResultGroup;
    if (event.key === 'Home') next = 'LR';
    else if (event.key === 'End') next = 'WS';
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = historyGroup === 'LR' ? 'WS' : 'LR';
    else return;
    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  }

  return <div className="learner-study-page">
    <LearnerHeader active="home" />
    <main className="learner-study-main">
      <header className="learner-study-header">
        <div>
          <h1>Lịch sử luyện tập</h1>
          <p>Xem các bài đã hoàn thành và kết quả đã công bố.</p>
        </div>
        <PageLink className="learner-study-button" page="StudentHome">Dashboard <span aria-hidden="true">→</span></PageLink>
      </header>
      <div className="learner-study-history-toolbar">
        <div className="learner-study-segments learner-study-history-tabs" role="tablist" aria-label="Nhóm kỹ năng">
          {tabs.map(({ group, name }) => <button key={group} type="button" role="tab" ref={node => { tabRefs.current[group] = node; }}
            id={`history-tab-${group}`} aria-controls={`history-panel-${group}`} aria-selected={group === historyGroup}
            tabIndex={group === historyGroup ? 0 : -1} onKeyDown={onTabKey} onClick={() => selectTab(group)}>{name}</button>)}
        </div>
        {canPreviewHistory && <PageLink page="PracticeHistory" query={historyQuery(historyGroup, !sample)} className="learner-study-link">
          {sample ? 'Về dữ liệu của tôi' : 'Xem dữ liệu mẫu'}
        </PageLink>}
      </div>
      {sample && <p className="learner-study-empty" role="status">Bạn đang xem dữ liệu mẫu.</p>}
      {tabs.map(({ group }) => <div key={group} role="tabpanel" id={`history-panel-${group}`} aria-labelledby={`history-tab-${group}`}
        tabIndex={group === historyGroup ? 0 : -1} hidden={group !== historyGroup}>
        {group === historyGroup && (group === 'WS'
          ? <MyWS key={`${id}:${sample}`} sample={sample} />
          : <StudyResults key={`${id}:${sample}`} sample={sample ? listeningReadingExamples : undefined} />)}
      </div>)}
    </main>
  </div>;
}
