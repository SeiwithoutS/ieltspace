# 04. Quy tắc chấm Writing/Speaking (UC10, UC34, UC15, UC16, UC11, UC18)

Cập nhật 09/11/2026. Nguồn: Chương 3 mục 3.4 và bộ nhớ dự án. Cơ chế này thay mô hình cũ "nộp là tự vào hàng đợi".

## 1. Lưu bài

- Hoàn thành W/S chỉ **lưu bài**, giữ nội dung tạm 14 ngày. Không tự vào hàng đợi chấm.
- Người học tải được bài làm (.docx cho Writing, ghi âm cho Speaking) theo UC33.

## 2. Gửi yêu cầu chấm và lượt

- Người học chủ động gửi yêu cầu hỗ trợ chấm (UC34), tốn **1 lượt**.
- Mỗi tuần **1 lượt miễn phí**, dùng chung W/S, làm mới lúc 00:00 thứ Hai giờ Việt Nam, không cộng dồn.
- **Lượt bonus** có hiệu lực đến hết Chủ nhật tuần kế tiếp. Lượt hết hạn sớm hơn được dùng trước.
- Mỗi bài tối đa 1 yêu cầu đang hoạt động; bài đã có kết quả không gửi lại.

## 3. Phân công

- Yêu cầu chờ phân công tối đa **72 giờ**. Quá hạn thì tự hủy và hoàn 1 lượt bonus.
- Tự phân công cho giáo viên: đang hoạt động, có quyền chấm kỹ năng đó, chưa đạt giới hạn bài chưa chấm (đề xuất mặc định 10, còn mở). Ưu tiên người ít bài nhất, rồi người lâu chưa nhận.
- Giáo viên không từ chối hay nhận thủ công.
- Giáo viên báo không thể hoàn thành: Quản lý xác nhận hủy và hoàn bonus, không phân công lại.
- Thu hồi quyền chấm của giáo viên: ngừng giao bài mới, giáo viên chấm nốt bài đã giao.
- Giáo viên chỉ truy cập bài được phân công, không xem tiến độ người học.

## 4. Chấm và kết quả

- Chấm theo 4 tiêu chí Writing hoặc 4 tiêu chí Speaking; tiêu chí và bảng band là dữ liệu seed.
- Giáo viên được lưu nháp; chỉ sửa kết quả trước khi gửi, đã gửi thì khóa.
- Có kết quả: giữ nội dung bài thêm 14 ngày rồi xóa; giữ điểm, nhận xét, lịch sử.
- Chưa chấm hiển thị "chưa có điểm", không phải 0.

## 5. Trạng thái bài

Đã lưu · chưa gửi chấm → Chờ phân công → Chờ chấm → Đã có kết quả. Nhánh khác: Đã hủy · đã hoàn bonus; Chưa có điểm.

## 6. Tài khoản Người học

- Bị khóa: vẫn giữ yêu cầu chấm.
- Bị xóa: hủy yêu cầu chưa có kết quả, không hoàn bonus.

## 7. Tác vụ tự động cần có ở backend

- Hủy yêu cầu chờ quá 72 giờ và hoàn bonus.
- Cấp lượt miễn phí mỗi thứ Hai.
- Xóa nội dung bài quá 14 ngày.
- Phân công định kỳ.
- Tạo thông báo (UC35) khi yêu cầu bị hủy hoặc có kết quả.
