import React, { useState } from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { LET } from '../../../../lib/lr-editor/constants.ts';
import { splitList } from './splitList';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function McqCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
}: CardProps) {
  const isMulti = group.type === 'MCQ_MULTI';

  // --- Handlers for MCQ_MULTI ---
  const multiQ = group.q || '';
  const multiOpts = group.opts || [];
  const multiPick = group.pick || 2;
  const multiAns = (group.ans || []).map(Number);
  const [newMultiOpt, setNewMultiOpt] = useState('');

  function updateMultiQ(q: string) {
    onChange((g) => {
      g.q = q;
    });
  }

  function updateMultiPick(pick: number) {
    onChange((g) => {
      g.pick = pick;
    });
  }

  function toggleMultiAns(optIdx: number) {
    onChange((g) => {
      const current = (g.ans || []).map(Number);
      const exists = current.indexOf(optIdx);
      if (exists >= 0) {
        current.splice(exists, 1);
      } else {
        current.push(optIdx);
      }
      g.ans = current.sort((a, b) => a - b);
    });
  }

  function addMultiOpt() {
    if (!newMultiOpt.trim()) return;
    onChange((g) => {
      if (!g.opts) g.opts = [];
      g.opts.push(...splitList(newMultiOpt, g.opts));
    });
    setNewMultiOpt('');
  }

  function removeMultiOpt(idx: number) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts.splice(idx, 1);
      if (g.ans) {
        g.ans = g.ans
          .map(Number)
          .filter((a) => a !== idx)
          .map((a) => (a > idx ? a - 1 : a));
      }
    });
  }

  function updateMultiOpt(idx: number, val: string) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts[idx] = val;
    });
  }

  // --- Handlers for MCQ_SINGLE ---
  const singleItems = group.items || [];

  function addSingleQuestion() {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items.push({
        q: 'New multiple choice question?',
        opts: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        ans: 0,
        exp: '',
        para: null,
      });
    });
  }

  function removeSingleQuestion(qIdx: number) {
    onChange((g) => {
      if (!g.items) return;
      g.items.splice(qIdx, 1);
    });
  }

  function updateSingleQ(qIdx: number, q: string) {
    onChange((g) => {
      if (!g.items) return;
      g.items[qIdx] = { ...g.items[qIdx], q };
    });
  }

  function updateSingleAns(qIdx: number, ans: number) {
    onChange((g) => {
      if (!g.items) return;
      g.items[qIdx] = { ...g.items[qIdx], ans };
    });
  }

  function updateSingleOpt(qIdx: number, oIdx: number, text: string) {
    onChange((g) => {
      if (!g.items || !g.items[qIdx]) return;
      const opts = [...(g.items[qIdx].opts || [])];
      opts[oIdx] = text;
      g.items[qIdx] = { ...g.items[qIdx], opts };
    });
  }

  function addSingleOpt(qIdx: number) {
    onChange((g) => {
      if (!g.items || !g.items[qIdx]) return;
      const opts = [...(g.items[qIdx].opts || [])];
      opts.push(`Choice ${LET[opts.length] || String(opts.length + 1)}`);
      g.items[qIdx] = { ...g.items[qIdx], opts };
    });
  }

  /** Nhập nhanh: thay toàn bộ lựa chọn của câu bằng danh sách cách nhau dấu phẩy. */
  function bulkSingleOpts(qIdx: number, raw: string) {
    const list = splitList(raw);
    if (list.length < 2) return;
    onChange((g) => {
      if (!g.items || !g.items[qIdx]) return;
      const ans = g.items[qIdx].ans;
      g.items[qIdx] = {
        ...g.items[qIdx],
        opts: list,
        ans: typeof ans === 'number' && ans < list.length ? ans : 0,
      };
    });
  }

  function removeSingleOpt(qIdx: number, oIdx: number) {
    onChange((g) => {
      if (!g.items || !g.items[qIdx]) return;
      const opts = [...(g.items[qIdx].opts || [])];
      if (opts.length <= 2) return; // Minimum 2 options
      opts.splice(oIdx, 1);
      let ans = g.items[qIdx].ans;
      if (typeof ans === 'number') {
        if (ans === oIdx) ans = 0;
        else if (ans > oIdx) ans = ans - 1;
      }
      g.items[qIdx] = { ...g.items[qIdx], opts, ans };
    });
  }

  function updateSingleExp(qIdx: number, exp: string, para: number | null) {
    onChange((g) => {
      if (!g.items || !g.items[qIdx]) return;
      g.items[qIdx] = { ...g.items[qIdx], exp, para };
    });
  }

  if (isMulti) {
    const isPickMismatched = multiAns.length !== multiPick;
    const isOptsTooSmall = multiOpts.length <= multiPick;

    return (
      <div className="space-y-4">
        {/* Pick Config Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F7] px-3.5 py-2.5 rounded-xl border border-[#E5E0D8]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#706473]">Số đáp án cần chọn:</span>
            <select
              value={multiPick}
              disabled={readOnly}
              onChange={(e) => updateMultiPick(parseInt(e.target.value, 10))}
              className="text-[12px] h-7 px-2 border border-[#D6D4D0] rounded-md text-[#352637] font-semibold bg-white focus:outline-hidden"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  Chọn {n} đáp án (tính {n} câu)
                </option>
              ))}
            </select>
          </div>

          <div className="text-[12px]">
            Đã đánh dấu:{' '}
            <span
              className={`font-bold ${
                isPickMismatched ? 'text-[#C0412A]' : 'text-[#2E7D4F]'
              }`}
            >
              {multiAns.length}/{multiPick} đáp án
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F0EA] text-[#352637] text-[12px] font-bold shrink-0">
              {groupStartNum}-{groupStartNum + multiPick - 1}
            </span>
            <label className="text-[13px] font-bold text-[#352637]">
              Nội dung câu hỏi trắc nghiệm nhiều đáp án:
            </label>
          </div>

          <textarea
            rows={2}
            value={multiQ}
            disabled={readOnly}
            onChange={(e) => updateMultiQ(e.target.value)}
            placeholder="Ví dụ: Which TWO factors improve memory according to the passage?"
            className="w-full text-[13px] border border-[#D6D4D0] rounded-xl p-2.5 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
          />
        </div>

        {/* Options List with Checkboxes */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-bold text-[#352637]">
              Các lựa chọn ({multiOpts.length} lựa chọn):
            </label>
            {isOptsTooSmall && (
              <span className="text-[11px] text-[#C0412A] font-semibold">
                Số lựa chọn phải nhiều hơn {multiPick} đáp án đúng
              </span>
            )}
          </div>

          <div className="space-y-2">
            {multiOpts.map((optText, idx) => {
              const isChecked = multiAns.includes(idx);

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors shadow-2xs ${
                    isChecked
                      ? 'border-[#2963CC] bg-[#E3ECFD]'
                      : 'border-[#E5E0D8] bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={readOnly}
                    onChange={() => toggleMultiAns(idx)}
                    className="w-4 h-4 text-[#2963CC] rounded border-[#D6D4D0] focus:ring-0 shrink-0"
                  />

                  <span className="w-5 text-[12px] font-bold text-[#2963CC] shrink-0">
                    {LET[idx] || String(idx + 1)}.
                  </span>

                  <input
                    type="text"
                    value={optText}
                    disabled={readOnly}
                    onChange={(e) => updateMultiOpt(idx, e.target.value)}
                    className="flex-1 text-[13px] border-0 p-0 bg-transparent text-[#352637] focus:ring-0 focus:outline-hidden"
                  />

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeMultiOpt(idx)}
                      className="text-[#A89CA8] hover:text-[#C0412A] font-bold text-[14px]"
                      title="Xóa lựa chọn này"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}

            {!readOnly && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newMultiOpt}
                  onChange={(e) => setNewMultiOpt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMultiOpt();
                    }
                  }}
                  placeholder="+ Nhập các lựa chọn, cách nhau bằng dấu phẩy (A, B, C...)"
                  className="flex-1 text-[12px] h-8 px-2.5 border border-dashed border-[#D6D4D0] rounded-lg bg-white focus:outline-hidden focus:border-[#2963CC]"
                />
                <button
                  type="button"
                  onClick={addMultiOpt}
                  className="px-3 py-1 text-[12px] font-semibold bg-[#2A1F2D] text-white rounded-lg hover:bg-[#3D2F40]"
                >
                  Thêm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MCQ_SINGLE ---
  return (
    <div className="space-y-4">
      {singleItems.map((item, qIdx) => {
        const qNum = groupStartNum + qIdx;
        const opts = item.opts || [];
        const currentAns = typeof item.ans === 'number' ? item.ans : -1;

        return (
          <div
            key={qIdx}
            className="p-4 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F0EA] text-[#352637] text-[12px] font-bold shrink-0 mt-0.5">
                {qNum}
              </span>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={item.q || ''}
                  disabled={readOnly}
                  onChange={(e) => updateSingleQ(qIdx, e.target.value)}
                  placeholder="Nhập câu hỏi trắc nghiệm..."
                  className="w-full text-[13px] font-semibold h-8 px-2.5 border border-[#D6D4D0] rounded-lg text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC]"
                />
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeSingleQuestion(qIdx)}
                  className="p-1 text-[#C0412A] hover:bg-[#FDF3F0] rounded shrink-0"
                  title="Xóa câu hỏi này"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Options with Radio Buttons */}
            <div className="space-y-1.5 pl-9">
              {opts.map((optText, oIdx) => {
                const isSelected = currentAns === oIdx;

                return (
                  <div
                    key={oIdx}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-[#2963CC] bg-[#E3ECFD]'
                        : 'border-[#E5E0D8] bg-[#FAF9F7]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`mcq_q_${qIdx}`}
                      checked={isSelected}
                      disabled={readOnly}
                      onChange={() => updateSingleAns(qIdx, oIdx)}
                      className="w-4 h-4 text-[#2963CC] border-[#D6D4D0] focus:ring-0 shrink-0"
                    />

                    <span className="w-4 text-[12px] font-bold text-[#2963CC] shrink-0">
                      {LET[oIdx] || String(oIdx + 1)}.
                    </span>

                    <input
                      type="text"
                      value={optText}
                      disabled={readOnly}
                      onChange={(e) => updateSingleOpt(qIdx, oIdx, e.target.value)}
                      className="flex-1 text-[12px] border-0 p-0 bg-transparent text-[#352637] focus:ring-0 focus:outline-hidden"
                    />

                    {!readOnly && opts.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSingleOpt(qIdx, oIdx)}
                        className="text-[#A89CA8] hover:text-[#C0412A] font-bold text-[12px]"
                        title="Xóa lựa chọn này"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}

              {!readOnly && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => addSingleOpt(qIdx)}
                    className="text-[11px] font-semibold text-[#2963CC] hover:underline"
                  >
                    + Thêm lựa chọn
                  </button>
                  <input
                    type="text"
                    placeholder="Hoặc nhập nhanh: A, B, C, D rồi Enter (thay toàn bộ)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        bulkSingleOpts(qIdx, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="flex-1 text-[11px] h-7 px-2 border border-dashed border-[#D6D4D0] rounded-lg bg-white focus:outline-hidden focus:border-[#2963CC]"
                  />
                </div>
              )}
            </div>

</div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={addSingleQuestion}
          className="w-full py-2 border-2 border-dashed border-[#D6D4D0] hover:border-[#2963CC] text-[#2963CC] text-[13px] font-semibold rounded-xl hover:bg-[#DFF1F4]/30 transition-all flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm câu hỏi trắc nghiệm
        </button>
      )}
    </div>
  );
}
