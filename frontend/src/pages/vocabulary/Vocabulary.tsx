import { VocabularySetCard } from "../../components/vocabulary/VocabularySetCard";
import PageLink from "../../components/navigation/PageLink";
import { WordNote } from "../../components/vocabulary/WordNote";
import { FlashcardIcon } from "../../components/vocabulary/FlashcardIcon";
import { useEffect, useState, type ReactNode } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import { navigate, useAuth } from "../../lib/auth/auth";
import { apiFetch } from "../../lib/shared/api";
import { getPersonalVocabulary, usePublishedVocabulary, type PublishedVocabularySet } from "../../lib/vocabulary/vocabulary-library";
import { WordCard } from "../../components/vocabulary/WordCard";
import type { Word } from "../../data/vocabulary";
import { cefrRank, cefrTags } from "../../lib/vocabulary/cefr";
import "../../components/shared/library-cards.css";
import "./vocabulary.css";

function VocabularyWordList({ set, words, canStudy, emptyMessage, renderWord }: {
  set?: PublishedVocabularySet;
  words: Word[];
  canStudy: boolean;
  emptyMessage: string;
  renderWord: (word: Word) => ReactNode;
}) {
  const [level, setLevel] = useState("");
  const [sortByLevel, setSortByLevel] = useState(false);
  const visibleWords = words.filter((word) => !level || word.tag === level);
  if (sortByLevel) visibleWords.sort((a, b) => cefrRank(a.tag) - cefrRank(b.tag));

  return <>
    <div className="vocab-detail-header">
      <h2>{set?.title ?? "Từ yêu thích"} <small aria-live="polite">· {visibleWords.length} từ</small></h2>
      {canStudy && !!set?.words.length && (
        <PageLink page="Flashcard" query={new URLSearchParams({ set: set.id }).toString()} className="vocab-primary">
          <FlashcardIcon /> Ôn bằng flashcard
        </PageLink>
      )}
    </div>
    {set && <div className="vocab-level-controls" role="group" aria-label="Sắp xếp và lọc từ theo CEFR">
      <button type="button" aria-pressed={sortByLevel} onClick={() => setSortByLevel(!sortByLevel)}>
        CEFR thấp → cao
      </button>
      <select aria-label="Lọc theo cấp độ CEFR" value={level} onChange={(event) => setLevel(event.target.value)}>
        <option value="">Mọi cấp độ</option>
        {cefrTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
      </select>
    </div>}
    {visibleWords.map(renderWord)}
    {!visibleWords.length && <p>{emptyMessage}</p>}
  </>;
}

export default function Vocabulary({ vocabularySetId: topic }: { vocabularySetId?: string }) {
  const [search, setSearch] = useState(""),
    [tab, setTab] = useState<"sets" | "favorites">("sets");
  const { user } = useAuth();
  const userId = user?.id;
  const [notes,setNotes] = useState<Record<string,{fav:boolean;note:string}>>({});
  const [personalError,setPersonalError] = useState("");
  const [ready,setReady] = useState(false);
  const [personalRetry,setPersonalRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setReady(false); setNotes({}); setPersonalError("");
    if (userId) getPersonalVocabulary()
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
  const { sets, loading, error, retry } = usePublishedVocabulary();
  const selectedSet = sets.find((set) => set.id === topic);
  const query = search.trim().toLocaleLowerCase("vi");
  const matches = (text: string) => text.toLocaleLowerCase("vi").includes(query);
  const favorites = tab === "favorites" && !!userId && !topic;
  const showSets = !favorites && !topic;
  const visibleSets = sets.filter((set) => matches(set.title + " " + set.id));
  const words = (favorites
    ? Array.from(new Map(sets.flatMap((set) => set.words).filter((word) => notes[word.id]?.fav).map((word) => [word.id, word])).values())
    : selectedSet?.words ?? []
  ).filter((word) => matches(word.word + " " + word.meaning));
  const searchLabel = showSets ? "Tìm bộ từ" : favorites ? "Tìm từ yêu thích" : "Tìm từ trong bộ";
  function switchTab(next: "sets" | "favorites") {
    setTab(next);
    if (topic) navigate("Vocab");
    setSearch("");
  }
  return (
    <>
      <LearnerHeader active="vocab" accent="#2963CC" onAccent="#fff" />
      <section className="vocab-library-banner">
        <div className="vocabulary vocab-library-container">
          <nav aria-label="Đường dẫn" className="vocab-breadcrumb">
            <PageLink page={user ? "StudentLanding" : "Main"}>Trang chủ</PageLink>
            <span aria-hidden="true">›</span><span>Thư viện từ vựng</span>
          </nav>
          <h1>Thư viện từ vựng IELTS</h1>
          <p>{userId ? "Khám phá từ vựng theo chủ đề, nghe phát âm và lưu những từ bạn muốn ôn tập." : "Khám phá các bộ từ vựng theo chủ đề và nghe phát âm."}</p>
        </div>
      </section>
      <main className="vocabulary vocab-library-container">
        <div className="vocab-library-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="vocab-tabs w-full sm:w-auto flex justify-center sm:justify-start" role="group" aria-label="Nội dung thư viện">
            <button type="button" aria-pressed={!favorites} onClick={() => switchTab("sets")}>Từ vựng</button>
            {userId && <button type="button" aria-pressed={favorites} onClick={() => switchTab("favorites")}>Yêu thích</button>}
          </div>
          <label className="vocab-search w-full sm:w-[320px]">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
            <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
        </div>
        {userId && personalError && <p role="alert">{personalError} <button onClick={() => setPersonalRetry(n => n+1)}>Tải lại</button></p>}
        {loading && <p role="status">Đang tải bộ từ…</p>}
        {error && <p role="alert">{error} <button onClick={retry}>Thử lại</button></p>}
        {!loading && !error && (showSets ? <div className="vocab-sets library-card-grid">
          {!visibleSets.length && <p className="col-span-full" role="status">Không tìm thấy bộ từ phù hợp.</p>}
          {visibleSets.map((set) => (
            <VocabularySetCard
              key={set.id}
              topic={set.id}
              title={set.title}
              cover={set.cover}
              index={sets.indexOf(set) + 1}
              entries={set.words}
              onOpen={() => { setSearch(""); navigate("Vocab?set=" + encodeURIComponent(set.id)); }}
            />
          ))}
        </div> : <>
        {topic && <div className="word-tools"><button type="button" onClick={() => switchTab("sets")}>← Tất cả bộ từ</button></div>}
        {topic && !selectedSet ? <p role="status">Bộ từ này hiện không có trong thư viện.</p> : (
          <VocabularyWordList
            key={selectedSet?.id}
            set={selectedSet}
            words={words}
            canStudy={!!userId}
            emptyMessage={favorites && !search ? (ready ? "Bạn chưa lưu từ yêu thích nào. Mở một bộ từ và bấm ngôi sao để lưu." : personalError ? "Không tải được từ yêu thích." : "Đang tải từ yêu thích…") : "Không có từ phù hợp."}
            renderWord={(word) => (
              <WordCard key={word.id} entry={word} favorite={!!notes[word.id]?.fav} onFavorite={userId && ready ? () => void update(word.id, { fav: !notes[word.id]?.fav }) : undefined}>
                {userId && ready && <WordNote word={word.word} value={notes[word.id]?.note ?? ""} onSave={(note) => update(word.id, { note })} />}
              </WordCard>
            )}
          />
        )}
        </>)}
      </main>
    </>
  );
}
