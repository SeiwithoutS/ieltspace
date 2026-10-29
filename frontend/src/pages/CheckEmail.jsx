import React from "react";
import { styleOf, cssText } from "../lib/styles";


class CheckEmail extends React.Component {
componentDidMount() {
  this.timer = setInterval(() => {
    if (this.state.left > 0) { this.setState({ left: this.state.left - 1 }); }
  }, 1000);
}
componentWillUnmount() {
  if (this.timer) { clearInterval(this.timer); }
}
constructor(...args) {
  super(...args);
  this.state = { left: 60, sent: false, waitMsg: false };
}
renderVals() {
  const left = this.state.left;
  const email = (this.props && this.props.email) || 'minhanh@email.com';
  const resend = (e) => {
    if (e && e.preventDefault) { e.preventDefault(); }
    if (this.state.left > 0) { this.setState({ waitMsg: true, sent: false }); return; }
    this.setState({ left: 60, sent: true, waitMsg: false });
  };
  return { email: email, countdown: left, sent: this.state.sent, waitMsg: this.state.waitMsg, resend: resend };
}

static defaultProps = {"email": "minhanh@email.com"};
render() { const v = this.renderVals(); return <>{"\n"}{"\n"}<style>{cssText("\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n")}</style>{"\n"}{"\n"}<div style={styleOf("font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6")}>{"\n"}<div style={styleOf("min-height: 900px; background: #FCFBF7; padding: 48px 20px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 32px")}><a href={"Main.dc.html"} style={styleOf("display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #352637; font-weight: 700; font-size: 19px")}><span style={styleOf("width: 32px; height: 32px; border-radius: 9px; background: #2963CC; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #FFFFFF")}>{"IS"}</span><span >{"IELTSpace"}</span></a><main style={styleOf("width: 100%; max-width: 440px; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 36px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px")}><div style={styleOf("width: 52px; height: 52px; border-radius: 16px; background: #DCEDE2; color: #2E6A48; display: flex; align-items: center; justify-content: center")}><svg width={"24"} height={"24"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}><rect x={"3"} y={"5"} width={"18"} height={"14"} rx={"2"}></rect><path d={"M3 7l9 6 9-6"}></path></svg></div><h1 style={styleOf("margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #352637; ")}>{"Kiểm tra email để xác minh"}</h1><p style={styleOf("margin: 0; font-size: 15px; line-height: 1.6; color: #6A5D6C; ")}>{"Chúng tôi đã gửi liên kết xác minh đến "}<b >{v.email}</b>{". Bạn cần mở liên kết này trước lần đăng nhập đầu tiên."}</p><div style={styleOf("display: flex; align-items: flex-start; gap: 10px; background: #E3ECFD; border-radius: 14px; padding: 12px 14px; font-size: 14px; color: #4B3D4D")}><span style={styleOf("flex: none; display: flex; padding-top: 1px")}><svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}><circle cx={"12"} cy={"12"} r={"9"}></circle><path d={"M12 7v5l3 2"}></path></svg></span><span >{"Chưa nhận được email hoặc liên kết đã hết hạn? Bạn có thể gửi lại sau " + v.countdown + " giây."}</span></div>{v.sent ? <><div style={styleOf("font-size: 14px; font-weight: 600; color: #2E6A48")}>{"Đã gửi lại email xác minh."}</div></> : null}{v.waitMsg ? <><div style={styleOf("font-size: 14px; color: #6A5D6C")}>{"Vui lòng chờ hết thời gian đếm ngược."}</div></> : null}<a href={"#"} onClick={v.resend} style={styleOf("display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font-weight: 600; font-size: 15px; text-decoration: none; ")}>{"Gửi lại email xác minh"}</a><a href={"Login.dc.html"} style={styleOf("display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 999px; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 15px; text-decoration: none; ")}>{"Đã xác minh, đi đến đăng nhập"}</a><div style={styleOf("text-align: center; font-size: 14px")}><a href={"Register.dc.html"} style={styleOf("color: #2963CC; font-weight: 600; text-decoration: none")}>{"Đổi email đăng ký"}</a></div></main></div>{"\n"}</div>{"\n"}</>; }
}

export default CheckEmail;
