import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthUser } from '../auth/auth';
import { getFlashcardHistory, saveFlashcardSession, type FlashcardStats } from './flashcard-api';
import {
  queueFlashcardResult, readFlashcardHistory, readPendingResults, removePendingResult,
  type FlashcardResult, type FlashcardSubmission,
} from './flashcard-history';

export function useFlashcardHistory(userId: string) {
  const [items, setItems] = useState<FlashcardResult[]>([]);
  const [localHistory, setLocalHistory] = useState<FlashcardResult[]>([]);
  const [stats, setStats] = useState<FlashcardStats>();
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [syncError, setSyncError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [revision, setRevision] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const pending = useRef(new Map<string, FlashcardSubmission>());
  const syncInProgress = useRef(false);
  const requestNumber = useRef(0);
  const alive = useRef(false);

  const sync = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    const attempted = new Set<string>();
    let saved = false;
    let error = '';
    setSyncing(true);
    try {
      for (const [id, result] of pending.current) {
        if (!alive.current || getAuthUser()?.id !== userId) break;
        if (attempted.has(id)) continue;
        attempted.add(id);
        try {
          await saveFlashcardSession(userId, result);
          pending.current.delete(id);
          try { removePendingResult(userId, id); } catch { /* A later retry keeps the same ID. */ }
          saved = true;
        } catch (cause) {
          error = cause instanceof Error ? cause.message : 'Chưa thể đồng bộ phiên ôn.';
        }
      }
    } finally {
      syncInProgress.current = false;
      if (alive.current) {
        setSyncing(false);
        setPendingCount(pending.current.size);
        setSyncError(error);
        if (saved) setRevision(value => value + 1);
      }
    }
  }, [userId]);

  useEffect(() => {
    alive.current = true;
    try {
      setLocalHistory(readFlashcardHistory(userId));
      for (const result of readPendingResults(userId)) pending.current.set(result.id, result);
      setPendingCount(pending.current.size);
    } catch { /* Browser storage may be disabled. */ }
    void sync();
    function online() { void sync(); }
    window.addEventListener('online', online);
    return () => {
      alive.current = false;
      window.removeEventListener('online', online);
    };
  }, [userId, sync]);

  const load = useCallback(async (before?: string) => {
    const request = ++requestNumber.current;
    setLoading(true);
    setHistoryError('');
    try {
      const page = await getFlashcardHistory(before);
      if (!alive.current || request !== requestNumber.current) return;
      setItems(previous => {
        if (!before) return page.items;
        const known = new Set(previous.map(item => item.id));
        return [...previous, ...page.items.filter(item => !known.has(item.id))];
      });
      setCursor(page.nextCursor);
      if (page.stats) setStats(page.stats);
    } catch (cause) {
      if (alive.current && request === requestNumber.current) {
        setHistoryError(cause instanceof Error ? cause.message : 'Chưa tải được lịch sử ôn.');
      }
    } finally {
      if (alive.current && request === requestNumber.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, revision]);

  function save(result: FlashcardSubmission) {
    pending.current.set(result.id, result);
    setPendingCount(pending.current.size);
    try { queueFlashcardResult(userId, result); }
    catch { /* The in-memory queue still allows retry on this page. */ }
    void sync();
  }

  return {
    items, localHistory, stats, cursor, loading, historyError, syncError, syncing, pendingCount, save, sync,
    isPending: (id: string) => pending.current.has(id), load,
  };
}
