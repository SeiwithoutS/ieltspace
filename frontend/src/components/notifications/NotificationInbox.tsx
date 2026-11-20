import React, { useEffect, useRef, useState } from "react";
import {
  listNotifications, markAllNotificationsRead, markNotificationRead,
  useNotificationCount, type Notification, type NotificationPage,
} from "../../lib/notifications/notifications";
import { getAuthUser, navigate, useAuth } from "../../lib/auth/auth";
import { apiFetch } from "../../lib/shared/api";
import { type Role } from "../../lib/auth/account";
import { styleOf } from "../../lib/shared/styles";
export default function NotificationInbox({ role }: { role: Role }) {
  const userId = useAuth().user?.id;
  const unread = useNotificationCount();
  const [filter, setFilter] = useState("all");
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState<NotificationPage>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<{ owner: string | undefined; title: string; skill: string; status: string; expiresAt: string | null }>();
  const request = useRef(0);
  const [owner, setOwner] = useState<string>();
  const visible = owner === userId ? page : undefined;

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") setRevision(value => value + 1);
    }
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => document.removeEventListener("visibilitychange", refreshWhenVisible);
  }, []);

  useEffect(() => {
    const current = ++request.current;
    setPage(undefined);
    setOwner(userId);
    setError("");
    if (!userId) return;
    void listNotifications(filter === "unread").then(result => {
      if (request.current === current) setPage(result);
    }).catch((failure: Error) => {
      if (request.current === current) setError(failure.message);
    });
    return () => { request.current++; };
  }, [filter, revision, unread, userId]);

  async function update(action: () => Promise<void>, destination?: string) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      if (getAuthUser()?.id !== userId) return;
      setError("");
      if (destination) navigate(destination);
      else setRevision(value => value + 1);
    } catch (failure) {
      if (getAuthUser()?.id === userId) setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    if (!visible?.nextCursor || busy) return;
    const current = request.current;
    setBusy(true);
    setError("");
    try {
      const next = await listNotifications(filter === "unread", visible.nextCursor);
      if (request.current === current) {
        setPage({ items: [...visible.items, ...next.items], nextCursor: next.nextCursor });
      }
    } catch (failure) {
      if (request.current === current) setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function openGradingDetail(item: Notification) {
    await update(async () => {
      setDetail(undefined);
      if (!item.readAt) await markNotificationRead(item.id);
      const result = await apiFetch<{ skill: string; status: string; expiresAt: string | null }>(
        `/notifications/${encodeURIComponent(item.id)}/target`,
      );
      if (getAuthUser()?.id === userId) setDetail({ owner: userId, title: item.title, ...result });
    });
  }

  const actionStyle = styleOf("border:0;background:transparent;color:#2963CC;cursor:pointer;padding:4px;font:inherit");
  const hasUnread = (unread ?? 0) > 0 || visible?.items.some(item => item.readAt === null);
  return (
    <div
      style={styleOf(
        "border:1.5px solid #D6D4D0;border-radius:22px;background:#FFFFFF;overflow:hidden;box-shadow:0 1px 2px rgba(53, 38, 55, 0.04)",
      )}
    >
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, fontSize: 18, fontWeight: 600 }}>Thông báo</div>
        <div
          role="group"
          aria-label="Lọc thông báo"
          style={styleOf(
            "display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:#F3F0EA",
          )}
        >
          {[
            ["all", "Tất cả"],
            ["unread", "Chưa đọc"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              style={styleOf(
                "height:34px;padding:0 14px;border-radius:8px;font:inherit;cursor:pointer;" +
                  (filter === value
                    ? "background:#FFFFFF;border:1.5px solid #D6D4D0;color:#352637;font-weight:600"
                    : "background:transparent;border:1.5px solid transparent;color:#706473"),
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          disabled={!hasUnread || busy}
          onClick={() => void update(markAllNotificationsRead)}
          style={styleOf(
            "height:36px;padding:0 20px;border-radius:999px;border:1.5px solid #D6D4D0;background:#FFFFFF;color:#352637;font:inherit;font-size:14px;font-weight:600;cursor:pointer",
          )}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>
      {error && (
        <p role="alert" style={{ padding: "0 18px" }}>
          {error}
          {!visible && <button style={actionStyle} onClick={() => setRevision(value => value + 1)}>Thử lại</button>}
        </p>
      )}
      {!visible && !error && <p role="status" style={{ padding: "0 18px" }}>Đang tải thông báo…</p>}
      {detail && detail.owner === userId && <div role="status" style={{ padding: "0 18px" }}>
        <strong>{detail.title}</strong>
        <p>{detail.skill === "WRITING" ? "Writing" : "Speaking"}
          {detail.expiresAt && ` · Hạn lưu ${new Date(detail.expiresAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} (giờ Việt Nam)`}</p>
        <button type="button" style={actionStyle} onClick={() => setDetail(undefined)}>Đóng chi tiết</button>
      </div>}
      {visible?.items.map((item) => {
        const isUnread = item.readAt === null;
        const destination = item.referenceType === "SUPPORT_REPORT" && item.referenceId && role !== "admin"
          ? `${role === "learner" ? "Profile" : "StaffProfile"}?report=${encodeURIComponent(item.referenceId)}`
          : undefined;
        return (
          <div
            key={item.id}
            style={styleOf(
              "display:flex;gap:12px;align-items:flex-start;padding:14px 18px;border-top:1px solid #E6E4E0;background:" +
                (isUnread
                  ? "linear-gradient(135deg, #E3ECFD 0%, #E6F3EC 100%)"
                  : "#FCFBF7"),
            )}
          >
            <span
              aria-label={isUnread ? "Chưa đọc" : "Đã đọc"}
              style={styleOf(
                "width:8px;height:8px;flex:0 0 8px;border-radius:50%;margin-top:7px;background:" +
                  (isUnread ? "#E5604A" : "transparent"),
              )}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontWeight: isUnread ? 700 : 500, fontSize: 14 }}
              >
                {destination ? <a href={`#${destination}`} onClick={(event) => {
                  if (!isUnread || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  void update(() => markNotificationRead(item.id), destination);
                }}>{item.title}</a> : item.referenceType === "SKILL_ATTEMPT" || item.referenceType === "GRADING_REQUEST"
                  ? <button type="button" disabled={busy} style={actionStyle} onClick={() => void openGradingDetail(item)}>{item.title}</button>
                  : item.title}
              </div>
              <div style={styleOf("font-size:13px;color:#706473")}>
                <span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.content}</span>
              </div>
            </div>
            {isUnread && (
              <button
                aria-label={"Đánh dấu đã đọc: " + item.title}
                title="Đánh dấu đã đọc"
                disabled={busy}
                onClick={() => void update(() => markNotificationRead(item.id))}
                style={actionStyle}
              >
                ✓
              </button>
            )}
          </div>
        );
      })}
      {visible?.nextCursor && <div style={{ padding: "8px 18px" }}>
        <button type="button" disabled={busy} style={actionStyle} onClick={() => void loadMore()}>Xem thêm</button>
      </div>}
      {visible?.items.length === 0 && (
        <p
          role="status"
          style={styleOf("padding:24px;text-align:center;color:#706473")}
        >
          {filter === "unread" ? "Bạn đã đọc tất cả thông báo." : "Chưa có thông báo."}
        </p>
      )}
    </div>
  );
}
