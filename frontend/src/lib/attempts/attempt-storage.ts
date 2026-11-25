import { parseAttemptDraft, type AttemptDraft } from "./attempt-draft.ts";
import {
  purgeExpiredRecordings,
  purgeRecordings,
  type OpenRecordingDb,
  recordingPrefix,
  recordingScope,
  recordingUserPrefix,
} from "./recordings.ts";
import { clearPendingTextsOf, sweepPendingTexts } from "./writing-queue.ts";

/**
 * Draft của cả 4 kỹ năng nằm ở localStorage (bền qua đóng tab) và hết hạn sau
 * 24 giờ kể từ lần lưu cuối. Bài Speaking còn có bản ghi âm trong IndexedDB,
 * được dọn cùng draft để không giữ giọng nói người học trên máy.
 */
export const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const DRAFT_TAG = "ieltspace-draft";
const SPEAKING_PAGE = "SpeakingTest";
const WRITING_PAGE = "WritingTest";
const ATTEMPT_PAGES = [
  "ReadingTest",
  "ListeningTest",
  WRITING_PAGE,
  SPEAKING_PAGE,
];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;
export interface DraftStores {
  local: Store | null;
  /** Nơi lưu draft cũ của Reading/Listening/Writing (chỉ đọc để chuyển sang localStorage). */
  session: Store | null;
}

function pick(get: () => Store): Store | null {
  try {
    return get();
  } catch {
    // Trình duyệt chặn lưu trữ: coi như không có.
    return null;
  }
}
export function defaultStores(): DraftStores {
  return { local: pick(() => localStorage), session: pick(() => sessionStorage) };
}

/** Khóa draft của một lượt làm (dùng chung với AttemptSession). */
export function draftKey(
  userId: string | null | undefined,
  page: string,
  examId: string | null | undefined,
): string {
  return JSON.stringify([DRAFT_TAG, userId, page, examId]);
}

function parseKey(
  key: string,
): { userId: string; page: string; examId: string } | null {
  try {
    const value: unknown = JSON.parse(key);
    if (
      Array.isArray(value) &&
      value[0] === DRAFT_TAG &&
      typeof value[2] === "string" &&
      ATTEMPT_PAGES.includes(value[2])
    )
      return {
        userId: typeof value[1] === "string" ? value[1] : "",
        page: value[2],
        examId: typeof value[3] === "string" ? value[3] : "",
      };
  } catch {
    // Khóa không phải của draft: bỏ qua.
  }
  return null;
}

function draftKeys(storage: Store | null) {
  const found: { key: string; userId: string; page: string; examId: string }[] =
    [];
  if (!storage) return found;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const parsed = key ? parseKey(key) : null;
    if (key && parsed) found.push({ key, ...parsed });
  }
  return found;
}

function isFresh(draft: AttemptDraft, now: number): boolean {
  return (
    draft.savedAt !== undefined && now - draft.savedAt <= DRAFT_MAX_AGE_MS
  );
}

/**
 * Chuyển draft cũ trong sessionStorage sang localStorage (một lần): draft cũ
 * có thể chưa có `savedAt` nên tính từ lúc chuyển. Đã có draft ở localStorage
 * thì giữ bản đó. Hỏng hoặc không ghi được thì bỏ qua an toàn.
 */
function migrateSessionDraft(key: string, stores: DraftStores, now: number) {
  const { local, session } = stores;
  if (!local || !session) return;
  try {
    const raw = session.getItem(key);
    if (raw === null) return;
    if (local.getItem(key) === null && parseAttemptDraft(raw)) {
      const value = JSON.parse(raw) as Record<string, unknown>;
      if (typeof value.savedAt !== "number") value.savedAt = now;
      local.setItem(key, JSON.stringify(value));
    }
    session.removeItem(key);
  } catch {
    // Không ghi được (đầy/bị chặn): để nguyên bản cũ, lần sau thử lại.
  }
}

/**
 * Đọc draft theo khóa, kiểm hạn 24 giờ, parse an toàn. Quá hạn hoặc hỏng thì
 * xóa và báo `expired` để nơi gọi dọn bản ghi âm đi kèm.
 */
export function loadDraft(
  key: string,
  now: number = Date.now(),
  stores: DraftStores = defaultStores(),
): { draft: AttemptDraft | null; expired: boolean } {
  migrateSessionDraft(key, stores, now);
  try {
    const raw = stores.local?.getItem(key) ?? null;
    if (raw === null) return { draft: null, expired: false };
    const draft = parseAttemptDraft(raw);
    if (!draft || !isFresh(draft, now)) {
      stores.local?.removeItem(key);
      return { draft: null, expired: true };
    }
    // Mốc thời gian ở tương lai (đồng hồ máy bị chỉnh): coi như vừa lưu, không để giây đã dùng âm.
    if (draft.savedAt !== undefined && draft.savedAt > now) draft.savedAt = now;
    if (draft.startedAtEpoch !== undefined && draft.startedAtEpoch > now)
      draft.startedAtEpoch = now;
    return { draft, expired: false };
  } catch {
    return { draft: null, expired: false };
  }
}

/** Bài làm dở của người dùng trên đề này ở trang này, hoặc null (chưa đăng nhập, không có, quá hạn). */
export function findInProgressDraft(
  userId: string | null | undefined,
  page: string,
  examId: string | null | undefined,
  now: number = Date.now(),
  stores: DraftStores = defaultStores(),
): AttemptDraft | null {
  if (!userId || !examId || !ATTEMPT_PAGES.includes(page)) return null;
  return loadDraft(draftKey(userId, page, examId), now, stores).draft;
}

export function inProgressId(page: string, examId: string): string {
  return page + "\u0001" + examId;
}

/**
 * Mốc tuyệt đối bắt đầu tính giờ của bài Speaking/Writing đã bắt đầu (đồng hồ vẫn chạy
 * khi người học rời đi). Draft chưa có mốc thì suy ra từ giây đã dùng tại savedAt.
 */
export function speakingEpoch(draft: AttemptDraft): number | undefined {
  if (draft.startedAtEpoch !== undefined) return draft.startedAtEpoch;
  if (draft.savedAt === undefined) return undefined;
  return draft.savedAt - draft.seconds * 1000;
}

/**
 * Bài Speaking/Writing đã bắt đầu tính giờ (có tiến độ hoặc có mốc bắt đầu) trong draft này.
 * Draft Writing cũ (trước khi nối máy chủ) không có cả hai nên vẫn theo cách tạm dừng đồng hồ cũ.
 */
export function speakingBegan(draft: AttemptDraft): boolean {
  return (
    !!draft.state?.speaking ||
    !!draft.state?.writing ||
    draft.startedAtEpoch !== undefined
  );
}

/** Draft Speaking/Writing có giới hạn thời gian mà giờ đã hết (đồng hồ chạy cả khi rời đi). */
export function speakingTimedOut(draft: AttemptDraft, now: number): boolean {
  const limit = draft.options.limitMinutes ?? 0;
  if (limit <= 0 || !speakingBegan(draft)) return false;
  const epoch = speakingEpoch(draft);
  return epoch !== undefined && now - epoch >= limit * 60 * 1000;
}

/**
 * Mọi bài làm dở của người dùng, đọc storage một lượt (cho danh sách nhiều
 * hàng). Khóa là `inProgressId(page, examId)`; `timedOut` chỉ có nghĩa với
 * Speaking đã hết giờ nhưng chưa được lưu/hủy. Không xóa gì; chỉ chuyển draft
 * cũ từ sessionStorage sang localStorage.
 */
export function listInProgressInfo(
  userId: string | null | undefined,
  now: number = Date.now(),
  stores: DraftStores = defaultStores(),
): Map<string, { timedOut: boolean }> {
  const found = new Map<string, { timedOut: boolean }>();
  if (!userId) return found;
  try {
    for (const item of draftKeys(stores.session))
      if (item.userId === userId) migrateSessionDraft(item.key, stores, now);
    for (const item of draftKeys(stores.local)) {
      if (item.userId !== userId || !item.examId) continue;
      const draft = parseAttemptDraft(stores.local?.getItem(item.key) ?? null);
      // Draft đã Hoàn thành/Lưu (chờ chốt ở trang xác nhận) không phải bài làm dở để tiếp tục.
      if (draft && !draft.finished && isFresh(draft, now))
        found.set(inProgressId(item.page, item.examId), {
          timedOut:
            (item.page === SPEAKING_PAGE || item.page === WRITING_PAGE) &&
            speakingTimedOut(draft, now),
        });
    }
  } catch {
    // Không đọc được: coi như không có bài dở.
  }
  return found;
}

/** Như `listInProgressInfo` nhưng chỉ lấy tập khóa (dùng `inProgressId(page, examId)` để tra). */
export function listInProgress(
  userId: string | null | undefined,
  now: number = Date.now(),
  stores: DraftStores = defaultStores(),
): Set<string> {
  return new Set(listInProgressInfo(userId, now, stores).keys());
}

/**
 * Xóa mọi draft (localStorage và sessionStorage cũ, kể cả bản `finished`) của một lượt
 * theo người dùng + trang + đề. Idempotent; không đụng bản ghi âm.
 */
export function clearAttemptDraft(
  userId: string | null | undefined,
  page: string,
  examId: string | null | undefined,
  stores: DraftStores = defaultStores(),
): void {
  const key = draftKey(userId, page, examId);
  for (const storage of [stores.local, stores.session]) {
    try {
      storage?.removeItem(key);
    } catch {
      // Lưu trữ không dùng được: không có draft để xóa.
    }
  }
}

/** Đăng xuất: xóa draft mọi kỹ năng và bản ghi âm của người dùng khỏi máy này. */
export async function clearAttemptLocalData(
  userId: string | null | undefined,
  stores: DraftStores = defaultStores(),
): Promise<void> {
  if (!userId) return;
  for (const storage of [stores.local, stores.session]) {
    try {
      for (const item of draftKeys(storage))
        if (item.userId === userId) storage?.removeItem(item.key);
    } catch {
      // Lưu trữ không dùng được: không có draft để xóa.
    }
  }
  clearPendingTextsOf(stores.local, userId);
  await purgeRecordings(recordingUserPrefix(userId));
}

/**
 * Quét khi tải app/vào trang làm bài: bỏ draft quá 24 giờ (Speaking kèm bản
 * ghi của đề đó) và bản ghi trong IndexedDB quá 24 giờ. Bản ghi của lượt mà
 * một draft Speaking còn hạn đang trỏ tới thì giữ (draft hết hạn theo lần lưu
 * cuối, mà tự lưu đẩy mốc đó lên, nên bản ghi cũ hơn draft vẫn còn dùng được).
 */
export async function sweepAttemptStorage(
  now: number = Date.now(),
  stores: DraftStores = defaultStores(),
  openDb?: OpenRecordingDb,
): Promise<void> {
  // Văn bản Writing chưa lưu lên máy chủ: bỏ bản quá 24 giờ (cùng hạn với nháp).
  sweepPendingTexts(stores.local, now, DRAFT_MAX_AGE_MS);
  const keepScopes = new Set<string>();
  const keepPrefixes: string[] = [];
  try {
    for (const item of draftKeys(stores.session))
      migrateSessionDraft(item.key, stores, now);
    for (const item of draftKeys(stores.local)) {
      const draft = parseAttemptDraft(stores.local?.getItem(item.key) ?? null);
      if (draft && isFresh(draft, now)) {
        if (item.page === SPEAKING_PAGE) {
          const attemptId = draft.state?.speaking?.attemptId;
          if (attemptId)
            keepScopes.add(recordingScope(item.userId, item.examId, attemptId));
          // Draft chưa biết lượt nào: giữ cả đề, không đoán.
          else keepPrefixes.push(recordingPrefix(item.userId, item.examId));
        }
        continue;
      }
      stores.local?.removeItem(item.key);
      if (item.page === SPEAKING_PAGE)
        await purgeRecordings(
          recordingPrefix(item.userId, item.examId),
          openDb,
        );
    }
  } catch {
    // Quét là việc dọn dẹp, lỗi thì để lần sau.
  }
  await purgeExpiredRecordings(
    DRAFT_MAX_AGE_MS,
    openDb,
    now,
    (scope) =>
      keepScopes.has(scope) || keepPrefixes.some((p) => scope.startsWith(p)),
  );
}
