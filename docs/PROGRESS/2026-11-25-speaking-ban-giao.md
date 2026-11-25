# Tiến độ trang làm bài Speaking, bộ chọn thời gian và lịch sử W/S ngày 25/11/2026

Bản bàn giao cho nhóm tiếp tục các chức năng còn thiếu. Đọc cùng [intent](../intent/speaking-test.md), [spec](../intent/speaking-test-spec.md) và [tiến độ backend](2026-11-25-speaking-attempts.md).

## Phạm vi và trạng thái

Mã task: SPK-01 đến SPK-07 (xong), SPK-10 đến SPK-19 (còn mở), ghi trong [TASKS.md](../TASKS.md).

Đã làm và đã commit trên nhánh `phuc` (chưa push):

- Trang làm bài Speaking hai chế độ Thi thật và Practice: test mic, thẻ câu hỏi gộp khu ghi âm, ghi âm từng câu, đồng hồ.
- Bộ chọn thời gian dùng chung (Speaking, Reading), hộp hết giờ Lưu/Không lưu, ghi thời gian hoàn thành.
- Khôi phục bài dở: lưu bản ghi vào IndexedDB, nháp ở localStorage, luật vào lại chặt cho Thi thật.
- Backend lượt làm Speaking (tạo lượt, upload bản ghi qua URL ký, hoàn thành, nghe lại, hủy, job dọn dẹp) và migration 26 **đã áp** lên database dùng chung.
- Trang xác nhận hoàn thành, hàng đợi upload, nút "Tiếp tục làm bài" ở ExamDetail.
- Lịch sử luyện tập W/S: menu ba chấm (Nghe lại, Tải ghi âm dạng .zip), nút chính theo trạng thái chấm.

Chưa có: gửi yêu cầu chấm thật, trang xem kết quả W/S theo id, lịch chạy job dọn dẹp (xem "Phần còn mở").

Commit liên quan: `6d29e26` (trang làm bài, chọn thời gian), `d2a7f89` (ExamDetail), `2942f66` (backend), `2faef1f` (xác nhận hoàn thành, upload), `fb6015a` (tài liệu migration), `1cad6a6` (dọn bài dở, hộp Lưu bài làm), `1937678` (API lịch sử), `5ef7fe0` (menu ba chấm).

## Luật nghiệp vụ đã cài (để không cài lại sai)

| Chủ đề | Thi thật | Practice |
|---|---|---|
| Thời gian | Cố định 15 phút cho cả bài, gồm 1 phút chuẩn bị Part 2 | Chọn không giới hạn, 15, 20, 25, 30 phút |
| Ghi âm | Xem câu hỏi 5 giây rồi tự ghi, người học bấm Câu tiếp. Không ghi lại | Tự bấm ghi, nghe lại, ghi lại, bỏ qua chuẩn bị Part 2 |
| Vào lại bài (F5, Lưu và thoát) | Câu Part 1/2/3 đang ghi dở: giữ bản ghi dở làm đáp án (hoặc để trống) rồi sang câu kế. Part 2 mới ở bước chuẩn bị thì về chuẩn bị. Đồng hồ vẫn chạy khi vắng mặt | Câu dở về đầu câu, được làm lại |
| Hết giờ | Giữ bản ghi dở, hỏi Lưu / Không lưu | Như Thi thật nếu có giới hạn |
| Bấm Hoàn thành (Speaking, Writing) | Hộp "Lưu bài làm?": Lưu, Không lưu (hỏi xác nhận lần hai rồi hủy), Quay lại | Như Thi thật |

Chung: hoàn thành **không tự gửi chấm** (BR-CONTENT-001), hạn lưu bản ghi 14 ngày kể từ lúc hoàn thành, mở hoặc tải không đổi hạn. Reading/Listening hết giờ chọn "Nộp bài" hoặc "Không lưu".

## Bản đồ mã nguồn

Frontend (`frontend/src`):

- Trang: `pages/attempts/SpeakingTest.tsx` (luồng), `StudentAttemptDone.tsx` (xác nhận hoàn thành), `pages/results/MyWS.tsx` (lịch sử W/S), `pages/exams/ExamDetail.tsx` (nút Làm bài / Tiếp tục làm bài).
- Component dùng chung trong `components/attempts/`: `ModePicker`, `TimeLimitPicker`, `AttemptTimer`, `MicCheck`, `RecorderControl`, `QuestionCard` (có `footer` chứa khu ghi âm), `LevelBars`, `ConnectionNotice`, `RecordingList`, `AttemptRecordingsPopup`, `AttemptDoneSummary`. Phần chung: `components/shared/ui/MenuButton.tsx`.
- Logic: `lib/attempts/` gồm `speaking-flow.ts` (máy trạng thái thuần), `recordings.ts` (IndexedDB), `attempt-storage.ts` và `attempt-draft.ts` (nháp 24 giờ), `time-limits.ts`, `skill-attempts-api.ts`, `upload-queue.ts`, `finish-flow.ts`, `attempt-sync.ts`, `pending-deletes.ts`, `recording-download.ts`, `mic.ts`; `lib/learner/ws-history.ts` (ánh xạ trạng thái W/S); `lib/shared/zip.ts`, `menu-nav.ts`.
- Dữ liệu mẫu Speaking (dùng khi API đề chưa có): `data/speaking-test.sample.ts`. Lịch sử mẫu: `data/practice-history.sample.ts` (mở `?demo=1`).

Backend (`backend/src`): `modules/attempts/` (routes, schemas, service, repository), `integrations/storage/recording-storage.ts`, `jobs/run-attempt-cleanup.ts`, `modules/learner/study-overview.ts` (`readLearnerResults`), `modules/users/account-deletion.ts`. Hợp đồng API ở [API.md](../API.md) mục lượt làm Speaking và `GET /learner/results`.

## Dữ liệu lưu trên máy người học

| Khóa | Nơi | Nội dung | Dọn khi |
|---|---|---|---|
| `ieltspace-draft` + userId, trang, examId | localStorage | Nháp bài dở của cả 4 kỹ năng, hạn 24 giờ kể từ lần lưu cuối | Hoàn thành, Không lưu, hết hạn, đăng xuất |
| IndexedDB bản ghi âm | IndexedDB | Blob từng câu, khóa gồm userId, examId, attemptId, questionId | Sau khi máy chủ chốt `complete`, Không lưu, quét quá 24 giờ, đăng xuất |
| `ieltspace-logout` | localStorage | Cờ để tab khác ngừng ghi nháp sau đăng xuất | Tự dọn |
| Hàng đợi xóa lượt | localStorage | Mã lượt cần DELETE khi có mạng lại | Sau khi xóa xong |

Draft cũ ở sessionStorage được chuyển sang localStorage một lần khi đọc.

## Cấu hình và triển khai

- `STORAGE_BUCKET_RECORDINGS` (mặc định `speaking-recordings`) trong `backend/.env`. Bucket **riêng tư**, đã tạo trên Supabase, tải ghi âm về đã chạy được (xác nhận ngày 25/11).
- Migration [26](../csdl/26_speaking_attempts.sql) đã áp lên database dùng chung ngày 25/11/2026 lúc các bảng liên quan rỗng. Database khác chạy lại (idempotent), kiểm tiền đề và rollback ở đầu và cuối tệp, tóm tắt ở [README csdl](../csdl/README.md).
- Tải .zip ghi âm gọi thẳng URL ký của Supabase từ trình duyệt nên cần CORS cho origin của web. Đã chạy được ở môi trường hiện tại.
- Lệnh kiểm tra: `cd frontend && npm run build && node --test tests/*.test.mjs`, `cd backend && npm run typecheck && node --test tests/*.test.mjs`. Dùng `tests/*.test.mjs`, vì `node --test tests/` ghi trong CLAUDE.md báo lỗi trên Node 24.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Frontend `npm run build`, `node --test tests/*.test.mjs` | Local | Build qua, 94/94 đạt (có test máy trạng thái, hàng đợi upload, zip, lưu trữ nháp, ánh xạ trạng thái) |
| Backend `node --test tests/*.test.mjs` | Local, repo và storage giả | 85 đạt, 1 bỏ qua, 1 lỗi là "Test lifecycle" của bộ đề (cần DB thật, có từ trước) |
| Backend `npm run typecheck` | Local | 2 lỗi có sẵn ở `modules/users/staff-accounts.ts` (`must_change_password`, Prisma client cũ), không có lỗi ở mã mới |
| Áp migration 26 trong một transaction, kiểm cột, index, ràng buộc | Database dùng chung | Đạt, 13 câu lệnh, đủ 6 index và 3 ràng buộc |
| `readLearnerResults` nhóm WS với bài Speaking thật | Database dùng chung, chỉ đọc | Đạt: `AVAILABLE`, hạn lưu 09/12/2026, 11 bản ghi, `attemptMode REAL`, chưa gửi chấm |
| Chạy tay một lượt Speaking Thi thật: tạo lượt, upload 11 bản ghi, hoàn thành, tải ghi âm | Môi trường dev với Supabase thật | Đạt (database ghi `COMPLETED`, 11 bản ghi `UPLOADED`; người dùng xác nhận tải ghi âm được) |

**Chưa kiểm chứng trên môi trường thật** (chỉ có test giả hoặc đọc mã): Practice mode đầu cuối, `DELETE /skill-attempts/:id`, job dọn dẹp (SQL claim, xóa file, thử lại), 410 hết hạn nội dung, F5 và mất mạng ở nhiều thời điểm, khôi phục Reading/Listening/Writing sau khi chuyển nháp sang localStorage, hai tab cùng đề (bỏ qua có chủ ý).

## Phần còn mở

1. **Gửi yêu cầu chấm** (`POST /learner/skill-attempts/:id/grading-request`) hiện trả 501 `GRADING_NOT_AVAILABLE`. Frontend đã có hộp xác nhận và xử lý 501. Việc của người làm lượt chấm (CREDIT-01, GRADE-01): một giao dịch trừ lượt, tạo `grading_requests` `WAITING_ASSIGNMENT`, giữ nội dung (`content_status = HELD`), hạn phân công 72 giờ (BR-REQUEST-001).
2. **Giữ nội dung khi chờ chấm:** job dọn dẹp và `DELETE /skill-attempts/:id` hiện chỉ kiểm `grading_requests` ở `WAITING_ASSIGNMENT` hoặc `ASSIGNED`. Đọc bản ghi (`getRecordingUrl`) vẫn chặn theo `content_expires_at` kể cả khi `HELD`: cần chốt có lùi hạn khi giữ hay không (BR-CONTENT-002).
3. **Xem kết quả:** `ResultWS` là trang tĩnh, không nhận id bài. Nút "Xem kết quả" ở lịch sử đang mở hộp "sẽ sớm khả dụng". Cần trang kết quả thật theo `skill_attempt_id` (điểm tổng, 4 tiêu chí, nhận xét), rồi nối vào nhánh `view` trong `MyWS.tsx`.
4. **Job dọn dẹp chưa có lịch:** `npm run attempts:cleanup -- --apply`. Lượt `IN_PROGRESS` bỏ dở (đóng tab, Lưu và thoát) chỉ bị dọn sau 48 giờ khi job chạy.
5. **Writing dùng chung luồng mới (SPK-15, đã làm phần frontend):** `WritingTest` là wrapper tải đề (`loadWritingTest`, rơi về đề mẫu thì `offlineSample`, không gọi máy chủ) rồi chạy `WritingRun`. Tạo lượt idempotent theo `clientAttemptId` (`AttemptSync` có `skill: "WRITING"` và `texts: TextQueue`). Văn bản từng Task lưu qua `lib/attempts/writing-queue.ts`: giữ bản mới nhất, PUT ghi đè (idempotent), debounce 3 giây, lưu ngay khi blur, chuyển Task, hết giờ, Lưu và thoát, hoàn thành; bản chưa lưu ghi vào localStorage (`ieltspace-writing-pending:{userId}:{clientAttemptId}`, hạn 24 giờ, dọn khi đăng xuất, hoàn thành, hủy); pagehide gửi best-effort bằng fetch `keepalive` (thêm tùy chọn `keepalive` vào `apiFetch`). Lỗi tạm thì thử lại với lùi nhịp; 409 `ATTEMPT_TIME_EXPIRED`/`ATTEMPT_NOT_ACTIVE` và 410 đóng Task (không thử lại, vẫn cho chốt, báo qua `expired`); 400 là lỗi cố định chặn chốt. Vào lại bài: ghép bản chờ lưu > nháp > văn bản máy chủ (`GET writing/:taskKey`). Giờ: `AttemptSession` dùng `epoched` (Speaking và Writing) cho mốc tuyệt đối, tự lưu nháp, hỏi `GET /skill-attempts/:id` lấy gốc giờ (Thi thật Writing 60 phút, `WRITING_REAL_LIMIT_SECONDS`); đồng hồ Writing nay **không tạm dừng** khi Lưu và thoát (đổi so với trước). Draft Writing cũ (không mốc) vẫn mở được, giây đã dùng được giữ. Hoàn thành/hết giờ: `finishAttempt` với `drain` của hàng đợi văn bản, tức PUT lần cuối cả hai Task (thử lại ngắn 3 vòng) rồi mới `complete`; chỉ dọn nháp khi `complete` thành công, chưa chốt được thì draft `finished` và sang trang xác nhận ở trạng thái "Chưa lưu đủ" (trang tự thử lại). "Không lưu" gọi `DELETE` (lỗi mạng xếp hàng qua `pending-deletes`). `StudentAttemptDone?skill=writing` và `AttemptDoneSummary` hiện thời gian, số từ từng Task, hạn 14 ngày, trạng thái lưu, "Xem lại bài viết" (`WritingTextPopup`, xử lý 410) và Gửi chấm (501 báo nhẹ). Lịch sử W/S: Writing có "Xem bài viết" (khóa khi hết hạn); **Tải .docx vẫn khóa** vì chưa có API. **Giới hạn:** chưa chạy với backend/DB thật (chỉ test logic thuần và build); đề Writing có cả Academic và General chỉ lấy ô đầu tiên của danh mục (truyền `skillId` trên URL để chọn); Task quá `deadline_at` + 120 giây không lưu được nữa nên vào lại quá muộn thì chỉ giữ được bản lưu gần nhất trên máy chủ; Practice Writing chưa có bộ chọn thời gian (không giới hạn, API cho đến 60 phút); `ReadingTest/ListeningTest` không đổi.
6. **Chống gian lận giờ làm (SPK-14, đã làm):** khi vào lại bài Speaking có `serverAttemptId` trong nháp, `AttemptSession` hỏi `GET /skill-attempts/:id` và lấy `startedAt`/`deadlineAt` của máy chủ làm gốc (logic thuần ở `lib/attempts/server-clock.ts`, có test `tests/server-clock.test.mjs`). Mốc và giới hạn trong nháp bị bỏ khi đã có máy chủ, nên sửa localStorage không đổi được giờ; đồng hồ, hộp hết giờ, `elapsedSeconds` và `draft.seconds` dùng chung một gốc. Máy chủ `COMPLETED` thì dọn nháp và sang trang xác nhận; 404 hoặc `ABANDONED` thì dọn nháp và mở lại như bài mới (có thông báo). Offline hoặc lỗi mạng: dùng mốc trong nháp, hiện dải thông báo, thử lại mỗi 10 giây và khi có mạng, áp mốc máy chủ (đồng hồ có thể nhảy vài giây). Bù lệch đồng hồ dùng header `Date` (co về phía 0 một khoảng bằng sai số); backend đã thêm `exposedHeaders: ["Date"]` vào CORS (`backend/src/app.ts`) để trình duyệt đọc được header này; cần khởi động lại backend, nếu chưa thì offset coi là 0. **`mode` và giới hạn (đã làm):** khi máy chủ trả lời, `mode` (REAL/PRACTICE) và giới hạn lấy từ máy chủ, giá trị trong nháp bị ghi đè (`serverAttemptRules`/`applyServerRules` ở `server-clock.ts`, có test `tests/recording-chunks.test.mjs`). Lưu ý: máy chủ không đặt `deadlineAt` cho lượt REAL (client gửi `limitMinutes = null`), nên Thi thật dùng hằng 15 phút ở client; Practice không deadline là không giới hạn. **Giới hạn còn lại:** máy chủ chưa trả lời (offline) thì `mode` và giới hạn vẫn theo nháp, được thay khi hỏi được; người dùng chặn mạng (hoặc chặn riêng API) thì đồng hồ vẫn chạy theo nháp; `ExamDetail` (`speakingTimedOut`) không gọi API nên vẫn dựa nháp; hộp hết giờ hiện từ nháp khi offline không tự mất nếu máy chủ sau đó cho thêm giờ (hiếm: lượt tạo muộn hơn lúc bắt đầu).
7. **Mất phần đang nói (SPK-17, đã làm):** `AnswerRecorder` ghi với `start(1000)` và gọi `onChunk` mỗi đoạn; `SpeakingTest` lưu đoạn qua hàng đợi tuần tự (đoạn cuối vào kho trước bản hoàn chỉnh, đoạn chỉ bị xóa sau khi `put` bản hoàn chỉnh xong). Chỉ ghi đoạn ở Thi thật. Vào lại bằng F5/đóng tab/sập: `planOrphanChunks` quyết định, Thi thật ghép đoạn (`assembleChunks`) thành bản dở giữ làm đáp án rồi sang câu kế (kèm thông báo), Practice bỏ đoạn. Đoạn dùng cùng object store IndexedDB, khóa dùng dấu phân cách `` nên `ids()` không thấy; `clear`, `purgeRecordings`, quét 24 giờ và đăng xuất dọn luôn. **Giới hạn:** mất tối đa khoảng 1 giây cuối (đoạn chưa được trả); IndexedDB lỗi thì không có đoạn (kho báo không bền); trần 1200 đoạn và 40 MB mỗi câu; ghép đoạn chỉ kiểm bằng test logic, chưa thử phát lại trên Chrome/Firefox/Safari thật (WebM/Ogg nối được, Safari mp4 phân mảnh chưa chắc); Practice không có bản dở.
8. **Chọn Part (SPK-16, đã làm có giới hạn):** Speaking Practice chạy đúng tập Part đã chọn (`SpeakingTest` truyền `selectedParts` vào `buildSpeakingSteps`; thanh Part và khôi phục bài theo các câu thật của tập đó), Thi thật luôn đủ 3 Part. `section` trên URL (từ `startExam`) là lựa chọn mặc định của `StartTestDialog` (`AttemptSession` chỉ thêm một dòng truyền `section`). Draft chuẩn hóa `parts` khi parse. Logic thuần ở `lib/attempts/part-choice.ts`, test `tests/part-choice.test.mjs`. **Giới hạn:** `ReadingTest` và `ListeningTest` còn dùng dữ liệu mẫu một passage/section, nên Reading chỉ cho chọn một passage (`READING_PLAYABLE_PASSAGES = 1`; đổi số này khi trang đọc đề thật thì hộp tự cho chọn nhiều và mức trần = 20 phút x số passage thật); chọn Passage 2/3 vẫn hiện nội dung mẫu Passage 1 như trước. Listening chọn một Section, không có bộ chọn thời gian.
9. **Hợp đồng đề Speaking:** `cue.prep` và `cue.speak` tính bằng phút ở backend, frontend đang đoán (số lớn hơn 10 là giây). `questionId` do frontend đặt (`p1q0`, `p2q0`), backend chưa đối chiếu với nội dung đề.
10. **Giao diện chưa có canvas** (do nhóm tự dựng, cần người dùng duyệt; SPK-19): MicCheck, thẻ câu hỏi gộp khu ghi âm, trang xác nhận hoàn thành, các thông báo mới (câu quá giờ, bài đề mẫu), MenuButton, chip và nút chính ở lịch sử W/S. **Đã kiểm toán và ghi vào DESIGN.md mục 15 (25/11/2026):** khối trạng thái ở trang xác nhận, các hộp thông báo và chip lỗi đã đưa về token banner mục 12.6 (`#E3ECFD/#2257B8`, `#E6F3EC/#24543D`, `#FBDCD3/#9D301E`; biến `--attempt-text-9d301e`, `-24543d`, `-2257b8` và các biến danger/input-line mới trong `attempt-theme.css`); hộp "Hủy bài làm?" dùng icon danger và nút "Xóa bài làm" destructive đặc; nút cao 38/44, vạch và viền theo thang. **Còn mở:** người dùng duyệt các màn (đánh dấu "cần duyệt") và quyết bảng 15.13 (bo nút 12 hay 999, font tiêu đề hộp thoại, chữ `#C0412A` trên danger-soft chỉ 4.0:1, "Chờ chấm" hay "Đang chấm", MyWS dưới 768px...); sau đó vẽ lại canvas.
11. **Thống kê:** lượt Speaking `COMPLETED` đã được đếm vào `study-overview.ts` (tiến độ, lịch học). Chưa kiểm hiển thị.
12. **Dọn nhỏ:** `frontend/src/components/auth/LoginForm.tsx` còn thay đổi chưa commit (chỉ định dạng lại khoảng trắng, không thuộc đợt này). Cập nhật lệnh test trong CLAUDE.md. Chạy `npm run prisma:generate` ở backend nếu typecheck còn báo `must_change_password`.

## Bước tiếp theo

1. Người làm lượt chấm nhận mục 1 và 2, dùng `skill_attempts.id` làm khóa, giữ nguyên hợp đồng `POST .../grading-request`. Xong khi gửi chấm thành công, nội dung chuyển `HELD`, lịch sử W/S tự hiện "Chờ phân công".
2. Làm trang kết quả W/S (mục 3) rồi nối nút "Xem kết quả".
3. Gắn lịch chạy `attempts:cleanup` và kiểm job trên bản sao database (mục 4).
4. Chạy tay các luồng "chưa kiểm chứng" ở trên trên môi trường dev, ghi kết quả vào tệp này.
5. Người dùng xem giao diện các màn tự dựng trên trình duyệt (SPK-19). Điểm 1 đến 9 của bảng 15.13 trong DESIGN.md đã chốt ngày 25/11/2026 (gồm MyWS thẻ dọc dưới 768px); điểm 10 đến 12 để mở có chủ ý vì thuộc canvas Reading/Listening và panel dùng chung.

## Tài liệu và cách tái hiện

- Ý định và spec: [speaking-test.md](../intent/speaking-test.md), [speaking-test-spec.md](../intent/speaking-test-spec.md).
- Tái hiện luồng: đăng nhập Người học, mở một bộ đề có Speaking đã đăng, bấm Làm bài, chọn chế độ, qua kiểm tra mic, trả lời, Hoàn thành, chọn Lưu bài làm, xem trang xác nhận, vào Lịch sử luyện tập (tab Writing/Speaking) để thử Nghe lại và Tải ghi âm. Dữ liệu mẫu đủ trạng thái chấm: `PracticeHistory?demo=1` (chỉ localhost).
