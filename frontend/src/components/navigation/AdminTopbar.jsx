import {getAccount} from "../../lib/account";
import NotificationBadge from "../notifications/NotificationBadge";
import AccountDropdown from "../account/AccountDropdown";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";


class AdminTopbar extends React.Component {
componentDidMount() {
  var self = this;
  this._esc = function (e) { if (e.key === 'Escape' && self.state && self.state.open) { self.setState({ open: false }); } };
  document.addEventListener('keydown', this._esc);
}
componentWillUnmount() { document.removeEventListener('keydown', this._esc); }
renderVals() {
var s = this.state || {}, P = this.props, self = this;
var account=getAccount(P.role === 'Giáo viên' ? 'teacher' : 'admin');
var open = s.open == null ? !!P.menuOpen : s.open;
var theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
function stop(e) { if (e) { e.preventDefault(); } }
var on = "display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13.5px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box", off = "display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px; border: 1.5px solid transparent; color: #6A5D6C; font-size: 13.5px; font-weight: 500; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box";
return { crumb: P.crumb || 'Quản lý / Tổng quan', name: account.name, initials: account.initials, email: account.email,
  role: P.role || 'Quản lý', open: open, isLight: theme === 'light', isDark: theme === 'dark',
  btnBg: open ? '#F3F0EA' : 'transparent', btnBorder: open ? '#D6D4D0' : 'transparent',
  lightStyle: theme === 'light' ? on : off, darkStyle: theme === 'dark' ? on : off,
  toggle: function (e) { stop(e); self.setState({ open: !open }); },
  close: function () { self.setState({ open: false }); },
  setLight: function (e) { stop(e); self.setState({ theme: 'light' }); },
  setDark: function (e) { stop(e); self.setState({ theme: 'dark' }); } };
}

static defaultProps = {"crumb": "Quản lý / Tổng quan", "menuOpen": false};
render() { const v = this.renderVals(); return <>{"\n"}{"\n"}<style>{cssText("\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n")}</style>{"\n"}{"\n"}<div style={styleOf("font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; font-size: 15px; line-height: 1.6")}>{"\n"}<header style={styleOf("position: relative; z-index: 30; height: 68px; box-sizing: border-box; border-bottom: 1.5px solid #D6D4D0; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #FCFBF7")}><div style={styleOf("font-size: 14px; color: #706473; white-space: nowrap; overflow: hidden; text-overflow: ellipsis")}>{v.crumb}</div><div style={styleOf("display: flex; align-items: center; gap: 14px")}><a href={"Notifications.dc.html"} aria-label={"Thông báo"} style={styleOf("position: relative; width: 42px; height: 42px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637; text-decoration: none; background: #FFFFFF")}><svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}><path d={"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"}></path><path d={"M10.3 21a1.94 1.94 0 0 0 3.4 0"}></path></svg><NotificationBadge style={styleOf("position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px; box-sizing: border-box; border-radius: 10px; background: #E5604A; color: #FFFFFF; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF")} /></a><div style={styleOf("position: relative")}><a href={"#"} onClick={v.toggle} aria-haspopup={"menu"} aria-expanded={v.open} aria-label={"Mở menu tài khoản"} style={styleOf("display: flex; align-items: center; gap: 10px; padding: 3px 10px 3px 3px; border-radius: 999px; border: 1.5px solid " + v.btnBorder + "; background: " + v.btnBg + "; color: #352637; text-decoration: none; cursor: pointer")}><span style={styleOf("width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px; color: #352637")}>{v.initials}</span><span style={styleOf("font-size: 14px; font-weight: 600; white-space: nowrap")}>{v.name}</span><span style={styleOf("display: flex; color: #706473")}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}><path d={"M6 9l6 6 6-6"}></path></svg></span></a>{v.open && <AccountDropdown v={v} />}</div></div></header>{"\n"}</div>{"\n"}</>; }
}

export default AdminTopbar;
