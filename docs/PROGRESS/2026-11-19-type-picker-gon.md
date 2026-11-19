# Tiến độ Sửa gọn bảng "Chọn dạng câu hỏi cần thêm" (TypePicker) ngày 19/11/2026

## Phạm vi và trạng thái

- **Mục tiêu**: Thu gọn bảng chọn dạng câu hỏi (`TypePicker.tsx`) theo kế hoạch [plan-type-picker-gon-19-11.md](../plan-type-picker-gon-19-11.md). Thay vì hiển thị 7 mục và 16 thẻ dài cuộn 85vh, bảng chuyển sang hiển thị 5 nhóm câu hỏi tương ứng với cơ chế đổi dạng trong tiêu đề thẻ.
- **Trạng thái**: **HOÀN THÀNH**. Giao diện gọn gàng, không cuộn, build và typecheck sạch 100%.

## Công việc đã thực hiện

- Cập nhật [frontend/src/components/exams/lr-editor/TypePicker.tsx](../../frontend/src/components/exams/lr-editor/TypePicker.tsx):
  - Import và tái sử dụng `LR_TYPE_GROUPS` và hàm `typeName` từ `frontend/src/lib/lr-editor/constants.ts`.
  - Thu gọn kích thước dialog thành `max-w-md w-full p-4`, `rounded-2xl`, bỏ `max-h-[85vh]` và thanh cuộn.
  - Đổi tiêu đề thành `Thêm nhóm câu hỏi`, loại bỏ dòng mô tả phụ cũ.
  - Xóa bỏ danh sách phân mục 7 nhóm 16 thẻ mô tả dài (`CATEGORIES`).
  - Hiển thị danh sách 1 cột gồm 5 nhóm theo đúng thứ tự:
    1. *Câu có chỗ trống* (`SENTENCE_COMP · Short Answer`)
    2. *Đoạn văn có chỗ trống* (`Summary Completion · Note Completion`)
    3. *Bảng và sơ đồ* (`Table Completion · Diagram / Map / Flow-chart Completion`)
    4. *Ghép với danh sách* (`Matching Headings · Matching Information · Matching Features`)
    5. *Trắc nghiệm* (`MCQ - Single Answer · MCQ - Multiple Answers · True/False/Not Given · Yes/No/Not Given`)
  - Định dạng từng dòng:
    - Chiều cao ~52px (`px-3 py-2.5`), `rounded-xl border border-solid border-[#E5E0D8] bg-[#FAF9F7]`, hover `bg-[#E3ECFD] border-[#2963CC]`.
    - Tên nhóm: `text-[13px] font-semibold text-[#352637]`.
    - Dòng phụ liệt kê các dạng trong nhóm ngăn bằng " · ": `text-[11px] text-[#706473]`.
    - Chevron `›` màu `#A89CA8` bên phải.
  - Xử lý đóng modal: Giữ nền mờ, hỗ trợ phím `Escape`, bấm vào nền ngoài để đóng (`onClick={onClose}` kèm `e.stopPropagation()` trên dialog), nút × ở góc phải.
  - Tự động lọc theo `allowedTypes`: loại bỏ các dạng không thuộc kỹ năng khỏi dòng phụ; nếu nhóm không còn dạng nào khả dụng thì tự động ẩn. Với Listening, các dạng không có (Headings, Info, TFNG, YNNG) tự động được lược bỏ.
  - Khi bấm chọn nhóm: kích hoạt `onSelectType` với dạng mặc định đầu tiên còn trong `allowedTypes` (`availableTypes[0]`) và gọi `onClose()`.
  - Tuân thủ quy chuẩn CSS: luôn sử dụng `border border-solid`, không dùng border trần.

  - Bổ sung thực hiện task **GQ-10** (Xóa `FLOW_COMP` và gộp Flow-chart vào Diagram):
    - Đã xóa `cards/FlowCard.tsx` khỏi frontend.
    - Gỡ bỏ `FLOW_COMP` khỏi union `LrQuestionType`, `LR_TYPE_GROUPS`, `ALL_LR_TYPES`, `LISTENING_TYPES`, `LrEditor.tsx`, `pure.ts`, `converters.ts`.
    - Cập nhật nhãn combo và hiển thị của `DIAGRAM_COMP` thành `'Diagram / Map / Flow-chart Completion'`.
    - Đồng bộ backend (`exam-content.mapper.ts`, `exam-rules.ts`) và cập nhật bộ test suite 15 dạng câu hỏi.
    - Đã xác thực trong CSDL hiện tại: có **0** nhóm lưu `FLOW_COMP`.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `npx tsc --noEmit` (frontend) | Local (frontend) | Đạt, 0 lỗi TypeScript |
| `npm run build` (frontend) | Local (frontend) | Đạt, `tsc --noEmit && vite build` hoàn thành trong 3.12s |
| `node frontend/tests/lr-editor.test.mjs` | Local Node v24 | **9/9 tests PASS** |
| `npm run typecheck` (backend) | Local (backend) | Đạt, 0 lỗi TypeScript |
| `npm run build` (backend) | Local (backend) | Đạt, tsc hoàn thành thành công |
| Backend unit tests | Local Node v24 | **22/22 tests PASS** (exam-lr-mapper, exam-rules, storage-audio, transcription) |

## Phần còn mở

- Chưa ghi nhận.

## Bước tiếp theo

1. Mở thử giao diện trên trình duyệt với kỹ năng Reading và Listening để xác nhận trải nghiệm người dùng thực tế.
