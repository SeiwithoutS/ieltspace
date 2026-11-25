/**
 * Hàng đợi xóa lượt làm trên máy chủ cho trường hợp "Không lưu" lúc mất mạng:
 * ghi lại mã lượt để xóa sau khi có mạng. Chỉ lưu mã lượt, không lưu nội dung.
 */
export const PENDING_DELETES_KEY = "ieltspace-pending-attempt-deletes";
type Store = Pick<Storage, "getItem" | "setItem">;
export interface PendingDelete {
  userId: string;
  serverId: string;
}

function read(store: Store): PendingDelete[] {
  try {
    const value: unknown = JSON.parse(store.getItem(PENDING_DELETES_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(
      (v): v is PendingDelete =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as PendingDelete).userId === "string" &&
        typeof (v as PendingDelete).serverId === "string",
    );
  } catch {
    return [];
  }
}
function write(store: Store, list: PendingDelete[]) {
  try {
    store.setItem(PENDING_DELETES_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    // Không ghi được: bỏ, lượt bỏ dở sẽ tự hết hạn phía máy chủ.
  }
}

export function queueDelete(store: Store, item: PendingDelete) {
  const list = read(store);
  if (!list.some((i) => i.serverId === item.serverId)) write(store, [...list, item]);
}
export function pendingDeletes(store: Store): PendingDelete[] {
  return read(store);
}

/**
 * Xóa các lượt đang chờ của `userId`. `remove` ném lỗi mạng/tạm thì giữ lại để
 * lần sau; trả về số lượt đã xóa xong (kể cả lượt máy chủ báo không còn).
 */
export async function flushDeletes(
  store: Store,
  userId: string,
  remove: (serverId: string) => Promise<void>,
  isGone: (error: unknown) => boolean,
  isTemporary: (error: unknown) => boolean,
): Promise<number> {
  const list = read(store);
  const keep: PendingDelete[] = [];
  let removed = 0;
  for (const item of list) {
    if (item.userId !== userId) {
      keep.push(item);
      continue;
    }
    try {
      await remove(item.serverId);
      removed++;
    } catch (e) {
      if (isGone(e)) removed++;
      else if (isTemporary(e)) keep.push(item);
      // Lỗi cố định khác (bị từ chối): bỏ, không thử mãi.
    }
  }
  write(store, keep);
  return removed;
}
