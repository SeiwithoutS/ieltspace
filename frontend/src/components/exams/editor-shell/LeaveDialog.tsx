import React, { useEffect } from 'react';

export type LeaveDialogProps = {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onKeepEditing: () => void;
  saving?: boolean;
};

export default function LeaveDialog({
  isOpen,
  onSave,
  onDiscard,
  onKeepEditing,
  saving = false,
}: LeaveDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) {
        onKeepEditing();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onKeepEditing, saving]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-50 duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E0D8] space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF8E6] flex items-center justify-center shrink-0 text-[#E5A800]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-[#352637] leading-snug">Thay đổi chưa được lưu</h3>
            <p className="text-[14px] text-[#706473] leading-relaxed">
              Bạn có các chỉnh sửa chưa lưu trong bài thi này. Nếu rời đi bây giờ, mọi thay đổi chưa lưu sẽ bị mất.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA] rounded-xl transition-colors order-3 sm:order-1"
          >
            Ở lại chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#C0412A] hover:bg-[#FDF3F0] rounded-xl transition-colors order-2"
          >
            Không lưu
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold bg-[#2963CC] hover:bg-[#2050A8] text-white rounded-xl transition-colors shadow-sm order-1 sm:order-3 inline-flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
