# Yêu cầu phi chức năng

> Nguồn: Chương 1 §1.4.4 (Chương 1 - Phân tích yêu cầu nghiệp vụ (sửa 20-10 lần 2).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 1.4.4. Yêu cầu phi chức năng

- **Performance (Hiệu năng)**: thời gian phản hồi của các thao tác thông thường (đăng nhập, tải trang, nộp bài) không vượt quá 2–3 giây trong điều kiện mạng ổn định; hệ thống chấm điểm trắc nghiệm phải trả kết quả gần như tức thời sau khi người dùng nộp bài.
- **Security (Bảo mật)**: mật khẩu được mã hóa trước khi lưu trữ; phân quyền rõ ràng giữa ba vai trò Người học/Giáo viên/Quản lý; bài Writing/Speaking của người học chỉ hiển thị cho đúng Giáo viên được phân công.
- **Reliability (Độ tin cậy)**: hệ thống hoạt động ổn định, có cơ chế sao lưu dữ liệu định kỳ.
- **Usability (Tính khả dụng)**: giao diện trực quan, dễ thao tác kể cả với người dùng không rành công nghệ; luồng thao tác (tạo tài khoản, làm bài, học từ vựng) tối giản số bước cần thiết; có hướng dẫn/gợi ý khi người dùng thao tác lần đầu.
- **UI (Giao diện người dùng)**: thiết kế nhất quán về màu sắc, font chữ, bố cục xuyên suốt hệ thống; tuân thủ các nguyên tắc thiết kế hiện đại, thân thiện, hỗ trợ chế độ sáng/tối; đảm bảo khả năng tiếp cận.
- **Compatibility (Khả năng tương thích)**: hoạt động tốt trên các trình duyệt phổ biến trên màn hình destop.
- **Scalability (Khả năng mở rộng)**: kiến trúc hệ thống được thiết kế theo hướng module hóa, cho phép dễ dàng mở rộng thêm tính năng hoặc mở rộng quy mô.
- **Maintainability (Khả năng bảo trì)**: mã nguồn tổ chức rõ ràng theo module chức năng (Người học/Giáo viên/Quản lý), có tài liệu kỹ thuật đi kèm, áp dụng clean code và kiểm soát phiên bản bằng Git.
