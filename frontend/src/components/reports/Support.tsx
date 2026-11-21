import { useRef, useEffect, useState } from "react";
import { getAuthUser, useAuth } from "../../lib/auth/auth";
import {
  createSupportReport, getSupportReport, listSupportReports, updateSupportReport,
  supportStatuses, type SupportPage, type SupportReport, type SupportStatus,
} from "../../lib/reports/support";
import "./support.css";
import StaffLayout from "../layout/StaffLayout";

const statuses = Object.keys(supportStatuses) as SupportStatus[];
const reportDate = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default function Support(props: { admin?: boolean; reportId?: string; focusOnOpen?: boolean }) {
  const user = useAuth().user;
  if (!user) return null;
  return <SupportPanel key={user.id} {...props} userId={user.id} />;
}

function SupportPanel({ admin = false, reportId, userId, focusOnOpen }: { admin?: boolean; reportId?: string; userId: string; focusOnOpen?: boolean }) {
  const [filter, setFilter] = useState<SupportStatus | "">("");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState<SupportPage>();
  const [selected, setSelected] = useState<SupportReport>();
  const selectedElement = useRef<HTMLElement>(null);
  const panel = useRef<HTMLElement>(null);
  const composeButton = useRef<HTMLButtonElement>(null);
  const composeText = useRef<HTMLTextAreaElement>(null);
  const request = useRef(0);
  const createRequest = useRef<{ text: string; id: string }>();

  useEffect(() => {
    if (open) composeText.current?.focus();
  }, [open]);

  function closeForm() {
    setOpen(false);
    composeButton.current?.focus();
  }

  useEffect(() => {
    if (!focusOnOpen || reportId) return;
    panel.current?.scrollIntoView({ block: "start" });
    panel.current?.focus({ preventScroll: true });
  }, [focusOnOpen, reportId]);

  useEffect(() => {
    const current = ++request.current;
    setPage(undefined);
    setError("");
    void listSupportReports(admin, filter).then(result => {
      if (request.current === current) setPage(result);
    }).catch((failure: Error) => {
      if (request.current === current) setError(failure.message);
    });
    return () => { request.current++; };
  }, [admin, filter, revision]);

  useEffect(() => {
    setSelected(undefined);
    if (!reportId || admin) return;
    let active = true;
    void getSupportReport(reportId).then(result => {
      if (active) setSelected(result);
    }).catch((failure: Error) => {
      if (active) setError(failure.message);
    });
    return () => { active = false; };
  }, [admin, reportId, revision]);

  const linked = selected?.id === reportId && !filter ? selected : undefined;
  const visible = linked
    ? [linked, ...(page?.items ?? []).filter(item => item.id !== linked.id)]
    : page?.items ?? [];
  useEffect(() => {
    if (!linked?.id) return;
    selectedElement.current?.scrollIntoView({ block: "nearest" });
    selectedElement.current?.focus({ preventScroll: true });
  }, [linked?.id]);

  async function save(action: () => Promise<unknown>, afterSave?: () => void) {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await action();
      if (getAuthUser()?.id !== userId) return;
      afterSave?.();
      setRevision(value => value + 1);
    } catch (failure) {
      if (getAuthUser()?.id === userId) setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    if (!page?.nextCursor || busy) return;
    const current = request.current;
    setError("");
    setBusy(true);
    try {
      const next = await listSupportReports(admin, filter, page.nextCursor);
      if (request.current === current) {
        setPage({ ...next, items: [...page.items, ...next.items] });
      }
    } catch (failure) {
      if (request.current === current) setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
  const content = (
    <section
      ref={panel}
      tabIndex={focusOnOpen ? -1 : undefined}
      aria-labelledby="support-title"
      className={admin ? "support-panel" : "support-panel support-profile"}
    >
      {admin ? <>
        <div className="support-heading">
          <span className="support-heading-icon">{icon}</span>
          <h1 id="support-title">Báo cáo & phản hồi</h1>
        </div>
        <p className="support-intro">Tiếp nhận báo cáo từ học viên và trợ giảng, xử lý và phản hồi tại một nơi.</p>
      </> : <header className="support-profile-header">
        <div className="support-heading">
          <span className="support-heading-icon">{icon}</span>
          <div>
            <h2 id="support-title">Báo cáo & hỗ trợ</h2>
            <p>Gửi báo cáo và theo dõi phản hồi của bạn.</p>
          </div>
        </div>
        <button ref={composeButton} type="button" className="support-primary" aria-expanded={open}
          aria-controls={open ? "support-report-form" : undefined} onClick={() => open ? closeForm() : setOpen(true)}>
          <span aria-hidden="true">+</span> Gửi báo cáo
        </button>
      </header>}
      {admin && (
        <div className="support-stats">
          {statuses.map((s) => (
            <div key={s} className="support-card support-stat">
              {supportStatuses[s]}
              <h2>{page ? page.counts?.[s] ?? 0 : "—"}</h2>
            </div>
          ))}
        </div>
      )}
      {open && (
        <form
          id="support-report-form"
          className="support-card support-form"
          onSubmit={(e) => {
            e.preventDefault();
            const content = text.trim();
            if (!content || busy) return;
            const attempt = createRequest.current?.text === content
              ? createRequest.current
              : { text: content, id: crypto.randomUUID() };
            createRequest.current = attempt;
            void save(() => createSupportReport(content, attempt.id), () => {
              createRequest.current = undefined;
              setText("");
              closeForm();
              setFilter("");
            });
          }}
        >
          <label>
            Nội dung báo cáo
            <textarea
              ref={composeText}
              required
              maxLength={3000}
              disabled={busy}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button type="submit" disabled={busy}>Gửi báo cáo</button>
          <button type="button" onClick={closeForm}>
            Hủy
          </button>
        </form>
      )}
      <div className="support-filters" role="group" aria-label="Lọc báo cáo">
        {(["", ...statuses] as const).map((s) => (
          <button
            key={s}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s ? supportStatuses[s] : "Tất cả"}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error} <button className="support-primary" type="button" disabled={busy}
        onClick={() => setRevision(value => value + 1)}>Tải lại</button></p>}
      {!page && !error && <p role="status">Đang tải báo cáo…</p>}
      {page && visible.length === 0 && (
        <div className={admin ? "support-card support-empty" : "support-empty"}>
          <span>{icon}</span>
          <p>{admin || filter ? "Chưa có báo cáo phù hợp." : "Bạn chưa gửi báo cáo nào."}</p>
        </div>
      )}
      {visible.map((i) => (
          <article key={i.id} className="support-card" ref={i.id === linked?.id ? selectedElement : undefined}
            tabIndex={i.id === linked?.id ? -1 : undefined}>
            {admin ? <>
              <span className="support-badge">{icon}</span>
              <strong>{i.owner}{i.ownerEmail && ` · ${i.ownerEmail}`} · {supportStatuses[i.status]}</strong>
            </> : <header className="support-report-meta">
              <span className="support-status" data-status={i.status}>{supportStatuses[i.status]}</span>
              {i.createdAt && <time dateTime={i.createdAt}>{reportDate.format(new Date(i.createdAt))}</time>}
            </header>}
            <p className="support-report-text">{i.text}</p>
            {i.reply && (admin ? <p>Phản hồi: {i.reply}</p> : <div className="support-reply">
              <strong>Phản hồi từ IELTSpace</strong>
              <p className="support-report-text">{i.reply}</p>
            </div>)}
            {admin && (
              <form
                key={i.revision}
                className="support-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const status = String(data.get("status")) as SupportStatus;
                  const reply = String(data.get("reply") ?? "");
                  void save(() => updateSupportReport(i.id, status, reply, i.revision));
                }}
              >
                <textarea
                  name="reply"
                  aria-label="Phản hồi"
                  maxLength={3000}
                  disabled={busy}
                  defaultValue={i.reply ?? undefined}
                />
                <select name="status" aria-label="Trạng thái báo cáo" disabled={busy} defaultValue={i.status}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{supportStatuses[s]}</option>
                  ))}
                </select>
                <button disabled={busy}>Lưu phản hồi</button>
              </form>
            )}
          </article>
      ))}
      {page?.nextCursor && <button className="support-primary" type="button" disabled={busy} onClick={() => void loadMore()}>Xem thêm</button>}
    </section>
  );
  return admin ? (
    <StaffLayout active="reports" crumb="Quản lý / Báo cáo & phản hồi" contentClassName="support-shell p-4 sm:p-6 md:p-8">
      {content}
    </StaffLayout>
  ) : (
    content
  );
}
