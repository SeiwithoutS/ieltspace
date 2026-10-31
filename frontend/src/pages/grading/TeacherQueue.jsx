import AdminTopbar from "../../components/navigation/AdminTopbar";
import TeacherSidebar from "../../components/navigation/TeacherSidebar";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class TeacherQueue extends React.Component {
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
          className="app-shell-ancestor"
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 900px",
          )}
        >
          {"\n"}
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
                crumb="Giáo viên / Hàng chờ chấm"
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
                      {"Hàng chờ chấm"}
                    </h1>
                    <div
                      style={styleOf(
                        "font-size: 15px; color: #6A5D6C; margin-top: 4px",
                      )}
                    >
                      {
                        "Chỉ gồm bài hệ thống đã phân công cho bạn. Bài chưa có người phụ trách không hiện ở đây."
                      }
                    </div>
                  </div>
                  <div style={styleOf("display: flex; gap: 10px")}></div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 14px; align-items: center",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: inline-flex; gap: 2px; padding: 3px; border-radius: 11px; background: #F3F0EA",
                    )}
                  >
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13.5px; font-weight: 600",
                      )}
                    >
                      {"Tất cả"}
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #6A5D6C; font-size: 13.5px; font-weight: 500",
                      )}
                    >
                      {"Writing"}
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #6A5D6C; font-size: 13.5px; font-weight: 500",
                      )}
                    >
                      {"Speaking"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "display: inline-flex; gap: 2px; padding: 3px; border-radius: 11px; background: #F3F0EA",
                    )}
                  >
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13.5px; font-weight: 600",
                      )}
                    >
                      {"Chờ lâu nhất"}
                    </span>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; height: 34px; padding: 0 14px; border-radius: 8px; border: 1.5px solid transparent; color: #6A5D6C; font-size: 13.5px; font-weight: 500",
                      )}
                    >
                      {"Mới phân công"}
                    </span>
                  </div>
                  <div
                    style={styleOf(
                      "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 14px; width: 240px; box-sizing: border-box; border: 1.5px solid #D6D4D0; border-radius: 10px; background: #FFFFFF; color: #706473; font-size: 14.5px",
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
                    {"Tìm người học"}
                  </div>
                </div>
                <div
                  style={styleOf(
                    "border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); overflow: hidden",
                  )}
                >
                  <div
                    style={styleOf(
                      "padding: 18px 20px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap",
                    )}
                  >
                    <div>
                      <div style={styleOf("font-size: 17px; font-weight: 600")}>
                        {"7 bài chờ chấm"}
                      </div>
                    </div>
                    <span
                      style={styleOf(
                        "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #6A5D6C; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                      )}
                    >
                      {"Giới hạn 7 / 10"}
                    </span>
                  </div>
                  <div style={styleOf("overflow-x: auto")}>
                    <table
                      style={styleOf("width: 100%; border-collapse: collapse")}
                    >
                      <thead>
                        <tr>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Người học"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Đề bài"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Kỹ năng"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Tiếp nhận"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Phân công"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Đã chờ chấm"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          >
                            {"Trạng thái"}
                          </th>
                          <th
                            style={styleOf(
                              "text-align: left; padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                            )}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Nguyễn Minh Anh"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Writing Task 2"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Public transport and traffic"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Writing"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 10:12"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 14:05"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"21 giờ"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DDE8FC; color: #2A55B8; font-size: 12.5px; font-weight: 600; white-space: nowrap",
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
                                <path d={"M6 3h9l4 4v14H6z"}></path>
                                <path d={"M14 3v5h5"}></path>
                              </svg>
                              {"Có bản nháp"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Tiếp tục"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Nguyễn Minh Anh"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Speaking Part 2"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"A skill worth learning"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Speaking"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 20:31"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 20:40"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"15 giờ"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Hoàng Nam"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Writing Task 1 Academic"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Energy use in three countries"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Writing"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"21/10 09:00"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"23/10 08:10"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"3 giờ"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Bảo Trân"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Speaking Part 1"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Hometown"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Speaking"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 07:45"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"22/10 07:46"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"1 ngày"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Quốc Việt"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Writing Task 2"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Urban noise"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Writing"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"21/10 16:20"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"21/10 16:21"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"2 ngày"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Ngọc Lan"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Writing Task 1 General"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Complaint letter"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Writing"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"20/10 21:02"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"21/10 08:00"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"2 ngày"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <div>
                              <div style={styleOf("font-weight: 600")}>
                                {"Thu Hà"}
                              </div>
                              <div
                                style={styleOf(
                                  "font-size: 12.5px; color: #706473",
                                )}
                              >
                                {"Speaking Part 3"}
                              </div>
                            </div>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"Technology"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Speaking"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"20/10 18:30"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"20/10 18:31"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            {"3 ngày"}
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 12.5px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm"}
                            </span>
                          </td>
                          <td
                            style={styleOf(
                              "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                            )}
                          >
                            <a
                              href={"TeacherGrade.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14.5px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Chấm bài"}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
                      "Hàng chờ không có hạn chấm. Bản nháp chỉ bạn xem được và không làm đổi trạng thái yêu cầu. Nếu Quản lý đã hủy một yêu cầu trong lúc bạn chấm, hệ thống sẽ từ chối công bố và cập nhật lại danh sách."
                    }
                  </span>
                </div>
              </main>
            </div>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default TeacherQueue;
