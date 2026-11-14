import { TopicSelect } from "../../components/vocabulary/TopicSelect";
import { useRef, useState } from "react";
import AdminSidebar from "../../components/navigation/AdminSidebar";
import AdminTopbar from "../../components/navigation/AdminTopbar";
import {
  loadWords,
  storeWords,
  topics,
  type Topic,
  type Word,
} from "../../data/vocabulary";
import { importWords, csvHeader } from "../../lib/vocabulary-import";
import { WordCard } from "../../components/vocabulary/WordCard";
import "./vocabulary.css";

function MediaEditor({
  entry,
  onChange,
}: {
  entry: Word;
  onChange: (change: Partial<Word>) => void;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function lookup(type: "audio" | "image") {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        type === "audio"
          ? "https://api.dictionaryapi.dev/api/v2/entries/en/" +
              encodeURIComponent(entry.word)
          : "https://en.wikipedia.org/api/rest_v1/page/summary/" +
              encodeURIComponent(entry.word),
      );
      if (!response.ok) throw Error();
      const data = await response.json();
      const url =
        type === "image"
          ? data.thumbnail?.source
          : (data as { phonetics?: { audio?: string }[] }[])
              .flatMap((x) => x.phonetics ?? [])
              .find((p) => p.audio)?.audio;
      if (typeof url !== "string" || !url.startsWith("https://")) throw Error();
      onChange({ [type]: url });
      setMessage("Đã cập nhật " + (type === "audio" ? "audio." : "ảnh."));
    } catch {
      setMessage("Không tìm được media. Bạn có thể nhập URL hoặc tải ảnh lên.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Chỉnh sửa nội dung và media</summary>
      <div className="word-fields">
        {(
          [
            ["word", "Từ"],
            ["meaning", "Nghĩa tiếng Việt"],
            ["phonetic", "Phiên âm"],
            ["pos", "Từ loại"],
            ["example", "Ví dụ"],
            ["translation", "Bản dịch"],
            ["image", "URL ảnh"],
            ["audio", "URL audio"],
          ] as const
        ).map(([field, label]) => (
          <label key={field}>
            {label}
            <input
              value={entry[field]}
              onChange={(e) => onChange({ [field]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="word-tools">
        <button disabled={busy} onClick={() => lookup("image")}>
          Tìm ảnh
        </button>
        <button disabled={busy} onClick={() => lookup("audio")}>
          Tìm audio
        </button>
        <label>
          Thay ảnh{" "}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
                f.size > 1024 * 1024
              ) {
                setMessage("Chọn ảnh JPG, PNG hoặc WebP dưới 1 MB.");
                return;
              }
              const r = new FileReader();
              r.onload = () => onChange({ image: String(r.result) });
              r.onerror = () => setMessage("Không đọc được ảnh.");
              r.readAsDataURL(f);
            }}
          />
        </label>
      </div>
      <span role="status">{message}</span>
    </details>
  );
}
function Editor({ topic }: { topic: Topic }) {
  const [words, setWords] = useState(() => loadWords(topic, true)),
    [preview, setPreview] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  async function upload(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const next = await importWords(f);
      setWords(next);
      setMessage(
        "Đã đọc " + next.length + " từ. Kiểm tra nội dung trước khi lưu.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không đọc được file.");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }
  function save(draft: boolean) {
    try {
      if (words.some((w) => !w.word.trim() || !w.meaning.trim()))
        throw Error("Mỗi mục cần có từ và nghĩa tiếng Việt.");
      storeWords(topic, words, true);
      if (!draft) storeWords(topic, words, false);
      setMessage(
        draft
          ? "Đã lưu bản nháp trên trình duyệt."
          : "Đã công bố bộ từ trên trình duyệt này.",
      );
    } catch (e) {
      setMessage(
        e instanceof DOMException
          ? "Không đủ dung lượng lưu. Hãy dùng ảnh nhỏ hơn hoặc URL ảnh."
          : String(e),
      );
    }
  }
  const visible = words.filter(
    (w) =>
      (w.word + " " + w.meaning)
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filter === "all" ||
        (filter === "ready" && w.image && w.audio) ||
        (filter === "image" && !w.image) ||
        (filter === "audio" && !w.audio)),
  );
  return (
    <>
      <div className="word-tools">
        <button onClick={() => setPreview(!preview)}>
          {preview ? "Quay lại chỉnh sửa" : "Xem như người học"}
        </button>
        {!preview && (
          <>
            <button disabled={busy} onClick={() => save(true)}>
              Lưu bản nháp
            </button>
            <button
              className="word-primary"
              disabled={busy}
              onClick={() => save(false)}
            >
              Công bố bộ từ
            </button>
          </>
        )}
      </div>
      {!preview && (
        <section
          className="word-import"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) void upload(e.dataTransfer.files[0]);
          }}
        >
          <h2>Nhập bộ từ vựng</h2>
          <p>
            Kéo thả Excel (.xlsx) hoặc CSV để thay danh sách đang chỉnh sửa. Tối
            đa 5 MB, 500 từ.
          </p>
          <div className="word-tools">
            <input
              ref={file}
              type="file"
              hidden
              accept=".xlsx,.csv"
              onChange={(e) => void upload(e.target.files?.[0])}
            />
            <button disabled={busy} onClick={() => file.current?.click()}>
              {busy ? "Đang đọc…" : "Chọn file"}
            </button>
            <a
              download="mau-tu-vung.csv"
              href={
                "data:text/csv;charset=utf-8," +
                encodeURIComponent(
                  "\uFEFF" +
                    csvHeader +
                    "\r\nforest,khu rừng,danh từ,/ˈfɒrɪst/,Forests protect wildlife.,Rừng bảo vệ động vật hoang dã.",
                )
              }
            >
              Tải mẫu CSV
            </a>
          </div>
        </section>
      )}
      {message && <p role="status" className="word-feedback">{message}</p>}
      <section className="word-library"><h2>
        {topics[topic]} <small>· {words.length} từ</small>
      </h2>
      {!preview && (
        <>
          <dl className="media-counts">{[
            ["Đủ ảnh và audio",words.filter(w=>w.image && w.audio).length],
            ["Thiếu ảnh",words.filter(w=>!w.image).length],
            ["Thiếu audio",words.filter(w=>!w.audio).length]
          ].map(([label,count])=><div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}</dl>
          <div className="word-tools">
            <input
              aria-label="Tìm mục từ"
              placeholder="Tìm từ hoặc nghĩa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Lọc trạng thái media"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Mọi trạng thái</option>
              <option value="ready">Đủ ảnh và audio</option>
              <option value="image">Thiếu ảnh</option>
              <option value="audio">Thiếu audio</option>
            </select>
          </div>
        </>
      )}
      {(preview ? words : visible).map((w) => (
        <WordCard key={w.id} entry={w}>
          {!preview && (
            <MediaEditor
              entry={w}
              onChange={(patch) =>
                setWords((prev) =>
                  prev.map((item) =>
                    item.id === w.id ? { ...item, ...patch } : item,
                  ),
                )
              }
            />
          )}
        </WordCard>
      ))}
      {!preview && !visible.length && <p>Không có mục từ phù hợp.</p>}</section>
    </>
  );
}
export default function AdminVocabulary() {
  const [topic, setTopic] = useState<Topic>("environment");
  return (
    <div className="vocab-admin">
      <AdminSidebar active="vocabulary" />
      <div className="min-w-0 flex-1">
        <AdminTopbar crumb="Quản lý / Từ vựng" />
        <main className="vocabulary">
          <header className="vocab-hero">
            <div>
              
              <h1>Quản lý từ vựng</h1>
            </div>
            <label className="topic-picker">Bộ từ đang chỉnh sửa <TopicSelect value={topic} onChange={setTopic} /></label>
          </header>
          <Editor key={topic} topic={topic} />
        </main>
      </div>
    </div>
  );
}
