import React, { useRef, useState } from 'react';
import type { LrAsset, LrGroupState, LrPassageState } from '../../../../lib/exams/lr-editor/types.ts';
import { limOf, overLimit, parseAlt } from '../../../../lib/exams/lr-editor/pure.ts';
import { LIM } from '../../../../lib/exams/lr-editor/constants.ts';
import MapLettersCard, { DiagramModeToggle } from './MapLettersCard.tsx';
import ImageUploader from '../../editor-shell/ImageUploader.tsx';
import { uploadSkillImage } from '../../../../lib/exams/exam-editor.ts';

export type CardProps = {
  group: LrGroupState;
  passage: LrPassageState;
  passageIndex: number;
  groupStartNum: number;
  readOnly?: boolean;
  skillId?: string;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

export default function DiagramCard({
  group,
  passage,
  groupStartNum,
  readOnly = false,
  skillId,
  onChange,
}: CardProps) {
  const imgBoxRef = useRef<HTMLDivElement>(null);
  const marks = group.marks || [];
  const texts = group.texts || [];
  const ansList = group.ans || [];
  const altList = group.alt || [];
  const expList = group.exp || [];
  const li = limOf(group);

  const imgAsset: LrAsset | null =
    typeof group.img === 'string'
      ? { path: group.img, url: null, name: group.img.split('/').pop() || 'diagram.png' }
      : (group.img as LrAsset | null);

  async function handleImageUpload(file: File) {
    if (!skillId) {
      // Local preview if skillId not yet set
      const url = URL.createObjectURL(file);
      const asset = { path: file.name, url, name: file.name };
      onChange((g) => {
        g.img = asset;
      });
      return asset;
    }
    const uploaded = await uploadSkillImage(skillId, file);
    const asset = { path: uploaded.path, url: uploaded.url, name: file.name };
    onChange((g) => {
      g.img = asset;
    });
    return asset;
  }

  function handleImageRemove() {
    onChange((g) => {
      g.img = null;
    });
  }

  type Pt = { lx: number; ly: number; tx: number; ty: number };
  const [drag, setDrag] = useState<{ idx: number; part: 'label' | 'tip'; pos: [number, number] } | null>(null);

  function readMark(m: unknown): Pt {
    if (Array.isArray(m)) {
      if (m.length >= 4) return { lx: m[0], ly: m[1], tx: m[2], ty: m[3] };
      return { lx: m[0], ly: m[1], tx: m[0], ty: m[1] };
    }
    const o = m as { x: number; y: number };
    return { lx: o.x, ly: o.y, tx: o.x, ty: o.y };
  }

  function pctFromEvent(e: { clientX: number; clientY: number }): [number, number] | null {
    const el = imgBoxRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, Math.round(((e.clientX - r.left) / r.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((e.clientY - r.top) / r.height) * 100)));
    return [x, y];
  }

  // bấm lên hình: đặt đầu mũi tên tại điểm bấm, nhãn số nằm lệch một đoạn (kéo được)
  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (readOnly || drag) return;
    const pt = pctFromEvent(e);
    if (!pt) return;
    const [x, y] = pt;
    const lx = Math.min(96, Math.max(4, x + 10));
    const ly = Math.min(96, Math.max(4, y - 10));
    onChange((g) => {
      if (!g.marks) g.marks = [];
      if (!g.texts) g.texts = [];
      if (!g.ans) g.ans = [];
      g.marks.push([lx, ly, x, y]);
      g.texts.push('');
      g.ans.push('');
    });
  }

  function startDrag(e: React.PointerEvent, idx: number, part: 'label' | 'tip') {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = readMark(marks[idx]);
    setDrag({ idx, part, pos: part === 'label' ? [p.lx, p.ly] : [p.tx, p.ty] });
  }

  function moveDrag(e: React.PointerEvent) {
    if (!drag) return;
    const pt = pctFromEvent(e);
    if (pt) setDrag({ ...drag, pos: pt });
  }

  function endDrag() {
    if (!drag) return;
    const { idx, part, pos } = drag;
    setDrag(null);
    onChange((g) => {
      if (!g.marks) return;
      const cur = readMark(g.marks[idx]);
      g.marks[idx] =
        part === 'label' ? [pos[0], pos[1], cur.tx, cur.ty] : [cur.lx, cur.ly, pos[0], pos[1]];
    });
  }

  function removeMark(idx: number) {
    onChange((g) => {
      if (!g.marks) return;
      g.marks.splice(idx, 1);
      g.texts?.splice(idx, 1);
      g.ans?.splice(idx, 1);
      g.alt?.splice(idx, 1);
      g.exp?.splice(idx, 1);
    });
  }

  function updateText(idx: number, val: string) {
    onChange((g) => {
      if (!g.texts) g.texts = [];
      g.texts[idx] = val;
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

  if (group.mode === 'letters') {
    return (
      <div className="space-y-4">
        <DiagramModeToggle group={group} readOnly={readOnly} onChange={onChange} />
        <MapLettersCard
          group={group}
          groupStartNum={groupStartNum}
          readOnly={readOnly}
          skillId={skillId}
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DiagramModeToggle group={group} readOnly={readOnly} onChange={onChange} />

      {/* Limit Selector */}
      <div className="flex items-center justify-between bg-[#FAF9F7] px-3.5 py-2.5 rounded-xl border border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#706473]">Giới hạn từ:</span>
          <select
            value={li >= 0 ? li : 2}
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

        <span className="text-[12px] text-[#706473]">
          Tổng số nhãn: <span className="font-semibold text-[#352637]">{marks.length}</span>
        </span>
      </div>

      {/* Image Uploader & Interactive Marking Canvas */}
      {!imgAsset?.url && !imgAsset?.path ? (
        <ImageUploader
          label="Tải lên sơ đồ / bản đồ (Diagram/Map Image)"
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          disabled={readOnly}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[#4B3D4D]">
              Bấm lên hình để đặt nhãn số và mũi tên; kéo nhãn hoặc đầu mũi tên để chỉnh:
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={handleImageRemove}
                className="text-[#C0412A] hover:underline font-semibold"
              >
                Đổi hình ảnh khác
              </button>
            )}
          </div>

          <div className="flex justify-center rounded-xl border border-solid border-[#D6D4D0] bg-[#FAF9F5] p-2">
            <div
              ref={imgBoxRef}
              onClick={handleImageClick}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              className={`relative inline-block max-w-full select-none ${readOnly ? '' : 'cursor-crosshair'}`}
            >
              <img
                src={imgAsset.url || imgAsset.path || ''}
                alt={imgAsset.name}
                draggable={false}
                className="block max-h-[28rem] max-w-full w-auto rounded-lg pointer-events-none"
              />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <marker id="dg-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 z" fill="#2A1F2D" />
                  </marker>
                </defs>
                {marks.map((m, idx) => {
                  const p = readMark(m);
                  const lx = drag?.idx === idx && drag.part === 'label' ? drag.pos[0] : p.lx;
                  const ly = drag?.idx === idx && drag.part === 'label' ? drag.pos[1] : p.ly;
                  const tx = drag?.idx === idx && drag.part === 'tip' ? drag.pos[0] : p.tx;
                  const ty = drag?.idx === idx && drag.part === 'tip' ? drag.pos[1] : p.ty;
                  if (lx === tx && ly === ty) return null;
                  return (
                    <line
                      key={idx}
                      x1={lx}
                      y1={ly}
                      x2={tx}
                      y2={ty}
                      stroke="#2A1F2D"
                      strokeWidth={0.5}
                      markerEnd="url(#dg-arrow)"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>

              {marks.map((m, idx) => {
                const qNum = groupStartNum + idx;
                const p = readMark(m);
                const lx = drag?.idx === idx && drag.part === 'label' ? drag.pos[0] : p.lx;
                const ly = drag?.idx === idx && drag.part === 'label' ? drag.pos[1] : p.ly;
                const tx = drag?.idx === idx && drag.part === 'tip' ? drag.pos[0] : p.tx;
                const ty = drag?.idx === idx && drag.part === 'tip' ? drag.pos[1] : p.ty;
                return (
                  <React.Fragment key={idx}>
                    {!readOnly && (
                      <div
                        style={{ left: `${tx}%`, top: `${ty}%` }}
                        onPointerDown={(e) => startDrag(e, idx, 'tip')}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-solid border-[#2A1F2D] cursor-grab touch-none"
                        title="Kéo để đổi đầu mũi tên"
                      />
                    )}
                    <div
                      style={{ left: `${lx}%`, top: `${ly}%` }}
                      onPointerDown={(e) => startDrag(e, idx, 'label')}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center min-w-7 h-7 px-1 rounded-full bg-[#2A1F2D] text-white text-[12px] font-bold shadow-md border-2 border-solid border-white touch-none ${readOnly ? '' : 'cursor-grab'}`}
                      title={`Câu ${qNum}`}
                    >
                      {qNum}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Labels List */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-[12px] font-bold text-[#352637]">
          Danh sách nhãn và đáp án ({marks.length} câu hỏi):
        </label>

        {marks.map((m, idx) => {
          const qNum = groupStartNum + idx;
          const x = Array.isArray(m) ? m[0] : (m as { x: number }).x;
          const y = Array.isArray(m) ? m[1] : (m as { y: number }).y;
          const textVal = texts[idx] || '';
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#F3F0EA] text-[#352637] text-[11px] font-bold shrink-0">
                    {qNum}
                  </span>
                  <span className="text-[12px] font-semibold text-[#352637]">
                    Nhãn tại {x}%, {y}%
                  </span>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeMark(idx)}
                    className="text-[#C0412A] hover:bg-[#FDF3F0] p-1 rounded font-bold text-[12px]"
                    title="Xóa điểm đánh dấu này"
                  >
                    &times; Xóa điểm
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#706473] mb-0.5">
                  Mô tả / Nhãn hiển thị bên cạnh điểm
                </label>
                <input
                  type="text"
                  value={textVal}
                  disabled={readOnly}
                  onChange={(e) => updateText(idx, e.target.value)}
                  placeholder="Ví dụ: Sand, soda and lime are fed through a ___"
                  className="w-full text-[13px] h-8 px-2.5 rounded-lg border border-[#D6D4D0] text-[#352637] focus:outline-hidden focus:border-[#2963CC]"
                />
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
                    placeholder="Ví dụ: 1500, tin"
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
