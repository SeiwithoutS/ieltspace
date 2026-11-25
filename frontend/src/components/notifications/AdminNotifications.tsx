import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonClass, controlClass } from "../shared/ui";
import { apiFetch } from "../../lib/shared/api";
import { matchesDraft, saveAnnouncementDraft, type AnnouncementDraft as Draft, type PendingAnnouncementSave } from "../../lib/notifications/announcement-draft";

const base = "/admin/notifications";
const audiences = { ALL: "Tất cả tài khoản hoạt động", LEARNER: "Người học", TEACHER: "Giáo viên" };
type Audience = keyof typeof audiences;
type Announcement = Draft & { id: string; status: "DRAFT" | "SCHEDULED" | "SENT"; revision: number;
  scheduledAt: string | null; sentAt: string | null; recipientCount: number | null };
type Setting = { event: string; title: string; content: string; enabled: boolean; leadHours: number | null;
  revision: number; required: boolean; variables: string[] };
type Page = { items: Announcement[]; nextCursor: string | null };
const statuses = { DRAFT: "Bản nháp", SCHEDULED: "Đã lên lịch", SENT: "Đã gửi" };
const eventNames: Record<string, string> = {
  GRADING_REQUEST_ACCEPTED: "Tiếp nhận yêu cầu chấm", GRADING_ASSIGNED: "Phân công chấm",
  GRADING_RESULT_PUBLISHED: "Công bố kết quả", GRADING_CANCELLED_REFUNDED: "Hủy và hoàn lượt",
  GRADING_CANCELLED: "Hủy yêu cầu chấm", CONTENT_EXPIRING: "Nhắc nội dung sắp hết hạn",
};
const formatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
const tabs = ["Danh sách thông báo", "Tạo thông báo", "Cài đặt thông báo"];
const emptyDraft: Draft = { title: "", content: "", audience: "ALL" };
const panel = "rounded-[22px] border border-solid border-[var(--attempt-line-d6d4d0)] bg-[var(--attempt-bg-ffffff)] p-5";
const tabList = "flex w-fit max-w-full flex-wrap gap-[2px] rounded-[10px] bg-[var(--attempt-bg-f3f0ea)] p-[3px]";
const tabButton = "min-h-[34px] max-w-full cursor-pointer rounded-lg border-[1.5px] border-solid border-transparent bg-transparent px-3.5 py-0 font-sans text-[13px] font-medium text-[var(--attempt-text-706473)] aria-selected:border-[var(--attempt-line-d6d4d0)] aria-selected:bg-[var(--attempt-bg-ffffff)] aria-selected:font-semibold aria-selected:text-[var(--attempt-text-352637)] disabled:opacity-50";
const button = buttonClass({ size: "sm" });
const field = controlClass();

export default function AdminNotifications() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState<Page>();
  const [settings, setSettings] = useState<Setting[]>();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<Announcement>();
  const [schedule, setSchedule] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [reload, setReload] = useState(0);
  const pendingSave = useRef<PendingAnnouncementSave>({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let active = true;
    const fail = (failure: Error) => { if (active) setError(failure.message); };
    if (tab === 0) {
      void apiFetch<Page>(base + "/announcements").then(result => { if (active) setPage(result); }).catch(fail);
    } else if (tab === 2) {
      void apiFetch<{ items: Setting[] }>(base + "/settings").then(result => { if (active) setSettings(result.items); }).catch(fail);
    }
    return () => { active = false; };
  }, [tab, reload]);

  function show(index: number) {
    setError("");
    setTab(index);
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setStatus("");
    try { await action(); }
    catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      await saveAnnouncementDraft(draft, editing, pendingSave.current, {
        create: json => apiFetch<Announcement>(base + "/announcements", { method: "POST", json }),
        edit: ({ id, draft, revision }) => apiFetch<Announcement>(`${base}/announcements/${id}`, { method: "PATCH", json: { ...draft, revision } }),
        received: setEditing,
      });
      setStatus("Đã lưu bản nháp.");
    });
  }
  function dispatch(mode: "now" | "scheduled") {
    if (!editing || (mode === "scheduled" && !schedule)) return;
    const target = editing;
    void run(async () => {
      const item = await apiFetch<Announcement>(`${base}/announcements/${target.id}/send`, {
        method: "POST", json: { mode, revision: target.revision, ...(mode === "scheduled" ? { scheduledAt: `${schedule}:00+07:00` } : {}) },
      });
      setEditing(undefined); setDraft(emptyDraft); setSchedule("");
      show(0);
      setReload(value => value + 1);
      setStatus(item.status === "SENT" ? `Đã gửi cho ${item.recipientCount} tài khoản.` : "Đã đưa thông báo vào lịch gửi.");
    });
  }
  const saved = editing?.status === "DRAFT" && matchesDraft(draft, editing);

  return <div className="grid gap-4">
    <div role="tablist" aria-label="Quản lý thông báo" className={tabList}>
      {tabs.map((label, index) => <button key={label} type="button" role="tab" id={`announcement-tab-${index}`}
        ref={element => { tabRefs.current[index] = element; }} aria-selected={tab === index}
        tabIndex={tab === index ? 0 : -1} aria-controls="announcement-panel"
        className={tabButton} disabled={busy}
        onClick={() => show(index)} onKeyDown={event => {
          const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
            : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
            : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
          if (next >= 0) { event.preventDefault(); show(next); tabRefs.current[next]?.focus(); }
        }}>{label}</button>)}
    </div>
    <div role="tabpanel" id="announcement-panel" aria-labelledby={`announcement-tab-${tab}`} className={panel}>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      {tab === 0 && <>
        <button className={button} type="button" disabled={busy} onClick={() => { setError(""); setReload(value => value + 1); }}>Tải lại danh sách</button>
        {!page && !error && <p role="status">Đang tải thông báo chung…</p>}
        {page?.items.length === 0 && <p>Chưa có thông báo chung.</p>}
        {page?.items.map(item => <article key={item.id} className="border-0 border-b border-solid border-[var(--attempt-line-d6d4d0)] py-4">
          <h3 className="m-0">{item.title}</h3>
          <p className="whitespace-pre-wrap break-words">{item.content}</p>
          <p>{statuses[item.status]} · {audiences[item.audience]}
            {item.scheduledAt && ` · ${formatter.format(new Date(item.sentAt ?? item.scheduledAt))} giờ Việt Nam`}
            {item.recipientCount !== null && ` · ${item.recipientCount} người nhận`}</p>
          {item.status === "DRAFT" && <button type="button" className={button} onClick={() => {
            pendingSave.current = {};
            setEditing(item); setDraft({ title: item.title, content: item.content, audience: item.audience }); setSchedule(""); show(1);
          }}>Sửa bản nháp</button>}
        </article>)}
        {page?.nextCursor && <button className={button} type="button" disabled={busy} onClick={() => {
          const after = page.nextCursor!;
          void run(async () => {
            const next = await apiFetch<Page>(base + "/announcements?after=" + encodeURIComponent(after));
            setPage({ ...next, items: [...page.items, ...next.items] });
          });
        }}>Xem thêm</button>}
      </>}
      {tab === 1 && <form className="grid gap-3" onSubmit={saveDraft}>
        <label>Tiêu đề<input className={field} value={draft.title} required maxLength={200} disabled={busy}
          onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>Nội dung<textarea className={field} value={draft.content} required maxLength={3000} rows={4} disabled={busy}
          onChange={event => setDraft({ ...draft, content: event.target.value })} /></label>
        <label>Nhóm nhận<select className={field} value={draft.audience} disabled={busy}
          onChange={event => setDraft({ ...draft, audience: event.target.value as Audience })}>
          {Object.entries(audiences).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <div className="flex flex-wrap gap-2">
          <button className={button} disabled={busy} type="submit">Lưu bản nháp</button>
          {editing && <button className={button} disabled={busy} type="button" onClick={() => {
            pendingSave.current = {};
            setDraft(emptyDraft); setEditing(undefined); setSchedule(""); setStatus("");
          }}>Tạo bản nháp khác</button>}
        </div>
        {saved && <>
          <label>Thời điểm gửi theo giờ Việt Nam<input className={field} type="datetime-local" value={schedule}
            disabled={busy} onChange={event => setSchedule(event.target.value)} /></label>
          <div className="flex flex-wrap gap-2">
            <button className={button} disabled={busy} type="button" onClick={() => dispatch("now")}>Gửi ngay</button>
            <button className={button} disabled={busy || !schedule} type="button" onClick={() => dispatch("scheduled")}>Hẹn giờ</button>
          </div>
        </>}
      </form>}
      {tab === 2 && <>
        <button className={button} type="button" disabled={busy} onClick={() => { setError(""); setReload(value => value + 1); }}>Tải lại cài đặt</button>
        {!settings && !error && <p role="status">Đang tải cài đặt…</p>}
        {settings?.map(item => <form key={item.event + item.revision} className="mt-4 grid gap-2" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(async () => {
            const updated = await apiFetch<Setting>(`${base}/settings/${item.event}`, { method: "PATCH", json: {
              title: data.get("title"), content: data.get("content"), enabled: item.required || data.has("enabled"),
              leadHours: item.required ? null : Number(data.get("leadHours")), revision: item.revision,
            } });
            setSettings(current => current?.map(row => row.event === updated.event ? updated : row));
            setStatus("Đã lưu cài đặt.");
          });
        }}>
          <h3 className="m-0">{eventNames[item.event]}</h3>
          <small>Biến cho phép: {item.variables.map(name => `{{${name}}}`).join(", ")}</small>
          <label>Tiêu đề mẫu<input className={field} name="title" defaultValue={item.title} required maxLength={200} disabled={busy} /></label>
          <label>Nội dung mẫu<textarea className={field} name="content" defaultValue={item.content} required maxLength={3000} disabled={busy} /></label>
          {!item.required && <>
            <label><input type="checkbox" name="enabled" defaultChecked={item.enabled} disabled={busy} /> Bật nhắc hết hạn</label>
            <label>Nhắc trước (giờ)<input className={field} type="number" name="leadHours" min={1} max={168} required
              defaultValue={item.leadHours ?? 24} disabled={busy} /></label>
          </>}
          <div><button className={button} disabled={busy} type="submit">Lưu mẫu</button></div>
        </form>)}
      </>}
    </div>
  </div>;
}
