import { useEffect, useState } from "react";
import AdminTopbar from "../../components/navigation/AdminTopbar";
import TeacherSidebar from "../../components/navigation/TeacherSidebar";
import RecordingList from "../../components/attempts/RecordingList";
import { styleOf, cssText } from "../../lib/shared/styles";
import { formatGradingDate, gradingSkillName } from "../../lib/grading/grading";
import { getTeacherAudio, getTeacherReview, hasReviewContent, reviewRecordings, reviewScope,
  saveTeacherReview, sectionLabel, type GradingScore, type ReviewDetails } from "../../lib/grading/review";

const card = "border:1.5px solid #D6D4D0;border-radius:22px;background:#FFFFFF;box-shadow:0 1px 2px rgba(53,38,55,.04),0 6px 16px rgba(53,38,55,.07);";
const badge = "display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;";
const muted = styleOf("font-size:13px;color:#706473");
const action = "display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 20px;width:100%;border-radius:999px;box-sizing:border-box;font-weight:600;font-size:14px;white-space:nowrap;";

export default function TeacherGrade({ requestId }: { requestId?: string }) {
  const [data, setData] = useState<ReviewDetails>();
  const [groupIndex, setGroupIndex] = useState(0);
  const [scores, setScores] = useState<GradingScore[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    getTeacherReview(requestId).then(detail => {
      if (!active) return;
      setData(detail);
      setScores(detail.review?.scores ?? []);
      setComment(detail.review?.generalComment ?? "");
    }).catch((failure: Error) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [requestId]);

  async function save(publish: boolean) {
    if (!requestId || !data?.editable || busy) return;
    setBusy(true);
    setError("");
    try {
      const review = await saveTeacherReview(requestId, publish, scores, comment);
      setData(current => current && { ...current, review, editable: review.status === "DRAFT" });
      if (publish) setData(await getTeacherReview(requestId));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Chưa lưu được phiếu chấm.");
    } finally {
      setBusy(false);
    }
  }

  const group = data?.rubric?.groups[groupIndex];
  const scope = data && reviewScope(data);
  const shownSections = data?.sections.filter(section => !group?.sectionId || section.id === group.sectionId) ?? [];
  const shownTexts = data?.texts.filter(text => shownSections.some(section => section.id === text.sectionId)) ?? [];
  const recordings = reviewRecordings(data?.recordings.filter(item => shownSections.some(section => section.id === item.sectionId)) ?? []);
  const scopeStyle = badge + "border:1.5px solid #D6D4D0;background:#FFFFFF;color:#352637;";
  const published = data?.review?.status === "PUBLISHED";
  const aggregate = data?.review?.overall;
  const sameScores = scores.length === data?.review?.scores.length && scores.every(score =>
    data?.review?.scores.some(stored => stored.sectionId === score.sectionId && stored.criterionId === score.criterionId && stored.score === score.score));

  return <>
    <style>{cssText("\nbody{margin:0;background:#FCFBF7}\na{color:#2963CC}\n.bu-dd-menu{display:none}.bu-dd:hover .bu-dd-menu,.bu-dd:focus-within .bu-dd-menu{display:block}.bu-dd:hover > a{background:#F3F0EA}\n\n")}</style>
    <div className="app-shell-ancestor" style={styleOf("font-family:'Inter','Be Vietnam Pro','Segoe UI',system-ui,sans-serif;color:#352637;background:#FCFBF7;font-size:15px;line-height:1.6;min-height:1060px")}>
      <div className="app-shell" style={styleOf("display:flex;flex-wrap:wrap;align-items:stretch;min-height:inherit")}>
        <TeacherSidebar />
        <div className="app-content" style={styleOf("flex:1 1 560px;min-width:0;display:flex;flex-direction:column")}>
          <AdminTopbar crumb="Giáo viên / Chấm bài" role="Giáo viên" />
          <main className="p-4 sm:p-6 md:p-8" style={styleOf("flex:1;background:#FAF9F5;display:flex;flex-direction:column;gap:24px")}>
            <div style={muted}>
              <a href="#TeacherQueue" style={styleOf("color:#706473;text-decoration:none")}>Hàng chờ chấm</a>
              {data && ` / ${scope} · ${data.learner}`}
            </div>
            {!data ? <p role={error ? "alert" : "status"}>{error || (requestId ? "Đang tải phiếu chấm…" : "Chọn một bài trong hàng chờ hoặc lịch sử chấm.")}</p> :
              <div style={styleOf("display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start")}>
                <div style={styleOf("flex:1.5 1 420px;min-width:0;display:flex;flex-direction:column;gap:24px")}>
                  <div style={styleOf(card + "padding:28px;")}>
                    <div style={styleOf("display:flex;flex-direction:column;gap:14px")}>
                      <div style={styleOf("display:flex;flex-wrap:wrap;gap:8px;align-items:center")}>
                        <span style={styleOf(badge + "border:0;background:#FBEDBF;color:#7A5A0E;")}>{gradingSkillName[data.skill]}</span>
                        {data.rubric && data.rubric.groups.length > 1
                          ? <select aria-label="Phần chấm" style={styleOf(scopeStyle)} value={groupIndex} onChange={event => setGroupIndex(Number(event.target.value))}>
                              {data.rubric.groups.map(({ number }, index) => <option key={index} value={index}>{number === null ? scope : sectionLabel(data.skill, number)}</option>)}
                            </select>
                          : <span style={styleOf(scopeStyle)}>{scope}</span>}
                        <span style={styleOf(badge + "border:1.5px solid #DDDBD7;background:#F3F0EA;color:#706473;")}>
                          {!hasReviewContent(data.contentStatus) ? "Hết hạn lưu"
                            : data.skill === "WRITING" ? `${shownTexts.reduce((sum, item) => sum + item.wordCount, 0)} từ` : `${recordings.length} bản ghi`}
                        </span>
                        <div style={styleOf("flex:1")} />
                        <span style={muted}>{data.learner}{data.assignedAt && ` · phân công ${formatGradingDate(data.assignedAt)}`}</span>
                      </div>
                      <div style={styleOf("padding:14px 16px;border-radius:12px;background:#FAF9F5;border:1px solid #DDDBD7;font-size:14px;white-space:pre-wrap")}>
                        <b>Đề bài:</b>{" "}
                        {hasReviewContent(data.contentStatus) && shownSections.some(section => section.prompt || section.instruction || section.questions.length)
                          ? shownSections.map(section => <div key={section.id}>
                              {shownSections.length > 1 && <strong>{sectionLabel(data.skill, section.number)}{" "}</strong>}
                              {[section.instruction, section.prompt, ...section.questions].filter(Boolean).join("\n")}
                            </div>)
                          : data.title}
                      </div>
                      <div style={styleOf("font-size:16px;line-height:1.85;color:#352637;white-space:pre-wrap;overflow-wrap:anywhere")}>
                        {!hasReviewContent(data.contentStatus) ? "Nội dung bài đã hết hạn lưu."
                          : data.skill === "WRITING" ? shownTexts.map(text => <div key={text.sectionId}>{text.text}</div>)
                            : <RecordingList key={groupIndex} items={recordings} loadAudio={async id => (await getTeacherAudio(requestId!, id)).url} />}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={styleOf("flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:24px")}>
                  <div style={styleOf(card + "padding:24px;")}>
                    <div style={styleOf("display:flex;flex-direction:column;gap:12px")}>
                      <div style={styleOf("display:flex;gap:16px;align-items:center")}>
                        <div style={styleOf("flex:1;font-size:18px;font-weight:600")}>Chấm theo tiêu chí</div>
                        <span role="status" style={styleOf(badge + "border:1.5px solid #D6D4D0;background:#DDE8FC;color:#2A55B8;")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" />
                          </svg>
                          {data.review ? `${published ? "Công bố" : "Bản nháp lưu"} ${formatGradingDate(data.review.updatedAt)}` : "Chưa lưu nháp"}
                        </span>
                      </div>
                      <div>
                        {group && data.rubric?.criteria.map(criterion => {
                          const existing = scores.find(score => score.sectionId === group.sectionId && score.criterionId === criterion.id);
                          const steps = Math.floor((criterion.maximum - criterion.minimum) / criterion.step);
                          return <div key={criterion.id} style={styleOf("display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #E6E4E0")}>
                            <div style={styleOf("flex:1;font-weight:500;font-size:14px")}>{criterion.name}</div>
                            <select aria-label={criterion.name} disabled={!data.editable || busy} value={existing?.score ?? ""} style={styleOf("min-width:70px;height:40px;border-radius:10px;border:1.5px solid #D6D4D0;font-weight:700;font-size:16px;background:#FFFFFF;text-align:center;color:inherit;opacity:1")}
                              onChange={event => {
                                const value = event.target.value;
                                setScores(current => {
                                  const others = current.filter(score => score.sectionId !== group.sectionId || score.criterionId !== criterion.id);
                                  return value === "" ? others : [...others, { ...existing, sectionId: group.sectionId, criterionId: criterion.id, score: Number(value) }];
                                });
                              }}>
                              <option value="">—</option>
                              {Array.from({ length: steps + 1 }, (_, i) => {
                                const value = Number((criterion.minimum + criterion.step * i).toFixed(2));
                                return <option key={value} value={value}>{value.toFixed(1)}</option>;
                              })}
                            </select>
                          </div>;
                        })}
                      </div>
                      <div style={styleOf("display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:12px;background:#FBEDBF;border:1.5px solid #D6D4D0")}>
                        <div>
                          <div style={styleOf("font-size:13px;color:#7A5A0E;font-weight:600")}>Điểm tổng hợp · {scope}</div>
                          <div style={styleOf("font-size:13px;color:#7A5A0E")}>{data.rubric?.scope === "FULL_SKILL" ? "Band toàn kỹ năng" : "Đánh giá trong phạm vi đã làm"}</div>
                        </div>
                        <div style={styleOf("font-size:28px;font-weight:700;color:#7A5A0E;font-family:'IBM Plex Mono',ui-monospace,monospace;letter-spacing:-0.015em")}>{sameScores ? aggregate?.toFixed(1) ?? "—" : "—"}</div>
                      </div>
                      <label style={styleOf("display:flex;flex-direction:column;gap:6px;flex:1 1 0")}>
                        <span style={styleOf("font-size:13px;font-weight:600")}>Nhận xét gửi người học</span>
                        <textarea value={comment} readOnly={!data.editable} disabled={busy} maxLength={8000} onChange={event => setComment(event.target.value)}
                          style={styleOf("min-height:110px;padding:12px 14px;box-sizing:border-box;border:1.5px solid #8E8392;border-radius:10px;background:#FFFFFF;color:#352637;font:inherit;font-size:14px;line-height:1.6")} />
                      </label>
                      {data.editable && <div style={styleOf("display:flex;gap:10px;align-items:flex-start")}>
                        <button type="button" disabled={busy} onClick={() => void save(false)} style={styleOf(action + "border:1.5px solid #D6D4D0;background:#FFFFFF;color:#352637;")}>Lưu nháp</button>
                        <button type="button" disabled={busy} onClick={() => void save(true)} style={styleOf(action + "border:1.5px solid #352637;background:#352637;color:#FFFFFF;")}>Công bố kết quả</button>
                      </div>}
                      <div style={muted} role={error ? "alert" : "status"}>
                        {error || (busy ? "Đang lưu phiếu chấm…" : published ? "Phiếu đã công bố." :
                          "Nháp chỉ Giáo viên được giao xem được. Sau khi công bố, bài được lưu thêm 14 ngày.")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>}
          </main>
        </div>
      </div>
    </div>
  </>;
}
