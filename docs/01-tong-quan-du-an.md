# 01. Tổng quan dự án IELTSpace

Cập nhật 09/11/2026. Tổng hợp từ bộ nhớ dự án và Chương 1-3 (bản "sửa 20-10 lần 2"). Khi tài liệu này lệch với báo cáo, **Chương 3 thắng Chương 1**, Chương 2 thắng Chương 1 về công nghệ.

## 1. Đề tài

- Đồ án 1, ĐH CNTT (ĐHQG TP.HCM), khoa Công nghệ phần mềm, năm 2026.
- Tên đề tài: "Xây dựng nền tảng hỗ trợ học tập và ôn luyện IELTS". Tên sản phẩm: **IELTSpace** (trước 26/10 dùng tên tạm BandUp).
- GVHD: Nguyễn Thị Xuân Hương. Sinh viên: Nguyễn Trọng Phúc, Võ Nguyễn Thanh Hương.
- Động lực: học ở trung tâm tốn kém, cố định giờ, thiếu cá nhân hóa. Đã khảo sát Study4, PREP, DOL Tự Học, IELTS Online Test: chưa nền tảng nào gom đủ chức năng.

## 2. Phạm vi MVP

- Web desktop, tiếng Việt. Không app native, không AI chấm (AI là hướng phát triển sau), **bỏ song ngữ Việt-Anh** (chốt 20/10).
- Đủ 4 kỹ năng: Listening, Reading (chấm tự động), Writing, Speaking (Giáo viên chấm tay). Speaking nằm trong phạm vi.
- Gồm 2 phần: Dashboard nhập liệu cho Quản lý (đề thi, bài mẫu, từ vựng) và Landing Page cho người học (đăng ký, luyện thi, theo dõi tiến độ).
- Ngoài phạm vi: forum, nghe chép chính tả, ngữ pháp, Giáo viên xem tiến độ người học.
- Còn mở: yêu cầu phần cứng ("chưa xác định").

## 3. Tác nhân

| Tác nhân | Vai trò chính |
|---|---|
| Khách | Xem trang giới thiệu, thư viện đề, thư viện từ vựng, bài mẫu; đăng ký, đăng nhập |
| Người học | Làm bài, luyện theo dạng, xem kết quả, lưu và gửi chấm W/S, flashcard, từ vựng, mục tiêu, thông báo |
| Giáo viên | Xem hàng đợi, chấm W/S được phân công, xem lịch sử đã chấm |
| Quản lý | Người dùng, bộ đề và đề thi, bài mẫu, từ vựng, nhập xlsx, thống kê, theo dõi hỗ trợ chấm |

Không dùng các tên cũ "Trợ giảng", "User", "Assistant", "Admin" trong tài liệu và giao diện.

## 4. Cấu trúc nghiệp vụ đề thi

Bộ đề → Đề thi → Kỹ năng → Phần (Section / Passage / Task / Part) → Question Group → Question → Đáp án (L/R) hoặc Rubric (W/S).

- Làm từng kỹ năng độc lập, không bắt buộc làm trọn đề; luyện được theo từng Question Group (L/R) hoặc từng Task/Part (W/S).
- Trạng thái nội dung: Bản nháp, Công khai (trên giao diện gọi là "Đăng"), Đã ẩn.
- Reading và Writing có 2 hình thức Academic và General Training; Listening và Speaking dùng chung.

## 5. Tài liệu liên quan

- [02 Công nghệ và kiến trúc](02-cong-nghe-va-kien-truc.md)
- [03 Use case](03-use-case.md)
- [04 Chấm Writing/Speaking](04-cham-bai-writing-speaking.md)
- Bản tóm tắt Chương 1-3 gốc: [tai-lieu-goc/tom-tat-chuong-1-3.md](tai-lieu-goc/tom-tat-chuong-1-3.md)
- Báo cáo Word nằm trong thư viện dự án: `tai-lieu/Chương 1 ... (sửa 20-10 lần 2).docx`, `Chương 3 ... (sửa 20-10 lần 2).docx`.
