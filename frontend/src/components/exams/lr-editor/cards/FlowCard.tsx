import React from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { blanks, flowOf, flowSeq, limOf, normFlow, overLimit, parseAlt } from '../../../../lib/lr-editor/pure.ts';
import { LIM } from '../../../../lib/lr-editor/constants.ts';
import DiagramCard from './DiagramCard.tsx';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  skillId?: string;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function FlowCard({
  group,
  passage,
  passageIndex,
  groupStartNum,
  readOnly = false,
  skillId,
  onChange,
}: CardProps) {
  if (group.mode === 'image') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#FAF9F7] px-3.5 py-2 rounded-lg border border-[#E5E0D8]">
          <span className="text-[12px] font-semibold text-[#706473]">Chế độ sơ đồ: Hình ảnh</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                onChange((g) => {
                  g.mode = 'table';
                });
              }}
              className="text-[12px] font-semibold text-[#2963CC] hover:underline"
            >
              Chuyển sang chế độ khối/bước
            </button>
          )}
        </div>
        <DiagramCard
          group={group}
          passage={passage}
          passageIndex={passageIndex}
          groupStartNum={groupStartNum}
          readOnly={readOnly}
          skillId={skillId}
          onChange={onChange}
        />
      </div>
    );
  }

  const fl = flowOf(group);
  const seq = flowSeq(fl);
  const totalBlanks = seq.reduce((acc, item) => acc + blanks(item.t), 0);
  const li = limOf(group);
  const ansList = group.ans || [];
  const altList = group.alt || [];
  const expList = group.exp || [];

  function addNode() {
    onChange((g) => {
      normFlow(g);
      const row = (g.nodes || []).length;
      g.nodes?.push({
        id: 'n' + (row + 1),
        row,
        text: 'Step description with ___ ...',
      });
    });
  }

  function removeNode(idx: number) {
    onChange((g) => {
      normFlow(g);
      g.nodes?.splice(idx, 1);
      // Re-index rows
      g.nodes?.forEach((n, i) => {
        n.row = i;
      });
    });
  }

  function updateNodeText(idx: number, text: string) {
    onChange((g) => {
      normFlow(g);
      if (g.nodes && g.nodes[idx]) {
        g.nodes[idx].text = text;
      }
    });
  }

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

        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              onChange((g) => {
                g.mode = 'image';
              });
            }}
            className="text-[12px] font-semibold text-[#2963CC] hover:underline"
          >
            Chuyển sang dùng ảnh sơ đồ (Diagram mode)
          </button>
        )}
      </div>

      {/* Flow Nodes List */}
      <div className="space-y-3">
        <label className="block text-[12px] font-bold text-[#4B3D4D]">
          Các bước trong lưu đồ (Flow-chart steps):
        </label>

        {fl.nodes.map((node, idx) => (
          <div
            key={node.id || idx}
            className="p-3 bg-white rounded-xl border border-[#E5E0D8] shadow-2xs space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#2963CC]">
                Bước {idx + 1}
              </span>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeNode(idx)}
                  className="text-[#A89CA8] hover:text-[#C0412A] text-[13px] font-bold"
                  title="Xóa bước này"
                >
                  &times;
                </button>
              )}
            </div>

            <textarea
              rows={2}
              value={node.text || ''}
              disabled={readOnly}
              onChange={(e) => updateNodeText(idx, e.target.value)}
              placeholder="Nhập nội dung bước này. Dùng ___ để chèn chỗ trống..."
              className="w-full text-[13px] border border-[#D6D4D0] rounded-lg p-2 text-[#352637] placeholder-[#A89CA8] focus:outline-hidden focus:border-[#2963CC] resize-none"
            />
          </div>
        ))}

        {!readOnly && (
          <button
            type="button"
            onClick={addNode}
            className="w-full py-2 border-2 border-dashed border-[#D6D4D0] hover:border-[#2963CC] text-[#2963CC] text-[13px] font-semibold rounded-xl hover:bg-[#DFF1F4]/30 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm bước tiếp theo
          </button>
        )}
      </div>

      {/* Answer Slots */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[12px] text-[#706473]">
          <span className="font-bold text-[#352637]">
            Đáp án cho {totalBlanks} chỗ trống trong lưu đồ:
          </span>
          {totalBlanks === 0 && (
            <span className="text-[#C0412A] font-medium">Chưa có chỗ trống ___ nào trong lưu đồ.</span>
          )}
        </div>

        {Array.from({ length: totalBlanks }).map((_, idx) => {
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
