import React, { useState } from 'react';
import type { LrAsset, LrGroupState } from '../../../../lib/lr-editor/types.ts';
import { LET } from '../../../../lib/lr-editor/constants.ts';
import ImageUploader from '../../editor-shell/ImageUploader.tsx';
import ConfirmDialog from '../../editor-shell/ConfirmDialog.tsx';
import { uploadSkillImage } from '../../../../lib/exam-editor.ts';

type ModeToggleProps = {
  group: LrGroupState;
  readOnly?: boolean;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

/** Chọn biến thể của Plan/Map/Diagram Labelling. */
export function DiagramModeToggle({ group, readOnly = false, onChange }: ModeToggleProps) {
  const [confirmPending, setConfirmPending] = useState<'labels' | 'letters' | null>(null);
  const letters = group.mode === 'letters';
  const base =
    'px-3 py-1.5 rounded-[9px] text-[13px] font-semibold border border-solid text-left';
  const on = 'bg-white border-[#D6D4D0] shadow-sm text-[#352637]';
  const off = 'border-transparent text-[#706473] hover:text-[#352637]';

  function applyMode(next: 'labels' | 'letters') {
    onChange((g) => {
      if (next === 'letters') {
        g.mode = 'letters';
        if (!g.opts || g.opts.length < 2) g.opts = LET.slice(0, 5).split('');
        if (!g.items) g.items = [];
      } else {
        delete g.mode;
      }
    });
    setConfirmPending(null);
  }

  function handleModeClick(next: 'labels' | 'letters') {
    if (readOnly) return;
    const currentIsLetters = group.mode === 'letters';
    if ((next === 'letters' && currentIsLetters) || (next === 'labels' && !currentIsLetters)) {
      return;
    }

    // Kiểm tra xem kiểu hiện tại có dữ liệu cần cảnh báo hay không (GQ-05)
    let hasData = false;
    if (currentIsLetters) {
      hasData = Boolean(
        (group.opts && group.opts.length > 5) ||
        (group.items &&
          group.items.length > 0 &&
          group.items.some((it) => (it.q && it.q.trim().length > 0) || it.ans != null))
      );
    } else {
      hasData = Boolean(
        (group.marks && group.marks.length > 0) ||
        (group.texts && group.texts.length > 0) ||
        (group.ans &&
          group.ans.length > 0 &&
          group.ans.some(
            (a) => a !== undefined && a !== null && String(a).trim() !== '' && String(a) !== '-1'
          ))
      );
    }

    if (hasData) {
      setConfirmPending(next);
    } else {
      applyMode(next);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[13px] font-bold text-[#352637]">Kiểu hình</div>
      <div className="inline-flex flex-wrap gap-1 p-[3px] rounded-xl bg-[#F3F0EA]">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => handleModeClick('labels')}
          className={`${base} ${!letters ? on : off}`}
        >
          Điền đáp án
        </button>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => handleModeClick('letters')}
          className={`${base} ${letters ? on : off}`}
        >
          Hình có sẵn chữ cái (chọn chữ cho từng câu)
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmPending !== null}
        title={`Đổi kiểu hình sang ${confirmPending === 'letters' ? 'Hình có sẵn chữ cái' : 'Đặt nhãn số lên hình'}?`}
        message="Dữ liệu nhãn và đáp án hiện tại của hình sẽ bị thay đổi. Bạn vẫn có thể hoàn tác sau đó."
        confirmText="Đổi kiểu hình"
        cancelText="Hủy bỏ"
        isDanger={true}
        onConfirm={() => {
          if (confirmPending) applyMode(confirmPending);
        }}
        onCancel={() => setConfirmPending(null)}
      />
    </div>
  );
}

type Props = {
  group: LrGroupState;
  groupStartNum: number;
  readOnly?: boolean;
  skillId?: string;
  onChange: (updater: (draft: LrGroupState) => void) => void;
};

/** Hình đã in sẵn chữ cái A, B, C...; mỗi câu chọn một chữ (giống Matching Features). */
export default function MapLettersCard({
  group,
  groupStartNum,
  readOnly = false,
  skillId,
  onChange,
}: Props) {
  const opts = group.opts && group.opts.length > 0 ? group.opts : [];
  const items = group.items || [];
  const imgAsset: LrAsset | null =
    typeof group.img === 'string'
      ? { path: group.img, url: null, name: group.img.split('/').pop() || 'map.png' }
      : (group.img as LrAsset | null);

  async function handleUpload(file: File) {
    if (!skillId) {
      const asset = { path: file.name, url: URL.createObjectURL(file), name: file.name };
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

  function setLetterCount(n: number) {
    const count = Math.min(12, Math.max(2, n));
    onChange((g) => {
      g.opts = LET.slice(0, count).split('');
      (g.items || []).forEach((it) => {
        if (typeof it.ans === 'number' && it.ans >= count) it.ans = null;
      });
    });
  }

  function updateItem(idx: number, patch: { text?: string; ans?: number | null }) {
    onChange((g) => {
      const it = g.items?.[idx];
      if (!it) return;
      if (patch.text !== undefined) it.text = patch.text;
      if ('ans' in patch) it.ans = patch.ans ?? null;
    });
  }

  const field = readOnly
    ? 'bg-[#F3F0EA] border-0'
    : 'bg-white border border-solid border-[#D6D4D0]';

  return (
    <div className="space-y-4">
      {/* Hình */}
      {!imgAsset?.url && !imgAsset?.path ? (
        <ImageUploader
          label="Tải lên bản đồ / sơ đồ đã có sẵn chữ cái"
          onUpload={handleUpload}
          onRemove={() =>
            onChange((g) => {
              g.img = null;
            })
          }
          disabled={readOnly}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[#4B3D4D]">Hình có sẵn chữ cái</span>
            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onChange((g) => {
                    g.img = null;
                  })
                }
                className="text-[#C0412A] hover:underline font-semibold"
              >
                Đổi hình ảnh khác
              </button>
            )}
          </div>
          <div className="flex justify-center rounded-xl border border-solid border-[#D6D4D0] bg-[#FAF9F5] p-2">
            <img
              src={imgAsset.url || imgAsset.path || ''}
              alt={imgAsset.name}
              className="block max-h-[28rem] max-w-full w-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Số chữ cái */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-[#352637]">Các chữ cái trên hình</span>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={readOnly || opts.length <= 2}
            onClick={() => setLetterCount(opts.length - 1)}
            className="w-8 h-8 rounded-lg border border-solid border-[#D6D4D0] bg-white text-[16px] font-semibold disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-20 text-center text-[14px] font-semibold text-[#352637]">
            A – {LET[opts.length - 1] || 'A'}
          </span>
          <button
            type="button"
            disabled={readOnly || opts.length >= 12}
            onClick={() => setLetterCount(opts.length + 1)}
            className="w-8 h-8 rounded-lg border border-solid border-[#D6D4D0] bg-white text-[16px] font-semibold disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {/* Danh sách câu */}
      <div className="space-y-2.5">
        <div className="text-[13px] font-bold text-[#352637]">
          Các câu hỏi ({items.length}): chọn chữ cái đúng cho từng câu
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-lg bg-[#F3F0EA] text-[13px] font-bold text-[#352637] shrink-0">
              {groupStartNum + idx}
            </span>
            <input
              type="text"
              value={it.text || ''}
              disabled={readOnly}
              onChange={(e) => updateItem(idx, { text: e.target.value })}
              placeholder="Tên địa điểm / nội dung câu hỏi"
              className={`flex-1 min-w-0 h-10 px-3 text-[14px] rounded-xl text-[#352637] focus:outline-none focus:border-[#2963CC] ${field}`}
            />
            <select
              value={typeof it.ans === 'number' ? it.ans : ''}
              disabled={readOnly}
              onChange={(e) =>
                updateItem(idx, { ans: e.target.value === '' ? null : parseInt(e.target.value, 10) })
              }
              className={`w-24 h-10 px-2 text-[14px] rounded-xl font-semibold ${typeof it.ans === 'number'
                ? 'border border-solid border-[#2963CC] bg-[#E3ECFD] text-[#2963CC]'
                : field
                }`}
            >
              <option value="">Chữ…</option>
              {opts.map((_, oIdx) => (
                <option key={oIdx} value={oIdx}>
                  {LET[oIdx]}
                </option>
              ))}
            </select>
            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  onChange((g) => {
                    g.items?.splice(idx, 1);
                  })
                }
                className="p-1.5 text-[#C0412A] hover:bg-[#FDF3F0] rounded-lg shrink-0"
                title="Xóa câu này"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            onClick={() =>
              onChange((g) => {
                if (!g.items) g.items = [];
                g.items.push({ text: '', ans: null });
              })
            }
            className="w-full py-2.5 border border-dashed border-[#B9B2A8] text-[#352637] hover:bg-[#F3F0EA] text-[13px] font-semibold rounded-xl"
          >
            + Thêm câu hỏi
          </button>
        )}
      </div>
    </div>
  );
}
