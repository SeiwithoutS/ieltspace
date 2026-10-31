import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class ListeningTest extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 900px",
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
                "padding: 0 32px; height: 68px; display: flex; align-items: center; gap: 20px",
              )}
            >
              <a
                href={"StudentHome.dc.html"}
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
                  {"Luyện thi / Practice Test 01 / Listening"}
                </div>
                <div style={styleOf("font-weight: 600")}>
                  {"Listening · Practice Test 01"}
                </div>
              </div>
              <div
                style={styleOf(
                  "margin-left: auto; display: flex; align-items: center; gap: 10px",
                )}
              >
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
                  {"24:36"}
                </span>
                <a
                  href={"ExamDetail.dc.html"}
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
                  {"Nộp bài"}
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
              "display: flex; align-items: stretch; background: #FAF9F5",
            )}
          >
            <div
              style={styleOf(
                "flex: 1.15 1 0; padding: 28px 32px; border-right: 1.5px solid #D6D4D0",
              )}
            >
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 16px; ",
                )}
              >
                <div style={styleOf("display:flex;gap:8px")}>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #352637; background: #352637; color: #FFFFFF; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Phần 1"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Phần 2"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Phần 3"}
                  </span>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                    )}
                  >
                    {"Phần 4"}
                  </span>
                </div>
                <div
                  style={styleOf(
                    "padding: 24px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; gap: 16px; align-items: center",
                      )}
                    >
                      <div style={styleOf("flex:1")}>
                        <div
                          style={styleOf(
                            "font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#706473",
                          )}
                        >
                          {"Section 1"}
                        </div>
                        <div style={styleOf("font-size:18px;font-weight:700")}>
                          {"Booking a guided tour"}
                        </div>
                      </div>
                      <span
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #DDE8FC; color: #2A55B8; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                          <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                          <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                        </svg>
                        {"Bài thi đầy đủ: audio phát một lần"}
                      </span>
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; gap: 16px; align-items: center",
                      )}
                    >
                      <span
                        style={styleOf(
                          "width:46px;height:46px;border-radius:50%;border:1.5px solid #352637;background:#352637;color:#FFFFFF;display:flex;align-items:center;justify-content:center",
                        )}
                      >
                        <svg
                          width={"20"}
                          height={"20"}
                          viewBox={"0 0 24 24"}
                          fill={"none"}
                          stroke={"currentColor"}
                          strokeWidth={"2"}
                          strokeLinecap={"round"}
                          strokeLinejoin={"round"}
                          aria-hidden={"true"}
                        >
                          <path d={"M8 5v14M16 5v14"}></path>
                        </svg>
                      </span>
                      <div
                        style={styleOf(
                          "flex:1;display:flex;flex-direction:column;gap:6px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 27%; height: 100%; background: #2A55B8",
                            )}
                          ></div>
                        </div>
                        <div
                          style={styleOf(
                            "display:flex;justify-content:space-between;font-size:12.5px;color:#706473",
                          )}
                        >
                          <span>{"01:42"}</span>
                          <span>{"06:20"}</span>
                        </div>
                      </div>
                      <span
                        style={styleOf(
                          "display:flex;align-items:center;gap:8px;color:#6A5D6C",
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
                          <path d={"M4 9v6h4l5 4V5L8 9z"}></path>
                          <path d={"M16 9a4 4 0 0 1 0 6"}></path>
                        </svg>
                        <span style={styleOf("width:80px")}>
                          <div
                            style={styleOf(
                              "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                            )}
                          >
                            <div
                              style={styleOf(
                                "width: 70%; height: 100%; background: #6A5D6C",
                              )}
                            ></div>
                          </div>
                        </span>
                      </span>
                    </div>
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
                    <div
                      style={styleOf(
                        "font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #706473",
                      )}
                    >
                      {"Questions 1 to 6"}
                    </div>
                    <div style={styleOf("font-size: 17px; font-weight: 600")}>
                      {
                        "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER."
                      }
                    </div>
                    <div
                      style={styleOf(
                        "padding: 18px; border-radius: 12px; border: 1px solid #DDDBD7; background: #FAF9F5; display: flex; flex-direction: column; gap: 10px; font-size: 15px",
                      )}
                    >
                      <div>
                        <b>{"Tour name:"}</b>
                        {" Old Town Walk"}
                      </div>
                      <div>
                        <b>{"Day:"}</b>
                        {" 1 "}
                        <span
                          style={styleOf(
                            "display:inline-block;min-width:110px;border-bottom:1.5px solid #D6D4D0;padding:0 6px;font-weight:600",
                          )}
                        >
                          {"Saturday"}
                        </span>
                      </div>
                      <div>
                        <b>{"Meeting point:"}</b>
                        {" 2 "}
                        <span
                          style={styleOf(
                            "display:inline-block;min-width:110px;border-bottom:1.5px solid #D6D4D0;padding:0 6px;color:#B3A9B5",
                          )}
                        >
                          {"nhập đáp án"}
                        </span>
                        {" entrance"}
                      </div>
                      <div>
                        <b>{"Cost per person:"}</b>
                        {" £ 3 "}
                        <span
                          style={styleOf(
                            "display:inline-block;min-width:80px;border-bottom:1.5px solid #D6D4D0;padding:0 6px;font-weight:600",
                          )}
                        >
                          {"12"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={styleOf("flex: 1 1 0; padding: 28px 32px")}>
              <div
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 16px; ",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 18px 20px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF",
                  )}
                >
                  <div style={styleOf("display: flex; gap: 12px")}>
                    <span style={styleOf("font-weight: 700")}>{"4."}</span>
                    <div style={styleOf("flex: 1")}>
                      <div>{"What should visitors bring?"}</div>
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 8px; margin-top: 10px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #E3ECFD; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #352637; background: #352637; flex: 0 0 18px",
                            )}
                          ></span>
                          {"Comfortable shoes"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"A camera"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"Cash only"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "padding: 18px 20px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF",
                  )}
                >
                  <div style={styleOf("display: flex; gap: 12px")}>
                    <span style={styleOf("font-weight: 700")}>{"5."}</span>
                    <div style={styleOf("flex: 1")}>
                      <div>{"The guide recommends booking"}</div>
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 8px; margin-top: 10px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"online"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #E3ECFD; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #352637; background: #352637; flex: 0 0 18px",
                            )}
                          ></span>
                          {"by phone"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"at the station"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={styleOf(
                    "padding: 18px 20px; border: 1.5px solid #D6D4D0; border-radius: 18px; background: #FFFFFF",
                  )}
                >
                  <div style={styleOf("display: flex; gap: 12px")}>
                    <span style={styleOf("font-weight: 700")}>{"6."}</span>
                    <div style={styleOf("flex: 1")}>
                      <div>{"Which building will the group visit first?"}</div>
                      <div
                        style={styleOf(
                          "display: flex; flex-direction: column; gap: 8px; margin-top: 10px",
                        )}
                      >
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"The old library"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"City museum"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #DDDBD7; background: #FFFFFF; font-size: 14.5px",
                          )}
                        >
                          <span
                            style={styleOf(
                              "width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #D6D4D0; background: #FFFFFF; flex: 0 0 18px",
                            )}
                          ></span>
                          {"Town hall"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={styleOf(
              "border-top: 1.5px solid #D6D4D0; background: #FCFBF7; padding: 12px 32px; display: flex; align-items: center; gap: 14px",
            )}
          >
            <span
              style={styleOf(
                "font-size: 13px; color: #706473; white-space: nowrap",
              )}
            >
              {"Câu hỏi"}
            </span>
            <div style={styleOf("display: flex; gap: 6px; flex-wrap: wrap")}>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #DDE8FC; color: #2A55B8",
                )}
              >
                {"1"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #DDE8FC; color: #2A55B8",
                )}
              >
                {"2"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #352637; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #352637; color: #FFFFFF",
                )}
              >
                {"3"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #DDE8FC; color: #2A55B8",
                )}
              >
                {"4"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #DDE8FC; color: #2A55B8",
                )}
              >
                {"5"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"6"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"7"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"8"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"9"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"10"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"11"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"12"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"13"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"14"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"15"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"16"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"17"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"18"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"19"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"20"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"21"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"22"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"23"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"24"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"25"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"26"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"27"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"28"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"29"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"30"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"31"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"32"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"33"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"34"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"35"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"36"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"37"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"38"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"39"}
              </span>
              <span
                style={styleOf(
                  "width: 30px; height: 30px; flex: 0 0 30px; border-radius: 8px; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 600; background: #FFFFFF; color: #352637",
                )}
              >
                {"40"}
              </span>
            </div>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default ListeningTest;
