import React, { useState, useRef, useEffect } from 'react';

export type EditorTopbarProps = {
  examTitle: string;
  examSetTitle?: string;
  mode: 'view' | 'edit';
  onToggleMode: (mode: 'view' | 'edit') => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onPublish: () => void;
  hasIssues: boolean;
  issuesCount: number;
  onOpenIssues: () => void;
  onOpenHistory: () => void;
  onDeleteOrDiscard?: () => void;
  isDraft: boolean;
  canEdit: boolean;
  skillLabel: string;
  formLabel?: string | null;
  totalQuestions: number;
  targetQuestions: number;
  tabs: { label: string; range: string }[];
  activeTab: number;
  onSelectTab: (idx: number) => void;
};

export default function EditorTopbar({
  examTitle,
  examSetTitle,
  mode,
  onToggleMode,
  dirty,
  saving,
  onSave,
  onCancel,
  onPublish,
  hasIssues,
  issuesCount,
  onOpenIssues,
  onOpenHistory,
  onDeleteOrDiscard,
  isDraft,
  canEdit,
  skillLabel,
  formLabel,
  totalQuestions,
  targetQuestions,
  tabs,
  activeTab,
  onSelectTab,
}: EditorTopbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreOpen]);

  const pill =
    'inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold rounded-full border border-solid transition-colors';
  const ghost = `${pill} border-[#D6D4D0] bg-white text-[#352637] hover:bg-[#F3F0EA]`;
  const dark = `${pill} border-[#2A1F2D] bg-[#2A1F2D] text-white hover:bg-[#3D2F40]`;
  const disabledBtn = `${pill} border-transparent bg-[#E5E0D8] text-[#8E8392] cursor-not-allowed`;

  return (
    <div className="bg-[#FAF9F5] border-b border-solid border-[#E5E0D8] px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {/* Tiêu đề */}
      <div className="min-w-0 space-y-2">
        <div>
          {examSetTitle && (
            <div className="text-[13px] text-[#706473] mb-1">
              {examSetTitle} · {skillLabel}
              {formLabel ? ` ${formLabel}` : ''}
            </div>
          )}
          <h1 className="font-serif text-[22px] font-semibold text-[#352637] leading-tight">
            Soạn đề · {examTitle}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {formLabel && (
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#DFF1F4] text-[#104B56]">
              {formLabel}
            </span>
          )}
          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
              mode === 'edit' ? 'bg-[#DCE8FF] text-[#1F4FA8]' : 'bg-[#F3F0EA] text-[#706473]'
            }`}
          >
            {mode === 'edit' ? 'Đang chỉnh sửa' : 'Chỉ xem'}
          </span>
          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
              totalQuestions === targetQuestions
                ? 'bg-[#E3F3E8] text-[#1F6B3A]'
                : 'bg-[#FBEBB0] text-[#5A4300]'
            }`}
          >
            {totalQuestions}/{targetQuestions} câu
          </span>
        </div>
      </div>

      {/* Tab passage / section */}
      <div className="inline-flex items-center gap-1 p-[3px] rounded-xl bg-[#F3F0EA] max-w-full overflow-x-auto self-center">
        {tabs.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectTab(i)}
            className={`px-3.5 py-1.5 rounded-[9px] text-left shrink-0 border border-solid ${
              i === activeTab
                ? 'bg-white border-[#D6D4D0] shadow-sm text-[#352637]'
                : 'border-transparent text-[#706473] hover:text-[#352637]'
            }`}
          >
            <div className="text-[14px] font-semibold leading-tight">{t.label}</div>
            <div className="text-[12px] leading-tight opacity-80">{t.range}</div>
          </button>
        ))}
      </div>

      {/* Nút thao tác */}
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'edit' && (
          <span className="hidden xl:inline text-[13px] text-[#706473] px-1">
            {dirty ? 'Có thay đổi chưa lưu' : 'Chưa có thay đổi'}
          </span>
        )}

        <button type="button" onClick={onOpenHistory} className={ghost}>
          <svg className="w-4 h-4 text-[#706473]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          Lịch sử
        </button>

        {canEdit && mode === 'view' && (
          <button type="button" onClick={() => onToggleMode('edit')} className={ghost}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.83a2 2 0 01-.89.514L7 17l.656-3.938a2 2 0 01.514-.89z" />
            </svg>
            Chỉnh sửa
          </button>
        )}

        {mode === 'edit' && (
          <button
            type="button"
            onClick={onCancel}
            className={`${pill} border-[#C0412A] bg-white text-[#C0412A] hover:bg-[#FDF3F0]`}
          >
            Hủy
          </button>
        )}

        {mode === 'edit' && (
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className={dirty && !saving ? dark : disabledBtn}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu
              </>
            )}
          </button>
        )}

        {isDraft && (
          hasIssues ? (
            <button
              type="button"
              onClick={onOpenIssues}
              className={`${pill} border-[#F2B8B5] bg-[#FDF3F0] text-[#C0412A] hover:bg-[#FCE8E6]`}
            >
              Chưa thể đăng
              <span className="bg-[#C0412A] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                {issuesCount}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={dirty || saving}
              title={dirty ? 'Vui lòng lưu thay đổi trước khi đăng đề' : 'Đăng đề để học viên có thể làm bài'}
              className={!dirty && !saving ? dark : disabledBtn}
            >
              Đăng
            </button>
          )
        )}

        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className="w-9 h-9 inline-flex items-center justify-center text-[#706473] hover:text-[#352637] hover:bg-[#F3F0EA] rounded-full border border-solid border-[#D6D4D0] bg-white transition-colors"
            title="Tùy chọn khác"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-solid border-[#E5E0D8] py-1 z-30">
              <div
                className="px-3.5 py-2.5 flex items-center justify-between text-[13px] text-[#A89CA8] cursor-not-allowed"
                title="Tính năng nhập từ Excel cho Listening và Reading đang được nâng cấp."
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Nhập từ xlsx</span>
                </div>
                <span className="text-[10px] bg-[#F3F0EA] text-[#706473] px-1.5 py-0.5 rounded font-medium">
                  Sắp ra mắt
                </span>
              </div>

              {onDeleteOrDiscard && (
                <>
                  <div className="border-t border-solid border-[#F3F0EA] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      onDeleteOrDiscard();
                    }}
                    className="w-full px-3.5 py-2 text-left text-[13px] text-[#C0412A] hover:bg-[#FDF3F0] flex items-center gap-2 transition-colors font-medium"
                  >
                    {isDraft ? 'Hủy bản nháp này' : 'Xóa kỹ năng này'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
