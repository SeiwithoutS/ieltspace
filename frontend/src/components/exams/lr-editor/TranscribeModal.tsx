import React, { useEffect, useState, useRef } from 'react';
import {
  startTranscription,
  getTranscriptionJob,
  type TranscriptionJobResult,
} from '../../../lib/exams/exam-editor.ts';

export type TranscribeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  orderNo: number;
  audioPath: string | null;
  hasExistingTranscript: boolean;
  onApply: (paragraphs: Array<{ label: string; text: string; startSec: number }>) => void;
};

export default function TranscribeModal({
  isOpen,
  onClose,
  skillId,
  orderNo,
  audioPath,
  hasExistingTranscript,
  onApply,
}: TranscribeModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'preview' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [paragraphs, setParagraphs] = useState<Array<{ label: string; text: string; startSec: number }>>([]);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  function stopPolling() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setStatus('idle');
      setErrorMsg('');
      setParagraphs([]);
    }
  }, [isOpen]);

  async function handleStart() {
    if (!audioPath) {
      setStatus('error');
      setErrorMsg('Section này chưa có tệp ghi âm được tải lên.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    startTimeRef.current = Date.now();

    try {
      const { jobId } = await startTranscription(skillId, orderNo, audioPath);

      pollTimerRef.current = setInterval(async () => {
        // Tối đa 5 phút
        if (Date.now() - startTimeRef.current > 300000) {
          stopPolling();
          setStatus('error');
          setErrorMsg('Quá thời gian chờ tạo transcript (5 phút). Vui lòng thử lại sau.');
          return;
        }

        try {
          const res: TranscriptionJobResult = await getTranscriptionJob(jobId);
          if (res.status === 'done') {
            stopPolling();
            setStatus('preview');
            setParagraphs(res.paragraphs || []);
          } else if (res.status === 'error') {
            stopPolling();
            setStatus('error');
            setErrorMsg(res.message || 'Không thể tạo transcript từ ghi âm này.');
          }
        } catch (pollErr: unknown) {
          stopPolling();
          setStatus('error');
          const msg = pollErr instanceof Error ? pollErr.message : 'Lỗi kết nối khi kiểm tra tiến độ.';
          setErrorMsg(msg);
        }
      }, 3000);
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Không thể khởi động dịch vụ tạo transcript.';
      setErrorMsg(msg);
    }
  }

  function handleConfirmApply() {
    if (paragraphs.length === 0) return;
    onApply(paragraphs);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E5E0D8] max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0EA] text-[#2A1F2D] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#352637]">
              Tạo transcript tự động (Section {orderNo})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A89CA8] hover:text-[#554756] text-[18px] font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {status === 'idle' && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#554756] leading-relaxed">
                Hệ thống sẽ sử dụng mô hình nhận diện giọng nói (Groq Whisper) để chuyển đổi âm thanh Section {orderNo} thành các câu thoại có mốc thời gian <span className="font-mono font-semibold">[mm:ss]</span>.
              </p>
              {hasExistingTranscript && (
                <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[12px] rounded-xl">
                  <strong>Lưu ý:</strong> Section này đã có transcript. Khi áp dụng bản transcript mới, nội dung cũ sẽ bị ghi đè và các giải thích câu hỏi đã gán đoạn cần được gán lại.
                </div>
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#2A1F2D] border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-[#352637]">Đang tạo transcript từ ghi âm...</p>
                <p className="text-[12px] text-[#706473]">Thường mất dưới 1 phút. Bạn có thể hủy theo dõi bất cứ lúc nào.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl space-y-2 text-[#991B1B]">
              <div className="font-bold text-[13px] flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Không thể tạo transcript
              </div>
              <p className="text-[12px] leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {status === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-[#352637]">
                  Đã tạo thành công {paragraphs.length} đoạn thoại:
                </span>
                <span className="text-[#2A1F2D] font-medium">Bản xem trước 3 đoạn đầu</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E0D8]">
                {paragraphs.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="text-[12px] text-[#352637] leading-relaxed">
                    <span className="font-bold text-[#2A1F2D] mr-1.5">{p.label}.</span>
                    <span>{p.text}</span>
                  </div>
                ))}
                {paragraphs.length > 3 && (
                  <p className="text-[11px] text-[#8C828A] italic pt-1">
                    ... và {paragraphs.length - 3} đoạn tiếp theo.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-[#706473] italic">
                * Gợi ý: Thêm tên người nói (ví dụ SARAH:, AGENT:) nếu cần, kiểm lại chính tả tên riêng và số sau khi đưa vào editor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#FAF9F7] border-t border-[#E5E0D8] flex items-center justify-end gap-2.5">
          {status === 'idle' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[#D6D4D0] text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={!audioPath}
                className="px-4 py-1.5 rounded-lg bg-[#2A1F2D] hover:bg-[#512DA8] disabled:opacity-50 text-[13px] font-semibold text-white transition-colors"
              >
                Bắt đầu tạo transcript
              </button>
            </>
          )}

          {status === 'loading' && (
            <button
              type="button"
              onClick={() => {
                stopPolling();
                setStatus('idle');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-[#D6D4D0] text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA]"
            >
              Hủy theo dõi
            </button>
          )}

          {status === 'error' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[#D6D4D0] text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleStart}
                className="px-4 py-1.5 rounded-lg bg-[#2A1F2D] hover:bg-[#512DA8] text-[13px] font-semibold text-white transition-colors"
              >
                Thử lại
              </button>
            </>
          )}

          {status === 'preview' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-[#D6D4D0] text-[13px] font-semibold text-[#554756] hover:bg-[#F3F0EA]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                className="px-4 py-1.5 rounded-lg bg-[#2A1F2D] hover:bg-[#512DA8] text-[13px] font-semibold text-white transition-colors"
              >
                Thay transcript hiện tại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
