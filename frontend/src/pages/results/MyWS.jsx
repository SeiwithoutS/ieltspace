import NotificationBadge from "../../components/notifications/NotificationBadge";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class MyWS extends React.Component {
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1150px",
          )}
        >
          {"\n"}
          <LearnerHeader active="exams" />
          <div style={styleOf("background: #FCFBF7; min-height: 1081px")}>
            <main
              style={styleOf(
                "max-width: 1280px; margin: 0 auto; padding: 36px 24px 56px; display: flex; flex-direction: column; gap: 24px",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="m-0 text-2xl sm:text-[28px] font-bold font-serif leading-tight text-[#352637]">
                    {"Bài Writing và Speaking của tôi"}
                  </h1>
                  <div className="text-sm sm:text-base text-[#706473] mt-1">
                    {"Bài đã hoàn thành, trạng thái yêu cầu chấm và thời hạn nội dung."}
                  </div>
                </div>
                <div className="w-full sm:w-auto flex">
                  <a
                    href={"PracticeWS.dc.html"}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full border-[1.5px] border-[#D6D4D0] bg-white text-[#352637] font-semibold text-sm no-underline whitespace-nowrap hover:bg-[#F3F0EA]"
                  >
                    {"Luyện Writing, Speaking"}
                  </a>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="inline-flex gap-0.5 p-1 rounded-xl bg-[#F3F0EA] self-start">
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg bg-white border border-[#D6D4D0] text-xs font-semibold text-[#352637]">
                    {"Tất cả"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Writing"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Speaking"}
                  </span>
                </div>

                {/* Mobile status select (< 768px) */}
                <div className="md:hidden flex items-center gap-2 w-full">
                  <label htmlFor="ws-status" className="text-xs font-semibold text-[#706473] shrink-0">
                    Trạng thái:
                  </label>
                  <select
                    id="ws-status"
                    className="flex-1 h-9 px-3 rounded-lg border border-[#D6D4D0] bg-white text-xs text-[#352637] font-medium"
                  >
                    <option>Mọi trạng thái</option>
                    <option>Chưa gửi chấm</option>
                    <option>Chờ phân công</option>
                    <option>Chờ chấm</option>
                    <option>Đã có kết quả</option>
                    <option>Đã hủy</option>
                  </select>
                </div>

                {/* Desktop status segmented (>= 768px) */}
                <div className="hidden md:inline-flex gap-0.5 p-1 rounded-xl bg-[#F3F0EA] overflow-x-auto whitespace-nowrap">
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg bg-white border border-[#D6D4D0] text-xs font-semibold text-[#352637]">
                    {"Mọi trạng thái"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Chưa gửi chấm"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Chờ phân công"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Chờ chấm"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Đã có kết quả"}
                  </span>
                  <span className="inline-flex items-center h-8 px-3.5 rounded-lg text-xs font-medium text-[#706473] hover:text-[#352637] cursor-pointer">
                    {"Đã hủy"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="w-full flex flex-col gap-6">
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
                      <div style={styleOf("font-size: 18px; font-weight: 600")}>
                        {"Lượt hỗ trợ chấm còn hiệu lực"}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          style={styleOf(
                            "flex: 1; padding: 14px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #DCEDE2",
                          )}
                        >
                          <div
                            style={styleOf(
                              "font-size: 28px; font-weight: 700; color: #2E6A48; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                            )}
                          >
                            {"1"}
                          </div>
                          <div style={styleOf("font-weight: 600")}>
                            {"Lượt miễn phí"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #4B3D4D")}
                          >
                            {"Hết hạn 00:00 thứ Hai 26/10"}
                          </div>
                        </div>
                        <div
                          style={styleOf(
                            "flex: 1; padding: 14px; border-radius: 12px; border: 1.5px solid #D6D4D0; background: #E8E4FA",
                          )}
                        >
                          <div
                            style={styleOf(
                              "font-size: 28px; font-weight: 700; color: #5543B0; font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: -0.015em",
                            )}
                          >
                            {"1"}
                          </div>
                          <div style={styleOf("font-weight: 600")}>
                            {"Lượt bonus"}
                          </div>
                          <div
                            style={styleOf("font-size: 13px; color: #4B3D4D")}
                          >
                            {"Hết hạn hết Chủ nhật 01/11"}
                          </div>
                        </div>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {
                          "Mỗi tuần (từ 00:00 thứ Hai, giờ Việt Nam) bạn có 1 lượt miễn phí dùng chung Writing và Speaking, không cộng dồn. Bonus được hoàn khi yêu cầu bị hủy vì quá 72 giờ chưa có giáo viên hoặc giáo viên không thể hoàn thành."
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-6">
                  <div
                    style={styleOf(
                      "padding: 22px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                    )}
                  >
                    <div
                      style={styleOf(
                        "display: flex; flex-direction: column; gap: 2px; ",
                      )}
                    >
                      <div style={styleOf("font-size: 18px; font-weight: 600")}>
                        {"Thời hạn lưu nội dung"}
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                        )}
                      >
                        <span style={styleOf("color: #706473")}>
                          {"Bài chưa gửi chấm"}
                        </span>
                        <span
                          style={styleOf("font-weight: 600; text-align: right")}
                        >
                          {"14 ngày từ lúc hoàn thành"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                        )}
                      >
                        <span style={styleOf("color: #706473")}>
                          {"Đang chờ phân công hoặc chờ chấm"}
                        </span>
                        <span
                          style={styleOf("font-weight: 600; text-align: right")}
                        >
                          {"Tạm giữ, không xóa"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                        )}
                      >
                        <span style={styleOf("color: #706473")}>
                          {"Yêu cầu bị hủy"}
                        </span>
                        <span
                          style={styleOf("font-weight: 600; text-align: right")}
                        >
                          {"Quay về hạn ban đầu"}
                        </span>
                      </div>
                      <div
                        style={styleOf(
                          "display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid #E6E4E0; font-size: 14px",
                        )}
                      >
                        <span style={styleOf("color: #706473")}>
                          {"Đã có kết quả"}
                        </span>
                        <span
                          style={styleOf("font-weight: 600; text-align: right")}
                        >
                          {"14 ngày từ lúc công bố"}
                        </span>
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {
                          "Hết hạn thì bài viết, bản ghi âm bị xóa; điểm và nhận xét vẫn được giữ. Xem hay tải bài không gia hạn."
                        }
                      </div>
                    </div>
                  </div>
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
                    <div style={styleOf("font-size: 18px; font-weight: 600")}>
                      {"6 bài trong 30 ngày"}
                    </div>
                  </div>
                  <span
                    style={styleOf(
                      "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #706473",
                    )}
                  >
                    <span
                      aria-label={"Chưa xem"}
                      style={styleOf(
                        "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                      )}
                    ></span>
                    {" mới có kết quả hoặc vừa bị hủy"}
                  </span>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table
                    style={styleOf("width: 100%; border-collapse: collapse")}
                  >
                    <thead>
                      <tr>
                        <th
                          style={styleOf(
                            "text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                          )}
                        >
                          {"Bài"}
                        </th>
                        <th
                          style={styleOf(
                            "text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                          )}
                        >
                          {"Kỹ năng"}
                        </th>
                        <th
                          style={styleOf(
                            "text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                          )}
                        >
                          {"Trạng thái"}
                        </th>
                        <th
                          style={styleOf(
                            "text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
                          )}
                        >
                          {"Nội dung bài"}
                        </th>
                        <th
                          style={styleOf(
                            "text-align: left; padding: 12px 16px; font-size: 13px; font-weight: 600; color: #706473; background: #FAF9F5; border-bottom: 1.5px solid #D6D4D0; white-space: nowrap",
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
                              {"Writing Task 2 · Public transport"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 20/10 10:05"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DCEDE2; color: #2E6A48; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Đã có kết quả · 6.5"}
                            </span>
                            <span
                              aria-label={"Chưa xem"}
                              style={styleOf(
                                "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                              )}
                            ></span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Giữ đến 05/11"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: flex; flex-wrap: wrap; gap: 6px",
                            )}
                          >
                            <a
                              href={"ResultWS.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Xem kết quả"}
                            </a>
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                <path
                                  d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                ></path>
                              </svg>
                              {"Tải .docx"}
                            </a>
                          </span>
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
                              {"Speaking Part 2 · A skill worth learning"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 22/10 20:30"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #DDE8FC; color: #2A55B8; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ chấm · phân công 22/10 20:40"}
                            </span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Tạm giữ"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: flex; flex-wrap: wrap; gap: 6px",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                <path
                                  d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                ></path>
                              </svg>
                              {"Tải ghi âm"}
                            </a>
                          </span>
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
                              {"Writing Task 1 Academic · Energy use"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 21/10 08:55"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chờ phân công · còn 21 giờ"}
                            </span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Tạm giữ"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: flex; flex-wrap: wrap; gap: 6px",
                            )}
                          >
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                <path
                                  d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                ></path>
                              </svg>
                              {"Tải .docx"}
                            </a>
                          </span>
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
                              {"Speaking Part 3 · Technology"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 18/10 19:40"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #E8E4FA; color: #5543B0; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FBDCD3; color: #C0412A; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Đã hủy · đã hoàn 1 bonus"}
                            </span>
                            <span
                              aria-label={"Chưa xem"}
                              style={styleOf(
                                "display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #E5604A; flex: 0 0 8px",
                              )}
                            ></span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Hạn ban đầu 01/11"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: flex; flex-wrap: wrap; gap: 6px",
                            )}
                          >
                            <a
                              href={"SubmitDialogs.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Gửi lại yêu cầu"}
                            </a>
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                <path
                                  d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                ></path>
                              </svg>
                              {"Tải ghi âm"}
                            </a>
                          </span>
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
                              {"Writing Task 2 · Online education"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 22/10 21:15"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Đã lưu · chưa gửi chấm"}
                            </span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Giữ đến 05/11"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: flex; flex-wrap: wrap; gap: 6px",
                            )}
                          >
                            <a
                              href={"SubmitDialogs.dc.html"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                              )}
                            >
                              {"Gửi yêu cầu chấm"}
                            </a>
                            <a
                              href={"#"}
                              style={styleOf(
                                "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
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
                                <path
                                  d={"M12 4v12M7 11l5 5 5-5M4 20h16"}
                                ></path>
                              </svg>
                              {"Tải .docx"}
                            </a>
                          </span>
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
                              {"Writing Task 1 General · Complaint letter"}
                            </div>
                            <div
                              style={styleOf(
                                "font-size: 13px; color: #706473",
                              )}
                            >
                              {"Hoàn thành 02/10 09:30"}
                            </div>
                          </div>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 0 solid transparent; background: #FBEDBF; color: #7A5A0E; font-size: 13px; font-weight: 600; white-space: nowrap",
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
                          <span
                            style={styleOf(
                              "display: inline-flex; align-items: center; gap: 8px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; border: 1.5px solid #DDDBD7; background: #F3F0EA; color: #706473; font-size: 13px; font-weight: 600; white-space: nowrap",
                              )}
                            >
                              {"Chưa có điểm"}
                            </span>
                          </span>
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          {"Nội dung đã hết hạn 16/10"}
                        </td>
                        <td
                          style={styleOf(
                            "padding: 13px 16px; border-top: 1px solid #E6E4E0; font-size: 14px; vertical-align: middle",
                          )}
                        >
                          <span
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Không mở hoặc tải được"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden divide-y divide-[#E6E4E0]">
                  {/* Card 1 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Writing Task 2 · Public transport
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 20/10 10:05
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#FBEDBF] text-[#7A5A0E] text-xs font-semibold shrink-0">
                        Writing
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[#D6D4D0] bg-[#DCEDE2] text-[#2E6A48] font-semibold">
                        Đã có kết quả · 6.5
                        <span aria-label="Chưa xem" className="inline-block w-2 h-2 rounded-full bg-[#E5604A] shrink-0" />
                      </span>
                      <span className="text-[#706473]">Giữ đến 05/11</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="ResultWS.dc.html"
                        className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        Xem kết quả
                      </a>
                      <a
                        href="#"
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                        </svg>
                        Tải .docx
                      </a>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Speaking Part 2 · A skill worth learning
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 22/10 20:30
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#E8E4FA] text-[#5543B0] text-xs font-semibold shrink-0">
                        Speaking
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full border border-[#D6D4D0] bg-[#DDE8FC] text-[#2A55B8] font-semibold">
                        Chờ chấm · phân công 22/10 20:40
                      </span>
                      <span className="text-[#706473]">Tạm giữ</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="#"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 5l11 7-11 7z" />
                        </svg>
                        Nghe lại
                      </a>
                      <a
                        href="#"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                        </svg>
                        Tải ghi âm
                      </a>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Writing Task 1 Academic · Energy use
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 21/10 08:55
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#FBEDBF] text-[#7A5A0E] text-xs font-semibold shrink-0">
                        Writing
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full border border-[#D6D4D0] bg-[#FBEDBF] text-[#7A5A0E] font-semibold">
                        Chờ phân công · còn 21 giờ
                      </span>
                      <span className="text-[#706473]">Tạm giữ</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <a
                        href="#"
                        className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                        </svg>
                        Tải .docx
                      </a>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Speaking Part 3 · Technology
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 18/10 19:40
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#E8E4FA] text-[#5543B0] text-xs font-semibold shrink-0">
                        Speaking
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-[#D6D4D0] bg-[#FBDCD3] text-[#C0412A] font-semibold">
                        Đã hủy · đã hoàn 1 bonus
                        <span aria-label="Chưa xem" className="inline-block w-2 h-2 rounded-full bg-[#E5604A] shrink-0" />
                      </span>
                      <span className="text-[#706473]">Hạn ban đầu 01/11</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="SubmitDialogs.dc.html"
                        className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-full border border-[#352637] bg-[#352637] text-white font-semibold text-xs no-underline hover:bg-[#221824]"
                      >
                        Gửi lại yêu cầu
                      </a>
                      <a
                        href="#"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                        </svg>
                        Tải ghi âm
                      </a>
                    </div>
                  </div>

                  {/* Card 5 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Writing Task 2 · Online education
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 22/10 21:15
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#FBEDBF] text-[#7A5A0E] text-xs font-semibold shrink-0">
                        Writing
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full border border-[#DDDBD7] bg-[#F3F0EA] text-[#706473] font-semibold">
                        Đã lưu · chưa gửi chấm
                      </span>
                      <span className="text-[#706473]">Giữ đến 05/11</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="SubmitDialogs.dc.html"
                        className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-full border border-[#352637] bg-[#352637] text-white font-semibold text-xs no-underline hover:bg-[#221824]"
                      >
                        Gửi yêu cầu chấm
                      </a>
                      <a
                        href="#"
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[#D6D4D0] bg-white text-[#352637] font-semibold text-xs no-underline hover:bg-[#F3F0EA]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
                        </svg>
                        Tải .docx
                      </a>
                    </div>
                  </div>

                  {/* Card 6 */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-[#352637]">
                          Writing Task 1 General · Complaint letter
                        </div>
                        <div className="text-xs text-[#706473] mt-0.5">
                          Hoàn thành 02/10 09:30
                        </div>
                      </div>
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#FBEDBF] text-[#7A5A0E] text-xs font-semibold shrink-0">
                        Writing
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full border border-[#DDDBD7] bg-[#F3F0EA] text-[#706473] font-semibold">
                        Chưa có điểm
                      </span>
                      <span className="text-[#706473]">Nội dung đã hết hạn 16/10</span>
                    </div>
                    <div className="text-xs text-[#706473] pt-1">
                      Không mở hoặc tải được
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

export default MyWS;
