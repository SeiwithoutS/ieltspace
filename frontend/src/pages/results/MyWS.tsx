import { useMemo, useState, useSyncExternalStore } from 'react';
import { navigate } from '../../lib/auth/auth';
import PageLink from '../../components/navigation/PageLink';
import AttemptRecordingsPopup from '../../components/attempts/AttemptRecordingsPopup';
import WritingTextPopup from '../../components/attempts/WritingTextPopup';
import { ConfirmDialog, Icon, MenuButton } from '../../components/shared/ui';
import { downloadRecordingsZip, RecordingDownloadError } from '../../lib/attempts/recording-download';
import { downloadWritingDocx, writingContentError } from '../../lib/attempts/writing-download';
import { errorStatus, requestGrading } from '../../lib/attempts/skill-attempts-api';
import { cancellationText, formatGradingDate, gradingStatusName, useGradingBalance } from '../../lib/grading/grading';
import { learnerResultPath } from '../../lib/grading/review';
import { skillNames, useStudyResults, type LearnerSkill, type StudyResult } from '../../lib/learner/study-overview';
import { describeWsRow, wsSectionsLabel, type WsAction, type WsRowView } from '../../lib/learner/ws-history';
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

type HistoryRow = { id: string; title: string; completedAt: string; skill: LearnerSkill; sections?: number[] | null;
  view: WsRowView; grading?: StudyResult['grading'] };
type Notice = { tone: 'info' | 'ok' | 'error'; text: string };

const menuIcons = { listen: 'play', 'download-audio': 'download', 'view-text': 'eye', 'download-docx': 'download' } as const;

const skillLetters = { LISTENING: 'L', READING: 'R', WRITING: 'W', SPEAKING: 'S' } as const;
const compactQuery = '(max-width: 767px)';

/** Dưới 768px (DESIGN.md mục 11) hiển thị danh sách thẻ thay cho bảng; chỉ render một dạng tại một thời điểm. */
function useCompact(): boolean {
  return useSyncExternalStore(
    notify => {
      const media = window.matchMedia(compactQuery);
      media.addEventListener('change', notify);
      return () => media.removeEventListener('change', notify);
    },
    () => window.matchMedia(compactQuery).matches,
    () => false,
  );
}

export default function MyWS() {
  const compact = useCompact();
  const result = useStudyResults({ kind: 'all', group: 'WS', limit: 15 });
  const balance = useGradingBalance(true);
  const [listenRow, setListenRow] = useState<HistoryRow>();
  const [textRow, setTextRow] = useState<HistoryRow>();
  const [confirmRow, setConfirmRow] = useState<{ row: HistoryRow; action: WsAction }>();
  const [busy, setBusy] = useState<{ id: string; text: string }>();
  const [notice, setNotice] = useState<Notice>();
  const rows = useMemo<readonly HistoryRow[]>(() =>
    result.items.map(item => ({ ...item, view: describeWsRow(item) })), [result.items]);

  function run(row: HistoryRow, action: WsAction) {
    if (busy) return;
    if (action.kind === 'view') navigate(learnerResultPath(row.id));
    else if (action.kind === 'listen') setListenRow(row);
    else if (action.kind === 'view-text') setTextRow(row);
    else if (action.kind === 'download-audio') void downloadAudio(row);
    else if (action.kind === 'download-docx') void downloadWriting(row);
    else if (action.kind === 'grade' || action.kind === 'regrade') setConfirmRow({ row, action });
  }

  async function downloadWriting(row: HistoryRow) {
    setNotice(undefined);
    setBusy({ id: row.id, text: 'Đang chuẩn bị tệp .docx…' });
    try {
      await downloadWritingDocx(row.id, row.title);
      setNotice({ tone: 'ok', text: 'Đã tạo tệp .docx.' });
    } catch (error) {
      setNotice({ tone: 'error', text: writingContentError(error) });
      if (errorStatus(error) === 410) result.reload();
    } finally {
      setBusy(undefined);
    }
  }

  async function downloadAudio(row: HistoryRow) {
    setNotice(undefined);
    setBusy({ id: row.id, text: 'Đang chuẩn bị bản ghi…' });
    try {
      await downloadRecordingsZip(row.id, row.title, (done, total) => setBusy({ id: row.id, text: `Đang tải bản ghi ${Math.min(done + 1, total)}/${total}…` }));
      setNotice({ tone: 'ok', text: `Đã tải xong bản ghi của bài “${row.title}”.` });
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof RecordingDownloadError ? error.message : 'Chưa tải được bản ghi, hãy thử lại sau.' });
    } finally {
      setBusy(undefined);
    }
  }

  async function sendGrading(row: HistoryRow) {
    setConfirmRow(undefined);
    setNotice(undefined);
    setBusy({ id: row.id, text: 'Đang gửi yêu cầu chấm…' });
    try {
      const sent = await requestGrading(row.id, row.grading?.status === 'CANCELLED' ? row.grading.id ?? undefined : undefined);
      setNotice({ tone: sent.status === 'CANCELLED' ? 'info' : 'ok', text: `${row.title} · ${gradingStatusName[sent.status]}.` });
      result.reload();
      balance.reload();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error && error.message ? error.message : 'Chưa gửi được yêu cầu chấm, hãy thử lại.' });
      balance.reload();
      result.reload();
    } finally {
      setBusy(undefined);
    }
  }

  const skillChip = (row: HistoryRow) => <span className="ws-chip" data-skill={row.skill}>
    <span className="ws-chip-letter" aria-hidden="true">{skillLetters[row.skill]}</span>{skillNames[row.skill]}</span>;
  const sectionLabel = (row: HistoryRow) => wsSectionsLabel(row.skill === 'WRITING' ? 'Writing' : 'Speaking', row.sections);
  const statusChip = (row: HistoryRow) => <>
    <span className="ws-chip" data-outcome={row.view.outcome}>{row.view.status}</span>
    {row.grading?.status === 'WAITING_ASSIGNMENT' && row.grading.assignmentDeadlineAt &&
      <small className="block">Đến {formatGradingDate(row.grading.assignmentDeadlineAt)}</small>}
    {row.grading?.status === 'CANCELLED' && <small className="block">{cancellationText(row.grading.cancelReason)}</small>}
  </>;
  const actions = (row: HistoryRow) => {
    const working = busy?.id === row.id;
    const primary = row.view.primary;
    return <div className="ws-row-actions">
      {primary && <button type="button" disabled={!!busy}
        className={primary.kind === 'view' ? 'learner-study-button' : 'learner-study-button learner-study-primary'}
        onClick={() => run(row, primary)}>{working ? busy.text : primary.label}</button>}
      {!primary && working && <span className="learner-study-muted" role="status">{busy.text}</span>}
      {row.view.menu.length > 0 && <MenuButton label={`Thao tác khác cho ${row.title}`} items={row.view.menu.map(action => ({
        key: action.kind,
        label: action.label,
        icon: menuIcons[action.kind as keyof typeof menuIcons],
        disabled: !!action.disabledReason || !!busy,
        reason: action.disabledReason ?? (busy ? 'Đang xử lý một bài.' : undefined),
        onSelect: () => run(row, action),
      }))} />}
    </div>;
  };

  return <div className="ws-history">
    <header className="learner-study-results-header ws-history-header">
      <div>
        <h2>Bài Writing và Speaking của tôi</h2>
        <p className="learner-study-muted">Bài đã hoàn thành, trạng thái yêu cầu chấm và thời hạn nội dung.</p>
      </div>
      <PageLink page="PracticeHub" className="learner-study-button">Luyện Writing, Speaking</PageLink>
    </header>

    <div className="ws-history-info">
      <section className="learner-study-panel">
        <h2>Lượt hỗ trợ chấm còn hiệu lực</h2>
        <dl className="ws-credits">
          {(['free', 'bonus'] as const).map(type => {
            const credit = balance.credits?.[type];
            const expiry = credit?.expiresAt ? formatGradingDate(credit.expiresAt) : null;
            return <div key={type} data-credit={type}>
              <dt>{type === 'free' ? 'Lượt miễn phí' : 'Lượt bonus'}</dt>
              <dd>{credit?.count ?? '—'}</dd>
              <small>{expiry ? (type === 'free' && credit?.count === 0 ? 'Cấp lại lúc ' : 'Hạn gần nhất ') + expiry
                : credit ? 'Chưa có lượt bonus' : 'Đang tải số lượt…'}</small>
            </div>;
          })}
        </dl>
        {balance.error && <p role="alert">{balance.error} <button type="button" className="learner-study-button" onClick={balance.reload}>Thử lại</button></p>}
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
        <h2 id="ws-history-table-title">Bài đã hoàn thành</h2>
      </header>
      {notice && <p className="ws-notice" data-tone={notice.tone} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
      {rows.length > 0 && (compact
        ? <ul className="ws-card-list" aria-label="Danh sách lịch sử Writing và Speaking">{rows.map(row => <li key={row.id} className="ws-card">
          <div className="ws-card-head">
            <strong>{row.title}</strong>
            <time dateTime={row.completedAt}>Hoàn thành {dateTime.format(new Date(row.completedAt))}</time>
            {sectionLabel(row) && <small>{sectionLabel(row)}</small>}
          </div>
          <div className="ws-card-chips">{skillChip(row)}{statusChip(row)}</div>
          <p className="ws-card-retention"><span>Nội dung bài</span>{row.view.retention}</p>
          {actions(row)}
        </li>)}</ul>
        : <>
          <p className="ws-scroll-hint">Vuốt ngang để xem đầy đủ bảng.</p>
          <div className="ws-table-scroll" tabIndex={0} role="region" aria-label="Bảng lịch sử Writing và Speaking">
            <table>
              <thead><tr>
                <th scope="col">Bài</th><th scope="col">Kỹ năng</th><th scope="col">Trạng thái</th><th scope="col">Nội dung bài</th>
                <th scope="col"><span className="ws-sr-only">Thao tác</span></th>
              </tr></thead>
              <tbody>{rows.map(row => <tr key={row.id}>
                <th scope="row"><strong>{row.title}</strong><time dateTime={row.completedAt}>Hoàn thành {dateTime.format(new Date(row.completedAt))}</time>
                  {sectionLabel(row) && <small>{sectionLabel(row)}</small>}</th>
                <td>{skillChip(row)}</td>
                <td>{statusChip(row)}</td>
                <td>{row.view.retention}</td>
                <td>{actions(row)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>)}
      {result.loading && <p className="learner-study-empty ws-table-state" role="status">Đang tải kết quả…</p>}
      {result.error && <div className="learner-study-empty ws-table-state" role="alert">{result.error}{' '}
        <button type="button" className="learner-study-button" onClick={result.retry}>Thử lại</button>
      </div>}
      {!rows.length && !result.loading && !result.error && <p className="learner-study-empty ws-table-state">Chưa có bài Writing hoặc Speaking đã lưu.</p>}
      {result.next && !result.error && <button type="button" className="learner-study-button ws-table-more"
        onClick={result.loadMore} disabled={result.loading}>Xem thêm</button>}
    </section>

    {listenRow && <AttemptRecordingsPopup attemptId={listenRow.id} title={listenRow.title} onClose={() => setListenRow(undefined)} />}

    {textRow && <WritingTextPopup attemptId={textRow.id} title={textRow.title} onClose={() => setTextRow(undefined)} />}

    <ConfirmDialog open={!!confirmRow} onClose={() => setConfirmRow(undefined)} label="Xác nhận gửi yêu cầu chấm"
      icon={<Icon name="send" size={20} />} title={confirmRow?.action.label ?? ''} confirmLabel="Gửi yêu cầu"
      onConfirm={() => confirmRow && void sendGrading(confirmRow.row)}>
      Bài “{confirmRow?.row.title}” sẽ được gửi cho Giáo viên chấm và dùng một lượt chấm, theo quy định lượt miễn phí hằng tuần
      (lượt miễn phí dùng chung Writing và Speaking, không cộng dồn; lượt bonus nếu có). Hệ thống kiểm tra lượt còn lại khi bạn gửi.
    </ConfirmDialog>
  </div>;
}
