/**
 * Kho bản ghi âm theo từng câu. Giao diện luôn gọi qua `RecordingStore` (bất
 * đồng bộ) để bước lưu bền chỉ cần thêm một bản cài đặt IndexedDB cùng giao
 * diện này mà không sửa trang làm bài. `createMemoryRecordingStore` giữ trong bộ nhớ trình
 * duyệt: mất khi tải lại hoặc đóng tab.
 */
import { canAppendChunk, type RecordingChunk } from "./recording-chunks.ts";

export interface RecordedAnswer {
  blob: Blob;
  mimeType: string;
  /** Độ dài tính bằng mili giây. */
  durationMs: number;
  recordedAt: number;
}

export interface RecordingStore {
  get(questionId: string): Promise<RecordedAnswer | undefined>;
  /** Ghi đè nếu câu đã có bản ghi (ghi lại ở Practice). */
  put(questionId: string, answer: RecordedAnswer): Promise<void>;
  remove(questionId: string): Promise<void>;
  /** Xóa hết (hủy bài, "Không lưu"). */
  clear(): Promise<void>;
  /** Các câu đã có bản ghi. */
  ids(): Promise<string[]>;
  /** Giải phóng tài nguyên (kết nối IndexedDB). Dùng lại sau đó thì tự mở lại. */
  close?(): void;
}

export function createMemoryRecordingStore(): RecordingStore {
  const map = new Map<string, RecordedAnswer>();
  return {
    async get(id) {
      return map.get(id);
    },
    async put(id, answer) {
      map.set(id, answer);
    },
    async remove(id) {
      map.delete(id);
    },
    async clear() {
      map.clear();
    },
    async ids() {
      return [...map.keys()];
    },
  };
}

/**
 * Mỗi thành phần của khóa được mã hóa bằng encodeURIComponent để dấu phân cách
 * "|" không thể nằm trong dữ liệu (examId chứa "|" không làm tiền tố của đề
 * khác khớp nhầm). Khóa lưu bằng cách cũ (không mã hóa) chỉ có ở máy dev; bản
 * ghi cũ đó không còn khớp và sẽ bị quét sau 24 giờ.
 */
const part = (value: string | null | undefined) =>
  encodeURIComponent(value ?? "");

/** Khóa phạm vi bản ghi của một lượt làm: người dùng + đề + lượt. */
export function recordingScope(
  userId: string | null | undefined,
  examId: string | null | undefined,
  attemptId: string,
): string {
  return [part(userId), part(examId), part(attemptId)].join("|");
}

/** Tiền tố chung mọi lượt làm của một người dùng trên một đề (để dọn). */
export function recordingPrefix(
  userId: string | null | undefined,
  examId: string | null | undefined,
): string {
  return [part(userId), part(examId)].join("|") + "|";
}

/** Tiền tố chung mọi bản ghi của một người dùng (đăng xuất). */
export function recordingUserPrefix(userId: string | null | undefined): string {
  return part(userId) + "|";
}

const DB_NAME = "ieltspace-recordings";
const STORE_NAME = "answers";
const KEY_SEP = "\u0001";

interface StoredRecording {
  key: string;
  scope: string;
  id: string;
  blob: Blob;
  mimeType: string;
  durationMs: number;
  recordedAt: number;
}

export type OpenRecordingDb = () => Promise<IDBDatabase>;

export function openRecordingDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB không khả dụng"));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, 1);
    } catch (e) {
      reject(e);
      return;
    }
    // Đã từ chối (bị chặn) mà sau đó vẫn mở được thì đóng ngay để không rò kết nối.
    let settled = false;
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
    };
    request.onsuccess = () => {
      const db = request.result;
      // Tab khác nâng phiên bản: nhả kết nối để không chặn tab đó.
      db.onversionchange = () => db.close();
      if (settled) db.close();
      else {
        settled = true;
        resolve(db);
      }
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      reject(request.error);
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(new Error("IndexedDB bị chặn"));
    };
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function rangeOf(prefix: string): IDBKeyRange {
  return IDBKeyRange.bound(prefix, prefix + "\uffff");
}

/** Xóa mọi bản ghi có khóa bắt đầu bằng `prefix` (không ném lỗi nếu IndexedDB hỏng). */
export async function purgeRecordings(
  prefix: string,
  openDb: OpenRecordingDb = openRecordingDb,
): Promise<void> {
  try {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(rangeOf(prefix));
      await transactionDone(tx);
    } finally {
      db.close();
    }
  } catch {
    // Không có IndexedDB thì không có gì để dọn.
  }
}

/**
 * Duyệt các hàng (trong `range` nếu có) và xóa hàng mà `shouldDelete` trả true.
 * Trả về số hàng đã xóa; IndexedDB hỏng thì trả 0.
 */
async function deleteRowsWhere(
  openDb: OpenRecordingDb,
  shouldDelete: (row: Partial<StoredRecording>) => boolean,
  range?: IDBKeyRange,
): Promise<number> {
  try {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const done = transactionDone(tx);
      let removed = 0;
      const cursorRequest = tx.objectStore(STORE_NAME).openCursor(range);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        if (shouldDelete(cursor.value as Partial<StoredRecording>)) {
          cursor.delete();
          removed++;
        }
        cursor.continue();
      };
      await done;
      return removed;
    } finally {
      db.close();
    }
  } catch {
    return 0;
  }
}

/**
 * Xóa mọi bản ghi quá `maxAgeMs` (theo thời điểm bắt đầu ghi). Bản ghi thuộc
 * phạm vi mà `keep` trả true thì giữ dù quá hạn: draft còn hạn đang trỏ tới nó
 * (draft hết hạn theo lần lưu cuối, không theo lúc ghi). Trả về số bản ghi đã xóa.
 */
export function purgeExpiredRecordings(
  maxAgeMs: number,
  openDb: OpenRecordingDb = openRecordingDb,
  now: number = Date.now(),
  keep?: (scope: string) => boolean,
): Promise<number> {
  return deleteRowsWhere(openDb, (row) => {
    if (typeof row.scope === "string" && keep?.(row.scope)) return false;
    // Hàng hỏng (không có thời điểm) cũng bỏ: không có draft nào trỏ tới được.
    return typeof row.recordedAt !== "number" || now - row.recordedAt > maxAgeMs;
  });
}

/**
 * Xóa bản ghi dưới `prefix` (người dùng + đề) thuộc phạm vi mà `keep` trả false:
 * dọn bản ghi sót của lượt khác mà không đụng lượt hiện tại hay lượt còn draft.
 */
export function purgeRecordingsExcept(
  prefix: string,
  keep: (scope: string) => boolean,
  openDb: OpenRecordingDb = openRecordingDb,
): Promise<number> {
  return deleteRowsWhere(
    openDb,
    (row) => !(typeof row.scope === "string" && keep(row.scope)),
    rangeOf(prefix),
  );
}

/** Kho bản ghi bền trong IndexedDB, phạm vi theo `scope`. Ném lỗi nếu IndexedDB không dùng được. */
export function createIndexedDbRecordingStore(
  scope: string,
  openDb: OpenRecordingDb = openRecordingDb,
): RecordingStore {
  const prefix = scope + KEY_SEP;
  let opened: Promise<IDBDatabase> | null = null;
  const db = () =>
    (opened ??= openDb().then((conn) => {
      // Tab khác nâng phiên bản: nhả kết nối, lần dùng sau mở lại.
      conn.onversionchange = () => {
        conn.close();
        opened = null;
      };
      return conn;
    }));
  const keyOf = (id: string) => prefix + id;
  return {
    async get(id) {
      const row = (await requestToPromise(
        (await db()).transaction(STORE_NAME).objectStore(STORE_NAME).get(keyOf(id)),
      )) as StoredRecording | undefined;
      if (!row || !(row.blob instanceof Blob)) return undefined;
      return {
        blob: row.blob,
        mimeType: row.mimeType,
        durationMs: row.durationMs,
        recordedAt: row.recordedAt,
      };
    },
    async put(id, answer) {
      const tx = (await db()).transaction(STORE_NAME, "readwrite");
      const row: StoredRecording = {
        key: keyOf(id),
        scope,
        id,
        blob: answer.blob,
        mimeType: answer.mimeType,
        durationMs: answer.durationMs,
        recordedAt: answer.recordedAt,
      };
      tx.objectStore(STORE_NAME).put(row);
      await transactionDone(tx);
    },
    async remove(id) {
      const tx = (await db()).transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(keyOf(id));
      await transactionDone(tx);
    },
    async clear() {
      const tx = (await db()).transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(rangeOf(prefix));
      // Cả đoạn ghi dở của lượt này (khóa dùng dấu phân cách khác).
      tx.objectStore(STORE_NAME).delete(rangeOf(chunkPrefix(scope)));
      await transactionDone(tx);
    },
    async ids() {
      const keys = await requestToPromise(
        (await db())
          .transaction(STORE_NAME)
          .objectStore(STORE_NAME)
          .getAllKeys(rangeOf(prefix)),
      );
      return keys.map((k) => String(k).slice(prefix.length));
    },
    close() {
      const current = opened;
      opened = null;
      void current?.then((conn) => conn.close()).catch(() => undefined);
    },
  };
}

/**
 * Kho đoạn ghi dở (SPK-17), cùng phạm vi lượt làm với RecordingStore nhưng khóa riêng nên không lẫn vào `ids()`.
 * Đoạn chỉ có ích nếu trang bị đóng đột ngột: dừng bình thường thì bản hoàn chỉnh được `put` rồi `dropChunks`.
 */
export interface ChunkStore {
  /** Lưu một đoạn; trả false nếu bị bỏ vì vượt trần số đoạn/dung lượng của câu (bản ghi chính không ảnh hưởng). */
  appendChunk(questionId: string, chunk: RecordingChunk): Promise<boolean>;
  /** Mọi đoạn của câu, theo thứ tự seq. */
  readChunks(questionId: string): Promise<RecordingChunk[]>;
  /** Các câu đang có đoạn. */
  chunkQuestionIds(): Promise<string[]>;
  /** Xóa đoạn của câu (bắt đầu ghi mới, ghi xong, bỏ bản dở). */
  dropChunks(questionId: string): Promise<void>;
}

/** Bộ đếm trần theo câu, dùng chung cho mọi kho đoạn. */
function createChunkBudget() {
  const used = new Map<string, { count: number; bytes: number }>();
  return {
    allow(id: string, chunk: RecordingChunk): boolean {
      const cur = used.get(id) ?? { count: 0, bytes: 0 };
      if (!canAppendChunk(cur, chunk.blob)) return false;
      used.set(id, { count: cur.count + 1, bytes: cur.bytes + chunk.blob.size });
      return true;
    },
    reset(id: string) {
      used.delete(id);
    },
    resetAll() {
      used.clear();
    },
  };
}

export function createMemoryChunkStore(): ChunkStore {
  const map = new Map<string, RecordingChunk[]>();
  const budget = createChunkBudget();
  return {
    async appendChunk(id, chunk) {
      if (!budget.allow(id, chunk)) return false;
      map.set(id, [...(map.get(id) ?? []), chunk]);
      return true;
    },
    async readChunks(id) {
      return [...(map.get(id) ?? [])].sort((a, b) => a.seq - b.seq);
    },
    async chunkQuestionIds() {
      return [...map.keys()];
    },
    async dropChunks(id) {
      map.delete(id);
      budget.reset(id);
    },
  };
}

const CHUNK_SEP = "\u0002";
const chunkPrefix = (scope: string) => scope + CHUNK_SEP;
const chunkKey = (scope: string, id: string, seq: number) =>
  scope + CHUNK_SEP + id + CHUNK_SEP + String(seq).padStart(6, "0");

/** Kho đoạn trong cùng object store IndexedDB (khóa dùng dấu phân cách khác nên `ids()` không thấy). */
export function createIndexedDbChunkStore(
  scope: string,
  openDb: OpenRecordingDb = openRecordingDb,
): ChunkStore & { close(): void } {
  const budget = createChunkBudget();
  let opened: Promise<IDBDatabase> | null = null;
  const db = () =>
    (opened ??= openDb().then((conn) => {
      conn.onversionchange = () => {
        conn.close();
        opened = null;
      };
      return conn;
    }));
  const rangeFor = (id: string) => rangeOf(chunkKey(scope, id, 0).slice(0, -6));
  return {
    async appendChunk(id, chunk) {
      if (!budget.allow(id, chunk)) return false;
      const tx = (await db()).transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({
        key: chunkKey(scope, id, chunk.seq),
        scope,
        id,
        seq: chunk.seq,
        blob: chunk.blob,
        mimeType: chunk.mimeType,
        startedAt: chunk.startedAt,
        at: chunk.at,
        recordedAt: chunk.startedAt,
      });
      await transactionDone(tx);
      return true;
    },
    async readChunks(id) {
      const rows = (await requestToPromise(
        (await db()).transaction(STORE_NAME).objectStore(STORE_NAME).getAll(rangeFor(id)),
      )) as Array<Partial<RecordingChunk>>;
      return rows
        .filter(
          (r): r is RecordingChunk =>
            typeof r.seq === "number" &&
            r.blob instanceof Blob &&
            typeof r.startedAt === "number" &&
            typeof r.at === "number",
        )
        .map((r) => ({
          seq: r.seq,
          blob: r.blob,
          mimeType: r.mimeType ?? "",
          startedAt: r.startedAt,
          at: r.at,
        }))
        .sort((a, b) => a.seq - b.seq);
    },
    async chunkQuestionIds() {
      const prefix = chunkPrefix(scope);
      const keys = await requestToPromise(
        (await db()).transaction(STORE_NAME).objectStore(STORE_NAME).getAllKeys(rangeOf(prefix)),
      );
      return [
        ...new Set(
          keys.map((k) => String(k).slice(prefix.length).split(CHUNK_SEP)[0]),
        ),
      ];
    },
    async dropChunks(id) {
      budget.reset(id);
      const tx = (await db()).transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(rangeFor(id));
      await transactionDone(tx);
    },
    close() {
      const current = opened;
      opened = null;
      void current?.then((conn) => conn.close()).catch(() => undefined);
    },
  };
}

export interface DurableRecordingStore extends RecordingStore, ChunkStore {
  /** false khi IndexedDB lỗi/bị chặn và bản ghi chỉ còn trong bộ nhớ. */
  persistent(): boolean;
}

/**
 * Ghi xuyên suốt: luôn giữ bản trong bộ nhớ, đồng thời cố lưu vào IndexedDB.
 * IndexedDB lỗi thì tiếp tục chỉ với bộ nhớ (bài vẫn làm được, chỉ không khôi
 * phục được sau khi tải lại trang).
 */
export function createDurableRecordingStore(
  scope: string,
  openDb: OpenRecordingDb = openRecordingDb,
): DurableRecordingStore {
  const memory = createMemoryRecordingStore();
  const idb = createIndexedDbRecordingStore(scope, openDb);
  const chunks = createIndexedDbChunkStore(scope, openDb);
  let healthy = true;
  async function attempt<T>(job: () => Promise<T>): Promise<T | undefined> {
    try {
      return await job();
    } catch {
      healthy = false;
      return undefined;
    }
  }
  return {
    persistent: () => healthy,
    async get(id) {
      return (await memory.get(id)) ?? (await attempt(() => idb.get(id)));
    },
    async put(id, answer) {
      await memory.put(id, answer);
      await attempt(() => idb.put(id, answer));
    },
    async remove(id) {
      await memory.remove(id);
      await attempt(() => idb.remove(id));
    },
    async clear() {
      await memory.clear();
      await attempt(() => idb.clear());
    },
    close: () => {
      idb.close?.();
      chunks.close();
    },
    // Đoạn ghi dở chỉ có ích sau khi tải lại trang nên không giữ bản trong bộ nhớ; IndexedDB lỗi thì bỏ đoạn
    // (bản ghi chính vẫn ghép trong bộ nhớ khi dừng bình thường) và đánh dấu kho không bền.
    async appendChunk(id, chunk) {
      return (await attempt(() => chunks.appendChunk(id, chunk))) ?? false;
    },
    async readChunks(id) {
      return (await attempt(() => chunks.readChunks(id))) ?? [];
    },
    async chunkQuestionIds() {
      return (await attempt(() => chunks.chunkQuestionIds())) ?? [];
    },
    async dropChunks(id) {
      await attempt(() => chunks.dropChunks(id));
    },
    async ids() {
      const local = await memory.ids();
      const stored = (await attempt(() => idb.ids())) ?? [];
      return [...new Set([...local, ...stored])];
    },
  };
}
