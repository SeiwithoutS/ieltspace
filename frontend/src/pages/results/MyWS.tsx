import PageLink from "../../components/navigation/PageLink";
import { accentForeground } from "../../components/attempts/appearance";
import Popup from "../../components/attempts/Popup";
import React from "react";
import LearnerHeader from "../../components/attempts/LearnerHeader";
function MyWS(props: { accent?: string }) {
  const [request, setRequest] = React.useState(false);
  const accent = props.accent ?? "#2963CC";
  return (
    <>
      <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6] [min-height:1150px]">
        <LearnerHeader
          onAccent={accentForeground(accent)}
          accent={accent}
        ></LearnerHeader>
        <div className="[background:var(--attempt-bg-fcfbf7)] [min-height:1081px]">
          <main className="[max-width:1280px] [margin:0_auto] [padding:36px_24px_56px] flex flex-col gap-6">
            <div className="flex justify-between [align-items:flex-end] gap-4">
              <div>
                <h1 className="m-0 [font-size:28px] [line-height:1.25] [letter-spacing:-0.02em] attempt-sans [letter-spacing:-0.015em]">
                  {"Bài Writing và Speaking của tôi"}
                </h1>
                <div className="[font-size:15px] [color:var(--attempt-text-706473)] mt-1">
                  {
                    "Bài đã hoàn thành, trạng thái yêu cầu chấm và thời hạn nội dung."
                  }
                </div>
              </div>
              <div className="flex [gap:10px]">
                <PageLink
                  page="PracticeWS"
                  className="inline-flex items-center justify-center gap-2 h-11 [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                >
                  {"Luyện Writing, Speaking"}
                </PageLink>
              </div>
            </div>
            <div className="flex flex-wrap [gap:14px] items-center">
              <div className="inline-flex [gap:2px] [padding:3px] [border-radius:10px] [background:var(--attempt-bg-f3f0ea)]">
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [background:var(--attempt-bg-ffffff)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:13px] font-semibold">
                  {"Tất cả"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Writing"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Speaking"}
                </span>
              </div>
              <div className="inline-flex [gap:2px] [padding:3px] [border-radius:10px] [background:var(--attempt-bg-f3f0ea)]">
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [background:var(--attempt-bg-ffffff)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:13px] font-semibold">
                  {"Mọi trạng thái"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Chưa gửi chấm"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Chờ phân công"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Chờ chấm"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Đã có kết quả"}
                </span>
                <span className="inline-flex items-center [height:34px] [padding:0_14px] rounded-lg [border:1.5px_solid_transparent] [color:var(--attempt-text-706473)] [font-size:13px] font-medium">
                  {"Đã hủy"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 items-start">
              <div className="[flex:1_1_420px] min-w-0 flex flex-col gap-6">
                <div className="[padding:22px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col gap-3">
                    <div className="[font-size:18px] font-semibold">
                      {"Lượt hỗ trợ chấm còn hiệu lực"}
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 [padding:14px] rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)]">
                        <div className="[font-size:28px] font-bold [color:var(--attempt-text-2e6a48)] font-sans tabular-nums [letter-spacing:-0.015em]">
                          {"1"}
                        </div>
                        <div className="font-semibold">{"Lượt miễn phí"}</div>
                        <div className="[font-size:13px] [color:var(--attempt-text-4b3d4d)]">
                          {"Hết hạn 00:00 thứ Hai 26/10"}
                        </div>
                      </div>
                      <div className="flex-1 [padding:14px] rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-e8e4fa)]">
                        <div className="[font-size:28px] font-bold [color:var(--attempt-text-5543b0)] font-sans tabular-nums [letter-spacing:-0.015em]">
                          {"1"}
                        </div>
                        <div className="font-semibold">{"Lượt bonus"}</div>
                        <div className="[font-size:13px] [color:var(--attempt-text-4b3d4d)]">
                          {"Hết hạn hết Chủ nhật 01/11"}
                        </div>
                      </div>
                    </div>
                    <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                      {
                        "Mỗi tuần (từ 00:00 thứ Hai, giờ Việt Nam) bạn có 1 lượt miễn phí dùng chung Writing và Speaking, không cộng dồn. Bonus được hoàn khi yêu cầu bị hủy vì quá 72 giờ chưa có giáo viên hoặc giáo viên không thể hoàn thành."
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="[flex:1_1_320px] min-w-0 flex flex-col gap-6">
                <div className="[padding:22px] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]">
                  <div className="flex flex-col [gap:2px]">
                    <div className="[font-size:18px] font-semibold">
                      {"Thời hạn lưu nội dung"}
                    </div>
                    <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                      <span className="[color:var(--attempt-text-706473)]">
                        {"Bài chưa gửi chấm"}
                      </span>
                      <span className="font-semibold [text-align:right]">
                        {"14 ngày từ lúc hoàn thành"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                      <span className="[color:var(--attempt-text-706473)]">
                        {"Đang chờ phân công hoặc chờ chấm"}
                      </span>
                      <span className="font-semibold [text-align:right]">
                        {"Tạm giữ, không xóa"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                      <span className="[color:var(--attempt-text-706473)]">
                        {"Yêu cầu bị hủy"}
                      </span>
                      <span className="font-semibold [text-align:right]">
                        {"Quay về hạn ban đầu"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 [padding:9px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px]">
                      <span className="[color:var(--attempt-text-706473)]">
                        {"Đã có kết quả"}
                      </span>
                      <span className="font-semibold [text-align:right]">
                        {"14 ngày từ lúc công bố"}
                      </span>
                    </div>
                    <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                      {
                        "Hết hạn thì bài viết, bản ghi âm bị xóa; điểm và nhận xét vẫn được giữ. Xem hay tải bài không gia hạn."
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="[border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden">
              <div className="[padding:18px_20px_14px] flex justify-between items-center gap-3 flex-wrap">
                <div>
                  <div className="[font-size:18px] font-semibold">
                    {"6 bài trong 30 ngày"}
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 [font-size:13px] [color:var(--attempt-text-706473)]">
                  <span
                    aria-label="Chưa xem"
                    className="[display:inline-block] w-2 h-2 [border-radius:50%] [background:var(--attempt-bg-e5604a)] [flex:0_0_8px]"
                  ></span>
                  {" mới có kết quả hoặc vừa bị hủy"}
                </span>
              </div>
              <div className="[overflow-x:auto]">
                <table className="w-full [border-collapse:collapse]">
                  <thead>
                    <tr>
                      <th className="[text-align:left] [padding:12px_16px] [font-size:13px] font-semibold [color:var(--attempt-text-706473)] [background:var(--attempt-bg-faf9f5)] [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] whitespace-nowrap">
                        {"Bài"}
                      </th>
                      <th className="[text-align:left] [padding:12px_16px] [font-size:13px] font-semibold [color:var(--attempt-text-706473)] [background:var(--attempt-bg-faf9f5)] [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] whitespace-nowrap">
                        {"Kỹ năng"}
                      </th>
                      <th className="[text-align:left] [padding:12px_16px] [font-size:13px] font-semibold [color:var(--attempt-text-706473)] [background:var(--attempt-bg-faf9f5)] [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] whitespace-nowrap">
                        {"Trạng thái"}
                      </th>
                      <th className="[text-align:left] [padding:12px_16px] [font-size:13px] font-semibold [color:var(--attempt-text-706473)] [background:var(--attempt-bg-faf9f5)] [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] whitespace-nowrap">
                        {"Nội dung bài"}
                      </th>
                      <th className="[text-align:left] [padding:12px_16px] [font-size:13px] font-semibold [color:var(--attempt-text-706473)] [background:var(--attempt-bg-faf9f5)] [border-bottom:1.5px_solid_var(--attempt-line-d6d4d0)] whitespace-nowrap"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Writing Task 2 · Public transport"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 20/10 10:05"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Writing"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Đã có kết quả · 6.5"}
                          </span>
                          <span
                            aria-label="Chưa xem"
                            className="[display:inline-block] w-2 h-2 [border-radius:50%] [background:var(--attempt-bg-e5604a)] [flex:0_0_8px]"
                          ></span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Giữ đến 05/11"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="flex flex-wrap [gap:6px]">
                          <PageLink
                            page="ResultWS"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                          >
                            {"Xem kết quả"}
                          </PageLink>
                          <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Speaking Part 2 · A skill worth learning"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 22/10 20:30"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Speaking"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dde8fc)] [color:var(--attempt-text-2a55b8)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Chờ chấm · phân công 22/10 20:40"}
                          </span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Tạm giữ"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="flex flex-wrap [gap:6px]">
                          <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                            {"Tải ghi âm"}
                          </a>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Writing Task 1 Academic · Energy use"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 21/10 08:55"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Writing"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Chờ phân công · còn 21 giờ"}
                          </span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Tạm giữ"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="flex flex-wrap [gap:6px]">
                          <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Speaking Part 3 · Technology"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 18/10 19:40"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-e8e4fa)] [color:var(--attempt-text-5543b0)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Speaking"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Đã hủy · đã hoàn 1 bonus"}
                          </span>
                          <span
                            aria-label="Chưa xem"
                            className="[display:inline-block] w-2 h-2 [border-radius:50%] [background:var(--attempt-bg-e5604a)] [flex:0_0_8px]"
                          ></span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Hạn ban đầu 01/11"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="flex flex-wrap [gap:6px]">
                          <button
                            type="button"
                            onClick={() => setRequest(true)}
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                          >
                            {"Gửi lại yêu cầu"}
                          </button>
                          <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                            {"Tải ghi âm"}
                          </a>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Writing Task 2 · Online education"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 22/10 21:15"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Writing"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-dddbd7)] [background:var(--attempt-bg-f3f0ea)] [color:var(--attempt-text-706473)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Đã lưu · chưa gửi chấm"}
                          </span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Giữ đến 05/11"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="flex flex-wrap [gap:6px]">
                          <button
                            type="button"
                            onClick={() => setRequest(true)}
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-352637)] box-border [background:var(--attempt-bg-352637)] [color:#FFFFFF] font-semibold [font-size:14px] no-underline whitespace-nowrap"
                          >
                            {"Gửi yêu cầu chấm"}
                          </button>
                          <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 [height:34px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap"
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
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <div>
                          <div className="font-semibold">
                            {"Writing Task 1 General · Complaint letter"}
                          </div>
                          <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
                            {"Hoàn thành 02/10 09:30"}
                          </div>
                        </div>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:0_solid_transparent] [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:13px] font-semibold whitespace-nowrap">
                          {"Writing"}
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-dddbd7)] [background:var(--attempt-bg-f3f0ea)] [color:var(--attempt-text-706473)] [font-size:13px] font-semibold whitespace-nowrap">
                            {"Chưa có điểm"}
                          </span>
                        </span>
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        {"Nội dung đã hết hạn 16/10"}
                      </td>
                      <td className="[padding:13px_16px] [border-top:1px_solid_var(--attempt-line-e6e4e0)] [font-size:14px] [vertical-align:middle]">
                        <span className="[font-size:13px] [color:var(--attempt-text-706473)]">
                          {"Không mở hoặc tải được"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {request && (
        <Popup
          title="Gửi yêu cầu hỗ trợ chấm"
          onCancel={() => setRequest(false)}
        >
          <section className="attempt-card flex flex-col gap-4">
            <h2>Gửi yêu cầu hỗ trợ chấm?</h2>
            <p>
              Ở phiên bản giao diện mẫu, yêu cầu chấm chưa được gửi tới giáo
              viên.
            </p>
            <button className="primary" onClick={() => setRequest(false)}>
              Đã hiểu
            </button>
          </section>
        </Popup>
      )}
    </>
  );
}
export default MyWS;
