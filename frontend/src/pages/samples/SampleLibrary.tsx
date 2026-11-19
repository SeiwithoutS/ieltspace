import SampleMediaPreview from "../../components/samples/SampleMediaPreview";
import { useEffect, useState, type FormEvent } from "react";
import { sampleApi } from "../../lib/sample-api";
import {
  encodeSampleQuery,
  publicSampleTypes,
  readSampleQuery,
  sampleDetailHref,
  sampleLibraryHref,
  sampleTypeLabels,
  type PublicSampleListResponse,
  type PublicSamplePageProps,
  type PublicSampleQuery,
  type PublicSampleSkill,
  type PublicSampleType,
} from "../../lib/sample-public";
import { SampleNotice, SampleShell } from "./sample-public-ui";

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
    <SampleShell>
      <header className="samples-library-hero">
        <nav aria-label="Breadcrumb">
          <a href="#Main">Trang chủ</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Thư viện bài mẫu</span>
        </nav>

        <h1>Thư viện bài mẫu Writing và Speaking</h1>
        <p>
          Tham khảo bài mẫu band 7.0+, dàn ý và cách triển khai ý cho
          Writing Task 1, Task 2 và Speaking Part 1–3.
        </p>
      </header>

      <LibraryFilters key={queryKey} query={query} />

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
            <div className="samples-card-grid">
              {current.result.samples.map((sample) => (
                <article className="samples-card" key={sample.id}>
                  {sample.cover ? (
                    <SampleMediaPreview sampleId={sample.id} media={sample.cover} scope="public"
                      className="samples-card-cover samples-card-cover-media" label={`Ảnh bìa ${sample.title}`} />
                  ) : (
                    <div className="samples-card-cover" aria-hidden="true">
                      {sample.skill === "WRITING" ? "Writing" : "Speaking"}
                    </div>
                  )}

                  <div className="samples-card-content">
                    <span className="samples-chip">
                      {sampleTypeLabels[sample.sampleType]}
                    </span>

                    <h2>
                      <a href={sampleDetailHref(sample, query)}>
                        {sample.title}
                      </a>
                    </h2>

                    <p className="samples-muted">
                      {sample.topic}
                      {" · "}
                      Band {sample.band.toFixed(1)}
                    </p>

                    <a
                      className="samples-card-link"
                      href={sampleDetailHref(sample, query)}
                    >
                      Xem bài mẫu →
                    </a>
                  </div>
                </article>
              ))}
            </div>
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

function LibraryFilters({ query }: { query: PublicSampleQuery }) {
  const [q, setQ] = useState(query.q || "");
  const [topic, setTopic] = useState(query.topic || "");
  const [skill, setSkill] = useState<PublicSampleSkill | "">(
    query.skill || "",
  );
  const [sampleType, setSampleType] = useState<PublicSampleType | "">(
    query.sampleType || "",
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.location.hash = sampleLibraryHref({
      page: 1,
      pageSize: 12,
      q: q.trim() || undefined,
      topic: topic.trim() || undefined,
      skill: skill || undefined,
      sampleType: sampleType || undefined,
    });
  }

  return (
    <form className="samples-filters samples-panel" onSubmit={submit}>
      <label>
        Tìm kiếm
        <input
          type="search"
          maxLength={200}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Tiêu đề hoặc chủ đề"
        />
      </label>

      <label>
        Kỹ năng
        <select
          value={skill}
          onChange={(event) => {
            const next = event.target.value;
            setSkill(
              next === "WRITING" || next === "SPEAKING" ? next : "",
            );
            setSampleType("");
          }}
        >
          <option value="">Tất cả</option>
          <option value="WRITING">Writing</option>
          <option value="SPEAKING">Speaking</option>
        </select>
      </label>

      <label>
        Loại bài
        <select
          value={sampleType}
          onChange={(event) => {
            const next = publicSampleTypes.find(
              (type) => type === event.target.value,
            );
            setSampleType(next || "");
          }}
        >
          <option value="">Tất cả loại bài</option>
          {publicSampleTypes
            .filter((type) => !skill || type.startsWith(`${skill}_`))
            .map((type) => (
              <option key={type} value={type}>
                {sampleTypeLabels[type]}
              </option>
            ))}
        </select>
      </label>

      <label>
        Chủ đề chính xác
        <input
          maxLength={200}
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Ví dụ: Education"
        />
      </label>

      <button className="samples-button" type="submit">
        Áp dụng
      </button>

      <a href="#SampleLibrary">Xóa bộ lọc</a>
    </form>
  );
}
