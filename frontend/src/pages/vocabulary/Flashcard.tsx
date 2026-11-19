import { useEffect, useState } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import PageLink from "../../components/navigation/PageLink";
import { FlashcardIcon } from "../../components/vocabulary/FlashcardIcon";
import { FlashcardSetup, type FlashcardSettings, type FlashcardSource } from "../../components/vocabulary/FlashcardSetup";
import { FlashcardStudy, type StudySession } from "../../components/vocabulary/FlashcardStudy";
import type { Word } from "../../data/vocabulary";
import { useAuth } from "../../lib/auth/auth";
import {
  clockLabel, readFlashcardHistory, saveFlashcardResult, wordsToReview, type FlashcardResult,
} from "../../lib/vocabulary/flashcard-history";
import { getPersonalVocabulary, usePublishedVocabulary } from "../../lib/vocabulary/vocabulary-library";
import "./vocabulary.css";
import "./flashcard.css";

type Tab = "sources" | "history" | "forgotten";
type Stage =
  | { kind: "home" }
  | { kind: "setup"; source: FlashcardSource }
  | { kind: "study"; session: StudySession }
  | { kind: "result"; result: FlashcardResult };

const tabs: { value: Tab; label: string }[] = [
  { value: "sources", label: "Chọn bộ ôn" },
  { value: "history", label: "Lịch sử ôn" },
  { value: "forgotten", label: "Từ chưa nhớ" },
];
const dateLabel = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

function withoutDuplicates(words: readonly Word[]) {
  return Array.from(new Map(words.map((word) => [word.id, word])).values());
}

function selectCards(source: FlashcardSource, { count, shuffle }: FlashcardSettings) {
  const cards = withoutDuplicates(source.words);
  if (shuffle) {
    for (let index = cards.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[other]] = [cards[other], cards[index]];
    }
  }
  return cards.slice(0, count);
}

export default function Flashcard({ vocabularySetId }: { vocabularySetId?: string }) {
  const { user } = useAuth();
  return user && <FlashcardWorkspace userId={user.id} vocabularySetId={vocabularySetId} />;
}

function FlashcardWorkspace({ userId, vocabularySetId }: { userId: string; vocabularySetId?: string }) {
  const { sets, loading, error, retry } = usePublishedVocabulary();
  const [favoriteIds, setFavoriteIds] = useState<string[] | null>(null);
  const [favoritesError, setFavoritesError] = useState(false);
  const [favoriteRequest, setFavoriteRequest] = useState(0);
  const [tab, setTab] = useState<Tab>("sources");
  const [stage, setStage] = useState<Stage | null>(null);
  const [history, setHistory] = useState<FlashcardResult[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [unchecked, setUnchecked] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setFavoritesError(false);
    getPersonalVocabulary().then(({ records }) => {
      if (active) setFavoriteIds(records.filter((row) => row.fav).map((row) => row.id));
    }).catch(() => { if (active) setFavoritesError(true); });
    return () => { active = false; };
  }, [favoriteRequest]);

  useEffect(() => {
    try {
      setHistory(readFlashcardHistory(userId));
    } catch {
      setHistoryError("Không đọc được lịch sử ôn trên trình duyệt này.");
    }
  }, [userId]);

  const wordsById = new Map(sets.flatMap((set) => set.words).map((word) => [word.id, word]));
  const sourceFromLibrary = vocabularySetId ? sets.find((set) => set.id === vocabularySetId) : undefined;
  const favorites = favoriteIds ? [...new Set(favoriteIds)].flatMap((id) => wordsById.get(id) ?? []) : [];
  const sessionWords = (result: FlashcardResult) => wordsToReview([result], wordsById);
  const availableSessions = history.filter((result) => sessionWords(result).length);
  const selectedSession = availableSessions.find((result) => result.id === sessionFilter);
  const forgotten = selectedSession ? sessionWords(selectedSession) : wordsToReview(history, wordsById);
  const checked = forgotten.filter((word) => !unchecked.includes(word.id));
  const requestedStage: Stage = stage ?? (sourceFromLibrary?.words.length
    ? { kind: "setup", source: { title: sourceFromLibrary.title, words: withoutDuplicates(sourceFromLibrary.words) } }
    : { kind: "home" });

  function prepare(source: FlashcardSource) {
    setStage({ kind: "setup", source: { ...source, words: withoutDuplicates(source.words) } });
    window.scrollTo(0, 0);
  }

  function start(source: FlashcardSource, settings: FlashcardSettings) {
    const words = selectCards(source, settings);
    if (!words.length) return;
    setStage({ kind: "study", session: {
      ...source, words, minutes: settings.minutes, startedAt: Date.now(),
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    } });
    window.scrollTo(0, 0);
  }

  function persist(result: FlashcardResult) {
    try {
      saveFlashcardResult(userId, result);
      setHistory(readFlashcardHistory(userId));
      setHistoryError("");
    } catch {
      setHistoryError("Không lưu được phiên ôn trên trình duyệt này.");
    }
  }

  function finish(result: FlashcardResult) {
    if (result.reviews.length) persist(result);
    setStage({ kind: "result", result });
    window.scrollTo(0, 0);
  }

  function goHome(nextTab: Tab) {
    setStage({ kind: "home" });
    setTab(nextTab);
    window.scrollTo(0, 0);
  }

  function changeFilter(id: string) {
    setSessionFilter(id);
    setUnchecked([]);
  }

  return (
    <>
      <LearnerHeader active="flashcard" />
      <header className="vocab-library-banner">
        <div className="vocabulary">
          <nav aria-label="Đường dẫn" className="vocab-breadcrumb">
            <PageLink page="Vocab" query={vocabularySetId ? new URLSearchParams({ set: vocabularySetId }).toString() : undefined}>Thư viện từ vựng</PageLink>
            <span aria-hidden="true">›</span><span>Flashcard của tôi</span>
          </nav>
          <h1>Flashcard của tôi</h1>
          {requestedStage.kind === "home" && <p>Ôn theo bộ từ, từ yêu thích hoặc những từ bạn cần nhớ lại.</p>}
        </div>
      </header>
      <main className="vocabulary flash-workspace">
        {historyError && <p className="flash-error" role="alert">{historyError}</p>}
        {loading && <p role="status">Đang tải bộ từ…</p>}
        {error && <p role="alert">{error} <button type="button" onClick={retry}>Thử lại</button></p>}
        {!loading && !error && <>
          {requestedStage.kind === "setup" && <FlashcardSetup
            source={requestedStage.source}
            onStart={(settings) => start(requestedStage.source, settings)}
            onBack={() => goHome(tab)}
          />}
          {requestedStage.kind === "study" && <FlashcardStudy session={requestedStage.session} onFinish={finish} />}
          {requestedStage.kind === "result" && (() => {
            const { result } = requestedStage;
            const remembered = result.reviews.filter((review) => review.remembered).length;
            const retryWords = sessionWords(result);
            return (
              <section className="flash-panel flash-setup mx-auto">
                <h2>{result.reason === "timeout" ? "Đã hết thời gian" : result.reason === "stopped" ? "Đã kết thúc phiên ôn" : "Hoàn thành phiên ôn"}</h2>
                <p className="flash-muted">{result.title} · {clockLabel(result.elapsedSeconds)}</p>
                <dl className="flash-summary">
                  <div><dt>Đã đánh giá</dt><dd>{result.reviews.length}/{result.cardCount}</dd></div>
                  <div><dt>Đã nhớ</dt><dd>{remembered}</dd></div>
                  <div><dt>Chưa nhớ</dt><dd>{result.reviews.length - remembered}</dd></div>
                </dl>
                {!historyError && !!result.reviews.length && <p className="flash-muted">Các thẻ đã đánh giá được lưu trên trình duyệt này.</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => goHome("history")}>Về lịch sử ôn</button>
                  {!!retryWords.length && <button type="button" className="vocab-primary" onClick={() => prepare({ title: "Từ chưa nhớ", words: retryWords })}>Ôn lại từ chưa nhớ</button>}
                  {historyError && !!result.reviews.length && <button type="button" onClick={() => persist(result)}>Thử lưu lại</button>}
                </div>
              </section>
            );
          })()}
          {requestedStage.kind === "home" && <>
            {stage === null && vocabularySetId && !sourceFromLibrary?.words.length && <p role="status">Bộ từ này hiện không có thẻ để ôn.</p>}
            <div className="vocab-tabs flash-tabs" role="group" aria-label="Nội dung flashcard">
              {tabs.map(({ value, label }) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>)}
            </div>
            {tab === "sources" && <section className="flash-panel">
              <h2>Chọn nguồn từ vựng</h2>
              {favoritesError && <p role="alert">Không tải được từ yêu thích. <button type="button" onClick={() => setFavoriteRequest((count) => count + 1)}>Thử lại</button></p>}
              <div className="flash-grid">
                <button type="button" className="flash-source" disabled={!favorites.length} onClick={() => prepare({ title: "Từ yêu thích", words: favorites })}>
                  <FlashcardIcon />
                  <span><strong>Từ yêu thích</strong><small>{favoriteIds === null ? (favoritesError ? "Chưa tải được" : "Đang tải…") : `${favorites.length} từ đã lưu`}</small></span>
                  <span aria-hidden="true">›</span>
                </button>
                {sets.filter((set) => set.words.length).map((set) => (
                  <button type="button" className="flash-source" key={set.id} onClick={() => prepare(set)}>
                    <FlashcardIcon />
                    <span><strong>{set.title}</strong><small>{withoutDuplicates(set.words).length} từ</small></span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
              {!sets.length && <p className="flash-muted">Thư viện chưa có bộ từ để ôn.</p>}
            </section>}
            {tab === "history" && <section className="flash-panel">
              <h2>Lịch sử ôn</h2>
              {history.length ? <ul className="flash-list">
                {history.map((result) => {
                  const replay = sessionWords(result);
                  return <li key={result.id} className="flash-list-row">
                    <div>
                      <strong>{result.title}</strong>
                      <p className="flash-muted">{dateLabel.format(result.finishedAt)} · {clockLabel(result.elapsedSeconds)}</p>
                      <small>{result.reviews.length}/{result.cardCount} thẻ đã đánh giá · {result.reviews.filter((review) => !review.remembered).length} chưa nhớ</small>
                    </div>
                    {!!replay.length && <button type="button" onClick={() => prepare({ title: `Ôn lại · ${result.title}`, words: replay })}>Ôn lại từ chưa nhớ</button>}
                  </li>;
                })}
              </ul> : <p className="flash-muted">Bạn chưa có phiên ôn trên trình duyệt này.</p>}
            </section>}
            {tab === "forgotten" && <section className="flash-panel">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2>Từ chưa nhớ</h2>
                {!!availableSessions.length && <label className="flash-field">
                  Lọc theo phiên
                  <select value={selectedSession?.id ?? ""} onChange={(event) => changeFilter(event.currentTarget.value)}>
                    <option value="">Tất cả phiên · Đánh giá gần nhất</option>
                    {availableSessions.map((result) => <option key={result.id} value={result.id}>{result.title} · {dateLabel.format(result.finishedAt)}</option>)}
                  </select>
                </label>}
              </div>
              {forgotten.length ? <>
                <ul className="flash-list">
                  {forgotten.map((word) => <li key={word.id} className="flash-list-row">
                    <label className="flash-check">
                      <input type="checkbox" checked={!unchecked.includes(word.id)} onChange={(event) => {
                        const selected = event.currentTarget.checked;
                        setUnchecked((items) => selected ? items.filter((id) => id !== word.id) : [...items, word.id]);
                      }} />
                      <span><strong lang="en">{word.word}</strong><small>{word.meaning}</small></span>
                    </label>
                  </li>)}
                </ul>
                <button type="button" className="vocab-primary" disabled={!checked.length} onClick={() => prepare({ title: "Từ chưa nhớ", words: checked })}>Ôn {checked.length} từ đã chọn</button>
              </> : <p className="flash-muted">Chưa có từ cần ôn lại.</p>}
            </section>}
          </>}
        </>}
      </main>
    </>
  );
}
