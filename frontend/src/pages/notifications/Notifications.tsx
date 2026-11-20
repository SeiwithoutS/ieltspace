import LearnerHeader from "../../components/navigation/LearnerHeader";
import NotificationInbox from "../../components/notifications/NotificationInbox";
import StaffLayout from "../../components/layout/StaffLayout";
import AdminTopbar from "../../components/navigation/AdminTopbar";
import TeacherSidebar from "../../components/navigation/TeacherSidebar";
import { currentRole } from "../../lib/auth/account";
import { styleOf, cssText } from "../../lib/shared/styles";

export default function Notifications() {
  const role = currentRole();
  if (role === "admin") {
    return (
      <StaffLayout active="none" crumb="Quản lý / Thông báo hệ thống" contentClassName="p-4 sm:p-6 md:p-8">
        <h1 className="m-0 mb-5 font-serif text-[28px] leading-tight">Thông báo hệ thống</h1>
        <NotificationInbox role="admin" />
      </StaffLayout>
    );
  }

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
        {role === "learner" ? (
          <>
            <LearnerHeader />
            <div style={styleOf("background: #FCFBF7; min-height: 831px")}>
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
                      {"Thông báo"}
                    </h1>
                    <div
                      style={styleOf(
                        "font-size: 15px; color: #706473; margin-top: 4px",
                      )}
                    >
                      {
                        "Chỉ hiển thị trong hệ thống, không gửi email hay thông báo đẩy."
                      }
                    </div>
                  </div>
                  <div style={styleOf("display: flex; gap: 10px")}></div>
                </div>
                <div
                  style={styleOf(
                    "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                  )}
                >
                  <div
                    style={styleOf(
                      "flex: 1.3 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                    )}
                  >
                    <NotificationInbox role="learner" />
                  </div>
                  <div
                    style={styleOf(
                      "flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                    )}
                  >
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
                        <div
                          style={styleOf("font-size: 13px; color: #706473")}
                        >
                          {"Chi tiết · đã đánh dấu đã đọc"}
                        </div>
                        <div
                          style={styleOf(
                            "font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                          )}
                        >
                          {"Yêu cầu chấm Speaking Part 3 đã bị hủy"}
                        </div>
                        <div
                          style={styleOf("font-size: 14px; color: #4B3D4D")}
                        >
                          {
                            "Yêu cầu gửi lúc 18/10 19:41 chưa được phân công sau 72 giờ nên hệ thống đã hủy. Bạn được hoàn 1 lượt bonus, dùng được đến hết Chủ nhật 01/11. Bài còn giữ đến 01/11, bạn có thể gửi lại yêu cầu."
                          }
                        </div>
                        <a
                          href={"MyWS.dc.html"}
                          style={styleOf(
                            "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                          )}
                        >
                          {"Mở bài Writing/Speaking"}
                        </a>
                        <div
                          style={styleOf(
                            "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
                          )}
                        >
                          <span
                            style={styleOf("flex: 0 0 18px; margin-top: 2px")}
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
                              <circle cx={"12"} cy={"12"} r={"9"}></circle>
                              <path d={"M12 11v5M12 8h.01"}></path>
                            </svg>
                          </span>
                          <span>
                            {
                              "Thông báo là bản ghi tại thời điểm phát sinh. Màn hình bài làm hiển thị trạng thái hiện tại; nếu nội dung đã hết hạn hoặc bạn không còn quyền, liên kết sẽ không mở được nội dung."
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </>
        ) : null}
        {role === "teacher" ? (
          <>
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
                <AdminTopbar crumb="Giáo viên / Thông báo" role="Giáo viên" />
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
                          "margin: 0; font-size: 28px; line-height: 1.25; letter-spacing: -0.02em; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                        )}
                      >
                        {"Thông báo"}
                      </h1>
                      <div
                        style={styleOf(
                          "font-size: 15px; color: #706473; margin-top: 4px",
                        )}
                      >
                        {
                          "Chỉ hiển thị trong hệ thống, không gửi email hay thông báo đẩy."
                        }
                      </div>
                    </div>
                    <div style={styleOf("display: flex; gap: 10px")}></div>
                  </div>
                  <div
                    style={styleOf(
                      "display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start",
                    )}
                  >
                    <div
                      style={styleOf(
                        "flex: 1.3 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                      )}
                    >
                      <NotificationInbox role="teacher" />
                    </div>
                    <div
                      style={styleOf(
                        "flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 24px",
                      )}
                    >
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
                          <div
                            style={styleOf("font-size: 13px; color: #706473")}
                          >
                            {"Chi tiết · đã đánh dấu đã đọc"}
                          </div>
                          <div
                            style={styleOf(
                              "font-size: 20px; font-weight: 700; font-family: 'IBM Plex Serif', Georgia, serif; letter-spacing: -0.015em",
                            )}
                          >
                            {"Bạn được phân công bài mới"}
                          </div>
                          <div
                            style={styleOf(
                              "font-size: 14px; color: #4B3D4D",
                            )}
                          >
                            {
                              "Hệ thống đã phân công bài Writing Task 1 Academic của Hoàng Nam cho bạn lúc 23/10 08:10. Bài xuất hiện trong hàng chờ chấm của bạn."
                            }
                          </div>
                          <a
                            href={"TeacherGrade.dc.html"}
                            style={styleOf(
                              "display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #352637; box-sizing: border-box; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; white-space: nowrap",
                            )}
                          >
                            {"Mở bài trong hàng chờ"}
                          </a>
                          <div
                            style={styleOf(
                              "display: flex; gap: 10px; align-items: flex-start; padding: 12px 16px; border-radius: 12px; background: #FAF9F5; border: 1.5px solid #D6D4D0; font-size: 14px",
                            )}
                          >
                            <span
                              style={styleOf(
                                "flex: 0 0 18px; margin-top: 2px",
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
                                <circle cx={"12"} cy={"12"} r={"9"}></circle>
                                <path d={"M12 11v5M12 8h.01"}></path>
                              </svg>
                            </span>
                            <span>
                              {
                                "Thông báo là bản ghi tại thời điểm phát sinh. Màn hình bài làm hiển thị trạng thái hiện tại; nếu nội dung đã hết hạn hoặc bạn không còn quyền, liên kết sẽ không mở được nội dung."
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
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
