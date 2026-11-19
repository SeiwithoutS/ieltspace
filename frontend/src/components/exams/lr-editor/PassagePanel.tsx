import React, { useState } from 'react';
import type { LrEditorState, LrPassageState } from '../../../lib/lr-editor/types.ts';
import { LET } from '../../../lib/lr-editor/constants.ts';
import type { ExplainRow } from '../../../lib/lr-editor/explain.ts';
import AutoTextarea from './AutoTextarea.tsx';
import ImageUploader from '../editor-shell/ImageUploader.tsx';
import { uploadSkillImage } from '../../../lib/exam-editor.ts';

export type PassagePanelProps = {
  ex: LrEditorState;
  activePassageIndex: number;
  onSelectPassage?: (idx: number) => void;
  readOnly?: boolean;
  skillId?: string;
  onChangePassage: (updater: (draft: LrPassageState) => void) => void;
  /** Có giá trị khi tab Giải thích đang mở: đoạn văn chuyển sang chế độ chọn đoạn / bôi key phrase. */
  explain?: {
    rows: ExplainRow[];
    selected: ExplainRow | null;
    onSelectPara: (paraIdx: number) => void;
    onAddKey: (text: string) => void;
    onSelectQuestion: (rowIdx: number) => void;
  };
};

export default function PassagePanel({
  ex,
  activePassageIndex,
  readOnly = false,
  skillId,
  onChangePassage,
  explain,
}: PassagePanelProps) {
  const passages = ex.passages || [];
  const currentPassage = passages[activePassageIndex] || {
    orderNo: activePassageIndex + 1,
    title: '',
    paras: ['', '', ''],
    audio: null,
    imgs: [],
    groups: [],
  };

  const paras = currentPassage.paras || [];
  const imgs = currentPassage.imgs || [];

  function updateTitle(title: string) {
    onChangePassage((p) => {
      p.title = title;
    });
  }

  function updatePara(idx: number, text: string) {
    onChangePassage((p) => {
      p.paras[idx] = text;
    });
  }

  function addPara() {
    onChangePassage((p) => {
      p.paras.push('');
    });
  }

  function removePara(idx: number) {
    if (paras.length <= 1) return;
    onChangePassage((p) => {
      p.paras.splice(idx, 1);
      // Update image attachments
      p.imgs.forEach((im) => {
        if (im.after >= idx) {
          im.after = Math.max(0, im.after - 1);
        }
      });
    });
  }

  function movePara(idx: number, delta: number) {
    onChangePassage((p) => {
      const target = idx + delta;
      if (target < 0 || target >= p.paras.length) return;
      const temp = p.paras[idx];
      p.paras[idx] = p.paras[target];
      p.paras[target] = temp;
    });
  }

  async function handleAddImage(file: File) {
    if (!skillId) {
      const url = URL.createObjectURL(file);
      const asset = { path: file.name, url, name: file.name };
      onChangePassage((p) => {
        p.imgs.push({ ...asset, after: 0 });
      });
      return asset;
    }
    const uploaded = await uploadSkillImage(skillId, file);
    const asset = { path: uploaded.path, url: uploaded.url, name: file.name };
    onChangePassage((p) => {
      p.imgs.push({ ...asset, after: 0 });
    });
    return asset;
  }

  function removeImage(imgIdx: number) {
    onChangePassage((p) => {
      p.imgs.splice(imgIdx, 1);
    });
  }

  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  function applyPaste() {
    const parts = pasteText
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      onChangePassage((p) => {
        p.paras = parts;
      });
    }
    setPasteText('');
    setPasteOpen(false);
  }

  function renderHighlighted(text: string, keys: string[]) {
    const ks = keys.filter(Boolean);
    if (ks.length === 0) return text;
    const esc = ks.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${esc.join('|')})`, 'gi');
    return text.split(re).map((part, i) =>
      ks.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
        <mark key={i} className="bg-[#FBEBB0] text-inherit rounded px-0.5">
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  }

  const iconBtn =
    'p-1 text-[#706473] hover:text-[#352637] disabled:opacity-30 rounded hover:bg-[#F3F0EA]';

  return (
    <div className="flex flex-col h-full bg-[#FAF9F5]">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Tiêu đề và hình */}
        <div className="bg-white p-4 rounded-2xl border border-solid border-[#E5E0D8] space-y-3">
          <div className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">
            Tiêu đề và hình
          </div>
          <input
            type="text"
            value={currentPassage.title || ''}
            disabled={readOnly}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Ví dụ: The History of Glass"
            className={`w-full font-serif text-[20px] font-semibold h-11 px-3 rounded-xl text-[#352637] placeholder-[#A89CA8] focus:outline-none focus:border-[#2963CC] ${
              readOnly
                ? 'bg-[#F3F0EA] border-0'
                : 'bg-white border border-solid border-[#D6D4D0]'
            }`}
          />

          {imgs.map((im, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl border border-solid border-[#E5E0D8] p-2.5"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={im.url || im.path || ''}
                  alt={im.name}
                  className="w-10 h-10 object-cover rounded-lg border border-solid border-[#E5E0D8]"
                />
                <div className="truncate">
                  <span className="text-[13px] font-medium text-[#352637] block truncate">{im.name}</span>
                  <span className="text-[11px] text-[#706473]">
                    {im.caption ? `Chú thích: ${im.caption}` : 'Hình minh họa bài đọc'}
                  </span>
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-[#C0412A] hover:bg-[#FDF3F0] p-1.5 rounded text-[12px] font-semibold shrink-0"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}

          {!readOnly && imgs.length === 0 && (
            <ImageUploader
              label="Thêm hình"
              onUpload={handleAddImage}
              onRemove={() => {}}
              disabled={readOnly}
            />
          )}
        </div>

        {/* Các đoạn */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">
              Các đoạn · {paras.length} đoạn
            </span>
            {!readOnly && !explain && (
              <button
                type="button"
                onClick={() => setPasteOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4B3D4D] hover:text-[#2963CC]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Dán cả bài
              </button>
            )}
          </div>

          {pasteOpen && !readOnly && !explain && (
            <div className="bg-white p-3 rounded-2xl border border-solid border-[#E5E0D8] space-y-2">
              <p className="text-[12px] text-[#706473]">
                Dán toàn bộ bài đọc; mỗi đoạn cách nhau một dòng trống. Nội dung hiện tại sẽ được thay thế.
              </p>
              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full text-[14px] p-3 rounded-xl border border-solid border-[#D6D4D0] focus:outline-none focus:border-[#2963CC]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasteOpen(false)}
                  className="h-9 px-4 rounded-full border border-solid border-[#D6D4D0] bg-white text-[13px] font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={applyPaste}
                  className="h-9 px-4 rounded-full bg-[#2A1F2D] text-white text-[13px] font-semibold"
                >
                  Tách đoạn
                </button>
              </div>
            </div>
          )}

          {explain && (
            <div className="rounded-xl bg-[#EFEBE3] px-3.5 py-2.5 text-[13px] text-[#4B3D4D] leading-relaxed">
              {explain.selected
                ? `Câu ${explain.selected.n}: bấm vào một đoạn để gán làm đoạn chứa đáp án; bôi đen chữ trong đoạn để thêm key phrase.`
                : 'Chọn một câu ở cột phải rồi bấm vào đoạn chứa đáp án.'}
            </div>
          )}

          {paras.map((text, idx) => {
            const label = LET[idx] || String(idx + 1);
            const linked = explain ? explain.rows.filter((r) => r.para === idx) : [];
            const isSel = explain?.selected?.para === idx;

            if (explain) {
              return (
                <div
                  key={idx}
                  onClick={() => !readOnly && explain.selected && explain.onSelectPara(idx)}
                  onMouseUp={() => {
                    if (readOnly || !explain.selected) return;
                    const t = window.getSelection()?.toString().trim() ?? '';
                    if (t && t.length <= 160 && text.toLowerCase().includes(t.toLowerCase())) {
                      explain.onAddKey(t);
                    }
                  }}
                  className={`flex gap-3 p-3.5 rounded-2xl bg-white cursor-pointer border border-solid ${
                    isSel ? 'border-[#2963CC] border-[1.5px]' : 'border-[#E5E0D8]'
                  }`}
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold ${
                      isSel ? 'bg-[#2963CC] text-white' : 'bg-[#F3F0EA] text-[#352637]'
                    }`}
                  >
                    {label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-relaxed text-[#352637] whitespace-pre-wrap">
                      {renderHighlighted(text, explain.selected && isSel ? explain.selected.keys : linked.flatMap((r) => r.keys))}
                    </p>
                    {linked.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-3">
                        {linked.map((r) => (
                          <button
                            key={`${r.gIdx}-${r.k}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              explain.onSelectQuestion(explain.rows.indexOf(r));
                            }}
                            className="text-[13px] font-semibold text-[#2963CC] hover:underline"
                          >
                            Đáp án câu {r.n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="flex gap-3 p-3.5 rounded-2xl bg-white border border-solid border-[#E5E0D8]"
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F3F0EA] text-[#352637] text-[13px] font-bold">
                    {label}
                  </span>
                  {!readOnly && (
                    <>
                      <button type="button" onClick={() => movePara(idx, -1)} disabled={idx === 0} className={iconBtn} title="Di chuyển lên">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => movePara(idx, 1)} disabled={idx === paras.length - 1} className={iconBtn} title="Di chuyển xuống">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {paras.length > 1 && (
                        <button type="button" onClick={() => removePara(idx)} className="p-1 text-[#C0412A] hover:bg-[#FDF3F0] rounded" title="Xóa đoạn này">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
                <AutoTextarea
                  value={text}
                  disabled={readOnly}
                  onChange={(e) => updatePara(idx, e.target.value)}
                  placeholder={`Nhập nội dung cho đoạn ${label}...`}
                  className={`flex-1 min-w-0 text-[15px] rounded-xl p-3 text-[#352637] placeholder-[#A89CA8] leading-relaxed focus:outline-none focus:border-[#2963CC] ${
                    readOnly
                      ? 'bg-[#F3F0EA] border-0'
                      : 'bg-white border border-solid border-[#D6D4D0]'
                  }`}
                />
              </div>
            );
          })}

          {!readOnly && !explain && (
            <button
              type="button"
              onClick={addPara}
              className="w-full py-2.5 border border-dashed border-[#B9B2A8] text-[#4B3D4D] text-[13px] font-semibold rounded-2xl hover:bg-[#F3F0EA] transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm đoạn văn mới (Đoạn {LET[paras.length] || String(paras.length + 1)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
