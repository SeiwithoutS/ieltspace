import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class Vocab extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1100px",
          )}
        >
          {"\n"}
          <LearnerHeader active="vocab" />
          <div style={styleOf("background: #FCFBF7; min-height: 1031px")}>
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
                    {"Thư viện từ vựng"}
                  </h1>
                  <div
                    style={styleOf(
                      "font-size: 15px; color: #706473; margin-top: 4px",
                    )}
                  >
                    {
                      "Tra cứu theo chủ đề, lưu từ yêu thích, thêm ghi chú và nhãn riêng."
                    }
                  </div>
                </div>
                <div style={styleOf("display: flex; gap: 10px")}>
                  <a
                    href={"Flashcard.dc.html"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                      <rect
                        x={"3"}
                        y={"6"}
                        width={"14"}
                        height={"12"}
                        rx={"2"}
                      ></rect>
                      <path d={"M7 3h14v12"}></path>
                    </svg>
                    {"Ôn bằng flashcard"}
                  </a>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 14px; align-items: center",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; width: 260px; box-sizing: border-box; border: 1.5px solid #D6D4D0; border-radius: 10px; background: #FFFFFF; color: #706473; font-size: 14px",
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
                  {"Tìm từ"}
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
                    {"Môi trường"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Giao thông"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Giáo dục"}
                  </span>
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
                    {"Mọi từ"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Yêu thích"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                    )}
                  >
                    {"Theo nhãn"}
                  </span>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                )}
              >
                <div
                  style={styleOf(
                    "flex: 2 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px",
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Môi trường"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Bỏ yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FBDCD3; color: #C0412A; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"sustainable"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/səˈsteɪnəbl/ · adj"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"bền vững"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"Sustainable development protects resources."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #E3ECFD; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path
                              d={
                                "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"
                              }
                            ></path>
                            <circle cx={"7"} cy={"7"} r={"1.5"}></circle>
                          </svg>
                          {"IELTS Writing"}
                        </span>
                      </div>
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Môi trường"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Bỏ yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FBDCD3; color: #C0412A; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"mitigate"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/ˈmɪtɪɡeɪt/ · v"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"giảm nhẹ"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"Trees help mitigate the effects of heat."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #E3ECFD; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path
                              d={
                                "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"
                              }
                            ></path>
                            <circle cx={"7"} cy={"7"} r={"1.5"}></circle>
                          </svg>
                          {"Hay quên"}
                        </span>
                      </div>
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Giao thông"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Thêm yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #706473; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"infrastructure"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/ˈɪnfrəstrʌktʃə/ · n"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"cơ sở hạ tầng"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"The city invests in public infrastructure."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      ></div>
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Giao thông"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Thêm yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #706473; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"commute"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/kəˈmjuːt/ · v"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"đi lại hằng ngày"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"Many people commute by train."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #E3ECFD; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path
                              d={
                                "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"
                              }
                            ></path>
                            <circle cx={"7"} cy={"7"} r={"1.5"}></circle>
                          </svg>
                          {"Speaking Part 1"}
                        </span>
                      </div>
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Giáo dục"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Thêm yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #706473; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"curriculum"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/kəˈrɪkjələm/ · n"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"chương trình học"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"The curriculum includes practical skills."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      ></div>
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
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chủ đề Giáo dục"}
                        </span>
                        <button
                          type={"button"}
                          aria-label={"Bỏ yêu thích"}
                          style={styleOf(
                            "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FBDCD3; color: #C0412A; display: flex; align-items: center; justify-content: center; cursor: pointer",
                          )}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"2"}
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
                        </button>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; gap: 10px; margin-top: 6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 22px; font-weight: 700; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"literacy"}
                        </div>
                        <span
                          style={styleOf("color: #706473")}
                          aria-label={"Phát âm"}
                        >
                          <svg
                            width={"17"}
                            height={"17"}
                            viewBox={"0 0 24 24"}
                            fill={"none"}
                            stroke={"currentColor"}
                            strokeWidth={"1.8"}
                            strokeLinecap={"round"}
                            strokeLinejoin={"round"}
                            aria-hidden={"true"}
                          >
                            <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                            <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                          </svg>
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"/ˈlɪtərəsi/ · n"}
                      </div>
                      <div
                        style={styleOf("margin: 10px 0 4px; font-weight: 600")}
                      >
                        {"khả năng đọc viết"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"Adult literacy has improved."}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px",
                        )}
                      ></div>
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
                      "padding: 22px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 10px; ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; gap: 16px; align-items: center",
                        )}
                      >
                        <div style={styleOf("flex: 1")}>
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Đang mở"}
                          </div>
                          <div
                            style={styleOf(
                              "font-size: 24px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                            )}
                          >
                            {"mitigate"}
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBDCD3; color: #C0412A; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path
                              d={
                                "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"
                              }
                            ></path>
                          </svg>
                          {"Yêu thích"}
                        </span>
                      </div>
                      <div style={styleOf("font-size: 14px; font-weight: 600")}>
                        {"Ghi chú của bạn"}
                      </div>
                      <div
                        style={styleOf(
                          "min-height: 84px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #D6D4D0; font-size: 14px",
                        )}
                      >
                        {
                          'Dùng với "the effects of", "the risk of". Đồng nghĩa: alleviate, reduce.'
                        }
                      </div>
                      <div style={styleOf("font-size: 14px; font-weight: 600")}>
                        {"Nhãn"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; flex-wrap: wrap; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #E3ECFD; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path
                              d={
                                "M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"
                              }
                            ></path>
                            <circle cx={"7"} cy={"7"} r={"1.5"}></circle>
                          </svg>
                          {"Hay quên"}
                        </span>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path d={"M12 5v14M5 12h14"}></path>
                          </svg>
                          {"IELTS Writing"}
                        </span>
                        <span
                          style={styleOf(
                            "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                            <path d={"M12 5v14M5 12h14"}></path>
                          </svg>
                          {"Tạo nhãn mới"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 10px; align-items: flex-start",
                        )}
                      >
                        <a
                          href={"#"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #C0412A; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Xóa ghi chú"}
                        </a>
                        <a
                          href={"#"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Lưu"}
                        </a>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {
                          "Ghi chú và nhãn chỉ bạn thấy. Khách xem được từ vựng nhưng phải đăng nhập để lưu yêu thích, ghi chú, nhãn."
                        }
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

export default Vocab;
