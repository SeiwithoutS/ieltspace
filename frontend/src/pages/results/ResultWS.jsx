import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
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
          <LearnerHeader active="exams" />
          <div style={styleOf("background: #FCFBF7; min-height: 1111px")}>
            <main
              style={styleOf(
                "max-width: 1200px; margin: 0 auto; padding: 36px 24px 56px; display: flex; flex-direction: column; gap: 24px",
              )}
            >
              <div style={styleOf("font-size: 13px; color: #706473")}>
                <a
                  href={"MyWS.dc.html"}
                  style={styleOf("color: #706473; text-decoration: none")}
                >
                  {"Bài Writing và Speaking của tôi"}
                </a>
                {" / Practice Test 01 / Writing Task 2"}
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3.5">
                <div>
                  <h1 className="m-0 text-2xl sm:text-[28px] font-bold font-serif leading-tight text-[#352637]">
                    {"Kết quả Writing Task 2"}
                  </h1>
                  <div className="text-sm sm:text-base text-[#706473] mt-1">
                    {"Public transport and traffic"}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-[#D6D4D0] bg-[#DCEDE2] text-[#2E6A48] text-xs font-semibold whitespace-nowrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                    Đã có kết quả
                  </span>
                  <a
                    href={"#"}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#F3F0EA]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                    </svg>
                    Tải .docx
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-[22px] border-[1.5px] border-[#D6D4D0] bg-white shadow-sm overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#D6D4D0]">
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Điểm Task 2</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">6.5</div>
                  <div className="text-xs text-[#706473]">đánh giá cho Task 2, không phải band toàn kỹ năng</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Số từ</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">271</div>
                  <div className="text-xs text-[#706473]">yêu cầu từ 250</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Công bố</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-mono text-[#352637]">22/10/2026</div>
                  <div className="text-xs text-[#706473]">yêu cầu đã dùng 1 lượt miễn phí</div>
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-1">
                  <div className="text-xs sm:text-[13px] text-[#706473]">Nội dung bài</div>
                  <div className="text-2xl sm:text-[28px] font-bold font-serif text-[#352637]">đến 05/11</div>
                  <div className="text-xs text-[#706473]">sau đó chỉ còn điểm và nhận xét</div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:flex-[1.5] min-w-0 flex flex-col gap-6">
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
                      <div style={styleOf("font-size: 18px; font-weight: 600")}>
                        {"Bài làm kèm nhận xét"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 15px; line-height: 1.85; color: #352637",
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
                <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                  <div
                    style={styleOf(
                      "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "font-size: 18px; font-weight: 600; margin-bottom: 6px",
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
                      <div style={styleOf("font-size: 18px; font-weight: 600")}>
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
                      <div style={styleOf("font-size: 14px; color: #4B3D4D")}>
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
                      <div style={styleOf("font-size: 18px; font-weight: 600")}>
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
