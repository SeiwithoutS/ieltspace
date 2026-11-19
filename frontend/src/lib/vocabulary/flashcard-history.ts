import type { Word } from "../../data/vocabulary";

export type CardReview = { wordId: string; remembered: boolean };
export type FlashcardResult = {
  id: string;
  title: string;
  finishedAt: number;
  elapsedSeconds: number;
  cardCount: number;
  reason: "completed" | "timeout" | "stopped";
  reviews: CardReview[];
};

export type FlashcardOrigin = { type: 'SET'; setId: string } | { type: 'FAVORITES' } | { type: 'REVIEW' };
export type FlashcardSubmission = FlashcardResult & { source: FlashcardOrigin; cardIds: string[] };

const storageKey = (userId: string) => "ieltspace-flashcards:v1:" + userId;

function isReview(value: unknown): value is CardReview {
  return typeof value === "object" && value !== null &&
    "wordId" in value && typeof value.wordId === "string" &&
    "remembered" in value && typeof value.remembered === "boolean";
}

function isResult(value: unknown): value is FlashcardResult {
  if (typeof value !== "object" || value === null) return false;
  return "id" in value && typeof value.id === "string" &&
    "title" in value && typeof value.title === "string" &&
    "finishedAt" in value && typeof value.finishedAt === "number" && Number.isFinite(new Date(value.finishedAt).getTime()) &&
    "elapsedSeconds" in value && typeof value.elapsedSeconds === "number" && Number.isSafeInteger(value.elapsedSeconds) && value.elapsedSeconds >= 0 &&
    "cardCount" in value && typeof value.cardCount === "number" && Number.isSafeInteger(value.cardCount) && value.cardCount > 0 &&
    "reason" in value && (value.reason === "completed" || value.reason === "timeout" || value.reason === "stopped") &&
    "reviews" in value && Array.isArray(value.reviews) && value.reviews.every(isReview);
}

export function readFlashcardHistory(userId: string): FlashcardResult[] {
  const stored = localStorage.getItem(storageKey(userId));
  if (stored === null) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(stored); } catch { return []; }
  return Array.isArray(parsed) ? parsed.filter(isResult).sort((a, b) => b.finishedAt - a.finishedAt) : [];
}

const pendingPrefix = (userId: string) => `ieltspace-flashcards:pending:${userId}:`;

export function queueFlashcardResult(userId: string, result: FlashcardSubmission) {
  localStorage.setItem(pendingPrefix(userId) + result.id, JSON.stringify(result));
}

export function removePendingResult(userId: string, id: string) {
  localStorage.removeItem(pendingPrefix(userId) + id);
}

export function readPendingResults(userId: string): FlashcardSubmission[] {
  const prefix = pendingPrefix(userId);
  const results: FlashcardSubmission[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    try {
      const result: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (!isResult(result) || !('source' in result) || !('cardIds' in result)) continue;
      if (key === prefix + result.id && Array.isArray(result.cardIds)) results.push(result as FlashcardSubmission);
    } catch { /* A malformed entry does not prevent other sessions from syncing. */ }
  }
  return results.sort((first, second) => first.finishedAt - second.finishedAt);
}

export function wordsToReview(history: readonly FlashcardResult[], words: ReadonlyMap<string, Word>) {
  const latest = new Map<string, boolean>();
  for (const result of history) {
    for (const review of result.reviews) {
      if (!latest.has(review.wordId)) latest.set(review.wordId, review.remembered);
    }
  }
  return [...latest].flatMap(([wordId, remembered]) => {
    const word = words.get(wordId);
    return word && !remembered ? [word] : [];
  });
}

export function clockLabel(seconds: number) {
  return [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, "0")).join(":");
}
