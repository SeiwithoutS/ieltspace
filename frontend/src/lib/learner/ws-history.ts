import type { StudyResult } from './study-overview';

/** Ánh xạ một dòng lịch sử Writing/Speaking sang trạng thái hiển thị, nút chính và các mục menu ba chấm. */
export type WsOutcome = 'saved' | 'waiting' | 'assigned' | 'published' | 'cancelled' | 'expired';
export type WsActionKind = 'grade' | 'regrade' | 'view' | 'listen' | 'download-audio' | 'view-text' | 'download-docx';
export type WsAction = { kind: WsActionKind; label: string; disabledReason?: string };
export type WsRowView = { outcome: WsOutcome; status: string; retention: string; primary?: WsAction; menu: WsAction[] };

export const actionLabels: Record<WsActionKind, string> = {
  grade: 'Gửi yêu cầu chấm',
  regrade: 'Gửi lại yêu cầu',
  view: 'Xem kết quả',
  listen: 'Nghe lại',
  'download-audio': 'Tải ghi âm',
  'view-text': 'Xem bài viết',
  'download-docx': 'Tải .docx',
};
export const EXPIRED_REASON = 'Nội dung đã hết hạn nên bản ghi và bài viết đã bị xóa.';
export const NO_DOCX_REASON = 'Tính năng tải .docx sẽ sớm khả dụng.';
export const NO_RECORDING_REASON = 'Bài này chưa có bản ghi nào.';

const shortDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });

const action = (kind: WsActionKind, disabledReason?: string): WsAction => ({ kind, label: actionLabels[kind], disabledReason });

function retentionText(item: Pick<StudyResult, 'contentStatus' | 'contentExpiresAt'>): string {
  if (item.contentStatus === 'EXPIRED' || item.contentStatus === 'DELETED') return 'Nội dung đã hết hạn';
  if (item.contentStatus === 'HELD') return 'Tạm giữ';
  if (item.contentStatus === 'AVAILABLE' && item.contentExpiresAt) {
    const date = new Date(item.contentExpiresAt);
    if (!Number.isNaN(date.getTime())) return `Giữ đến ${shortDate.format(date)}`;
  }
  return '—';
}

function mediaMenu(skill: StudyResult['skill'], expired: boolean, recordingCount: number | undefined): WsAction[] {
  if (skill === 'SPEAKING') {
    const reason = expired ? EXPIRED_REASON : recordingCount === 0 ? NO_RECORDING_REASON : undefined;
    return [action('listen', reason), action('download-audio', reason)];
  }
  // Writing: đọc lại văn bản qua API (khóa khi hết hạn). Chưa có API tải .docx: mục luôn khóa,
  // nhưng ẩn khi nội dung đã hết hạn (không còn gì để tải).
  return expired ? [action('view-text', EXPIRED_REASON)] : [action('view-text'), action('download-docx', NO_DOCX_REASON)];
}

export function describeWsRow(item: Pick<StudyResult, 'skill' | 'band' | 'contentStatus' | 'contentExpiresAt' | 'grading' | 'published' | 'recordingCount'>): WsRowView {
  const content = item.contentStatus ?? null;
  const expired = content === 'EXPIRED' || content === 'DELETED';
  const grading = item.grading?.status ?? null;
  const known = item.contentStatus !== undefined || item.grading !== undefined;
  const bandText = item.band === null ? '' : ` · ${item.band.toFixed(1)}`;
  const menu = mediaMenu(item.skill, expired, item.recordingCount);
  const retention = retentionText(item);
  const view = action('view');

  if (!known) {
    // API cũ chưa trả trạng thái: giữ cách suy ra theo band như trước.
    return item.band === null
      ? { outcome: 'saved', status: 'Chưa có điểm', retention, menu }
      : { outcome: 'published', status: `Đã có kết quả${bandText}`, retention, primary: view, menu };
  }
  if (grading === 'COMPLETED' && item.published) {
    return { outcome: 'published', status: `Đã có kết quả${bandText}`, retention, primary: view, menu };
  }
  // Điểm và nhận xét đã công bố vẫn xem được khi nội dung bài hết hạn.
  if (expired) {
    return item.published
      ? { outcome: 'published', status: `Đã có kết quả${bandText}`, retention, primary: view, menu }
      : { outcome: 'expired', status: 'Nội dung đã hết hạn', retention, menu };
  }
  if (grading === 'WAITING_ASSIGNMENT') return { outcome: 'waiting', status: 'Chờ phân công', retention, menu };
  if (grading === 'ASSIGNED' || grading === 'COMPLETED') return { outcome: 'assigned', status: 'Đang chấm', retention, menu };
  if (grading === 'CANCELLED') return { outcome: 'cancelled', status: 'Đã hủy', retention, primary: action('regrade'), menu };
  if (content === 'HELD') return { outcome: 'waiting', status: 'Tạm giữ', retention, menu };
  return { outcome: 'saved', status: 'Đã lưu · chưa gửi chấm', retention, primary: action('grade'), menu };
}

/** Dòng mẫu (?demo=1) khai báo sẵn danh sách thao tác bằng nhãn; Nghe lại/Tải khi hết hạn thì khóa. */
export function describeSampleRow(
  example: { skill: StudyResult['skill']; outcome: WsOutcome; status: string; retention: string; actions?: readonly string[] },
): WsRowView {
  const labels = example.actions ?? [];
  const kinds = (Object.keys(actionLabels) as WsActionKind[]).filter(kind => labels.includes(actionLabels[kind]));
  const reasonOf = (kind: WsActionKind) =>
    example.outcome === 'expired' && (kind === 'listen' || kind === 'download-audio' || kind === 'view-text' || kind === 'download-docx') ? EXPIRED_REASON : undefined;
  const make = (kind: WsActionKind) => action(kind, reasonOf(kind));
  const primaryKind = kinds.find(kind => kind === 'grade' || kind === 'regrade' || kind === 'view');
  return {
    outcome: example.outcome,
    status: example.status,
    retention: example.retention,
    primary: primaryKind ? make(primaryKind) : undefined,
    menu: kinds.filter(kind => kind !== primaryKind).map(make),
  };
}
