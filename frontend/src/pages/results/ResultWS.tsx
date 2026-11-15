import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import LearnerHeader from "../../components/navigation/LearnerHeader";
function ResultWS(props: { accent?: string }) {
  const accent = props.accent ?? "#2963CC";
  return (
    <>
      <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6] [min-height:1180px]">
        <LearnerHeader
          onAccent={accentForeground(accent)}
          accent={accent}
        ></LearnerHeader>
        <div className="[background:var(--attempt-bg-fcfbf7)] [min-height:1111px]">
          <main className="[max-width:1200px] [margin:0_auto] [padding:36px_24px_56px] flex flex-col gap-6">
            <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
              <PageLink
                page="MyWS"
                className="[color:var(--attempt-text-706473)] no-underline"
              >
                {"Bài Writing và Speaking của tôi"}
              </PageLink>
              {" / Practice Test 01 / Writing Task 2"}
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="m-0 [font-size:28px] [line-height:1.25] [letter-spacing:-0.02em] attempt-sans [letter-spacing:-0.015em]">
                  {"Kết quả Writing Task 2"}
                </h1>
                <div className="[font-size:15px] [color:var(--attempt-text-706473)] mt-1">
                  {"Public transport and traffic"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
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
                  {"Đã có kết quả"}
                </span>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                    <path d="M12 4v12M7 11l5 5 5-5M4 20h16"></path>
                  </svg>
                  {"Tải .docx"}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-[var(--attempt-line-d6d4d0,#D6D4D0)] border-[1.5px] border-[var(--attempt-line-d6d4d0,#D6D4D0)] rounded-[22px] bg-[var(--attempt-bg-ffffff,#FFFFFF)] shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col gap-0.5 sm:border-r sm:border-b lg:border-b-0 border-[var(--attempt-line-d6d4d0,#D6D4D0)]">
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"Điểm Task 2"}
                </div>
                <div className="text-2xl sm:text-[28px] font-bold tracking-tight font-sans tabular-nums text-[var(--attempt-text-352637,#352637)]">
                  {"6.5"}
                </div>
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"đánh giá cho Task 2, không phải band toàn kỹ năng"}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-0.5 lg:border-r sm:border-b lg:border-b-0 border-[var(--attempt-line-d6d4d0,#D6D4D0)]">
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"Số từ"}
                </div>
                <div className="text-2xl sm:text-[28px] font-bold tracking-tight font-sans tabular-nums text-[var(--attempt-text-352637,#352637)]">
                  {"271"}
                </div>
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"yêu cầu từ 250"}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-0.5 sm:border-r border-[var(--attempt-line-d6d4d0,#D6D4D0)]">
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"Công bố"}
                </div>
                <div className="text-2xl sm:text-[28px] font-bold tracking-tight font-sans tabular-nums text-[var(--attempt-text-352637,#352637)]">
                  {"22/10/2026"}
                </div>
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"yêu cầu đã dùng 1 lượt miễn phí"}
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-0.5">
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"Nội dung bài"}
                </div>
                <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-[var(--attempt-text-352637,#352637)]">
                  {"đến 05/11"}
                </div>
                <div className="text-xs sm:text-[13px] text-[var(--attempt-text-706473,#706473)]">
                  {"sau đó chỉ còn điểm và nhận xét"}
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:flex-[1.5] min-w-0 flex flex-col gap-6">
                <div className="p-6 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col [gap:14px]">
                    <div className="[font-size:18px] font-semibold">
                      {"Bài làm kèm nhận xét"}
                    </div>
                    <div className="[font-size:15px] [line-height:1.85] [color:var(--attempt-text-352637)]">
                      {
                        "In recent years, the question of how best to spend public money on transport has become "
                      }
                      <mark className="[background:var(--attempt-bg-fbedbf)] [padding:0_2px]">
                        {"increasingly controversial"}
                      </mark>
                      {
                        ". While some argue that new roads are necessary to reduce congestion, I strongly believe that investment in public transport is a more effective long-term solution. Firstly, an efficient network of buses and trains can carry far more passengers than private cars, "
                      }
                      <mark className="[background:var(--attempt-bg-fbdcd3)] [padding:0_2px]">
                        {"which reduce"}
                      </mark>
                      {" both traffic and air pollution."}
                    </div>
                    <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px]">
                      <b>{"Lỗi ngữ pháp:"}</b>
                      {
                        ' "which reduce" nên là "which reduces" (chủ ngữ là cả mệnh đề trước).'
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                <div className="p-6 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="[font-size:18px] font-semibold [margin-bottom:6px]">
                    {"Điểm theo tiêu chí"}
                  </div>
                  <div className="flex items-center justify-between [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                    <span>{"Task Achievement / Task Response"}</span>
                    <span className="font-bold [color:var(--attempt-text-7a5a0e)]">
                      {"6.5"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                    <span>{"Coherence and Cohesion"}</span>
                    <span className="font-bold [color:var(--attempt-text-7a5a0e)]">
                      {"7.0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                    <span>{"Lexical Resource"}</span>
                    <span className="font-bold [color:var(--attempt-text-7a5a0e)]">
                      {"6.5"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                    <span>{"Grammatical Range and Accuracy"}</span>
                    <span className="font-bold [color:var(--attempt-text-7a5a0e)]">
                      {"6.0"}
                    </span>
                  </div>
                </div>
                <div className="p-6 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col gap-3">
                    <div className="[font-size:18px] font-semibold">
                      {"Nhận xét của giáo viên"}
                    </div>
                    <div className="flex [gap:10px] items-center">
                      <span className="w-9 h-9 [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-c5cef5)] inline-flex items-center justify-center font-bold [font-size:14px] [color:var(--attempt-text-352637)]">
                        {"LH"}
                      </span>
                      <div>
                        <div className="font-semibold">{"Cô Lan Hương"}</div>
                        <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                          {"Công bố 22/10/2026 16:30"}
                        </div>
                      </div>
                    </div>
                    <div className="[font-size:14px] [color:var(--attempt-text-4b3d4d)]">
                      {
                        "Bài có lập trường rõ ràng và ví dụ phù hợp. Em cần mở rộng ý ở đoạn thân bài 2 và chú ý hòa hợp chủ ngữ và động từ. Gợi ý: luyện viết câu phức với mệnh đề quan hệ."
                      }
                    </div>
                  </div>
                </div>
                <div className="[padding:22px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col [gap:10px]">
                    <div className="[font-size:18px] font-semibold">
                      {"Các mốc của yêu cầu"}
                    </div>
                    <div className="flex [gap:10px] items-start [font-size:14px]">
                      <span className="[width:10px] [height:10px] [margin-top:6px] [border-radius:50%] [background:var(--attempt-bg-b3a9b5)] [flex:0_0_10px]"></span>
                      <div>
                        <b>{"Hoàn thành và lưu bài"}</b>
                        <div className="[color:var(--attempt-text-706473)] [font-size:13px]">
                          {"20/10 10:05"}
                        </div>
                      </div>
                    </div>
                    <div className="flex [gap:10px] items-start [font-size:14px]">
                      <span className="[width:10px] [height:10px] [margin-top:6px] [border-radius:50%] [background:var(--attempt-bg-b3a9b5)] [flex:0_0_10px]"></span>
                      <div>
                        <b>{"Gửi yêu cầu chấm"}</b>
                        <div className="[color:var(--attempt-text-706473)] [font-size:13px]">
                          {"20/10 10:12 · dùng lượt miễn phí tuần 19/10"}
                        </div>
                      </div>
                    </div>
                    <div className="flex [gap:10px] items-start [font-size:14px]">
                      <span className="[width:10px] [height:10px] [margin-top:6px] [border-radius:50%] [background:var(--attempt-bg-b3a9b5)] [flex:0_0_10px]"></span>
                      <div>
                        <b>{"Hệ thống phân công"}</b>
                        <div className="[color:var(--attempt-text-706473)] [font-size:13px]">
                          {"20/10 14:05 · Cô Lan Hương"}
                        </div>
                      </div>
                    </div>
                    <div className="flex [gap:10px] items-start [font-size:14px]">
                      <span className="[width:10px] [height:10px] [margin-top:6px] [border-radius:50%] [background:var(--attempt-bg-2e6a48)] [flex:0_0_10px]"></span>
                      <div>
                        <b>{"Công bố kết quả"}</b>
                        <div className="[color:var(--attempt-text-706473)] [font-size:13px]">
                          {"22/10 16:30"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
export default ResultWS;
