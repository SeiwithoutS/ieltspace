import React, { useState, useRef, useEffect } from 'react';
import type { LrQuestionType } from '../../../lib/lr-editor/types.ts';
import {
  typeName,
  comboOptions,
  COMBO_TYPE_LABELS,
} from '../../../lib/lr-editor/constants.ts';

export type GroupTypeSwitcherProps = {
  currentType: LrQuestionType;
  allowedTypes?: LrQuestionType[];
  readOnly?: boolean;
  isReading: boolean;
  onSelectType: (nextType: LrQuestionType) => void;
};

export default function GroupTypeSwitcher({
  currentType,
  allowedTypes,
  readOnly = false,
  isReading,
  onSelectType,
}: GroupTypeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const options = comboOptions(currentType, allowedTypes);

  // Đóng khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Nhãn hiển thị cho dạng hiện tại
  const displayLabel = COMBO_TYPE_LABELS[currentType] || typeName(currentType, isReading);

  // Chế độ xem hoặc nhóm chỉ có 1 lựa chọn: chỉ hiển thị text
  if (readOnly || options.length <= 1) {
    return (
      <span className="text-[15px] font-semibold text-[#352637] truncate" title={displayLabel}>
        {typeName(currentType, isReading)}
      </span>
    );
  }

  return (
    <div className="relative inline-block min-w-0 max-w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-1.5 px-2 py-1 -my-1 rounded-lg text-[15px] font-semibold text-[#352637] hover:bg-[#F3F0EA] transition-colors max-w-full group"
        title="Bấm để đổi dạng câu hỏi trong cùng nhóm"
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 text-[#706473] group-hover:text-[#352637] shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1.5 z-40 min-w-[260px] max-w-[340px] bg-white border border-solid border-[#D6D4D0] rounded-xl shadow-lg p-1.5 space-y-0.5 overflow-y-auto max-h-[300px]"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="px-2.5 py-1 text-[11px] font-bold text-[#706473] uppercase tracking-wider">
            Đổi dạng trong nhóm
          </div>
          {options.map((opt) => {
            const isSelected =
              currentType === opt.type ||
              (currentType === 'SUMMARY_BOX' && opt.type === 'SUMMARY_COMP') ||
              (currentType === 'MATCH_ENDING' && opt.type === 'MATCH_FEATURE');

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (isSelected && (currentType === opt.type || currentType === 'MATCH_ENDING')) {
                    return;
                  }
                  onSelectType(opt.type);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#E3ECFD] text-[#2963CC] font-semibold'
                    : 'text-[#352637] hover:bg-[#F3F0EA]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-[#2963CC] shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
