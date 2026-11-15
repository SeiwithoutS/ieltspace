import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class PracticeWS extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1240px",
          )}
        >
          {"\n"}
          <LearnerHeader active="exams" />
          <div style={styleOf("background: #FCFBF7; min-height: 1171px")}>
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
                      "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                    )}
                  >
                    {"Luyện Writing và Speaking theo Task, Part"}
                  </h1>
                  <div
                    style={styleOf(
                      "font-size: 15px; color: #706473; margin-top: 4px",
                    )}
                  >
                    {
                      "Chọn một Task hoặc Part để luyện riêng dạng bài bạn còn yếu."
                    }
                  </div>
                </div>
                <div style={styleOf("display: flex; gap: 10px")}></div>
              </div>
              <div
                style={styleOf(
                  "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; font-size: 14px",
                )}
              >
                <span style={styleOf("flex: 0 0 18px; margin-top: 2px")}>
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
                    "Bài luyện được lưu 14 ngày như bài thi. Nếu gửi yêu cầu chấm, kết quả ghi rõ là đánh giá cho Task hoặc Part đó, không phải band toàn kỹ năng. Speaking khi luyện được ghi âm lại trước khi hoàn thành."
                  }
                </span>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 14px; align-items: center",
                )}
              >
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
                  {"Tìm đề Writing hoặc Speaking"}
                </div>
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
                    {"Task 1 Academic"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Task 1 General"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Task 2"}
                  </span>
                </div>
              </div>
              <h2
                style={styleOf(
                  "margin: 8px 0 0; font-size: 22px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                )}
              >
                {"Writing"}
              </h2>
              <div
                style={styleOf(
                  "display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chưa làm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Task 1 Academic"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Line graph · Energy use in three countries"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Mô tả biểu đồ đường, tối thiểu 150 từ, 20 phút."}
                  </div>
                  <a
                    href={"WritingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Đã làm 1 lần"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Task 1 General"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Letter · A broken heating system"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Thư khiếu nại gửi chủ nhà, tối thiểu 150 từ."}
                  </div>
                  <a
                    href={"WritingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Đã có kết quả"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Task 2"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Opinion · Public transport and traffic"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Bài luận nêu quan điểm, tối thiểu 250 từ, 40 phút."}
                  </div>
                  <a
                    href={"WritingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #FBEDBF; color: #7A5A0E; display: flex; align-items: center; justify-content: center",
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
                        aria-hidden={"true"}
                      >
                        <path d={"M15 5l4 4L8 20H4v-4z"}></path>
                      </svg>
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chưa làm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Task 2"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Discussion · Online versus classroom learning"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Bàn luận hai quan điểm, tối thiểu 250 từ."}
                  </div>
                  <a
                    href={"WritingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
              </div>
              <div
                style={styleOf("display: flex; gap: 16px; align-items: center")}
              >
                <h2
                  style={styleOf(
                    "margin: 8px 0 0; font-size: 22px; flex: 1; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Speaking"}
                </h2>
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
                    {"Part 1"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Part 2"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Part 3"}
                  </span>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chưa làm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Part 1"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Hometown and neighbourhood"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"4 đến 5 câu hỏi ngắn về bản thân."}
                  </div>
                  <a
                    href={"SpeakingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chờ chấm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Part 2"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Describe a skill you would like to learn"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Cue card: 1 phút chuẩn bị, nói 1 đến 2 phút."}
                  </div>
                  <a
                    href={"SpeakingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chưa làm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Part 3"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Technology and the elderly"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Thảo luận mở rộng từ chủ đề Part 2."}
                  </div>
                  <a
                    href={"SpeakingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
                </div>
                <div
                  style={styleOf(
                    "padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <span
                      style={styleOf(
                        "width: 38px; height: 38px; flex: 0 0 38px; border-radius: 10px; background: #E8E4FA; color: #5543B0; display: flex; align-items: center; justify-content: center",
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
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Chưa làm"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; margin-top: 14px",
                    )}
                  >
                    {"Part 1"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 700; margin: 2px 0 6px; letter-spacing: -0.01em",
                    )}
                  >
                    {"Work or study"}
                  </div>
                  <div
                    style={styleOf(
                      "font-size: 14px; color: #706473; margin-bottom: 14px",
                    )}
                  >
                    {"Câu hỏi về công việc hoặc việc học."}
                  </div>
                  <a
                    href={"SpeakingTest.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Luyện ngay"}
                  </a>
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

export default PracticeWS;
