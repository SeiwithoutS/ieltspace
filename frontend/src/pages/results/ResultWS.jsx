import NotificationBadge from "../../components/notifications/NotificationBadge";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class ResultWS extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1180px",
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
          <div style={styleOf("background: #FCFBF7; min-height: 1111px")}>
            <main
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 36px 24px 56px; display: flex; flex-direction: column; gap: 24px",
              )}
            >
              <div style={styleOf("font-size: 13.5px; color: #706473")}>
                <a
                  href={"MyWS.dc.html"}
                  style={styleOf("color: #706473; text-decoration: none")}
                >
                  {"Bài Writing và Speaking của tôi"}
                </a>
                {" / Practice Test 01 / Writing Task 2"}
              </div>
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
                    {"Kết quả Writing Task 2"}
                  </h1>
                  <div
                    style={styleOf(
                      "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                    )}
                  >
                    {"Public transport and traffic"}
                  </div>
                </div>
                <div style={styleOf("display: flex; gap: 10px")}>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    <svg
                      width={"14"}
                      height={"14"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                    </svg>
                    {"Đã có kết quả"}
                  </span>
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    <svg
                      width={"18"}
                      height={"18"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M12 4v12M7 11l5 5 5-5M4 20h16"}></path>
                    </svg>
                    {"Tải .docx"}
                  </a>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                )}
              >
                <div style={styleOf("flex: 1 1 0; padding: 18px 22px; ")}>
                  <div style={styleOf("font-size: 13px; color: #706473")}>
                    {"Điểm Task 2"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                    )}
                  >
                    {"6.5"}
                  </div>
                  <div style={styleOf("font-size: 13px; color: #6A5D6C")}>
                    {"đánh giá cho Task 2, không phải band toàn kỹ năng"}
                  </div>
                </div>
                <div
                  style={styleOf(
                    "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                  )}
                >
                  <div style={styleOf("font-size: 13px; color: #706473")}>
                    {"Số từ"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                    )}
                  >
                    {"271"}
                  </div>
                  <div style={styleOf("font-size: 13px; color: #6A5D6C")}>
                    {"yêu cầu từ 250"}
                  </div>
                </div>
                <div
                  style={styleOf(
                    "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                  )}
                >
                  <div style={styleOf("font-size: 13px; color: #706473")}>
                    {"Công bố"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                    )}
                  >
                    {"22/10/2026"}
                  </div>
                  <div style={styleOf("font-size: 13px; color: #6A5D6C")}>
                    {"yêu cầu đã dùng 1 lượt miễn phí"}
                  </div>
                </div>
                <div
                  style={styleOf(
                    "flex: 1 1 0; padding: 18px 22px; border-left: 1.5px solid #D6D4D0; ",
                  )}
                >
                  <div style={styleOf("font-size: 13px; color: #706473")}>
                    {"Nội dung bài"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                    )}
                  >
                    {"đến 05/11"}
                  </div>
                  <div style={styleOf("font-size: 13px; color: #6A5D6C")}>
                    {"sau đó chỉ còn điểm và nhận xét"}
                  </div>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                )}
              >
                <div
                  style={styleOf(
                    "flex: 1.5 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                  )}
                >
                  <div
                    style={styleOf(
                      "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 14px; ",
                      )}
                    >
                      <div style={styleOf("font-size: 17px; font-weight: 600")}>
                        {"Bài làm kèm nhận xét"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 15.5px; line-height: 1.85; color: #352637",
                        )}
                      >
                        {
                          "In recent years, the question of how best to spend public money on transport has become "
                        }
                        <mark
                          style={styleOf("background: #FBEDBF; padding: 0 2px")}
                        >
                          {"increasingly controversial"}
                        </mark>
                        {
                          ". While some argue that new roads are necessary to reduce congestion, I strongly believe that investment in public transport is a more effective long-term solution. Firstly, an efficient network of buses and trains can carry far more passengers than private cars, "
                        }
                        <mark
                          style={styleOf("background: #FBDCD3; padding: 0 2px")}
                        >
                          {"which reduce"}
                        </mark>
                        {" both traffic and air pollution."}
                      </div>
                      <div
                        style={styleOf(
                          "padding: 12px 14px; border-radius: 12px; background: #FBDCD3; border: 1.5px solid #D6D4D0; font-size: 14px",
                        )}
                      >
                        <b>{"Lỗi ngữ pháp:"}</b>
                        {
                          ' "which reduce" nên là "which reduces" (chủ ngữ là cả mệnh đề trước).'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                  )}
                >
                  <div
                    style={styleOf(
                      "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "font-size: 17px; font-weight: 600; margin-bottom: 6px",
                      )}
                    >
                      {"Điểm theo tiêu chí"}
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-top: 1px solid #E6E4E0",
                      )}
                    >
                      <span>{"Task Achievement / Task Response"}</span>
                      <span style={styleOf("font-weight: 700; color: #7A5A0E")}>
                        {"6.5"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-top: 1px solid #E6E4E0",
                      )}
                    >
                      <span>{"Coherence and Cohesion"}</span>
                      <span style={styleOf("font-weight: 700; color: #7A5A0E")}>
                        {"7.0"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-top: 1px solid #E6E4E0",
                      )}
                    >
                      <span>{"Lexical Resource"}</span>
                      <span style={styleOf("font-weight: 700; color: #7A5A0E")}>
                        {"6.5"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-top: 1px solid #E6E4E0",
                      )}
                    >
                      <span>{"Grammatical Range and Accuracy"}</span>
                      <span style={styleOf("font-weight: 700; color: #7A5A0E")}>
                        {"6.0"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 12px; ",
                      )}
                    >
                      <div style={styleOf("font-size: 17px; font-weight: 600")}>
                        {"Nhận xét của giáo viên"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: center",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #352637",
                          )}
                        >
                          {"LH"}
                        </span>
                        <div>
                          <div style={styleOf("font-weight: 600")}>
                            {"Cô Lan Hương"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Công bố 22/10/2026 16:30"}
                          </div>
                        </div>
                      </div>
                      <div style={styleOf("font-size: 14.5px; color: #4B3D4D")}>
                        {
                          "Bài có lập trường rõ ràng và ví dụ phù hợp. Em cần mở rộng ý ở đoạn thân bài 2 và chú ý hòa hợp chủ ngữ và động từ. Gợi ý: luyện viết câu phức với mệnh đề quan hệ."
                        }
                      </div>
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "padding: 22px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 10px; ",
                      )}
                    >
                      <div style={styleOf("font-size: 17px; font-weight: 600")}>
                        {"Các mốc của yêu cầu"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start; font-size: 14px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 10px; height: 10px; margin-top: 6px; border-radius: 50%; background: #B3A9B5; flex: 0 0 10px",
                          )}
                        ></span>
                        <div>
                          <b>{"Hoàn thành và lưu bài"}</b>
                          <div
                            style={styleOf("color: #706473; font-size: 13px")}
                          >
                            {"20/10 10:05"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start; font-size: 14px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 10px; height: 10px; margin-top: 6px; border-radius: 50%; background: #B3A9B5; flex: 0 0 10px",
                          )}
                        ></span>
                        <div>
                          <b>{"Gửi yêu cầu chấm"}</b>
                          <div
                            style={styleOf("color: #706473; font-size: 13px")}
                          >
                            {"20/10 10:12 · dùng lượt miễn phí tuần 19/10"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start; font-size: 14px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 10px; height: 10px; margin-top: 6px; border-radius: 50%; background: #B3A9B5; flex: 0 0 10px",
                          )}
                        ></span>
                        <div>
                          <b>{"Hệ thống phân công"}</b>
                          <div
                            style={styleOf("color: #706473; font-size: 13px")}
                          >
                            {"20/10 14:05 · Cô Lan Hương"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start; font-size: 14px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 10px; height: 10px; margin-top: 6px; border-radius: 50%; background: #2E6A48; flex: 0 0 10px",
                          )}
                        ></span>
                        <div>
                          <b>{"Công bố kết quả"}</b>
                          <div
                            style={styleOf("color: #706473; font-size: 13px")}
                          >
                            {"22/10 16:30"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default ResultWS;
