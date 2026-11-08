---
paths:
  - "backend/src/modules/**"
  - "frontend/src/pages/**"
  - "frontend/src/lib/**"
---

# Nghiệp vụ cốt lõi

- **Cấu trúc đề**: Bộ đề → Đề thi → Kỹ năng → Phần → Question Group → Question → Đáp án/Rubric. Trạng thái nội dung: Bản nháp, Công khai, Đã ẩn. Bộ đề chưa có lượt làm thì xóa được, có rồi thì chỉ ẩn.
- **Listening/Reading**: chấm tự động. Tỷ lệ chính xác = đúng / tổng câu, câu bỏ trống tính sai. **Band chỉ tính cho đề đầy đủ**. Đề đầy đủ Listening nghe một lần, chế độ luyện được nghe lại. Hết giờ thì tự hoàn thành với phần đã lưu.

## Writing/Speaking (UC10, UC34, UC16, UC11)

- Hoàn thành bài chỉ **lưu** (giữ 14 ngày), không tự vào hàng đợi.
- Người học tự gửi yêu cầu chấm, tốn 1 lượt: 1 lượt miễn phí/tuần (làm mới 00:00 thứ Hai giờ VN, không cộng dồn, dùng chung W/S) hoặc lượt bonus (hết hạn cuối Chủ nhật tuần kế). Lượt hết hạn sớm dùng trước.
- Chờ phân công tối đa **72 giờ**, quá hạn tự hủy và hoàn 1 bonus. Giáo viên không thể hoàn thành thì Quản lý xác nhận hủy và hoàn bonus, không phân công lại.
- Tự phân công: giáo viên đang hoạt động, có quyền kỹ năng đó, chưa đạt giới hạn bài; ưu tiên ít bài nhất, rồi lâu chưa nhận.
- Mỗi bài tối đa 1 yêu cầu đang hoạt động; đã có kết quả thì không gửi lại. Giáo viên lưu nháp được, đã gửi kết quả thì khóa.
- Có kết quả: giữ nội dung bài 14 ngày rồi xóa, giữ điểm và nhận xét.
- Trạng thái: Đã lưu · chưa gửi chấm; Chờ phân công; Chờ chấm; Đã có kết quả; Đã hủy · đã hoàn bonus; Chưa có điểm.
- Cần job định kỳ: hủy yêu cầu quá 72 giờ, làm mới lượt thứ Hai, xóa nội dung quá 14 ngày.

## Tài khoản

Chỉ Quản lý tạo, khóa, xóa (xóa khi chưa có dữ liệu, có dữ liệu thì khóa). Người học bị khóa vẫn giữ yêu cầu chấm; bị xóa thì hủy, không hoàn bonus. Quản lý đặt quyền chấm theo kỹ năng cho Giáo viên. Tài khoản Google là Người học.

## Từ vựng, flashcard

Khách xem được; lưu yêu thích, ghi chú, nhãn cần đăng nhập. Một phiên học hợp lệ = xong một lượt làm bài, một lượt luyện, hoặc một phiên flashcard (hết tập hoặc ≥ 10 thẻ khác nhau).

## Thông báo (UC35)

Chỉ trong hệ thống, có chấm đỏ số chưa đọc, không gửi email/push.

## Nhập liệu xlsx (UC23, UC24)

Chỉ xlsx, nằm trong editor từng kỹ năng. Kiểm tra toàn file, báo lỗi theo sheet/dòng/cột, **có lỗi thì không lưu gì**. Audio và ảnh tải riêng lên Storage, ô xlsx chỉ ghi tên tệp. Mẫu và quy ước sheet ở `import-templates/` của project.
