import { useEffect, useState } from "react";
import { sampleApi } from "../../lib/samples/sample-api";
import { sampleDetailHref, sampleTypeLabels, type PublicSampleCard } from "../../lib/samples/sample-public";
import { styleOf } from "../../lib/shared/styles";
import SampleMediaPreview from "./SampleMediaPreview";
import "../shared/library-cards.css";

export default function FeaturedSamples() {
  const [samples, setSamples] = useState<PublicSampleCard[]>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void sampleApi.listPublic({ pageSize: 4 }).then(result => {
      if (active) setSamples(result.samples);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [attempt]);

  if (failed) return <p role="alert">
    Chưa tải được bài mẫu.{" "}
    <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Thử lại</button>
  </p>;
  if (!samples) return <p role="status">Đang tải bài mẫu…</p>;
  if (!samples.length) return <p>Chưa có bài mẫu công bố.</p>;

  return <div className="library-card-grid">
    {samples.map(sample => <article key={sample.id} className="relative"
      style={styleOf("min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)")}>
      <div className="[&_button]:relative [&_button]:z-10" style={styleOf("aspect-ratio: 3 / 2; border-radius: 12px; overflow: hidden; background: #E3ECFD")}>
        {sample.cover && <SampleMediaPreview sampleId={sample.id} media={sample.cover} scope="public" label={`Ảnh bìa ${sample.title}`} />}
      </div>
      <h3 className="m-0 break-words px-2 text-lg font-semibold">
        <a href={sampleDetailHref(sample, {})}
          className="text-inherit no-underline hover:underline after:absolute after:inset-0 after:content-['']">
          {sample.title}
        </a>
      </h3>
      <div className="px-2 text-sm">{sampleTypeLabels[sample.sampleType]} · Band {sample.band.toFixed(1)}</div>
      {sample.topic && <div className="break-words px-2 text-sm">{sample.topic}</div>}
    </article>)}
  </div>;
}
