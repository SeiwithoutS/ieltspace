# Công việc triển khai MVP

Các dòng là backlog đề xuất, trạng thái ban đầu **TODO**. Cột “Xong khi” là điều kiện để nghiệm thu từng việc. Kết quả thực chạy ghi theo mã task trong thư mục PROGRESS.

| Mã | Công việc | Phụ thuộc | Xong khi |
|---|---|---|---|
| AUTH-01 | Kiểm thử đăng ký, xác minh và recovery bằng email thật trên môi trường thử | SMTP, template và redirect đã cấu hình | Đăng nhập trước/sau xác minh đúng kết quả, link recovery chỉ dùng một lần, đăng nhập được bằng mật khẩu mới. |
| AUTH-02 | Kiểm thử Google và khôi phục phiên | Provider và callback đã cấu hình | Tài khoản mới có hồ sơ Người học, tài khoản khóa bị từ chối, F5 khôi phục đúng người, URL frontend không chứa token. |
| DB-01 | Đối chiếu schema thực tế và lập baseline | Quyền đọc DB thử | Có danh sách bảng, khóa, sai lệch và kế hoạch migration giữ được dữ liệu hiện hữu. |
| DB-02 | Chốt hai điểm mô hình còn mở | DB-01, DECISIONS | Ghi nguồn xác nhận về khóa chọn thang Reading và nơi lưu tham số. |
| EXAM-01 | Tạo schema bộ đề đến câu hỏi và bản nháp | DB-01 | Hai thao tác đồng thời vẫn chỉ tạo một nháp. Một đề có cả hai form ở phần tương ứng. |
| IMPORT-01 | Kiểm tra XLSX Reading và asset | EXAM-01 | Báo đúng sheet, dòng, trường cho dải số sai hoặc ảnh thiếu. File lỗi giữ nguyên nháp. |
| IMPORT-02 | Ghi lô Reading đã hợp lệ | IMPORT-01 | Ghi một giao dịch. Retry cùng request_key giữ nguyên số câu và đáp án. |
| IMPORT-03 | Ánh xạ ba mẫu còn lại | IMPORT-02 | Listening giữ mốc transcript, Writing giữ form theo Task, Speaking giữ cue card và thời lượng theo Part. Kiểm tra độc lập từng mẫu. |
| EXAM-02 | Phát hành nháp và cung cấp đề cho Người học | EXAM-01 | Người học chỉ mở nội dung được công khai. Payload làm bài không chứa đáp án hoặc evidence. |
| ATT-01 | Lưu và tiếp tục lượt làm | EXAM-02 | F5 khôi phục câu trả lời và hạn máy chủ. Hết giờ chốt phần đã lưu. |
| ATT-02 | Chấm Reading/Listening | ATT-01, DB-02 | Bài luyện tính cả câu bỏ trống vào mẫu số. Đề đủ cấu trúc chọn đúng thang band. |
| WS-01 | Lưu Writing và audio Speaking | ATT-01 | Hoàn thành ghi hạn gốc, chưa có điểm, chưa trừ lượt. Tải bài cần kiểm tra chủ sở hữu. |
| WS-02 | Chặn tải và dọn nội dung quá hạn | WS-01 | Chặn đọc ngay tại mốc hết hạn. Chạy dọn lại vẫn giữ điểm và lịch sử. |
| CREDIT-01 | Cấp lượt tuần và tiếp nhận yêu cầu | WS-01 | Kiểm tra qua ranh giới thứ Hai. Gửi song song chỉ dùng một lượt cho một yêu cầu hoạt động. |
| GRADE-01 | Chọn giáo viên và khóa tải | CREDIT-01 | Hai worker tranh cùng yêu cầu chỉ giao một lần. Giáo viên đạt giới hạn kỹ năng không nhận thêm. |
| GRADE-02 | Hủy quá hạn và hoàn bonus | GRADE-01 | Đúng mốc 72 giờ chỉ hủy yêu cầu còn chờ, job lặp chỉ hoàn một bonus. |
| GRADE-03 | Lưu nháp và công bố phiếu | GRADE-01 | Nháp riêng của người được giao. Công bố và hủy đồng thời chỉ một thao tác thành công. |
| USER-01 | Xử lý thu hồi quyền chấm | GRADE-02, GRADE-03 | Dừng nhận mới vẫn giữ bài đang giao. Quản lý hủy có lý do khi giáo viên không thể hoàn thành. |
| VOC-01 | Lưu từ yêu thích và ghi chú | DB-01 | Hai người ghi chú cùng từ độc lập. Bấm yêu thích lặp không tạo bản sao. |
| VOC-02 | Hoàn tất phiên flashcard | VOC-01 | Tập nhỏ ôn hết vẫn hợp lệ. Ôn lại một thẻ nhiều lần không tăng số thẻ khác nhau. |
| STAT-01 | Tổng hợp lịch sử và streak | ATT-02, VOC-02 | Một attempt chỉ sinh một hoạt động. Band và tỷ lệ bài luyện hiển thị riêng. |
| NOTIF-01 | Lưu và đọc thông báo theo sự kiện | GRADE-02, GRADE-03 | Retry không tạo trùng. Chỉ người nhận đọc/đánh dấu đã xem. |
| SAMPLE-01 | Nối quản trị và thư viện bài mẫu | DB-01 | Quản lý lưu bài nháp, khách chỉ xem được bài công khai. |
| GOAL-01 | Lưu lịch sử mục tiêu và hiển thị tiến độ ngày | STAT-01 | Đổi mục tiêu sinh mốc hiệu lực mới. Mở thông điệp hằng ngày không tăng streak. |

Khi nhận một dòng liên quan nhiều kỹ năng, thực hiện và kiểm tra từng kỹ năng bằng fixture riêng. Với API mới, cập nhật [hợp đồng](API.md) cùng thay đổi phía gọi và phía phục vụ.
