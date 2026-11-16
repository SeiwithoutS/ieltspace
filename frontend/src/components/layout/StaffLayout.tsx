import React, { useState, useEffect } from 'react';
import AdminSidebar from '../navigation/AdminSidebar';
import TeacherSidebar from '../navigation/TeacherSidebar';
import AdminTopbar, { Crumb } from '../navigation/AdminTopbar';

export type StaffLayoutProps = {
  active: string;
  crumbs?: Crumb[];
  crumb?: string;
  role?: 'ADMIN' | 'TEACHER';
  onNavigate?: (go: () => void) => void;
  children: React.ReactNode;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
};

export default function StaffLayout({
  active,
  crumbs,
  crumb,
  role = 'ADMIN',
  onNavigate,
  children,
  contentClassName = '',
  contentStyle,
}: StaffLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      if (w >= 1024) {
        setDrawerOpen(false);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth, { passive: true });
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Lock body scroll when drawer overlay is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setDrawerOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  const SidebarComp = role === 'TEACHER' ? TeacherSidebar : AdminSidebar;

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-[#FCFBF7] text-[#352637] flex flex-col font-sans">
      {/* Mobile warning banner (< 768px) */}
      {isMobile && !bannerDismissed && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-[#FFF7ED] border-b border-[#FED7AA] px-4 py-2 text-xs text-[#9A4A17] flex items-center justify-between z-30 flex-none"
        >
          <div className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>
              Trang quản lý được thiết kế cho máy tính bảng và máy tính. Một số thao tác có thể khó dùng trên điện thoại.
            </span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-[#9A4A17] hover:text-[#7A340D] p-1 font-bold text-sm leading-none ml-2"
            aria-label="Đóng cảnh báo thiết bị"
          >
            ×
          </button>
        </aside>
      )}

      {/* Main shell: flex row for desktop, drawer overlay for mobile/tablet */}
      <div className="flex flex-1 items-stretch min-h-0 relative">
        {/* Desktop inline sidebar (>= 1024px) */}
        <aside className="hidden lg:flex flex-none min-h-0 overflow-hidden" aria-label="Thanh điều hướng chính">
          <SidebarComp active={active} collapsed={isTablet} />
        </aside>

        {/* Mobile/Tablet drawer overlay (< 1024px) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 transition-opacity"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <div className="relative z-10 h-full max-w-[280px] shadow-2xl flex flex-col bg-[#FCFBF7]">
              <div className="flex justify-end p-2 bg-[#FCFBF7] border-b border-[#E6E4E0]">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#706473] hover:bg-[#F3F0EA]"
                  aria-label="Đóng thanh điều hướng"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setDrawerOpen(false)}>
                <SidebarComp active={active} collapsed={false} />
              </div>
            </div>
          </div>
        )}

        {/* Content column */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-[#FAF9F5]">
          <AdminTopbar
            crumbs={crumbs}
            crumb={crumb}
            role={role}
            onNavigate={onNavigate}
            onToggleSidebar={() => setDrawerOpen((prev) => !prev)}
          />
          <main className={`flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain ${contentClassName}`} style={contentStyle}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
