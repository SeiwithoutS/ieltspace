import React, { useEffect, useState } from 'react';
import {
  getSkillHistory,
  type SkillHistoryDto,
  type SkillHistoryVersion,
  type SkillHistoryEvent,
} from '../../lib/exams/exam-editor';

export type SkillHistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  skillId: string | null;
  onSelectVersion?: (versionId: string) => void;
};

const viDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const viTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
});

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : viDateFormatter.format(d);
  } catch {
    return '';
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : viTimeFormatter.format(d);
  } catch {
    return '';
  }
}

const BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold leading-[18px] whitespace-nowrap';

function getStatusBadge(status: SkillHistoryVersion['status']) {
  switch (status) {
    case 'DRAFT':
      return <span className={`${BADGE_BASE} bg-[#FBEDBF] text-[#7A5A0E]`}>Đang soạn</span>;
    case 'PUBLISHED':
      return <span className={`${BADGE_BASE} bg-[#DCEDE2] text-[#2E6A48]`}>Đang đăng</span>;
    case 'HIDDEN':
      return <span className={`${BADGE_BASE} bg-[#F3F0EA] text-[#706473]`}>Đang ẩn</span>;
    case 'ARCHIVED':
      return <span className={`${BADGE_BASE} bg-[#F3F1EC] text-[#8A818C]`}>Đã lưu trữ</span>;
    default:
      return null;
  }
}

type TabKey = 'versions' | 'events';

const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2963CC]/30 focus-visible:ring-offset-0';

export const SkillHistoryDrawer: React.FC<SkillHistoryDrawerProps> = ({
  isOpen,
  onClose,
  skillId,
  onSelectVersion,
}) => {
  const [tab, setTab] = useState<TabKey>('versions');
  const [data, setData] = useState<SkillHistoryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !skillId) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getSkillHistory(skillId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Không thể tải lịch sử phiên bản.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, skillId]);

  if (!isOpen) return null;

  // Group events by day
  const groupedEvents: Record<string, SkillHistoryEvent[]> = {};
  if (data?.events) {
    for (const evt of data.events) {
      const day = formatFullDate(evt.at) || 'Khác';
      if (!groupedEvents[day]) groupedEvents[day] = [];
      groupedEvents[day].push(evt);
    }
  }

  const tabs: { key: TabKey; label: string; count: number | null }[] = [
    { key: 'versions', label: 'Phiên bản', count: data ? data.versions.length : null },
    { key: 'events', label: 'Hoạt động', count: data ? data.events.length : null },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next: TabKey = tab === 'versions' ? 'events' : 'versions';
    setTab(next);
    document.getElementById(`skill-history-tab-${next}`)?.focus();
  };

  const emptyText = 'text-[14px] text-[#706473] text-center py-12';

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#352637]/35 transition-opacity duration-200 motion-reduce:transition-none ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Lịch sử phiên bản"
          className={`w-screen md:w-[400px] bg-white shadow-[-8px_0_32px_rgba(53,38,55,0.14)] flex flex-col h-full text-[#352637] font-['Inter','Be_Vietnam_Pro',system-ui,sans-serif] transform transition-transform duration-200 ease-out motion-reduce:transition-none ${
            entered ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-0 border-b border-solid border-[#ECEAE5] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg
                className="w-5 h-5 text-[#706473] flex-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="m-0 text-[18px] leading-6 font-semibold text-[#352637] truncate">
                Lịch sử phiên bản
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`flex-none w-9 h-9 inline-flex items-center justify-center rounded-[10px] border-0 font-[inherit] bg-transparent p-0 text-[#706473] cursor-pointer transition-colors hover:bg-[#F6F4EF] hover:text-[#352637] ${FOCUS_RING}`}
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div
              role="tablist"
              aria-label="Lịch sử phiên bản"
              className="flex gap-1 p-1 rounded-[12px] bg-[#F6F4EF]"
            >
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    id={`skill-history-tab-${t.key}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="skill-history-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.key)}
                    onKeyDown={onTabKeyDown}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-[10px] border-0 font-[inherit] text-[14px] cursor-pointer transition-colors ${FOCUS_RING} ${
                      active
                        ? 'bg-white text-[#352637] font-semibold shadow-[0_1px_2px_rgba(53,38,55,0.12)]'
                        : 'bg-transparent text-[#706473] font-medium hover:text-[#352637]'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.count !== null && (
                      <span
                        className={`min-w-[20px] px-1.5 rounded-full text-[12px] leading-[18px] font-semibold text-center ${
                          active ? 'bg-[#E3ECFD] text-[#2257B8]' : 'bg-[#E7E4DD] text-[#706473]'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div
            id="skill-history-panel"
            role="tabpanel"
            aria-labelledby={`skill-history-tab-${tab}`}
            className="flex-1 min-h-0 overflow-y-auto px-5 py-4"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#706473]">
                <div className="w-7 h-7 border-[3px] border-solid border-[#2963CC] border-t-transparent rounded-full animate-spin mb-3 motion-reduce:animate-none" />
                <p className="m-0 text-[14px]">Đang tải lịch sử...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center py-10 px-2">
                <p className="m-0 mb-1 text-[15px] font-semibold text-[#C0412A]">Lỗi tải dữ liệu</p>
                <p className="m-0 text-[14px] text-[#C0412A]">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (skillId) {
                      setLoading(true);
                      setError(null);
                      getSkillHistory(skillId)
                        .then((res) => {
                          setData(res);
                          setLoading(false);
                        })
                        .catch((e) => {
                          setError(e?.message || 'Không thể tải lịch sử.');
                          setLoading(false);
                        });
                    }
                  }}
                  className={`mt-4 h-9 px-4 rounded-full font-[inherit] border-[1.5px] border-solid border-[#D6D4D0] bg-white text-[13px] font-semibold text-[#352637] cursor-pointer transition-colors hover:bg-[#F6F4EF] ${FOCUS_RING}`}
                >
                  Thử lại
                </button>
              </div>
            ) : tab === 'versions' ? (
              <div className="flex flex-col gap-3">
                {(data?.versions.length ?? 0) === 0 && (
                  <p className={`m-0 ${emptyText}`}>Chưa có phiên bản nào.</p>
                )}
                {data?.versions.map((ver) => {
                  const isCurrent = ver.isCurrent;
                  const selectable = !!onSelectVersion && !isCurrent;
                  const meta: string[] = [`Tạo ngày ${formatFullDate(ver.createdAt)}`];
                  if (ver.createdBy?.name) meta.push(`bởi ${ver.createdBy.name}`);
                  if (ver.basedOnVersion != null) meta.push(`tạo từ phiên bản ${ver.basedOnVersion}`);
                  return (
                    <div
                      key={ver.id}
                      role={selectable ? 'button' : undefined}
                      tabIndex={selectable ? 0 : undefined}
                      onClick={() => {
                        if (onSelectVersion && !isCurrent) {
                          onSelectVersion(ver.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (selectable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onSelectVersion?.(ver.id);
                        }
                      }}
                      className={`px-4 py-3.5 rounded-[12px] border-[1.5px] border-solid transition-colors ${FOCUS_RING} ${
                        isCurrent
                          ? 'border-[#2963CC]/40 bg-[#F4F7FE]'
                          : `border-[#ECEAE5] bg-white ${
                              selectable ? 'cursor-pointer hover:border-[#D6D4D0] hover:bg-[#FCFBF7]' : ''
                            }`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-[15px] leading-6 font-semibold text-[#352637]">
                            Phiên bản {ver.versionNumber}
                          </span>
                          {getStatusBadge(ver.status)}
                        </div>
                        {isCurrent && (
                          <span className="flex-none inline-flex items-center px-2 py-0.5 rounded-full border border-solid border-[#2963CC] bg-transparent text-[12px] leading-[16px] font-semibold text-[#2963CC] whitespace-nowrap">
                            Đang mở
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[13px] leading-5 text-[#706473]">
                        {meta.map((m, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="mx-1.5 text-[#B9B4BB]" aria-hidden="true">·</span>}
                            <span>{m}</span>
                          </React.Fragment>
                        ))}
                      </div>
                      {ver.publishedAt && (
                        <div className="mt-0.5 text-[13px] leading-5 text-[#2E7D4F]">
                          Đã đăng: {formatFullDate(ver.publishedAt)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {Object.keys(groupedEvents).length === 0 ? (
                  <p className={`m-0 ${emptyText}`}>Chưa có nhật ký hoạt động nào.</p>
                ) : (
                  Object.entries(groupedEvents).map(([day, evts]) => (
                    <div key={day}>
                      <h3 className="m-0 mb-3 text-[12px] leading-4 font-semibold uppercase tracking-[0.06em] text-[#706473]">
                        {day}
                      </h3>
                      <div className="ml-[5px]">
                        {evts.map((evt, idx) => {
                          const last = idx === evts.length - 1;
                          return (
                            <div key={idx} className={`relative pl-5 ${last ? '' : 'pb-4'}`}>
                              {!last && (
                                <span className="absolute left-[4px] top-4 bottom-[-2px] w-[1.5px] bg-[#ECEAE5]" aria-hidden="true" />
                              )}
                              <span
                                className="absolute left-0 top-[6px] w-[10px] h-[10px] rounded-full bg-white border-2 border-solid border-[#2963CC]"
                                aria-hidden="true"
                              />
                              <div className="text-[14px] leading-5 text-[#352637]">{evt.summary}</div>
                              <div className="mt-0.5 text-[12px] leading-4 text-[#706473]">
                                <span>{formatTime(evt.at)}</span>
                                {evt.actor?.name && (
                                  <>
                                    <span className="mx-1.5 text-[#B9B4BB]" aria-hidden="true">·</span>
                                    <span>{evt.actor.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SkillHistoryDrawer;
