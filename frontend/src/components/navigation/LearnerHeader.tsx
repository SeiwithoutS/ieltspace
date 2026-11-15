import React, { useState, useEffect, useRef } from 'react';
import NotificationBadge from '../notifications/NotificationBadge';
import { useAccount } from '../../lib/account';
import { getAuthUser } from '../../lib/auth';

export type LearnerNavKey = 'exams' | 'samples' | 'vocab' | 'flashcard' | 'home';

export interface LearnerHeaderProps {
  active?: LearnerNavKey;
  guest?: boolean;
}

export default function LearnerHeader({ active, guest }: LearnerHeaderProps) {
  const isGuest = guest !== undefined ? guest : !getAuthUser();
  const account = useAccount('learner');
  const initials = account.initials || 'MA';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [examsOpen, setExamsOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on Escape and lock body scroll when open
  useEffect(() => {
    if (!mobileOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus into drawer
    drawerRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    menuBtnRef.current?.focus();
  };

  const navItemClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-[#E3ECFD] border-[1.5px] border-[#D6D4D0] text-[#352637] font-semibold'
        : 'border-[1.5px] border-transparent text-[#4B3D4D] font-medium hover:bg-[#F3F0EA]'
    }`;

  const logoHref = isGuest ? 'Main.dc.html' : 'StudentLanding.dc.html';

  return (
    <header className="border-b-[1.5px] border-[#D6D4D0] bg-[#FCFBF7] relative z-30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 min-h-[56px] md:min-h-[68px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a
            href={logoHref}
            className="flex items-center gap-2.5 text-[#352637] font-bold text-lg no-underline"
          >
            <span className="w-8 h-8 rounded-[10px] border-[1.5px] border-[#D6D4D0] bg-[#2963CC] text-white flex items-center justify-center font-extrabold text-[13px] shrink-0">
              IS
            </span>
            <span className="font-bold text-lg tracking-tight">IELTSpace</span>
          </a>
        </div>

        {/* Desktop Nav (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Thư viện đề */}
          <div className="bu-dd relative">
            <a
              href="FullTests.dc.html"
              className={navItemClass(active === 'exams')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện đề
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div
                role="menu"
                className="w-80 p-1.5 border-[1.5px] border-[#D6D4D0] rounded-2xl bg-white shadow-lg flex flex-col gap-0.5"
              >
                <a
                  href="FullTests.dc.html"
                  data-nav="IELTS Full Tests"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#E3ECFD] text-[#2963CC] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l9 5-9 5-9-5z" />
                      <path d="M3 13l9 5 9-5" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Full Tests</span>
                    <span className="text-[13px] text-[#706473]">Đề đầy đủ, chấm band như thi thật</span>
                  </span>
                </a>
                <a
                  href="PracticeLibrary.dc.html"
                  data-nav="IELTS Listening Practice"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#DDE8FC] text-[#2A55B8] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
                      <rect x="3" y="14" width="4" height="6" rx="1.5" />
                      <rect x="17" y="14" width="4" height="6" rx="1.5" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Listening Practice</span>
                    <span className="text-[13px] text-[#706473]">Đề Listening theo Test, chọn được Section</span>
                  </span>
                </a>
                <a
                  href="PracticeLibrary.dc.html"
                  data-nav="IELTS Reading Practice"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#DCEDE2] text-[#2E6A48] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Reading Practice</span>
                    <span className="text-[13px] text-[#706473]">Đề Reading theo Test, chọn được Passage</span>
                  </span>
                </a>
                <a
                  href="PracticeWS.dc.html"
                  data-nav="IELTS Writing Practice"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Writing Practice</span>
                    <span className="text-[13px] text-[#706473]">Luyện riêng Task 1 hoặc Task 2</span>
                  </span>
                </a>
                <a
                  href="PracticeWS.dc.html"
                  data-nav="IELTS Speaking Practice"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Speaking Practice</span>
                    <span className="text-[13px] text-[#706473]">Luyện riêng Part 1, 2 hoặc 3</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Thư viện bài mẫu */}
          <div className="bu-dd relative">
            <a
              href="SampleLibrary.dc.html"
              className={navItemClass(active === 'samples')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện bài mẫu
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div
                role="menu"
                className="w-80 p-1.5 border-[1.5px] border-[#D6D4D0] rounded-2xl bg-white shadow-lg flex flex-col gap-0.5"
              >
                <a
                  href="SampleWriting.dc.html"
                  data-nav="Writing Task 1 Academic"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 Academic</span>
                    <span className="text-[13px] text-[#706473]">Mô tả biểu đồ, bảng, bản đồ, quy trình</span>
                  </span>
                </a>
                <a
                  href="SampleWriting.dc.html"
                  data-nav="Writing Task 1 General"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 General</span>
                    <span className="text-[13px] text-[#706473]">Bài mẫu viết thư</span>
                  </span>
                </a>
                <a
                  href="SampleWriting.dc.html"
                  data-nav="Writing Task 2"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 2</span>
                    <span className="text-[13px] text-[#706473]">Bài mẫu bài luận</span>
                  </span>
                </a>
                <a
                  href="SampleSpeaking.dc.html"
                  data-nav="Speaking Part 1, 2, 3"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Speaking Part 1, 2, 3</span>
                    <span className="text-[13px] text-[#706473]">Bản ghi lời nói, kèm audio mẫu</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Thư viện từ vựng */}
          <a href="Vocab.dc.html" className={navItemClass(active === 'vocab')}>
            Thư viện từ vựng
          </a>

          {/* Flashcard của tôi */}
          <a href="Flashcard.dc.html" className={navItemClass(active === 'flashcard')}>
            Flashcard của tôi
          </a>
        </nav>

        {/* Tablet Nav (768px - 1023px) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {/* Thư viện đề */}
          <div className="bu-dd relative">
            <a
              href="FullTests.dc.html"
              className={navItemClass(active === 'exams')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện đề
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div role="menu" className="w-80 p-1.5 border-[1.5px] border-[#D6D4D0] rounded-2xl bg-white shadow-lg flex flex-col gap-0.5">
                <a href="FullTests.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#E3ECFD] text-[#2963CC] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Full Tests</span>
                    <span className="text-[13px] text-[#706473]">Đề đầy đủ, chấm band như thi thật</span>
                  </span>
                </a>
                <a href="PracticeLibrary.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#DDE8FC] text-[#2A55B8] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Listening Practice</span>
                    <span className="text-[13px] text-[#706473]">Đề Listening theo Test, chọn Section</span>
                  </span>
                </a>
                <a href="PracticeLibrary.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#DCEDE2] text-[#2E6A48] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Reading Practice</span>
                    <span className="text-[13px] text-[#706473]">Đề Reading theo Test, chọn Passage</span>
                  </span>
                </a>
                <a href="PracticeWS.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l4 4L8 20H4v-4z" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Writing Practice</span>
                    <span className="text-[13px] text-[#706473]">Luyện riêng Task 1 hoặc Task 2</span>
                  </span>
                </a>
                <a href="PracticeWS.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Speaking Practice</span>
                    <span className="text-[13px] text-[#706473]">Luyện riêng Part 1, 2 hoặc 3</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Thư viện bài mẫu */}
          <div className="bu-dd relative">
            <a
              href="SampleLibrary.dc.html"
              className={navItemClass(active === 'samples')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện bài mẫu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div role="menu" className="w-80 p-1.5 border-[1.5px] border-[#D6D4D0] rounded-2xl bg-white shadow-lg flex flex-col gap-0.5">
                <a href="SampleWriting.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 Academic</span>
                    <span className="text-[13px] text-[#706473]">Mô tả biểu đồ, bảng, bản đồ, quy trình</span>
                  </span>
                </a>
                <a href="SampleWriting.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 General</span>
                    <span className="text-[13px] text-[#706473]">Bài mẫu viết thư</span>
                  </span>
                </a>
                <a href="SampleWriting.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l4 4L8 20H4v-4z" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 2</span>
                    <span className="text-[13px] text-[#706473]">Bài mẫu bài luận</span>
                  </span>
                </a>
                <a href="SampleSpeaking.dc.html" className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Speaking Part 1, 2, 3</span>
                    <span className="text-[13px] text-[#706473]">Bản ghi lời nói, kèm audio mẫu</span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Thêm ▾ (Vocab & Flashcard) */}
          <div className="bu-dd relative">
            <a
              href="#"
              className={navItemClass(active === 'vocab' || active === 'flashcard')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thêm
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div role="menu" className="w-56 p-1.5 border-[1.5px] border-[#D6D4D0] rounded-2xl bg-white shadow-lg flex flex-col gap-0.5">
                <a
                  href="Vocab.dc.html"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#DCEDE2] text-[#2E6A48] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </span>
                  Thư viện từ vựng
                </a>
                <a
                  href="Flashcard.dc.html"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                  </span>
                  Flashcard của tôi
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Right side (Desktop / Tablet) */}
        <div className="hidden md:flex items-center gap-2.5">
          {isGuest ? (
            <div className="flex items-center gap-2.5">
              <a
                href="Register.dc.html"
                className="inline-flex items-center justify-center h-10 px-4 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#F3F0EA] transition-colors"
              >
                Đăng ký
              </a>
              <a
                href="Login.dc.html"
                className="inline-flex items-center justify-center h-10 px-4 rounded-full border-[1.5px] border-[#352637] bg-[#352637] text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#221824] transition-colors"
              >
                Đăng nhập
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <a
                href="Notifications.dc.html"
                aria-label="Thông báo"
                className="relative w-10 h-10 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] flex items-center justify-center no-underline hover:bg-[#F3F0EA] transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <NotificationBadge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5604A] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white" />
              </a>

              <a
                href="AvatarMenu.dc.html"
                aria-label="Tài khoản: tiến độ học tập và cài đặt"
                className="flex p-0.5 rounded-full border-2 border-[#2963CC] no-underline"
              >
                <span className="w-9 h-9 rounded-full border-[1.5px] border-[#D6D4D0] bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center font-bold text-xs">
                  {initials}
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Mobile Header Right (< 768px): Bell + Avatar + Hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          {!isGuest && (
            <>
              <a
                href="Notifications.dc.html"
                aria-label="Thông báo"
                className="relative w-9 h-9 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] flex items-center justify-center no-underline"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <NotificationBadge className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E5604A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white" />
              </a>

              <a
                href="AvatarMenu.dc.html"
                aria-label="Tài khoản: tiến độ học tập và cài đặt"
                className="flex p-0.5 rounded-full border-2 border-[#2963CC] no-underline"
              >
                <span className="w-8 h-8 rounded-full border-[1.5px] border-[#D6D4D0] bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center font-bold text-xs">
                  {initials}
                </span>
              </a>
            </>
          )}

          {isGuest && (
            <a
              href="Login.dc.html"
              className="inline-flex items-center justify-center h-8 px-3 rounded-full border border-[#352637] bg-[#352637] text-white font-medium text-xs no-underline whitespace-nowrap"
            >
              Đăng nhập
            </a>
          )}

          {/* Hamburger toggle button */}
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
            className="w-9 h-9 rounded-lg border-[1.5px] border-[#D6D4D0] bg-white flex items-center justify-center text-[#352637] active:bg-[#F3F0EA] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Drawer content panel */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="relative w-full max-w-[320px] h-full bg-[#FCFBF7] shadow-2xl flex flex-col z-10 focus:outline-none"
          >
            {/* Drawer Header */}
            <div className="h-14 px-4 border-b border-[#D6D4D0] flex items-center justify-between shrink-0">
              <a
                href={logoHref}
                onClick={closeMobile}
                className="flex items-center gap-2.5 text-[#352637] font-bold text-base no-underline"
              >
                <span className="w-7 h-7 rounded-[8px] border border-[#D6D4D0] bg-[#2963CC] text-white flex items-center justify-center font-extrabold text-xs">
                  IS
                </span>
                <span>IELTSpace</span>
              </a>

              <button
                type="button"
                onClick={closeMobile}
                aria-label="Đóng menu điều hướng"
                className="w-9 h-9 rounded-lg border border-[#D6D4D0] bg-white flex items-center justify-center text-[#352637] hover:bg-[#F3F0EA]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Drawer Body - Scrollable Links */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
              {/* Accordion 1: Thư viện đề */}
              <div className="rounded-xl border border-[#E6E4E0] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExamsOpen((v) => !v)}
                  aria-expanded={examsOpen}
                  className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[#352637] hover:bg-[#F6F4EF]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#E3ECFD] text-[#2963CC] flex items-center justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l9 5-9 5-9-5z" />
                        <path d="M3 13l9 5 9-5" />
                      </svg>
                    </span>
                    Thư viện đề
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${examsOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {examsOpen && (
                  <div className="p-2 pt-0 flex flex-col gap-1 border-t border-[#F0EEEA]">
                    <a
                      href="FullTests.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      IELTS Full Tests
                    </a>
                    <a
                      href="PracticeLibrary.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      IELTS Listening Practice
                    </a>
                    <a
                      href="PracticeLibrary.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      IELTS Reading Practice
                    </a>
                    <a
                      href="PracticeWS.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      IELTS Writing Practice
                    </a>
                    <a
                      href="PracticeWS.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      IELTS Speaking Practice
                    </a>
                  </div>
                )}
              </div>

              {/* Accordion 2: Thư viện bài mẫu */}
              <div className="rounded-xl border border-[#E6E4E0] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSamplesOpen((v) => !v)}
                  aria-expanded={samplesOpen}
                  className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[#352637] hover:bg-[#F6F4EF]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 5l4 4L8 20H4v-4z" />
                      </svg>
                    </span>
                    Thư viện bài mẫu
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${samplesOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {samplesOpen && (
                  <div className="p-2 pt-0 flex flex-col gap-1 border-t border-[#F0EEEA]">
                    <a
                      href="SampleWriting.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      Writing Task 1 Academic
                    </a>
                    <a
                      href="SampleWriting.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      Writing Task 1 General
                    </a>
                    <a
                      href="SampleWriting.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      Writing Task 2
                    </a>
                    <a
                      href="SampleSpeaking.dc.html"
                      onClick={closeMobile}
                      className="p-2.5 rounded-lg text-sm text-[#352637] hover:bg-[#F6F4EF] no-underline font-medium"
                    >
                      Speaking Part 1, 2, 3
                    </a>
                  </div>
                )}
              </div>

              {/* Direct Link: Thư viện từ vựng */}
              <a
                href="Vocab.dc.html"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border border-[#E6E4E0] bg-white text-sm font-semibold no-underline ${
                  active === 'vocab' ? 'bg-[#E3ECFD] border-[#D6D4D0] text-[#352637]' : 'text-[#352637] hover:bg-[#F6F4EF]'
                }`}
              >
                <span className="w-7 h-7 rounded-lg bg-[#DCEDE2] text-[#2E6A48] flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </span>
                Thư viện từ vựng
              </a>

              {/* Direct Link: Flashcard của tôi */}
              <a
                href="Flashcard.dc.html"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 p-3.5 rounded-xl border border-[#E6E4E0] bg-white text-sm font-semibold no-underline ${
                  active === 'flashcard' ? 'bg-[#E3ECFD] border-[#D6D4D0] text-[#352637]' : 'text-[#352637] hover:bg-[#F6F4EF]'
                }`}
              >
                <span className="w-7 h-7 rounded-lg bg-[#FBEDBF] text-[#7A5A0E] flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M7 7h10M7 12h10M7 17h6" />
                  </svg>
                </span>
                Flashcard của tôi
              </a>

              {/* Learner extras or guest buttons */}
              {!isGuest && (
                <>
                  <div className="my-2 border-t border-[#E6E4E0]" />
                  <a
                    href="StudentHome.dc.html"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 p-3 rounded-lg text-sm text-[#352637] hover:bg-white no-underline font-medium"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11l8-7 8 7v9H4z" />
                    </svg>
                    Dashboard tiến độ
                  </a>
                  <a
                    href="MyWS.dc.html"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 p-3 rounded-lg text-sm text-[#352637] hover:bg-white no-underline font-medium"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                    Bài Writing/Speaking của tôi
                  </a>
                  <a
                    href="Profile.dc.html"
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 p-3 rounded-lg text-sm text-[#352637] hover:bg-white no-underline font-medium"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                    Hồ sơ cá nhân
                  </a>
                </>
              )}

              {isGuest && (
                <>
                  <div className="my-2 border-t border-[#E6E4E0]" />
                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href="Register.dc.html"
                      onClick={closeMobile}
                      className="w-full h-11 flex items-center justify-center rounded-xl border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-sm no-underline"
                    >
                      Đăng ký
                    </a>
                    <a
                      href="Login.dc.html"
                      onClick={closeMobile}
                      className="w-full h-11 flex items-center justify-center rounded-xl bg-[#352637] text-white font-semibold text-sm no-underline"
                    >
                      Đăng nhập
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
