import { useAccount } from "../../lib/auth/account";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import ProfileDetails from "../../components/account/ProfileDetails";
import Support from "../../components/reports/Support";
import React from "react";
import StudyGoals from "../../components/account/StudyGoals";
import { styleOf, cssText } from "../../lib/shared/styles";

export default function Profile({ reportId, focusSupport }: { reportId?: string; focusSupport?: boolean }) {
    const account = useAccount();
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
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6; min-height: 1240px",
          )}
        >
          {"\n"}
          <LearnerHeader />
          <div style={styleOf("background: #FCFBF7; min-height: 1171px")}>
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
                    {"Hồ sơ và cài đặt"}
                  </h1>
                  <div
                    style={styleOf(
                      "font-size: 15px; color: #706473; margin-top: 4px",
                    )}
                  >
                    {account.name} · Người học
                  </div>
                </div>
                <div style={styleOf("display: flex; gap: 10px")}></div>
              </div>
              <div
                style={styleOf(
                  "max-width: 960px; width: 100%; display: flex; flex-direction: column; gap: 24px",
                )}
              >
                <ProfileDetails key={account.id} account={account} />
                <StudyGoals key={account.id} />
                <div
                  style={styleOf(
                    "padding: 28px; border: 1.5px solid #D6D4D0; border-radius: 22px; background: #FFFFFF; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 6px 16px rgba(53, 38, 55, 0.07); ",
                  )}
                >
                  <div
                    style={styleOf(
                      "display: flex; flex-direction: column; gap: 16px; ",
                    )}
                  >
                    <div>
                      <div style={styleOf("font-size: 18px; font-weight: 700")}>
                        {"Giao diện"}
                      </div>
                      <div style={styleOf("font-size: 13px; color: #706473")}>
                        {"Chế độ sáng hoặc tối, lưu trên trình duyệt này."}
                      </div>
                    </div>
                    <div
                      role={"group"}
                      aria-label={"Chế độ giao diện"}
                      style={styleOf(
                        "display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA",
                      )}
                    >
                      <button
                        type={"button"}
                        data-theme-toggle={"light"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-family: inherit; font-size: 13px; font-weight: 600; color: #352637; cursor: pointer",
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
                          aria-hidden={"true"}
                        >
                          <circle cx={"12"} cy={"12"} r={"4"}></circle>
                          <path
                            d={
                              "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                            }
                          ></path>
                        </svg>
                        {"Sáng"}
                      </button>
                      <button
                        type={"button"}
                        data-theme-toggle={"dark"}
                        style={styleOf(
                          "display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; background: transparent; border: 1.5px solid transparent; font-family: inherit; font-size: 13px; font-weight: 500; color: #706473; cursor: pointer",
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
                          aria-hidden={"true"}
                        >
                          <path
                            d={"M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"}
                          ></path>
                        </svg>
                        {"Tối"}
                      </button>
                    </div>
                  </div>
                </div>
                <Support reportId={reportId} focusOnOpen={focusSupport} />
                <a
                  href={"Main.dc.html"}
                  style={styleOf(
                    "display: inline-flex; align-items: center; gap: 10px; color: #C0412A; font-weight: 600; text-decoration: none",
                  )}
                >
                  <svg
                    width={"19"}
                    height={"19"}
                    viewBox={"0 0 24 24"}
                    fill={"none"}
                    stroke={"currentColor"}
                    strokeWidth={"1.8"}
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                    aria-hidden={"true"}
                  >
                    <path d={"M10 4H5v16h5M15 8l4 4-4 4M19 12H9"}></path>
                  </svg>
                  {"Đăng xuất"}
                </a>
              </div>
            </main>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>
    );
}
