import React, { useState } from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { LET, ROM } from '../../../../lib/lr-editor/constants.ts';
import { splitList } from './splitList';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function MatchCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
}: CardProps) {
  const isHeading = group.type === 'MATCH_HEADING';
  const isInfo = group.type === 'MATCH_INFO';
  const isFeature = group.type === 'MATCH_FEATURE';
  const isEnding = group.type === 'MATCH_ENDING';

  const [newOptText, setNewOptText] = useState('');
  const opts = group.opts || [];
  const items = group.items || [];
  const hans = group.hans || [];
  const paras = passage.paras || [];

  function addOption() {
    if (!newOptText.trim()) return;
    onChange((g) => {
      if (!g.opts) g.opts = [];
      g.opts.push(...splitList(newOptText, g.opts));
    });
    setNewOptText('');
  }

  function removeOption(idx: number) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts.splice(idx, 1);
      if (isHeading && g.hans) {
        g.hans = g.hans.map((h) => (h === idx ? -1 : h > idx ? h - 1 : h));
      } else if (g.items) {
        g.items.forEach((it) => {
          if (typeof it.ans === 'number') {
            if (it.ans === idx) it.ans = null;
            else if (it.ans > idx) it.ans = it.ans - 1;
          }
        });
      }
    });
  }

  function updateOption(idx: number, val: string) {
    onChange((g) => {
      if (!g.opts) return;
      g.opts[idx] = val;
    });
  }

  function updateHeadingAns(pIdx: number, optIdx: number) {
    onChange((g) => {
      if (!g.hans) g.hans = [];
      g.hans[pIdx] = optIdx;
    });
  }

  function addItem() {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items.push({
        text: 'New statement to match...',
        ans: null,
        exp: '',
        para: null,
      });
    });
  }

  function removeItem(idx: number) {
    onChange((g) => {
      if (!g.items) return;
      g.items.splice(idx, 1);
    });
  }

  function updateItem(idx: number, patch: Partial<(typeof items)[0]>) {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items[idx] = { ...g.items[idx], ...patch };
    });
  }

  function toggleOneUse() {
    onChange((g) => {
      g.oneUse = !g.oneUse;
    });
  }

  return (
    <div className="space-y-4">
      {/* Options Source List (Headings, Features, Endings) */}
      {!isInfo && (
        <div className="bg-[#FAF9F7] p-3.5 rounded-xl border border-[#E5E0D8] space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-bold text-[#352637]">
              {isHeading
                ? 'Danh sách tiêu đề (List of Headings):'
                : isFeature
                  ? 'Danh sách đối tượng (List of People/Features):'
                  : 'Danh sách phần kết câu (List of Sentence Endings):'}
            </label>
            <span className="text-[11px] text-[#706473]">
              {opts.length} lựa chọn
            </span>
          </div>

          <div className="space-y-2">
            {opts.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#D6D4D0] shadow-2xs"
              >
                <span className="w-6 text-[12px] font-bold text-[#2963CC] shrink-0">
                  {isHeading ? ROM[idx] || String(idx + 1) : LET[idx] || String(idx + 1)}.
                </span>

                <input
                  type="text"
                  value={opt}
                  disabled={readOnly}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="flex-1 text-[13px] border-0 p-0 text-[#352637] focus:ring-0 focus:outline-hidden"
                />

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-[#A89CA8] hover:text-[#C0412A] font-bold text-[14px]"
                    title="Xóa lựa chọn này"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}

            {!readOnly && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newOptText}
                  onChange={(e) => setNewOptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="+ Nhập các lựa chọn, cách nhau bằng dấu phẩy (A, B, C...)"
                  className="flex-1 text-[12px] h-8 px-2.5 border border-dashed border-[#D6D4D0] rounded-lg bg-white focus:outline-hidden focus:border-[#2963CC]"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-3 py-1 text-[12px] font-semibold bg-[#2A1F2D] text-white rounded-lg hover:bg-[#3D2F40]"
                >
                  Thêm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Notice */}
      {(isInfo || isFeature) && (
        <div className="flex items-center gap-2 bg-[#F8F9FA] px-3.5 py-2 rounded-lg border border-[#E5E0D8]">
          <input
            type="checkbox"
            id="oneUseCheckbox"
            checked={!!group.oneUse}
            disabled={readOnly}
            onChange={toggleOneUse}
            className="w-4 h-4 text-[#2963CC] rounded border-[#D6D4D0] focus:ring-0"
          />
          <label htmlFor="oneUseCheckbox" className="text-[12px] text-[#4B3D4D] cursor-pointer">
            Mỗi lựa chọn chỉ được dùng một lần (bỏ chọn để cho phép một lựa chọn dùng nhiều lần: NB)
          </label>
        </div>
      )}

      {/* Questions List */}
      {isHeading ? (
        <div className="space-y-2.5">
          <label className="block text-[12px] font-bold text-[#352637]">
            Gán tiêu đề cho từng đoạn văn trong bài đọc:
          </label>

          {paras.map((_, pIdx) => {
            const qNum = groupStartNum + pIdx;
            const assignedHIdx = hans[pIdx] ?? -1;

            return (
              <div
                key={pIdx}
                className="p-3 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F0EA] text-[#352637] text-[12px] font-bold shrink-0">
                    {qNum}
                  </span>
                  <span className="text-[13px] font-bold text-[#352637]">
                    Đoạn {LET[pIdx] || String(pIdx + 1)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <select
                    value={assignedHIdx >= 0 ? assignedHIdx : ''}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = e.target.value === '' ? -1 : parseInt(e.target.value, 10);
                      updateHeadingAns(pIdx, val);
                    }}
                    className={`w-full text-[12px] h-8 px-2.5 rounded-lg border font-semibold ${
                      assignedHIdx < 0
                        ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                        : 'border-[#D6D4D0] text-[#352637] bg-white'
                    }`}
                  >
                    <option value="">-- Chọn tiêu đề đúng --</option>
                    {opts.map((optText, oIdx) => (
                      <option key={oIdx} value={oIdx}>
                        {ROM[oIdx] || String(oIdx + 1)}. {optText}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-[12px] font-bold text-[#352637]">
            Danh sách các nhận định cần ghép ({items.length} câu hỏi):
          </label>

          {items.map((it, idx) => {
            const qNum = groupStartNum + idx;
            const ansIdx = typeof it.ans === 'number' ? it.ans : -1;

            return (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F0EA] text-[#352637] text-[12px] font-bold shrink-0 mt-0.5">
                    {qNum}
                  </span>

                  <div className="flex-1 space-y-2">
                    <textarea
                      rows={2}
                      value={it.text || ''}
                      disabled={readOnly}
                      onChange={(e) => updateItem(idx, { text: e.target.value })}
                      placeholder="Nhập nội dung nhận định..."
                      className="w-full text-[13px] border border-[#D6D4D0] rounded-lg p-2 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-[#706473]">Ghép với:</span>
                        <select
                          value={ansIdx >= 0 ? ansIdx : ''}
                          disabled={readOnly}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                            updateItem(idx, { ans: val });
                          }}
                          className={`text-[12px] h-8 px-2.5 rounded-lg border font-semibold ${
                            ansIdx < 0
                              ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                              : 'border-[#D6D4D0] text-[#352637] bg-white'
                          }`}
                        >
                          <option value="">-- Chọn đáp án đúng --</option>
                          {isInfo
                            ? paras.map((_, pIdx) => (
                                <option key={pIdx} value={pIdx}>
                                  Đoạn {LET[pIdx] || String(pIdx + 1)}
                                </option>
                              ))
                            : opts.map((optText, oIdx) => (
                                <option key={oIdx} value={oIdx}>
                                  {LET[oIdx] || String(oIdx + 1)}. {optText}
                                </option>
                              ))}
                        </select>
                      </div>

</div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-[#C0412A] hover:bg-[#FDF3F0] rounded"
                      title="Xóa nhận định này"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!readOnly && (
            <button
              type="button"
              onClick={addItem}
              className="w-full py-2 border-2 border-dashed border-[#D6D4D0] hover:border-[#2963CC] text-[#2963CC] text-[13px] font-semibold rounded-xl hover:bg-[#DFF1F4]/30 transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm câu nhận định
            </button>
          )}
        </div>
      )}
    </div>
  );
}
