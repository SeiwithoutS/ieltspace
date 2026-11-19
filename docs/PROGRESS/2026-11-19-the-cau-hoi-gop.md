# Tiến độ Cập nhật thẻ câu hỏi theo 5 nhóm (GQ-00 đến GQ-09) ngày 19/11/2026

## Phạm vi và trạng thái

- **Mã công việc**: GQ-00 đến GQ-09 theo kế hoạch [plan-the-cau-hoi-gop-19-11.md](../plan-the-cau-hoi-gop-19-11.md).
- **Mục tiêu**: Cập nhật cơ chế đổi dạng câu hỏi trực tiếp trên tiêu đề thẻ theo 5 nhóm câu hỏi chuẩn IELTS, thêm toggle chuyển đổi linh hoạt cho Summary Completion (`SUMMARY_COMP` ↔ `SUMMARY_BOX`), bổ sung hộp thoại xác nhận khi đổi kiểu hình trong `DiagramModeToggle`, gộp giao diện Matching Features / Sentence Endings, đảm bảo CSS khớp hoàn toàn hệ thống Tailwind hiện tại, và xóa bỏ các component showcase cũ (`QuestionCard.jsx`, `QuestionCards.jsx`).
- **Trạng thái**: **HOÀN THÀNH**. Frontend và backend vượt qua typecheck, build và unit tests 100%.

## Công việc đã thực hiện

### 1. Cấu hình 5 nhóm câu hỏi (GQ-01)
- Cập nhật [frontend/src/lib/lr-editor/constants.ts](../../frontend/src/lib/lr-editor/constants.ts) và re-export ở [frontend/src/components/exams/lr-editor/config.ts](../../frontend/src/components/exams/lr-editor/config.ts):
  - `LR_TYPE_GROUPS`: Định nghĩa 5 nhóm câu hỏi:
    1. `blank-sentence`: Câu có chỗ trống (`SENTENCE_COMP`, `SHORT_ANSWER`).
    2. `blank-passage`: Đoạn văn có chỗ trống (`SUMMARY_COMP`, `NOTE_COMP`, kèm `SUMMARY_BOX` qua toggle).
    3. `table-diagram`: Bảng và sơ đồ (`TABLE_COMP`, `FLOW_COMP`, `DIAGRAM_COMP`).
    4. `matching`: Ghép với danh sách (`MATCH_HEADING`, `MATCH_INFO`, `MATCH_FEATURE`, `MATCH_ENDING`).
    5. `choice`: Trắc nghiệm (`MCQ_SINGLE`, `MCQ_MULTI`, `TFNG`, `YNNG`).
  - `COMBO_TYPE_LABELS`: Bảng nhãn hiển thị trực quan cho từng dạng.
  - `groupOfType`: Hàm xác định nhóm câu hỏi cho một mã dạng.
  - `comboOptions`: Trả về danh sách lựa chọn trong nhóm, tự động lọc theo danh sách `allowedTypes` của kỹ năng (ví dụ Listening loại trừ Headings, Information, TFNG, YNNG).

### 2. Hàm đổi dạng và kiểm tra dữ liệu (GQ-02)
- [frontend/src/lib/lr-editor/pure.ts](../../frontend/src/lib/lr-editor/pure.ts): Thêm hàm thuần `groupHasData` kiểm tra dữ liệu nhập của người dùng (`items`, `body`, `opts`, `marks`, `nodes`, `rows`, `texts`, `ans`, `steps`).
- [frontend/src/components/exams/lr-editor/LrEditor.tsx](../../frontend/src/components/exams/lr-editor/LrEditor.tsx):
  - Thêm `handleChangeType`: Kiểm tra dữ liệu hiện có; nếu nhóm đã có dữ liệu thì mở `ConfirmDialog` xác nhận trước khi đổi dạng; nếu nhóm trống thì đổi ngay.
  - Thêm `applyChangeType`: Tạo nhóm câu hỏi mới của dạng được chọn, giữ nguyên `id`, `orderNo`, vị trí nhóm; tự động khởi tạo câu hướng dẫn Cambridge (`autoInstr`); giữ nguyên nhóm câu hỏi đang mở (`activeGroup`).

### 3. Component `GroupTypeSwitcher` ở tiêu đề thẻ (GQ-03)
- Tạo mới [frontend/src/components/exams/lr-editor/GroupTypeSwitcher.tsx](../../frontend/src/components/exams/lr-editor/GroupTypeSwitcher.tsx):
  - Ở chế độ Xem (`readOnly`) hoặc nhóm chỉ có 1 lựa chọn: hiển thị text thông thường, không có mũi tên.
  - Ở chế độ Sửa: hiển thị nút chọn dạng kèm icon chevron; khi bấm mở menu dropdown nằm trong `.lr-editor-root`, tự động đóng khi nhấp ra ngoài hoặc bấm phím `Esc`.
  - Tích hợp `stopPropagation` để thao tác chọn dạng không kích hoạt sự kiện đóng/mở nhóm câu hỏi.

### 4. Toggle gộp Summary Completion (GQ-04)
- Tạo component [frontend/src/components/exams/lr-editor/cards/SummaryModeToggle.tsx](../../frontend/src/components/exams/lr-editor/cards/SummaryModeToggle.tsx):
  - Cấu trúc và class tương tự `DiagramModeToggle`, gồm 2 tab: "Điền đáp án (không có danh sách từ)" (`SUMMARY_COMP`) và "Có danh sách từ (Word list)" (`SUMMARY_BOX`).
  - Tích hợp vào [BlankTextCard.tsx](../../frontend/src/components/exams/lr-editor/cards/BlankTextCard.tsx) và [WordBankCard.tsx](../../frontend/src/components/exams/lr-editor/cards/WordBankCard.tsx).
  - Khi chuyển đổi giữa `SUMMARY_COMP` và `SUMMARY_BOX`: bảo toàn nội dung đoạn văn tóm tắt (`body`) và giới hạn từ (`limit`), chỉ hỏi xác nhận nếu đã nhập đáp án hoặc danh sách từ ngoài đoạn văn.

### 5. Xác nhận khi đổi kiểu hình (GQ-05)
- Cập nhật [frontend/src/components/exams/lr-editor/cards/MapLettersCard.tsx](../../frontend/src/components/exams/lr-editor/cards/MapLettersCard.tsx):
  - Trong `DiagramModeToggle`: kiểm tra nếu đã có dữ liệu nhãn/đáp án (`marks`, `texts`, `ans`, `items`, `opts > 5`) thì mở `ConfirmDialog` trước khi chuyển giữa "Đặt nhãn số lên hình" và "Hình có sẵn chữ cái".

### 6. Gộp Matching Features + Sentence Endings (GQ-06)
- Trong `GroupTypeSwitcher`: `MATCH_ENDING` hiển thị cùng mục "Matching Features / Sentence Endings" với `MATCH_FEATURE`.
- Nếu chọn mục này từ dạng khác, hệ thống tạo `MATCH_FEATURE`. Nếu nhóm hiện tại đang là `MATCH_ENDING` mà người dùng bấm lại mục này thì giữ nguyên.

### 7. Xóa bỏ QuestionCard và QuestionCards cũ (GQ-09)
- Đã xác minh toàn bộ repo chỉ có `QuestionCards.jsx` import `QuestionCard.jsx`, và `QuestionCards.jsx` chỉ được khai báo ở `frontend/src/app/pages.ts` mà không có menu hay liên kết nào dẫn tới.
- Thực hiện xóa:
  - `frontend/src/components/exams/QuestionCard.jsx`
  - `frontend/src/pages/admin/exams/editors/QuestionCards.jsx`
  - Dòng lazy import trong [frontend/src/app/pages.ts](../../frontend/src/app/pages.ts)
- Cập nhật các dòng nhắc tới hai file này trong [docs/BAO_CAO_BAN_GIAO.md](../BAO_CAO_BAN_GIAO.md) và [docs/DESIGN.md](../DESIGN.md).

---

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `node frontend/tests/lr-editor.test.mjs` | Local Node v24 | **9/9 tests PASS** (phân nhóm 5 nhóm, comboOptions, groupHasData, pure numbering & converters) |
| `npm --prefix frontend run build` | Local Windows PowerShell | **PASS 100%** (`tsc --noEmit && vite build` thành công trong 2.42s, 0 lỗi TypeScript) |
| `npm --prefix backend run typecheck` | Local Windows PowerShell | **PASS 100%** (0 lỗi) |
| `npm --prefix backend run build` | Local Windows PowerShell | **PASS 100%** (0 lỗi) |
| Backend Unit Tests | Local Node v24 | **14/14 tests PASS** (transcription, exam-lr-mapper, storage-audio) |

---

## Phần còn mở

- Chưa ghi nhận lỗi hoặc vấn đề tồn đọng nào.

---

## Bước tiếp theo

1. Bàn giao cho người dùng kiểm tra trực quan trên giao diện Admin Reading/Listening Editor.
2. Tiếp tục các đợt phát triển tiếp theo theo lộ trình dự án.
