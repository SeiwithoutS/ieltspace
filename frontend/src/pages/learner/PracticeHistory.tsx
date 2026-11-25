import { useRef, type KeyboardEvent } from 'react';
import { useAccount } from '../../lib/auth/account';
import { navigate } from '../../lib/auth/auth';
import type { ResultGroup } from '../../lib/learner/study-overview';
import StudyResults from '../../components/learner/StudyResults';
import LearnerHeader from '../../components/navigation/LearnerHeader';
import PageLink from '../../components/navigation/PageLink';
import MyWS from '../results/MyWS';
import '../../components/learner/learner-study.css';

const tabs = [
  { group: 'LR', name: 'Listening & Reading' },
  { group: 'WS', name: 'Writing & Speaking' },
] as const;

export default function PracticeHistory({ historyGroup = 'LR' }: { historyGroup?: ResultGroup }) {
  const { id } = useAccount();
  const tabRefs = useRef<Record<ResultGroup, HTMLButtonElement | null>>({ LR: null, WS: null });

  function selectTab(group: ResultGroup) {
    if (group === historyGroup) return;
    navigate(group === 'WS' ? 'PracticeHistory?tab=ws' : 'PracticeHistory');
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
      </div>
      {tabs.map(({ group }) => <div key={group} role="tabpanel" id={`history-panel-${group}`} aria-labelledby={`history-tab-${group}`}
        tabIndex={group === historyGroup ? 0 : -1} hidden={group !== historyGroup}>
        {group === historyGroup && (group === 'WS'
          ? <MyWS key={id} />
          : <StudyResults key={id} />)}
      </div>)}
    </main>
  </div>;
}
