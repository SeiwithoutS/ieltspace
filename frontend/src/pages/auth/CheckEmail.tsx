import React from "react";
import { styleOf, cssText } from "../../lib/shared/styles";
import { getEmailVerification, resendVerification } from "../../lib/auth/auth";

class CheckEmail extends React.Component<Record<never, never>, {
    left: number; message: string; error: string; busy: boolean;
}> {
    private timer?: ReturnType<typeof setInterval>;
    private mounted = false;
    state = { left: this.secondsRemaining(), message: "", error: "", busy: false };
    secondsRemaining() {
        return Math.max(0, Math.ceil(((getEmailVerification()?.availableAt ?? 0) - Date.now()) / 1000));
    }
    componentDidMount() {
        this.mounted = true;
        this.timer = setInterval(() => {
            const left = this.secondsRemaining();
            if (left !== this.state.left) this.setState({ left });
        }, 1000);
    }
    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.timer);
    }
    resend = async () => {
        const email = getEmailVerification()?.email;
        if (!email || this.state.busy || this.secondsRemaining() > 0) return;
        this.setState({ busy: true, message: "", error: "" });
        try {
            const message = await resendVerification(email);
            if (this.mounted) this.setState({ message });
        } catch (error) {
            if (this.mounted) this.setState({ error: error instanceof Error ? error.message : "Chưa thể gửi yêu cầu xác minh." });
        } finally {
            if (this.mounted) this.setState({ busy: false, left: this.secondsRemaining() });
        }
    };
    render() {
        const email = getEmailVerification()?.email;
        const { left, message, error, busy } = this.state;
        return (<>
        {"\n"}
        {"\n"}
        <style>
          {cssText("\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n")}
        </style>
        {"\n"}
        {"\n"}
        <div style={styleOf("font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; background: #FCFBF7; font-size: 15px; line-height: 1.6")}>
          {"\n"}
          <div style={styleOf("min-height: 900px; background: #FCFBF7; padding: 48px 20px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 32px")}>
            <a href={"Main.dc.html"} style={styleOf("display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #352637; font-weight: 700; font-size: 18px")}>
              <span style={styleOf("width: 32px; height: 32px; border-radius: 10px; background: #2963CC; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #FFFFFF")}>
                {"IS"}
              </span>
              <span>{"IELTSpace"}</span>
            </a>
            <main style={styleOf("width: 100%; max-width: 440px; background: #FFFFFF; border: 1.5px solid #D6D4D0; border-radius: 22px; box-shadow: 0 1px 2px rgba(53, 38, 55, 0.04), 0 8px 24px rgba(53, 38, 55, 0.07); padding: 36px 32px; box-sizing: border-box; display: flex; flex-direction: column; gap: 18px")}>
              <div style={styleOf("width: 52px; height: 52px; border-radius: 16px; background: #DCEDE2; color: #2E6A48; display: flex; align-items: center; justify-content: center")}>
                <svg width={"24"} height={"24"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}>
                  <rect x={"3"} y={"5"} width={"18"} height={"14"} rx={"2"}></rect>
                  <path d={"M3 7l9 6 9-6"}></path>
                </svg>
              </div>
              <h1 style={styleOf("margin: 0; font-family: 'IBM Plex Serif', Georgia, serif; font-size: 28px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #352637; ")}>
                {"Kiểm tra email để xác minh"}
              </h1>
              <p style={styleOf("margin: 0; font-size: 15px; line-height: 1.6; color: #706473; ")}>
                {email ? <>Hãy kiểm tra thư xác minh tại <b>{email}</b>. Mở liên kết trong email trước khi đăng nhập.</>
                  : "Mở trang này từ luồng đăng nhập hoặc đăng ký để xác định email cần xác minh."}
              </p>
              <div style={styleOf("display: flex; align-items: flex-start; gap: 10px; background: #E3ECFD; border-radius: 12px; padding: 12px 14px; font-size: 14px; color: #4B3D4D")}>
                <span style={styleOf("flex: none; display: flex; padding-top: 1px")}>
                  <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"}>
                    <circle cx={"12"} cy={"12"} r={"9"}></circle>
                    <path d={"M12 7v5l3 2"}></path>
                  </svg>
                </span>
                <span>
                  {left > 0 ? `Bạn có thể gửi lại sau ${left} giây.` : "Bạn có thể yêu cầu liên kết mới nếu chưa nhận được email hoặc liên kết đã hết hạn."}
                </span>
              </div>
              {message && <div role="status" style={styleOf("font-size: 14px; font-weight: 600; color: #2E6A48")}>{message}</div>}
              {error && <div role="alert" style={styleOf("font-size: 14px; color: #C0412A")}>{error}</div>}
              {email && <button type="button" onClick={() => void this.resend()} disabled={busy || left > 0}
                className="disabled:opacity-60" style={styleOf("display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 999px; border: 1.5px solid #D6D4D0; background: #FFFFFF; color: #352637; font: inherit; font-weight: 600")}>
                {busy ? "Đang gửi yêu cầu…" : "Gửi lại email xác minh"}
              </button>}
              <a href={"Login.dc.html"} style={styleOf("display: flex; align-items: center; justify-content: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 999px; background: #352637; color: #FFFFFF; font-weight: 600; font-size: 15px; text-decoration: none; ")}>
                {"Đã xác minh, đi đến đăng nhập"}
              </a>
              <div style={styleOf("text-align: center; font-size: 14px")}>
                <a href={"Register.dc.html"} style={styleOf("color: #2963CC; font-weight: 600; text-decoration: none")}>
                  {"Đổi email đăng ký"}
                </a>
              </div>
            </main>
          </div>
          {"\n"}
        </div>
        {"\n"}
      </>);
    }
}
export default CheckEmail;
