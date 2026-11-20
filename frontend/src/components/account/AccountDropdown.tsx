import React from "react";
import { styleOf } from "../../lib/shared/styles";
import AvatarContent from "./AvatarContent";

interface AccountDropdownView {
  close: () => void;
  initials: string;
  avatar?: string | null;
  name: string;
  email: string;
  role: string;
  isLight: boolean;
  isDark: boolean;
  lightStyle: string;
  darkStyle: string;
  setLight: React.MouseEventHandler<HTMLAnchorElement>;
  setDark: React.MouseEventHandler<HTMLAnchorElement>;
}

interface AccountDropdownProps {
  v: AccountDropdownView;
  learner?: boolean;
}

const learnerLinks = [
  { label: "Dashboard", page: "StudentHome", icon: "M4 11l8-7 8 7v9H4z" },
  { label: "Lịch sử luyện tập", page: "PracticeHistory", icon: "M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4 0v5l3 2" },
];

export default function AccountDropdown({ v, learner = false }: AccountDropdownProps) {
  return (
    <>
      <div onClick={v.close} style={styleOf("position: fixed; inset: 0; z-index: 40")} />
      <div role="menu" aria-label="Tài khoản" style={styleOf("position: absolute; right: 0; top: 52px; z-index: 50; width: 288px; box-sizing: border-box; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 16px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 8px; display: flex; flex-direction: column; gap: 2px")}>
        {!learner && <><div style={styleOf("display: flex; gap: 12px; align-items: center; padding: 10px 12px 12px")}>
          <span style={styleOf("flex: none; width: 42px; height: 42px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #352637")}>
            <AvatarContent avatar={v.avatar} initials={v.initials} />
          </span>
          <div style={styleOf("min-width: 0")}>
            <div style={styleOf("font-weight: 600; font-size: 15px")}>{v.name}</div>
            <div style={styleOf("font-size: 13px; color: #706473; overflow: hidden; text-overflow: ellipsis")}>{v.email}</div>
            <div style={styleOf("font-size: 13px; color: #706473")}>{v.role}</div>
          </div>
        </div>
        <div style={styleOf("height: 1px; background: #E6E4E0; margin: 2px 4px 4px")} /></>}
        {learner && learnerLinks.map(({ label, page, icon }) => (
          <a key={page} role="menuitem" href={page + ".dc.html"} style={styleOf('display:flex;align-items:center;gap:12px;height:42px;padding:0 12px;border-radius:10px;color:#352637;font-size:14px;font-weight:500;text-decoration:none')}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={icon} />
            </svg>
            {label}
          </a>
        ))}
        <a role="menuitem" href={learner ? "Profile.dc.html" : "StaffProfile.dc.html"} style={styleOf("display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; color: #352637; font-size: 14px; font-weight: 500; text-decoration: none")}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          {" Hồ sơ cá nhân"}
        </a>
        <div style={styleOf("display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 6px 6px 12px")}>
          <span style={styleOf("display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500")}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            {" Giao diện"}
          </span>
          <div role="group" aria-label="Chế độ giao diện" style={styleOf("display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: #F3F0EA")}>
            <a href="#" role="menuitemradio" aria-checked={v.isLight} data-theme-toggle="light" onClick={v.setLight} style={styleOf(v.lightStyle)}>{"Sáng"}</a>
            <a href="#" role="menuitemradio" aria-checked={v.isDark} data-theme-toggle="dark" onClick={v.setDark} style={styleOf(v.darkStyle)}>{"Tối"}</a>
          </div>
        </div>
        <div style={styleOf("height: 1px; background: #E6E4E0; margin: 4px")} />
        <a role="menuitem" href="Main.dc.html" style={styleOf("display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 10px; color: #352637; font-size: 14px; font-weight: 500; text-decoration: none; color: #C0412A; font-weight: 600")}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
          </svg>
          {" Đăng xuất"}
        </a>
      </div>
    </>
  );
}
