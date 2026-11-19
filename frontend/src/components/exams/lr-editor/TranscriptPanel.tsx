import React from 'react';
import AutoTextarea from './AutoTextarea.tsx';
import type { ExplainRow } from '../../../lib/exams/lr-editor/explain.ts';
import type { LrEditorState, LrPassageState } from '../../../lib/exams/lr-editor/types.ts';

export type TranscriptPanelProps = {
  ex: LrEditorState;
  activePassageIndex: number;
  onSelectPassage?: (idx: number) => void;
  audioSlot?: React.ReactNode;
  explain?: {
    rows: ExplainRow[];
    selected: ExplainRow | null;
    onSelectPara: (paraIdx: number) => void;
    onSelectQuestion: (rowIdx: number) => void;
  };
  readOnly?: boolean;
  onSeekAudio?: (sec: number) => void;
  onChangePassage: (updater: (draft: LrPassageState) => void) => void;
  onOpenTranscribeModal?: () => void;
};

function parseLine(raw: string): { timeTag: string; sec: number | null; text: string } {
  const match = raw.match(/^\s*\[(\d{1,2}):(\d{2})\]\s*(.*)$/);
  if (match) {
    const m = parseInt(match[1], 10);
    const s = parseInt(match[2], 10);
    return {
      timeTag: `[${match[1].padStart(2, '0')}:${match[2]}]`,
      sec: m * 60 + s,
      text: match[3],
    };
  }
  return { timeTag: '', sec: null, text: raw };
}

export default function TranscriptPanel({
  ex,
  activePassageIndex,
  audioSlot,
  explain,
  readOnly = false,
  onSeekAudio,
  onChangePassage,
  onOpenTranscribeModal,
}: TranscriptPanelProps) {
  const passages = ex.passages || [];
  const currentPassage = passages[activePassageIndex] || {
    orderNo: activePassageIndex + 1,
    title: '',
    paras: [],
    audio: null,
    imgs: [],
    groups: [],
  };

  const paras = currentPassage.paras || [];

  function updateTitle(title: string) {
    onChangePassage((p) => {
      p.title = title;
    });
  }

  function updateLine(idx: number, fullLine: string) {
    onChangePassage((p) => {
      p.paras[idx] = fullLine;
    });
  }

  function addLine() {
    onChangePassage((p) => {
      p.paras.push('[00:00] SPEAKER: New dialogue...');
    });
  }

  function removeLine(idx: number) {
    onChangePassage((p) => {
      p.paras.splice(idx, 1);
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#FAF9F5]">
      {/* Transcript Header & Title */}
      <div className="px-5 py-4 space-y-4 flex-1 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl border border-solid border-[#E5E0D8] space-y-2.5">
          <div className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">
            Bối cảnh
          </div>
          <input
            type="text"
            value={currentPassage.title || ''}
            disabled={readOnly}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Ví dụ: Booking a holiday cottage"
            className={`w-full font-serif text-[20px] font-semibold h-11 px-3 rounded-xl text-[#352637] placeholder-[#A89CA8] focus:outline-none focus:border-[#2963CC] ${
              readOnly ? 'bg-[#F3F0EA] border-0' : 'bg-white border border-solid border-[#D6D4D0]'
            }`}
          />
        </div>

        {audioSlot}

        {/* Toolbar: Speech-to-text AI & count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[13px] font-bold uppercase tracking-wide text-[#352637]">
            Transcript · {paras.length} đoạn
          </span>

          {!readOnly && !explain && onOpenTranscribeModal && (
            <button
              type="button"
              onClick={onOpenTranscribeModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold bg-[#F3F0EA] text-[#352637] hover:bg-[#E5E0D8] rounded-full transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              Tạo transcript từ ghi âm
            </button>
          )}
        </div>

        {/* Transcript lines */}
        <div className="space-y-2">
          {paras.map((rawLine, idx) => {
            const { timeTag, sec, text } = parseLine(rawLine);

            const linked = explain ? explain.rows.filter((r) => r.para === idx) : [];
            const isSel = explain?.selected?.para === idx;
            return (
              <div
                key={idx}
                onClick={() => explain?.selected && explain.onSelectPara(idx)}
                className={`${explain ? 'cursor-pointer ' : ''}${isSel ? 'border-[#2963CC] ' : 'border-[#E5E0D8] '}bg-white p-3 rounded-2xl border border-solid flex items-start gap-2.5 group`}
              >
                {/* Timestamp chip */}
                {timeTag ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (sec != null && onSeekAudio) onSeekAudio(sec);
                    }}
                    className="font-mono text-[11px] font-bold text-[#1F4FA8] bg-[#DCE8FF] hover:bg-[#C6D8FA] px-2 py-1 rounded-md shrink-0 transition-colors"
                    title="Nhấp để phát từ mốc thời gian này"
                  >
                    {timeTag}
                  </button>
                ) : (
                  <span className="font-mono text-[11px] text-[#A89CA8] bg-[#F3F0EA] px-2 py-1 rounded-md shrink-0">
                    --:--
                  </span>
                )}

                <AutoTextarea
                  readOnly={!!explain}
                  value={rawLine}
                  disabled={readOnly}
                  onChange={(e) => updateLine(idx, e.target.value)}
                  placeholder="[00:00] SPEAKER: Text..."
                  className="flex-1 text-[12px] font-sans border-0 p-0 text-[#352637] focus:ring-0 focus:outline-hidden leading-relaxed resize-none"
                />

                {explain && linked.length > 0 && (
                  <span className="shrink-0 text-[12px] font-semibold text-[#2963CC]">
                    {linked.map((r) => `Câu ${r.n}`).join(', ')}
                  </span>
                )}
                {!readOnly && !explain && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-[#A89CA8] hover:text-[#C0412A] font-bold text-[14px] p-1 shrink-0"
                    title="Xóa dòng này"
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}

          {!readOnly && !explain && (
            <button
              type="button"
              onClick={addLine}
              className="w-full py-2 border border-dashed border-[#B9B2A8] text-[#4B3D4D] text-[13px] font-semibold rounded-2xl hover:bg-[#F3F0EA] transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm dòng transcript
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
