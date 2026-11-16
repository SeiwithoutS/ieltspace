import type { AudioCandidate, Word } from "../../data/vocabulary";

type Props = { entry: Word; onChange: (patch: Partial<Word>) => void };

function filename(url: string) {
  return url.split(/[?#]/)[0].split("/").pop() || "Bản ghi";
}

export function AudioFields({ entry, onChange }: Props) {
  const options = [...(entry.audioCandidates ?? [])];
  options.sort((a, b) => Number(b.source === "Free Dictionary") - Number(a.source === "Free Dictionary"));
  // Previously saved URLs can predate the list of provider results.
  for (const [url, accent] of [[entry.audioUs, "US"], [entry.audioUk, "UK"], [entry.audio, undefined]] as const) {
    if (url && !options.some(item => item.url === url)) options.push({ url, accent, source: "Đã lưu" });
  }
  const split = ["US", "UK"].every(accent => options.some(option => option.accent === accent));
  function field(label: string, items: AudioCandidate[], value: string, change: (url: string) => void) {
    return <label key={label}>{label}
      <select aria-label={label} title={value || undefined} value={value} disabled={!items.length} onChange={event => change(event.target.value)}>
        {!value && <option value="">Chưa có bản ghi</option>}
        {items.map(item => <option key={item.url} value={item.url}>
          {item.source}{item.accent ? ` · ${item.accent}` : ""} · {filename(item.url)}
        </option>)}
      </select>
    </label>;
  }
  return <div className="vocab-audio-fields">
    {split ? (["US", "UK"] as const).map(accent => {
      const items = options.filter(item => item.accent === accent);
      const key = accent === "US" ? "audioUs" : "audioUk";
      const value = entry[key] || items.find(item => item.url === entry.audio)?.url || items[0].url;
      return field(`Audio ${accent}`, items, value, url => onChange({ [key]: url, audio: url }));
    }) : field("Audio phát âm", options, entry.audio, url => {
      const accent = options.find(item => item.url === url)?.accent;
      onChange({ audio: url, ...(accent === "UK" ? { audioUk: url } : accent === "US" ? { audioUs: url } : {}) });
    })}
  </div>;
}
