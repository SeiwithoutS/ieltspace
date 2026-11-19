import React, { useEffect } from 'react';
import type { LrQuestionType } from '../../../lib/lr-editor/types.ts';
import { typeName } from '../../../lib/lr-editor/constants.ts';

export type TypePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LrQuestionType) => void;
  allowedTypes?: LrQuestionType[];
  isReading?: boolean;
};

type GroupedTypeCategory = {
  name: string;
  types: Array<{ type: LrQuestionType; desc: string }>;
};

const CATEGORIES: GroupedTypeCategory[] = [
  {
    name: '1. Điền từ (Completion)',
    types: [
      { type: 'SENTENCE_COMP', desc: 'Hoàn thành câu bằng từ trong bài đọc/nghe' },
      { type: 'SHORT_ANSWER', desc: 'Trả lời câu hỏi ngắn theo giới hạn từ' },
    ],
  },
  {
    name: '2. Tóm tắt & Ghi chú (Summary & Notes)',
    types: [
      { type: 'SUMMARY_COMP', desc: 'Điền từ trực tiếp từ bài vào đoạn tóm tắt' },
      { type: 'NOTE_COMP', desc: 'Điền từ vào biểu mẫu hoặc dàn ý ghi chú' },
      { type: 'SUMMARY_BOX', desc: 'Chọn từ trong khung từ vựng cho sẵn (Wordlist)' },
    ],
  },
  {
    name: '3. Bảng biểu & Sơ đồ quy trình (Tables & Charts)',
    types: [
      { type: 'TABLE_COMP', desc: 'Điền thông tin vào các ô trong bảng' },
      { type: 'FLOW_COMP', desc: 'Hoàn thành các bước trong lưu đồ quy trình' },
    ],
  },
  {
    name: '4. Hình ảnh & Bản đồ (Diagram Labelling)',
    types: [
      { type: 'DIAGRAM_COMP', desc: 'Gắn nhãn các vị trí trên sơ đồ hoặc bản đồ' },
    ],
  },
  {
    name: '5. Ghép thông tin (Matching)',
    types: [
      { type: 'MATCH_HEADING', desc: 'Ghép tiêu đề phù hợp cho từng đoạn văn' },
      { type: 'MATCH_INFO', desc: 'Xác định đoạn văn chứa thông tin cụ thể' },
      { type: 'MATCH_FEATURE', desc: 'Ghép nhận định với nhân vật / đặc điểm' },
      { type: 'MATCH_ENDING', desc: 'Ghép nửa đầu câu với phần kết phù hợp' },
    ],
  },
  {
    name: '6. Trắc nghiệm (Multiple Choice)',
    types: [
      { type: 'MCQ_SINGLE', desc: 'Chọn 1 đáp án đúng duy nhất (A, B, C hoặc D)' },
      { type: 'MCQ_MULTI', desc: 'Chọn nhiều đáp án đúng (tính nhiều câu hỏi)' },
    ],
  },
  {
    name: '7. Nhận định (Identifying Information / Views)',
    types: [
      { type: 'TFNG', desc: 'Xác định thông tin đúng, sai hay không đề cập' },
      { type: 'YNNG', desc: 'Xác định quan điểm của tác giả (YES / NO / NOT GIVEN)' },
    ],
  },
];

export default function TypePicker({
  isOpen,
  onClose,
  onSelectType,
  allowedTypes,
  isReading = true,
}: TypePickerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in-50 duration-150">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E0D8] space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3F0EA]">
          <div>
            <h3 className="text-[17px] font-bold text-[#352637]">Chọn dạng câu hỏi cần thêm</h3>
            <p className="text-[12px] text-[#706473]">
              16 dạng câu hỏi tiêu chuẩn Cambridge IELTS
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A89CA8] hover:text-[#352637] font-bold text-[20px] p-1"
          >
            &times;
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {CATEGORIES.map((cat, cIdx) => {
            const availableTypes = cat.types.filter(
              (t) => !allowedTypes || allowedTypes.includes(t.type)
            );
            if (availableTypes.length === 0) return null;

            return (
              <div key={cIdx} className="space-y-2">
                <span className="text-[11px] font-bold text-[#706473] uppercase tracking-wider block">
                  {cat.name}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableTypes.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        onSelectType(item.type);
                        onClose();
                      }}
                      className="p-3 text-left rounded-xl border border-[#E5E0D8] bg-[#FAF9F7] hover:bg-[#E3ECFD] hover:border-[#2963CC] transition-all space-y-1 group"
                    >
                      <div className="font-bold text-[13px] text-[#352637] group-hover:text-[#2963CC]">
                        {typeName(item.type, isReading)}
                      </div>
                      <div className="text-[11px] text-[#706473] leading-snug line-clamp-2">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
