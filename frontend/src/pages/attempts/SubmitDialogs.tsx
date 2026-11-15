import {useRef} from "react";
import PageLink from "../../components/navigation/PageLink";

function SubmitDialogs() {
  const requestSection = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6] [min-height:1240px]">
        <div className="[min-height:1240px] [background:linear-gradient(135deg,_var(--attempt-bg-e3ecfd)_0%,_var(--attempt-bg-e6f3ec)_100%)] [padding:48px_40px] box-border flex flex-wrap gap-7 justify-center [align-content:flex-start]">
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-e3ecfd)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Nộp bài Reading?"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {
                "Bạn đã trả lời 36 trên 40 câu. Còn 4 câu chưa làm: 12, 19, 27, 33. Câu bỏ trống được tính là không đúng."
              }
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <button
                type="button"
                data-ab=""
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Quay lại làm tiếp"}
              </button>
              <PageLink
                page="ResultLR"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Nộp bài"}
              </PageLink>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbedbf)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 2"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Đã hết giờ"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {
                "Hệ thống đã tự hoàn thành lượt làm với các câu trả lời đã được lưu. Bạn có thể xem kết quả ngay."
              }
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <PageLink
                page="ResultLR"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Xem kết quả"}
              </PageLink>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dde8fc)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h9l4 4v14H6z"></path>
                <path d="M14 3v5h5"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Lưu và thoát?"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {
                "Câu trả lời được lưu tự động lên máy chủ. Bạn có thể mở lại lượt làm dở để làm tiếp trong thời gian còn lại; hết thời gian, hệ thống hoàn thành lượt làm với phần đã lưu."
              }
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <button
                type="button"
                data-ab=""
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Ở lại"}
              </button>
              <PageLink
                page="StudentLanding"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Lưu và thoát"}
              </PageLink>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbedbf)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 5l4 4L8 20H4v-4z"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Hoàn thành bài Writing?"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {
                "Bài viết được lưu với thời hạn 14 ngày. Hoàn thành không tự gửi chấm và không dùng lượt hỗ trợ. Sau khi hoàn thành, bài không sửa được nữa."
              }
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <button
                type="button"
                data-ab=""
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Quay lại bài làm"}
              </button>
              <PageLink
                page="MyWS"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Hoàn thành"}
              </PageLink>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Đã lưu bài Writing Task 2"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {"Nội dung được giữ đến "}
              <b>{"05/11/2026"}</b>
              {
                ". Trong thời gian này bạn có thể xem lại, tải về hoặc gửi yêu cầu chấm."
              }
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <button
                type="button"
                data-ab=""
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
              </button>
              <button type="button" onClick={()=>requestSection.current?.focus()}
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Gửi yêu cầu chấm"}
              </button>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span
              
              className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-e3ecfd)] flex items-center justify-center"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </span>
            <div ref={requestSection} tabIndex={-1} className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Gửi yêu cầu hỗ trợ chấm?"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {"Writing Task 2 · Online education"}
              <div className="mt-3 flex flex-col [gap:0]">
                <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                  <span className="[color:var(--attempt-text-706473)]">
                    {"Lượt miễn phí tuần này"}
                  </span>
                  <span className="font-semibold [text-align:right]">
                    {"Còn 1 · hết hạn 00:00 thứ Hai 26/10"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                  <span className="[color:var(--attempt-text-706473)]">
                    {"Lượt bonus"}
                  </span>
                  <span className="font-semibold [text-align:right]">
                    {"Còn 1 · hết hạn hết Chủ nhật 01/11"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                  <span className="[color:var(--attempt-text-706473)]">
                    {"Sẽ dùng"}
                  </span>
                  <span className="font-semibold [text-align:right]">
                    {"Lượt miễn phí (hết hạn sớm hơn)"}
                  </span>
                </div>
              </div>
              <div className="[margin-top:10px] [font-size:13px] [color:var(--attempt-text-706473)]">
                {
                  "Chờ phân công giáo viên tối đa 72 giờ. Quá hạn, yêu cầu tự hủy và bạn được hoàn 1 bonus. Nội dung bài được giữ trong lúc chờ."
                }
              </div>
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <button
                type="button"
                data-ab=""
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_#F1B3A3] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-c0412a)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Hủy"}
              </button>
              <PageLink
                page="MyWS"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Xác nhận gửi"}
              </PageLink>
            </div>
          </div>
          <div className="[width:470px] [max-width:100%] p-7 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:26px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] flex flex-col [gap:14px]">
            <span className="w-11 h-11 rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbdcd3)] flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3l10 18H2z"></path>
                <path d="M12 10v5M12 18h.01"></path>
              </svg>
            </span>
            <div className="[font-size:20px] font-bold [letter-spacing:-0.01em] attempt-sans [letter-spacing:-0.015em]">
              {"Chưa gửi được yêu cầu"}
            </div>
            <div className="[color:var(--attempt-text-706473)]">
              {
                "Bạn không còn lượt hợp lệ. Lượt miễn phí mới được cấp lúc 00:00 thứ Hai. Bài vẫn giữ đến hạn 05/11/2026 nên bạn có thể gửi lại khi có lượt."
              }
              <div className="[margin-top:10px] [font-size:13px] [color:var(--attempt-text-706473)]">
                {
                  "Các lý do khác: nội dung đã hết hạn, bài đang có yêu cầu hoạt động, bài đã có kết quả. Không lý do nào làm mất lượt."
                }
              </div>
            </div>
            <div className="flex flex-wrap [gap:10px] justify-end [margin-top:6px]">
              <PageLink
                page="MyWS"
                className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
              >
                {"Đã hiểu"}
              </PageLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubmitDialogs;
