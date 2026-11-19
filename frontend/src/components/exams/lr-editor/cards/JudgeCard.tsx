import React from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function JudgeCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
}: CardProps) {
  const isTfng = group.type === 'TFNG';
  const choices = isTfng
    ? ['TRUE', 'FALSE', 'NOT GIVEN']
    : ['YES', 'NO', 'NOT GIVEN'];

  const items = group.items || [];

  function addItem() {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items.push({
        text: 'New statement to judge...',
        ans: isTfng ? 'TRUE' : 'YES',
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

  function updateItem(idx: number, patch: Partial<(typeof items)[0]>) {
    onChange((g) => {
      if (!g.items) g.items = [];
      g.items[idx] = { ...g.items[idx], ...patch };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[12px] bg-[#FAF9F7] px-3.5 py-2 rounded-lg border border-[#E5E0D8]">
        <span className="text-[#706473]">Định dạng nhận định:</span>
        <span className="font-semibold text-[#2963CC]">
          {isTfng ? 'TRUE / FALSE / NOT GIVEN' : 'YES / NO / NOT GIVEN'}
        </span>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const qNum = groupStartNum + idx;
          const currentAns = String(item.ans || '');

          return (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-2.5"
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
                    placeholder="Nhập nội dung nhận định..."
                    className="w-full text-[13px] border border-[#D6D4D0] rounded-lg p-2 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
                  />

                  {/* 3 Quick Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#706473] mr-1">Đáp án:</span>
                    {choices.map((choice) => {
                      const isActive = currentAns.toUpperCase() === choice;
                      const activeClass = 'border-[#2963CC] bg-[#E3ECFD] text-[#2963CC]';

                      return (
                        <button
                          key={choice}
                          type="button"
                          disabled={readOnly}
                          onClick={() => updateItem(idx, { ans: choice })}
                          className={`px-3 py-1 text-[12px] font-bold rounded-lg border transition-all ${
                            isActive
                              ? activeClass
                              : 'bg-white text-[#554756] border-[#D6D4D0] hover:bg-[#F3F0EA]'
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
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
                      title="Xóa nhận định này"
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
          Thêm nhận định
        </button>
      )}
    </div>
  );
}
