import React, { createContext, useEffect, useState } from "react";
import { navigate } from "../../lib/auth";

export const DesktopContext = createContext(true);

type DeviceCategory = "desktop" | "tablet" | "phone";

function detectDevice(): DeviceCategory {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  if (w < 768) {
    return "phone";
  }
  if (w < 1024 || isTouch) {
    return "tablet";
  }
  return "desktop";
}

export default function DesktopOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [device, setDevice] = useState<DeviceCategory>(() => detectDevice());
  // If started initial as desktop, they are immediately in test.
  const [started, setStarted] = useState(() => detectDevice() === "desktop");

  useEffect(() => {
    const handleResize = () => {
      const current = detectDevice();
      setDevice(current);
      // If user is on desktop and hasn't started yet, auto start
      if (current === "desktop" && !started) {
        setStarted(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [started]);

  // RS-03: When already started, NEVER block/hide the test in progress.
  // Only show a small top alert bar if window gets shrunk below desktop size.
  if (started) {
    return (
      <DesktopContext.Provider value={true}>
        {device !== "desktop" && (
          <div
            role="alert"
            className="sticky top-0 z-[99] bg-[#FBEDBF] text-[#7A5A0E] px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between border-b border-[#D6D4D0] shadow-sm"
          >
            <span>
              ⚠️ Cửa sổ trình duyệt đang nhỏ hơn kích thước tối ưu (≥ 1024px).
              Vui lòng mở rộng cửa sổ để hiển thị đề bài tốt nhất.
            </span>
          </div>
        )}
        {children}
      </DesktopContext.Provider>
    );
  }

  // Not started yet:
  // RS-02: Phone (< 768px) is blocked completely before start.
  if (device === "phone") {
    return (
      <DesktopContext.Provider value={false}>
        <main
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-6 font-sans"
          style={{
            background: "var(--attempt-bg-fcfbf7,#FCFBF7)",
            color: "var(--attempt-text-352637,#352637)",
          }}
        >
          <section className="max-w-lg rounded-3xl border border-solid border-[#D6D4D0] bg-[var(--attempt-bg-ffffff,#fff)] p-8 text-center shadow-lg">
            <svg
              aria-hidden="true"
              className="mx-auto mb-5 text-[#2963CC]"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <h1 className="text-2xl font-bold">
              Vui lòng làm bài trên máy tính
            </h1>
            <p className="my-4 leading-relaxed text-[#706473]">
              Phần làm bài thi IELTS yêu cầu màn hình từ 768px trở lên và tối ưu nhất
              trên máy tính để bàn hoặc laptop. Hãy mở IELTSpace trên máy tính để bắt đầu.
            </p>
            <button
              type="button"
              onClick={() => navigate("StudentHome")}
              className="cursor-pointer rounded-full border-0 bg-[#352637] px-6 py-3 font-semibold text-white hover:bg-[#221824] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2963CC]"
            >
              Về trang chủ
            </button>
          </section>
        </main>
      </DesktopContext.Provider>
    );
  }

  // RS-02: Tablet (768px <= w < 1024px or touch) gets a warning dialog with "Vẫn tiếp tục" button.
  return (
    <DesktopContext.Provider value={false}>
      <main
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-6 font-sans"
        style={{
          background: "var(--attempt-bg-fcfbf7,#FCFBF7)",
          color: "var(--attempt-text-352637,#352637)",
        }}
      >
        <section className="max-w-lg rounded-3xl border border-solid border-[#D6D4D0] bg-[var(--attempt-bg-ffffff,#fff)] p-8 text-center shadow-lg">
          <svg
            aria-hidden="true"
            className="mx-auto mb-5 text-[#E5604A]"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <h1 className="text-2xl font-bold">
            Cảnh báo thiết bị làm bài
          </h1>
          <p className="my-4 leading-relaxed text-[#706473]">
            Bạn đang sử dụng máy tính bảng hoặc thiết bị cảm ứng. Giao diện bài thi IELTS
            cần thao tác văn bản nhanh và tối ưu nhất trên máy tính với chuột và bàn phím vật lý.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("FullTests")}
              className="cursor-pointer rounded-full border border-solid border-[#D6D4D0] bg-white px-5 py-2.5 font-semibold text-[#352637] hover:bg-[#F3F0EA] transition-colors"
            >
              Quay lại thư viện đề
            </button>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="cursor-pointer rounded-full border-0 bg-[#2963CC] px-6 py-2.5 font-semibold text-white hover:bg-[#2050A8] transition-colors"
            >
              Vẫn tiếp tục làm bài
            </button>
          </div>
        </section>
      </main>
    </DesktopContext.Provider>
  );
}
