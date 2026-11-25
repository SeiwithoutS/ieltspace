# Spec: trang làm bài Speaking và bộ chọn thời gian dùng chung

Nguồn ý định: [speaking-test.md](speaking-test.md). Đường dẫn code gốc `frontend/src`. Số dòng ghi theo trạng thái repo ngày 2026-11-25.

## 1. Hiện trạng cần biết
- `pages/attempts/SpeakingTest.tsx` là giao diện tĩnh: không có mic, không ghi âm, nội dung hard-code (Part 2 "Describe a skill…", sóng âm giả, "01:12" cố định, chip Part chỉ trang trí).
- `components/attempts/AttemptSession.tsx` bọc cả 4 kỹ năng: hộp thoại bắt đầu, đồng hồ, hết giờ (`expired`), mất mạng (`offline`), lưu và thoát, draft bằng `sessionStorage` (mất khi đóng tab). Giờ thi thật hard-code ở `AttemptSession.tsx:147-157` (Speaking 14 phút). Luyện tập đếm lên.
- `StartTestDialog.tsx` đã có chọn Luyện tập/Thi thật và chọn Part/Task/Passage; chưa có chọn thời gian. Dòng 130-133 có đoạn lọc Part giống mã demo cần gỡ.
- `AttemptConfirmation.tsx` có các kind `submit | expired | exit | offline | saveError`; chưa có trang xác nhận hoàn thành riêng, `finish()` chỉ `navigate("MyWS")`.
- Chưa có MediaRecorder, getUserMedia, IndexedDB ở đâu trong `src/`.
- Cấu trúc đề Speaking có sẵn: `lib/exams/exam-editor.ts:84-109` (`SpeakingEditorState`: Part 1 và 3 dạng `qs: string[]`, Part 2 dạng `cue` có `prep`, `speak`). Hiện lấy qua API admin `/admin/exam-skills/:id`; API cho Người học chưa có.
- Chế độ (`mode`) không đi qua URL trang làm bài, được chọn trong `StartTestDialog` rồi lưu trong state/draft.

## 2. Component dùng chung (đề xuất)
Đặt trong `components/attempts/` (hoặc `components/attempts/shared/`). Mỗi cái một file, class hay function bám quy ước hiện tại của thư mục.

| Component | Việc | Dùng ở |
|---|---|---|
| `ModePicker` | Trang/khối chọn chế độ làm bài (Thi thật, Practice) kèm mô tả luật từng chế độ. Tách từ `StartTestDialog` | Speaking, Reading, Listening, Writing |
| `TimeLimitPicker` | Chọn mức thời gian từ danh sách truyền vào (`options`, `defaultValue`, `allowUnlimited`); có chế độ khóa cố định (full test) | Speaking, Reading (Listening không dùng) |
| `AttemptTimer` | Đồng hồ: đếm ngược theo mức đã chọn, hoặc đếm lên nếu không giới hạn; cảnh báo sắp hết (`timeWarn`); trả `elapsedSeconds` | Mọi trang làm bài |
| `TimeUpDialog` | Hộp thoại "Đã hết giờ, bạn có muốn lưu bài làm không?" (Lưu / Không lưu). Mở rộng kind `expired` trong `AttemptConfirmation` | Mọi trang làm bài |
| `MicCheck` | Xin quyền mic, ghi thử vài giây, nghe lại, báo mic chưa ổn | Speaking |
| `RecorderControl` | Ghi âm một câu: bắt đầu (tự động hoặc bấm tay), dừng, nghe lại, ghi lại (Practice) | Speaking |
| `ConnectionNotice` | Nhắc "không tắt màn hình, không chuyển trang" và trạng thái mạng | Mọi trang làm bài (bắt đầu ở Speaking) |
| `AttemptDone` (trang) | Trang xác nhận hoàn thành, nút "Gửi cho Giáo viên chấm" | Speaking, tái dùng cho Writing |

Danh sách mức theo kỹ năng, đặt thành hằng số trong `lib/attempts/time-limits.ts`:
- Speaking: không giới hạn, 15, 20, 25, 30 (mặc định 15 ở Thi thật; Thi thật cố định 15, không cho chọn).
- Reading một section: không giới hạn, 10, 15, 20; mức trần 20.
- Reading nhiều section: mức trần là 20 nhân số section; các mức giữa chia tương ứng.
- Reading full test: cố định 60.
- Listening: không dùng.

## 3. Luồng màn hình Speaking
1. Từ `ExamDetail` hoặc trang luyện tập: `startExam("SpeakingTest", examId)` rồi `ModePicker` (Thi thật / Practice). Practice thì thêm `TimeLimitPicker`.
2. `MicCheck`: quyền mic, ghi thử, nghe lại. Chưa qua thì không vào làm bài.
3. Làm bài. Trạng thái một câu: `viewing` (5 giây) → `recording` → `answered`.
   - Thi thật: `viewing` xong thì tự ghi âm; người học bấm "Câu tiếp" khi xong; không ghi lại. Luật chặt: `nextStep` và khôi phục bỏ qua câu đã có bản ghi, không bao giờ mở lại câu đã trả lời để ghi đè.
   - Practice: `viewing` xong chờ người học bấm ghi âm; được nghe lại và ghi lại; Part 2 cho bỏ qua chuẩn bị.
   - Part 2: trạng thái thêm `preparing` (1 phút, đếm trong tổng thời gian) trước `viewing/recording`.
4. Hết giờ: giữ bản ghi âm dở, `TimeUpDialog`. "Lưu" → bước 5; "Không lưu" → xóa ghi âm cục bộ, `navigate` về trang trước.
5. Hoàn thành hoặc Lưu: `AttemptDone`, nút gửi Giáo viên chấm. Chưa gửi thì bài ở trạng thái "đã lưu, chưa gửi chấm".
6. Gửi: bài vào hàng chờ chấm theo luật lượt chấm W/S ([BUSINESS_RULES.md](../BUSINESS_RULES.md)). Người học nhận thông báo; xem điểm, nghe lại, đọc nhận xét ở lịch sử làm bài.

## 4. Gián đoạn và lưu offline
- Tiến độ lưu: `AttemptDraft` hiện chỉ ở `sessionStorage`, không chứa blob. Với Speaking: lưu blob từng câu vào IndexedDB (khóa gồm userId, examId, attemptId, partIndex, questionIndex), kèm metadata nhỏ (vị trí hiện tại, giây đã dùng, mode) ở draft. Mở rộng `AttemptState` (`components/attempts/types.ts`) và validator `lib/attempts/attempt-draft.ts` cho phần này.
- Quay lại sau gián đoạn (F5, đóng tab, rời đi), đồng hồ vẫn chạy:
  - Practice: Part 2 về `preparing`. Thi thật: chỉ Part 2 còn ở `preparing` (chưa ghi gì) mới về `preparing`; Part 2 đã qua chuẩn bị và đang ghi dở chặt như Part 1/3 (dòng dưới).
  - Thi thật, Part 1/3 và Part 2 đang ghi dở (Part 1/3 mọi phase): không làm lại. Có bản ghi dở thì giữ làm đáp án, chưa có thì để trống, rồi sang câu kế; báo cho người học. Các Part 1/3 đứng trước thiếu bản ghi (kho bị xóa) không bị kéo lùi, được tính để trống; lời nhắc nêu đúng Part nào bị để trống, Part 2 mất bản ghi thì làm lại từ chuẩn bị.
  - Practice: Part 1/3 về đầu câu (bỏ phần ghi dở), được làm lại; câu thiếu bản ghi đầu tiên là điểm quay về.
  - Vị trí lưu lấy theo `stepId`; không thấy thì theo `index` nhưng chỉ để mở câu, không "đóng" câu nào (`matched = false`), và Thi thật không mở lại câu đã có bản ghi.
- Mất mạng giữa bài: Speaking không hiện hộp `offline`; `ConnectionNotice` đổi nội dung, bài vẫn chạy. Dải này hiện ở màn kiểm tra micro, màn "đang khôi phục" và màn làm bài; `persistent()` false thì cảnh báo bản ghi chỉ tạm trong bộ nhớ.
- Draft của 4 kỹ năng ở `localStorage` (khóa theo userId, trang, examId), hết hạn 24 giờ theo `savedAt`; dọn bởi `sweepAttemptStorage`. Bản ghi IndexedDB chỉ bị quét khi quá 24 giờ và không có draft Speaking còn hạn nào trỏ tới (đối chiếu `attemptId`), vì tự lưu đẩy `savedAt` lên còn `recordedAt` thì giữ nguyên. Bài mới chỉ dọn bản ghi của lượt khác không còn draft còn hạn.
- Tự lưu Speaking: mỗi khi vị trí/bản ghi đổi (không dày hơn 1 giây), khi `pagehide`, khi ẩn tab và khi rời trang; chỉ ghi khi phiên còn đúng người dùng (`getAuthUser().id`) và chưa đăng xuất (cờ `storage` báo các tab khác). Đăng xuất dọn dữ liệu local trước khi gọi API, không phụ thuộc request thành công.
- Draft Speaking mà phần tiến độ hỏng: bỏ phần đó, giữ `startedAtEpoch` để thời gian vẫn tính tiếp, không cấp thêm giờ.
- Trang chi tiết bộ đề: có draft thì nút "Tiếp tục làm bài" (cả nút ở đầu trang); draft Speaking đã hết giờ ghi thêm "đã hết giờ, chưa lưu".
- Khi có mạng: tải các blob chưa gửi lên server (idempotent theo khóa câu), rồi mới cho gửi chấm.
- Đổi chữ dialog `exit` ở `AttemptConfirmation.tsx:75` (đang ghi "trong cùng tab") cho khớp lưu bền.
- `ConnectionNotice` nhắc không tắt màn hình, không chuyển trang; cân nhắc Screen Wake Lock nếu trình duyệt hỗ trợ.

## 5. Dữ liệu và backend (đã nối theo hợp đồng API, backend làm song song)
Frontend gọi qua `lib/attempts/skill-attempts-api.ts` (dùng `apiFetch`, không log URL tải lên/tải xuống):
- `GET /learner/exam-skills/:id/speaking`: đề cho Người học, không đáp án. `examSkillId` tra từ `examId` trong URL qua `/exam-sets/practice-items?skill=SPEAKING` (hoặc tham số `skillId` trên URL). Lỗi, chưa có backend hoặc quá 5 giây thì dùng `data/speaking-test.sample.ts` như cũ.
- `POST /learner/skill-attempts` (`clientAttemptId` = `attemptId` trong draft, idempotent): gọi khi bắt đầu làm bài (sau kiểm tra micro hoặc khi vào lại). Lỗi mạng thì làm offline, thử lại ở nền (backoff) và khi có mạng. `serverAttemptId` lưu trong `SpeakingProgress` của draft; mất thì tạo lại bằng cùng `clientAttemptId`.
- Bản ghi: `POST .../recordings` rồi PUT blob lên `uploadUrl` rồi `POST .../recordings/:questionId/confirm`. Chạy qua `UploadQueue` (`lib/attempts/upload-queue.ts`): đọc blob từ `RecordingStore` (IndexedDB), thử lại có backoff với lỗi tạm (mạng, 408, 429, 5xx, 401), lỗi 4xx khác đánh dấu `failed` chờ "Thử lại", 409 `RECORDING_ALREADY_EXISTS` coi như xong, cùng `version` (`recordedAt`) không tải lại, `online` thì chạy ngay. `partIndex` gửi lên là chỉ số Part từ 0.
- Hoàn thành/Lưu (kể cả hết giờ chọn Lưu): `finishAttempt` (`finish-flow.ts`) đẩy hết bản ghi còn lại (chờ tối đa 60 giây) rồi `POST .../complete` (`reason` `SUBMITTED` hoặc `TIME_UP`). Chỉ khi cả hai thành công mới xóa draft và bản ghi trên máy. Chưa xong thì giữ nguyên dữ liệu, ghi `finished` vào draft, sang trang xác nhận với trạng thái "chưa tải lên đủ"; trang đó tiếp tục tải và chốt ở nền (15 giây một lần, khi có mạng, nút "Thử lại"). Mở lại đề có draft `finished` thì chuyển thẳng sang trang xác nhận.
- "Không lưu": `DELETE /learner/skill-attempts/:id`; lỗi mạng thì xếp vào `pending-deletes` (localStorage, chỉ chứa mã lượt) và xóa lại khi mở app hoặc có mạng.
- Nghe lại: bản ghi còn trên máy thì phát blob local; đã chốt thì `GET .../recordings/:questionId/url` (hết hạn 410 `CONTENT_EXPIRED`).
- Gửi chấm: `POST .../grading-request`; hiện backend trả 501 `GRADING_NOT_AVAILABLE`, giao diện báo "Tính năng gửi chấm sẽ sớm khả dụng", không báo lỗi đỏ.
Bổ sung theo review bước 5 (frontend):
- `limitMinutes` gửi khi tạo lượt: số nguyên 1..30 hoặc `null` (Không giới hạn gửi `null`, không gửi 0; Thi thật gửi `null`), qua `apiLimitMinutes` ở `time-limits.ts`.
- `POST .../recordings` có thể trả `alreadyUploaded: true`: bỏ PUT, gọi confirm luôn. PUT bị storage từ chối vì trùng (400/409, `statusCode` "409") cũng đi tiếp sang confirm, không đánh `failed`.
- `ATTEMPT_TIME_EXPIRED` / `ATTEMPT_NOT_ACTIVE` từ ghi nhận hoặc xác nhận bản ghi: mục đó thành `expired` (không tải được, không thử lại) nhưng vẫn `complete`; trang xác nhận ghi "<Câu> không tải lên được vì quá giờ".
- Rơi về đề mẫu (đề lỗi hoặc quá 5 giây): `offlineSample`, không tạo lượt, không xếp upload, không dùng `serverAttemptId` cũ; Hoàn thành sang trang xác nhận `?sample=1` ghi "bài làm thử với đề mẫu, không lưu lên máy chủ", không gửi chấm.
- `elapsedSeconds` gửi `complete` kẹp 0..24 giờ (`clampElapsed`); `complete` lỗi 4xx cố định (trừ 401/408/425/429) thì trang xác nhận dừng thử lại và báo, không lặp mãi.
- `DELETE` trả 409 `ATTEMPT_ALREADY_COMPLETED`: coi là không xóa được, không báo lỗi, bỏ khỏi `pending-deletes`. `POST /skill-attempts` trả 409 `CLIENT_ATTEMPT_ID_CONFLICT`: sinh mã mới đúng một lần rồi tạo lại, lỗi lần hai là lỗi cố định.
- "Số câu đã trả lời" chỉ đếm bản ghi `UPLOADED` (đã chốt) hoặc bản local trong phiên; ô số liệu viền 1.5px.
Còn lại backend phải làm: giờ bắt đầu do máy chủ ghi (thay `startedAtEpoch` local), kiểm lại luật "mỗi câu ghi một lần" ở Thi thật, hạn lưu 14 ngày tính từ lúc hoàn thành (BR-CONTENT-001), danh sách chờ chấm cho Giáo viên.

## 6. Việc đã làm và còn lại trong code
- Đã gỡ giờ hard-code, đoạn lọc Part, thay nội dung tĩnh bằng luồng thật (xem mục 3, 4).
- Trang xác nhận mới `StudentAttemptDone` (`pages/attempts/`, đăng ký ở `app/pages.ts`, thêm vào `learnerStudyPages` ở `App.tsx` để chỉ Người học vào được; tiền tố `Student` giữ ngữ cảnh Người học). Phần giao diện dùng chung nằm ở `components/attempts/AttemptDoneSummary.tsx` để Writing dùng lại: thời gian hoàn thành (mm:ss), số câu đã trả lời, trạng thái tải lên, hạn lưu bản ghi, nghe lại từng câu, "Gửi cho Giáo viên chấm", "Về trang chủ", "Lịch sử làm bài". Có ghi rõ hoàn thành chưa tự gửi chấm. Giao diện tự dựng theo khung hộp thoại `attempt-card`, chưa có thiết kế trên canvas nên cần người dùng duyệt.
- Writing chưa nối `complete`/xác nhận; `finish()` của Writing và Reading, Listening giữ như cũ.
- Draft ở localStorage vẫn hết hạn sau 24 giờ: bản ghi chưa tải lên được quá 24 giờ sẽ bị dọn như trước.

## 7. Thứ tự làm đề xuất (còn lại)
1. Backend chạy thật các endpoint ở mục 5, kiểm thử nối đầu cuối.
2. Gửi chấm khi module lượt chấm W/S sẵn sàng.
3. Nối Writing vào `AttemptDoneSummary`.

## 8. Câu hỏi còn mở
- Đơn vị `prep`/`speak` của thẻ Part 2 trong API (phút như editor hay giây); frontend đang coi số lớn hơn 10 là giây.
- `partIndex` bắt đầu từ 0 hay 1 (frontend gửi từ 0).
- Draft hết hạn 24 giờ có cần kéo dài cho bài chưa tải lên được không.
- Thiết kế giao diện chính thức cho `MicCheck`, `RecorderControl`, `AttemptDone`.
- "Gửi Giáo viên chấm" tính một lượt chấm ngay khi gửi (theo [BUSINESS_RULES.md](../BUSINESS_RULES.md), BR-REQUEST-001: có, trong cùng giao dịch).
