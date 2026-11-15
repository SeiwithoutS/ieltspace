import React, { useState, useEffect } from 'react';
import { ScreenSupport, getTestScreenSupport, subscribeScreenSupport } from '../../lib/device';

/**
 * Hộp thoại cảnh báo trước khi vào bài thi khi thiết bị không phải Desktop.
 * RS-02: Màn hình nhỏ (tablet hoặc điện thoại).
 */
export function ScreenSupportConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="screen-guard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl text-[#352637] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center flex-none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h2 id="screen-guard-title" className="text-lg font-bold text-[#352637] m-0">
            Khuyến nghị làm bài trên máy tính
          </h2>
        </div>

        <p className="text-sm text-[#706473] leading-relaxed m-0">
          Nên làm bài trên máy tính. Màn hình hiện tại nhỏ, đề và câu hỏi có thể bị chật, Speaking cần micro và Writing cần bàn phím.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#706473] hover:bg-[#F3F0EA] transition-colors"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2963CC] hover:bg-[#2257B8] shadow-sm transition-colors"
          >
            Vẫn làm bài
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Màn chắn chặn làm bài trên điện thoại khi chưa bắt đầu lượt làm (RS-02).
 */
export function PhoneTestBlocker({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-blocker-title"
      className="fixed inset-0 z-50 bg-[#FAF9F5] text-[#352637] flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#C0412A] flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </div>

      <h1 id="phone-blocker-title" className="text-xl font-bold mb-3">
        Hãy dùng máy tính hoặc máy tính bảng để làm bài
      </h1>

      <p className="text-sm text-[#706473] max-w-sm leading-relaxed mb-6">
        Giao diện bài thi IELTS yêu cầu màn hình rộng để đọc đề bài, tra cứu và trả lời câu hỏi thuận tiện. Vui lòng chuyển sang thiết bị có màn hình lớn hơn để tiếp tục.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#2963CC] hover:bg-[#2257B8] transition-colors"
      >
        Quay lại
      </button>
    </div>
  );
}

/**
 * Dải cảnh báo màn hình nhỏ hoặc khi người dùng xoay điện thoại trong khi thi (RS-03).
 * Không chặn làm bài, không làm gián đoạn bài thi.
 */
export function SmallScreenWarningBanner({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="bg-[#FFF7ED] border-b border-[#FED7AA] px-4 py-2 text-xs text-[#9A4A17] flex items-center justify-between z-20 flex-none"
    >
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>
          Màn hình hiện tại hơi nhỏ. Để trải nghiệm tốt nhất, bạn nên làm bài trên máy tính.
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#9A4A17] hover:text-[#7A340D] font-bold text-sm leading-none p-1 ml-2"
          aria-label="Đóng cảnh báo"
        >
          ×
        </button>
      )}
    </aside>
  );
}
