import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class Flashcard extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 880px",
          )}
        >
          {"\n"}
          <LearnerHeader active="flashcard" />
          <div style={styleOf("background: #FCFBF7; min-height: 811px")}>
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
                    {"Flashcard của tôi"}
                  </h1>
                  <div
                    style={styleOf(
                      "font-size: 15px; color: #706473; margin-top: 4px",
                    )}
                  >
                    {
                      "Ôn theo chủ đề, danh sách yêu thích hoặc nhãn bạn tự đặt."
                    }
                  </div>
                </div>
                <div style={styleOf("display: flex; gap: 10px")}>
                  <a
                    href={"#"}
                    style={styleOf(
                      "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                    )}
                  >
                    {"Kết thúc phiên"}
                  </a>
                </div>
              </div>
              <div
                style={styleOf(
                  "display: flex; flex-wrap: wrap; gap: 28px; justify-content: center; align-items: flex-start",
                )}
              >
                <div
                  style={styleOf(
                    "padding: 32px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); flex: 1 1 460px; max-width: 600px",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #706473; text-align: center",
                      )}
                    >
                      {"Từ yêu thích · thẻ 3 trên 12"}
                    </div>
                    <div
                      style={styleOf(
                        "min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px",
                      )}
                    >
                      <div
                        style={styleOf(
                          "font-size: 40px; font-weight: 700; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                        )}
                      >
                        {"mitigate"}
                      </div>
                      <div style={styleOf("color: #706473")}>
                        {"/ˈmɪtɪɡeɪt/ · v"}
                      </div>
                      <button
                        type={"button"}
                        style={styleOf(
                          "margin-top: 6px; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 10px; border: 1.5px solid #D6D4D0; background: #FFFFFF; font-weight: 600; font-family: inherit; font-size: 14px",
                        )}
                      >
                        {"Lật thẻ"}
                      </button>
                    </div>
                    <div
                      style={styleOf(
                        "padding: 14px 16px; border-radius: 12px; background: #E3ECFD; border: 1.5px solid #D6D4D0; text-align: center",
                      )}
                    >
                      <div style={styleOf("font-weight: 700; font-size: 18px")}>
                        {"giảm nhẹ"}
                      </div>
                      <div
                        style={styleOf(
                          "font-size: 14px; color: #706473; font-style: italic",
                        )}
                      >
                        {"Trees help mitigate the effects of heat."}
                      </div>
                    </div>
                    <div
                      style={styleOf(
                        "font-size: 13px; color: #706473; text-align: center",
                      )}
                    >
                      {"Bạn nhớ từ này đến đâu?"}
                    </div>
                    <div
                      style={styleOf(
                        "display: flex; gap: 10px; align-items: flex-start",
                      )}
                    >
                      <a
                        href={"#"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                        )}
                      >
                        {"Chưa nhớ"}
                      </a>
                      <a
                        href={"#"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                        )}
                      >
                        {"Còn phân vân"}
                      </a>
                      <a
                        href={"#"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; padding: 0 20px; width: 100%; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                          <path d={"M5 12.5l4.5 4.5L19 7"}></path>
                        </svg>
                        {"Đã nhớ"}
                      </a>
                    </div>
                  </div>
                </div>
                <div style={styleOf("flex: 0 1 360px")}>
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 20px; ",
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
                          style={styleOf("font-size: 18px; font-weight: 600")}
                        >
                          {"Chọn tập thẻ"}
                        </div>
                        <div
                          style={styleOf(
                            "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                            )}
                          >
                            {"Chủ đề"}
                          </span>
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600",
                            )}
                          >
                            {"Từ yêu thích"}
                          </span>
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500",
                            )}
                          >
                            {"Theo nhãn"}
                          </span>
                        </div>
                        <div style={styleOf("font-size: 14px; color: #706473")}>
                          {"12 từ yêu thích"}
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
                          "display: flex; flex-direction: column; gap: 12px; ",
                        )}
                      >
                        <div
                          style={styleOf("font-size: 18px; font-weight: 600")}
                        >
                          {"Phiên ôn hiện tại"}
                        </div>
                        <div
                          style={styleOf(
                            "height: 8px; border-radius: 4px; background: #F3F0EA; border: 1px solid #DDDBD7; overflow: hidden",
                          )}
                        >
                          <div
                            style={styleOf(
                              "width: 25%; height: 100%; background: " +
                                v.accent,
                            )}
                          ></div>
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 16px; align-items: flex-start",
                          )}
                        >
                          <div style={styleOf("flex: 1")}>
                            <div
                              style={styleOf(
                                "font-size: 28px; font-weight: 700; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                              )}
                            >
                              {"3/12"}
                            </div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"thẻ đã xem"}
                            </div>
                          </div>
                          <div style={styleOf("flex: 1")}>
                            <div
                              style={styleOf(
                                "font-size: 28px; font-weight: 700; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                              )}
                            >
                              {"2"}
                            </div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"đã nhớ"}
                            </div>
                          </div>
                          <div style={styleOf("flex: 1")}>
                            <div
                              style={styleOf(
                                "font-size: 28px; font-weight: 700; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                              )}
                            >
                              {"1"}
                            </div>
                            <div
                              style={styleOf("font-size: 13px; color: #706473")}
                            >
                              {"phân vân"}
                            </div>
                          </div>
                        </div>
                        <div style={styleOf("font-size: 13px; color: #706473")}>
                          {
                            "Phiên được tính vào mục tiêu và chuỗi học khi bạn ôn hết tập đã chọn hoặc ít nhất 10 thẻ khác nhau. Tự đánh giá không phải kết quả kiểm tra."
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
                        <div
                          style={styleOf("font-size: 18px; font-weight: 600")}
                        >
                          {"Mục tiêu hôm nay"}
                        </div>
                        <div
                          style={styleOf(
                            "display: flex; gap: 16px; align-items: center",
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
                                  "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"
                                }
                              ></path>
                            </svg>
                            {"1/2 phiên"}
                          </span>
                          <a
                            href={"Profile.dc.html"}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Đổi mục tiêu"}
                          </a>
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

export default Flashcard;
