import React, { useEffect } from 'react';
import type { LrQuestionType } from '../../../lib/lr-editor/types.ts';
import { LR_TYPE_GROUPS, typeName } from '../../../lib/lr-editor/constants.ts';

export type TypePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LrQuestionType) => void;
  allowedTypes?: LrQuestionType[];
  isReading?: boolean;
};

export default function TypePicker({
  isOpen,
  onClose,
  onSelectType,
  allowedTypes,
  isReading = true,
}: TypePickerProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-50 duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl border border-solid border-[#E5E0D8] space-y-3 animate-in zoom-in-95 duration-150 flex flex-col"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-solid border-[#F3F0EA]">
          <h3 className="text-[16px] font-bold text-[#352637]">Thêm nhóm câu hỏi</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A89CA8] hover:text-[#352637] font-bold text-[20px] p-1 leading-none transition-colors"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        {/* Groups List */}
        <div className="flex flex-col gap-2">
          {LR_TYPE_GROUPS.map((group) => {
            const availableTypes = group.types.filter(
              (t) => !allowedTypes || allowedTypes.includes(t)
            );
            if (availableTypes.length === 0) return null;

            const defaultType = availableTypes[0];
            const subtext = availableTypes
              .map((t) => typeName(t, isReading))
              .join(' · ');

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onSelectType(defaultType);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-solid border-[#E5E0D8] bg-[#FAF9F7] hover:bg-[#E3ECFD] hover:border-[#2963CC] transition-colors text-left group"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[13px] font-semibold text-[#352637] leading-tight">
                    {group.label}
                  </span>
                  <span className="text-[11px] text-[#706473] leading-tight mt-0.5 truncate">
                    {subtext}
                  </span>
                </div>
                <span
                  className="text-[#A89CA8] text-[18px] leading-none shrink-0 select-none"
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
