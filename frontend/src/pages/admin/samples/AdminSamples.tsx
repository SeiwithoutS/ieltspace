// frontend/src/pages/admin/samples/AdminSamples.tsx

import { useEffect, useRef, useState, type ReactNode } from "react";
import StaffLayout from "../../../components/layout/StaffLayout";
import { ApiError } from "../../../lib/shared/api";
import { sampleApi } from "../../../lib/samples/sample-api";
import {
  AdminPagination,
  Button,
  Chip,
  DataCard,
  DataTable,
  Dialog,
  DialogBody,
  DialogFoot,
  DialogHead,
  EmptyState,
  FilterBar,
  Icon,
  PageHeader,
  SearchField,
  SegmentedTabs,
  StatCard,
  StatGrid,
  TextField,
} from "../../../components/shared/ui";
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

const STATUS_TONE = { PUBLISHED: "published", DRAFT: "draft", HIDDEN: "hidden" } as const;

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
    filters.q.trim() ||
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
    <StatCard label={label} value={count ?? "—"} unit="bài mẫu" sub={`${statuses}${scope ? ` · ${scope}` : ""}`}>
      {children}
    </StatCard>
  );
}

function CreateSampleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Thêm bài mẫu" width={520}>
      <DialogBody>
        <DialogHead title="Thêm bài mẫu" description="Chọn kỹ năng để mở editor tương ứng." onClose={onClose} />
        <div className="sample-create-grid">
          <a className="sample-create-card lift" href="#AdminSampleWriting?sampleType=WRITING_TASK_2">
            <span className="sample-create-icon sample-create-icon--writing" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4L8 20H4v-4z" /></svg>
            </span>
            <strong>Writing</strong>
            <span className="sample-muted">Task 1 (biểu đồ, bản đồ, thư) và Task 2</span>
          </a>
          <a className="sample-create-card lift" href="#AdminSampleSpeaking?sampleType=SPEAKING_PART_1">
            <span className="sample-create-icon sample-create-icon--speaking" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </span>
            <strong>Speaking</strong>
            <span className="sample-muted">Part 1, 2, 3 trong một editor</span>
          </a>
        </div>
        <DialogFoot>
          <Button className="press" onClick={onClose}>Đóng</Button>
        </DialogFoot>
      </DialogBody>
    </Dialog>
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
    <DataCard
      label={`Danh sách ${label}`}
      title={label}
      aside={writing ? "Nhóm theo Task và General Training. Mỗi nhóm có nút nhập riêng." : "Nhóm theo Part 1, 2 và 3."}
    >
      <DataTable label={`Bảng bài mẫu ${label}`} minWidth={860} fixed>
        <colgroup>
          <col /><col className="sample-column-detail" /><col className="sample-column-band" />
          <col className="sample-column-count" /><col className="sample-column-status" />
          <col className="sample-column-date" /><col className="sample-column-actions" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="ui-th">Tiêu đề</th>
            <th scope="col" className="ui-th">{writing ? "Hình thức" : "Chủ đề"}</th>
            <th scope="col" className="ui-th">Band</th>
            <th scope="col" className="ui-th">{writing ? "Số từ" : "Số câu"}</th>
            <th scope="col" className="ui-th">Trạng thái</th>
            <th scope="col" className="ui-th">Cập nhật</th>
            <th scope="col" className="ui-th"><span className="sr-only">Thao tác</span></th>
          </tr>
        </thead>
        {groups.map(group => {
          const rows = samples.filter(sample => sample.sampleType === group.sampleType);
          const groupLabel = group.sampleType === "WRITING_TASK_1_GENERAL" ? "General Training · Task 1 (thư)" : group.label;
          return (
            <tbody key={group.sampleType}>
              <tr className="ui-table__group">
                <th colSpan={7}>
                  <div className="ui-table__group-head">
                    <span>{groupLabel}</span>
                    <span className="sample-muted">{rows.length} bài</span>
                    <Button as="a" size="sm" href={createHref(group)}
                      aria-label={`Nhập bài ${label} ${group.label}`}>+ Nhập bài</Button>
                  </div>
                </th>
              </tr>
              {rows.map(sample => (
                <tr key={sample.id}>
                  <th scope="row" className="ui-td sample-title-cell">
                    <a className="sample-title-link" href={editHref(sample)}>{sample.title}</a>
                    {writing && sample.topic && <span className="sample-muted">{sample.topic}</span>}
                  </th>
                  <td className="ui-td">
                    {sample.sampleType === "WRITING_TASK_1_ACADEMIC" ? <Chip tone="form-A">Academic</Chip>
                      : sample.sampleType === "WRITING_TASK_1_GENERAL" ? <Chip tone="form-G">General Training</Chip>
                      : writing ? "—" : sample.topic || "—"}
                  </td>
                  <td className="ui-td">{sample.band.toFixed(1)}</td>
                  <td className="ui-td">{sample.sampleType === "SPEAKING_PART_2" ? 1 : "—"}</td>
                  <td className="ui-td">
                    <div className="sample-status-stack">
                      <Chip tone={STATUS_TONE[sample.status]}>
                        {sample.status === "PUBLISHED" ? "Đã đăng" : statusLabel(sample.status)}
                      </Chip>
                      {sample.status === "PUBLISHED" && sample.hasUnpublishedChanges && (
                        <span className="sample-muted sample-draft-note">Có nháp mới</span>
                      )}
                    </div>
                  </td>
                  <td className="ui-td ui-td--nowrap ui-td--muted"><time dateTime={sample.draftUpdatedAt} title={formatDateTime(sample.draftUpdatedAt)}>{formatDate(sample.draftUpdatedAt)}</time></td>
                  <td className="ui-td ui-td--right ui-td--nowrap">
                    <span className="ui-rowactions">
                      <Button as="a" className="press ui-btn--h34" href={editHref(sample)}
                        aria-label={`Mở ${sample.title}`}>Mở <Icon name="chevron-right" size={15} /></Button>
                      <Button icon size="sm" variant="danger" className="press"
                        title="Chưa hỗ trợ xóa bài mẫu" aria-label="Chưa hỗ trợ xóa bài mẫu" disabled>
                        <Icon name="trash" size={15} />
                      </Button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </DataTable>
    </DataCard>
  );
}

export default function AdminSamples() {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...INITIAL_FILTERS,
  }));
  const [topicText, setTopicText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
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
      ...(filters.q.trim() ? { q: filters.q.trim() } : {}),
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

  // Từ khóa tìm kiếm áp dụng tức thì (SearchField đã debounce); chủ đề chính xác áp dụng sau 300ms.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const topic = topicText.trim();
      setFilters((current) => (current.topic === topic ? current : { ...current, topic, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [topicText]);

  function resetFilters(): void {
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
        <PageHeader
          title="Quản lý bài mẫu"
          description="Bài mẫu Writing và Speaking hiển thị ở thư viện bài mẫu của người học. Mỗi bài gồm đề bài, dàn ý, bài mẫu và phần dịch."
          actions={
            <>
              <Button as="a" href={sampleTemplateUrl} download>Tải Excel mẫu</Button>
              <button type="button" ref={importButton} className="ui-btn"
                aria-expanded={importOpen} aria-controls="sample-import-panel" aria-disabled={importOpen}
                onClick={() => setImportOpen(true)}>Nhập Excel</button>
              <Button variant="primary" className="press" aria-haspopup="dialog"
                disabled={importOpen} onClick={() => setCreateOpen(true)}>
                <Icon name="plus" />
                Thêm bài mẫu
              </Button>
            </>
          }
        />

        <CreateSampleDialog open={createOpen} onClose={() => setCreateOpen(false)} />
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

        <StatGrid label="Tóm tắt danh sách bài mẫu" min={240}>
          <SampleStatCard label="Tổng số bài mẫu" count={pagination?.total} records={samples} scope={statsScope}>
            <Chip size="sm" tone="skill-W">Writing {response ? writing.length : "—"}</Chip>
            <Chip size="sm" tone="skill-S">Speaking {response ? speaking.length : "—"}</Chip>
          </SampleStatCard>
          <SampleStatCard label="Writing" count={response ? writing.length : undefined} records={writing} scope={statsScope}>
            {([
              ["WRITING_TASK_1_ACADEMIC", "Task 1 Academic", "form-A"],
              ["WRITING_TASK_1_GENERAL", "Task 1 GT", "form-G"],
              ["WRITING_TASK_2", "Task 2", "neutral"],
            ] as const).map(([type, label, tone]) => (
              <Chip key={type} size="sm" tone={tone}>{label} {response ? writing.filter(sample => sample.sampleType === type).length : "—"}</Chip>
            ))}
          </SampleStatCard>
          <SampleStatCard label="Speaking" count={response ? speaking.length : undefined} records={speaking} scope={statsScope}>
            {GROUPS.filter(group => group.skill === "SPEAKING").map(group => (
              <Chip key={group.sampleType} size="sm" tone="neutral">{group.label} {response ? speaking.filter(sample => sample.sampleType === group.sampleType).length : "—"}</Chip>
            ))}
          </SampleStatCard>
        </StatGrid>

        <FilterBar
          label="Tìm và lọc bài mẫu"
          count={pagination ? pagination.total.toLocaleString("vi-VN") + " kết quả" : undefined}
          filtered={filtered}
          onClear={resetFilters}
          more={
            <>
              <TextField
                as="select"
                label="Loại bài"
                value={filters.sampleType}
                onChange={(event) => {
                  const value = event.target.value;
                  const group = availableTypes.find((option) => option.sampleType === value);
                  setFilters((current) => ({ ...current, sampleType: group?.sampleType ?? "", page: 1 }));
                }}
              >
                <option value="">Mọi loại bài</option>
                {availableTypes.map((group) => (
                  <option key={group.sampleType} value={group.sampleType}>
                    {group.skill === "WRITING" ? "Writing" : "Speaking"}
                    {" · "}
                    {group.label}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Chủ đề chính xác"
                type="text"
                value={topicText}
                maxLength={200}
                placeholder="Ví dụ: Education"
                onChange={(event) => setTopicText(event.target.value)}
              />
              <TextField
                as="select"
                label="Số bài mỗi trang"
                value={filters.pageSize}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!PAGE_SIZES.some((size) => size === value)) return;
                  setFilters((current) => ({ ...current, pageSize: value, page: 1 }));
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} bài
                  </option>
                ))}
              </TextField>
            </>
          }
          moreOpen={moreOpen}
          onToggleMore={() => setMoreOpen((open) => !open)}
          moreActive={(filters.sampleType ? 1 : 0) + (filters.topic ? 1 : 0)}
        >
          <SearchField
            value={filters.q}
            maxLength={200}
            placeholder="Tìm theo tiêu đề hoặc chủ đề"
            label="Tìm kiếm bài mẫu"
            onChange={(q) => setFilters((current) => ({ ...current, q, page: 1 }))}
          />
          <SegmentedTabs
            label="Kỹ năng"
            value={filters.skill}
            onChange={selectSkill}
            options={SKILL_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          />
          <SegmentedTabs
            label="Trạng thái"
            value={filters.status}
            onChange={(status) => setFilters((current) => ({ ...current, status, page: 1 }))}
            options={[{ value: "", label: "Mọi trạng thái" }, ...STATUS_OPTIONS.map((option) => ({ value: option.value as Status | "", label: option.label }))]}
          />
        </FilterBar>

        <div
          className="sample-results"
          aria-busy={loading}
          aria-label="Kết quả danh sách bài mẫu"
        >
          {loading && (
            <div className="sample-panel">
              <EmptyState kind="loading">Đang tải danh sách bài mẫu…</EmptyState>
            </div>
          )}

          {error && (
            <div className="sample-panel">
              <EmptyState
                kind="error"
                action={<Button onClick={() => setReloadVersion((current) => current + 1)}>Thử lại</Button>}
              >
                {"Không tải được bài mẫu. " + error}
              </EmptyState>
            </div>
          )}

          {response && samples.length === 0 && (
            <EmptyState action={filtered ? <Button size="sm" onClick={resetFilters}>Xóa bộ lọc</Button> : undefined}>{filtered ? "Không tìm thấy bài mẫu phù hợp." : "Chưa có bài mẫu."}</EmptyState>
          )}
          {response && (["WRITING", "SPEAKING"] as const).map(skill => {
            const groups = availableTypes.filter(group => group.skill === skill
              && (!filters.sampleType || group.sampleType === filters.sampleType));
            return groups.length > 0 && <SampleListTable key={skill} skill={skill} groups={groups} samples={samples} />;
          })}
        </div>

        {response && !error && pagination && pagination.total > 0 && (
          <div className="sample-pagination">
            <p className="sample-muted" role="status">
              Hiển thị {firstItem}–{lastItem} /{" "}
              {pagination.total.toLocaleString("vi-VN")} bài
            </p>

            <AdminPagination showEdges page={pagination.page} pages={Math.max(1, pagination.totalPages)} onPage={changePage} label="Phân trang bài mẫu" />
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
