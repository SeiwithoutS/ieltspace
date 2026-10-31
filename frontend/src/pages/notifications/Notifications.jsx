import NotificationBadge from "../../components/notifications/NotificationBadge";
import NotificationInbox from "../../components/notifications/NotificationInbox";
import AdminTopbar from "../../components/navigation/AdminTopbar";
import AdminSidebar from "../../components/navigation/AdminSidebar";
import TeacherSidebar from "../../components/navigation/TeacherSidebar";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class Notifications extends React.Component {
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
    var from = (typeof window !== "undefined" && window.__dcFrom) || "";
    var fm = {
      TeacherHome: "Giáo viên",
      TeacherQueue: "Giáo viên",
      TeacherHistory: "Giáo viên",
      TeacherGrade: "Giáo viên",
      StaffProfile: "Giáo viên",
      AdminHome: "Quản lý",
      AdminUsers: "Quản lý",
      AdminExams: "Quản lý",
      AdminEditor: "Quản lý",
      AdminImport: "Quản lý",
      AdminContent: "Quản lý",
      AdminGrading: "Quản lý",
    };
    var sel =
      (this.state && this.state.sel) ||
      fm[from] ||
      this.props.vaiTro ||
      "Người học";
    return {
      accent: accent,
      onAccent: lum > 0.6 ? "#1A1A1A" : "#FFFFFF",
      v0: sel === "Người học",
      v1: sel === "Giáo viên",
      v2: sel === "Quản lý",
    };
  }

  static defaultProps = { vaiTro: "Người học", accent: "#2963CC" };
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
          className="app-shell-ancestor"
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 900px",
          )}
        >
          {"\n"}
          {v.v0 ? (
            <>
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
                  <nav
                    style={styleOf("display: flex; flex-wrap: wrap; gap: 4px")}
                  >
                    <div
                      className={"bu-dd"}
                      style={styleOf("position: relative")}
                    >
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                  d={
                                    "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                                  }
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Luyện riêng Part 1, 2 hoặc 3"}
                              </span>
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className={"bu-dd"}
                      style={styleOf("position: relative")}
                    >
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
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
              <div style={styleOf("background: #FCFBF7; min-height: 831px")}>
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
                        {"Thông báo"}
                      </h1>
                      <div
                        style={styleOf(
                          "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                        )}
                      >
                        {
                          "Chỉ hiển thị trong hệ thống, không gửi email hay thông báo đẩy."
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
                        "flex: 1.3 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                      )}
                    >
                      <NotificationInbox role="learner" />
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
                            "display: flex; flex-direction: column; gap: 14px; ",
                          )}
                        >
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Chi tiết · đã đánh dấu đã đọc"}
                          </div>
                          <div
                            style={styleOf(
                              "font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                            )}
                          >
                            {"Yêu cầu chấm Speaking Part 3 đã bị hủy"}
                          </div>
                          <div
                            style={styleOf("font-size: 14.5px; color: #4B3D4D")}
                          >
                            {
                              "Yêu cầu gửi lúc 18/10 19:41 chưa được phân công sau 72 giờ nên hệ thống đã hủy. Bạn được hoàn 1 lượt bonus, dùng được đến hết Chủ nhật 01/11. Bài còn giữ đến 01/11, bạn có thể gửi lại yêu cầu."
                            }
                          </div>
                          <a
                            href={"MyWS.dc.html"}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Mở bài Writing/Speaking"}
                          </a>
                          <div
                            style={styleOf(
                              "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
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
                              {
                                "Thông báo là bản ghi tại thời điểm phát sinh. Màn hình bài làm hiển thị trạng thái hiện tại; nếu nội dung đã hết hạn hoặc bạn không còn quyền, liên kết sẽ không mở được nội dung."
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </>
          ) : null}
          {v.v1 ? (
            <>
              <div
                className="app-shell"
                style={styleOf(
                  "display: flex; flex-wrap: wrap; align-items: stretch; min-height: inherit",
                )}
              >
                <TeacherSidebar />
                <div
                  className="app-content"
                  style={styleOf(
                    "flex: 1 1 560px; min-width: 0; display: flex; flex-direction: column",
                  )}
                >
                  <AdminTopbar
                    crumb="Giáo viên / Thông báo"
                    userName="Lan Hương"
                    initials="LH"
                    email="lanhuong@ieltspace.vn"
                    role="Giáo viên"
                  />
                  <main
                    style={styleOf(
                      "flex: 1; background: #FAF9F5; padding: 36px 32px 48px; display: flex; flex-direction: column; gap: 24px",
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
                          {"Thông báo"}
                        </h1>
                        <div
                          style={styleOf(
                            "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                          )}
                        >
                          {
                            "Chỉ hiển thị trong hệ thống, không gửi email hay thông báo đẩy."
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
                          "flex: 1.3 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                        )}
                      >
                        <NotificationInbox role="teacher" />
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
                              "display: flex; flex-direction: column; gap: 14px; ",
                            )}
                          >
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"Chi tiết · đã đánh dấu đã đọc"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                              )}
                            >
                              {"Bạn được phân công bài mới"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 14.5px; color: #4B3D4D",
                              )}
                            >
                              {
                                "Hệ thống đã phân công bài Writing Task 1 Academic của Hoàng Nam cho bạn lúc 23/10 08:10. Bài xuất hiện trong hàng chờ chấm của bạn."
                              }
                            </div>
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Mở bài trong hàng chờ"}
                            </a>
                            <div
                              style={styleOf(
                                "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
                              )}
                            >
                              <span
                                style={styleOf(
                                  "flex: 0 0 18px; margin-top: 2px",
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
                                  <circle cx={"12"} cy={"12"} r={"9"}></circle>
                                  <path d={"M12 11v5M12 8h.01"}></path>
                                </svg>
                              </span>
                              <span>
                                {
                                  "Thông báo là bản ghi tại thời điểm phát sinh. Màn hình bài làm hiển thị trạng thái hiện tại; nếu nội dung đã hết hạn hoặc bạn không còn quyền, liên kết sẽ không mở được nội dung."
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </>
          ) : null}
          {v.v2 ? (
            <>
              <div
                className="app-shell"
                style={styleOf(
                  "display: flex; flex-wrap: wrap; align-items: stretch; min-height: inherit",
                )}
              >
                <AdminSidebar active="none" />
                <div
                  className="app-content"
                  style={styleOf(
                    "flex: 1 1 560px; min-width: 0; display: flex; flex-direction: column",
                  )}
                >
                  <AdminTopbar crumb="Quản lý / Thông báo" />
                  <main
                    style={styleOf(
                      "flex: 1; background: #FAF9F5; padding: 36px 32px 48px; display: flex; flex-direction: column; gap: 24px",
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
                          {"Thông báo"}
                        </h1>
                        <div
                          style={styleOf(
                            "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                          )}
                        >
                          {
                            "Chỉ hiển thị trong hệ thống, không gửi email hay thông báo đẩy."
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
                          "flex: 1.3 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                        )}
                      >
                        <NotificationInbox role="admin" />
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
                              "display: flex; flex-direction: column; gap: 14px; ",
                            )}
                          >
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"Chi tiết · đã đánh dấu đã đọc"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                              )}
                            >
                              {"Thầy Quốc Bảo không thể hoàn thành 3 bài"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 14.5px; color: #4B3D4D",
                              )}
                            >
                              {
                                "Có 3 yêu cầu Writing đã phân công cho Thầy Quốc Bảo chưa có kết quả. Vào Người dùng để chọn quyền cần ngừng, nhập lý do và xác nhận hủy; mỗi yêu cầu được hoàn 1 bonus cho người học."
                              }
                            </div>
                            <a
                              href={"AdminUsers.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Xử lý trong Người dùng"}
                            </a>
                            <div
                              style={styleOf(
                                "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
                              )}
                            >
                              <span
                                style={styleOf(
                                  "flex: 0 0 18px; margin-top: 2px",
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
                                  <circle cx={"12"} cy={"12"} r={"9"}></circle>
                                  <path d={"M12 11v5M12 8h.01"}></path>
                                </svg>
                              </span>
                              <span>
                                {
                                  "Thông báo là bản ghi tại thời điểm phát sinh. Màn hình bài làm hiển thị trạng thái hiện tại; nếu nội dung đã hết hạn hoặc bạn không còn quyền, liên kết sẽ không mở được nội dung."
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </>
          ) : null}
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default Notifications;
