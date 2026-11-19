import { useEffect, useState } from "react";
import { sampleApi } from "../../lib/sample-api";
import type { SampleMediaRef, SampleMediaScope } from "../../lib/sample-media-types";

interface Props {
  sampleId?: string;
  media: SampleMediaRef | null;
  scope: SampleMediaScope;
  label: string;
  className?: string;
}

type State = { key: string; url?: string; error?: string };

export default function SampleMediaPreview({ sampleId, media, scope, label, className }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State | null>(null);
  const path = media?.path;
  const key = JSON.stringify([sampleId, scope, media?.bucket, path, attempt]);

  useEffect(() => {
    if (!sampleId || !path) return;
    let active = true;
    void sampleApi.assetUrl(sampleId, path, scope).then(
      ({ url }) => { if (active) setState({ key, url }); },
      (error: unknown) => {
        if (active) setState({
          key,
          error: error instanceof Error ? error.message : "Không tải được tệp.",
        });
      },
    );
    return () => { active = false; };
  }, [sampleId, path, scope, key]);

  if (!media || !sampleId) return null;
  const current = state?.key === key ? state : null;
  const audio = media.mimeType.startsWith("audio/");
  function playbackError() {
    setState({
      key,
      error: audio ? "Không phát được audio." : "Không tải được ảnh.",
    });
  }

  return (
    <div className={className ?? "space-y-2"}>
      {!current && <p role="status">Đang tải {audio ? "audio" : "ảnh"}…</p>}
      {current?.url && (audio ? (
        <audio controls preload="none" className="w-full" src={current.url} aria-label={label} onError={playbackError} />
      ) : (
        <img
          className="block h-auto max-h-96 max-w-full rounded-lg object-contain"
          src={current.url}
          alt={label}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={playbackError}
        />
      ))}
      {current?.error && (
        <div className="space-y-2">
          <p role="alert">{current.error}</p>
          <button className={scope === "admin" ? "sample-button sample-button--secondary" : "samples-button samples-button-secondary"}
            type="button" onClick={() => setAttempt(value => value + 1)}>
            Làm mới liên kết
          </button>
        </div>
      )}
    </div>
  );
}
