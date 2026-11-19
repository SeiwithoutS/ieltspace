import React, { createContext, useEffect, useState } from "react";
import { navigate } from "../../lib/auth/auth";

export const DesktopContext = createContext(true);
const desktopQuery =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export default function DesktopOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(
    () => matchMedia(desktopQuery).matches,
  );
  const [opened, setOpened] = useState(allowed);
  useEffect(() => {
    const media = matchMedia(desktopQuery);
    const update = () => {
      setAllowed(media.matches);
      if (media.matches) setOpened(true);
    };
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <DesktopContext.Provider value={allowed}>
      {opened && (
        <div
          aria-hidden={!allowed}
          style={{ visibility: allowed ? "visible" : "hidden" }}
        >
          {children}
        </div>
      )}
      {!allowed && (
        <main
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-6 font-sans"
          style={{
            background: "var(--attempt-bg-fcfbf7,#FCFBF7)",
            color: "var(--attempt-text-352637,#352637)",
          }}
        >
          <section className="w-full max-w-lg rounded-3xl border border-solid border-[#D6D4D0] bg-[var(--attempt-bg-ffffff,#fff)] px-6 py-8 text-center shadow-[0_1px_2px_rgba(53,38,55,0.04),0_6px_16px_rgba(53,38,55,0.07)] sm:px-10 sm:py-10">
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
            <h1 className="m-0 text-[22px] font-bold leading-snug text-balance sm:text-2xl">
              Vui lòng làm bài trên máy tính
            </h1>
            <p className="mx-auto mb-5 mt-3 max-w-[40ch] text-[15px] leading-relaxed text-[#706473]">
              Phần làm bài chỉ hỗ trợ máy tính để bàn hoặc laptop. Hãy mở
              IELTSpace trên máy tính và mở rộng cửa sổ trình duyệt để bắt đầu.
            </p>
            <p className="mx-auto mb-6 mt-0 inline-block rounded-full bg-[#E3ECFD] px-3 py-1 text-xs font-semibold text-[#2963CC]">
              Cần màn hình rộng từ 1024px
            </p>
            <br />
            <button
              type="button"
              onClick={() => navigate("StudentHome")}
              className="cursor-pointer rounded-full border-0 bg-[#352637] px-6 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2963CC]"
            >
              Về trang chủ
            </button>
          </section>
        </main>
      )}
    </DesktopContext.Provider>
  );
}
