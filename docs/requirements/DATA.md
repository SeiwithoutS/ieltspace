# Yêu cầu dữ liệu

> Nguồn: Chương 1 §1.4.2 (Chương 1 - Phân tích yêu cầu nghiệp vụ (sửa 20-10 lần 2).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 1.4.2. Yêu cầu dữ liệu

Hệ thống cần lưu trữ và quản lý các nhóm dữ liệu chính sau:

- **Dữ liệu người dùng**: thông tin tài khoản (họ tên, email, mật khẩu đã mã hóa, ảnh đại diện), vai trò (Người học/Giáo viên/Quản lý), trạng thái tài khoản.
- **Dữ liệu đề thi (theo cấu trúc phân cấp)**:
  - Bộ đề: tập hợp nhiều đề thi theo nguồn/chủ đề/mục đích sử dụng.
  - Đề thi: một bài thi cụ thể, gồm một hoặc nhiều kỹ năng.
  - Kỹ năng: Listening, Reading, Writing, Speaking.
  - Phần: đơn vị nội dung theo kỹ năng
  - Question Group: cụm câu hỏi cùng dạng, cùng phần chỉ dẫn.
  - Question: câu hỏi cụ thể, kèm loại câu hỏi (trắc nghiệm, điền từ, matching,...).
  - Answer: đáp án đúng, các đáp án được chấp nhận, lời giải/tiêu chí chấm.
- **Dữ liệu bài làm và chấm bài**:
  - Kết quả làm bài Listening/Reading: điểm số, số câu đúng/sai, thời gian hoàn thành.
  - Bài nộp Writing/Speaking: nội dung bài viết hoặc file ghi âm, trạng thái chấm (chờ/đã chấm), điểm và nhận xét của Giáo viên theo từng tiêu chí.
  - Lịch sử làm bài của người dùng theo thời gian, phục vụ thống kê tiến độ.
- **Dữ liệu từ vựng**: từ, phiên âm, nghĩa, loại từ, ví dụ minh họa, chủ đề/độ khó, cùng dữ liệu cá nhân hóa của người dùng (ghi chú riêng, nhãn tự đặt, trạng thái yêu thích).
- **Dữ liệu hệ thống khác**: nội dung Daily Motivation, log hoạt động phục vụ theo dõi và bảo trì.
- **Định dạng nhập liệu (import format)**: hệ thống quy định một format chung (tệp xlsx theo mẫu, audio/hình ảnh tải kèm) để Quản lý có thể đẩy hàng loạt đề thi, câu hỏi, bài mẫu, từ vựng lên hệ thống mà không cần nhập tay từng mục, đồng thời có bước kiểm tra hợp lệ (validate) dữ liệu trước khi lưu vào hệ thống.

Nguồn dữ liệu ban đầu (đề thi, bài mẫu, từ vựng) do Quản lý/nhóm phát triển biên soạn và nhập vào hệ thống thông qua chức năng đẩy dữ liệu (import); dữ liệu phát sinh trong quá trình sử dụng (kết quả làm bài, ghi chú,...) được sinh ra trực tiếp từ hành vi của người dùng.
