import { getAccount } from "../../lib/account";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import NotificationBadge from "../../components/notifications/NotificationBadge";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class StudentHome extends React.Component {
  renderVals() {
    var accent = this.props.accent ?? "#2963CC";
    var h = String(accent).replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var n = parseInt(h, 16);
    var r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      b = n & 255;
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return { accent: accent, onAccent: lum > 0.6 ? "#1A1A1A" : "#FFFFFF" };
  }

  static defaultProps = { accent: "#2963CC" };
  render() {
    const v = this.renderVals();
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1870px",
          )}
        >
          {"\n"}
          {"\n"}
          <LearnerHeader active="home" />
          {"\n\n"}
          <div
            style={styleOf(
              "background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0",
            )}
          >
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-9 pb-16 flex flex-col lg:flex-row gap-6 lg:gap-7">
              {/* Mobile/Tablet Tab Bar (< 1024px) */}
              <div className="lg:hidden flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl border-[1.5px] border-[#D6D4D0] bg-white shadow-sm">
                  <span className="w-10 h-10 rounded-full border-[1.5px] border-[#D6D4D0] bg-[#E8E4FA] text-[#5543B0] flex items-center justify-center font-bold text-sm shrink-0">
                    MA
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{getAccount("learner").name}</div>
                    <div className="text-xs text-[#706473] truncate">{getAccount("learner").email}</div>
                  </div>
                </div>
                <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm whitespace-nowrap">
                  <a
                    href="#"
                    className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-[#E3ECFD] border-[1.5px] border-[#D6D4D0] text-[#352637] font-semibold shrink-0 no-underline"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11l8-7 8 7v9H4z" />
                      <path d="M10 20v-6h4v6" />
                    </svg>
                    Dashboard
                  </a>
                  <a
                    href="#lich-su"
                    className="flex items-center gap-2 px-3.5 h-10 rounded-xl border-[1.5px] border-[#D6D4D0] bg-white text-[#4B3D4D] font-medium shrink-0 no-underline hover:bg-[#F3F0EA]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    Lịch sử luyện đề
                  </a>
                  <a
                    href="MyWS.dc.html"
                    className="flex items-center gap-2 px-3.5 h-10 rounded-xl border-[1.5px] border-[#D6D4D0] bg-white text-[#4B3D4D] font-medium shrink-0 no-underline hover:bg-[#F3F0EA]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 5l4 4L8 20H4v-4z" />
                    </svg>
                    Bài Writing/Speaking
                    <span className="w-2 h-2 rounded-full bg-[#E5604A]" aria-label="Chưa xem" />
                  </a>
                  <a
                    href="Vocab.dc.html"
                    className="flex items-center gap-2 px-3.5 h-10 rounded-xl border-[1.5px] border-[#D6D4D0] bg-white text-[#4B3D4D] font-medium shrink-0 no-underline hover:bg-[#F3F0EA]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5z" />
                      <path d="M12 6v14.5" />
                    </svg>
                    Từ vựng đã lưu
                  </a>
                  <a
                    href="Profile.dc.html"
                    className="flex items-center gap-2 px-3.5 h-10 rounded-xl border-[1.5px] border-[#D6D4D0] bg-white text-[#4B3D4D] font-medium shrink-0 no-underline hover:bg-[#F3F0EA]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="8" r="3.5" />
                      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
                    </svg>
                    Hồ sơ cá nhân
                  </a>
                </nav>
              </div>

              {/* Desktop Sidebar (>= 1024px) */}
              <aside className="hidden lg:flex lg:w-[248px] lg:flex-none self-start flex-col gap-4">
                <div
                  style={styleOf(
                    "padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; align-items: center; gap: 12px",
                  )}
                >
                  <span
                    style={styleOf(
                      "width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px",
                    )}
                  >
                    {"MA"}
                  </span>
                  <div>
                    <div style={styleOf("font-weight: 600")}>
                      {getAccount("learner").name}
                    </div>
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {getAccount("learner").email}
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
                    href={"StudentHome.dc.html#lich-su"}
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
                    <span style={styleOf("margin-left: auto; display: flex")}>
                      <span
                        aria-label={"Chưa xem"}
                        style={styleOf(
                          "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                        )}
                      ></span>
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
                  <h1 className="m-0 mt-1.5 text-[28px] md:text-[36px] leading-tight font-bold tracking-tight text-[#352637]" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}>
                    {"Dashboard của bạn"}
                  </h1>
                </div>
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
                      {"Kết quả luyện tập"}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
                    <div className="col-span-2 md:col-span-1 xl:col-span-1"
                      style={styleOf(
                        "position: relative; min-width: 0; padding: 18px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center",
                      )}
                    >
                      <a
                        href={"#"}
                        style={styleOf(
                          "position: absolute; top: 12px; right: 14px; font-size: 13px; font-weight: 600; text-decoration: none",
                        )}
                      >
                        {"Sửa"}
                      </a>
                      <span
                        style={styleOf(
                          "width: 40px; height: 40px; border-radius: 10px; background: #E3ECFD; color: #352637; display: flex; align-items: center; justify-content: center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                        >
                          <circle cx={"12"} cy={"12"} r={"9"}></circle>
                          <circle cx={"12"} cy={"12"} r={"5"}></circle>
                          <circle cx={"12"} cy={"12"} r={"1.5"}></circle>
                        </svg>
                      </span>
                      <div
                        style={styleOf(
                          "margin-top: 6px; font-size: 13px; color: #706473",
                        )}
                      >
                        {"Band mục tiêu"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 28px; font-weight: 700; line-height: 1.2; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"7.0"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "position: relative; min-width: 0; padding: 18px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "width: 40px; height: 40px; border-radius: 10px; background: #E3ECFD; color: #352637; display: flex; align-items: center; justify-content: center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                        >
                          <path d={"M5 21V4M5 4h11l-2 4 2 4H5"}></path>
                        </svg>
                      </span>
                      <div
                        style={styleOf(
                          "margin-top: 6px; font-size: 13px; color: #706473",
                        )}
                      >
                        {"Band TB · bài thi đầy đủ"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 28px; font-weight: 700; line-height: 1.2; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"6.0"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "position: relative; min-width: 0; padding: 18px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "width: 40px; height: 40px; border-radius: 10px; background: #E3ECFD; color: #352637; display: flex; align-items: center; justify-content: center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                        >
                          <path d={"M6 3h8l4 4v14H6z"}></path>
                          <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                        </svg>
                      </span>
                      <div
                        style={styleOf(
                          "margin-top: 6px; font-size: 13px; color: #706473",
                        )}
                      >
                        {"Số bài đã làm"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 28px; font-weight: 700; line-height: 1.2; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"12"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "position: relative; min-width: 0; padding: 18px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "width: 40px; height: 40px; border-radius: 10px; background: #E3ECFD; color: #352637; display: flex; align-items: center; justify-content: center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
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
                      </span>
                      <div
                        style={styleOf(
                          "margin-top: 6px; font-size: 13px; color: #706473",
                        )}
                      >
                        {"Từ vựng đã ôn"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 28px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                        )}
                      >
                        {"86 từ"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "position: relative; min-width: 0; padding: 18px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "width: 40px; height: 40px; border-radius: 10px; background: #E3ECFD; color: #352637; display: flex; align-items: center; justify-content: center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"1.8"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                        >
                          <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                        </svg>
                      </span>
                      <div
                        style={styleOf(
                          "margin-top: 6px; font-size: 13px; color: #706473",
                        )}
                      >
                        {"Độ chính xác · bài luyện"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 28px; font-weight: 700; line-height: 1.2; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"68%"}
                      </div>
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "padding: 20px 24px 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#E6E4E0] text-sm whitespace-nowrap">
                      <span
                        style={styleOf(
                          "display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid #D6D4D0; background: #DDE8FC; color: #2A55B8; font-weight: 600; font-size: 14px",
                        )}
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
                        >
                          <path d={"M4 14v-2a8 8 0 0 1 16 0v2"}></path>
                          <rect
                            x={"3"}
                            y={"13.5"}
                            width={"4.5"}
                            height={"7"}
                            rx={"1.6"}
                          ></rect>
                          <rect
                            x={"16.5"}
                            y={"13.5"}
                            width={"4.5"}
                            height={"7"}
                            rx={"1.6"}
                          ></rect>
                        </svg>
                        {"Listening"}
                      </span>
                      <span
                        style={styleOf(
                          "display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #706473; font-weight: 500; font-size: 14px",
                        )}
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
                        >
                          <path
                            d={
                              "M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5z"
                            }
                          ></path>
                          <path d={"M12 6v14.5"}></path>
                        </svg>
                        {"Reading"}
                      </span>
                      <span
                        style={styleOf(
                          "display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #706473; font-weight: 500; font-size: 14px",
                        )}
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
                        >
                          <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                        </svg>
                        {"Writing"}
                      </span>
                      <span
                        style={styleOf(
                          "display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px; border-radius: 10px; box-sizing: border-box; border: 1.5px solid transparent; color: #706473; font-weight: 500; font-size: 14px",
                        )}
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
                        >
                          <rect
                            x={"9"}
                            y={"3"}
                            width={"6"}
                            height={"11"}
                            rx={"3"}
                          ></rect>
                          <path d={"M5 11a7 7 0 0 0 14 0M12 18v3"}></path>
                        </svg>
                        {"Speaking"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 my-4 sm:my-5">
                      <div>
                        <div
                          style={styleOf("font-size: 18px; font-weight: 600")}
                        >
                          {"Band Listening qua 7 lần gần nhất"}
                        </div>
                        <div
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Trung bình 6.1 · cao nhất 7.0"}
                        </div>
                      </div>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                        )}
                      >
                        {"+1.0 so với lần đầu"}
                      </span>
                    </div>
                    <div className="relative overflow-x-auto pt-2 pb-1">
                      <div className="relative h-[210px] min-w-[520px] ml-10">
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 0px; border-top: 1px dashed #E6E4E0",
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; left: -36px; top: -10px; font-size: 13px; color: #706473",
                            )}
                          >
                            {"4.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 50px; border-top: 1px dashed #E6E4E0",
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; left: -36px; top: -10px; font-size: 13px; color: #706473",
                            )}
                          >
                            {"5.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 100px; border-top: 1px dashed #E6E4E0",
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; left: -36px; top: -10px; font-size: 13px; color: #706473",
                            )}
                          >
                            {"6.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 150px; border-top: 1px dashed #E6E4E0",
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; left: -36px; top: -10px; font-size: 13px; color: #706473",
                            )}
                          >
                            {"7.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 200px; border-top: 1px dashed #E6E4E0",
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; left: -36px; top: -10px; font-size: 13px; color: #706473",
                            )}
                          >
                            {"8.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; left: 0; right: 0; bottom: 150px; border-top: 2px solid " +
                              v.accent,
                          )}
                        >
                          <span
                            style={styleOf(
                              "position: absolute; right: 0; top: -24px; font-size: 13px; font-weight: 600; color: " +
                                v.accent,
                            )}
                          >
                            {"Mục tiêu 7.0"}
                          </span>
                        </div>
                        <div
                          style={styleOf(
                            "position: absolute; inset: 0; display: flex; gap: 18px; padding: 0 8px",
                          )}
                        >
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"5.5"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 75.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"6.0"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 100.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"5.5"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 75.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"6.5"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 125.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"6.0"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 100.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"7.0"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 150.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                          <div
                            style={styleOf(
                              "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%",
                            )}
                          >
                            <span
                              style={styleOf(
                                "font-size: 13px; font-weight: 600",
                              )}
                            >
                              {"6.5"}
                            </span>
                            <div
                              style={styleOf(
                                "width: 100%; max-width: 40px; height: 125.0px; border-radius: 8px 8px 0 0; border: 1.5px solid #D6D4D0; border-bottom: 0; box-sizing: border-box; background: #DDE8FC",
                              )}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 18px; padding: 8px 8px 0; border-top: 1.5px solid #D6D4D0",
                        )}
                      >
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 01"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 02"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 03"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 04"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 05"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 06"}
                        </span>
                        <span
                          style={styleOf(
                            "flex: 1; text-align: center; font-size: 13px; color: #706473",
                          )}
                        >
                          {"Test 07"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
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
                      <span id={"lich-su"}>{"Lịch sử luyện đề"}</span>
                    </h2>
                    <a
                      href={"#"}
                      style={styleOf(
                        "font-weight: 600; font-size: 14px; text-decoration: none",
                      )}
                    >
                      {"Xem chi tiết"}
                    </a>
                  </div>
                  {/* Desktop / Tablet table (>= 768px) */}
                  <div
                    className="hidden md:block rounded-[22px] border-[1.5px] border-[#D6D4D0] bg-white shadow-sm overflow-x-auto"
                  >
                    <table
                      style={styleOf(
                        "width: 100%; border-collapse: collapse; font-size: 14px",
                      )}
                    >
                      <thead>
                        <tr
                          style={styleOf(
                            "background: #F3F0EA; border-bottom: 1.5px solid #D6D4D0; text-align: left; font-size: 13px; color: #706473",
                          )}
                        >
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600; padding-left: 24px",
                            )}
                          >
                            {"Ngày làm"}
                          </th>
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600",
                            )}
                          >
                            {"Tên đề"}
                          </th>
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600",
                            )}
                          >
                            {"Kỹ năng"}
                          </th>
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600",
                            )}
                          >
                            {"Kết quả"}
                          </th>
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600",
                            )}
                          >
                            {"Thời gian"}
                          </th>
                          <th
                            style={styleOf(
                              "padding: 10px 12px; font-weight: 600",
                            )}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={styleOf("border-top: 1px solid #E6E4E0")}>
                          <td
                            style={styleOf(
                              "padding: 14px 12px 14px 24px; white-space: nowrap",
                            )}
                          >
                            <div>{"07/10/2026"}</div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"20:43"}
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; font-weight: 600",
                            )}
                          >
                            {"Opinion Essay · Public transport"}
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Writing"}
                            </span>
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Đã có kết quả · 6.5"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; white-space: nowrap",
                            )}
                          >
                            {"38:12"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 24px 14px 12px; text-align: right",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; color: #352637; font-weight: 600; font-size: 13px; text-decoration: none",
                              )}
                            >
                              <svg
                                width={"16"}
                                height={"16"}
                                viewBox={"0 0 24 24"}
                                fill={"none"}
                                stroke={"currentColor"}
                                strokeWidth={"2"}
                                strokeLinecap={"round"}
                                strokeLinejoin={"round"}
                              >
                                <path d={"M6 3h8l4 4v14H6z"}></path>
                                <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                              </svg>
                              {"Xem lại"}
                            </a>
                          </td>
                        </tr>
                        <tr style={styleOf("border-top: 1px solid #E6E4E0")}>
                          <td
                            style={styleOf(
                              "padding: 14px 12px 14px 24px; white-space: nowrap",
                            )}
                          >
                            <div>{"06/10/2026"}</div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"10:09"}
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; font-weight: 600",
                            )}
                          >
                            {"Mock Test Vol 21 · Reading Test 1"}
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Reading"}
                            </span>
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <b>{"6.5"}</b>{" "}
                            <span style={styleOf("color: #706473")}>
                              {"· 29/40 câu"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; white-space: nowrap",
                            )}
                          >
                            {"52:40"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 24px 14px 12px; text-align: right",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; color: #352637; font-weight: 600; font-size: 13px; text-decoration: none",
                              )}
                            >
                              <svg
                                width={"16"}
                                height={"16"}
                                viewBox={"0 0 24 24"}
                                fill={"none"}
                                stroke={"currentColor"}
                                strokeWidth={"2"}
                                strokeLinecap={"round"}
                                strokeLinejoin={"round"}
                              >
                                <path d={"M6 3h8l4 4v14H6z"}></path>
                                <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                              </svg>
                              {"Xem lại"}
                            </a>
                          </td>
                        </tr>
                        <tr style={styleOf("border-top: 1px solid #E6E4E0")}>
                          <td
                            style={styleOf(
                              "padding: 14px 12px 14px 24px; white-space: nowrap",
                            )}
                          >
                            <div>{"05/10/2026"}</div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"09:41"}
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; font-weight: 600",
                            )}
                          >
                            {"The kākāpo"}
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Reading"}
                            </span>
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <b>{"2/13"}</b>{" "}
                            <span style={styleOf("color: #706473")}>
                              {"câu đúng"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; white-space: nowrap",
                            )}
                          >
                            {"00:46"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 24px 14px 12px; text-align: right",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; color: #352637; font-weight: 600; font-size: 13px; text-decoration: none",
                              )}
                            >
                              <svg
                                width={"16"}
                                height={"16"}
                                viewBox={"0 0 24 24"}
                                fill={"none"}
                                stroke={"currentColor"}
                                strokeWidth={"2"}
                                strokeLinecap={"round"}
                                strokeLinejoin={"round"}
                              >
                                <path d={"M6 3h8l4 4v14H6z"}></path>
                                <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                              </svg>
                              {"Xem lại"}
                            </a>
                          </td>
                        </tr>
                        <tr style={styleOf("border-top: 1px solid #E6E4E0")}>
                          <td
                            style={styleOf(
                              "padding: 14px 12px 14px 24px; white-space: nowrap",
                            )}
                          >
                            <div>{"03/10/2026"}</div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"21:15"}
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; font-weight: 600",
                            )}
                          >
                            {"Mock Test Vol 20 · Listening Test 2"}
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Listening"}
                            </span>
                          </td>
                          <td style={styleOf("padding: 14px 12px")}>
                            <b>{"7.0"}</b>{" "}
                            <span style={styleOf("color: #706473")}>
                              {"· 31/40 câu"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 12px; white-space: nowrap",
                            )}
                          >
                            {"31:05"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 14px 24px 14px 12px; text-align: right",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; box-sizing: border-box; color: #352637; font-weight: 600; font-size: 13px; text-decoration: none",
                              )}
                            >
                              <svg
                                width={"16"}
                                height={"16"}
                                viewBox={"0 0 24 24"}
                                fill={"none"}
                                stroke={"currentColor"}
                                strokeWidth={"2"}
                                strokeLinecap={"round"}
                                strokeLinejoin={"round"}
                              >
                                <path d={"M6 3h8l4 4v14H6z"}></path>
                                <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                              </svg>
                              {"Xem lại"}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards (< 768px) */}
                  <div className="md:hidden flex flex-col gap-3">
                    <div className="p-4 rounded-2xl border-[1.5px] border-[#D6D4D0] bg-white shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-[#706473]">
                        <span>07/10/2026 · 20:43</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FBEDBF] text-[#7A5A0E]">
                          Writing
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-[#352637]">
                        Opinion Essay · Public transport
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F0EEEA]">
                        <span className="text-xs text-[#7A5A0E] font-semibold bg-[#FBEDBF] px-2 py-0.5 rounded-full border border-[#D6D4D0]">
                          Đã có kết quả · 6.5
                        </span>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D6D4D0] text-xs font-semibold text-[#352637] no-underline hover:bg-[#F3F0EA]"
                        >
                          Xem lại
                        </a>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-[1.5px] border-[#D6D4D0] bg-white shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-[#706473]">
                        <span>06/10/2026 · 10:09</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DCEDE2] text-[#2E6A48]">
                          Reading
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-[#352637]">
                        Mock Test Vol 21 · Reading Test 1
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F0EEEA]">
                        <div className="text-xs">
                          <b className="text-sm font-bold text-[#352637]">6.5</b>{" "}
                          <span className="text-[#706473]">· 29/40 câu</span>
                        </div>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D6D4D0] text-xs font-semibold text-[#352637] no-underline hover:bg-[#F3F0EA]"
                        >
                          Xem lại
                        </a>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border-[1.5px] border-[#D6D4D0] bg-white shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-[#706473]">
                        <span>03/10/2026 · 21:15</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DDE8FC] text-[#2A55B8]">
                          Listening
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-[#352637]">
                        Mock Test Vol 20 · Listening Test 2
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F0EEEA]">
                        <div className="text-xs">
                          <b className="text-sm font-bold text-[#352637]">7.0</b>{" "}
                          <span className="text-[#706473]">· 31/40 câu</span>
                        </div>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#D6D4D0] text-xs font-semibold text-[#352637] no-underline hover:bg-[#F3F0EA]"
                        >
                          Xem lại
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
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
                          {"Lượt chấm của bạn: "}
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
                    "Hệ thống luyện đề IELTS 4 kỹ năng. Đồ án 1, dữ liệu trên trang là dữ liệu mẫu."
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
}

export default StudentHome;
