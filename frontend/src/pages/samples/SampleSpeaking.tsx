import SampleMediaPreview from "../../components/samples/SampleMediaPreview";
import {
  countSampleWords,
  readSampleQuery,
  sampleDetailHref,
  sampleLibraryHref,
  type PublicSamplePageProps,
} from "../../lib/sample-public";
import {
  SampleDetailLayout,
  SampleDetailState,
  SampleMarkdown,
  SampleOutline,
  SampleSection,
  SampleShell,
  usePublicSample,
} from "./sample-public-ui";

export default function SampleSpeaking(props: PublicSamplePageProps) {
  const detail = usePublicSample(props.sampleId);

  if (detail.state.kind !== "ready") {
    return (
      <SampleShell>
        <p><a href={sampleLibraryHref(readSampleQuery(props.sampleQuery))}>← Về thư viện bài mẫu</a></p>
        <SampleDetailState {...detail} />
      </SampleShell>
    );
  }

  const sample = detail.state.sample;
  const document = sample.document;

  if (document.skill !== "SPEAKING") {
    return (
      <SampleShell>
        <h1>Đây là bài mẫu Writing</h1>
        <a
          href={sampleDetailHref(
            { id: sample.id, skill: document.skill },
            readSampleQuery(props.sampleQuery),
          )}
        >
          Mở đúng trang bài mẫu →
        </a>
      </SampleShell>
    );
  }

  return (
    <SampleShell>
      <SampleDetailLayout
        key={sample.id}
        sample={sample}
        sampleQuery={props.sampleQuery}
      >
        <SampleSection id="de-bai" title="Đề bài" prompt>
          {document.part === 2 ? (
            <SampleMarkdown text={document.items[0]?.question || ""} />
          ) : (
            <ol className="samples-questions">
              {document.items.map((item) => (
                <li key={item.id}>
                  <SampleMarkdown text={item.question} />
                </li>
              ))}
            </ol>
          )}
        </SampleSection>

        <SampleOutline
          intro={document.outlineIntro}
          outline={document.outline}
        />

        <section id="bai-mau" className="samples-section">
          <h2>Bài mẫu</h2>

          {document.items.map((item, index) => (
            <article className="samples-panel" key={item.id}>
              {document.part !== 2 && (
                <>
                  <h3>Câu {index + 1}</h3>
                  <SampleMarkdown text={item.question} />
                </>
              )}

              <SampleMediaPreview sampleId={sample.id} media={item.audio} scope="public" label={`Audio mẫu câu ${index + 1}`} />

              <SampleMarkdown text={item.answer} />

              <p className="samples-muted">
                {countSampleWords(item.answer)} từ
              </p>
            </article>
          ))}
        </section>
      </SampleDetailLayout>
    </SampleShell>
  );
}
