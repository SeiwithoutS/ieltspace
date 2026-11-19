import React, { useState, useEffect, useRef } from 'react';
import PageLink from './PageLink';
import type { PageName } from '../../app/pages';
import NotificationBadge from '../notifications/NotificationBadge';
import { useAccount } from '../../lib/auth/account';
import AvatarContent from '../account/AvatarContent';
import { getAuthUser, logout } from '../../lib/auth/auth';

export type LearnerNavKey = 'exams' | 'samples' | 'vocab' | 'flashcard' | 'home';

export interface AccountNavItem {
  id: string;
  label: string;
  page?: PageName;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

export interface LearnerHeaderProps {
  active?: LearnerNavKey;
  guest?: boolean;
  accent?: string;
  onAccent?: string;
  accountNav?: {
    items: AccountNavItem[];
  };
}

export default function LearnerHeader({
  active,
  guest,
  accent = 'var(--color-primary-600, #2963CC)',
  onAccent = '#FFFFFF',
  accountNav,
}: LearnerHeaderProps) {
  const isGuest = guest !== undefined ? guest : !getAuthUser();
  const account = useAccount('learner');
  const initials = account.initials;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [examsOpen, setExamsOpen] = useState(false);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on Escape and lock body scroll when open
  useEffect(() => {
    if (!mobileOpen) return;
    const desktop = window.matchMedia('(min-width: 768px)');
    if (desktop.matches) {
      setMobileOpen(false);
      return;
    }
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
    const handleDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleDesktop);

    return () => {
      document.body.style.overflow = origOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleDesktop);
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    menuBtnRef.current?.focus();
  };

  const navItemClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-sm transition-colors whitespace-nowrap box-border no-underline ${
      isActive
        ? 'bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] text-[var(--attempt-text-352637,#352637)] font-semibold'
        : 'border-[1.5px] border-transparent text-[var(--attempt-text-4b3d4d,#4B3D4D)] font-medium hover:bg-[var(--attempt-bg-f3f0ea,#F3F0EA)]'
    }`;

  const homePage: PageName = isGuest ? 'Main' : 'StudentLanding';

  return (
    <header className="learner-result-header border-0 border-solid border-b-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-fcfbf7,#FCFBF7)] relative z-30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 min-h-[56px] md:min-h-[68px] flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile Left (< 768px): Hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
            className="w-9 h-9 rounded-lg border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] flex items-center justify-center text-[var(--attempt-text-352637,#352637)] active:bg-[var(--attempt-bg-f3f0ea,#F3F0EA)] transition-colors"
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

        {/* Logo */}
        <div className="flex items-center gap-3">
          <PageLink
            page={homePage}
            className="flex items-center gap-2.5 text-[var(--attempt-text-352637,#352637)] font-bold text-lg no-underline"
          >
            <span
              className="w-8 h-8 rounded-[10px] border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] flex items-center justify-center font-extrabold text-[13px] shrink-0"
              style={{ background: accent, color: onAccent }}
            >
              IS
            </span>
            <span className="font-bold text-lg tracking-tight">IELTSpace</span>
          </PageLink>
        </div>

        {/* Desktop Nav (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Thư viện đề */}
          <div className="bu-dd relative">
            <PageLink
              page="FullTests"
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
            </PageLink>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div
                role="menu"
                className="w-80 p-1.5 border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-2xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-lg flex flex-col gap-0.5"
              >
                <PageLink
                  page="FullTests"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] text-[var(--attempt-text-2963cc,#2963CC)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l9 5-9 5-9-5z" />
                      <path d="M3 13l9 5 9-5" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Full Tests</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề đầy đủ, chấm band như thi thật</span>
                  </span>
                </PageLink>
                <PageLink
                  page="PracticeLibrary"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-dde8fc,#DDE8FC)] text-[var(--attempt-text-2a55b8,#2A55B8)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
                      <rect x="3" y="14" width="4" height="6" rx="1.5" />
                      <rect x="17" y="14" width="4" height="6" rx="1.5" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Listening Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề Listening theo Test, chọn được Section</span>
                  </span>
                </PageLink>
                <PageLink
                  page="PracticeLibrary"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-dcede2,#DCEDE2)] text-[var(--attempt-text-2e6a48,#2E6A48)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Reading Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề Reading theo Test, chọn được Passage</span>
                  </span>
                </PageLink>
                <PageLink
                  page="PracticeWS"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Writing Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Luyện riêng Task 1 hoặc Task 2</span>
                  </span>
                </PageLink>
                <PageLink
                  page="PracticeWS"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Speaking Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Luyện riêng Part 1, 2 hoặc 3</span>
                  </span>
                </PageLink>
              </div>
            </div>
          </div>

          {/* Thư viện bài mẫu */}
          <div className="bu-dd relative">
            <PageLink
              page="SampleLibrary"
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
            </PageLink>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div
                role="menu"
                className="w-80 p-1.5 border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-2xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-lg flex flex-col gap-0.5"
              >
                <PageLink
                  page="SampleLibrary" query="sampleType=WRITING_TASK_1_ACADEMIC"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 Academic</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Mô tả biểu đồ, bảng, bản đồ, quy trình</span>
                  </span>
                </PageLink>
                <PageLink
                  page="SampleLibrary" query="sampleType=WRITING_TASK_1_GENERAL"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 General</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bài mẫu viết thư</span>
                  </span>
                </PageLink>
                <PageLink
                  page="SampleLibrary" query="sampleType=WRITING_TASK_2"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 2</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bài mẫu bài luận</span>
                  </span>
                </PageLink>
                <PageLink
                  page="SampleLibrary" query="skill=SPEAKING"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Speaking Part 1, 2, 3</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bản ghi lời nói, kèm audio mẫu</span>
                  </span>
                </PageLink>
              </div>
            </div>
          </div>

          {/* Thư viện từ vựng */}
          <PageLink page="Vocab" className={navItemClass(active === 'vocab')}>
            Thư viện từ vựng
          </PageLink>

          {/* Flashcard của tôi */}
          {!isGuest && <PageLink page="Flashcard" className={navItemClass(active === 'flashcard')}>
            Flashcard của tôi
          </PageLink>}
        </nav>

        {/* Tablet Nav (768px - 1023px) */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {/* Thư viện đề */}
          <div className="bu-dd relative">
            <PageLink
              page="FullTests"
              className={navItemClass(active === 'exams')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện đề
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </PageLink>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div role="menu" className="w-80 p-1.5 border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-2xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-lg flex flex-col gap-0.5">
                <PageLink page="FullTests" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] text-[var(--attempt-text-2963cc,#2963CC)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Full Tests</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề đầy đủ, chấm band như thi thật</span>
                  </span>
                </PageLink>
                <PageLink page="PracticeLibrary" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-dde8fc,#DDE8FC)] text-[var(--attempt-text-2a55b8,#2A55B8)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Listening Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề Listening theo Test, chọn Section</span>
                  </span>
                </PageLink>
                <PageLink page="PracticeLibrary" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-dcede2,#DCEDE2)] text-[var(--attempt-text-2e6a48,#2E6A48)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Reading Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Đề Reading theo Test, chọn Passage</span>
                  </span>
                </PageLink>
                <PageLink page="PracticeWS" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l4 4L8 20H4v-4z" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Writing Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Luyện riêng Task 1 hoặc Task 2</span>
                  </span>
                </PageLink>
                <PageLink page="PracticeWS" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">IELTS Speaking Practice</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Luyện riêng Part 1, 2 hoặc 3</span>
                  </span>
                </PageLink>
              </div>
            </div>
          </div>

          {/* Thư viện bài mẫu */}
          <div className="bu-dd relative">
            <PageLink
              page="SampleLibrary"
              className={navItemClass(active === 'samples')}
              aria-haspopup="true"
              aria-expanded="false"
            >
              Thư viện bài mẫu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </PageLink>
            <div className="bu-dd-menu absolute top-full left-0 pt-2 z-30">
              <div role="menu" className="w-80 p-1.5 border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-2xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-lg flex flex-col gap-0.5">
                <PageLink page="SampleLibrary" query="sampleType=WRITING_TASK_1_ACADEMIC" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 Academic</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Mô tả biểu đồ, bảng, bản đồ, quy trình</span>
                  </span>
                </PageLink>
                <PageLink page="SampleLibrary" query="sampleType=WRITING_TASK_1_GENERAL" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 1 General</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bài mẫu viết thư</span>
                  </span>
                </PageLink>
                <PageLink page="SampleLibrary" query="sampleType=WRITING_TASK_2" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l4 4L8 20H4v-4z" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Writing Task 2</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bài mẫu bài luận</span>
                  </span>
                </PageLink>
                <PageLink page="SampleLibrary" query="skill=SPEAKING" className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline">
                  <span className="w-9 h-9 rounded-lg bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-sm">Speaking Part 1, 2, 3</span>
                    <span className="text-[13px] text-[var(--attempt-text-706473,#706473)]">Bản ghi lời nói, kèm audio mẫu</span>
                  </span>
                </PageLink>
              </div>
            </div>
          </div>

          {/* Thêm ▾ (Vocab & Flashcard) */}
          <div className="bu-dd relative">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
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
              <div role="menu" className="w-56 p-1.5 border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-2xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-lg flex flex-col gap-0.5">
                <PageLink
                  page="Vocab"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline font-medium text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-[var(--attempt-bg-dcede2,#DCEDE2)] text-[var(--attempt-text-2e6a48,#2E6A48)] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </span>
                  Thư viện từ vựng
                </PageLink>
                {!isGuest && <PageLink
                  page="Flashcard"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F6F4EF)] no-underline font-medium text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                  </span>
                  Flashcard của tôi
                </PageLink>}
              </div>
            </div>
          </div>
        </nav>

        {/* Right side (Desktop / Tablet) */}
        <div className="hidden md:flex items-center gap-2.5">
          {isGuest ? (
            <div className="flex items-center gap-2.5">
              <PageLink
                page="Register"
                className="hidden lg:inline-flex items-center justify-center h-10 px-4 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-[var(--attempt-text-352637,#352637)] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[var(--attempt-bg-f3f0ea,#F3F0EA)] transition-colors"
              >
                Đăng ký
              </PageLink>
              <PageLink
                page="Login"
                className="inline-flex items-center justify-center h-10 px-4 rounded-full border-solid border-[1.5px] border-[#352637] bg-[#352637] text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#221824] transition-colors"
              >
                Đăng nhập
              </PageLink>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <PageLink
                page="Notifications"
                aria-label="Thông báo"
                className="relative w-10 h-10 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-[var(--attempt-text-352637,#352637)] flex items-center justify-center no-underline hover:bg-[var(--attempt-bg-f3f0ea,#F3F0EA)] transition-colors"
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
                <NotificationBadge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5604A] text-white text-[11px] font-bold flex items-center justify-center border-solid border-2 border-white" />
              </PageLink>

              <PageLink
                page="AvatarMenu"
                aria-label="Tài khoản: tiến độ học tập và cài đặt"
                className="flex p-0.5 rounded-full no-underline"
                style={{ border: `2px solid ${accent}` }}
              >
                <span className="w-9 h-9 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center font-bold text-xs">
                  <AvatarContent avatar={account.avatar} initials={initials} />
                </span>
              </PageLink>
            </div>
          )}
        </div>

        {/* Mobile Header Right (< 768px): Bell + Avatar */}
        <div className="flex md:hidden items-center gap-2">
          {!isGuest && (
            <>
              <PageLink
                page="Notifications"
                aria-label="Thông báo"
                className="relative w-9 h-9 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-[var(--attempt-text-352637,#352637)] flex items-center justify-center no-underline"
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
                <NotificationBadge className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E5604A] text-white text-[10px] font-bold flex items-center justify-center border-solid border-2 border-white" />
              </PageLink>

              <PageLink
                page="AvatarMenu"
                aria-label="Tài khoản: tiến độ học tập và cài đặt"
                className="flex p-0.5 rounded-full no-underline"
                style={{ border: `2px solid ${accent}` }}
              >
                <span className="w-8 h-8 rounded-full border-solid border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center font-bold text-xs">
                  <AvatarContent avatar={account.avatar} initials={initials} />
                </span>
              </PageLink>
            </>
          )}

          {isGuest && (
            <PageLink
              page="Login"
              className="inline-flex items-center justify-center h-8 px-3 rounded-full border-solid border border-[#352637] bg-[#352637] text-white font-medium text-xs no-underline whitespace-nowrap"
            >
              Đăng nhập
            </PageLink>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
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
            className="relative w-full max-w-[320px] h-full bg-[var(--attempt-bg-fcfbf7,#FCFBF7)] shadow-2xl flex flex-col z-10 focus:outline-none"
          >
            {/* Drawer Header */}
            <div className="h-14 px-4 border-0 border-solid border-b border-[var(--attempt-line-d6d4d0,#D6D4D0)] flex items-center justify-between shrink-0">
              <PageLink
                page={homePage}
                onClick={closeMobile}
                className="flex items-center gap-2.5 text-[var(--attempt-text-352637,#352637)] font-bold text-base no-underline"
              >
                <span
                  className="w-7 h-7 rounded-[8px] border-solid border border-[var(--attempt-line-d6d4d0,#D6D4D0)] flex items-center justify-center font-extrabold text-xs"
                  style={{ background: accent, color: onAccent }}
                >
                  IS
                </span>
                <span>IELTSpace</span>
              </PageLink>

              <button
                type="button"
                onClick={closeMobile}
                aria-label="Đóng menu điều hướng"
                className="w-9 h-9 rounded-lg border-solid border border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] flex items-center justify-center text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f3f0ea,#F3F0EA)]"
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
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {/* Nhóm 1: Tài khoản của tôi (nếu đã đăng nhập) */}
              {!isGuest && (
                <div className="flex flex-col gap-1 pb-3 border-0 border-solid border-b border-[var(--attempt-line-d6d4d0,#D6D4D0)]">
                  <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--attempt-text-706473,#706473)]">
                    Tài khoản của tôi
                  </div>
                  {/* User profile card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--attempt-bg-ffffff,#FFFFFF)] border-solid border border-[var(--attempt-line-e6e4e0,#E6E4E0)] mb-1">
                    <span className="w-10 h-10 rounded-full bg-[var(--attempt-bg-e8e4fa,#E8E4FA)] text-[var(--attempt-text-5543b0,#5543B0)] flex items-center justify-center font-bold text-sm shrink-0 border-solid border border-[var(--attempt-line-d6d4d0,#D6D4D0)]">
                      <AvatarContent avatar={account.avatar} initials={initials} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-[var(--attempt-text-352637,#352637)] truncate">
                        {account.name || 'Học viên'}
                      </span>
                      <span className="text-xs text-[var(--attempt-text-706473,#706473)] truncate">
                        {account.email}
                      </span>
                    </div>
                  </div>

                  {/* Account Nav Items */}
                  {accountNav ? (
                    accountNav.items.map((item) => (
                      item.page ? (
                        <PageLink
                          key={item.id}
                          page={item.page}
                          onClick={() => {
                            item.onClick?.();
                            closeMobile();
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium no-underline transition-colors ${
                            item.danger
                              ? 'text-[var(--attempt-text-c0412a,#C0412A)] bg-transparent hover:bg-[var(--attempt-bg-fbdcd3,#FBDCD3)]/40'
                              : item.active
                              ? 'bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] text-[var(--attempt-text-2963cc,#2963CC)] font-semibold'
                              : 'text-[var(--attempt-text-352637,#352637)] bg-transparent hover:bg-[var(--attempt-bg-ffffff,#FFFFFF)]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {item.icon}
                            {item.label}
                          </span>
                          {item.badge}
                        </PageLink>
                      ) : (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            item.onClick?.();
                            closeMobile();
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-colors text-left border-0 cursor-pointer ${
                            item.danger
                              ? 'text-[var(--attempt-text-c0412a,#C0412A)] bg-transparent hover:bg-[var(--attempt-bg-fbdcd3,#FBDCD3)]/40'
                              : item.active
                              ? 'bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] text-[var(--attempt-text-2963cc,#2963CC)] font-semibold'
                              : 'text-[var(--attempt-text-352637,#352637)] bg-transparent hover:bg-[var(--attempt-bg-ffffff,#FFFFFF)]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {item.icon}
                            {item.label}
                          </span>
                          {item.badge}
                        </button>
                      )
                    ))
                  ) : (
                    <>
                      <PageLink
                        page="StudentHome"
                        onClick={closeMobile}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-ffffff,#FFFFFF)] no-underline font-medium"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 11l8-7 8 7v9H4z" />
                        </svg>
                        Dashboard
                      </PageLink>
                      <PageLink
                        page="MyWS"
                        onClick={closeMobile}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-ffffff,#FFFFFF)] no-underline font-medium"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 5l4 4L8 20H4v-4z" />
                        </svg>
                        Bài Writing và Speaking
                      </PageLink>
                      <PageLink
                        page="Profile"
                        onClick={closeMobile}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-ffffff,#FFFFFF)] no-underline font-medium"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                        Hồ sơ cá nhân
                      </PageLink>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          closeMobile();
                        }}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-sm text-[var(--attempt-text-c0412a,#C0412A)] hover:bg-[var(--attempt-bg-fbdcd3,#FBDCD3)]/40 font-medium text-left border-0 bg-transparent cursor-pointer"
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Nhóm 2: Khám phá */}
              <div className="flex flex-col gap-1.5">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--attempt-text-706473,#706473)]">
                  Khám phá
                </div>

                {/* Accordion 1: Thư viện đề */}
                <div className="rounded-xl border-solid border border-[var(--attempt-line-e6e4e0,#E6E4E0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExamsOpen((v) => !v)}
                    aria-expanded={examsOpen}
                    className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] border-0 bg-transparent cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] text-[var(--attempt-text-2963cc,#2963CC)] flex items-center justify-center">
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
                    <div className="p-2 pt-0 flex flex-col gap-1 border-0 border-solid border-t border-[#F0EEEA]">
                      <PageLink
                        page="FullTests"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        IELTS Full Tests
                      </PageLink>
                      <PageLink
                        page="PracticeLibrary"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        IELTS Listening Practice
                      </PageLink>
                      <PageLink
                        page="PracticeLibrary"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        IELTS Reading Practice
                      </PageLink>
                      <PageLink
                        page="PracticeWS"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        IELTS Writing Practice
                      </PageLink>
                      <PageLink
                        page="PracticeWS"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        IELTS Speaking Practice
                      </PageLink>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Thư viện bài mẫu */}
                <div className="rounded-xl border-solid border border-[var(--attempt-line-e6e4e0,#E6E4E0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSamplesOpen((v) => !v)}
                    aria-expanded={samplesOpen}
                    className="w-full flex items-center justify-between p-3.5 text-left font-semibold text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] border-0 bg-transparent cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center">
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
                    <div className="p-2 pt-0 flex flex-col gap-1 border-0 border-solid border-t border-[#F0EEEA]">
                      <PageLink
                        page="SampleLibrary" query="sampleType=WRITING_TASK_1_ACADEMIC"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        Writing Task 1 Academic
                      </PageLink>
                      <PageLink
                        page="SampleLibrary" query="sampleType=WRITING_TASK_1_GENERAL"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        Writing Task 1 General
                      </PageLink>
                      <PageLink
                        page="SampleLibrary" query="sampleType=WRITING_TASK_2"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        Writing Task 2
                      </PageLink>
                      <PageLink
                        page="SampleLibrary" query="skill=SPEAKING"
                        onClick={closeMobile}
                        className="p-2.5 rounded-lg text-sm text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)] no-underline font-medium"
                      >
                        Speaking Part 1, 2, 3
                      </PageLink>
                    </div>
                  )}
                </div>

                {/* Direct Link: Thư viện từ vựng */}
                <PageLink
                  page="Vocab"
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-solid border border-[var(--attempt-line-e6e4e0,#E6E4E0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-sm font-semibold no-underline ${
                    active === 'vocab' ? 'bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] border-[var(--attempt-line-d6d4d0,#D6D4D0)] text-[var(--attempt-text-352637,#352637)]' : 'text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)]'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-[var(--attempt-bg-dcede2,#DCEDE2)] text-[var(--attempt-text-2e6a48,#2E6A48)] flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </span>
                  Thư viện từ vựng
                </PageLink>

                {/* Direct Link: Flashcard của tôi */}
                {!isGuest && <PageLink
                  page="Flashcard"
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl border-solid border border-[var(--attempt-line-e6e4e0,#E6E4E0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-sm font-semibold no-underline ${
                    active === 'flashcard' ? 'bg-[var(--attempt-bg-e3ecfd,#E3ECFD)] border-[var(--attempt-line-d6d4d0,#D6D4D0)] text-[var(--attempt-text-352637,#352637)]' : 'text-[var(--attempt-text-352637,#352637)] hover:bg-[var(--attempt-bg-f6f4ef,#F6F4EF)]'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-[var(--attempt-bg-fbedbf,#FBEDBF)] text-[var(--attempt-text-7a5a0e,#7A5A0E)] flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M7 7h10M7 12h10M7 17h6" />
                    </svg>
                  </span>
                  Flashcard của tôi
                </PageLink>}
              </div>

              {/* Guest buttons */}
              {isGuest && (
                <div className="flex flex-col gap-2 pt-2 border-0 border-solid border-t border-[var(--attempt-line-e6e4e0,#E6E4E0)]">
                  <PageLink
                    page="Register"
                    onClick={closeMobile}
                    className="w-full h-11 flex items-center justify-center rounded-xl border-solid border border-[var(--attempt-line-d6d4d0,#D6D4D0)] bg-[var(--attempt-bg-ffffff,#FFFFFF)] text-[var(--attempt-text-352637,#352637)] font-semibold text-sm no-underline"
                  >
                    Đăng ký
                  </PageLink>
                  <PageLink
                    page="Login"
                    onClick={closeMobile}
                    className="w-full h-11 flex items-center justify-center rounded-xl bg-[#352637] text-white font-semibold text-sm no-underline"
                  >
                    Đăng nhập
                  </PageLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
