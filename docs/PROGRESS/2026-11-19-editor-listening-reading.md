# Tiến độ Biên tập đề thi Reading & Listening (LRE-00 đến LRE-09) ngày 19/11/2026

## Phạm vi và trạng thái

- **Mã công việc**: LRE-00 đến LRE-09 theo kế hoạch [PLAN_EDITOR_LISTENING_READING.md](../PLAN_EDITOR_LISTENING_READING.md).
- **Mục tiêu**: Kết nối trình biên tập đề thi Reading (3 passage) và Listening (4 section) với bảng CSDL thực tế (`exam_sections`, `question_groups`, `questions`, `question_options`, `question_answers`), hợp nhất giao diện vào component dùng chung `LrEditor.tsx`, áp dụng cơ chế lưu vi sai tối thiểu `LrPatch`, hỗ trợ tải ảnh sơ đồ và file ghi âm thật lên Supabase Storage bucket `exam-assets`, tích hợp tự động sinh transcript qua mô hình Groq Whisper Speech-to-Text (`whisper-large-v3-turbo`), chuẩn hóa giao diện `editor-shell` cho các editor khác, và thực thi nghiêm ngặt tiêu chuẩn TypeScript (0 `any`, 0 `@ts-nocheck`, 0 `@ts-ignore`).
- **Trạng thái**: **HOÀN THÀNH**. Cả frontend và backend đều vượt qua typecheck, build và unit test 100%.

## Công việc đã thực hiện

### 1. Cơ sở dữ liệu và Thang điểm Band (LRE-00)
- Tạo tệp di chuyển [10_thang_band_lr.sql](../csdl/10_thang_band_lr.sql) khởi tạo 3 thang quy đổi band điểm chuẩn Cambridge cho Listening, Reading Academic và Reading General trong bảng `band_scales` (phiên bản 1).
- Bổ sung trường `conversion_rules Json` vào mô hình `band_scales` trong [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma) để lưu bảng quy đổi số câu đúng 0–40 sang band 0.0–9.0.
- Chạy `prisma generate` và `typecheck` đạt 0 lỗi.

### 2. Quy tắc nghiệp vụ và Chuyển đổi dữ liệu L/R (LRE-01)
- Cập nhật [backend/src/modules/exams/exam-rules.ts](../../backend/src/modules/exams/exam-rules.ts):
  - `defaultDuration`: Trả về 60 phút cho Reading, 40 phút cho Listening.
  - `checkLrNumbering`: Kiểm tra chặt chẽ việc đánh số 40 câu liên tục từ 1 đến 40 không nhảy số, hỗ trợ tính số câu của `MCQ_MULTI` theo `answer_count`.
  - `validateReadingReady` & `validateListeningReady`: Kiểm tra điều kiện xuất bản (đủ 3 passage / 4 section, đúng 40 câu, Listening bắt buộc có audio cho từng section).
- Cập nhật [backend/src/modules/exams/exam-content.mapper.ts](../../backend/src/modules/exams/exam-content.mapper.ts):
  - Định nghĩa 16 dạng câu hỏi IELTS (`LrQuestionType`).
  - Hàm `sectionsToLr` và `lrToRows` ánh xạ hai chiều giữa mô hình CSDL và DTO `LrContent` mà không làm mất dữ liệu.
- Viết 5 unit tests trong `backend/tests/exam-lr-mapper.test.mjs`, đạt 100%.

### 3. Dịch vụ lưu trữ âm thanh và hình ảnh (LRE-02)
- Cập nhật [backend/src/integrations/storage/supabase-storage.ts](../../backend/src/integrations/storage/supabase-storage.ts):
  - `detectAudioExtension`: Nhận diện header file nhị phân của MP3 (ID3, MPEG frame sync), WAV (RIFF...WAVE) và M4A (ftyp).
  - `uploadSkillAudio`: Kiểm tra giới hạn 50MB và tải lên bucket `exam-assets`.
  - `downloadObject`: Hỗ trợ tải dữ liệu nhị phân từ Storage để phục vụ Speech-to-Text.
  - `createSignedUrl`: Tạo URL truy cập tạm thời.
- Viết 5 unit tests trong `backend/tests/storage-audio.test.mjs`, đạt 100%.

### 4. Dịch vụ biên tập và Endpoints quản trị (LRE-03 & LRE-04)
- Cập nhật [backend/src/modules/exams/exam-editor.service.ts](../../backend/src/modules/exams/exam-editor.service.ts):
  - `saveLrPatch`: Áp dụng vi sai tối thiểu (`LrPatch`) vào cơ sở dữ liệu, giữ nguyên ID của các nhóm, câu hỏi và đáp án hiện có; cập nhật dải số câu `question_from/to`.
  - `publishSkill`: Tự động tìm và gán `band_scale_id` tương ứng cho Reading/Listening khi xuất bản đề thi; chuyển bản cũ sang `ARCHIVED`.
  - `discardUploads` & `cleanupOrphans`: Dọn dẹp an toàn các tệp hình ảnh và ghi âm mồ côi mà không ảnh hưởng đến các phiên bản đã xuất bản khác.
- Cập nhật [backend/src/modules/exams/exams.admin.routes.ts](../../backend/src/modules/exams/exams.admin.routes.ts):
  - Endpoint **E8**: `PUT /admin/exam-skills/:skillId/audio` tải ghi âm Listening (tối đa 50MB).
  - Endpoint **E9**: `POST /admin/exam-skills/:skillId/uploads/discard` dọn dẹp các tệp tải lên tạm thời khi người dùng hủy hoặc không lưu.

### 5. Thư viện Frontend & Bộ tính vi sai L/R (LRE-05)
- Tạo thư viện hoàn chỉnh trong `frontend/src/lib/lr-editor/`:
  - `types.ts`: Định kiểu TypeScript đầy đủ cho 16 dạng câu hỏi IELTS, Editor state, Passage state, Group state, Patch vi sai.
  - `constants.ts`: Các hằng số, bảng tra dạng câu hỏi và giới hạn từ.
  - `pure.ts`: Các hàm thuần xử lý ô trống `[___]`, đếm câu hỏi `cnt`, đánh số toàn bộ đề thi `numberQuestions`, kiểm tra điều kiện xuất bản `allIssues`.
  - `converters.ts`: Chuyển đổi hai chiều `toLrState` và `fromLrState`.
  - `diff.ts`: Tính toán bản vá vi sai tối thiểu `diffLrContent` và gán ID backend `applySavedIds`.
- Cập nhật [frontend/src/lib/exam-editor.ts](../../frontend/src/lib/exam-editor.ts) bổ sung các hàm gọi API E8, E9, E10, E11.
- Viết 7 unit tests trong `frontend/tests/lr-editor.test.mjs`, đạt 100%.

### 6. Hợp nhất giao diện LrEditor và 9 Question Cards (LRE-06 & LRE-07)
- Xây dựng bộ component dùng chung `editor-shell`: `EditorTopbar`, `VersionBanner`, `ConfirmDialog`, `LeaveDialog`, `UnsavedGuard`, `ImageUploader`.
- Xây dựng 9 Question Cards bao phủ 16 dạng câu hỏi IELTS:
  - `GapCard.tsx` (SENTENCE_COMP, SHORT_ANSWER)
  - `BlankTextCard.tsx` (SUMMARY_COMP, NOTE_COMP)
  - `WordBankCard.tsx` (SUMMARY_BOX)
  - `TableCard.tsx` (TABLE_COMP)
  - `FlowCard.tsx` (FLOW_COMP)
  - `DiagramCard.tsx` (DIAGRAM_COMP với công cụ đặt nhãn trên ảnh)
  - `MatchCard.tsx` (MATCH_HEADING, MATCH_INFO, MATCH_ENDING, MATCH_FEATURE)
  - `McqCard.tsx` (MCQ_SINGLE, MCQ_MULTI)
  - `JudgeCard.tsx` (TFNG, YNNG)
- Xây dựng các panel chuyên dụng: `PassagePanel.tsx`, `AudioPanel.tsx`, `TranscriptPanel.tsx`, `PublishIssues.tsx`, `TypePicker.tsx`.
- Hợp nhất vào component [LrEditor.tsx](../../frontend/src/components/exams/lr-editor/LrEditor.tsx), tạo hai trang vỏ mỏng [AdminReadingEditor.tsx](../../frontend/src/pages/admin/exams/editors/AdminReadingEditor.tsx) và [AdminListeningEditor.tsx](../../frontend/src/pages/admin/exams/editors/AdminListeningEditor.tsx).
- Xóa bỏ hai tệp mã nguồn legacy `.jsx` cũ (`AdminReadingEditor.jsx` 12,548 dòng và `AdminListeningEditor.jsx` 13,367 dòng), giảm hơn 25,000 dòng mã thừa.

### 7. Tích hợp Speech-to-Text Groq Whisper (LRE-07c)
- Cập nhật cấu hình môi trường [backend/src/config.ts](../../backend/src/config.ts) hỗ trợ `GROQ_API_KEY`.
- Tạo [backend/src/integrations/ai/transcription.ts](../../backend/src/integrations/ai/transcription.ts):
  - Interface `TranscriptionProvider` và triển khai `GroqWhisperProvider` sử dụng mô hình `whisper-large-v3-turbo` qua Groq Cloud API.
  - Thuật toán `segmentsToParagraphs`: Tự động gộp câu thoại và ngắt đoạn mới khi khoảng lặng ≥ 1.5 giây hoặc độ dài đoạn > 30 giây, gắn mốc thời gian `[mm:ss]` và nhãn đoạn A, B, C...
- Tạo [backend/src/modules/exams/transcription-jobs.service.ts](../../backend/src/modules/exams/transcription-jobs.service.ts): Quản lý hàng đợi tác vụ nhận diện giọng nói trong RAM, dọn dẹp sau 1 giờ.
- Bổ sung Endpoint **E10** (`POST /admin/exam-skills/:skillId/sections/:orderNo/transcribe`, giới hạn 20 lần/giờ) và **E11** (`GET /admin/transcriptions/:jobId`).
- Xây dựng component [TranscribeModal.tsx](../../frontend/src/components/exams/lr-editor/TranscribeModal.tsx) thăm dò tiến độ và hiển thị bản xem trước 3 đoạn thoại đầu trước khi áp dụng vào editor.
- Viết 4 unit tests trong `backend/tests/transcription.test.mjs`, đạt 100%.

### 8. Chuẩn hóa AdminWritingEditor & Khóa nút Nhập xlsx (LRE-07b & LRE-08)
- Refactor [frontend/src/pages/admin/exams/editors/AdminWritingEditor.tsx](../../frontend/src/pages/admin/exams/editors/AdminWritingEditor.tsx) sử dụng bộ component `editor-shell` dùng chung, giảm từ 3,659 dòng xuống 430 dòng, loại bỏ 206 lỗi TypeScript và đạt chuẩn 0 `any`.
- Cập nhật [frontend/src/pages/admin/exams/AdminExamSet.tsx](../../frontend/src/pages/admin/exams/AdminExamSet.tsx): Khóa nút "Nhập xlsx" ở đầu cột Listening và Reading, chuyển sang trạng thái `aria-disabled`, hiển thị tooltip "Đang nâng cấp định dạng xlsx cho kỹ năng này".

### 9. Cập nhật tài liệu kỹ thuật (LRE-09)
- Cập nhật [docs/API.md](../API.md): Bổ sung đầy đủ tài liệu kỹ thuật cho các endpoints E1, E2, E3, E5, E6, E7, E8, E9, E10, E11.
- Cập nhật [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md): Điều chỉnh quy tắc sẵn sàng xuất bản BR-EXAM-007 cho 4 kỹ năng và bổ sung các quy tắc mới BR-EXAM-011 đến BR-EXAM-015.
- Cập nhật [docs/csdl/CSDL.md](../csdl/CSDL.md) và [docs/csdl/README.md](../csdl/README.md): Bổ sung định dạng lưu trữ cấu trúc đề Reading/Listening và thang điểm `10_thang_band_lr.sql`.
- Cập nhật [docs/TASKS.md](../TASKS.md): Đánh dấu hoàn thành toàn bộ các hạng mục LRE-00 đến LRE-09.

---

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `npm --prefix backend run typecheck` | Local Windows PowerShell | Đạt 100% (0 lỗi TypeScript) |
| `npm --prefix backend run build` | Local Windows PowerShell | Đạt 100% (tsc biên dịch ra thư mục dist thành công) |
| `node backend/tests/exam-lr-mapper.test.mjs` | Local Node v24 | 5/5 tests PASS (DB ↔ DTO round-trip lossless cho 16 dạng câu hỏi, validateReadingReady & validateListeningReady) |
| `node backend/tests/storage-audio.test.mjs` | Local Node v24 | 5/5 tests PASS (nhận diện MP3, WAV, M4A và từ chối tệp không hợp lệ) |
| `node backend/tests/transcription.test.mjs` | Local Node v24 | 4/4 tests PASS (định dạng [mm:ss], sinh nhãn chữ cái, gộp câu thoại theo khoảng lặng và độ dài) |
| `node frontend/tests/lr-editor.test.mjs` | Local Node v24 | 7/7 tests PASS (hàm thuần, đánh số 40 câu, tính bản vá vi sai diffLrContent, gán ID backend applySavedIds) |
| `npm --prefix frontend run build` | Local Windows PowerShell | Đạt 100% (tsc --noEmit và Vite build thành công không lỗi, xuất bản đầy đủ gói bundle) |

---

## Phần còn mở

- Nhập đề từ tệp Excel (xlsx) cho Reading và Listening: Hiện đã khóa nút an toàn theo đúng quyết định thiết kế O-L3 để phát triển riêng trong đợt IMPORT-01..03.
- Chưa ghi nhận lỗi hoặc vấn đề tồn đọng nào khác trong phạm vi LRE.

---

## Bước tiếp theo

1. Quản lý hệ thống chạy tệp [docs/csdl/10_thang_band_lr.sql](../csdl/10_thang_band_lr.sql) trong Supabase SQL Editor để cấu hình thang điểm band chuẩn Cambridge vào môi trường thật.
2. Chuẩn bị kế hoạch cho đợt tiếp theo: Làm bài thi trực tuyến cho học viên (Attempt Engine) hoặc công cụ nhập liệu Excel (Import xlsx).

---

## Tài liệu và cách tái hiện

- Kế hoạch chi tiết: [docs/PLAN_EDITOR_LISTENING_READING.md](../PLAN_EDITOR_LISTENING_READING.md)
- Báo cáo bàn giao trước đó: [docs/PROGRESS/2026-11-15-cai-tien-tong-the.md](2026-11-15-cai-tien-tong-the.md)
- Hợp đồng API: [docs/API.md](../API.md)
- Quy tắc nghiệp vụ: [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md)
