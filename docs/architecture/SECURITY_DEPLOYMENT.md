# Bảo mật và triển khai

> Nguồn: Chương 3 §3.5 (Chương 3 - bản team 10-11 (đã đồng bộ).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 3.5. Bảo mật và triển khai

Backend thực hiện xác thực và phân quyền theo vai trò đối với từng nhóm API. Với dữ liệu cá nhân và bài nộp, hệ thống đồng thời kiểm tra quyền sở hữu hoặc quan hệ phân công ở lớp nghiệp vụ. Người học chỉ được truy cập bài làm và thông tin cá nhân của mình. Giáo viên chỉ được truy cập, chấm các bài được phân công và xem lịch sử chấm trong phạm vi được phép. Quyền chấm một bài không đồng nghĩa với quyền theo dõi toàn bộ tiến độ của Người học. Mật khẩu không được lưu dưới dạng văn bản thuần mà được dịch vụ xác thực quản lý bằng cơ chế băm an toàn.

Về triển khai, frontend được đóng gói thành tệp tĩnh và phục vụ qua HTTPS; backend chạy như một dịch vụ độc lập, kết nối với cơ sở dữ liệu, dịch vụ xác thực và kho lưu trữ tệp. Việc tách biệt các thành phần cho phép triển khai và nâng cấp tương đối độc lập, với điều kiện duy trì tính tương thích của API và cấu trúc dữ liệu liên quan.
