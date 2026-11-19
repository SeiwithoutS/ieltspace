import { apiFetch } from '../shared/api';
import type { FlashcardResult, FlashcardSubmission } from './flashcard-history';

export type FlashcardStats = { sessions: number; reviewedWords: number; forgottenIds: string[] };
type FlashcardHistoryPage = { items: FlashcardResult[]; nextCursor: string | null; stats?: FlashcardStats };

export function getFlashcardHistory(before?: string) {
  const query = before ? `?${new URLSearchParams({ before })}` : '';
  return apiFetch<FlashcardHistoryPage>(`/learner/flashcards${query}`);
}

export function saveFlashcardSession(ownerId: string, { cardCount: _cardCount, ...result }: FlashcardSubmission) {
  return apiFetch<{ id: string }>('/learner/flashcards', { method: 'POST', json: { ...result, ownerId } });
}
