import React, { useEffect, useState } from 'react';
import {
  getSkillHistory,
  type SkillHistoryDto,
  type SkillHistoryVersion,
  type SkillHistoryEvent,
} from '../../lib/exam-editor';

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

function getStatusBadge(status: SkillHistoryVersion['status']) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
          Đang soạn
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          Đang đăng
        </span>
      );
    case 'HIDDEN':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
          Đang ẩn
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          Đã lưu trữ
        </span>
      );
    default:
      return null;
  }
}

export const SkillHistoryDrawer: React.FC<SkillHistoryDrawerProps> = ({
  isOpen,
  onClose,
  skillId,
  onSelectVersion,
}) => {
  const [tab, setTab] = useState<'versions' | 'events'>('versions');
  const [data, setData] = useState<SkillHistoryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Lịch sử phiên bản"
          className="w-screen max-w-[420px] bg-white shadow-2xl flex flex-col h-full text-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-base font-bold text-slate-900">
                Lịch sử phiên bản
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-5 bg-white text-sm font-semibold">
            <button
              onClick={() => setTab('versions')}
              className={`py-3 mr-6 border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === 'versions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Phiên bản</span>
              {data && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {data.versions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('events')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === 'events'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Hoạt động</span>
              {data && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {data.events.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Đang tải lịch sử...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                <p className="font-semibold mb-1">Lỗi tải dữ liệu</p>
                <p>{error}</p>
                <button
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
                  className="mt-3 px-3 py-1.5 rounded bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition"
                >
                  Thử lại
                </button>
              </div>
            ) : tab === 'versions' ? (
              <div className="space-y-3">
                {data?.versions.map((ver) => {
                  const isCurrent = ver.isCurrent;
                  return (
                    <div
                      key={ver.id}
                      onClick={() => {
                        if (onSelectVersion && !isCurrent) {
                          onSelectVersion(ver.id);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-indigo-400 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-300'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            Phiên bản {ver.versionNumber}
                          </span>
                          {getStatusBadge(ver.status)}
                        </div>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            Đang mở
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>
                          Tạo ngày {formatFullDate(ver.createdAt)}
                          {ver.createdBy?.name ? ` · bởi ${ver.createdBy.name}` : ''}
                        </div>
                        {ver.basedOnVersion != null && (
                          <div className="text-indigo-600 font-medium">
                            ↳ Tạo từ phiên bản {ver.basedOnVersion}
                          </div>
                        )}
                        {ver.publishedAt && (
                          <div className="text-emerald-700">
                            Đã đăng: {formatFullDate(ver.publishedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(groupedEvents).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Chưa có nhật ký hoạt động nào.
                  </p>
                ) : (
                  Object.entries(groupedEvents).map(([day, evts]) => (
                    <div key={day}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        {day}
                      </h3>
                      <div className="border-l-2 border-slate-200 ml-2 space-y-4 pl-4">
                        {evts.map((evt, idx) => (
                          <div key={idx} className="relative text-xs">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                            <div className="font-semibold text-slate-800">
                              {evt.summary}
                            </div>
                            <div className="text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{formatTime(evt.at)}</span>
                              {evt.actor?.name && <span>· {evt.actor.name}</span>}
                            </div>
                          </div>
                        ))}
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
