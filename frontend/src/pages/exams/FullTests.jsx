import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/shared/styles";

class FullTests extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 2130px",
          )}
        >
          {"\n"}
          <LearnerHeader active="exams" />
          <div style={styleOf("background: #FCFBF7; min-height: 2061px")}>
            <section
              style={styleOf(
                "background: linear-gradient(135deg, #E3ECFD 0%, #E6F3EC 100%); border-bottom: 1.5px solid #D6D4D0",
              )}
            >
              <div
                style={styleOf(
                  "max-width: 1200px; margin: 0 auto; padding: 36px 24px 32px; display: flex; flex-direction: column; gap: 12px",
                )}
              >
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {"Thư viện đề / IELTS Full Tests"}
                </div>
                <h1
                  style={styleOf(
                    "margin: 0; font-size: 36px; line-height: 1.2; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"IELTS Full Tests"}
                </h1>
                <p
                  style={styleOf(
                    "margin: 0; max-width: 720px; font-size: 16px; color: #4B3D4D",
                  )}
                >
                  {
                    "Làm đề đủ 4 kỹ năng với giao diện giống thi trên máy. Listening và Reading chấm ngay. Bài Writing và Speaking được lưu 14 ngày, bạn chọn gửi giáo viên chấm khi cần."
                  }
                </p>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-size: 14px; font-weight: 600",
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
                      aria-hidden={"true"}
                    >
                      <path d={"M12 3l9 5-9 5-9-5z"}></path>
                      <path d={"M3 13l9 5 9-5"}></path>
                    </svg>
                    {"Đề mới mỗi quý"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-size: 14px; font-weight: 600",
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
                      aria-hidden={"true"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path d={"M12 7v5l3 2"}></path>
                    </svg>
                    {"Tính giờ như thi thật"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-size: 14px; font-weight: 600",
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
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                    </svg>
                    {"Lời giải chi tiết"}
                  </span>
                </div>
              </div>
            </section>
            <div
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 32px 24px 56px; display: flex; flex-direction: column; gap: 32px",
              )}
            >
              <div
                style={styleOf(
                  "display: flex; gap: 14px; align-items: center; flex-wrap: wrap",
                )}
              >
                <div
                  style={styleOf(
                    "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600",
                    )}
                  >
                    {"Tất cả"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Academic"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"General Training"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; width: 300px; box-sizing: border-box; border: 1.5px solid #D6D4D0; border-radius: 10px; background: #FFFFFF; color: #706473; font-size: 14px",
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
                    <circle cx={"11"} cy={"11"} r={"7"}></circle>
                    <path d={"M20 20l-4-4"}></path>
                  </svg>
                  {"Tìm bộ đề"}
                </div>
              </div>
              <section
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 20px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px",
                  )}
                >
                  <div>
                    <h2
                      style={styleOf(
                        "margin: 0; font-size: 24px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                      )}
                    >
                      {"Bộ IELTS Mock Test"}
                    </h2>
                    <p
                      style={styleOf(
                        "margin: 4px 0 0; color: #706473; font-size: 14px",
                      )}
                    >
                      {"Đề mô phỏng mới nhất, cập nhật theo quý."}
                    </p>
                  </div>
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                    )}
                  >
                    {"Xem thêm"}
                    <svg
                      width={"16"}
                      height={"16"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                    </svg>
                  </a>
                </div>
                <div
                  style={styleOf(
                    "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                      )}
                    >
                      <span
                        style={styleOf(
                          "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                        )}
                      >
                        {"Mới"}
                      </span>
                    </div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Mock Test 2026 Vol 4"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"6 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"12K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Mock Test 2026 Vol 3"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"6 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"9,8K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Mock Test 2026 Vol 2"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"6 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"15K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Mock Test 2026 Vol 1"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"6 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"30K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
              <section
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 20px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px",
                  )}
                >
                  <div>
                    <h2
                      style={styleOf(
                        "margin: 0; font-size: 24px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                      )}
                    >
                      {"Bộ IELTS Practice Test Plus"}
                    </h2>
                    <p
                      style={styleOf(
                        "margin: 4px 0 0; color: #706473; font-size: 14px",
                      )}
                    >
                      {"Đề luyện kèm lời giải và danh sách từ vựng."}
                    </p>
                  </div>
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                    )}
                  >
                    {"Xem thêm"}
                    <svg
                      width={"16"}
                      height={"16"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                    </svg>
                  </a>
                </div>
                <div
                  style={styleOf(
                    "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"IELTS Practice Plus Book 1"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"10 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"68K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"IELTS Practice Plus Book 2"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"12 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"41K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"IELTS Practice Plus Book 3"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"14 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"30K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"IELTS Practice Plus Book 4"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"10 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"22K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
              <section
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 20px",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px",
                  )}
                >
                  <div>
                    <h2
                      style={styleOf(
                        "margin: 0; font-size: 24px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                      )}
                    >
                      {"Bộ IELTS Actual Test"}
                    </h2>
                    <p
                      style={styleOf(
                        "margin: 4px 0 0; color: #706473; font-size: 14px",
                      )}
                    >
                      {"Tổng hợp từ các kỳ thi gần đây."}
                    </p>
                  </div>
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                    )}
                  >
                    {"Xem thêm"}
                    <svg
                      width={"16"}
                      height={"16"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinecap={"round"}
                      strokeLinejoin={"round"}
                      aria-hidden={"true"}
                    >
                      <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                    </svg>
                  </a>
                </div>
                <div
                  style={styleOf(
                    "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Actual Test Quý 2/2026"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"8 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"21K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Actual Test Quý 1/2026"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"8 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"16K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Actual Test Quý 4/2025"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"8 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"54K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                    )}
                  >
                    <div
                      style={styleOf(
                        "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                      )}
                    ></div>
                    <div style={styleOf("padding: 4px 8px 0")}>
                      <div
                        style={styleOf(
                          "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                        )}
                      >
                        {"Actual Test Quý 3/2025"}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                      )}
                    >
                      <span>{"8 bài test"}</span>
                      <span
                        aria-hidden={"true"}
                        style={styleOf(
                          "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                        )}
                      ></span>
                      <span>{"82K lượt làm"}</span>
                    </div>
                    <a
                      href={"ExamDetail.dc.html"}
                      style={styleOf(
                        "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                      )}
                    >
                      {"Xem bài test"}
                      <svg
                        width={"16"}
                        height={"16"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                        aria-hidden={"true"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default FullTests;
