import { VocabularySetCard } from "../../components/vocabulary/VocabularySetCard";
import PageLink from "../../components/navigation/PageLink";
import { WordNote } from "../../components/vocabulary/WordNote";
import { useEffect, useState } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import { getAuthUser } from "../../lib/auth";
import { apiFetch } from "../../lib/api";
import type { Word, VocabularySet } from "../../data/vocabulary";
import { WordCard } from "../../components/vocabulary/WordCard";
import "./vocabulary.css";
export default function Vocabulary() {
  const [topic, setTopic] = useState<string | null>(null),
    [search, setSearch] = useState(""),
    [tab, setTab] = useState<"sets" | "favorites">("sets");
  const userId = getAuthUser()?.id;
  const [notes,setNotes] = useState<Record<string,{fav:boolean;note:string}>>({});
  const [personalError,setPersonalError] = useState("");
  const [ready,setReady] = useState(false);
  const [personalRetry,setPersonalRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setReady(false); setNotes({}); setPersonalError("");
    if (userId) apiFetch<{records:{id:string;fav:boolean;note:string}[]}>("/vocabulary/sets/me/personal")
      .then(({records}) => { if (active) { setNotes(Object.fromEntries(records.map(row => [row.id,row]))); setReady(true); } })
      .catch(error => { if (active) setPersonalError(error.message); });
    return () => { active = false; };
  },[userId,personalRetry]);
  async function update(id:string, patch:{fav:boolean}|{note:string}) {
    try {
      const saved = await apiFetch<typeof patch>(`/vocabulary/sets/me/personal/${id}`,{method:"PATCH",json:patch});
      setNotes(current => ({...current,[id]:{...(current[id] ?? {fav:false,note:""}),...saved}}));
      setPersonalError(""); return true;
    } catch (error) { setPersonalError(error instanceof Error ? error.message : "Không lưu được dữ liệu cá nhân."); return false; }
  }
  const [sets,setSets] = useState<(VocabularySet & {words:Word[]})[]>([]);
  const [state,setState] = useState("Đang tải bộ từ…");
  const [retry,setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setState("Đang tải bộ từ…");
    apiFetch<{sets:(VocabularySet & {words:Word[]})[]}>("/vocabulary/sets")
      .then(result => { if (active) { setSets(result.sets); setState(""); } })
      .catch(error => { if (active) setState(error.message || "Không tải được thư viện."); });
    return () => { active = false; };
  },[retry]);
  const loadWords = (id:string) => sets.find(set => set.id === id)?.words ?? [];
  const topicIds = sets.map((set) => set.id);
  const topics = Object.fromEntries(sets.map((set) => [set.id, set.title]));
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
      <LearnerHeader active="vocab" accent="#2963CC" onAccent="#fff" />
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
        <div className="vocab-library-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="vocab-tabs w-full sm:w-auto flex justify-center sm:justify-start" role="group" aria-label="Nội dung thư viện">
            <button type="button" aria-pressed={tab === "sets"} onClick={() => switchTab("sets")}>Từ vựng</button>
            <button type="button" aria-pressed={tab === "favorites"} onClick={() => switchTab("favorites")}>Yêu thích</button>
          </div>
          <label className="vocab-search w-full sm:w-[320px]">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
            <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </div>
        {personalError && <p role="alert">{personalError} <button onClick={() => setPersonalRetry(n => n+1)}>Tải lại</button></p>}
        {state && <p role="status">{state} {state !== "Đang tải bộ từ…" && <button onClick={() => setRetry(n => n+1)}>Thử lại</button>}</p>}
        {!state && showSets && !visibleSets.length && <p role="status">Không tìm thấy bộ từ phù hợp.</p>}
        {showSets ? <div className="vocab-sets">
          {visibleSets.map((id) => (
            <VocabularySetCard
              key={id}
              topic={id}
              title={topics[id]}
              cover={sets.find((set) => set.id === id)?.cover}
              index={topicIds.indexOf(id) + 1}
              entries={loadWords(id)}
              onOpen={() => { setTopic(id); setSearch(""); window.scrollTo(0, 0); }}
            />
          ))}
        </div> : <>
        {topic && <div className="word-tools"><button onClick={() => { setTopic(null); setSearch(""); }}>← Tất cả bộ từ</button></div>}
        <h2>{topic ? topics[topic] : "Từ yêu thích"} <small>· {words.length} từ</small></h2>
        {words.map((w) => (
          <WordCard key={w.id} entry={w} favorite={!!notes[w.id]?.fav} onFavorite={ready ? ()=>void update(w.id,{fav:!notes[w.id]?.fav}) : undefined}>
            {ready && <WordNote word={w.word} value={notes[w.id]?.note ?? ""} onSave={(note) => update(w.id, { note })} />}
          </WordCard>
        ))}
        {!words.length && <p>{tab === "favorites" && !search ? "Bạn chưa lưu từ yêu thích nào. Mở một bộ từ và bấm ngôi sao để lưu." : "Không có từ phù hợp."}</p>}
        </>}
      </main>
    </>
  );
}
