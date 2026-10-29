import {selectDemoAccount} from "../../lib/account";
import React from "react";
import { styleOf, cssText } from "../../lib/styles";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

class Register extends React.Component {
renderVals() {
var s = this.state || {}, P = this.props, self = this;
var ACC = {"minhanh@email.com": {"role": "learner", "href": "StudentLanding.dc.html"}, "lanhuong@ieltspace.vn": {"role": "teacher", "href": "TeacherHome.dc.html"}, "admin@ieltspace.vn": {"role": "admin", "href": "AdminHome.dc.html"}, "moi@email.com": {"role": "unverified", "href": null}, "khoa@email.com": {"role": "locked", "href": null}};
var mode = s.mode || P.start || 'register';
var email = s.email == null ? '' : s.email, pw = s.password == null ? '' : s.password;
var acc = ACC[email.trim().toLowerCase()];
var href = acc && acc.href && pw.length >= 8 ? acc.href : '#';
var err = s.error == null ? (P.previewError || '') : s.error;
function stop(e) { if (e) { e.preventDefault(); } }
return { isLogin: mode === 'login', isRegister: mode === 'register', email: email, password: pw, error: err, submitHref: href,
  setEmail: function (e) { self.setState({ email: e.target.value, error: '' }); },
  setPassword: function (e) { self.setState({ password: e.target.value, error: '' }); },
  submit: function (e) { if (href !== '#') { selectDemoAccount(email, acc.role); return; } stop(e);
    var r = acc ? acc.role : ''; self.setState({ error: r === 'unverified' ? 'unverified' : r === 'locked' ? 'locked' : 'wrong' }); },
  fill: function (m) { self.setState({ email: m, password: 'matkhau123', error: '' }); },
  toRegister: function () { self.setState({ mode: 'register', error: '' }); },
  toLogin: function () { self.setState({ mode: 'login', error: '' }); } };
}

static defaultProps = {"start": "register", "previewError": ""};
render() { const v = this.renderVals(); return <>{"\n"}{"\n"}<style>{cssText("\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n")}</style>{"\n"}{"\n"}<div style={styleOf("font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6")}>{"\n"}<div style={styleOf("display: flex; flex-wrap: wrap; min-height: 900px")}><div style={styleOf("flex: 1 1 480px; min-width: 0; display: flex; flex-direction: column")}><AuthHero ></AuthHero></div><div style={styleOf("flex: 1 1 480px; min-width: 0; background: #FCFBF7; box-sizing: border-box; padding: 32px 24px 48px; display: flex; flex-direction: column; gap: 24px")}><div style={styleOf("display: flex; justify-content: flex-start")}><a href={"Main.dc.html"} style={styleOf("display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #6A5D6C; text-decoration: none")}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}><path d={"M19 12H5M11 6l-6 6 6 6"}></path></svg>{" Về trang chủ"}</a></div><div style={styleOf("flex: 1; display: flex; align-items: center; justify-content: center")}><div style={styleOf("width: 100%; max-width: 420px")}>{v.isLogin ? <><LoginForm email={v.email} password={v.password} error={v.error} submitHref={v.submitHref} setEmail={v.setEmail} setPassword={v.setPassword} doSubmit={v.submit} goRegister={v.toRegister} fillDemo={v.fill}></LoginForm></> : null}{v.isRegister ? <><RegisterForm goLogin={v.toLogin}></RegisterForm></> : null}</div></div></div></div>{"\n"}</div>{"\n"}</>; }
}

export default Register;
