import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class ResultLR extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1120px",
          )}
        >
          {"\n"}
          <LearnerHeader active="exams" />
          <div style={styleOf("background: #FCFBF7; min-height: 1051px")}>
            <main
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 36px 24px 56px; display: flex; flex-direction: column; gap: 24px",
              )}
            >
              <div style={styleOf("font-size:13px;color:#706473")}>
                {"Kết quả / Practice Test 01 / Reading"}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="m-0 text-2xl sm:text-[28px] font-bold font-serif leading-tight text-[#352637]">
                    {"Kết quả Reading"}
                  </h1>
                  <div className="text-sm sm:text-base text-[#706473] mt-1">
                    {"Nộp lúc 09:42, 07/10/2026"}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={"ReadingTest.dc.html"}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#F3F0EA]"
                  >
                    {"Làm lại"}
                  </a>
                  <a
                    href={"ResultsHistory.dc.html"}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-[1.5px] border-[#352637] bg-[#352637] text-white font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#221824]"
                  >
                    {"Về lịch sử"}
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-[22px] border-[1.5px] border-[#D6D4D0] bg-white shadow-sm overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#D6D4D0]">
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Band</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">6.5</div>
                  <div className="text-xs sm:text-[13px] text-[#706473]">Reading</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Đúng</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">29/40</div>
                  <div className="text-xs sm:text-[13px] text-[#706473]">72%</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Thời gian</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">52:10</div>
                  <div className="text-xs sm:text-[13px] text-[#706473]">trên 60 phút</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Lần làm</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">2</div>
                  <div className="text-xs sm:text-[13px] text-[#706473]">điểm tăng 0.5</div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:flex-[1.6] min-w-0">
                  <div
                    style={styleOf(
                      "padding: 0px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow:hidden",
                    )}
                  >
                    <div
                      style={styleOf(
                        "padding:18px 24px 14px;font-size:18px;font-weight:600",
                      )}
                    >
                      {"Lời giải từng câu"}
                    </div>
                    <div
                      style={styleOf(
                        "display:flex;gap:14px;padding:16px 24px;border-top:1px solid #E6E4E0",
                      )}
                    >
                      <span style={styleOf("font-weight:700;width:28px")}>
                        {"1"}
                      </span>
                      <div
                        style={styleOf(
                          "flex:1;display:flex;flex-direction:column;gap:4px",
                        )}
                      >
                        <div style={styleOf("font-size:14px")}>
                          <b>{"Bạn chọn:"}</b>
                          {" B"}
                        </div>
                        <div style={styleOf("font-size:13px;color:#706473")}>
                          {
                            "Đoạn 1 nói công viên giúp giảm căng thẳng, trùng với phương án B."
                          }
                        </div>
                      </div>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                        {"Đúng"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display:flex;gap:14px;padding:16px 24px;border-top:1px solid #E6E4E0",
                      )}
                    >
                      <span style={styleOf("font-weight:700;width:28px")}>
                        {"2"}
                      </span>
                      <div
                        style={styleOf(
                          "flex:1;display:flex;flex-direction:column;gap:4px",
                        )}
                      >
                        <div style={styleOf("font-size:14px")}>
                          <b>{"Bạn chọn:"}</b>
                          {" False"}
                        </div>
                        <div style={styleOf("font-size:13px")}>
                          <b>{"Đáp án đúng:"}</b>
                          {" Not Given"}
                        </div>
                        <div style={styleOf("font-size:13px;color:#706473")}>
                          {
                            "Bài đọc không nhắc đến chi phí bảo trì cụ thể, nên đáp án là Not Given."
                          }
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
                          <path d={"M6 6l12 12M18 6L6 18"}></path>
                        </svg>
                        {"Sai"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display:flex;gap:14px;padding:16px 24px;border-top:1px solid #E6E4E0",
                      )}
                    >
                      <span style={styleOf("font-weight:700;width:28px")}>
                        {"3"}
                      </span>
                      <div
                        style={styleOf(
                          "flex:1;display:flex;flex-direction:column;gap:4px",
                        )}
                      >
                        <div style={styleOf("font-size:14px")}>
                          <b>{"Bạn chọn:"}</b>
                          {" volunteers"}
                        </div>
                        <div style={styleOf("font-size:13px;color:#706473")}>
                          {"Dự án do tình nguyện viên quản lý (đoạn 2)."}
                        </div>
                      </div>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                        {"Đúng"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display:flex;gap:14px;padding:16px 24px;border-top:1px solid #E6E4E0",
                      )}
                    >
                      <span style={styleOf("font-weight:700;width:28px")}>
                        {"4"}
                      </span>
                      <div
                        style={styleOf(
                          "flex:1;display:flex;flex-direction:column;gap:4px",
                        )}
                      >
                        <div style={styleOf("font-size:14px")}>
                          <b>{"Bạn chọn:"}</b>
                          {" C"}
                        </div>
                        <div style={styleOf("font-size:13px")}>
                          <b>{"Đáp án đúng:"}</b>
                          {" A"}
                        </div>
                        <div style={styleOf("font-size:13px;color:#706473")}>
                          {
                            'Từ khóa "benefits to public health" nằm ở đoạn cuối, khớp phương án A.'
                          }
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
                          <path d={"M6 6l12 12M18 6L6 18"}></path>
                        </svg>
                        {"Sai"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:flex-1 min-w-0 order-first lg:order-none">
                  <div className="p-5 sm:p-6 rounded-[22px] border-[1.5px] border-[#D6D4D0] bg-white shadow-sm flex flex-col gap-3">
                    <div className="font-semibold text-lg text-[#352637]">
                      {"Theo dạng câu hỏi"}
                    </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 16px; align-items: center",
                        )}
                      >
                        <div style={styleOf("width:170px;font-size:14px")}>
                          {"Multiple Choice"}
                        </div>
                        <div style={styleOf("flex:1")}>
                          <div
                            style={styleOf(
                              "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                            )}
                          >
                            <div
                              style={styleOf(
                                "width: 80%; height: 100%; background: #2E6A48",
                              )}
                            ></div>
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "font-weight:600;font-size:14px;width:44px;text-align:right",
                          )}
                        >
                          {"8/10"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 16px; align-items: center",
                        )}
                      >
                        <div style={styleOf("width:170px;font-size:14px")}>
                          {"True / False / NG"}
                        </div>
                        <div style={styleOf("flex:1")}>
                          <div
                            style={styleOf(
                              "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                            )}
                          >
                            <div
                              style={styleOf(
                                "width: 50%; height: 100%; background: #2E6A48",
                              )}
                            ></div>
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "font-weight:600;font-size:14px;width:44px;text-align:right",
                          )}
                        >
                          {"5/10"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 16px; align-items: center",
                        )}
                      >
                        <div style={styleOf("width:170px;font-size:14px")}>
                          {"Matching Headings"}
                        </div>
                        <div style={styleOf("flex:1")}>
                          <div
                            style={styleOf(
                              "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                            )}
                          >
                            <div
                              style={styleOf(
                                "width: 70%; height: 100%; background: #2E6A48",
                              )}
                            ></div>
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "font-weight:600;font-size:14px;width:44px;text-align:right",
                          )}
                        >
                          {"7/10"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 16px; align-items: center",
                        )}
                      >
                        <div style={styleOf("width:170px;font-size:14px")}>
                          {"Completion"}
                        </div>
                        <div style={styleOf("flex:1")}>
                          <div
                            style={styleOf(
                              "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                            )}
                          >
                            <div
                              style={styleOf(
                                "width: 90%; height: 100%; background: #2E6A48",
                              )}
                            ></div>
                          </div>
                        </div>
                        <span
                          style={styleOf(
                            "font-weight:600;font-size:14px;width:44px;text-align:right",
                          )}
                        >
                          {"9/10"}
                        </span>
                      </div>
                      <a
                        href={"QTPractice.dc.html"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                        )}
                      >
                        {"Luyện thêm dạng yếu"}
                      </a>
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

export default ResultLR;
