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

## 5. Dữ liệu và backend (cần duyệt trước khi làm)
Theo `CLAUDE.md`, thêm model/migration phải hỏi trước. Việc cần quyết:
- API đề Speaking cho Người học (không trả đáp án, theo `exam_versions`), hiện chỉ có API admin.
- Lưu bài nói: bảng bài làm (attempt) và bản ghi âm từng câu (file trong storage, đường dẫn trong DB), thời gian hoàn thành (`elapsed_seconds`), mode, thời gian tối đa đã chọn. Nộp idempotent.
- Giáo viên: danh sách bài chờ chấm, nghe âm thanh, chấm 4 tiêu chí.
- Thời điểm bắt đầu lượt làm phải do máy chủ ghi và dùng để tính giờ còn lại; `startedAtEpoch` trong localStorage chỉ là bản tạm, người dùng sửa được để kéo dài giờ hoặc làm lại câu Thi thật. Backend cũng phải kiểm lại luật "mỗi câu ghi một lần" khi nhận bản ghi.
- Lưu ghi âm 14 ngày (mô tả luật hiện ở `SpeakingTest.tsx:304-308`): cần xác nhận lại với yêu cầu mới trước khi giữ.
Frontend giai đoạn đầu có thể dùng dữ liệu mẫu như phần còn lại của app, nhưng cấu trúc đề phải dùng `SpeakingEditorState`.

## 6. Việc cần gỡ hoặc đổi trong code hiện có
- Gỡ hard-code giờ ở `AttemptSession.tsx:147-157`, thay bằng giá trị từ `TimeLimitPicker`.
- Gỡ đoạn lọc Part ở `StartTestDialog.tsx:130-133`.
- Thay nội dung tĩnh của `SpeakingTest.tsx` bằng dữ liệu đề thật và các trạng thái ở mục 3. Giữ style bám canvas và [DESIGN.md](../DESIGN.md); chưa có thiết kế cho `MicCheck`, `RecorderControl`, `AttemptDone`, cần hỏi người dùng hoặc xin thiết kế.
- Thêm trang `AttemptDone` vào `app/pages.ts`, đặt tên trang đúng tiền tố phân quyền (hiện regex ở `App.tsx` khớp `Student*`, `Admin*`, `Teacher*`).
- Phát thời gian hoàn thành vào `finish()` và kết quả.

## 7. Thứ tự làm đề xuất
1. Hằng số `time-limits.ts` + `TimeLimitPicker` + `AttemptTimer` + `TimeUpDialog` (dùng được ngay cho Reading, không đụng backend).
2. `ModePicker` (tách từ `StartTestDialog`), gỡ hard-code giờ.
3. `MicCheck` + `RecorderControl` + luồng câu hỏi Speaking (dữ liệu mẫu).
4. Lưu offline IndexedDB + khôi phục theo luật mục 4.
5. `AttemptDone` + gửi chấm (cần backend đã duyệt ở mục 5).

## 8. Câu hỏi còn mở
- Lưu offline chỉ trong trình duyệt hay cả khi đóng tab và mở lại trên cùng máy (đề xuất: cả hai, IndexedDB bền qua đóng tab).
- Có thêm bảng dữ liệu bài nói và hạ tầng lưu file âm thanh (Supabase Storage?) không, thời hạn lưu ghi âm bao lâu.
- Thiết kế giao diện cho `MicCheck`, `RecorderControl`, `AttemptDone`.
- "Gửi Giáo viên chấm" có tính một lượt chấm của Người học ngay khi gửi không (theo [BUSINESS_RULES.md](../BUSINESS_RULES.md)).
