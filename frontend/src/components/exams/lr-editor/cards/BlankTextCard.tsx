import React from 'react';
import NoteBody from './NoteBody.tsx';
import { SummaryModeToggle } from './SummaryModeToggle.tsx';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { blanks, limOf, overLimit, parseAlt } from '../../../../lib/lr-editor/pure.ts';
import { LIM } from '../../../../lib/lr-editor/constants.ts';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
  onChangeType?: (nextType: 'SUMMARY_COMP' | 'SUMMARY_BOX') => void;
};

export default function BlankTextCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
  onChangeType,
}: CardProps) {
  const bodyText = group.body || '';
  const blankCount = blanks(bodyText);
  const li = limOf(group);
  const ansList = group.ans || [];
  const altList = group.alt || [];
  const expList = group.exp || [];

  function updateAns(idx: number, val: string) {
    onChange((g) => {
      if (!g.ans) g.ans = [];
      g.ans[idx] = val;
    });
  }

  function updateAlt(idx: number, val: string) {
    onChange((g) => {
      if (!g.alt) g.alt = [];
      g.alt[idx] = val || null;
    });
  }

  function updateExp(idx: number, text: string, para: number | null) {
    onChange((g) => {
      if (!g.exp) g.exp = [];
      const current = g.exp[idx] || {};
      g.exp[idx] = { ...current, text, para };
    });
  }

  return (
    <div className="space-y-4">
      {group.type === 'SUMMARY_COMP' && onChangeType && (
        <SummaryModeToggle
          group={group}
          readOnly={readOnly}
          onChangeMode={(nextType) => onChangeType(nextType)}
        />
      )}

      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F7] px-3.5 py-2.5 rounded-xl border border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#706473]">Giới hạn từ:</span>
          <select
            value={li >= 0 ? li : 0}
            disabled={readOnly}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange((g) => {
                g.limit = val;
              });
            }}
            className="text-[12px] h-7 px-2 border border-[#D6D4D0] rounded-md text-[#352637] bg-white font-medium focus:outline-hidden"
          >
            {LIM.map((label, idx) => (
              <option key={idx} value={idx}>
                {label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Nội dung + xem trước */}
      <NoteBody
        value={bodyText}
        readOnly={readOnly}
        startNum={groupStartNum}
        placeholder="Nhập đoạn văn tóm tắt hoặc ghi chú. Nhập ___ tại mỗi vị trí học viên cần điền..."
        onChange={(val) =>
          onChange((g) => {
            g.body = val;
          })
        }
      />

      {/* Answer Slots */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[12px] text-[#706473]">
          <span className="font-bold text-[#352637]">
            Danh sách đáp án cho {blankCount} chỗ trống:
          </span>
          {blankCount === 0 && (
            <span className="text-[#C0412A] font-medium">Chưa có chỗ trống nào trong đoạn văn.</span>
          )}
        </div>

        {Array.from({ length: blankCount }).map((_, idx) => {
          const qNum = groupStartNum + idx;
          const ansVal = ansList[idx] ?? '';
          const altVal = altList[idx] ?? '';
          const expVal = expList[idx] || {};
          const badAns = overLimit(ansVal, li);
          const alts = parseAlt(altVal);
          const badAlt = alts.some((a) => overLimit(a, li));

          return (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3F0EA] text-[#352637] text-[11px] font-bold shrink-0">
                  {qNum}
                </span>
                <span className="text-[12px] font-semibold text-[#352637]">Chỗ trống số {idx + 1}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#706473] mb-0.5">
                    Đáp án chính
                  </label>
                  <input
                    type="text"
                    value={String(ansVal)}
                    disabled={readOnly}
                    onChange={(e) => updateAns(idx, e.target.value)}
                    placeholder="Đáp án chính xác"
                    className={`w-full text-[13px] h-8 px-2.5 rounded-lg border transition-colors ${
                      badAns
                        ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                        : 'border-[#D6D4D0] text-[#352637] focus:border-[#2963CC]'
                    }`}
                  />
                  {badAns && (
                    <span className="text-[10px] text-[#C0412A] mt-0.5 block">
                      Vượt giới hạn {LIM[li]}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#706473] mb-0.5">
                    Cách viết khác (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={String(altVal)}
                    disabled={readOnly}
                    onChange={(e) => updateAlt(idx, e.target.value)}
                    placeholder="Ví dụ: 4, four"
                    className={`w-full text-[13px] h-8 px-2.5 rounded-lg border transition-colors ${
                      badAlt
                        ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                        : 'border-[#D6D4D0] text-[#352637] focus:border-[#2963CC]'
                    }`}
                  />
                </div>
              </div>

</div>
          );
        })}
      </div>
    </div>
  );
}
