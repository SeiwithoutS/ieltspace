import { VocabularySetCard } from "../../components/vocabulary/VocabularySetCard";
import PageLink from "../../components/navigation/PageLink";
import { WordNote } from "../../components/vocabulary/WordNote";
import { useState } from "react";
import LearnerHeader from "../../components/attempts/LearnerHeader";
import { getAuthUser } from "../../lib/auth";
import { loadWords, topics, type Topic } from "../../data/vocabulary";
import { WordCard } from "../../components/vocabulary/WordCard";
import "./vocabulary.css";
export default function Vocabulary() {
  const [topic, setTopic] = useState<Topic | null>(null),
    [search, setSearch] = useState(""),
    [tab, setTab] = useState<"sets" | "favorites">("sets");
  const key = "vocab:personal:" + getAuthUser()?.id;
  const [notes, setNotes] = useState<
    Record<string, { fav: boolean; note: string }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "{}");
    } catch {
      return {};
    }
  });
  function update(id: string, patch: { fav?: boolean; note?: string }) {
    const next = {
      ...notes,
      [id]: { ...(notes[id] ?? { fav: false, note: "" }), ...patch },
    };
    localStorage.setItem(key, JSON.stringify(next));
    setNotes(next);
  }
  const topicIds = Object.keys(topics) as Topic[];
  const query = search.trim().toLocaleLowerCase("vi");
  const matches = (text: string) => text.toLocaleLowerCase("vi").includes(query);
  const showSets = tab === "sets" && topic === null;
  const visibleSets = topicIds.filter((id) => matches(topics[id] + " " + id));
  const words = (tab === "favorites"
    ? topicIds.flatMap((id) => loadWords(id)).filter((word) => notes[word.id]?.fav)
    : topic ? loadWords(topic) : []
  ).filter((word) => matches(word.word + " " + word.meaning));
  const searchLabel = showSets ? "Tìm bộ từ" : tab === "favorites" ? "Tìm từ yêu thích" : "Tìm từ trong bộ";
  function switchTab(next: "sets" | "favorites") {
    setTab(next);
    setTopic(null);
    setSearch("");
  }
  return (
    <>
      <LearnerHeader accent="#2963CC" onAccent="#fff" />
      <section className="vocab-library-banner">
        <div className="vocabulary">
          <nav aria-label="Đường dẫn" className="vocab-breadcrumb">
            <PageLink page="StudentLanding">Trang chủ</PageLink>
            <span aria-hidden="true">›</span><span>Thư viện từ vựng</span>
          </nav>
          <h1>Thư viện từ vựng IELTS</h1>
          <p>Khám phá từ vựng theo chủ đề, nghe phát âm và lưu những từ bạn muốn ôn tập.</p>
        </div>
      </section>
      <main className="vocabulary">
        <div className="vocab-library-toolbar">
          <div className="vocab-tabs" role="group" aria-label="Nội dung thư viện">
            <button type="button" aria-pressed={tab === "sets"} onClick={() => switchTab("sets")}>Từ vựng</button>
            <button type="button" aria-pressed={tab === "favorites"} onClick={() => switchTab("favorites")}>Yêu thích</button>
          </div>
          <label className="vocab-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
            <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </div>
        {showSets && !visibleSets.length && <p role="status">Không tìm thấy bộ từ phù hợp.</p>}
        {showSets ? <div className="vocab-sets">
          {visibleSets.map((id) => (
            <VocabularySetCard
              key={id}
              topic={id}
              title={topics[id]}
              index={topicIds.indexOf(id) + 1}
              entries={loadWords(id)}
              onOpen={() => { setTopic(id); setSearch(""); window.scrollTo(0, 0); }}
            />
          ))}
        </div> : <>
        {topic && <div className="word-tools"><button onClick={() => { setTopic(null); setSearch(""); }}>← Tất cả bộ từ</button></div>}
        <h2>{topic ? topics[topic] : "Từ yêu thích"} <small>· {words.length} từ</small></h2>
        {words.map((w) => (
          <WordCard key={w.id} entry={w} favorite={!!notes[w.id]?.fav} onFavorite={()=>update(w.id,{fav:!notes[w.id]?.fav})}>
            <WordNote word={w.word} value={notes[w.id]?.note ?? ""} onSave={(note) => update(w.id, { note })} />
          </WordCard>
        ))}
        {!words.length && <p>{tab === "favorites" && !search ? "Bạn chưa lưu từ yêu thích nào. Mở một bộ từ và bấm ngôi sao để lưu." : "Không có từ phù hợp."}</p>}
        </>}
      </main>
    </>
  );
}
