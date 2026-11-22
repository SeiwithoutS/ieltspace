import { useEffect, useRef, useState } from "react";

// Ô tìm kiếm theo DESIGN.md 12.2: rộng 280, cao 44, icon kính lúp bên trái, không khung ngoài.
// Áp dụng tức thì: gọi onChange sau `delayMs` (mặc định 300ms) hoặc ngay khi bấm Enter.
// Giữ nguyên nội dung người dùng gõ (kể cả dấu cách cuối); nơi gọi tự trim khi dựng truy vấn.
export default function SearchField({
  value,
  onChange,
  placeholder = "Tìm kiếm",
  label,
  delayMs = 300,
  maxLength,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // Nhãn đọc cho trình đọc màn hình (mặc định dùng placeholder).
  label?: string;
  delayMs?: number;
  maxLength?: number;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const last = useRef(value);
  const timer = useRef<number | undefined>(undefined);
  const composing = useRef(false);
  // Luôn gọi bản onChange mới nhất, tránh closure cũ khi nơi gọi đổi hàm.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Giá trị từ ngoài đổi (ví dụ "Xóa bộ lọc") thì đồng bộ vào ô và hủy lần gửi đang chờ.
  useEffect(() => {
    if (value !== last.current) {
      window.clearTimeout(timer.current);
      last.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const emit = (next: string) => {
    window.clearTimeout(timer.current);
    if (next === last.current) return;
    last.current = next;
    onChangeRef.current(next);
  };

  const schedule = (next: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => emit(next), delayMs);
  };

  return (
    <div className={["ui-search", className ?? ""].filter(Boolean).join(" ")} role="search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="M20 20l-4-4"></path>
      </svg>
      <input
        type="search"
        className="ui-control"
        value={text}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        onCompositionStart={() => {
          // Đang gõ tiếng Việt (Telex, VNI): chưa gửi chữ ghép dở.
          composing.current = true;
          window.clearTimeout(timer.current);
        }}
        onCompositionEnd={(e) => {
          composing.current = false;
          schedule(e.currentTarget.value);
        }}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setText(next);
          if (composing.current) return;
          schedule(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            emit(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
