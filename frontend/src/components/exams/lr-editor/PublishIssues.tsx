import React, { useEffect } from 'react';

export type PublishIssuesProps = {
  isOpen: boolean;
  issues: Array<{ text: string; p: number; g: number }>;
  onClose: () => void;
  onSelectIssue: (p: number, g: number) => void;
};

export default function PublishIssues({
  isOpen,
  issues,
  onClose,
  onSelectIssue,
}: PublishIssuesProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-50 duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E0D8] space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F3F0EA]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FDF3F0] text-[#C0412A] flex items-center justify-center font-bold text-[14px]">
              !
            </span>
            <div>
              <h3 className="text-[17px] font-bold text-[#352637]">
                Các vấn đề cần khắc phục trước khi đăng
              </h3>
              <p className="text-[12px] text-[#706473]">
                Còn {issues.length} lỗi/cảnh báo cần giải quyết để đảm bảo tiêu chuẩn đề thi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#A89CA8] hover:text-[#352637] font-bold text-[20px] p-1"
          >
            &times;
          </button>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectIssue(issue.p, issue.g);
                onClose();
              }}
              className="p-3 bg-[#FAF9F7] hover:bg-[#FDF3F0] border border-[#E5E0D8] hover:border-[#F2B8B5] rounded-xl cursor-pointer transition-colors flex items-start gap-2.5 group"
            >
              <span className="w-2 h-2 rounded-full bg-[#C0412A] shrink-0 mt-1.5" />
              <div className="flex-1 text-[13px] text-[#352637] leading-relaxed">
                {issue.text}
              </div>
              <span className="text-[11px] font-bold text-[#2963CC] group-hover:underline shrink-0 self-center">
                Đi tới &rarr;
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#F3F0EA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA] rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
