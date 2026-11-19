// frontend/src/pages/admin/samples/AdminSamples.tsx

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FormEvent } from "react";
import StaffLayout from "../../../components/layout/StaffLayout";
import { ApiError } from "../../../lib/shared/api";
import { sampleApi } from "../../../lib/samples/sample-api";
import SampleImportPanel, { sampleTemplateUrl } from "./SampleImportPanel";
import "./admin-samples.css";

type ListResponse = Awaited<ReturnType<typeof sampleApi.list>>;
type SampleCard = ListResponse["samples"][number];
type ListQuery = NonNullable<Parameters<typeof sampleApi.list>[0]>;

type Skill = "WRITING" | "SPEAKING";
type Status = "DRAFT" | "PUBLISHED" | "HIDDEN";
type SampleType = SampleCard["sampleType"];

interface SampleGroup {
  sampleType: SampleType;
  skill: Skill;
  label: string;
}

interface Filters {
  q: string;
  topic: string;
  skill: Skill | "";
  sampleType: SampleType | "";
  status: Status | "";
  page: number;
  pageSize: number;
}

interface LoadedList {
  requestKey: string;
  response: ListResponse;
}

interface ListFailure {
  requestKey: string;
  message: string;
}

const GROUPS: readonly SampleGroup[] = [
  {
    sampleType: "WRITING_TASK_1_ACADEMIC",
    skill: "WRITING",
    label: "Task 1 · Academic",
  },
  {
    sampleType: "WRITING_TASK_2",
    skill: "WRITING",
    label: "Task 2",
  },
  {
    sampleType: "WRITING_TASK_1_GENERAL",
    skill: "WRITING",
    label: "Task 1 · General Training",
  },
  {
    sampleType: "SPEAKING_PART_1",
    skill: "SPEAKING",
    label: "Part 1",
  },
  {
    sampleType: "SPEAKING_PART_2",
    skill: "SPEAKING",
    label: "Part 2",
  },
  {
    sampleType: "SPEAKING_PART_3",
    skill: "SPEAKING",
    label: "Part 3",
  },
];

const STATUS_OPTIONS: readonly {
  value: Status;
  label: string;
}[] = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Đã công bố" },
  { value: "HIDDEN", label: "Đã ẩn" },
];

const SKILL_OPTIONS: readonly {
  value: Skill | "";
  label: string;
}[] = [
  { value: "", label: "Tất cả" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
];

const INITIAL_FILTERS: Filters = {
  q: "",
  topic: "",
  skill: "",
  sampleType: "",
  status: "",
  page: 1,
  pageSize: 20,
};

const PAGE_SIZES = [10, 20, 50, 100] as const;

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function editorRoute(skill: Skill): string {
  return skill === "WRITING"
    ? "AdminSampleWriting"
    : "AdminSampleSpeaking";
}

function createHref(group: SampleGroup): string {
  const query = new URLSearchParams({
    sampleType: group.sampleType,
  });

  return `#${editorRoute(group.skill)}?${query.toString()}`;
}

function editHref(sample: SampleCard): string {
  const query = new URLSearchParams({ id: sample.id });

  return `#${editorRoute(sample.skill)}?${query.toString()}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMAT.format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : DATE_TIME_FORMAT.format(date);
}

function statusLabel(status: Status): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

function listErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem bài mẫu.";
    }

    if (error.status === 403) {
      return "Bạn không có quyền quản lý bài mẫu.";
    }

    if (error.status === 0) {
      return "Không thể kết nối máy chủ. Kiểm tra kết nối rồi thử lại.";
    }

    return error.message || "Không tải được danh sách bài mẫu.";
  }

  return "Không tải được danh sách bài mẫu. Vui lòng thử lại.";
}

function hasActiveFilters(filters: Filters): boolean {
  return Boolean(
    filters.q ||
      filters.topic ||
      filters.skill ||
      filters.sampleType ||
      filters.status,
  );
}

function SampleStatCard({ label, count, records, scope, children }: {
  label: string;
  count: number | undefined;
  records: readonly SampleCard[];
  scope?: string;
  children: ReactNode;
}) {
  const statuses = count === undefined ? "—" : [
    `${records.filter(sample => sample.status === "PUBLISHED").length} đã đăng`,
    `${records.filter(sample => sample.status === "DRAFT").length} bản nháp`,
    ...(records.some(sample => sample.status === "HIDDEN")
      ? [`${records.filter(sample => sample.status === "HIDDEN").length} đã ẩn`] : []),
  ].join(" · ");
  return (
    <article className="sample-stat-card">
      <h2>{label}</h2>
      <p className="sample-stat-number">
        <strong className="sample-stat-value">{count ?? "—"}</strong>
        <span>bài mẫu</span>
      </p>
      <p className="sample-muted">{statuses}{scope && ` · ${scope}`}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </article>
  );
}

function CreateSampleDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  return (
    <dialog id="sample-create-panel" ref={dialog} className="sample-create-dialog sample-panel"
      aria-labelledby="sample-create-title"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="sample-create-panel">
        <div>
          <h2 id="sample-create-title">Thêm bài mẫu</h2>
          <p className="sample-muted">Chọn kỹ năng để mở editor tương ứng.</p>
        </div>
        <div className="sample-create-grid">
          <a className="sample-create-card" href="#AdminSampleWriting?sampleType=WRITING_TASK_2">
            <span className="sample-create-icon sample-chip--writing" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4L8 20H4v-4z" /></svg>
            </span>
            <strong>Writing</strong>
            <span className="sample-muted">Task 1 (biểu đồ, bản đồ, thư) và Task 2</span>
          </a>
          <a className="sample-create-card" href="#AdminSampleSpeaking?sampleType=SPEAKING_PART_1">
            <span className="sample-create-icon sample-chip--speaking" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </span>
            <strong>Speaking</strong>
            <span className="sample-muted">Part 1, 2, 3 trong một editor</span>
          </a>
        </div>
        <div className="flex justify-end">
          <button type="button" className="sample-button sample-button--secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </dialog>
  );
}

function SampleListTable({ skill, groups, samples }: {
  skill: Skill;
  groups: readonly SampleGroup[];
  samples: readonly SampleCard[];
}) {
  const writing = skill === "WRITING";
  const label = writing ? "Writing" : "Speaking";
  return (
    <section className="sample-panel sample-list-panel" aria-label={`Danh sách ${label}`}>
      <header className="sample-list-heading">
        <h2>{label}</h2>
        <span className="sample-muted">
          {writing ? "Nhóm theo Task và General Training. Mỗi nhóm có nút nhập riêng." : "Nhóm theo Part 1, 2 và 3."}
        </span>
      </header>
      <div className="sample-table-scroll" role="region" aria-label={`Bảng bài mẫu ${label}`} tabIndex={0}>
        <table className="sample-table">
          <colgroup>
            <col /><col className="sample-column-detail" /><col className="sample-column-band" />
            <col className="sample-column-count" /><col className="sample-column-status" />
            <col className="sample-column-date" /><col className="sample-column-actions" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Tiêu đề</th>
              <th scope="col">{writing ? "Hình thức" : "Chủ đề"}</th>
              <th scope="col">Band</th>
              <th scope="col">{writing ? "Số từ" : "Số câu"}</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Cập nhật</th>
              <th scope="col"><span className="sr-only">Thao tác</span></th>
            </tr>
          </thead>
          {groups.map(group => {
            const rows = samples.filter(sample => sample.sampleType === group.sampleType);
            const groupLabel = group.sampleType === "WRITING_TASK_1_GENERAL" ? "General Training · Task 1 (thư)" : group.label;
            return (
              <tbody key={group.sampleType}>
                <tr className="sample-table-group">
                  <th colSpan={7}>
                    <div className="sample-group-header">
                      <span>{groupLabel}</span>
                      <span className="sample-muted">{rows.length} bài</span>
                      <a className="sample-button sample-button--secondary sample-button--small" href={createHref(group)}
                        aria-label={`Nhập bài ${label} ${group.label}`}>+ Nhập bài</a>
                    </div>
                  </th>
                </tr>
                {rows.map(sample => (
                  <tr key={sample.id}>
                    <th scope="row" className="sample-title-cell">
                      <a className="sample-title-link" href={editHref(sample)}>{sample.title}</a>
                      {writing && sample.topic && <span className="sample-muted">{sample.topic}</span>}
                    </th>
                    <td>
                      {sample.sampleType === "WRITING_TASK_1_ACADEMIC" ? <span className="sample-chip sample-chip--academic">Academic</span>
                        : sample.sampleType === "WRITING_TASK_1_GENERAL" ? <span className="sample-chip sample-chip--general">General Training</span>
                        : writing ? "—" : sample.topic || "—"}
                    </td>
                    <td>{sample.band.toFixed(1)}</td>
                    <td>{sample.sampleType === "SPEAKING_PART_2" ? 1 : "—"}</td>
                    <td>
                      <div className="sample-status-stack">
                        <span className={`sample-chip sample-chip--${sample.status.toLowerCase()}`}>
                          {sample.status === "PUBLISHED" ? "Đã đăng" : statusLabel(sample.status)}
                        </span>
                        {sample.status === "PUBLISHED" && sample.hasUnpublishedChanges && (
                          <span className="sample-muted sample-draft-note">Có nháp mới</span>
                        )}
                      </div>
                    </td>
                    <td><time dateTime={sample.draftUpdatedAt} title={formatDateTime(sample.draftUpdatedAt)}>{formatDate(sample.draftUpdatedAt)}</time></td>
                    <td className="sample-actions-cell">
                      <div className="sample-row-actions">
                        <a className="sample-button sample-button--secondary sample-button--small" href={editHref(sample)}
                          aria-label={`Mở ${sample.title}`}>Mở <span aria-hidden="true">›</span></a>
                        <button type="button" className="sample-button sample-button--danger sample-delete-button"
                          title="Chưa hỗ trợ xóa bài mẫu" aria-label="Chưa hỗ trợ xóa bài mẫu" disabled>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>
    </section>
  );
}

export default function AdminSamples() {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...INITIAL_FILTERS,
  }));
  const [searchText, setSearchText] = useState("");
  const [topicText, setTopicText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const importButton = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState<LoadedList | null>(null);
  const [failure, setFailure] = useState<ListFailure | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  // Gắn kết quả với đúng bộ lọc để không hiển thị dữ liệu của lượt tải cũ.
  const requestKey = JSON.stringify([filters, reloadVersion]);

  useEffect(() => {
    let active = true;

    const query: ListQuery = {
      page: filters.page,
      pageSize: filters.pageSize,
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.topic ? { topic: filters.topic } : {}),
      ...(filters.skill ? { skill: filters.skill } : {}),
      ...(filters.sampleType ? { sampleType: filters.sampleType } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    async function loadSamples(): Promise<void> {
      try {
        const response = await sampleApi.list(query);

        if (!active) return;

        // Dữ liệu có thể thay đổi giữa hai lượt đọc, làm trang hiện tại
        // vượt quá trang cuối. Tải lại trang hợp lệ thay vì báo rỗng giả.
        const lastPage = Math.max(1, response.pagination.totalPages);

        if (filters.page > lastPage) {
          setFilters((current) => ({
            ...current,
            page: lastPage,
          }));
          return;
        }

        setLoaded({ requestKey, response });
        setFailure(null);
      } catch (error: unknown) {
        if (!active) return;

        setFailure({
          requestKey,
          message: listErrorMessage(error),
        });
      }
    }

    void loadSamples();

    // apiFetch hiện chưa nhận AbortSignal; bỏ qua mọi phản hồi đã lỗi thời.
    return () => {
      active = false;
    };
  }, [filters, reloadVersion, requestKey]);

  const response =
    loaded?.requestKey === requestKey ? loaded.response : null;
  const error =
    failure?.requestKey === requestKey ? failure.message : null;
  const loading = response === null && error === null;

  const samples = response?.samples ?? [];
  const pagination = response?.pagination;
  const filtered = hasActiveFilters(filters);

  // API chưa có endpoint thống kê tổng theo kỹ năng/trạng thái.
  // Chỉ tổng kết quả là số toàn bộ; hai số kỹ năng được ghi rõ theo trang.
  const writing = samples.filter(sample => sample.skill === "WRITING");
  const speaking = samples.filter(sample => sample.skill === "SPEAKING");
  const statsScope = pagination && samples.length < pagination.total ? "trang hiện tại" : undefined;

  const firstItem =
    pagination && pagination.total > 0
      ? (pagination.page - 1) * pagination.pageSize + 1
      : 0;
  const lastItem =
    pagination && pagination.total > 0
      ? Math.min(
          pagination.total,
          (pagination.page - 1) * pagination.pageSize + samples.length,
        )
      : 0;

  const availableTypes = GROUPS.filter(
    (group) => !filters.skill || group.skill === filters.skill,
  );

  function applySearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      q: searchText.trim(),
      topic: topicText.trim(),
      page: 1,
    }));
  }

  function resetFilters(): void {
    setSearchText("");
    setTopicText("");
    setFilters((current) => ({
      ...INITIAL_FILTERS,
      pageSize: current.pageSize,
    }));
  }

  function selectSkill(skill: Skill | ""): void {
    setFilters((current) => {
      const selectedType = GROUPS.find(
        (group) => group.sampleType === current.sampleType,
      );

      return {
        ...current,
        skill,
        sampleType:
          skill && selectedType && selectedType.skill !== skill
            ? ""
            : current.sampleType,
        page: 1,
      };
    });
  }

  function changePage(page: number): void {
    if (!pagination || loading || error) return;

    const lastPage = Math.max(1, pagination.totalPages);

    setFilters((current) => ({
      ...current,
      page: Math.min(Math.max(1, page), lastPage),
    }));
  }

  return (
    <StaffLayout
      active="samples"
      crumb="Quản lý / Quản lý bài mẫu"
      contentClassName="p-4 sm:p-6 md:p-8"
    >
      <div className="admin-samples">
        <header className="sample-page-header sample-directory-header">
          <div>
            <h1 className="sample-page-title">Quản lý bài mẫu</h1>
            <p className="sample-directory-intro">
              Bài mẫu Writing và Speaking hiển thị ở thư viện bài mẫu của người học. Mỗi bài gồm đề bài, dàn ý, bài mẫu và phần dịch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a className="sample-button sample-button--secondary" href={sampleTemplateUrl} download>Tải Excel mẫu</a>
            <button type="button" ref={importButton} className="sample-button sample-button--secondary"
              aria-expanded={importOpen} aria-controls="sample-import-panel" aria-disabled={importOpen}
              onClick={() => setImportOpen(true)}>Nhập Excel</button>
            <button type="button" className="sample-button sample-button--primary" aria-haspopup="dialog"
              disabled={importOpen} onClick={() => setCreateOpen(true)}>+ Thêm bài mẫu</button>
          </div>
        </header>

        {createOpen && <CreateSampleDialog onClose={() => setCreateOpen(false)} />}
        {importOpen && (
          <SampleImportPanel
            onClose={() => {
              setImportOpen(false);
              importButton.current?.focus();
            }}
            onImported={() => {
              resetFilters();
              setFilters(current => ({ ...current, status: "DRAFT" }));
              setReloadVersion(version => version + 1);
            }}
          />
        )}

        <section className="sample-stats" aria-label="Tóm tắt danh sách bài mẫu">
          <SampleStatCard label="Tổng số bài mẫu" count={pagination?.total} records={samples} scope={statsScope}>
            <span className="sample-chip sample-chip--writing">Writing {response ? writing.length : "—"}</span>
            <span className="sample-chip sample-chip--speaking">Speaking {response ? speaking.length : "—"}</span>
          </SampleStatCard>
          <SampleStatCard label="Writing" count={response ? writing.length : undefined} records={writing} scope={statsScope}>
            {([
              ["WRITING_TASK_1_ACADEMIC", "Task 1 Academic", "sample-chip--academic"],
              ["WRITING_TASK_1_GENERAL", "Task 1 GT", "sample-chip--general"],
              ["WRITING_TASK_2", "Task 2", ""],
            ] as const).map(([type, label, tone]) => (
              <span key={type} className={`sample-chip ${tone}`}>{label} {response ? writing.filter(sample => sample.sampleType === type).length : "—"}</span>
            ))}
          </SampleStatCard>
          <SampleStatCard label="Speaking" count={response ? speaking.length : undefined} records={speaking} scope={statsScope}>
            {GROUPS.filter(group => group.skill === "SPEAKING").map(group => (
              <span key={group.sampleType} className="sample-chip">{group.label} {response ? speaking.filter(sample => sample.sampleType === group.sampleType).length : "—"}</span>
            ))}
          </SampleStatCard>
        </section>

        <section
          className="sample-panel"
          aria-labelledby="sample-filter-title"
        >
          <div className="sample-section-header">
            <h2 id="sample-filter-title">Tìm và lọc bài mẫu</h2>
            <button
              type="button"
              className="sample-button sample-button--secondary"
              onClick={resetFilters}
            >
              Xóa bộ lọc
            </button>
          </div>

          <form className="sample-filter-form" onSubmit={applySearch}>
            <div className="sample-filter-grid">
              <label className="sample-field">
                <span>Tìm kiếm</span>
                <input
                  type="search"
                  value={searchText}
                  maxLength={200}
                  placeholder="Tìm theo tiêu đề hoặc chủ đề"
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>

              <label className="sample-field">
                <span>Chủ đề chính xác</span>
                <input
                  type="text"
                  value={topicText}
                  maxLength={200}
                  placeholder="Ví dụ: Education"
                  onChange={(event) => setTopicText(event.target.value)}
                />
              </label>
            </div>

            <div className="sample-filter-actions">
              <button
                type="submit"
                className="sample-button sample-button--primary"
              >
                Áp dụng tìm kiếm
              </button>
              <span className="sample-muted">
                Tiêu đề/chủ đề được tìm theo chuỗi; bộ lọc chủ đề khớp
                chính xác.
              </span>
            </div>
          </form>

          <div className="sample-filter-toolbar">
            <div className="sample-field">
              <span>Kỹ năng</span>
              <div className="sample-segment" role="group" aria-label="Kỹ năng">
                {SKILL_OPTIONS.map((option) => (
                  <button
                    key={option.value || "all"}
                    type="button"
                    className="sample-segment-button"
                    aria-pressed={filters.skill === option.value}
                    onClick={() => selectSkill(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="sample-field">
              <span>Loại bài</span>
              <select
                value={filters.sampleType}
                onChange={(event) => {
                  const value = event.target.value;
                  const group = availableTypes.find(
                    (option) => option.sampleType === value,
                  );

                  setFilters((current) => ({
                    ...current,
                    sampleType: group?.sampleType ?? "",
                    page: 1,
                  }));
                }}
              >
                <option value="">Mọi loại bài</option>
                {availableTypes.map((group) => (
                  <option
                    key={group.sampleType}
                    value={group.sampleType}
                  >
                    {group.skill === "WRITING" ? "Writing" : "Speaking"}
                    {" · "}
                    {group.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="sample-field">
              <span>Trạng thái</span>
              <select
                value={filters.status}
                onChange={(event) => {
                  const value = event.target.value;
                  const option = STATUS_OPTIONS.find(
                    (item) => item.value === value,
                  );

                  setFilters((current) => ({
                    ...current,
                    status: option?.value ?? "",
                    page: 1,
                  }));
                }}
              >
                <option value="">Mọi trạng thái</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="sample-field">
              <span>Số bài mỗi trang</span>
              <select
                value={filters.pageSize}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (!PAGE_SIZES.some((size) => size === value)) return;

                  setFilters((current) => ({
                    ...current,
                    pageSize: value,
                    page: 1,
                  }));
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} bài
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div
          className="sample-results"
          aria-busy={loading}
          aria-label="Kết quả danh sách bài mẫu"
        >
          {loading && (
            <div className="sample-panel sample-state" role="status">
              <p>Đang tải danh sách bài mẫu…</p>
            </div>
          )}

          {error && (
            <div
              className="sample-panel sample-state sample-state--error"
              role="alert"
            >
              <h2>Không tải được bài mẫu</h2>
              <p>{error}</p>
              <button
                type="button"
                className="sample-button sample-button--secondary"
                onClick={() => setReloadVersion((current) => current + 1)}
              >
                Thử lại
              </button>
            </div>
          )}

          {response && samples.length === 0 && (
            <p className="sample-muted" role="status">{filtered ? "Không tìm thấy bài mẫu phù hợp." : "Chưa có bài mẫu."}</p>
          )}
          {response && (["WRITING", "SPEAKING"] as const).map(skill => {
            const groups = availableTypes.filter(group => group.skill === skill
              && (!filters.sampleType || group.sampleType === filters.sampleType));
            return groups.length > 0 && <SampleListTable key={skill} skill={skill} groups={groups} samples={samples} />;
          })}
        </div>

        {response && !error && pagination && pagination.total > 0 && (
          <nav
            className="sample-pagination"
            aria-label="Phân trang bài mẫu"
          >
            <p className="sample-muted" role="status">
              Hiển thị {firstItem}–{lastItem} /{" "}
              {pagination.total.toLocaleString("vi-VN")} bài
            </p>

            <div className="sample-pagination-actions">
              <button
                type="button"
                className="sample-button sample-button--secondary"
                disabled={pagination.page <= 1}
                onClick={() => changePage(1)}
                aria-label="Đến trang đầu"
              >
                « Đầu
              </button>

              <button
                type="button"
                className="sample-button sample-button--secondary"
                disabled={pagination.page <= 1}
                onClick={() => changePage(pagination.page - 1)}
              >
                ‹ Trước
              </button>

              <span className="sample-pagination-current">
                Trang {pagination.page} /{" "}
                {Math.max(1, pagination.totalPages)}
              </span>

              <button
                type="button"
                className="sample-button sample-button--secondary"
                disabled={
                  pagination.page >= Math.max(1, pagination.totalPages)
                }
                onClick={() => changePage(pagination.page + 1)}
              >
                Sau ›
              </button>

              <button
                type="button"
                className="sample-button sample-button--secondary"
                disabled={
                  pagination.page >= Math.max(1, pagination.totalPages)
                }
                onClick={() => changePage(pagination.totalPages)}
                aria-label="Đến trang cuối"
              >
                Cuối »
              </button>
            </div>
          </nav>
        )}

      </div>
    </StaffLayout>
  );
}
