import React from 'react';
import type { LrGroupState, LrPassageState } from '../../../../lib/lr-editor/types.ts';
import { blanks, limOf, normTbl, overLimit, parseAlt, tblCells, tblOf } from '../../../../lib/lr-editor/pure.ts';
import { LIM } from '../../../../lib/lr-editor/constants.ts';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function TableCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  onChange,
}: CardProps) {
  const tbl = tblOf(group);
  const rows = tbl.rows;
  const hd = tbl.hd;
  const sp = tbl.sp;
  const cov = tbl.cov;
  const nr = tbl.nr;
  const nc = tbl.nc;
  const li = limOf(group);

  const cells = tblCells(group);
  const totalBlanks = cells.reduce((acc, c) => acc + blanks(c), 0);
  const ansList = group.ans || [];
  const altList = group.alt || [];
  const expList = group.exp || [];

  function updateTitle(title: string) {
    onChange((g) => {
      g.title = title;
    });
  }

  function updateCell(r: number, c: number, text: string) {
    onChange((g) => {
      normTbl(g);
      if (g.rows && g.rows[r]) {
        g.rows[r][c] = text;
      }
    });
  }

  function toggleHeader(r: number, c: number) {
    if (readOnly) return;
    onChange((g) => {
      normTbl(g);
      if (g.hd && g.hd[r]) {
        g.hd[r][c] = !g.hd[r][c];
      }
    });
  }

  function toggleSpan(r: number, c: number) {
    if (readOnly) return;
    onChange((g) => {
      normTbl(g);
      if (g.sp && g.sp[r]) {
        const current = g.sp[r][c];
        if (current && Array.isArray(current) && current[1] > 1) {
          g.sp[r][c] = 0;
        } else if (c + 1 < nc) {
          g.sp[r][c] = [1, 2];
        }
      }
    });
  }

  function addRow() {
    onChange((g) => {
      normTbl(g);
      const newRow = Array.from({ length: nc }).map(() => '');
      const newHdRow = Array.from({ length: nc }).map(() => false);
      const newSpRow: Array<[number, number] | 0> = Array.from({ length: nc }).map(() => 0);
      g.rows?.push(newRow);
      g.hd?.push(newHdRow);
      g.sp?.push(newSpRow);
    });
  }

  function removeRow(r: number) {
    if (nr <= 1) return;
    onChange((g) => {
      normTbl(g);
      g.rows?.splice(r, 1);
      g.hd?.splice(r, 1);
      g.sp?.splice(r, 1);
    });
  }

  function addColumn() {
    onChange((g) => {
      normTbl(g);
      g.rows?.forEach((row) => row.push(''));
      g.hd?.forEach((row) => row.push(false));
      g.sp?.forEach((row) => row.push(0));
    });
  }

  function removeColumn(c: number) {
    if (nc <= 1) return;
    onChange((g) => {
      normTbl(g);
      g.rows?.forEach((row) => row.splice(c, 1));
      g.hd?.forEach((row) => row.splice(c, 1));
      g.sp?.forEach((row) => row.splice(c, 1));
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
      {/* Title & Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF9F7] p-3 rounded-xl border border-[#E5E0D8]">
        <div>
          <label className="block text-[11px] font-semibold text-[#706473] mb-1">
            Tiêu đề bảng (tùy chọn)
          </label>
          <input
            type="text"
            value={group.title || ''}
            disabled={readOnly}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Ví dụ: Table 1: Population changes"
            className="w-full text-[13px] h-8 px-2.5 rounded-lg border border-[#D6D4D0] bg-white text-[#352637] focus:outline-hidden focus:border-[#2963CC]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#706473] mb-1">Giới hạn từ</label>
          <select
            value={li >= 0 ? li : 2}
            disabled={readOnly}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange((g) => {
                g.limit = val;
              });
            }}
            className="w-full text-[12px] h-8 px-2.5 rounded-lg border border-[#D6D4D0] bg-white text-[#352637] font-medium focus:outline-hidden"
          >
            {LIM.map((label, idx) => (
              <option key={idx} value={idx}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Table Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[12px] font-bold text-[#4B3D4D]">
            Bảng câu hỏi ({nr} dòng &times; {nc} cột):
          </label>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addRow}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#D6D4D0] rounded-md hover:bg-[#F3F0EA] text-[#352637]"
              >
                + Thêm dòng
              </button>
              <button
                type="button"
                onClick={addColumn}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-[#D6D4D0] rounded-md hover:bg-[#F3F0EA] text-[#352637]"
              >
                + Thêm cột
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-[#D6D4D0] rounded-xl bg-white shadow-2xs">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-b border-[#E5E0D8] last:border-b-0">
                  {row.map((val, c) => {
                    if (cov[r][c]) return null;
                    const isHeader = hd[r][c];
                    const spanVal = sp[r][c];
                    const colSpan = spanVal && Array.isArray(spanVal) ? spanVal[1] : 1;
                    const rowSpan = spanVal && Array.isArray(spanVal) ? spanVal[0] : 1;

                    return (
                      <td
                        key={c}
                        colSpan={colSpan}
                        rowSpan={rowSpan}
                        className={`p-2 border-r border-[#E5E0D8] last:border-r-0 relative group align-top ${
                          isHeader ? 'bg-[#F8F9FA] font-semibold' : 'bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <textarea
                            rows={2}
                            value={val}
                            disabled={readOnly}
                            onChange={(e) => updateCell(r, c, e.target.value)}
                            placeholder="Nhập chữ hoặc ___..."
                            className="w-full text-[12px] p-1.5 border border-transparent rounded hover:border-[#D6D4D0] focus:border-[#2963CC] focus:bg-white bg-transparent resize-none focus:outline-hidden"
                          />

                          {!readOnly && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#706473]">
                              <button
                                type="button"
                                onClick={() => toggleHeader(r, c)}
                                className={`px-1 rounded ${
                                  isHeader ? 'bg-[#2963CC] text-white' : 'bg-[#E5E0D8]'
                                }`}
                              >
                                Header
                              </button>
                              {nc > 1 && (
                                <button
                                  type="button"
                                  onClick={() => toggleSpan(r, c)}
                                  className={`px-1 rounded ${
                                    colSpan > 1 ? 'bg-[#2A1F2D] text-white' : 'bg-[#E5E0D8]'
                                  }`}
                                >
                                  Gộp cột
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {!readOnly && nr > 1 && (
                    <td className="w-8 p-1 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => removeRow(r)}
                        className="text-[#A89CA8] hover:text-[#C0412A] font-bold text-[14px]"
                        title="Xóa dòng này"
                      >
                        &times;
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Slots */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[12px] text-[#706473]">
          <span className="font-bold text-[#352637]">
            Đáp án cho {totalBlanks} chỗ trống trong bảng:
          </span>
          {totalBlanks === 0 && (
            <span className="text-[#C0412A] font-medium">Bảng chưa chứa chỗ trống ___ nào.</span>
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
                    placeholder="Ví dụ: vessels, small vessels"
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
