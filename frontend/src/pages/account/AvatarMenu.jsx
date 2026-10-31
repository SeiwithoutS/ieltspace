import NotificationBadge from "../../components/notifications/NotificationBadge";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class AvatarMenu extends React.Component {
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
            "\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <div
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 760px",
          )}
        >
          {"\n"}
          <header
            style={styleOf(
              "border-bottom: 1.5px solid #D6D4D0; background: #FCFBF7",
            )}
          >
            <div
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 0 24px; min-height: 68px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 32px",
              )}
            >
              <a
                href={"StudentLanding.dc.html"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 10px; text-decoration: none; color: #352637; font-weight: 700; font-size: 19px",
                )}
              >
                <span
                  style={styleOf(
                    "width: 32px; height: 32px; border-radius: 9px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                      v.accent +
                      "; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: " +
                      v.onAccent,
                  )}
                >
                  {"IS"}
                </span>
                <span>{"IELTSpace"}</span>
              </a>
              <nav style={styleOf("display: flex; flex-wrap: wrap; gap: 4px")}>
                <div className={"bu-dd"} style={styleOf("position: relative")}>
                  <a
                    href={"FullTests.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 8px; box-sizing: border-box; text-decoration: none; font-size: 14.5px; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500",
                    )}
                    aria-haspopup={"true"}
                  >
                    {"Thư viện đề"}
                    <svg
                      width={"14"}
                      height={"14"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2.2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M6 9l6 6 6-6"}></path>
                    </svg>
                  </a>
                  <div
                    className={"bu-dd-menu"}
                    style={styleOf(
                      "position: absolute; top: 100%; left: 0; padding-top: 8px; z-index: 30",
                    )}
                  >
                    <div
                      role={"menu"}
                      style={styleOf(
                        "width: 320px; padding: 6px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                      )}
                    >
                      <a
                        href={"FullTests.dc.html"}
                        data-nav={"IELTS Full Tests"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E3ECFD; color: #2963CC; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path d={"M12 3l9 5-9 5-9-5z"}></path>
                            <path d={"M3 13l9 5 9-5"}></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"IELTS Full Tests"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Đề đầy đủ, chấm band như thi thật"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeLibrary.dc.html"}
                        data-nav={"IELTS Listening Practice"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #DDE8FC; color: #2A55B8; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path d={"M4 14v-2a8 8 0 0 1 16 0v2"}></path>
                            <rect
                              x={"3"}
                              y={"14"}
                              width={"4"}
                              height={"6"}
                              rx={"1.5"}
                            ></rect>
                            <rect
                              x={"17"}
                              y={"14"}
                              width={"4"}
                              height={"6"}
                              rx={"1.5"}
                            ></rect>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"IELTS Listening Practice"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Luyện từng Question Group, nghe lại được"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeLibrary.dc.html"}
                        data-nav={"IELTS Reading Practice"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #DCEDE2; color: #2E6A48; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path
                              d={"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"}
                            ></path>
                            <circle cx={"12"} cy={"12"} r={"3"}></circle>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"IELTS Reading Practice"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Luyện từng Question Group, có lời giải"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeWS.dc.html"}
                        data-nav={"IELTS Writing Practice"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"IELTS Writing Practice"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Luyện riêng Task 1 hoặc Task 2"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeWS.dc.html"}
                        data-nav={"IELTS Speaking Practice"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
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
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"IELTS Speaking Practice"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Luyện riêng Part 1, 2 hoặc 3"}
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={"bu-dd"} style={styleOf("position: relative")}>
                  <a
                    href={"SampleLibrary.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 8px; box-sizing: border-box; text-decoration: none; font-size: 14.5px; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500",
                    )}
                    aria-haspopup={"true"}
                  >
                    {"Thư viện bài mẫu"}
                    <svg
                      width={"14"}
                      height={"14"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2.2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M6 9l6 6 6-6"}></path>
                    </svg>
                  </a>
                  <div
                    className={"bu-dd-menu"}
                    style={styleOf(
                      "position: absolute; top: 100%; left: 0; padding-top: 8px; z-index: 30",
                    )}
                  >
                    <div
                      role={"menu"}
                      style={styleOf(
                        "width: 320px; padding: 6px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                      )}
                    >
                      <a
                        href={"PracticeLibrary.dc.html"}
                        data-nav={"Writing Task 1 Academic"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path
                              d={"M4 20V10M10 20V4M16 20v-7M22 20H2"}
                            ></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"Writing Task 1 Academic"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Mô tả biểu đồ, bảng, bản đồ, quy trình"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeLibrary.dc.html"}
                        data-nav={"Writing Task 1 General"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <rect
                              x={"3"}
                              y={"5"}
                              width={"18"}
                              height={"14"}
                              rx={"2"}
                            ></rect>
                            <path d={"M3 7l9 6 9-6"}></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"Writing Task 1 General"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Bài mẫu viết thư"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"PracticeLibrary.dc.html"}
                        data-nav={"Writing Task 2"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
                          >
                            <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"Writing Task 2"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Bài mẫu bài luận"}
                          </span>
                        </span>
                      </a>
                      <a
                        href={"SampleSpeaking.dc.html"}
                        data-nav={"Speaking Part 1, 2, 3"}
                        style={styleOf(
                          "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                            aria-hidden={"true"}
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
                        </span>
                        <span
                          style={styleOf(
                            "display: flex; flex-direction: column",
                          )}
                        >
                          <span
                            style={styleOf(
                              "font-weight: 600; font-size: 14.5px",
                            )}
                          >
                            {"Speaking Part 1, 2, 3"}
                          </span>
                          <span
                            style={styleOf("font-size: 12.5px; color: #706473")}
                          >
                            {"Bản ghi lời nói, kèm audio mẫu"}
                          </span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
                <a
                  href={"Vocab.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 8px; box-sizing: border-box; text-decoration: none; font-size: 14.5px; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500",
                  )}
                >
                  {"Thư viện từ vựng"}
                </a>
                <a
                  href={"Flashcard.dc.html"}
                  style={styleOf(
                    "display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 8px; box-sizing: border-box; text-decoration: none; font-size: 14.5px; border: 1.5px solid transparent; color: #4B3D4D; font-weight: 500",
                  )}
                >
                  {"Flashcard của tôi"}
                </a>
              </nav>
              <div
                style={styleOf(
                  "margin-left: auto; display: flex; align-items: center; gap: 10px",
                )}
              >
                <a
                  href={"Notifications.dc.html"}
                  aria-label={"Thông báo"}
                  style={styleOf(
                    "position: relative; width: 44px; height: 44px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637; text-decoration: none; background: #FFFFFF",
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
                    aria-hidden={"true"}
                  >
                    <path
                      d={"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"}
                    ></path>
                    <path d={"M10.3 21a1.94 1.94 0 0 0 3.4 0"}></path>
                  </svg>
                  <NotificationBadge
                    style={styleOf(
                      "position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px; box-sizing: border-box; border-radius: 10px; background: #E5604A; color: #FFFFFF; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF",
                    )}
                  />
                </a>
                <a
                  href={"AvatarMenu.dc.html"}
                  aria-label={"Tài khoản: tiến độ học tập và cài đặt"}
                  style={styleOf(
                    "display: flex; padding: 3px; border-radius: 50%; border: 2px solid " +
                      v.accent +
                      "; text-decoration: none",
                  )}
                >
                  <span
                    style={styleOf(
                      "width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px",
                    )}
                  >
                    {"MA"}
                  </span>
                </a>
              </div>
            </div>
          </header>
          <main
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px 56px; display: flex; flex-direction: column; gap: 24px",
            )}
          >
            <div
              style={styleOf(
                "display: flex; justify-content: space-between; align-items: flex-end; gap: 16px",
              )}
            >
              <div>
                <h1
                  style={styleOf(
                    "margin: 0; font-size: 30px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Menu điều hướng"}
                </h1>
                <div
                  style={styleOf(
                    "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                  )}
                >
                  {
                    "Rê chuột vào từng mục trên thanh điều hướng để mở menu. Bảng dưới đây trải sẵn các menu để xem cùng lúc."
                  }
                </div>
              </div>
              <div style={styleOf("display: flex; gap: 10px")}></div>
            </div>
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
              )}
            >
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; ",
                )}
              >
                <div
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Thư viện đề"}
                </div>
                <div
                  role={"menu"}
                  style={styleOf(
                    "width: 320px; padding: 6px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                  )}
                >
                  <a
                    href={"FullTests.dc.html"}
                    data-nav={"IELTS Full Tests"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E3ECFD; color: #2963CC; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M12 3l9 5-9 5-9-5z"}></path>
                        <path d={"M3 13l9 5 9-5"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"IELTS Full Tests"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Đề đầy đủ, chấm band như thi thật"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeLibrary.dc.html"}
                    data-nav={"IELTS Listening Practice"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #DDE8FC; color: #2A55B8; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M4 14v-2a8 8 0 0 1 16 0v2"}></path>
                        <rect
                          x={"3"}
                          y={"14"}
                          width={"4"}
                          height={"6"}
                          rx={"1.5"}
                        ></rect>
                        <rect
                          x={"17"}
                          y={"14"}
                          width={"4"}
                          height={"6"}
                          rx={"1.5"}
                        ></rect>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"IELTS Listening Practice"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Luyện từng Question Group, nghe lại được"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeLibrary.dc.html"}
                    data-nav={"IELTS Reading Practice"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #DCEDE2; color: #2E6A48; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path
                          d={"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"}
                        ></path>
                        <circle cx={"12"} cy={"12"} r={"3"}></circle>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"IELTS Reading Practice"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Luyện từng Question Group, có lời giải"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeWS.dc.html"}
                    data-nav={"IELTS Writing Practice"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"IELTS Writing Practice"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Luyện riêng Task 1 hoặc Task 2"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeWS.dc.html"}
                    data-nav={"IELTS Speaking Practice"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
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
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"IELTS Speaking Practice"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Luyện riêng Part 1, 2 hoặc 3"}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; ",
                )}
              >
                <div
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Thư viện bài mẫu"}
                </div>
                <div
                  role={"menu"}
                  style={styleOf(
                    "width: 320px; padding: 6px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                  )}
                >
                  <a
                    href={"PracticeLibrary.dc.html"}
                    data-nav={"Writing Task 1 Academic"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M4 20V10M10 20V4M16 20v-7M22 20H2"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"Writing Task 1 Academic"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Mô tả biểu đồ, bảng, bản đồ, quy trình"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeLibrary.dc.html"}
                    data-nav={"Writing Task 1 General"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <rect
                          x={"3"}
                          y={"5"}
                          width={"18"}
                          height={"14"}
                          rx={"2"}
                        ></rect>
                        <path d={"M3 7l9 6 9-6"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"Writing Task 1 General"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Bài mẫu viết thư"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"PracticeLibrary.dc.html"}
                    data-nav={"Writing Task 2"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"Writing Task 2"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Bài mẫu bài luận"}
                      </span>
                    </span>
                  </a>
                  <a
                    href={"SampleSpeaking.dc.html"}
                    data-nav={"Speaking Part 1, 2, 3"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #352637",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 36px; height: 36px; flex: 0 0 36px; border-radius: 9px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
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
                    </span>
                    <span
                      style={styleOf("display: flex; flex-direction: column")}
                    >
                      <span
                        style={styleOf("font-weight: 600; font-size: 14.5px")}
                      >
                        {"Speaking Part 1, 2, 3"}
                      </span>
                      <span
                        style={styleOf("font-size: 12.5px; color: #706473")}
                      >
                        {"Bản ghi lời nói, kèm audio mẫu"}
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 10px; ",
                )}
              >
                <div
                  style={styleOf(
                    "font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                  )}
                >
                  {"Ảnh đại diện"}
                </div>
                <div
                  role={"menu"}
                  style={styleOf(
                    "width: 300px; padding: 8px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; gap: 12px; align-items: center; padding: 10px 12px 14px; border-bottom: 1.5px solid #E6E4E0; margin-bottom: 6px",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #352637",
                      )}
                    >
                      {"MA"}
                    </span>
                    <div>
                      <div style={styleOf("font-weight: 700")}>
                        {"Minh Anh"}
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"minhanh@email.com · Người học"}
                      </div>
                    </div>
                  </div>
                  <a
                    href={"StudentHome.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #352637; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <path d={"M4 20V10M10 20V4M16 20v-7M22 20H2"}></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>
                      {"Dashboard tiến độ"}
                    </span>
                  </a>
                  <a
                    href={"MyWS.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #352637; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>
                      {"Bài Writing/Speaking của tôi"}
                    </span>
                    <span
                      aria-label={"Chưa xem"}
                      style={styleOf(
                        "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                      )}
                    ></span>
                  </a>
                  <a
                    href={"Notifications.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #352637; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <path
                        d={"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"}
                      ></path>
                      <path d={"M10.3 21a1.94 1.94 0 0 0 3.4 0"}></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>{"Thông báo"}</span>
                    <NotificationBadge
                      style={styleOf(
                        "font-size: 12px; font-weight: 700; color: #FFFFFF; background: #E5604A; border-radius: 10px; padding: 1px 7px",
                      )}
                    />
                  </a>
                  <a
                    href={"Vocab.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #352637; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <path
                        d={
                          "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"
                        }
                      ></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>{"Từ vựng đã lưu"}</span>
                  </a>
                  <a
                    href={"Profile.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #352637; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <circle cx={"12"} cy={"8"} r={"4"}></circle>
                      <path d={"M4 21a8 8 0 0 1 16 0"}></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>{"Hồ sơ cá nhân"}</span>
                  </a>
                  <div
                    style={styleOf(
                      "padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1.5px solid #E6E4E0; margin-top: 6px",
                    )}
                  >
                    <span style={styleOf("font-size: 14px; font-weight: 600")}>
                      {"Giao diện"}
                    </span>
                    <div
                      role={"group"}
                      aria-label={"Chế độ giao diện"}
                      style={styleOf(
                        "display: inline-flex; gap: 2px; padding: 3px; border-radius: 11px; background: #F3F0EA",
                      )}
                    >
                      <button
                        type={"button"}
                        data-theme-toggle={"light"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-family: inherit; font-size: 13.5px; font-weight: 600; color: #352637; cursor: pointer",
                        )}
                      >
                        <svg
                          width={"15"}
                          height={"15"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <circle cx={"12"} cy={"12"} r={"4"}></circle>
                          <path
                            d={
                              "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                            }
                          ></path>
                        </svg>
                        {"Sáng"}
                      </button>
                      <button
                        type={"button"}
                        data-theme-toggle={"dark"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 8px; background: transparent; border: 1.5px solid transparent; font-family: inherit; font-size: 13.5px; font-weight: 500; color: #6A5D6C; cursor: pointer",
                        )}
                      >
                        <svg
                          width={"15"}
                          height={"15"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <path
                            d={"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"}
                          ></path>
                        </svg>
                        {"Tối"}
                      </button>
                    </div>
                  </div>
                  <a
                    href={"Main.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; text-decoration: none; color: #C0412A; font-size: 14.5px; font-weight: 500",
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
                      aria-hidden={"true"}
                    >
                      <path d={"M10 4H5v16h5M15 8l4 4-4 4M19 12H9"}></path>
                    </svg>
                    <span style={styleOf("flex: 1")}>{"Đăng xuất"}</span>
                  </a>
                </div>
              </div>
            </div>
          </main>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default AvatarMenu;
