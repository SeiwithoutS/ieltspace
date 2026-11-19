import SampleMediaPreview from "../../components/samples/SampleMediaPreview";
import {
  sampleDetailHref,
  sampleLibraryHref,
  readSampleQuery,
  type PublicSamplePageProps,
} from "../../lib/samples/sample-public";
import {
  SampleDetailLayout,
  SampleDetailState,
  SampleMarkdown,
  SampleOutline,
  SampleSection,
  SampleShell,
  usePublicSample,
} from "./sample-public-ui";

export default function SampleWriting(props: PublicSamplePageProps) {
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

  if (document.skill !== "WRITING") {
    return (
      <SampleShell>
        <h1>Đây là bài mẫu Speaking</h1>
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
          <SampleMarkdown text={document.prompt} />

          <SampleMediaPreview sampleId={sample.id} media={document.promptImage} scope="public" label="Ảnh đề bài" />
        </SampleSection>

        <SampleOutline
          intro={document.outlineIntro}
          outline={document.outline}
        />

        <SampleSection id="bai-mau" title="Bài mẫu">
          <SampleMarkdown text={document.essay} />
        </SampleSection>

        {document.translation.trim() && (
          <SampleSection id="phan-dich" title="Phần dịch">
            <SampleMarkdown text={document.translation} />
          </SampleSection>
        )}
      </SampleDetailLayout>
    </SampleShell>
  );
}
