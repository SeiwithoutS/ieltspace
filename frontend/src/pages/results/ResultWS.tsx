import { useEffect, useState } from "react";
import PageLink from "../../components/navigation/PageLink";
import LearnerHeader from "../../components/navigation/LearnerHeader";
import RecordingList from "../../components/attempts/RecordingList";
import { accentForeground } from "../../components/attempts/appearance";
import { getRecordingUrl } from "../../lib/attempts/skill-attempts-api";
import { downloadRecordingsZip, recordingErrorMessage } from "../../lib/attempts/recording-download";
import { downloadWritingDocx, writingContentError } from "../../lib/attempts/writing-download";
import { cancellationText, formatGradingDate, gradingStatusName } from "../../lib/grading/grading";
import { formatReviewDay, getLearnerReview, hasReviewContent, initials, reviewRecordings, reviewScope,
  sectionLabel, type ReviewDetails } from "../../lib/grading/review";

const card = "p-6 [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]";
const hint = "[font-size:13px] [color:var(--attempt-text-706473)]";
const heading = "[font-size:18px] font-semibold";

export default function ResultWS({ accent = "#2963CC", attemptId }: { accent?: string; attemptId?: string }) {
  const [data, setData] = useState<ReviewDetails>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!attemptId) return;
    let active = true;
    getLearnerReview(attemptId).then(detail => { if (active) setData(detail); })
      .catch((failure: Error) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [attemptId]);

  const writing = data?.skill === "WRITING";
  const scope = data && reviewScope(data);
  const available = !!data && hasReviewContent(data.contentStatus);
  const downloadable = available && (writing ? !!data.texts.length : !!data.recordings.length);
  const review = data?.review;
  const publication = review?.publishedAt;
  const minWords = data?.sections.length === 1 ? data.sections[0].minWords : null;
  const contentLabel = data?.contentStatus === "HELD" ? "Đang tạm giữ" : !available ? "Hết hạn lưu"
    : data?.expiresAt ? `đến ${formatReviewDay(data.expiresAt)}` : "Còn lưu";
  const usedCredit = data?.creditType === "FREE_WEEKLY" ? "lượt miễn phí" : data?.creditType === "BONUS" ? "lượt bonus" : null;

  async function download() {
    if (!data || busy) return;
    setBusy(true);
    setError("");
    try {
      if (writing) await downloadWritingDocx(data.attemptId, data.title);
      else await downloadRecordingsZip(data.attemptId, data.title);
    } catch (failure) {
      setError(writing ? writingContentError(failure) : recordingErrorMessage(failure));
      void getLearnerReview(data.attemptId).then(setData).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="attempt-sans [color:var(--attempt-text-352637)] [background:var(--attempt-bg-fcfbf7)] [font-size:15px] [line-height:1.6] [min-height:1180px]">
      <LearnerHeader onAccent={accentForeground(accent)} accent={accent} />
      <div className="[background:var(--attempt-bg-fcfbf7)] [min-height:1111px]">
        <main className="[max-width:1200px] [margin:0_auto] [padding:36px_24px_56px] flex flex-col gap-6">
          <div className={hint}>
            <PageLink page="MyWS" className="[color:var(--attempt-text-706473)] no-underline">Bài Writing và Speaking của tôi</PageLink>
            {data && ` / ${data.title} / ${scope}`}
          </div>
          {error && <div role="alert" className={hint}>{error}</div>}
          {!data && !error && <div role="status">{attemptId ? "Đang tải kết quả…" : "Chọn một bài trong lịch sử luyện tập."}</div>}
          {data && <>
            <div className="flex justify-between [align-items:flex-end] gap-4">
              <div>
                <h1 className="m-0 [font-size:28px] [line-height:1.25] [letter-spacing:-0.02em] attempt-sans [letter-spacing:-0.015em]">
                  {review ? `Kết quả ${scope}` : scope}
                </h1>
                <div className="[font-size:15px] [color:var(--attempt-text-706473)] mt-1">{data.title}</div>
              </div>
              <div className="flex [gap:10px]">
                <span className="inline-flex items-center [gap:6px] [height:26px] [padding:0_10px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:13px] font-semibold whitespace-nowrap">
                  {review && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>}
                  {data.status ? gradingStatusName[data.status] : "Đã lưu"}
                </span>
                {downloadable && <button type="button" onClick={() => void download()} disabled={busy}
                  className="inline-flex items-center justify-center gap-2 [height:42px] [padding:0_20px] rounded-full [border:1.5px_solid_var(--attempt-line-d6d4d0)] box-border [background:var(--attempt-bg-ffffff)] [color:var(--attempt-text-352637)] font-semibold [font-size:14px] no-underline whitespace-nowrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>
                  {busy ? "Đang tải…" : writing ? "Tải .docx" : "Tải ghi âm"}
                </button>}
              </div>
            </div>
            <div className="flex [border:1.5px_solid_var(--attempt-line-d6d4d0)] [border-radius:22px] [background:var(--attempt-bg-ffffff)] [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)] overflow-hidden">
              {[
                { title: data.rubric?.scope === "FULL_SKILL" ? "Band kỹ năng" : "Điểm", value: review?.overall?.toFixed(1) ?? "—",
                  detail: data.rubric?.scope === "SECTION" ? `đánh giá cho ${scope}` : null },
                { title: writing ? "Số từ" : "Bản ghi", value: available ? writing ? data.texts.reduce((sum, text) => sum + text.wordCount, 0) : data.recordings.length : "—",
                  detail: minWords ? `yêu cầu từ ${minWords}` : null },
                { title: "Công bố", value: publication ? formatReviewDay(publication) : "—",
                  detail: usedCredit && `yêu cầu đã dùng ${usedCredit}` },
                { title: "Nội dung bài", value: contentLabel, detail: review ? "Điểm và nhận xét vẫn xem được sau hạn lưu" : null },
              ].map((item, index) => <div key={item.title} className={`[flex:1_1_0] [padding:18px_22px] ${index ? "[border-left:1.5px_solid_var(--attempt-line-d6d4d0)]" : ""}`}>
                <div className={hint}>{item.title}</div>
                <div className="[font-size:28px] font-bold [letter-spacing:-0.02em] [line-height:1.25] font-sans tabular-nums [letter-spacing:-0.015em]">{item.value}</div>
                {item.detail && <div className={hint}>{item.detail}</div>}
              </div>)}
            </div>
            <div className="flex flex-wrap gap-6 items-start">
              <div className="[flex:1.5_1_420px] min-w-0 flex flex-col gap-6">
                <div className={card}>
                  <div className="flex flex-col [gap:14px]">
                    <div className={heading}>Bài làm kèm nhận xét</div>
                    <div className="[font-size:15px] [line-height:1.85] [color:var(--attempt-text-352637)] whitespace-pre-wrap break-words">
                      {!available ? "Nội dung gốc đã hết hạn lưu." : writing
                        ? data.texts.map(item => <div key={item.sectionId}>{data.texts.length > 1 && <strong>{sectionLabel(data.skill, item.number)}<br /></strong>}{item.text}</div>)
                        : <RecordingList items={reviewRecordings(data.recordings)} loadAudio={async id => {
                            try { return (await getRecordingUrl(data.attemptId, id)).url; }
                            catch (failure) { throw new Error(recordingErrorMessage(failure)); }
                          }} />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="[flex:1_1_320px] min-w-0 flex flex-col gap-6">
                {review && <>
                  <div className={card}>
                    <div className={`${heading} [margin-bottom:6px]`}>Điểm theo tiêu chí</div>
                    {review.scores.map(score => {
                      const criterion = data.rubric?.criteria.find(item => item.id === score.criterionId);
                      const section = data.sections.find(item => item.id === score.sectionId);
                      return <div key={`${score.sectionId}:${score.criterionId}`} className="flex items-center justify-between [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
                        <span>
                          {section && data.sections.length > 1 && <span className={hint}>{sectionLabel(data.skill, section.number)}{" · "}</span>}
                          {criterion?.name ?? "Tiêu chí"}
                          {score.comment && <div className={hint}>{score.comment}</div>}
                        </span>
                        <span className="font-bold [color:var(--attempt-text-7a5a0e)]">{score.score.toFixed(1)}</span>
                      </div>;
                    })}
                  </div>
                  <div className={card}>
                    <div className="flex flex-col gap-3">
                      <div className={heading}>Nhận xét của giáo viên</div>
                      <div className="flex [gap:10px] items-center">
                        <span className="w-9 h-9 [border-radius:50%] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [background:var(--attempt-bg-c5cef5)] inline-flex items-center justify-center font-bold [font-size:14px] [color:var(--attempt-text-352637)]">
                          {data.teacher ? initials(data.teacher) : "GV"}
                        </span>
                        <div>
                          <div className="font-semibold">{data.teacher ?? "Giáo viên"}</div>
                          {publication && <div className={hint}>Công bố {formatGradingDate(publication)}</div>}
                        </div>
                      </div>
                      <div className="[font-size:14px] [color:var(--attempt-text-4b3d4d)] whitespace-pre-wrap break-words">{review.generalComment || "—"}</div>
                    </div>
                  </div>
                </>}
                <div className={card}>
                  <div className="flex flex-col [gap:10px]">
                    <div className={heading}>Các mốc của yêu cầu</div>
                    {[
                      { label: "Hoàn thành và lưu bài", at: data.completedAt },
                      { label: "Gửi yêu cầu chấm", at: data.requestedAt, note: usedCredit && `dùng ${usedCredit}` },
                      { label: "Hệ thống phân công", at: data.assignedAt, note: data.teacher },
                      { label: "Công bố kết quả", at: publication },
                      { label: "Hủy yêu cầu chấm", at: data.cancelledAt, note: cancellationText(data.cancelReason) },
                    ].map(item => item.at && <div key={item.label} className="flex [gap:10px] items-start [font-size:14px]">
                      <span className={`[width:10px] [height:10px] [margin-top:6px] [border-radius:50%] [flex:0_0_10px] ${item.at === publication ? "[background:var(--attempt-bg-2e6a48)]" : "[background:var(--attempt-bg-b3a9b5)]"}`} />
                      <div><b>{item.label}</b><div className={hint}>{formatGradingDate(item.at)}{item.note && ` · ${item.note}`}</div></div>
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
          </>}
        </main>
      </div>
    </div>
  );
}
