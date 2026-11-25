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
                <NotificationInbox role="learner" />
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
                  <NotificationInbox role="teacher" />
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
