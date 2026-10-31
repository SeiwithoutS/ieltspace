import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class SpeakingTest extends React.Component {
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
    var fm = { PracticeWS: "Luyện tập" };
    var sel =
      (this.state && this.state.sel) ||
      fm[from] ||
      this.props.cheDo ||
      "Bài thi đầy đủ";
    return {
      accent: accent,
      onAccent: lum > 0.6 ? "#1A1A1A" : "#FFFFFF",
      v0: sel === "Bài thi đầy đủ",
      v1: sel === "Luyện tập",
    };
  }

  static defaultProps = { cheDo: "Bài thi đầy đủ", accent: "#2963CC" };
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 790px",
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
                    "padding: 0 32px; min-height: 68px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px",
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
                  <div
                    style={styleOf(
                      "padding-left: 20px; border-left: 1.5px solid #E6E4E0",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Thư viện đề / Practice Test 01 / Speaking"}
                    </div>
                    <div style={styleOf("font-weight: 600")}>
                      {"Speaking · Practice Test 01 · bài thi đầy đủ"}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "margin-left: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 10px",
                    )}
                  >
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #6A5D6C; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                      {"Đã tự lưu Part 1"}
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                        <circle cx={"12"} cy={"12"} r={"9"}></circle>
                        <path d={"M12 7v5l3 2"}></path>
                      </svg>
                      {"01:12"}
                    </span>
                    <a
                      href={"SubmitDialogs.dc.html"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                      )}
                    >
                      {"Lưu và thoát"}
                    </a>
                    <a
                      href={"SubmitDialogs.dc.html"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                          v.accent +
                          "; color: " +
                          v.onAccent +
                          "; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                      )}
                    >
                      {"Hoàn thành"}
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
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </header>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; align-items: stretch; background: #FAF9F5; min-height: 700px",
                )}
              >
                <div
                  style={styleOf(
                    "flex: 1 1 420px; padding: 28px 32px; border-right: 1.5px solid #D6D4D0",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; ",
                    )}
                  >
                    <div style={styleOf("display: flex; gap: 8px")}>
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
                        {"Part 1"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #352637; color: #FFFFFF; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                        )}
                      >
                        {"Part 2"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                        )}
                      >
                        {"Part 3"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 12px; ",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473",
                          )}
                        >
                          {"Part 2 · cue card"}
                        </div>
                        <h2
                          style={styleOf(
                            "margin: 0; font-size: 22px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"Describe a skill you would like to learn"}
                        </h2>
                        <div
                          style={styleOf(
                            "font-size: 16px; line-height: 1.8; color: #352637",
                          )}
                        >
                          {"You should say:"}
                          <ul
                            style={styleOf(
                              "margin: 6px 0 6px 18px; padding: 0",
                            )}
                          >
                            <li>{"what the skill is"}</li>
                            <li>{"why you want to learn it"}</li>
                            <li>{"how you would learn it"}</li>
                          </ul>
                          {"and explain how it would help you in the future."}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 8px; align-items: flex-start",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                              <circle cx={"12"} cy={"12"} r={"9"}></circle>
                              <path d={"M12 7v5l3 2"}></path>
                            </svg>
                            {"Chuẩn bị 1 phút"}
                          </span>
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                              <rect
                                x={"9"}
                                y={"3"}
                                width={"6"}
                                height={"11"}
                                rx={"3"}
                              ></rect>
                              <path d={"M5 11a7 7 0 0 0 14 0M12 18v3"}></path>
                            </svg>
                            {"Nói 1 đến 2 phút"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
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
                      <span>
                        {
                          "Trình duyệt chưa cho phép dùng micro? Bấm biểu tượng ổ khóa trên thanh địa chỉ và cho phép micro. Phần Speaking chỉ bắt đầu khi ghi âm được."
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styleOf("flex: 1 1 420px; padding: 28px 32px")}>
                  <div
                    style={styleOf(
                      "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 14px; ",
                      )}
                    >
                      <div style={styleOf("font-weight: 600")}>
                        {"Ghi âm câu trả lời"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; justify-content: center; gap: 4px; height: 120px; border-radius: 18px; background: #E8E4FA; border: 1.5px solid #D6D4D0",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 10px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 22px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 34px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 18px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 40px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 26px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 12px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 30px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 44px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 20px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 36px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 14px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 28px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 38px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 16px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 24px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 32px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 12px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 26px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 18px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 34px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 22px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 10px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 28px",
                          )}
                        ></span>
                      </div>
                      <div
                        style={styleOf(
                          "text-align: center; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"01:12"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 14px; align-items: center; justify-content: center",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 64px; height: 64px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #B23A24; color: #FFFFFF; display: flex; align-items: center; justify-content: center",
                          )}
                          role={"img"}
                          aria-label={"Đang ghi"}
                        >
                          <span
                            style={styleOf(
                              "width: 20px; height: 20px; border-radius: 5px; background: #FFFFFF",
                            )}
                          ></span>
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 13px; color: #706473; text-align: center",
                        )}
                      >
                        {
                          "Bài thi đầy đủ: mỗi Part chỉ ghi âm một lần, không ghi lại. Hoàn thành xong, bài được lưu 14 ngày và bạn có thể gửi yêu cầu chấm."
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {v.v1 ? (
            <>
              <header
                style={styleOf(
                  "border-bottom: 1.5px solid #D6D4D0; background: #FCFBF7",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 0 32px; min-height: 68px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px",
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
                  <div
                    style={styleOf(
                      "padding-left: 20px; border-left: 1.5px solid #E6E4E0",
                    )}
                  >
                    <div style={styleOf("font-size: 13px; color: #706473")}>
                      {"Luyện Speaking / Part 2"}
                    </div>
                    <div style={styleOf("font-weight: 600")}>
                      {"Luyện Speaking · Part 2 · A skill worth learning"}
                    </div>
                  </div>
                  <div
                    style={styleOf(
                      "margin-left: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 10px",
                    )}
                  >
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #6A5D6C; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                      {"Đã tự lưu Part 1"}
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                        <circle cx={"12"} cy={"12"} r={"9"}></circle>
                        <path d={"M12 7v5l3 2"}></path>
                      </svg>
                      {"01:12"}
                    </span>
                    <a
                      href={"SubmitDialogs.dc.html"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                      )}
                    >
                      {"Lưu và thoát"}
                    </a>
                    <a
                      href={"SubmitDialogs.dc.html"}
                      style={styleOf(
                        "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: " +
                          v.accent +
                          "; color: " +
                          v.onAccent +
                          "; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                      )}
                    >
                      {"Hoàn thành"}
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
                        <path d={"M5 12h14M13 6l6 6-6 6"}></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </header>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; align-items: stretch; background: #FAF9F5; min-height: 700px",
                )}
              >
                <div
                  style={styleOf(
                    "flex: 1 1 420px; padding: 28px 32px; border-right: 1.5px solid #D6D4D0",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; ",
                    )}
                  >
                    <div style={styleOf("display: flex; gap: 8px")}>
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
                        {"Part 1"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #352637; color: #FFFFFF; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                        )}
                      >
                        {"Part 2"}
                      </span>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                        )}
                      >
                        {"Part 3"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                      )}
                    >
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 12px; ",
                        )}
                      >
                        <div
                          style={styleOf(
                            "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473",
                          )}
                        >
                          {"Part 2 · cue card"}
                        </div>
                        <h2
                          style={styleOf(
                            "margin: 0; font-size: 22px; letter-spacing: -0.015em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"Describe a skill you would like to learn"}
                        </h2>
                        <div
                          style={styleOf(
                            "font-size: 16px; line-height: 1.8; color: #352637",
                          )}
                        >
                          {"You should say:"}
                          <ul
                            style={styleOf(
                              "margin: 6px 0 6px 18px; padding: 0",
                            )}
                          >
                            <li>{"what the skill is"}</li>
                            <li>{"why you want to learn it"}</li>
                            <li>{"how you would learn it"}</li>
                          </ul>
                          {"and explain how it would help you in the future."}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 8px; align-items: flex-start",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                              <circle cx={"12"} cy={"12"} r={"9"}></circle>
                              <path d={"M12 7v5l3 2"}></path>
                            </svg>
                            {"Chuẩn bị 1 phút"}
                          </span>
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                              <rect
                                x={"9"}
                                y={"3"}
                                width={"6"}
                                height={"11"}
                                rx={"3"}
                              ></rect>
                              <path d={"M5 11a7 7 0 0 0 14 0M12 18v3"}></path>
                            </svg>
                            {"Nói 1 đến 2 phút"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
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
                      <span>
                        {
                          "Trình duyệt chưa cho phép dùng micro? Bấm biểu tượng ổ khóa trên thanh địa chỉ và cho phép micro. Phần Speaking chỉ bắt đầu khi ghi âm được."
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styleOf("flex: 1 1 420px; padding: 28px 32px")}>
                  <div
                    style={styleOf(
                      "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 14px; ",
                      )}
                    >
                      <div style={styleOf("font-weight: 600")}>
                        {"Ghi âm câu trả lời"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; align-items: center; justify-content: center; gap: 4px; height: 120px; border-radius: 18px; background: #E8E4FA; border: 1.5px solid #D6D4D0",
                        )}
                      >
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 10px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 22px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 34px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 18px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 40px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 26px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 12px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 30px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 44px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 20px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 36px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 14px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 28px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 38px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 16px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 24px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 32px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 12px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 26px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 18px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 34px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 22px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 10px",
                          )}
                        ></span>
                        <span
                          style={styleOf(
                            "width: 4px; border-radius: 2px; background: #5543B0; height: 28px",
                          )}
                        ></span>
                      </div>
                      <div
                        style={styleOf(
                          "text-align: center; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                        )}
                      >
                        {"01:12"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; gap: 14px; align-items: center; justify-content: center",
                        )}
                      >
                        <a
                          href={"#"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
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
                            <path d={"M8 5l11 7-11 7z"}></path>
                          </svg>
                          {"Nghe lại"}
                        </a>
                        <a
                          href={"#"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
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
                            <path d={"M21 12a9 9 0 1 1-3-6.7L21 8"}></path>
                            <path d={"M21 3v5h-5"}></path>
                          </svg>
                          {"Ghi lại Part này"}
                        </a>
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 13px; color: #706473; text-align: center",
                        )}
                      >
                        {
                          "Bài luyện: bạn được ghi lại Part này trước khi hoàn thành, chỉ bản ghi cuối cùng được lưu. Kết quả chấm là đánh giá cho Part 2, không phải band toàn kỹ năng."
                        }
                      </div>
                    </div>
                  </div>
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

export default SpeakingTest;
