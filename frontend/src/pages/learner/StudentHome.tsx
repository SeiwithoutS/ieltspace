import { useAccount } from "../../lib/auth/account";
import AvatarContent from "../../components/account/AvatarContent";
import StudyProgress from "../../components/learner/StudyProgress";
import StudyResults from "../../components/learner/StudyResults";
import { logout } from "../../lib/auth/auth";
import LearnerHeader, { type AccountNavItem } from "../../components/navigation/LearnerHeader";
import { styleOf, cssText, getAccentColors } from "../../lib/shared/styles";

export default function StudentHome({ accent }: { accent?: string }) {
  const account = useAccount();
  const v = getAccentColors(accent);
  const scrollToHistory = () =>
    document.getElementById("lich-su")?.scrollIntoView({ behavior: "smooth" });

  const accountNav: { items: AccountNavItem[] } = {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        page: "StudentHome",
        active: true,
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11l8-7 8 7v9H4z" />
            <path d="M10 20v-6h4v6" />
          </svg>
        ),
      },
      {
        id: "history",
        label: "Lịch sử luyện đề",
        page: "StudentHome",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        ),
        onClick: scrollToHistory,
      },
      {
        id: "my-ws",
        label: "Bài Writing và Speaking",
        page: "MyWS",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l4 4L8 20H4v-4z" />
          </svg>
        ),
        badge: <span className="w-2 h-2 rounded-full bg-[#E5604A]" aria-hidden="true" />,
      },
      {
        id: "vocab",
        label: "Từ vựng đã lưu",
        page: "Vocab",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5z" />
            <path d="M12 6v14.5" />
          </svg>
        ),
      },
      {
        id: "profile",
        label: "Hồ sơ cá nhân",
        page: "Profile",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
          </svg>
        ),
      },
      {
        id: "logout",
        label: "Đăng xuất",
        danger: true,
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        ),
        onClick: () => {
          logout();
        },
      },
    ],
  };

  return (
    <>
      {"\n"}
      {"\n"}
      <style>
        {cssText(
          "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n",
        )}
      </style>
      {"\n"}
      {"\n"}
      <div
        style={styleOf(
                    "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 100vh",
        )}
      >
        {"\n"}
        {"\n"}
        <LearnerHeader active="home" accountNav={accountNav} />
        {"\n\n"}
        <div
          style={styleOf(
            "background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0",
          )}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-9 pb-16 flex flex-col md:flex-row gap-6 lg:gap-7">
            

            {/* Desktop Sidebar (>= 1024px) */}
            <aside className="hidden md:flex md:w-[220px] lg:w-[248px] md:flex-none self-start flex-col gap-4">
              <div
                style={styleOf(
                  "padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; align-items: center; gap: 12px",
                )}
              >
                <span
                  style={styleOf(
                    "flex: none; width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px",
                  )}
                >
                  <AvatarContent avatar={account.avatar} initials={account.initials} />
                </span>
                <div className="min-w-0 break-words">
                  <div style={styleOf("font-weight: 600")}>
                    {account.name}
                  </div>
                  <div style={styleOf("font-size: 13px; color: #706473")}>
                    {account.email}
                  </div>
                </div>
              </div>
              <nav
                style={styleOf(
                  "padding: 10px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; gap: 2px",
                )}
              >
                <a
                  href={"#"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; background: #E3ECFD; border: 1.5px solid #D6D4D0; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M4 11l8-7 8 7v9H4z"}></path>
                    <path d={"M10 20v-6h4v6"}></path>
                  </svg>
                  {"Dashboard"}
                </a>
                <a
                  href="#lich-su"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToHistory();
                  }}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path d={"M12 7v5l3 2"}></path>
                  </svg>
                  {"Lịch sử luyện đề"}
                </a>
                <a
                  href={"MyWS.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                  </svg>
                  {"Bài Writing/Speaking"}
                  <span style={styleOf("margin-left: auto; display: flex")} aria-hidden="true">
                    <span style={styleOf("display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px")} />
                  </span>
                </a>
                <a
                  href={"Vocab.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path
                      d={
                        "M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5z"
                      }
                    ></path>
                    <path d={"M12 6v14.5"}></path>
                  </svg>
                  {"Từ vựng đã lưu"}
                </a>
                <a
                  href={"Profile.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <circle cx={"9"} cy={"8"} r={"3.5"}></circle>
                    <path d={"M2.5 20a6.5 6.5 0 0 1 13 0"}></path>
                    <path
                      d={
                        "M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"
                      }
                    ></path>
                  </svg>
                  {"Hồ sơ cá nhân"}
                </a>
                <div
                  style={styleOf(
                    "height: 1px; background: #E8E0D2; margin: 6px 4px",
                  )}
                ></div>
                <a
                  href={"Login.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 14px; color: #C0412A; font-weight: 500; font-size: 14px; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"}></path>
                  </svg>
                  {"Đăng xuất"}
                </a>
              </nav>
            </aside>
            <div className="flex-1 min-w-0 flex flex-col gap-8 md:gap-9">
              <div>
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {"Trang chủ / Dashboard"}
                </div>
                <h1 className="m-0 mt-1.5 text-[28px] md:text-[36px] leading-tight font-bold tracking-tight text-[var(--attempt-text-352637,#352637)]" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}>
                  {"Dashboard của bạn"}
                </h1>
              </div>
              <StudyProgress key={account.id} userId={account.id} />
              <StudyResults key={`results:${account.id}`} />
              <section
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 14px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: baseline",
                  )}
                >
                  <h2
                    style={styleOf(
                      "margin: 0; font-size: 22px; letter-spacing: -0.01em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                    )}
                  >
                    {"Bài Writing và Speaking"}
                  </h2>
                  <a
                    href={"MyWS.dc.html"}
                    style={styleOf(
                      "font-weight: 600; font-size: 14px; text-decoration: none",
                    )}
                  >
                    {"Xem tất cả"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 8px; ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; font-size: 14px",
                      )}
                    >
                      <span
                        style={styleOf("flex: 0 0 18px; margin-top: 2px")}
                      >
                        <svg
                          width={"18"}
                          height={"18"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <circle cx={"12"} cy={"12"} r={"9"}></circle>
                          <path d={"M12 11v5M12 8h.01"}></path>
                        </svg>
                      </span>
                      <span>
                        {"Lượt chấm minh họa: "}
                        <b>{"1 lượt miễn phí tuần này"}</b>
                        {" (làm mới 00:00 thứ Hai) và "}
                        <b>{"1 bonus"}</b>
                        {" còn hạn đến hết Chủ nhật tuần sau."}
                      </span>
                    </div>
                    <div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1.5px solid #EBE9E5",
                        )}
                      >
                        <div style={styleOf("flex: 1 1 220px")}>
                          <div
                            style={styleOf(
                              "font-weight: 600; display: flex; align-items: center; gap: 8px",
                            )}
                          >
                            {"Opinion Essay · Public transport"}
                            <span
                              aria-label={"Chưa xem"}
                              style={styleOf(
                                "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                              )}
                            ></span>
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Writing Task 2"}
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                          )}
                        >
                          {"Đã có kết quả · 6.5"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1.5px solid #EBE9E5",
                        )}
                      >
                        <div style={styleOf("flex: 1 1 220px")}>
                          <div
                            style={styleOf(
                              "font-weight: 600; display: flex; align-items: center; gap: 8px",
                            )}
                          >
                            {"A skill worth learning"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Speaking Part 2"}
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; white-space: nowrap",
                          )}
                        >
                          {"Chờ chấm"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1.5px solid #EBE9E5",
                        )}
                      >
                        <div style={styleOf("flex: 1 1 220px")}>
                          <div
                            style={styleOf(
                              "font-weight: 600; display: flex; align-items: center; gap: 8px",
                            )}
                          >
                            {"Line graph · Energy use"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Writing Task 1 Academic"}
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                          )}
                        >
                          {"Đã lưu · chưa gửi chấm"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        {"\n"}
        {"\n"}
        <footer
          style={styleOf(
            "border-top: 1.5px solid #D6D4D0; background: #FAF9F5",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 40px 24px 48px; display: flex; flex-wrap: wrap; gap: 28px",
            )}
          >
            {"\n"}
            <div style={styleOf("flex: 1.4 1 280px")}>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px",
                )}
              >
                <span
                  style={styleOf(
                    "width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                      v.accent +
                      "; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: " +
                      v.onAccent,
                  )}
                >
                  {"IS"}
                </span>
                <span>{"IELTSpace"}</span>
              </div>
              {"\n"}
              <p
                style={styleOf(
                  "margin: 14px 0 0; font-size: 13px; color: #706473; max-width: 36ch",
                )}
              >
                {
                  "Hệ thống luyện đề IELTS 4 kỹ năng."
                }
              </p>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Luyện thi"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#bo-de"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Thư viện đề"}
                </a>
                <a
                  href={"#tu-vung"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Thư viện từ vựng"}
                </a>
                <a
                  href={"#bai-mau"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Bài mẫu"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Tài khoản"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#dang-ky"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Đăng ký"}
                </a>
                <a
                  href={"#dang-nhap"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Đăng nhập"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div style={styleOf("flex: 1 1 150px")}>
              {"\n"}
              <div
                style={styleOf(
                  "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473; margin-bottom: 14px",
                )}
              >
                {"Hỗ trợ"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; font-size: 14px",
                )}
              >
                <a
                  href={"#faq"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Câu hỏi thường gặp"}
                </a>
                <a
                  href={"#lien-he"}
                  style={styleOf("color: #4B3D4D; text-decoration: none")}
                >
                  {"Liên hệ"}
                </a>
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
        </footer>
        {"\n\n\n"}
      </div>
      {"\n"}
    </>
  );
}
