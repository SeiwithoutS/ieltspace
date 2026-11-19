import SampleMediaPreview from "../../components/samples/SampleMediaPreview";
import {
  Fragment,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import { ApiError } from "../../lib/api";
import { sampleApi } from "../../lib/sample-api";
import {
  countSampleWords,
  readSampleQuery,
  sampleLibraryHref,
  sampleTypeLabels,
  type PublicSampleDetail,
  type PublicSamplePageProps,
} from "../../lib/sample-public";
import "./samples.css";

export function SampleShell({ children }: { children: ReactNode }) {
  return (
    <div className="samples-page">
      <LearnerHeader active="samples" />
      <main className="samples-container">{children}</main>
    </div>
  );
}

export function SampleNotice({
  error = false,
  children,
  retry,
}: {
  error?: boolean;
  children: ReactNode;
  retry?: () => void;
}) {
  return (
    <div
      className="samples-panel samples-notice"
      role={error ? "alert" : "status"}
    >
      <p>{children}</p>
      {retry && (
        <button className="samples-button" type="button" onClick={retry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

/**
 * Chỉ cho phép URL HTTPS tuyệt đối.
 * Không cho javascript:, data:, blob: hoặc URL tương đối.
 */
function safeLink(raw: string): string | undefined {
  try {
    const url = new URL(raw);

    if (url.protocol !== "https:" || url.username || url.password) {
      return undefined;
    }

    return url.href;
  } catch {
    return undefined;
  }
}

function inlineMarkdown(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      const link = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(part);

      if (link) {
        const href = safeLink(link[2]);

        return href ? (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link[1]}
          </a>
        ) : (
          <Fragment key={index}>{link[1]}</Fragment>
        );
      }

      // React escape văn bản; không diễn giải HTML từ API.
      return <Fragment key={index}>{part}</Fragment>;
    });
}

/**
 * Markdown giới hạn: tiêu đề, bullet, đậm, nghiêng, liên kết HTTPS.
 * Không dùng dangerouslySetInnerHTML, không tải ảnh từ Markdown.
 */
export function SampleMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^#{1,3}\s+(.+)$/.exec(line);

    if (heading) {
      nodes.push(
        <h3 key={index}>{inlineMarkdown(heading[1])}</h3>,
      );
      index += 1;
      continue;
    }

    if (/^[-•]\s+/.test(line)) {
      const start = index;
      const items: ReactNode[] = [];

      while (
        index < lines.length &&
        /^[-•]\s+/.test(lines[index].trim())
      ) {
        items.push(
          <li key={index}>
            {inlineMarkdown(lines[index].trim().replace(/^[-•]\s+/, ""))}
          </li>,
        );
        index += 1;
      }

      nodes.push(<ul key={start}>{items}</ul>);
      continue;
    }

    const start = index;
    const paragraph: string[] = [];

    while (index < lines.length) {
      const current = lines[index].trim();

      if (
        !current ||
        /^#{1,3}\s+/.test(current) ||
        /^[-•]\s+/.test(current)
      ) {
        break;
      }

      paragraph.push(lines[index]);
      index += 1;
    }

    nodes.push(
      <p key={start}>{inlineMarkdown(paragraph.join("\n"))}</p>,
    );
  }

  return <div className="samples-markdown">{nodes}</div>;
}

type DetailState =
  | { id: string; kind: "loading" }
  | { id: string; kind: "ready"; sample: PublicSampleDetail }
  | { id: string; kind: "missing" }
  | { id: string; kind: "error"; message: string };

export function usePublicSample(sampleId?: string) {
  const id = sampleId || "";
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<DetailState>({
    id,
    kind: "loading",
  });

  useEffect(() => {
    let active = true;

    const validId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );

    if (!validId) {
      setState({ id, kind: "missing" });
      return;
    }

    setState({ id, kind: "loading" });

    void sampleApi.getPublic(id).then(
      ({ sample }) => {
        if (active) {
          setState({ id, kind: "ready", sample });
        }
      },
      (error: unknown) => {
        if (!active) return;

        if (
          error instanceof ApiError &&
          (error.status === 404 || error.code === "SAMPLE_INVALID_ID")
        ) {
          setState({ id, kind: "missing" });
          return;
        }

        setState({
          id,
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Không thể tải bài mẫu. Vui lòng thử lại.",
        });
      },
    );

    return () => {
      active = false;
    };
  }, [id, retry]);

  // Không hiển thị nội dung ID cũ trong lúc effect của ID mới chưa chạy.
  const current: DetailState =
    state.id === id ? state : { id, kind: "loading" };

  return {
    state: current,
    reload: () => setRetry((value) => value + 1),
  };
}

export function SampleDetailState({
  state,
  reload,
}: ReturnType<typeof usePublicSample>) {
  if (state.kind === "loading") {
    return <SampleNotice>Đang tải bài mẫu…</SampleNotice>;
  }

  if (state.kind === "missing") {
    return (
      <SampleNotice>
        Bài mẫu không tồn tại hoặc không còn được công khai.
      </SampleNotice>
    );
  }

  if (state.kind === "error") {
    return (
      <SampleNotice error retry={reload}>
        {state.message}
      </SampleNotice>
    );
  }

  return null;
}

export function SampleSection({
  id,
  title,
  prompt = false,
  children,
}: {
  id: string;
  title: string;
  prompt?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="samples-section">
      <h2>{title}</h2>
      <div className={`samples-panel${prompt ? " samples-prompt" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function SampleOutline({
  intro,
  outline,
}: {
  intro: string;
  outline: string;
}) {
  if (!intro.trim() && !outline.trim()) return null;

  return (
    <SampleSection id="dan-y" title="Dàn ý">
      {intro.trim() && <SampleMarkdown text={intro} />}
      {outline.trim() && <SampleMarkdown text={outline} />}
    </SampleSection>
  );
}

interface TocSection {
  id: string;
  label: string;
}

function SampleToc({ sections }: { sections: TocSection[] }) {
  const [active, setActive] = useState(sections[0]?.id || "");
  const [progress, setProgress] = useState(0);
  const sectionKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const ids = sectionKey.split("|").filter(Boolean);

    const update = () => {
      let current = ids[0] || "";

      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 140) {
          current = id;
        }
      }

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;

      if (max > 0 && window.scrollY >= max - 4) {
        current = ids[ids.length - 1] || current;
      }

      setActive(current);
      setProgress(percent);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionKey]);

  return (
    <nav className="samples-panel samples-toc" aria-label="Trong trang này">
      <h2>Trong trang này</h2>

      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          aria-current={active === section.id ? "location" : undefined}
          onClick={() => {
            const reduceMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;

            document.getElementById(section.id)?.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "start",
            });
          }}
        >
          {section.label}
        </button>
      ))}

      <progress max={100} value={progress} aria-label="Tiến độ đọc" />
      <span className="samples-muted">Đã đọc {progress}%</span>
    </nav>
  );
}

export function SampleDetailLayout({
  sample,
  sampleQuery,
  children,
}: PublicSamplePageProps & {
  sample: PublicSampleDetail;
  children: ReactNode;
}) {
  const document = sample.document;
  const query = readSampleQuery(sampleQuery);

  const sections: TocSection[] = [
    { id: "de-bai", label: "Đề bài" },
    ...(document.outlineIntro.trim() || document.outline.trim()
      ? [{ id: "dan-y", label: "Dàn ý" }]
      : []),
    { id: "bai-mau", label: "Bài mẫu" },
    ...(document.skill === "WRITING" && document.translation.trim()
      ? [{ id: "phan-dich", label: "Phần dịch" }]
      : []),
  ];

  const wordCount =
    document.skill === "WRITING"
      ? countSampleWords(document.essay)
      : document.items.reduce(
          (total, item) => total + countSampleWords(item.answer),
          0,
        );

  return (
    <>
      <nav className="samples-breadcrumb" aria-label="Breadcrumb">
        <a href={sampleLibraryHref(query)}>← Về thư viện bài mẫu</a>
        <span aria-current="page">{document.title}</span>
      </nav>

      <div className="samples-detail-grid">
        <article className="samples-article">
          <header className="samples-detail-header">
            <div className="samples-chips">
              <span className="samples-chip">
                {sampleTypeLabels[document.sampleType]}
              </span>
              <span className="samples-chip">
                Band {document.band.toFixed(1)}
              </span>
              {document.skill === "WRITING" && (
                <span className="samples-chip">
                  {document.form === "ACADEMIC"
                    ? "Academic"
                    : "General Training"}
                </span>
              )}
            </div>

            <h1>{document.title}</h1>

            <p className="samples-muted">
              {[
                document.topic,
                document.source,
                `${wordCount} từ bài mẫu`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <SampleMediaPreview sampleId={sample.id} media={document.cover} scope="public" label="Ảnh bìa bài mẫu" />
          </header>

          {children}
        </article>

        <aside className="samples-sidebar">
          <SampleToc sections={sections} />

          <div className="samples-panel">
            <h2>Luyện tập {document.skill === "WRITING" ? "Writing" : "Speaking"}</h2>
            <p>
              Bài mẫu được xem công khai. Bạn cần đăng nhập để luyện tập và
              lưu bài.
            </p>
            <a className="samples-button" href="#PracticeWS">
              Đến trang luyện tập
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
