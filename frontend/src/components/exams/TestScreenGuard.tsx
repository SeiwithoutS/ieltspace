import React from "react";

/**
 * Hộp thoại chặn khi bấm "Bắt đầu" trên màn không đủ điều kiện làm bài (RS-02).
 * Dùng chung điều kiện với DesktopOnly (lib/device.ts), nên người học không
 * phải qua hai hộp thoại liên tiếp.
 */
export function DesktopRequiredDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="desktop-required-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 text-[#352637] shadow-xl">
        <h2
          id="desktop-required-title"
          className="m-0 text-lg font-bold text-[#352637]"
        >
          Vui lòng làm bài trên máy tính
        </h2>
        <p className="m-0 text-sm leading-relaxed text-[#706473]">
          Phần làm bài chỉ hỗ trợ máy tính để bàn hoặc laptop (màn hình từ
          1024px). Hãy mở IELTSpace trên máy tính và mở rộng cửa sổ trình duyệt
          để bắt đầu.
        </p>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#2963CC] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2257B8]"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
