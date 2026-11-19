import React, { useEffect } from 'react';

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-50 duration-150">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E0D8] space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3">
          {isDanger && (
            <div className="w-10 h-10 rounded-full bg-[#FDF3F0] flex items-center justify-center shrink-0 text-[#C0412A]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-[17px] font-bold text-[#352637] leading-snug">{title}</h3>
            <p className="text-[14px] text-[#706473] leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA] rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-colors shadow-sm ${
              isDanger
                ? 'bg-[#C0412A] hover:bg-[#A33420]'
                : 'bg-[#2963CC] hover:bg-[#2050A8]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
