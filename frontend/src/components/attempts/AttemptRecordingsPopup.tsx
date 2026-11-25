import { useEffect, useState } from "react";
import Popup from "./Popup";
import RecordingList, { attemptButton, type DoneRecording } from "./RecordingList";
import { EXPIRED_MESSAGE, recordingErrorMessage } from "../../lib/attempts/recording-download";
import { compareRecordingIds, formatRecordingLength, recordingLabel } from "../../lib/attempts/recording-files";
import { errorCode, errorStatus, getRecordingUrl, getSkillAttempt } from "../../lib/attempts/skill-attempts-api";

/**
 * Popup "Nghe lại" của lịch sử Speaking: liệt kê các câu đã ghi (Part/Câu, độ dài) và phát bản ghi.
 * URL phát chỉ xin khi bấm nghe (hiệu lực ngắn) và không được log.
 */
export default function AttemptRecordingsPopup({ attemptId, title, onClose }: { attemptId: string; title: string; onClose: () => void }) {
  const [items, setItems] = useState<DoneRecording[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getSkillAttempt(attemptId)
      .then((detail) => {
        if (!active) return;
        if (detail.contentStatus === 'EXPIRED' || detail.contentStatus === 'DELETED') {
          setError(EXPIRED_MESSAGE);
          return;
        }
        setItems(
          detail.recordings
            .filter((item) => item.status === "UPLOADED")
            .sort((a, b) => compareRecordingIds(a.questionId, b.questionId))
            .map((item) => ({ id: item.questionId, label: recordingLabel(item.questionId), length: formatRecordingLength(item.durationMs) })),
        );
      })
      .catch((e) => active && setError(errorStatus(e) === 410 || errorCode(e) === "CONTENT_EXPIRED" ? EXPIRED_MESSAGE : recordingErrorMessage(e)));
    return () => {
      active = false;
    };
  }, [attemptId]);

  async function loadAudio(id: string): Promise<string | null> {
    try {
      return (await getRecordingUrl(attemptId, id)).url;
    } catch (e) {
      throw new Error(recordingErrorMessage(e));
    }
  }

  return (
    <Popup title="Nghe lại bài nói" onCancel={onClose}>
      <section className="attempt-card flex flex-col gap-4" style={{ width: "min(560px, calc(100vw - 24px))" }}>
        <h2>{"Nghe lại bài nói"}</h2>
        <p className="m-0 [color:var(--attempt-text-706473)]">{title}</p>
        {error ? (
          <p role="alert" className="m-0 [color:var(--attempt-text-c0412a)]">{error}</p>
        ) : items === null ? (
          <p role="status" className="m-0">{"Đang tải danh sách câu…"}</p>
        ) : items.length === 0 ? (
          <p role="status" className="m-0">{"Bài này chưa có bản ghi nào."}</p>
        ) : (
          <RecordingList items={items} loadAudio={loadAudio} />
        )}
        <div className="flex justify-end">
          <button type="button" className={attemptButton + " primary"} onClick={onClose}>{"Đóng"}</button>
        </div>
      </section>
    </Popup>
  );
}
