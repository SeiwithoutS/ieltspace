import React from 'react';

export type VersionBannerProps = {
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  versionNumber: number;
  basedOnVersion?: number | null;
  onCreateRevision?: () => void;
  creatingRevision?: boolean;
};

export default function VersionBanner({
  status,
  versionNumber,
  basedOnVersion,
  onCreateRevision,
  creatingRevision = false,
}: VersionBannerProps) {
  if (status === 'DRAFT') {
    if (!basedOnVersion || basedOnVersion === 1 && versionNumber === 1) {
      return (
        <div className="bg-[#FFF8E6] border-b border-[#F7E4A8] px-6 py-2.5 flex items-center justify-between text-[13px] text-[#7A5B04]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5A800]" />
            <span className="font-semibold">Bản nháp v{versionNumber}</span>
            <span className="text-[#8F6E14]">· Đang soạn thảo, học viên chưa thấy trong thư viện bài thi.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#FFF8E6] border-b border-[#F7E4A8] px-6 py-2.5 flex items-center justify-between text-[13px] text-[#7A5B04]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E5A800]" />
          <span className="font-semibold">Bản nháp v{versionNumber}</span>
          <span className="text-[#8F6E14]">
            dựa trên v{basedOnVersion} đã phát hành. Học viên vẫn thấy v{basedOnVersion} cho đến khi bạn phát hành bản này.
          </span>
        </div>
      </div>
    );
  }

  if (status === 'PUBLISHED') {
    return (
      <div className="bg-[#EBF7EE] border-b border-[#B8E6C4] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#1E5631]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2E7D4F]" />
          <span className="font-semibold">Bản phát hành v{versionNumber}</span>
          <span className="text-[#2D6A42]">· Đang hiển thị trực tiếp cho học viên làm bài.</span>
        </div>

        {onCreateRevision && (
          <button
            type="button"
            onClick={onCreateRevision}
            disabled={creatingRevision}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#2E7D4F] text-[#2E7D4F] hover:bg-[#E2F3E7] font-semibold text-[12px] rounded-lg transition-colors shadow-2xs"
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

  // ARCHIVED or HIDDEN
  return (
    <div className="bg-[#F3F0EA] border-b border-[#E5E0D8] px-6 py-2.5 flex items-center justify-between text-[13px] text-[#554756]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#8E8392]" />
        <span className="font-semibold">
          {status === 'ARCHIVED' ? `Phiên bản lưu trữ v${versionNumber}` : `Phiên bản đã ẩn v${versionNumber}`}
        </span>
        <span className="text-[#706473]">· Chỉ xem lại lịch sử (không thể chỉnh sửa trực tiếp).</span>
      </div>
    </div>
  );
}
