import { useEffect, useState } from "react";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import PageLink from "../../components/navigation/PageLink";
import { FlashcardIcon } from "../../components/vocabulary/FlashcardIcon";
import { FlashcardSetup, type FlashcardSettings, type FlashcardSource } from "../../components/vocabulary/FlashcardSetup";
import { FlashcardStudy, type StudySession } from "../../components/vocabulary/FlashcardStudy";
import type { Word } from "../../data/vocabulary";
import { useAuth } from "../../lib/auth/auth";
import {
  clockLabel, wordsToReview, type FlashcardResult, type FlashcardSubmission,
} from "../../lib/vocabulary/flashcard-history";
import { useFlashcardHistory } from "../../lib/vocabulary/use-flashcard-history";
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
  return user && <FlashcardWorkspace key={user.id} userId={user.id} vocabularySetId={vocabularySetId} />;
}

function FlashcardWorkspace({ userId, vocabularySetId }: { userId: string; vocabularySetId?: string }) {
  const { sets, loading, error, retry } = usePublishedVocabulary();
  const [favoriteIds, setFavoriteIds] = useState<string[] | null>(null);
  const [favoritesError, setFavoritesError] = useState(false);
  const [favoriteRequest, setFavoriteRequest] = useState(0);
  const [tab, setTab] = useState<Tab>("sources");
  const [stage, setStage] = useState<Stage | null>(null);
  const syncHistory = useFlashcardHistory(userId);
  const history = syncHistory.items;
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

  const wordsById = new Map(sets.flatMap((set) => set.words).map((word) => [word.id, word]));
  const sourceFromLibrary = vocabularySetId ? sets.find((set) => set.id === vocabularySetId) : undefined;
  const favorites = favoriteIds ? [...new Set(favoriteIds)].flatMap((id) => wordsById.get(id) ?? []) : [];
  const sessionWords = (result: FlashcardResult) => wordsToReview([result], wordsById);
  const availableSessions = history.filter((result) => sessionWords(result).length);
  const selectedSession = availableSessions.find((result) => result.id === sessionFilter);
  const forgotten = selectedSession ? sessionWords(selectedSession)
    : (syncHistory.stats?.forgottenIds ?? []).flatMap(id => wordsById.get(id) ?? []);
  const checked = forgotten.filter((word) => !unchecked.includes(word.id));
  const requestedStage: Stage = stage ?? (sourceFromLibrary?.words.length
    ? { kind: "setup", source: { title: sourceFromLibrary.title, words: withoutDuplicates(sourceFromLibrary.words), source: { type: 'SET', setId: sourceFromLibrary.id } } }
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
      id: crypto.randomUUID(),
    } });
    window.scrollTo(0, 0);
  }

  function finish(result: FlashcardSubmission) {
    if (result.reviews.length) syncHistory.save(result);
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
        {syncHistory.pendingCount > 0 && <p role="status" className="flash-muted">
          {syncHistory.syncing ? 'Đang đồng bộ phiên ôn…' : `${syncHistory.pendingCount} phiên ôn đang chờ đồng bộ.`}
          {!syncHistory.syncing && <> <button type="button" onClick={() => void syncHistory.sync()}>Thử gửi lại</button></>}
        </p>}
        {syncHistory.syncError && <p className="flash-error" role="alert">Chưa đồng bộ được phiên ôn. {syncHistory.syncError}</p>}
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
                {!!result.reviews.length && !syncHistory.isPending(result.id) && <p className="flash-muted">Phiên ôn đã được lưu vào tài khoản.</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => goHome("history")}>Về lịch sử ôn</button>
                  {!!retryWords.length && <button type="button" className="vocab-primary" onClick={() => prepare({ title: "Từ chưa nhớ", words: retryWords, source: { type: 'REVIEW' } })}>Ôn lại từ chưa nhớ</button>}
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
                <button type="button" className="flash-source" disabled={!favorites.length} onClick={() => prepare({ title: "Từ yêu thích", words: favorites, source: { type: 'FAVORITES' } })}>
                  <FlashcardIcon />
                  <span><strong>Từ yêu thích</strong><small>{favoriteIds === null ? (favoritesError ? "Chưa tải được" : "Đang tải…") : `${favorites.length} từ đã lưu`}</small></span>
                  <span aria-hidden="true">›</span>
                </button>
                {sets.filter((set) => set.words.length).map((set) => (
                  <button type="button" className="flash-source" key={set.id} onClick={() => prepare({ ...set, source: { type: 'SET', setId: set.id } })}>
                    <FlashcardIcon />
                    <span><strong>{set.title}</strong><small>{withoutDuplicates(set.words).length} từ</small></span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
              {!sets.length && <p className="flash-muted">Thư viện chưa có bộ từ để ôn.</p>}
            </section>}
            {tab !== "sources" && syncHistory.historyError && <p role="alert">{syncHistory.historyError} <button type="button" onClick={() => void syncHistory.load()}>Thử tải lại</button></p>}
            {tab !== "sources" && syncHistory.loading && <p role="status">Đang tải lịch sử ôn…</p>}
            {tab === "history" && <section className="flash-panel">
              <h2>Lịch sử ôn</h2>
              {syncHistory.stats && <dl className="flash-summary">
                <div><dt>Phiên đã lưu</dt><dd>{syncHistory.stats.sessions}</dd></div>
                <div><dt>Từ đã ôn</dt><dd>{syncHistory.stats.reviewedWords}</dd></div>
                <div><dt>Từ chưa nhớ</dt><dd>{syncHistory.stats.forgottenIds.length}</dd></div>
              </dl>}
              {history.length ? <ul className="flash-list">
                {history.map((result) => {
                  const replay = sessionWords(result);
                  return <li key={result.id} className="flash-list-row">
                    <div>
                      <strong>{result.title}</strong>
                      <p className="flash-muted">{dateLabel.format(result.finishedAt)} · {clockLabel(result.elapsedSeconds)}</p>
                      <small>{result.reviews.length}/{result.cardCount} thẻ đã đánh giá · {result.reviews.filter((review) => !review.remembered).length} chưa nhớ</small>
                    </div>
                    {!!replay.length && <button type="button" onClick={() => prepare({ title: 'Ôn lại từ chưa nhớ', words: replay, source: { type: 'REVIEW' } })}>Ôn lại từ chưa nhớ</button>}
                  </li>;
                })}
              </ul> : !syncHistory.loading && !syncHistory.historyError && <p className="flash-muted">Tài khoản chưa có phiên ôn đã lưu.</p>}
              {syncHistory.cursor && <button type="button" disabled={syncHistory.loading} onClick={() => void syncHistory.load(syncHistory.cursor ?? undefined)}>Xem thêm phiên</button>}
              {!!syncHistory.localHistory.length && <details>
                <summary>Lịch sử cũ trên thiết bị này ({syncHistory.localHistory.length} phiên)</summary>
                <ul className="flash-list">{syncHistory.localHistory.map(result => <li key={result.id}>
                  {result.title} · {dateLabel.format(result.finishedAt)} · {result.reviews.length} thẻ đã đánh giá
                  {!!sessionWords(result).length && <> <button type="button" onClick={() => prepare({ title: 'Ôn lại từ chưa nhớ', words: sessionWords(result), source: { type: 'REVIEW' } })}>Ôn lại</button></>}
                </li>)}</ul>
              </details>}
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
                <button type="button" className="vocab-primary" disabled={!checked.length} onClick={() => prepare({ title: "Từ chưa nhớ", words: checked, source: { type: 'REVIEW' } })}>Ôn {checked.length} từ đã chọn</button>
              </> : !syncHistory.loading && !syncHistory.historyError && <p className="flash-muted">Chưa có từ cần ôn lại.</p>}
            </section>}
          </>}
        </>}
      </main>
    </>
  );
}
