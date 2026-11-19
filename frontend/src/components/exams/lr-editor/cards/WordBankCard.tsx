import React, { useState } from 'react';
import NoteBody from './NoteBody.tsx';
import { SummaryModeToggle } from './SummaryModeToggle.tsx';
import type { LrGroupState, LrPassageState } from '../../../../lib/exams/lr-editor/types.ts';
import { blanks } from '../../../../lib/exams/lr-editor/pure.ts';
import { LET } from '../../../../lib/exams/lr-editor/constants.ts';
import { splitList } from './splitList';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
  onChangeType?: (nextType: 'SUMMARY_COMP' | 'SUMMARY_BOX') => void;
};

export default function WordBankCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
  onChangeType,
}: CardProps) {
  const [newWord, setNewWord] = useState('');
  const bodyText = group.body || '';
  const blankCount = blanks(bodyText);
  const opts = group.opts || [];
  const ansList = group.ans || [];
  const expList = group.exp || [];

  function addWord() {
    if (!newWord.trim()) return;
    onChange((g) => {
      if (!g.opts) g.opts = [];
      g.opts.push(...splitList(newWord, g.opts));
    });
    setNewWord('');
  }

  function removeWord(idx: number) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts.splice(idx, 1);
      // Remap answers
      if (g.ans) {
        g.ans = g.ans.map((a) => {
          const numA = Number(a);
          if (numA === idx) return -1;
          if (numA > idx) return numA - 1;
          return numA;
        });
      }
    });
  }

  function updateWord(idx: number, val: string) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts[idx] = val;
    });
  }

  function setBlankAnswer(bIdx: number, optIdx: number) {
    onChange((g) => {
      if (!g.ans) g.ans = [];
      g.ans[bIdx] = optIdx;
    });
  }

  function updateExp(idx: number, text: string, para: number | null) {
    onChange((g) => {
      if (!g.exp) g.exp = [];
      const current = g.exp[idx] || {};
      g.exp[idx] = { ...current, text, para };
    });
  }

  const isBankTooSmall = opts.length > 0 && opts.length <= blankCount;

  return (
    <div className="space-y-4">
      {onChangeType && (
        <SummaryModeToggle
          group={group}
          readOnly={readOnly}
          onChangeMode={(nextType) => onChangeType(nextType)}
        />
      )}

      {/* Top action */}
      <div className="flex items-center justify-between bg-[#FAF9F7] px-3.5 py-2.5 rounded-xl border border-[#E5E0D8]">
        <div className="text-[12px] text-[#706473]">
          Khung từ: <span className="font-semibold text-[#352637]">{opts.length} từ</span>
          {isBankTooSmall && (
            <span className="text-[#C0412A] font-semibold ml-2">
              (Khung từ phải nhiều hơn {blankCount} chỗ trống)
            </span>
          )}
        </div>

      </div>

      {/* Nội dung + xem trước */}
      <NoteBody
        value={bodyText}
        readOnly={readOnly}
        startNum={groupStartNum}
        placeholder="Nhập đoạn văn tóm tắt. Chèn ___ tại mỗi vị trí cần chọn từ trong khung..."
        onChange={(val) =>
          onChange((g) => {
            g.body = val;
          })
        }
      />

      {/* Word Bank Editor */}
      <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-[#E5E0D8] space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[12px] font-bold text-[#352637]">
            Khung từ vựng lựa chọn (Word list):
          </label>
          <span className="text-[11px] text-[#706473]">Mỗi từ được gán ký tự A, B, C...</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {opts.map((word, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 bg-white border border-[#D6D4D0] px-2.5 py-1 rounded-lg shadow-2xs text-[13px]"
            >
              <span className="font-bold text-[#2963CC] text-[11px]">{LET[idx] || String(idx + 1)}.</span>
              {readOnly ? (
                <span className="font-medium text-[#352637]">{word}</span>
              ) : (
                <input
                  type="text"
                  value={word}
                  onChange={(e) => updateWord(idx, e.target.value)}
                  className="w-24 text-[12px] font-medium text-[#352637] border-0 p-0 focus:ring-0 focus:outline-hidden"
                />
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeWord(idx)}
                  className="text-[#A89CA8] hover:text-[#C0412A] ml-1 font-bold"
                  title="Xóa từ này"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {!readOnly && (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addWord();
                  }
                }}
                placeholder="+ Thêm từ (cách nhau bằng dấu phẩy)"
                className="w-64 text-[12px] h-7 px-2 border border-dashed border-[#D6D4D0] rounded-lg bg-white focus:outline-hidden focus:border-[#2963CC]"
              />
              <button
                type="button"
                onClick={addWord}
                className="px-2 py-1 text-[11px] font-semibold bg-[#2A1F2D] text-white rounded-lg hover:bg-[#3D2F40]"
              >
                Thêm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Answer Slots */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-[12px] font-bold text-[#352637]">
          Gán từ từ khung cho {blankCount} chỗ trống:
        </label>

        {Array.from({ length: blankCount }).map((_, idx) => {
          const qNum = groupStartNum + idx;
          const assignedOptIdx = ansList[idx] != null ? Number(ansList[idx]) : -1;
          const expVal = expList[idx] || {};

          return (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3F0EA] text-[#352637] text-[11px] font-bold shrink-0">
                    {qNum}
                  </span>
                  <span className="text-[12px] font-semibold text-[#352637]">Chỗ trống số {idx + 1}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#706473]">Từ đúng:</span>
                  <select
                    value={assignedOptIdx >= 0 ? assignedOptIdx : ''}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = e.target.value === '' ? -1 : parseInt(e.target.value, 10);
                      setBlankAnswer(idx, val);
                    }}
                    className={`text-[12px] h-8 px-2.5 rounded-lg border font-semibold ${
                      assignedOptIdx < 0
                        ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                        : 'border-[#D6D4D0] text-[#352637] bg-white'
                    }`}
                  >
                    <option value="">-- Chọn từ từ khung --</option>
                    {opts.map((optText, oIdx) => (
                      <option key={oIdx} value={oIdx}>
                        {LET[oIdx] || String(oIdx + 1)}. {optText}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

</div>
          );
        })}
      </div>
    </div>
  );
}
