# 07. Quản lý Bộ đề và Đề thi (UC20)

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án (canvas từ bản 113 đến 236). Màn tương ứng trong `docs/ui/canvas/`: `AdminExams`, `AdminExamSet`, `ExamDetail` và 4 editor.

## 1. Chuỗi màn

1. **Danh sách bộ đề** (`AdminExams`): chỉ còn danh sách bộ đề, mỗi dòng có chip số đề theo kỹ năng và ảnh bìa nhỏ.
   - Nút tạo bộ đề mở overlay: tên, mô tả, ảnh bìa (upload thật). Xong thì Đóng hoặc mở Thông tin bộ đề.
   - Nút Xóa chỉ cho bộ nháp hoặc rỗng, có hộp xác nhận.
2. **Thông tin bộ đề** (`AdminExamSet`):
   - Đầu trang kiểu hồ sơ: ảnh bộ đề cạnh tên, nút máy ảnh mở popover (ảnh mẫu, Tải ảnh lên, Xóa ảnh). Hàng chip Academic/GT/trạng thái nằm dưới tên bộ đề.
   - 4 ô đếm đề theo L/R/W/S (bấm ô thì tô sáng cột). Ô R và W hiện số theo từng hình thức.
   - Bảng Test × kỹ năng, chip trạng thái Đã đăng / Đang soạn / Đã ẩn. Cột R và W tách 2 cột con Academic/GT (header 2 tầng). Ô trống có "+ Tạo"; nút Thêm đề; xóa dòng có Hoàn tác.
   - Menu chip mỗi ô: "Mở editor <Kỹ năng>" cho cả 4 kỹ năng, ẩn/hiện từng kỹ năng. Nút "Nhập xlsx" có ở cả 4 ô kỹ năng.
   - Đăng / Ẩn / Xóa bộ đề.
3. **Editor từng kỹ năng**: xem [08 Editor soạn đề](08-editor-soan-de.md).
4. **Xem như người học**: nút mắt hoặc Đăng mở `ExamDetail` (Landing Page · Chi tiết bộ đề, kiểu DOL): bảng Bài test × L/R/W/S; kỹ năng đang soạn hiện "Đang cập nhật", kỹ năng ẩn hiện "—"; lọc Academic/GT.

## 2. Academic và General Training

- Reading và Writing có 2 hình thức: Academic (chip `#DFF1F4` / `#1F6A78`) và General Training (`#FCE6D6` / `#9A4A17`). Một đề có thể có cả hai.
- Listening và Speaking dùng chung cho cả hai hình thức.
- Loại bộ đề suy ra từ các đề, không còn trường type riêng. Trong CSDL nằm ở `parts.form`.

## 3. Ảnh bộ đề

- Ban đầu là bìa sách dọc 7:10; **đổi sang 3:2 ngày 29/10** để thống nhất với thẻ Landing.
- Kích thước: ExamDetail 288×192, AdminExams 240×160, AdminExamSet 144×96. Cảnh báo lệch tỉ lệ khi lệch quá ngưỡng 1.5. Ảnh khác tỉ lệ thì hiển thị contain trên nền màu.
- Lưu ở Supabase Storage, CSDL giữ `exam_sets.cover_url`.

## 4. Quy tắc

- Trạng thái nội dung: Bản nháp, Công khai (nút ghi "Đăng"), Đã ẩn.
- Bộ đề xóa được khi chưa có lượt làm; đã có thì chỉ ẩn.
- Đăng có hộp xác nhận. Đăng **không** bắt buộc có giải thích đáp án; trang lời giải người học hiện "Đang cập nhật giải thích" cho câu chưa có.
- Nút Hủy / Xóa dùng kiểu đỏ destructive (xem [11 Quy chuẩn giao diện](11-quy-chuan-giao-dien.md)).

## 5. Ghi chú kỹ thuật từ canvas

- Dữ liệu giữa các màn mẫu truyền qua sessionStorage (`ieltspace-set`, `ieltspace-import`, `ieltspace-editor-import`, `ieltspace-learner`), dạng `{at, v}`, chỉ nhận khi dưới 20 giây. Đây là cơ chế giả lập trên canvas, khi code thật thay bằng route và API.
- Doc tổng hợp luồng: "Luồng Bộ đề và Đề thi: tổng hợp đến 27/10" (https://claude.ai/artifact/UVRCZ9WQdJh5MPn7FhsTMr); bản docx ở thư viện dự án `docs/luong-bo-de-va-de-thi-27-10.docx`.
