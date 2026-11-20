import { useState } from 'react';
import PageLink from '../../components/navigation/PageLink';
import Popup from '../../components/attempts/Popup';
import { gradingCreditExamples, writingSpeakingExamples, type WritingSpeakingAction, type WritingSpeakingExample } from '../../data/practice-history.sample';
import { skillNames, useStudyResults } from '../../lib/learner/study-overview';
import './my-ws.css';

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
});
const retentionRules = [
  ['Bài chưa gửi chấm', '14 ngày từ lúc hoàn thành'],
  ['Đang chờ phân công hoặc chờ chấm', 'Tạm giữ, không xóa'],
  ['Yêu cầu bị hủy', 'Quay về hạn ban đầu'],
  ['Đã có kết quả', '14 ngày từ lúc công bố'],
] as const;

type HistoryRow = Omit<WritingSpeakingExample, 'skill'> & { skill: keyof typeof skillNames };

const actionIcons: Partial<Record<WritingSpeakingAction, string>> = {
  'Tải .docx': 'M12 4v12M7 11l5 5 5-5M4 20h16',
  'Tải ghi âm': 'M12 4v12M7 11l5 5 5-5M4 20h16',
  'Nghe lại': 'M8 5l11 7-11 7z',
};

export default function MyWS({ sample }: { sample: boolean }) {
  const result = useStudyResults({ kind: 'all', group: 'WS', limit: 15 }, sample);
  const [previewAction, setPreviewAction] = useState<{ label: string; title: string }>();
  const rows: readonly HistoryRow[] = sample ? writingSpeakingExamples : result.items.map(item => ({
    ...item,
    outcome: item.band === null ? 'saved' : 'published',
    status: item.band === null ? 'Chưa có điểm' : `Đã có kết quả · ${item.band.toFixed(1)}`,
    retention: '—',
  }));

  return <div className="ws-history">
    <header className="learner-study-results-header ws-history-header">
      <div>
        <h2>Bài Writing và Speaking của tôi</h2>
        <p className="learner-study-muted">Bài đã hoàn thành, trạng thái yêu cầu chấm và thời hạn nội dung.</p>
      </div>
      <PageLink page="PracticeWS" className="learner-study-button">Luyện Writing, Speaking</PageLink>
    </header>

    <div className="ws-history-info">
      <section className="learner-study-panel">
        <h2>Lượt hỗ trợ chấm còn hiệu lực</h2>
        <dl className="ws-credits">
          {(['free', 'bonus'] as const).map(type => {
            const credit = sample ? gradingCreditExamples[type] : null;
            return <div key={type} data-credit={type}>
              <dt>{type === 'free' ? 'Lượt miễn phí' : 'Lượt bonus'}</dt>
              <dd>{credit?.count ?? '—'}</dd>
              <small>{credit?.expires ?? 'Chưa có dữ liệu'}</small>
            </div>;
          })}
        </dl>
        <p className="learner-study-muted">Mỗi tuần (từ 00:00 thứ Hai, giờ Việt Nam) bạn có 1 lượt miễn phí dùng chung Writing và Speaking, không cộng dồn. Bonus được hoàn khi yêu cầu bị hủy vì quá 72 giờ chưa có giáo viên hoặc giáo viên không thể hoàn thành.</p>
      </section>

      <section className="learner-study-panel">
        <h2>Thời hạn lưu nội dung</h2>
        <dl className="ws-retention">
          {retentionRules.map(([status, duration]) => <div key={status}><dt>{status}</dt><dd>{duration}</dd></div>)}
        </dl>
        <p className="learner-study-muted">Hết hạn thì bài viết, bản ghi âm bị xóa; điểm và nhận xét vẫn được giữ. Xem hay tải bài không gia hạn.</p>
      </section>
    </div>

    <section className="learner-study-panel ws-history-table" aria-labelledby="ws-history-table-title">
      <header className="learner-study-results-header">
        <h2 id="ws-history-table-title">{sample ? `${rows.length} bài trong 30 ngày` : 'Bài đã hoàn thành'}</h2>
        {sample && <span className="ws-unread-label"><span className="ws-unread" aria-hidden="true" /> Mới có kết quả hoặc vừa bị hủy</span>}
      </header>
      {rows.length > 0 && <>
        <p className="ws-scroll-hint">Vuốt ngang để xem đầy đủ bảng.</p>
        <div className="ws-table-scroll" tabIndex={0} role="region" aria-label="Bảng lịch sử Writing và Speaking">
          <table>
            <thead><tr>
              <th scope="col">Bài</th><th scope="col">Kỹ năng</th><th scope="col">Trạng thái</th><th scope="col">Nội dung bài</th>
              {sample && <th scope="col" aria-label="Thao tác" />}
            </tr></thead>
            <tbody>{rows.map(row => <tr key={row.id}>
              <th scope="row"><strong>{row.title}</strong><time dateTime={row.completedAt}>Hoàn thành {dateTime.format(new Date(row.completedAt))}</time></th>
              <td><span className="ws-chip" data-skill={row.skill}>{skillNames[row.skill]}</span></td>
              <td><span className="ws-chip" data-outcome={row.outcome}>{row.status}</span>
                {row.unread && <span className="ws-unread" role="img" aria-label="Chưa xem" />}</td>
              <td>{row.retention}</td>
              {sample && <td><div className="ws-row-actions">{row.actions?.map(label =>
                <button key={label} type="button" className={label.startsWith('Gửi') ? 'learner-study-button learner-study-primary' : 'learner-study-button'}
                  onClick={() => setPreviewAction({ label, title: row.title })}>
                  {actionIcons[label] && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={actionIcons[label]} /></svg>}
                  {label}
                </button>)}
                {row.outcome === 'expired' && <span className="learner-study-muted">Không mở hoặc tải được</span>}
              </div></td>}
            </tr>)}</tbody>
          </table>
        </div>
      </>}
      {result.loading && <p className="learner-study-empty ws-table-state" role="status">Đang tải kết quả…</p>}
      {result.error && <div className="learner-study-empty ws-table-state" role="alert">{result.error}{' '}
        <button type="button" className="learner-study-button" onClick={result.retry}>Thử lại</button>
      </div>}
      {!rows.length && !result.loading && !result.error && <p className="learner-study-empty ws-table-state">Chưa có bài Writing hoặc Speaking đã lưu.</p>}
      {result.next && !result.error && <button type="button" className="learner-study-button ws-table-more"
        onClick={result.loadMore} disabled={result.loading}>Xem thêm</button>}
    </section>

    {previewAction && <Popup title={previewAction.label} onCancel={() => setPreviewAction(undefined)}>
      <section className="attempt-card flex flex-col gap-4">
        <h2>{previewAction.label}</h2>
        <p>{previewAction.title}</p>
        <p>Đây là thao tác minh họa trong chế độ xem dữ liệu mẫu.</p>
        <button className="primary" type="button" onClick={() => setPreviewAction(undefined)}>Đã hiểu</button>
      </section>
    </Popup>}
  </div>;
}
