import { useEffect, useState } from "react";

const quotes = [
  "Bạn không cần tiến nhanh hơn ai khác. Chỉ cần tiến hơn chính mình hôm qua.",
  "Chọn một lỗi bạn hay gặp và tập sửa lỗi đó trong buổi học hôm nay.",
  "Một từ đã dùng được trong câu có ích hơn một danh sách từ chưa từng dùng.",
  "Thử nói thành tiếng một câu trả lời trước khi xem bài mẫu.",
  "Hôm nay hãy dành vài phút ôn lại phần bạn chưa nhớ.",
  "Ghi lại một điều bạn hiểu rõ hơn sau buổi học hôm nay.",
  "Khi đọc lời giải, hãy tìm câu trong bài giúp bạn tự kiểm tra đáp án.",
];
const rotationMs = 5 * 60_000;

export function useDailyMotivation() {
  const [slot, setSlot] = useState(() => Math.floor(Date.now() / rotationMs));
  useEffect(() => {
    let timer: number | undefined;
    function sync() {
      window.clearTimeout(timer);
      const now = Date.now();
      setSlot(Math.floor(now / rotationMs));
      timer = window.setTimeout(sync, rotationMs - now % rotationMs);
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return quotes[slot % quotes.length];
}
