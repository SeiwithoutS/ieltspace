import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class StudentLanding extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 3700px",
          )}
        >
          {"\n"}
          {"\n"}
          <LearnerHeader active="home" />
          {"\n\n"}
          {"\n"}
          <div
            style={styleOf(
              "background: linear-gradient(135deg, #E3ECFD 0%, #E6F3EC 100%); border-bottom: 1.5px solid #D6D4D0",
            )}
          >
            <div
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 44px 24px 48px; display: flex; flex-direction: column; gap: 24px",
              )}
            >
              {"\n"}
              <div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                  )}
                >
                  <span
                    style={styleOf(
                      "width: 8px; height: 8px; border-radius: 50%; background: " +
                        v.accent,
                    )}
                  ></span>
                  <span>{"Chào mừng quay lại"}</span>
                </div>
                <h1
                  className="m-0 mt-3 text-[34px] md:text-[44px] leading-tight font-bold tracking-tight text-[#352637]"
                  style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}
                >
                  {"Học một chút, tiến xa hơn."}
                </h1>
                <p style={styleOf("margin: 6px 0 0; color: #4B3D4D")}>
                  {"Minh Anh, hôm nay bạn muốn chinh phục kỹ năng nào?"}
                </p>
              </div>
              {"\n"}
              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                <div className="flex-1 md:flex-[1.7] min-w-0 p-6 sm:p-9 md:p-10 rounded-[26px] border-solid border-[1.5px] border-[#352637] bg-[#352637] text-white flex flex-col gap-3.5">
                  {"\n"}
                  <div
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #CABFAE",
                    )}
                  >
                    <span style={styleOf("color: #FBEDBF")}>
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
                        <path
                          d={
                            "M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z"
                          }
                        ></path>
                      </svg>
                    </span>
                    {"Động lực mỗi ngày"}
                  </div>
                  {"\n"}
                  <div
                    style={styleOf(
                      "font-size: 28px; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em; max-width: 26ch; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                    )}
                  >
                    {
                      "“Bạn không cần tiến nhanh hơn ai khác. Chỉ cần tiến hơn chính mình hôm qua.”"
                    }
                  </div>
                  {"\n"}
                  <div
                    style={styleOf(
                      "width: 44px; height: 4px; border-radius: 2px; background: " +
                        v.accent,
                    )}
                  ></div>
                  {"\n"}
                  <div className="mt-auto pt-2.5 flex flex-col sm:flex-row gap-3">
                    <a
                      href={"#"}
                      className="w-full box-border sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-solid border-[1.5px] border-[#D6D4D0] font-semibold text-sm no-underline whitespace-nowrap"
                      style={{ background: v.accent, color: v.onAccent }}
                    >
                      {"Làm tiếp bài dở"}
                      <svg
                        width={"18"}
                        height={"18"}
                        viewBox={"0 0 24 24"}
                        fill={"none"}
                        stroke={"currentColor"}
                        strokeWidth={"2"}
                        strokeLinecap={"round"}
                        strokeLinejoin={"round"}
                      >
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                    <a
                      href={"#"}
                      className="w-full box-border sm:w-auto inline-flex items-center justify-center h-11 px-5 rounded-xl border-solid border-[1.5px] border-white text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-white/10"
                    >
                      {"Chọn đề mới"}
                    </a>
                  </div>
                </div>
                {"\n"}
                <div className="flex-1 min-w-0 p-6 rounded-[22px] border-solid border-[1.5px] border-[#D6D4D0] bg-white shadow-sm flex flex-col gap-3.5">
                  {"\n"}
                  <div
                    style={styleOf(
                      "display: flex; justify-content: space-between; align-items: center",
                    )}
                  >
                    <div style={styleOf("font-size: 18px; font-weight: 600")}>
                      {"Mục tiêu hôm nay"}
                    </div>
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
                  </div>
                  {"\n"}
                  <div
                    style={styleOf(
                      "display: flex; align-items: center; gap: 18px",
                    )}
                  >
                    {"\n"}
                    <div
                      style={styleOf(
                        "width: 112px; height: 112px; flex: 0 0 112px; border-radius: 50%; background: conic-gradient(" +
                          v.accent +
                          " 0 50%, #E8E0D2 50% 100%); display: flex; align-items: center; justify-content: center",
                      )}
                    >
                      {"\n"}
                      <div
                        style={styleOf(
                          "width: 90px; height: 90px; border-radius: 50%; background: #FCFBF7; display: flex; flex-direction: column; align-items: center; justify-content: center",
                        )}
                      >
                        <span
                          style={styleOf(
                            "font-size: 28px; font-weight: 700; line-height: 1; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                          )}
                        >
                          {"1/2"}
                        </span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"phiên"}
                        </span>
                      </div>
                    </div>
                    {"\n"}
                    <div>
                      <div style={styleOf("font-weight: 600")}>
                        {"Còn 1 phiên luyện tập"}
                      </div>
                      <div style={styleOf("font-size: 14px; color: #706473")}>
                        {"Những bước nhỏ tạo ra thay đổi lớn."}
                      </div>
                    </div>
                  </div>
                  {"\n"}
                  <div
                    style={styleOf(
                      "padding-top: 14px; border-top: 1px solid #E6E4E0",
                    )}
                  >
                    {"\n"}
                    <div
                      style={styleOf(
                        "display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px",
                      )}
                    >
                      <span
                        style={styleOf(
                          "display: flex; align-items: center; gap: 6px; font-weight: 600",
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
                        >
                          <path
                            d={
                              "M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.5 3 2.5 3.5C11 8 12 5 14 3c.5 3 5 5.5 5 11 0 4-3 7-7 7z"
                            }
                          ></path>
                        </svg>
                        {"Chuỗi 3 ngày"}
                      </span>
                      <span style={styleOf("font-size: 13px; color: #706473")}>
                        {"Kỷ lục: 9 ngày"}
                      </span>
                    </div>
                    {"\n"}
                    <div style={styleOf("display: flex; gap: 4px")}>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px solid #D6D4D0; background: " +
                              v.accent +
                              "; color: " +
                              v.onAccent +
                              "; display: flex; align-items: center; justify-content: center",
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
                          >
                            <path
                              d={
                                "M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.5 3 2.5 3.5C11 8 12 5 14 3c.5 3 5 5.5 5 11 0 4-3 7-7 7z"
                              }
                            ></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T2"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px solid #D6D4D0; background: " +
                              v.accent +
                              "; color: " +
                              v.onAccent +
                              "; display: flex; align-items: center; justify-content: center",
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
                          >
                            <path
                              d={
                                "M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.5 3 2.5 3.5C11 8 12 5 14 3c.5 3 5 5.5 5 11 0 4-3 7-7 7z"
                              }
                            ></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T3"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px solid #D6D4D0; background: " +
                              v.accent +
                              "; color: " +
                              v.onAccent +
                              "; display: flex; align-items: center; justify-content: center",
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
                          >
                            <path
                              d={
                                "M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.5 3 2.5 3.5C11 8 12 5 14 3c.5 3 5 5.5 5 11 0 4-3 7-7 7z"
                              }
                            ></path>
                          </svg>
                        </span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T4"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px dashed #C6C4BF; color: #CABFAE; display: flex; align-items: center; justify-content: center",
                          )}
                        ></span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T5"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px dashed #C6C4BF; color: #CABFAE; display: flex; align-items: center; justify-content: center",
                          )}
                        ></span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T6"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px dashed #C6C4BF; color: #CABFAE; display: flex; align-items: center; justify-content: center",
                          )}
                        ></span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"T7"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 30px; height: 30px; border-radius: 50%; box-sizing: border-box; border: 1.5px dashed #C6C4BF; color: #CABFAE; display: flex; align-items: center; justify-content: center",
                          )}
                        ></span>
                        <span
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"CN"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {"\n"}
                </div>
              </div>
            </div>
          </div>
          {"\n\n"}
          {"\n"}
          <section
            id={"gan-day"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px 8px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Bài làm gần đây"}
                </h2>
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {"Làm tiếp bài đang dở hoặc làm lại để cải thiện điểm."}
                </p>
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem lịch sử "}
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
                  <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                </svg>
              </a>
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 0 0 260px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Reading"}
                  </span>
                  <span style={styleOf("font-size: 13px; color: #706473")}>
                    {"Reading Practice"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: 4px; font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                  )}
                >
                  {"The kākāpo"}
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #2E6A48",
                  )}
                >
                  <svg
                    width={"17"}
                    height={"17"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2.4"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                  </svg>
                  {"Đúng 2/13 câu"}
                </div>
                <div
                  style={styleOf(
                    "margin-top: auto; padding-top: 10px; display: flex",
                  )}
                >
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
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
                    >
                      <path d={"M4 12a8 8 0 1 0 2.3-5.6"}></path>
                      <path d={"M4 4v4h4"}></path>
                    </svg>
                    {"Làm lại"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                </div>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 0 0 260px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Listening"}
                  </span>
                  <span style={styleOf("font-size: 13px; color: #706473")}>
                    {"IELTS Online Test"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: 4px; font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 2 · Listening"}
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1; height: 8px; border-radius: 99px; border: 1.5px solid #D6D4D0; box-sizing: content-box; background: #FFFFFF; overflow: hidden",
                    )}
                  >
                    <div
                      style={styleOf(
                        "width: 0%; height: 100%; background: " + v.accent,
                      )}
                    ></div>
                  </div>
                  <span
                    style={styleOf(
                      "font-size: 14px; color: #706473; white-space: nowrap",
                    )}
                  >
                    {"0/40 câu"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: auto; padding-top: 10px; display: flex",
                  )}
                >
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path d={"M10 9v6M14 9v6"} strokeLinecap={"round"}></path>
                    </svg>
                    {"Làm tiếp"}
                  </a>
                </div>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 0 0 260px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Reading"}
                  </span>
                  <span style={styleOf("font-size: 13px; color: #706473")}>
                    {"IELTS Online Test"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: 4px; font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 4 · Reading Academic"}
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 12px",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1; height: 8px; border-radius: 99px; border: 1.5px solid #D6D4D0; box-sizing: content-box; background: #FFFFFF; overflow: hidden",
                    )}
                  >
                    <div
                      style={styleOf(
                        "width: 28%; height: 100%; background: " + v.accent,
                      )}
                    ></div>
                  </div>
                  <span
                    style={styleOf(
                      "font-size: 14px; color: #706473; white-space: nowrap",
                    )}
                  >
                    {"11/40 câu"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: auto; padding-top: 10px; display: flex",
                  )}
                >
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path d={"M10 9v6M14 9v6"} strokeLinecap={"round"}></path>
                    </svg>
                    {"Làm tiếp"}
                  </a>
                </div>
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 0 0 260px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px",
                  )}
                >
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Writing"}
                  </span>
                  <span style={styleOf("font-size: 13px; color: #706473")}>
                    {"Writing Task 2"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: 4px; font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                  )}
                >
                  {"Opinion Essay · Public transport"}
                </div>
                <div>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Chờ chấm"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "margin-top: auto; padding-top: 10px; display: flex",
                  )}
                >
                  <a
                    href={"MyWS.dc.html"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
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
                    >
                      <path d={"M6 3h8l4 4v14H6z"}></path>
                      <path d={"M14 3v4h4M9 12h6M9 16h6"}></path>
                    </svg>
                    {"Xem bài nộp"}
                  </a>
                </div>
              </div>
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
          {"\n"}
          <section
            id={"bo-de"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                {"\n"}
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Bộ đề mới nhất"}
                </h2>
                {"\n"}
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {
                    "Mỗi bộ gồm nhiều đề đủ 4 kỹ năng, làm trọn đề hoặc từng kỹ năng."
                  }
                </p>
                {"\n"}
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem thêm "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                  )}
                ></div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4"}
                </div>
                {"\n"}
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
                  <span>{"12.4K lượt làm"}</span>
                </div>
                <div
                  style={styleOf(
                    "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                  )}
                >
                  {
                    "6 đề Listening, Reading, Writing, Speaking theo format thi trên máy"
                  }
                </div>
                {"\n"}
                <a
                  href={"ExamDetail.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài test "}
                  <svg
                    width={"16"}
                    height={"16"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2.2"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M9 6l6 6-6 6"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                  )}
                ></div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Actual Test Quý 2/2026"}
                </div>
                {"\n"}
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
                  <span>{"21.0K lượt làm"}</span>
                </div>
                <div
                  style={styleOf(
                    "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                  )}
                >
                  {"Tổng hợp từ các kỳ thi tháng 4 đến tháng 6/2026"}
                </div>
                {"\n"}
                <a
                  href={"ExamDetail.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài test "}
                  <svg
                    width={"16"}
                    height={"16"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2.2"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M9 6l6 6-6 6"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                  )}
                ></div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Speaking Forecast T9–T12/2026"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                  )}
                >
                  <span>{"42 bài test"}</span>
                  <span
                    aria-hidden={"true"}
                    style={styleOf(
                      "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                    )}
                  ></span>
                  <span>{"18.7K lượt làm"}</span>
                </div>
                <div
                  style={styleOf(
                    "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                  )}
                >
                  {"Chủ đề Part 1, 2, 3 dự đoán cho quý cuối năm"}
                </div>
                {"\n"}
                <a
                  href={"ExamDetail.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài test "}
                  <svg
                    width={"16"}
                    height={"16"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2.2"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M9 6l6 6-6 6"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                  )}
                ></div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Academic Reading Pack 05"}
                </div>
                {"\n"}
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
                  <span>{"9.3K lượt làm"}</span>
                </div>
                <div
                  style={styleOf(
                    "font-size: 14px; line-height: 1.5; color: #706473; padding: 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden",
                  )}
                >
                  {"Passage luyện theo dạng câu hỏi, có lời giải từng câu"}
                </div>
                {"\n"}
                <a
                  href={"ExamDetail.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài test "}
                  <svg
                    width={"16"}
                    height={"16"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"2.2"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                  >
                    <path d={"M9 6l6 6-6 6"}></path>
                  </svg>
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
          {"\n"}
          <section
            id={"reading"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                {"\n"}
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Luyện IELTS Reading"}
                </h2>
                {"\n"}
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {
                    "Mỗi đề là trọn kỹ năng Reading: chọn Practice từng Passage hoặc Real Test 60 phút."
                  }
                </p>
                {"\n"}
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem thêm "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 1 · Reading"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"Academic · 3.2K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
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
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 4 · Reading"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"Academic · 5.6K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 5 · Reading"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"Academic · 4.1K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"IELTS CAM Inspired 19 · Test 1 · Reading"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"General Training · 2.7K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
          {"\n"}
          <section
            id={"listening"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                {"\n"}
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Luyện IELTS Listening"}
                </h2>
                {"\n"}
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {
                    "Mỗi đề là trọn kỹ năng Listening: chọn Practice từng Section hoặc Real Test, audio phát một lần."
                  }
                </p>
                {"\n"}
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem thêm "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
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
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 1 · Listening"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"2.8K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 2 · Listening"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"2.1K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"Mock Test 2026 Vol 4 · Test 4 · Listening"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"3.7K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                  )}
                >
                  <span
                    style={styleOf(
                      "position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap",
                    )}
                  >
                    {"40 câu"}
                  </span>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; padding: 4px 8px 0",
                  )}
                >
                  {"IELTS CAM Inspired 19 · Test 1 · Listening"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 14px; color: #706473; padding: 0 6px",
                  )}
                >
                  {"1.9K lượt làm"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex",
                  )}
                >
                  {"\n"}
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; text-decoration: none",
                    )}
                  >
                    <svg
                      width={"20"}
                      height={"20"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={v.accent}
                      strokeWidth={"2"}
                    >
                      <circle cx={"12"} cy={"12"} r={"9"}></circle>
                      <path
                        d={"M10 8.5l5 3.5-5 3.5z"}
                        fill={v.accent}
                        strokeLinejoin={"round"}
                      ></path>
                    </svg>
                    {"Làm bài"}
                    <svg
                      width={"12"}
                      height={"12"}
                      viewBox={"0 0 24 24"}
                      fill={"#706473"}
                    >
                      <path d={"M6 9l6 7 6-7z"}></path>
                    </svg>
                  </a>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
          {"\n"}
          <section
            id={"tu-vung"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                {"\n"}
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Từ vựng mới"}
                </h2>
                {"\n"}
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {"Từ học thuật theo chủ đề hay gặp trong đề thi gần đây."}
                </p>
                {"\n"}
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem thêm "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: center",
                  )}
                >
                  <span
                    style={styleOf(
                      "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                    )}
                  >
                    {"Environment"}
                  </span>
                  <button
                    type={"button"}
                    aria-label={"Lưu từ"}
                    style={styleOf(
                      "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                    )}
                  >
                    <svg
                      width={"17"}
                      height={"17"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinejoin={"round"}
                    >
                      <path
                        d={
                          "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                        }
                      ></path>
                    </svg>
                  </button>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"mitigate"}
                </div>
                {"\n"}
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {"/ˈmɪt.ɪ.ɡeɪt/ · "}
                  <i>{"v"}</i>
                </div>
                {"\n"}
                <div style={styleOf("font-weight: 600")}>
                  {"giảm nhẹ, làm dịu"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                  )}
                >
                  {"Planting trees can mitigate the effects of urban heat."}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: center",
                  )}
                >
                  <span
                    style={styleOf(
                      "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                    )}
                  >
                    {"Society"}
                  </span>
                  <button
                    type={"button"}
                    aria-label={"Lưu từ"}
                    style={styleOf(
                      "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                    )}
                  >
                    <svg
                      width={"17"}
                      height={"17"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinejoin={"round"}
                    >
                      <path
                        d={
                          "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                        }
                      ></path>
                    </svg>
                  </button>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"disproportionate"}
                </div>
                {"\n"}
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {"/ˌdɪs.prəˈpɔː.ʃən.ət/ · "}
                  <i>{"adj"}</i>
                </div>
                {"\n"}
                <div style={styleOf("font-weight: 600")}>
                  {"không cân xứng"}
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                  )}
                >
                  {
                    "Low-income families spend a disproportionate share on rent."
                  }
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 6px; padding: 18px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                {"\n"}
                <div
                  style={styleOf(
                    "display: flex; justify-content: space-between; align-items: center",
                  )}
                >
                  <span
                    style={styleOf(
                      "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #706473",
                    )}
                  >
                    {"Urban life"}
                  </span>
                  <button
                    type={"button"}
                    aria-label={"Lưu từ"}
                    style={styleOf(
                      "width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; display: flex; align-items: center; justify-content: center",
                    )}
                  >
                    <svg
                      width={"17"}
                      height={"17"}
                      viewBox={"0 0 24 24"}
                      fill={"none"}
                      stroke={"currentColor"}
                      strokeWidth={"2"}
                      strokeLinejoin={"round"}
                    >
                      <path
                        d={
                          "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
                        }
                      ></path>
                    </svg>
                  </button>
                </div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 22px; font-weight: 700; margin-top: 6px; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"infrastructure"}
                </div>
                {"\n"}
                <div style={styleOf("font-size: 13px; color: #706473")}>
                  {"/ˈɪn.frəˌstrʌk.tʃər/ · "}
                  <i>{"n"}</i>
                </div>
                {"\n"}
                <div style={styleOf("font-weight: 600")}>{"cơ sở hạ tầng"}</div>
                {"\n"}
                <div
                  style={styleOf(
                    "font-size: 13px; color: #706473; background: #F6F4EF; border-radius: 10px; padding: 10px 12px; margin-top: 8px",
                  )}
                >
                  {"Rural areas still lack basic digital infrastructure."}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
          {"\n"}
          <section
            id={"bai-mau"}
            style={styleOf(
              "max-width: 1200px; margin: 0 auto; padding: 36px 24px",
            )}
          >
            {"\n"}
            <div
              style={styleOf(
                "display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px",
              )}
            >
              {"\n"}
              <div>
                {"\n"}
                <h2
                  style={styleOf(
                    "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                  )}
                >
                  {"Bài mẫu"}
                </h2>
                {"\n"}
                <p style={styleOf("margin: 4px 0 0; color: #706473")}>
                  {
                    "Bài mẫu band 7.5+ theo đề thi thật, kèm dàn ý và mạch ý tưởng."
                  }
                </p>
                {"\n"}
              </div>
              {"\n"}
              <a
                href={"#"}
                style={styleOf(
                  "display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 15px; color: #352637; text-decoration: none",
                )}
              >
                {"Xem thêm "}
                <svg
                  width={"16"}
                  height={"16"}
                  viewBox={"0 0 24 24"}
                  fill={"none"}
                  stroke={"currentColor"}
                  strokeWidth={"2.2"}
                  strokeLinecap={"round"}
                  strokeLinejoin={"round"}
                >
                  <path d={"M9 6l6 6-6 6"}></path>
                </svg>
              </a>
              {"\n"}
            </div>
            {"\n"}
            <div
              style={styleOf(
                "display: flex; gap: 28px 20px; overflow-x: auto; scroll-snap-type: x proximity; padding: 4px 4px 12px; margin: -4px",
              )}
            >
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #F7C4B6",
                  )}
                ></div>
                <div
                  style={styleOf(
                    "display: flex; flex-direction: column; gap: 8px; padding: 4px 8px 0",
                  )}
                >
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                    )}
                  >
                    {"Museum Visitors"}
                  </div>
                  <div style={styleOf("display: flex")}>
                    <span
                      style={styleOf(
                        "padding: 4px 12px; border-radius: 999px; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; line-height: 1.4",
                      )}
                    >
                      {"Line graph"}
                    </span>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                  )}
                >
                  <span>{"Writing Task 1"}</span>
                  <span
                    aria-hidden={"true"}
                    style={styleOf(
                      "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                    )}
                  ></span>
                  <span>{"Band 8.0"}</span>
                </div>
                <a
                  href={"SampleWriting.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài mẫu"}
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
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #BFD8F7",
                  )}
                ></div>
                <div
                  style={styleOf(
                    "display: flex; flex-direction: column; gap: 8px; padding: 4px 8px 0",
                  )}
                >
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                    )}
                  >
                    {"Library Redevelopment"}
                  </div>
                  <div style={styleOf("display: flex")}>
                    <span
                      style={styleOf(
                        "padding: 4px 12px; border-radius: 999px; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; line-height: 1.4",
                      )}
                    >
                      {"Map"}
                    </span>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                  )}
                >
                  <span>{"Writing Task 1"}</span>
                  <span
                    aria-hidden={"true"}
                    style={styleOf(
                      "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                    )}
                  ></span>
                  <span>{"Band 8.0"}</span>
                </div>
                <a
                  href={"SampleWriting.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài mẫu"}
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
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5CEF5",
                  )}
                ></div>
                <div
                  style={styleOf(
                    "display: flex; flex-direction: column; gap: 8px; padding: 4px 8px 0",
                  )}
                >
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                    )}
                  >
                    {"Household Energy"}
                  </div>
                  <div style={styleOf("display: flex")}>
                    <span
                      style={styleOf(
                        "padding: 4px 12px; border-radius: 999px; background: #E8E4FA; color: #5543B0; font-size: 13px; font-weight: 600; line-height: 1.4",
                      )}
                    >
                      {"Bar chart"}
                    </span>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                  )}
                >
                  <span>{"Writing Task 1"}</span>
                  <span
                    aria-hidden={"true"}
                    style={styleOf(
                      "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                    )}
                  ></span>
                  <span>{"Band 7.5"}</span>
                </div>
                <a
                  href={"SampleWriting.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài mẫu"}
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
              {"\n"}
              <div
                style={styleOf(
                  "flex: 1 0 240px; scroll-snap-align: start; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 16px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; color: #352637; text-decoration: none; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07)",
                )}
              >
                <div
                  style={styleOf(
                    "position: relative; aspect-ratio: 3 / 2; max-width: 100%; border-radius: 12px; overflow: hidden; background: #C5DECE",
                  )}
                ></div>
                <div
                  style={styleOf(
                    "display: flex; flex-direction: column; gap: 8px; padding: 4px 8px 0",
                  )}
                >
                  <div
                    style={styleOf(
                      "font-size: 18px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em",
                    )}
                  >
                    {"Education (Free University)"}
                  </div>
                  <div style={styleOf("display: flex")}>
                    <span
                      style={styleOf(
                        "padding: 4px 12px; border-radius: 999px; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; line-height: 1.4",
                      )}
                    >
                      {"Discuss Both Views"}
                    </span>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; align-items: center; gap: 8px; padding: 0 8px; font-size: 14px; color: #706473",
                  )}
                >
                  <span>{"Writing Task 2"}</span>
                  <span
                    aria-hidden={"true"}
                    style={styleOf(
                      "width: 4px; height: 4px; border-radius: 50%; background: #B3A9B5",
                    )}
                  ></span>
                  <span>{"Band 8.0"}</span>
                </div>
                <a
                  href={"SampleWriting.dc.html"}
                  style={styleOf(
                    "margin-top: auto; padding: 4px 8px 0; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 15px; color: #2963CC; text-decoration: none",
                  )}
                >
                  {"Xem bài mẫu"}
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
              {"\n"}
            </div>
            {"\n"}
          </section>
          {"\n\n"}
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
                    href={"#"}
                    style={styleOf("color: #4B3D4D; text-decoration: none")}
                  >
                    {"Đăng ký"}
                  </a>
                  <a
                    href={"#"}
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

export default StudentLanding;
