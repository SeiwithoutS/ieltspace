import React from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { limOf, overLimit, parseAlt } from '../../../../lib/lr-editor/pure.ts';
import { LIM } from '../../../../lib/lr-editor/constants.ts';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function GapCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
}: CardProps) {
  const items = group.items || [];
  const li = limOf(group);
  const isShortAnswer = group.type === 'SHORT_ANSWER';

  function updateItem(idx: number, patch: Partial<(typeof items)[0]>) {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items[idx] = { ...g.items[idx], ...patch };
    });
  }

  function addItem() {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items.push({
        text: isShortAnswer ? 'New question?' : 'Sentence with ___ placeholder.',
        ans: '',
        alt: null,
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

  function moveItem(idx: number, delta: number) {
    onChange((g) => {
      if (!g.items) return;
      const target = idx + delta;
      if (target < 0 || target >= g.items.length) return;
      const temp = g.items[idx];
      g.items[idx] = g.items[target];
      g.items[target] = temp;
    });
  }

  return (
    <div className="space-y-4">
      {/* Giới hạn từ của đáp án */}
      <div className="space-y-1.5">
        <div className="text-[13px] font-bold text-[#352637]">Giới hạn từ của đáp án</div>
        <select
          value={li >= 0 ? li : 0}
          disabled={readOnly}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onChange((g) => {
              g.limit = val;
            });
          }}
          className={`w-full max-w-[420px] h-11 px-3 text-[14px] rounded-xl text-[#352637] ${
            readOnly ? 'bg-[#F3F0EA] border-0' : 'bg-white border border-solid border-[#D6D4D0]'
          }`}
        >
          {LIM.map((label, idx) => (
            <option key={idx} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const qNum = groupStartNum + idx;
          const badAns = overLimit(item.ans, li);
          const alts = parseAlt(item.alt);
          const badAlt = alts.some((a) => overLimit(a, li));

          return (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs hover:border-[#D6D4D0] transition-colors space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F0EA] text-[#352637] text-[12px] font-bold shrink-0 mt-0.5">
                  {qNum}
                </span>

                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={item.text || ''}
                    disabled={readOnly}
                    onChange={(e) => updateItem(idx, { text: e.target.value })}
                    placeholder={
                      isShortAnswer
                        ? 'Nhập câu hỏi...'
                        : 'Nhập câu hoàn chỉnh chứa ít nhất một chỗ trống ___ ...'
                    }
                    className="w-full text-[13px] border border-[#D6D4D0] rounded-lg p-2 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#706473] mb-0.5">
                        Đáp án chính
                      </label>
                      <input
                        type="text"
                        value={String(item.ans ?? '')}
                        disabled={readOnly}
                        onChange={(e) => updateItem(idx, { ans: e.target.value })}
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
                        value={item.alt || ''}
                        disabled={readOnly}
                        onChange={(e) => updateItem(idx, { alt: e.target.value || null })}
                        placeholder="Ví dụ: volcano, volcanos"
                        className={`w-full text-[13px] h-8 px-2.5 rounded-lg border transition-colors ${
                          badAlt
                            ? 'border-[#C0412A] bg-[#FDF3F0] text-[#C0412A]'
                            : 'border-[#D6D4D0] text-[#352637] focus:border-[#2963CC]'
                        }`}
                      />
                    </div>
                  </div>

</div>

                {!readOnly && (
                  <div className="flex flex-col gap-1 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 text-[#706473] hover:text-[#352637] disabled:opacity-30 rounded hover:bg-[#F3F0EA]"
                      title="Di chuyển lên"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="p-1 text-[#706473] hover:text-[#352637] disabled:opacity-30 rounded hover:bg-[#F3F0EA]"
                      title="Di chuyển xuống"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-[#C0412A] hover:bg-[#FDF3F0] rounded"
                      title="Xóa câu hỏi này"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-[#D6D4D0] hover:border-[#2963CC] text-[#2963CC] text-[13px] font-semibold rounded-xl hover:bg-[#DFF1F4]/30 transition-all flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm câu hỏi
        </button>
      )}
    </div>
  );
}
