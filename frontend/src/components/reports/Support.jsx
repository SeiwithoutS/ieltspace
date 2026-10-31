import { useAccount } from "../../lib/account";
import React, { useState } from "react";
import "./support.css";
import AdminSidebar from "../navigation/AdminSidebar";
import AdminTopbar from "../navigation/AdminTopbar";
const key = "ieltspace-support";
const read = () => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? value.filter((i) => i && typeof i.text === "string")
      : [];
  } catch {
    return [];
  }
};
export default function Support({ admin = false }) {
  const [items, setItems] = useState(read),
    [filter, setFilter] = useState(""),
    [open, setOpen] = useState(false),
    [text, setText] = useState(""),
    [error, setError] = useState("");
  const account = useAccount();
  const owner = account.name;
  const ownerId = account.id;
  const save = (next) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setItems(next);
      setError("");
      return true;
    } catch {
      setError("Không thể lưu báo cáo trên trình duyệt này.");
      return false;
    }
  };
  const statuses = ["Chờ tiếp nhận", "Đang xử lý", "Đã giải quyết"];
  const visible = items.filter(
    (i) => (admin || i.ownerId === ownerId) && (!filter || i.status === filter),
  );
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
      className={admin ? "support-panel" : "support-panel support-profile"}
    >
      <div className="support-heading">
        <span className="support-heading-icon">{icon}</span>
        <h1>{admin ? "Báo cáo & phản hồi" : "Báo cáo & hỗ trợ"}</h1>
      </div>
      <p className="support-intro">
        {admin
          ? "Tiếp nhận báo cáo từ học viên và trợ giảng, xử lý và phản hồi tại một nơi."
          : "Gặp lỗi, cần giải đáp hoặc muốn đóng góp ý kiến? Gửi báo cáo và theo dõi phản hồi tại một nơi."}
      </p>
      {admin && (
        <div className="support-stats">
          {statuses.map((s) => (
            <div key={s} className="support-card support-stat">
              {s}
              <h2>{items.filter((i) => i.status === s).length}</h2>
            </div>
          ))}
        </div>
      )}
      {!admin && (
        <button className="support-primary" onClick={() => setOpen(!open)}>
          + Gửi báo cáo
        </button>
      )}
      {open && (
        <form
          className="support-card support-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            if (
              save([
                ...items,
                {
                  id: Date.now(),
                  owner,
                  ownerId,
                  ownerEmail: account.email,
                  text: text.trim(),
                  status: statuses[0],
                  reply: "",
                },
              ])
            ) {
              setText("");
              setOpen(false);
            }
          }}
        >
          <label>
            Nội dung báo cáo
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ display: "block", width: "100%", minHeight: 100 }}
            />
          </label>
          <button type="submit">Gửi báo cáo</button>
          <button type="button" onClick={() => setOpen(false)}>
            Hủy
          </button>
        </form>
      )}
      <div className="support-filters" role="group" aria-label="Lọc báo cáo">
        {["", ...statuses].map((s) => (
          <button
            key={s}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s || "Tất cả"}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      {visible.length === 0 ? (
        <div className="support-card support-empty">
          <span>{icon}</span>
          <p>Chưa có báo cáo phù hợp.</p>
        </div>
      ) : (
        visible.map((i) => (
          <article key={i.id} className="support-card">
            <span className="support-badge">{icon}</span>
            <strong>
              {i.owner}
              {i.ownerEmail
                ? " · " + i.ownerEmail
                : " · Báo cáo cũ chưa xác định tài khoản"}{" "}
              · {i.status}
            </strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{i.text}</p>
            {i.reply && <p>Phản hồi: {i.reply}</p>}
            {admin && (
              <form
                className="support-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  save(
                    items.map((x) =>
                      x.id === i.id
                        ? {
                            ...x,
                            reply: data.get("reply"),
                            status: data.get("status"),
                          }
                        : x,
                    ),
                  );
                }}
              >
                <textarea
                  name="reply"
                  aria-label="Phản hồi"
                  defaultValue={i.reply}
                />
                <select name="status" defaultValue={i.status}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button>Lưu phản hồi</button>
              </form>
            )}
          </article>
        ))
      )}
    </section>
  );
  return admin ? (
    <div
      className="app-shell support-shell"
      style={{ display: "flex", height: "100vh" }}
    >
      <AdminSidebar active="reports" />
      <main className="app-content" style={{ flex: 1, overflow: "auto" }}>
        <AdminTopbar crumb="Quản lý / Báo cáo & phản hồi" />
        {content}
      </main>
    </div>
  ) : (
    content
  );
}
