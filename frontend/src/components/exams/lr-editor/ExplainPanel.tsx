import React, { useState } from 'react';
import type { LrGroupState, LrPassageState } from '../../../lib/lr-editor/types.ts';
import type { ExplainPatch, ExplainRow } from '../../../lib/lr-editor/explain.ts';
import { explainProgress } from '../../../lib/lr-editor/explain.ts';
import { formatQuestionRange } from '../../../lib/lr-editor/pure.ts';
import { typeName } from '../../../lib/lr-editor/constants.ts';

const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export type ExplainPanelProps = {
  isReading: boolean;
  passage: LrPassageState;
  rows: ExplainRow[];
  eq: number;
  onSelect: (idx: number) => void;
  readOnly: boolean;
  onApply: (row: ExplainRow, patch: ExplainPatch) => void;
};

export default function ExplainPanel({
  isReading,
  passage,
  rows,
  eq,
  onSelect,
  readOnly,
  onApply,
}: ExplainPanelProps) {
  const [draftKey, setDraftKey] = useState('');
  const prog = explainProgress(rows);
  const np = (passage.paras || []).length;
  const groups: LrGroupState[] = passage.groups || [];

  if (rows.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-[13px] text-[#706473]">
        Chưa có câu hỏi nào cần giải thích. Thêm nhóm câu hỏi ở tab Câu hỏi trước.
      </div>
    );
  }

  const addKey = (row: ExplainRow) => {
    const v = draftKey.trim();
    if (!v || row.keys.includes(v)) {
      setDraftKey('');
      return;
    }
    onApply(row, { keys: [...row.keys, v] });
    setDraftKey('');
  };

  const orderedGroups = Array.from(new Set(rows.map((r) => r.gIdx)));

  return (
    <div className="px-5 py-4 space-y-4">
      <p className="text-[13px] text-[#706473]">
        Đã gán {isReading ? 'đoạn' : 'dòng'} cho {prog.done}/{prog.total} câu · {prog.withKeys} câu có key phrase.
        {readOnly ? '' : ' Bấm một câu để nhập.'}
      </p>

      {orderedGroups.map((gIdx) => {
        const g = groups[gIdx];
        const gRows = rows.filter((r) => r.gIdx === gIdx);
        return (
          <div key={gIdx} className="space-y-2">
            <div className="text-[13px] font-bold text-[#352637]">
              {typeName(g.type, isReading)} ·{' '}
              {formatQuestionRange(gRows[0].n, gRows[gRows.length - 1].n)}
            </div>
            {gRows.map((row) => {
              const idx = rows.indexOf(row);
              const open = idx === eq;
              const paraLabel =
                row.para != null
                  ? `${isReading ? 'Đoạn' : 'Dòng'} ${isReading ? (LET[row.para] ?? row.para + 1) : row.para + 1}`
                  : null;
              return (
                <div
                  key={`${row.gIdx}-${row.k}`}
                  className={`rounded-xl border border-solid bg-white ${
                    open ? 'border-[#2963CC] border-[1.5px]' : 'border-[#E5E0D8]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(open ? -1 : idx)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                  >
                    <span className="inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-lg bg-[#F3F0EA] text-[13px] font-bold text-[#352637]">
                      {row.n}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-[14px] text-[#352637]">
                      {row.label}
                    </span>
                    {row.answer && (
                      <span className="shrink-0 max-w-[40%] truncate text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E3F3E8] border border-solid border-[#B9E0C6] text-[#1F6B3A]">
                        {row.answer}
                      </span>
                    )}
                    <span
                      className={`shrink-0 text-[12px] font-semibold ${
                        paraLabel ? 'text-[#1F6B3A]' : 'text-[#A89CA8]'
                      }`}
                    >
                      {paraLabel
                        ? `${paraLabel}${row.keys.length ? ` · ${row.keys.length} key` : ''}`
                        : 'Chưa gán'}
                    </span>
                  </button>

                  {open && (
                    <div className="px-4 pb-4 pt-1 space-y-4 border-t border-solid border-[#F3F0EA]">
                      <div className="pt-3">
                        <div className="text-[13px] font-bold text-[#352637] mb-2">
                          {isReading ? 'Đoạn chứa đáp án' : 'Dòng transcript chứa đáp án'}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: np }).map((_, pi) => (
                            <button
                              key={pi}
                              type="button"
                              disabled={readOnly}
                              onClick={() =>
                                onApply(row, { para: row.para === pi ? null : pi })
                              }
                              className={`min-w-9 h-8 px-2 rounded-lg text-[13px] font-semibold border border-solid transition-colors ${
                                row.para === pi
                                  ? 'bg-[#2963CC] border-[#2963CC] text-white'
                                  : 'bg-white border-[#D6D4D0] text-[#352637] hover:bg-[#F3F0EA]'
                              }`}
                            >
                              {isReading ? (LET[pi] ?? pi + 1) : pi + 1}
                            </button>
                          ))}
                          {np === 0 && (
                            <span className="text-[12px] text-[#A89CA8]">
                              Chưa có {isReading ? 'đoạn văn' : 'dòng transcript'} nào để gán.
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[13px] font-bold text-[#352637]">Key phrases</div>
                        <p className="text-[12px] text-[#706473] mt-1 mb-2">
                          Cụm từ trong {isReading ? 'đoạn' : 'transcript'} dẫn tới đáp án. Khi xem lời giải, người học thấy các cụm này được tô sáng.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {row.keys.map((kp, ki) => (
                            <span
                              key={ki}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEBB0] text-[13px] font-semibold text-[#5A4300]"
                            >
                              {kp}
                              {!readOnly && (
                                <button
                                  type="button"
                                  aria-label="Xóa key phrase"
                                  onClick={() =>
                                    onApply(row, { keys: row.keys.filter((_, i) => i !== ki) })
                                  }
                                  className="text-[14px] leading-none"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {!readOnly && (
                          <div className="flex gap-2">
                            <input
                              value={draftKey}
                              onChange={(e) => setDraftKey(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addKey(row);
                                }
                              }}
                              placeholder={
                                isReading
                                  ? 'Gõ cụm từ, hoặc bôi đen chữ trong đoạn ở cột trái'
                                  : 'Gõ cụm từ có trong transcript'
                              }
                              className="flex-1 h-10 px-3 text-[14px] rounded-xl border border-solid border-[#D6D4D0] bg-white focus:outline-none focus:border-[#2963CC]"
                            />
                            <button
                              type="button"
                              onClick={() => addKey(row)}
                              className="h-10 px-5 rounded-full border border-solid border-[#D6D4D0] bg-white text-[14px] font-semibold text-[#352637] hover:bg-[#F3F0EA]"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-[13px] font-bold text-[#352637] mb-2">
                          Giải thích (không bắt buộc)
                        </div>
                        <textarea
                          rows={3}
                          disabled={readOnly}
                          value={row.text}
                          onChange={(e) => onApply(row, { text: e.target.value })}
                          className="w-full text-[14px] p-3 rounded-xl border border-solid border-[#D6D4D0] bg-white focus:outline-none focus:border-[#2963CC]"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onSelect(idx - 1)}
                          className="h-9 px-4 rounded-full border border-solid border-[#D6D4D0] bg-white text-[13px] font-semibold text-[#352637] disabled:text-[#A89CA8] disabled:border-[#E5E0D8]"
                        >
                          ← Câu trước
                        </button>
                        <button
                          type="button"
                          disabled={idx === rows.length - 1}
                          onClick={() => onSelect(idx + 1)}
                          className="h-9 px-4 rounded-full border border-solid border-[#D6D4D0] bg-white text-[13px] font-semibold text-[#352637] disabled:text-[#A89CA8] disabled:border-[#E5E0D8]"
                        >
                          Câu sau →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
