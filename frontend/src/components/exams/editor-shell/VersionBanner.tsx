import React from 'react';
import { styleOf } from '../../../lib/shared/styles';

export type VersionBannerSlot = {
  liveId: string | null;
  liveStatus: 'PUBLISHED' | 'HIDDEN' | null;
  liveVersion: number | null;
  draftId?: string | null;
  draftVersion?: number | null;
};

export type VersionBannerProps = {
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  versionNumber: number;
  slot?: VersionBannerSlot | null;
  /** Dùng cho bản ARCHIVED: bấm "Mở bản hiện tại →" (bản nháp nếu có, không thì bản đang đăng/ẩn). */
  onOpenCurrent?: (skillId: string) => void;
  onCreateRevision?: () => void;
  creatingRevision?: boolean;
};

// Màu banner theo DESIGN.md 12.6 (cảnh báo, thành công) và 12.5 (trung tính cho bản ẩn/lưu trữ).
const bannerStyle = (bg: string, fg: string) =>
  styleOf(
    `background: ${bg}; color: ${fg}; border-bottom: 1.5px solid #D6D4D0; padding: 10px 24px; font-size: 13px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;`
  );

const dotStyle = (color: string) =>
  styleOf(`width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0;`);

const rowStyle = styleOf('display: flex; align-items: center; gap: 8px;');

export default function VersionBanner({
  status,
  versionNumber,
  slot,
  onOpenCurrent,
  onCreateRevision,
  creatingRevision = false,
}: VersionBannerProps) {
  if (status === 'DRAFT') {
    const liveVersion = slot?.liveId ? slot.liveVersion : null;
    return (
      <div style={bannerStyle('#FBEDBF', '#7A5A0E')}>
        <div style={rowStyle}>
          <span style={dotStyle('#7A5A0E')} />
          <span style={styleOf('font-weight: 600;')}>Bản nháp v{versionNumber}</span>
          <span>
            {liveVersion
              ? `· dựa trên v${liveVersion}. Người học vẫn thấy v${liveVersion} (${
                  slot?.liveStatus === 'HIDDEN' ? 'đang ẩn' : 'đang đăng'
                }) cho đến khi bạn đăng bản này.`
              : '· Đang soạn thảo, người học chưa thấy trong thư viện bài thi.'}
          </span>
        </div>
      </div>
    );
  }

  if (status === 'PUBLISHED') {
    return (
      <div style={bannerStyle('#E6F3EC', '#24543D')}>
        <div style={rowStyle}>
          <span style={dotStyle('#2E7D4F')} />
          <span style={styleOf('font-weight: 600;')}>Bản phát hành v{versionNumber}</span>
          <span>· Đang hiển thị trực tiếp cho người học làm bài.</span>
        </div>

        {onCreateRevision && (
          <button
            type="button"
            onClick={onCreateRevision}
            disabled={creatingRevision}
            style={styleOf(
              'display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; background: #FFFFFF; color: #2E7D4F; border: 1.5px solid #2E7D4F; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer;'
            )}
          >
            {creatingRevision ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang tạo bản nháp...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo bản nháp mới để sửa
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  // ARCHIVED hoặc HIDDEN: dải trung tính (#F3F0EA / #706473 như chip "Đã ẩn")
  const currentId = slot?.draftId || slot?.liveId;
  return (
    <div style={bannerStyle('#F3F0EA', '#706473')}>
      <div style={rowStyle}>
        <span style={dotStyle('#8E8392')} />
        <span style={styleOf('font-weight: 600;')}>
          {status === 'ARCHIVED' ? `Phiên bản lưu trữ v${versionNumber}` : `Phiên bản đã ẩn v${versionNumber}`}
        </span>
        <span>
          {status === 'ARCHIVED'
            ? '· Chỉ xem lại lịch sử (không thể chỉnh sửa trực tiếp).'
            : '· Đang ẩn khỏi người học (không thể chỉnh sửa trực tiếp).'}
        </span>
      </div>
      {status === 'ARCHIVED' && currentId && onOpenCurrent && (
        <button
          type="button"
          onClick={() => onOpenCurrent(currentId)}
          style={styleOf(
            'font-weight: 600; color: #352637; text-decoration: underline; white-space: nowrap; background: transparent; border: 0; cursor: pointer;'
          )}
        >
          Mở bản hiện tại →
        </button>
      )}
    </div>
  );
}
