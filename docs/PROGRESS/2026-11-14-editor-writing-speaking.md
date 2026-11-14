# Tiến độ Editor Writing, Speaking và Xóa kỹ năng ngày 14/11/2026

## Phạm vi và trạng thái

- **Mã task:** WSE-00 đến WSE-09 theo kế hoạch [PLAN_EDITOR_WRITING_SPEAKING.md](../PLAN_EDITOR_WRITING_SPEAKING.md).
- **Mục tiêu:**
  1. Kết nối Editor Writing và Speaking với dữ liệu CSDL thật qua `?skillId=`, hỗ trợ chế độ xem/sửa, tự động tạo bản sửa mới (DRAFT) khi bấm Chỉnh sửa trên bản đã đăng, cơ chế lưu an toàn chống ghi đè đồng thời (`baseUpdatedAt`), và tải ảnh đề thi Writing Task 1 lên Supabase Storage (bucket `exam-assets`).
  2. Triển khai điều kiện sẵn sàng xuất bản đề thi Writing & Speaking (WS-07) và tự động gán quy tắc chấm `FULL_SKILL` phù hợp từ CSDL (`06_quy_tac_cham_ws.sql`).
  3. Thêm tính năng xóa kỹ năng DRAFT và bỏ bản sửa chưa đăng cho toàn bộ kỹ năng L/R/W/S tại trang Thông tin bộ đề (`AdminExamSet.tsx`) và trong chính Editor. Hỗ trợ nút Hoàn tác ngay trên thông báo Toast sau khi bấm "Tạo" kỹ năng.
  4. Chuyển đổi `AdminWritingEditor.jsx` và `AdminSpeakingEditor.jsx` sang `.tsx` tuân thủ nghiêm ngặt RULES (không sử dụng kiểu `any`, giữ nguyên 100% bố cục, màu sắc canvas).
- **Trạng thái:** **HOÀN THÀNH TOÀN BỘ (100%)**. Đã kiểm thử unit test logic, tích hợp CSDL PostgreSQL, kiểm tra kiểu dữ liệu TypeScript và build thành công ở cả Backend và Frontend.

## Công việc đã thực hiện

1. **Cơ sở dữ liệu & Đồng bộ Prisma (WSE-00):**
   - Đã thực thi [06_quy_tac_cham_ws.sql](../csdl/06_quy_tac_cham_ws.sql) trên PostgreSQL, bổ sung 4 bộ quy tắc chấm (`grading_rules`) cho Writing và Speaking (bao gồm phạm vi `FULL_SKILL` và `SECTION`) kèm 16 tiêu chí đánh giá chuẩn IELTS (`rubric_criteria`).
   - Cập nhật [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma): bổ sung `aggregation_rules Json?`, `rounding_rules Json?` cho bảng `grading_rules` và model `rubric_criteria`.
   - Sinh Prisma Client mới (`npm run prisma:generate`) và đối soát kiểu thành công.

2. **Domain Rules & Content Mapper (WSE-01):**
   - Xây dựng module chuyển đổi dữ liệu thuần [exam-content.mapper.ts](../../backend/src/modules/exams/exam-content.mapper.ts): chuyển đổi hai chiều giữa các dòng thực thể CSDL (`exam_sections`, `question_groups`, `questions`) và DTO nghiệp vụ (`WritingContent`, `SpeakingContent`).
   - Mở rộng [exam-rules.ts](../../backend/src/modules/exams/exam-rules.ts):
     - Chuẩn hóa thời lượng mặc định Speaking: `defaultDuration('SPEAKING') = 15` (Part 1 & 3 chung 12 phút, Part 2: 1 phút chuẩn bị + 2 phút nói).
     - Bổ sung `validateWritingReady` và `validateSpeakingReady` theo điều kiện WS-07, trả về câu thông báo lỗi tiếng Việt khớp với danh sách kiểm tra trên giao diện (`allIssues`).
     - Tích hợp kiểm tra sẵn sàng vào hàm tổng quát `validateSkillReady`.
     - Bổ sung `canDeleteSkill` (chỉ cho phép xóa bản DRAFT khi chưa có lượt làm bài `attemptCount === 0`) và hàm tính thời lượng `speakingDuration`.
   - Viết bộ unit test độc lập [backend/tests/exam-ws-rules.test.mjs](../../backend/tests/exam-ws-rules.test.mjs) với 7 bài kiểm tra bao phủ 100% logic mapper và validation.

3. **Supabase Storage cho Đề thi (WSE-02):**
   - Cấu hình biến môi trường `STORAGE_BUCKET_EXAM_ASSETS` (mặc định: `exam-assets`) trong `config.ts`, `.env` và `.env.example`.
   - Bổ sung các tiện ích trong [supabase-storage.ts](../../backend/src/integrations/storage/supabase-storage.ts): `detectImageExtension` hỗ trợ tùy biến mã lỗi, `uploadSkillImage` (kiểm tra dung lượng ≤ 5MB, định dạng JPG/PNG/WebP qua "magic bytes", lưu tại `exam-skills/<skillId>/<uuid>.<ext>`), `publicUrl` và `removeObjects` để dọn rác bộ lưu trữ.

4. **Backend Editor Service & Audit (WSE-03):**
   - Xây dựng [exam-editor.service.ts](../../backend/src/modules/exams/exam-editor.service.ts) phục vụ các endpoint E1, E2, E3, E5, E6:
     - `getEditorSkill`: lấy chi tiết kỹ năng DRAFT/PUBLISHED/HIDDEN/ARCHIVED, trả về nội dung mặc định nếu đề mới tạo.
     - `saveSkillContent`: lưu nội dung Writing/Speaking trong transaction, xác thực `baseUpdatedAt` chống ghi đè chéo (WS-02), thay thế toàn bộ phần thi/nhóm câu/câu hỏi của bản DRAFT, cập nhật `duration_minutes` và trigger cập nhật `updated_at`. Tự động dọn ảnh Storage không còn được tham chiếu sau khi transaction commit (WS-09).
     - `createRevisionDraft`: tạo bản nháp sửa đổi mới (`version_number = max + 1`) sao chép toàn bộ nội dung từ bản PUBLISHED/HIDDEN hiện tại (WS-05). Tự động tái sử dụng nếu bản DRAFT đã tồn tại.
     - `uploadSkillImage`: tải ảnh cho Writing Task 1, trả về đường dẫn Storage và URL công khai (WS-08).
     - `deleteSkill`: xóa an toàn bản DRAFT từ dưới lên (câu trả lời -> câu hỏi -> nhóm câu -> phần thi -> kỹ năng) và dọn các tệp ảnh liên quan trên Storage (WS-10, WS-11).
   - Nâng cấp `publishSkill` trong [exam-skills.service.ts](../../backend/src/modules/exams/exam-skills.service.ts): lọc quy tắc chấm với điều kiện `assessment_scope: 'FULL_SKILL'` và nạp nội dung phần thi vào `validateSkillReady` (WS-06).
   - Cập nhật [shared/audit.ts](../../backend/src/shared/audit.ts) ghi vết các hành động: `EXAM_SKILL_SAVE`, `EXAM_SKILL_DRAFT_CREATE`, `EXAM_SKILL_DELETE`.

5. **API Endpoints & Schemas (WSE-04):**
   - Định nghĩa Zod schemas trong [exams.schemas.ts](../../backend/src/modules/exams/exams.schemas.ts): kiểm tra nghiêm ngặt độ dài văn bản (Writing đề bài ≤ 5000 ký tự; Speaking câu hỏi ≤ 300 ký tự, thẻ đề ≤ 3000 ký tự, thời lượng số nguyên 1–120) và đường dẫn ảnh hợp lệ (WS-03, WS-04).
   - Đăng ký 6 routes quản trị E1–E6 trong [exams.admin.routes.ts](../../backend/src/modules/exams/exams.admin.routes.ts):
     - `GET /api/admin/exam-skills/:skillId` (E1)
     - `PUT /api/admin/exam-skills/:skillId/content` (E2)
     - `POST /api/admin/exam-skills/:skillId/draft` (E3)
     - `POST /api/admin/exam-skills/:skillId/publish` (E4 - A16 mở rộng)
     - `PUT /api/admin/exam-skills/:skillId/images` (E5 - middleware express.raw)
     - `DELETE /api/admin/exam-skills/:skillId` (E6)
   - Viết bộ kiểm thử tích hợp [backend/tests/exam-editor-services.test.mjs](../../backend/tests/exam-editor-services.test.mjs) kiểm tra toàn diện E1–E6 trên PostgreSQL thật.

6. **Frontend API SDK & Mappers (WSE-05):**
   - Xây dựng thư viện giao tiếp [frontend/src/lib/exam-editor.ts](../../frontend/src/lib/exam-editor.ts):
     - Các kiểu dữ liệu: `EditorSkill`, `WritingContent`, `SpeakingContent`, `WritingEditorState`, `SpeakingEditorState`.
     - Các hàm chuyển đổi state hai chiều: `toEditorState`, `fromEditorState` giữ nguyên mô hình dữ liệu của canvas editor.
     - Hàm gọi API: `getEditorSkill`, `saveSkillContent`, `createRevisionDraft`, `uploadSkillImage`, `deleteSkillEditor`.
   - Mở rộng [frontend/src/lib/exam-admin.ts](../../frontend/src/lib/exam-admin.ts) với hàm `deleteSkill(skillId)`.

7. **Chuyển đổi Editor Writing & Speaking sang TSX (WSE-06, WSE-07):**
   - Chuyển đổi [AdminWritingEditor.tsx](../../frontend/src/pages/admin/exams/editors/AdminWritingEditor.tsx) và [AdminSpeakingEditor.tsx](../../frontend/src/pages/admin/exams/editors/AdminSpeakingEditor.tsx) sang TypeScript không dùng `any`:
     - Tự động nạp dữ liệu từ CSDL dựa trên `?skillId=` trên URL hash.
     - Hiển thị trạng thái "Đang tải đề…" và màn hình "Không tìm thấy kỹ năng" khi ID không hợp lệ kèm nút điều hướng quay về danh sách.
     - Nút "Chỉnh sửa": nếu đề đã công khai/ẩn, tự động gọi E3 tạo bản nháp sửa đổi mới và cập nhật `skillId` trên URL bằng `history.replaceState`.
     - Nút "Lưu": gửi `baseUpdatedAt` để phát hiện xung đột ghi đè đồng thời.
     - Tải ảnh Task 1: kiểm tra file ở FE và tải lên Supabase Storage qua E5.
     - Nút "Đăng": kiểm tra danh sách vi phạm cục bộ (`allIssues`) và gửi yêu cầu đăng lên máy chủ, hiển thị thông báo lỗi 422 chi tiết nếu máy chủ từ chối.
     - Nút "Xóa kỹ năng" / "Bỏ bản sửa": hiển thị ở chế độ Chỉ xem với màu viền đỏ `#C0412A` và hộp thoại xác nhận an toàn.
     - Vô hiệu hóa nút nhập file XLSX kèm tooltip giải thích.
   - Xóa bỏ các tệp `.jsx` cũ tương ứng.

8. **Cập nhật Giao diện Quản lý Bộ đề AdminExamSet (WSE-08):**
   - Menu thao tác kỹ năng trong [AdminExamSet.tsx](../../frontend/src/pages/admin/exams/AdminExamSet.tsx):
     - Ô chỉ có bản DRAFT: hiển thị tùy chọn "Xóa {tên kỹ năng}" chữ đỏ.
     - Ô có bản đang hiển thị kèm bản DRAFT: hiển thị tùy chọn "Bỏ bản sửa chưa đăng" và ghi chú trạng thái "Có bản sửa chưa đăng".
   - Hộp thoại xác nhận xóa `cf` loại `delSkill` sử dụng nút bấm màu đỏ `BTN_RED`.
   - Toast thông báo sau khi bấm "Tạo" kỹ năng được bổ sung nút "Hoàn tác", cho phép người quản trị gỡ ngay bản nháp vừa bấm tạo nhầm mà không cần mở menu.

9. **Đồng bộ Tài liệu Kỹ thuật (WSE-09):**
   - [docs/API.md](../API.md): tài liệu hóa đầy đủ các endpoint E1–E6.
   - [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md): bổ sung BR-EXAM-007 (điều kiện xuất bản Writing & Speaking) và BR-EXAM-010 (quy tắc xóa kỹ năng và hủy bản sửa).
   - [docs/csdl/CSDL.md](../csdl/CSDL.md): bổ sung Mục 9 quy định chi tiết định dạng lưu trữ `exam_sections` cho Writing và Speaking.
   - [docs/csdl/README.md](../csdl/README.md): ghi nhận kịch bản `06_quy_tac_cham_ws.sql`.
   - [docs/TASKS.md](../TASKS.md): bổ sung các dòng công việc WSE-00 đến WSE-09.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Thực thi `06_quy_tac_cham_ws.sql` | PostgreSQL Local (Port 5432) | Đạt. 4 dòng `grading_rules` và 16 dòng `rubric_criteria` được khởi tạo chuẩn xác. |
| `npm run prisma:generate` | Local Node.js v20 | Đạt. Prisma Client đồng bộ mô hình mới không phát sinh cảnh báo. |
| `node --test backend/tests/exam-ws-rules.test.mjs` | Local Node.js v20 | Đạt. 7/7 unit tests đạt (thời lượng Speaking 15p, canDeleteSkill, validateWritingReady, validateSpeakingReady, mapper round-trip 2 chiều). |
| `node --test backend/tests/exam-rules.test.mjs` | Local Node.js v20 | Đạt. 8/8 unit tests đạt (quy tắc quản lý bộ đề và phân bổ slot). |
| `node --test backend/tests/exam-editor-services.test.mjs` | Local Node.js v20 + PostgreSQL | Đạt. 1/1 integration suite đạt (bao phủ toàn bộ chu trình E1–E6, WS-01 đến WS-12, concurrency conflict 409, dọn dẹp Storage, xóa kỹ năng). |
| `npm --prefix backend run typecheck` | Local Node.js v20 | Đạt. 0 lỗi typecheck TypeScript (NodeNext). |
| `npm --prefix backend run build` | Local Node.js v20 | Đạt. Biên dịch toàn bộ backend TypeScript sang thư mục `dist/` thành công. |
| `npm --prefix frontend run build` | Local Node.js v20 | Đạt. `tsc --noEmit && vite build` hoàn tất sạch sẽ trong 2.88 giây, không có lỗi `any` hay lỗi cú pháp TSX. |

## Phần còn mở

- Chưa ghi nhận lỗi tồn đọng. Toàn bộ các yêu cầu từ WSE-00 đến WSE-09 đã được triển khai và kiểm thử nghiệm thu hoàn tất.
- Tính năng nhập file XLSX cho Writing và Speaking được thiết kế nút khóa (`disabled`) đúng theo quyết định O4 của kế hoạch, sẵn sàng nối khi có đặc tả luồng import.

## Bước tiếp theo

1. Tiến hành công việc nhập đề thi từ file XLSX cho các kỹ năng theo lộ trình.
2. Xây dựng và kết nối các màn hình biên tập còn lại (`AdminReadingEditor.tsx`, `AdminListeningEditor.tsx`).
3. Chuẩn bị các màn hình làm bài thi thực tế phía học viên (`WritingTest.tsx`, `SpeakingTest.tsx`).

## Tài liệu và cách tái hiện

- Kế hoạch chi tiết: [docs/PLAN_EDITOR_WRITING_SPEAKING.md](../PLAN_EDITOR_WRITING_SPEAKING.md)
- Danh mục API: [docs/API.md](../API.md)
- Quy tắc nghiệp vụ: [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md)
- Cấu trúc CSDL: [docs/csdl/CSDL.md](../csdl/CSDL.md)
- Bảng công việc: [docs/TASKS.md](../TASKS.md)

