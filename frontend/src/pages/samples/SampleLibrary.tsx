import SampleMediaPreview from "../../components/samples/SampleMediaPreview";
import PageLink from "../../components/navigation/PageLink";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../lib/auth/auth";
import { sampleApi } from "../../lib/samples/sample-api";
import {
  encodeSampleQuery,
  publicSampleTypes,
  readSampleQuery,
  sampleDetailHref,
  sampleLibraryHref,
  sampleTypeLabels,
  type PublicSampleCard,
  type PublicSampleListResponse,
  type PublicSamplePageProps,
  type PublicSampleQuery,
  type PublicSampleSkill,
} from "../../lib/samples/sample-public";
import { SampleNotice, SampleShell } from "./sample-public-ui";
import "../../components/shared/library-cards.css";

const libraryGroups = [
  { type: "WRITING_TASK_1_GENERAL", title: "Writing Task 1 General", description: "Bài mẫu viết thư theo từng loại thư thường gặp." },
  { type: "WRITING_TASK_1_ACADEMIC", title: "Writing Task 1 Academic", description: "Bài mẫu mô tả biểu đồ, bản đồ và quy trình." },
  { type: "WRITING_TASK_2", title: "Writing Task 2", description: "Bài luận theo các chủ đề thường gặp trong IELTS." },
  { type: "SPEAKING", title: "Speaking Part 1, 2, 3", description: "Bản ghi lời nói và câu trả lời theo từng Part." },
] as const;

const libraryHighlights = [
  { label: "Bài mẫu band 7.0+", path: "M15 5l4 4L8 20H4v-4z" },
  { label: "Dàn ý và từ vựng", path: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" },
  { label: "Đề mới mỗi quý", path: "m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" },
];

function LibraryBanner() {
  const { user } = useAuth();
  return (
    <header className="samples-library-hero">
      <div className="samples-library-intro">
        <nav aria-label="Đường dẫn">
          <PageLink page={user ? "StudentLanding" : "Main"}>Trang chủ</PageLink>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Thư viện bài mẫu</span>
        </nav>
        <h1>Thư viện bài mẫu Writing và Speaking</h1>
        <p>Bài mẫu Writing Task 1, Task 2 và bản ghi lời nói Speaking Part 1, 2, 3, kèm dàn ý, từ vựng và phân tích cách triển khai ý.</p>
        <ul className="samples-library-highlights">
          {libraryHighlights.map(({ label, path }) => (
            <li key={label}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

type LibraryState =
  | { key: string; kind: "loading" }
  | { key: string; kind: "ready"; result: PublicSampleListResponse }
  | { key: string; kind: "error"; message: string };

export default function SampleLibrary({
  sampleQuery = "",
}: PublicSamplePageProps) {
  const query = readSampleQuery(sampleQuery);
  const queryKey = encodeSampleQuery(query);

  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<LibraryState>({
    key: queryKey,
    kind: "loading",
  });

  useEffect(() => {
    let active = true;
    const requestQuery = readSampleQuery(queryKey);

    setState({ key: queryKey, kind: "loading" });

    void sampleApi.listPublic(requestQuery).then(
      (result) => {
        if (active) {
          setState({ key: queryKey, kind: "ready", result });
        }
      },
      (error: unknown) => {
        if (active) {
          setState({
            key: queryKey,
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Không thể tải thư viện bài mẫu.",
          });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [queryKey, retry]);

  const current: LibraryState =
    state.key === queryKey
      ? state
      : { key: queryKey, kind: "loading" };

  return (
    <SampleShell banner={<LibraryBanner />}>
      <LibraryFilters key={query.q ?? ""} query={query} />

      {current.kind === "loading" && (
        <SampleNotice>Đang tải thư viện bài mẫu…</SampleNotice>
      )}

      {current.kind === "error" && (
        <SampleNotice
          error
          retry={() => setRetry((value) => value + 1)}
        >
          {current.message}
        </SampleNotice>
      )}

      {current.kind === "ready" && (
        <>
          <p className="samples-muted" role="status">
            {current.result.pagination.total} bài mẫu phù hợp
          </p>

          {current.result.samples.length === 0 ? (
            <SampleNotice>
              Chưa có bài mẫu phù hợp với bộ lọc hoặc trang đã chọn.
              {" "}
              <a href="#SampleLibrary">Xóa bộ lọc và về trang đầu</a>
            </SampleNotice>
          ) : (
            <LibraryGroups samples={current.result.samples} query={query} />
          )}

          {current.result.pagination.totalPages > 1 && (
            <nav className="samples-pagination" aria-label="Phân trang bài mẫu">
              {query.page! > 1 && (
                <a
                  className="samples-button samples-button-secondary"
                  href={sampleLibraryHref({
                    ...query,
                    page: query.page! - 1,
                  })}
                >
                  Trang trước
                </a>
              )}

              <span>
                Trang {current.result.pagination.page}
                {" / "}
                {current.result.pagination.totalPages}
              </span>

              {query.page! < current.result.pagination.totalPages && (
                <a
                  className="samples-button samples-button-secondary"
                  href={sampleLibraryHref({
                    ...query,
                    page: query.page! + 1,
                  })}
                >
                  Trang sau
                </a>
              )}
            </nav>
          )}
        </>
      )}
    </SampleShell>
  );
}

function LibraryGroups({ samples, query }: { samples: PublicSampleCard[]; query: PublicSampleQuery }) {
  return (
    <div className="samples-library-groups">
      {libraryGroups.map((group) => {
        const speaking = group.type === "SPEAKING";
        const entries = samples.filter((sample) => speaking ? sample.skill === "SPEAKING" : sample.sampleType === group.type);
        if (!entries.length) return null;
        const explore = speaking ? query.skill !== "SPEAKING" : query.sampleType !== group.type;
        const groupQuery: PublicSampleQuery = {
          ...query, page: 1, skill: speaking ? "SPEAKING" : "WRITING",
          sampleType: group.type === "SPEAKING" ? undefined : group.type,
        };
        return (
          <section key={group.type} className="samples-library-group" aria-label={group.title}>
            <div className="samples-library-group-header">
              <div>
                <h2>{group.title}</h2>
                <p className="samples-muted">{group.description}</p>
              </div>
              {explore && <a href={sampleLibraryHref(groupQuery)}>Xem thêm →</a>}
            </div>
            <div className="samples-card-grid library-card-grid">
              {entries.map((sample) => <LibraryCard key={sample.id} sample={sample} query={query} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LibraryCard({ sample, query }: { sample: PublicSampleCard; query: PublicSampleQuery }) {
  const detailLink = sampleDetailHref(sample, query);
  const age = sample.publishedAt ? Date.now() - Date.parse(sample.publishedAt) : Infinity;
  return (
    <article className="samples-card" data-skill={sample.skill}>
      <div className="samples-card-cover">
        {sample.cover && <SampleMediaPreview sampleId={sample.id} media={sample.cover} scope="public"
          className="samples-card-cover-media" label={`Ảnh bìa ${sample.title}`} />}
        {age >= 0 && age < 14 * 86_400_000 && <span className="samples-card-new">Mới</span>}
      </div>
      <div className="samples-card-content">
        <h3><a href={detailLink}>{sample.title}</a></h3>
        <span className="samples-chip">{sample.topic || sampleTypeLabels[sample.sampleType]}</span>
        <p className="samples-muted">Band {sample.band.toFixed(1)}{sample.skill === "SPEAKING" && ` · ${sampleTypeLabels[sample.sampleType]}`}</p>
        <a className="samples-card-link" href={detailLink}>Xem bài mẫu →</a>
      </div>
    </article>
  );
}

const skills: { value?: PublicSampleSkill; label: string }[] = [
  { label: "Tất cả" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
];

function LibraryFilters({ query }: { query: PublicSampleQuery }) {
  const [q, setQ] = useState(query.q ?? "");
  const { skill, sampleType } = query;
  const searchQuery: PublicSampleQuery = { page: 1, q: q.trim() || undefined, skill, sampleType };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.location.hash = sampleLibraryHref(searchQuery);
  }

  return (
    <form className="samples-filters" onSubmit={submit}>
      <div className="samples-filter-tabs" role="group" aria-label="Kỹ năng">
        {skills.map(({ value, label }) => (
          <a
            key={label}
            aria-current={skill === value ? "true" : undefined}
            href={sampleLibraryHref({
              ...searchQuery,
              skill: value,
              sampleType: !value || sampleType?.startsWith(`${value}_`) ? sampleType : undefined,
            })}
          >
            {label}
          </a>
        ))}
      </div>

      <select
        className="samples-filter-type"
        aria-label="Loại bài"
        value={sampleType ?? ""}
        onChange={(event) => {
          const next = publicSampleTypes.find((type) => type === event.currentTarget.value);
          window.location.hash = sampleLibraryHref({ ...searchQuery, sampleType: next });
        }}
      >
        <option value="">Tất cả loại bài</option>
        {publicSampleTypes
          .filter((type) => !skill || type.startsWith(`${skill}_`))
          .map((type) => <option key={type} value={type}>{sampleTypeLabels[type]}</option>)}
      </select>

      <label className="samples-filter-search">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <input
          type="search"
          aria-label="Tìm tiêu đề hoặc chủ đề"
          maxLength={200}
          value={q}
          onChange={(event) => setQ(event.currentTarget.value)}
          placeholder="Tìm tiêu đề hoặc chủ đề"
        />
      </label>
      <button className="samples-button samples-button-secondary" type="submit">Tìm kiếm</button>
    </form>
  );
}
