import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import type {
  ScreenProps,
  AttemptState,
} from "../../components/attempts/types";
import React from "react";
class SpeakingTest extends React.Component<ScreenProps, AttemptState> {
  state: AttemptState = this.props.initialState || {};
  publishSnapshot() {
    this.props.onSnapshot?.({ state: this.state, model: { questions: [] } });
  }
  componentDidMount() {
    this.publishSnapshot();
  }
  componentDidUpdate(_previousProps: ScreenProps, previousState: AttemptState) {
    if (previousState !== this.state) this.publishSnapshot();
  }
  renderVals() {
    const accent = this.props.accent ?? "#2963CC";

    const sel = this.props.cheDo ?? "Bài thi đầy đủ";
    return {
      accent: accent,
      onAccent: accentForeground(accent),
      practice: sel === "Luyện tập",
    };
  }

  static defaultProps = { cheDo: "Bài thi đầy đủ", accent: "#2963CC" };
  render() {
    const v = this.renderVals();
    return (
      <>
        <div className="attempt-screen attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6]">
          <header className="[border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fcfbf7)]">
            <div className="[padding:0_32px] [min-height:68px] flex flex-wrap items-center [gap:12px_20px]">
              <PageLink
                page="StudentLanding"
                className="flex items-center [gap:10px] no-underline [color:var(--attempt-text-352637)] font-bold [font-size:18px]"
              >
                <span
                  className="w-8 h-8 [border-radius:10px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border flex items-center justify-center [font-weight:800] [font-size:13px]"
                  style={{ background: v.accent, color: v.onAccent }}
                >
                  {"IS"}
                </span>
                <span>{"IELTSpace"}</span>
              </PageLink>
              <div className="[padding-left:20px] [border-left:1.5px_solid_var(--attempt-line-e6e4e0)]">
                <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                  {v.practice
                    ? "Luyện Speaking / Part 2"
                    : "Thư viện đề / Practice Test 01 / Speaking"}
                </div>
                <div className="font-semibold">
                  {v.practice
                    ? "Luyện Speaking · Part 2 · A skill worth learning"
                    : "Speaking · Practice Test 01 · bài thi đầy đủ"}
                </div>
              </div>
              <div className="ml-auto flex flex-wrap items-center [gap:10px]">
                <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] [font-size:13px] font-semibold whitespace-nowrap">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                  {this.props.timeText}
                </span>
                <button
                  type="button"
                  onClick={this.props.onExit}
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                >
                  {"Lưu và thoát"}
                </button>
                <button
                  type="button"
                  onClick={this.props.onSubmit}
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border font-semibold [font-size:14px] no-underline whitespace-nowrap"
                  style={{ background: v.accent, color: v.onAccent }}
                >
                  {"Hoàn thành"}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>
          <div className="attempt-workspace flex flex-wrap items-stretch [background:var(--attempt-bg-faf9f5)]">
            <div className="[flex:1_1_420px] [padding:28px_32px] [border-right:1.5px_solid_var(--attempt-line-d6d4d0)]">
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:13px] font-semibold whitespace-nowrap">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7"></path>
                    </svg>
                    {"Part 1"}
                  </span>
                  <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-352637)] [color:#FFFFFF] [font-size:13px] font-semibold whitespace-nowrap">
                    {"Part 2"}
                  </span>
                  <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] [font-size:13px] font-semibold whitespace-nowrap">
                    {"Part 3"}
                  </span>
                </div>
                <div className="p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col gap-3">
                    <div className="[font-size:13px] font-semibold [letter-spacing:.08em] uppercase [color:var(--attempt-text-706473)]">
                      {"Part 2 · cue card"}
                    </div>
                    <h2 className="m-0 [font-size:22px] [letter-spacing:-0.015em] attempt-sans [letter-spacing:-0.015em]">
                      {"Describe a skill you would like to learn"}
                    </h2>
                    <div className="[font-size:16px] [line-height:1.8] [color:var(--attempt-text-352637)]">
                      {"You should say:"}
                      <ul className="[margin:6px_0_6px_18px] p-0">
                        <li>{"what the skill is"}</li>
                        <li>{"why you want to learn it"}</li>
                        <li>{"how you would learn it"}</li>
                      </ul>
                      {"and explain how it would help you in the future."}
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)] [font-size:13px] font-semibold whitespace-nowrap">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M12 7v5l3 2"></path>
                        </svg>
                        {"Chuẩn bị 1 phút"}
                      </span>
                      <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)] [font-size:13px] font-semibold whitespace-nowrap">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                          <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                        </svg>
                        {"Nói 1 đến 2 phút"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex [gap:10px] items-start [padding:12px_16px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px]">
                  <span className="[flex:0_0_18px] [margin-top:2px]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
                    </svg>
                  </span>
                  <span>
                    {
                      "Trình duyệt chưa cho phép dùng micro? Bấm biểu tượng ổ khóa trên thanh địa chỉ và cho phép micro. Phần Speaking chỉ bắt đầu khi ghi âm được."
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="[flex:1_1_420px] [padding:28px_32px]">
              <div className="p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                <div className="flex flex-col [gap:14px]">
                  <div className="font-semibold">{"Ghi âm câu trả lời"}</div>
                  <div className="flex items-center justify-center gap-1 [height:120px] [border-radius:18px] [background:var(--attempt-bg-e8e4fa)] [border:1.5px_solid_var(--attempt-line-d6d4d0)]">
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:10px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:22px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:34px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:18px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-10"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:26px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-3"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:30px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-11"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-5"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-9"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:14px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-7"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:38px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-4"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-6"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-8"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-3"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:26px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:18px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:34px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:22px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] [height:10px]"></span>
                    <span className="w-1 [border-radius:2px] [background:var(--attempt-bg-5543b0)] h-7"></span>
                  </div>
                  <div className="text-center [font-size:32px] font-bold [letter-spacing:-0.02em] font-sans tabular-nums [letter-spacing:-0.015em]">
                    {"01:12"}
                  </div>
                  {v.practice ? (
                    <div className="flex [gap:14px] items-center justify-center">
                      <a
                        href="#"
                        className="inline-flex items-center justify-center gap-2 [height:46px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 5l11 7-11 7z"></path>
                        </svg>
                        {"Nghe lại"}
                      </a>
                      <a
                        href="#"
                        className="inline-flex items-center justify-center gap-2 [height:46px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 12a9 9 0 1 1-3-6.7L21 8"></path>
                          <path d="M21 3v5h-5"></path>
                        </svg>
                        {"Ghi lại Part này"}
                      </a>
                    </div>
                  ) : (
                    <div className="flex [gap:14px] items-center justify-center">
                      <span
                        className="w-16 h-16 [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-c0412a)] [color:#FFFFFF] flex items-center justify-center"
                        role="img"
                        aria-label="Đang ghi"
                      >
                        <span className="w-5 h-5 [border-radius:5px] [background:var(--attempt-bg-ffffff)]"></span>
                      </span>
                    </div>
                  )}
                  <div className="[font-size:13px] [color:var(--attempt-text-706473)] text-center">
                    {v.practice
                      ? "Bài luyện: bạn được ghi lại Part này trước khi hoàn thành, chỉ bản ghi cuối cùng được lưu. Kết quả chấm là đánh giá cho Part 2, không phải band toàn kỹ năng."
                      : "Bài thi đầy đủ: mỗi Part chỉ ghi âm một lần, không ghi lại. Hoàn thành xong, bài được lưu 14 ngày và bạn có thể gửi yêu cầu chấm."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default SpeakingTest;
