import React from "react";
import { styleOf, cssText } from "../../lib/styles";

class ResetPassword extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { pw: "", pw2: "", touched: false };
  }
  renderVals() {
    const pw = this.state.pw;
    const pw2 = this.state.pw2;
    const touched = this.state.touched;
    const short = pw.length < 8;
    const differ = pw !== pw2;
    const valid = !short && !differ;
    const tooShort = short && (touched || pw.length > 0);
    const mismatch = !short && differ && (touched || pw2.length > 0);
    const setPw = (e) => this.setState({ pw: e.target.value });
    const setPw2 = (e) => this.setState({ pw2: e.target.value });
    const save = (e) => {
      if (!valid) {
        if (e && e.preventDefault) {
          e.preventDefault();
        }
        this.setState({ touched: true });
      }
    };
    return {
      pw: pw,
      pw2: pw2,
      tooShort: tooShort,
      mismatch: mismatch,
      doneHref: valid ? "Login.dc.html" : "#",
      setPw: setPw,
      setPw2: setPw2,
      save: save,
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
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6",
          )}
        >
          {"\n"}
          <div
            style={styleOf(
              "min-height: 900px; background: #FCFBF7; padding: 48px 20px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 32px",
            )}
          >
            <a
              href={"Main.dc.html"}
              style={styleOf(
                "display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #352637; font-weight: 700; font-size: 19px",
              )}
            >
              <span
                style={styleOf(
                  "width: 32px; height: 32px; border-radius: 9px; background: #2963CC; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #FFFFFF",
                )}
              >
                {"IS"}
              </span>
              <span>{"IELTSpace"}</span>
            </a>
            <main
              style={styleOf(
                "width: 100%; max-width: 440px; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 36px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px",
              )}
            >
              <h1
                style={styleOf(
                  "margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #352637; ",
                )}
              >
                {"Đặt mật khẩu mới"}
              </h1>
              <p
                style={styleOf(
                  "margin: 0; font-size: 15px; line-height: 1.6; color: #6A5D6C; ",
                )}
              >
                {"Liên kết đặt lại chỉ dùng được một lần."}
              </p>
              <label
                htmlFor={"rp-new"}
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 6px",
                )}
              >
                <span
                  style={styleOf(
                    "font-size: 13.5px; font-weight: 600; color: #352637",
                  )}
                >
                  {"Mật khẩu mới"}
                </span>
                <input
                  id={"rp-new"}
                  type={"password"}
                  placeholder={"••••••••"}
                  value={v.pw}
                  onChange={v.setPw}
                  autoComplete={"new-password"}
                  style={styleOf(
                    "height: 46px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 12px; background: #FFFFFF; color: #352637; font: inherit; font-size: 15px; outline-color: #2963CC",
                  )}
                />
                <span style={styleOf("font-size: 12.5px; color: #706473")}>
                  {"Tối thiểu 8 ký tự"}
                </span>
              </label>
              <label
                htmlFor={"rp-confirm"}
                style={styleOf(
                  "display: flex; flex-direction: column; gap: 6px",
                )}
              >
                <span
                  style={styleOf(
                    "font-size: 13.5px; font-weight: 600; color: #352637",
                  )}
                >
                  {"Nhập lại mật khẩu mới"}
                </span>
                <input
                  id={"rp-confirm"}
                  type={"password"}
                  placeholder={"••••••••"}
                  value={v.pw2}
                  onChange={v.setPw2}
                  autoComplete={"new-password"}
                  style={styleOf(
                    "height: 46px; padding: 0 14px; box-sizing: border-box; width: 100%; border: 1.5px solid #8E8392; border-radius: 12px; background: #FFFFFF; color: #352637; font: inherit; font-size: 15px; outline-color: #2963CC",
                  )}
                />
              </label>
              {v.tooShort ? (
                <>
                  <div
                    style={styleOf(
                      "display: flex; align-items: flex-start; gap: 10px; background: #FBDCD3; border: 1px solid #F1B3A3; color: #B23A24; border-radius: 12px; padding: 10px 14px; font-size: 14px",
                    )}
                  >
                    <span
                      style={styleOf(
                        "flex: none; display: flex; padding-top: 1px",
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
                        <path d={"M12 3l10 18H2z"}></path>
                        <path d={"M12 10v5M12 18h.01"}></path>
                      </svg>
                    </span>
                    <span>{"Mật khẩu cần tối thiểu 8 ký tự."}</span>
                  </div>
                </>
              ) : null}
              {v.mismatch ? (
                <>
                  <div
                    style={styleOf(
                      "display: flex; align-items: flex-start; gap: 10px; background: #FBDCD3; border: 1px solid #F1B3A3; color: #B23A24; border-radius: 12px; padding: 10px 14px; font-size: 14px",
                    )}
                  >
                    <span
                      style={styleOf(
                        "flex: none; display: flex; padding-top: 1px",
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
                        <path d={"M12 3l10 18H2z"}></path>
                        <path d={"M12 10v5M12 18h.01"}></path>
                      </svg>
                    </span>
                    <span>{"Hai mật khẩu không khớp."}</span>
                  </div>
                </>
              ) : null}
              <a
                href={v.doneHref}
                onClick={v.save}
                style={styleOf(
                  "display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 999px; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 15px; text-decoration: none; ",
                )}
              >
                {"Cập nhật mật khẩu"}
              </a>
              <div style={styleOf("text-align: center; font-size: 14px")}>
                <a
                  href={"Login.dc.html"}
                  style={styleOf(
                    "color: #2963CC; font-weight: 600; text-decoration: none",
                  )}
                >
                  {"Quay lại đăng nhập"}
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
}

export default ResetPassword;
