import PageLink from "../navigation/PageLink";
import type { ReactNode } from "react";
import type { PageName } from "../../app/pages";

function MenuEntry({
  page,
  label,
  description,
  icon,
  tone,
}: {
  page: PageName;
  label: string;
  description: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <a
      href={`#${page}`}
      data-nav={label}
      className="flex items-center gap-3 [padding:10px_12px] [border-radius:10px] no-underline [color:var(--attempt-text-352637)]"
    >
      <span
        className={`w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center ${tone}`}
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
          {icon}
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="font-semibold [font-size:14px]">{label}</span>
        <span className="[font-size:13px] [color:var(--attempt-text-706473)]">
          {description}
        </span>
      </span>
    </a>
  );
}
import NotificationBadge from "../notifications/NotificationBadge";

export default function LearnerHeader({
  accent,
  onAccent,
}: {
  accent: string;
  onAccent: string;
}) {
  return (
    <header className="learner-result-header [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fcfbf7)]">
      <div className="[max-width:1200px] [margin:0_auto] [padding:0_24px] [min-height:68px] flex flex-wrap items-center [gap:12px_32px]">
        <PageLink
          page="StudentLanding"
          className="flex items-center [gap:10px] no-underline [color:var(--attempt-text-352637)] font-bold [font-size:18px]"
        >
          <span
            className="w-8 h-8 [border-radius:10px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border flex items-center justify-center [font-weight:800] [font-size:13px]"
            style={{ background: accent, color: onAccent }}
          >
            {"IS"}
          </span>
          <span>{"IELTSpace"}</span>
        </PageLink>
        <nav className="flex flex-wrap gap-1">
          <div className="bu-dd relative">
            <PageLink
              page="FullTests"
              className="flex items-center [gap:6px] h-10 [padding:0_14px] rounded-lg box-border no-underline [font-size:14px] [border:1.5px_solid_transparent] [color:var(--attempt-text-4b3d4d)] font-medium"
              aria-haspopup="true"
            >
              {"Thư viện đề"}
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
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </PageLink>
            <div className="bu-dd-menu absolute [top:100%] [left:0] [padding-top:8px] [z-index:30]">
              <div
                role="menu"
                className="[width:320px] [padding:6px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:16px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
              >
                <MenuEntry
                  page="FullTests"
                  label="IELTS Full Tests"
                  description="Đề đầy đủ, chấm band như thi thật"
                  tone="[background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2963cc)]"
                  icon={
                    <>
                      <path d="M12 3l9 5-9 5-9-5z"></path>
                      <path d="M3 13l9 5 9-5"></path>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeLibrary"
                  label="IELTS Listening Practice"
                  description="Đề Listening theo Test, chọn được Section"
                  tone="[background:var(--attempt-bg-dde8fc)] [color:var(--attempt-text-2a55b8)]"
                  icon={
                    <>
                      <path d="M4 14v-2a8 8 0 0 1 16 0v2"></path>
                      <rect x="3" y="14" width="4" height="6" rx="1.5"></rect>
                      <rect x="17" y="14" width="4" height="6" rx="1.5"></rect>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeLibrary"
                  label="IELTS Reading Practice"
                  description="Đề Reading theo Test, chọn được Passage"
                  tone="[background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)]"
                  icon={
                    <>
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeWS"
                  label="IELTS Writing Practice"
                  description="Luyện riêng Task 1 hoặc Task 2"
                  tone="[background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)]"
                  icon={
                    <>
                      <path d="M15 5l4 4L8 20H4v-4z"></path>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeWS"
                  label="IELTS Speaking Practice"
                  description="Luyện riêng Part 1, 2 hoặc 3"
                  tone="[background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)]"
                  icon={
                    <>
                      <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                    </>
                  }
                />
              </div>
            </div>
          </div>
          <div className="bu-dd relative">
            <PageLink
              page="SampleLibrary"
              className="flex items-center [gap:6px] h-10 [padding:0_14px] rounded-lg box-border no-underline [font-size:14px] [border:1.5px_solid_transparent] [color:var(--attempt-text-4b3d4d)] font-medium"
              aria-haspopup="true"
            >
              {"Thư viện bài mẫu"}
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
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </PageLink>
            <div className="bu-dd-menu absolute [top:100%] [left:0] [padding-top:8px] [z-index:30]">
              <div
                role="menu"
                className="[width:320px] [padding:6px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:16px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
              >
                <MenuEntry
                  page="PracticeLibrary"
                  label="Writing Task 1 Academic"
                  description="Mô tả biểu đồ, bảng, bản đồ, quy trình"
                  tone="[background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)]"
                  icon={
                    <>
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeLibrary"
                  label="Writing Task 1 General"
                  description="Bài mẫu viết thư"
                  tone="[background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)]"
                  icon={
                    <>
                      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                      <path d="M3 7l9 6 9-6"></path>
                    </>
                  }
                />
                <MenuEntry
                  page="PracticeLibrary"
                  label="Writing Task 2"
                  description="Bài mẫu bài luận"
                  tone="[background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)]"
                  icon={
                    <>
                      <path d="M15 5l4 4L8 20H4v-4z"></path>
                    </>
                  }
                />
                <MenuEntry
                  page="SampleSpeaking"
                  label="Speaking Part 1, 2, 3"
                  description="Bản ghi lời nói, kèm audio mẫu"
                  tone="[background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)]"
                  icon={
                    <>
                      <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                    </>
                  }
                />
              </div>
            </div>
          </div>
          <PageLink
            page="Vocab"
            className="flex items-center [gap:6px] h-10 [padding:0_14px] rounded-lg box-border no-underline [font-size:14px] [border:1.5px_solid_transparent] [color:var(--attempt-text-4b3d4d)] font-medium"
          >
            {"Thư viện từ vựng"}
          </PageLink>
          <PageLink
            page="Flashcard"
            className="flex items-center [gap:6px] h-10 [padding:0_14px] rounded-lg box-border no-underline [font-size:14px] [border:1.5px_solid_transparent] [color:var(--attempt-text-4b3d4d)] font-medium"
          >
            {"Flashcard của tôi"}
          </PageLink>
        </nav>
        <div className="ml-auto flex items-center [gap:10px]">
          <PageLink
            page="Notifications"
            aria-label="Thông báo"
            className="relative w-11 h-11 box-border [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] flex items-center justify-center [color:var(--attempt-text-352637)] no-underline [background:var(--attempt-bg-ffffff)]"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <NotificationBadge className="absolute [top:-4px] [right:-4px] [min-width:20px] h-5 [padding:0_5px] box-border [border-radius:10px] [background:var(--attempt-bg-e5604a)] [color:#FFFFFF] [font-size:12px] font-bold flex items-center justify-center [border:2px_solid_var(--attempt-line-ffffff)]" />
          </PageLink>
          <PageLink
            page="AvatarMenu"
            aria-label="Tài khoản: tiến độ học tập và cài đặt"
            className="flex [padding:3px] [border-radius:50%] no-underline"
            style={{ border: "2px solid " + accent }}
          >
            <span className="[width:42px] [height:42px] [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)] flex items-center justify-center font-bold [font-size:14px]">
              {"MA"}
            </span>
          </PageLink>
        </div>
      </div>
    </header>
  );
}
