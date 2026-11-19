import React from 'react';
import type { LrGroupState } from '../../../../lib/exams/lr-editor/types.ts';

export type SummaryModeToggleProps = {
  group: LrGroupState;
  readOnly?: boolean;
  onChangeMode: (nextType: 'SUMMARY_COMP' | 'SUMMARY_BOX') => void;
};

/** Chọn biến thể của Summary Completion: Điền đáp án hoặc Có danh sách từ. */
export function SummaryModeToggle({ group, readOnly = false, onChangeMode }: SummaryModeToggleProps) {
  const isBox = group.type === 'SUMMARY_BOX';
  const base =
    'px-3 py-1.5 rounded-[9px] text-[13px] font-semibold border border-solid text-left transition-all';
  const on = 'bg-white border-[#D6D4D0] shadow-sm text-[#352637]';
  const off = 'border-transparent text-[#706473] hover:text-[#352637]';

  return (
    <div className="space-y-1.5">
      <div className="text-[13px] font-bold text-[#352637]">Kiểu tóm tắt</div>
      <div className="inline-flex flex-wrap gap-1 p-[3px] rounded-xl bg-[#F3F0EA]">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (isBox) onChangeMode('SUMMARY_COMP');
          }}
          className={`${base} ${!isBox ? on : off}`}
        >
          Điền đáp án
        </button>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (!isBox) onChangeMode('SUMMARY_BOX');
          }}
          className={`${base} ${isBox ? on : off}`}
        >
          Có danh sách từ
        </button>
      </div>
    </div>
  );
}

export default SummaryModeToggle;
