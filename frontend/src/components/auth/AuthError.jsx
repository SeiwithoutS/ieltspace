import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class AuthError extends React.Component {
  renderVals() {
    var k = this.props.kind || "wrong";
    return {
      isWrong: k === "wrong",
      isUnverified: k === "unverified",
      isLocked: k === "locked",
      isCustom: k === "custom",
      message: this.props.message || "",
    };
  }

  static defaultProps = {};
  render() {
    const v = this.renderVals();
    return (
      <>
        {"\n"}
        {"\n"}
        <style>
          {cssText(
            "\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n",
          )}
        </style>
        {"\n"}
        {"\n"}
        <div
          role={"alert"}
          style={styleOf(
            "display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: #FBDCD3; border: 1px solid #F1B3A3; color: #B23A24; font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; font-size: 14px; line-height: 1.5",
          )}
        >
          {"\n"}
          {v.isUnverified ? (
            <>
              <span style={styleOf("flex: none; margin-top: 1px")}>
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
                  <rect
                    x={"3"}
                    y={"5"}
                    width={"18"}
                    height={"14"}
                    rx={"2"}
                  ></rect>
                  <path d={"M3 7l9 6 9-6"}></path>
                </svg>
              </span>
              <span>
                <b>{"Email chưa được xác minh."}</b>
                {" Mở liên kết trong email để kích hoạt tài khoản, hoặc "}
                <a
                  href={"CheckEmail.dc.html"}
                  style={styleOf(
                    "color: #B23A24; font-weight: 600; text-decoration: underline",
                  )}
                >
                  {"gửi lại email xác minh"}
                </a>
                {"."}
              </span>
            </>
          ) : null}
          {v.isLocked ? (
            <>
              <span style={styleOf("flex: none; margin-top: 1px")}>
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
                  <rect
                    x={"5"}
                    y={"11"}
                    width={"14"}
                    height={"9"}
                    rx={"2"}
                  ></rect>
                  <path d={"M8 11V8a4 4 0 0 1 8 0v3"}></path>
                </svg>
              </span>
              <span>
                <b>{"Tài khoản đang bị khóa."}</b>
                {" Liên hệ Quản lý hệ thống để được mở khóa."}
              </span>
            </>
          ) : null}
          {v.isWrong ? (
            <>
              <span style={styleOf("flex: none; margin-top: 1px")}>
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
                  <path d={"M12 3l10 18H2z"}></path>
                  <path d={"M12 10v5M12 18h.01"}></path>
                </svg>
              </span>
              <span>
                <b>{"Email hoặc mật khẩu không đúng."}</b>
                {" Kiểm tra lại rồi thử lần nữa."}
              </span>
            </>
          ) : null}
          {v.isCustom ? (
            <>
              <span style={styleOf("flex: none; margin-top: 1px")}>
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
                  <path d={"M12 3l10 18H2z"}></path>
                  <path d={"M12 10v5M12 18h.01"}></path>
                </svg>
              </span>
              <span>{v.message}</span>
            </>
          ) : null}
          {"\n"}
        </div>
        {"\n"}
      </>
    );
  }
}

export default AuthError;
