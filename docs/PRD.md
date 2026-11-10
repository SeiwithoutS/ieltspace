# IELTSpace · Phạm vi sản phẩm

IELTSpace là ứng dụng web cho người học IELTS tại Việt Nam. Người học chọn đề, làm bài và theo dõi kết quả từng kỹ năng. Listening và Reading cho phản hồi tự động. Với Writing và Speaking, người học có thể lưu hoặc tải bài ngay, rồi chủ động dùng lượt hỗ trợ để nhận nhận xét của giáo viên.

## Người dùng và phạm vi nghiệm thu

| Người dùng | Công việc thuộc MVP | Kết quả cần quan sát |
|---|---|---|
| Khách | Xem giới thiệu, thư viện công khai và bài mẫu Writing/Speaking. Đăng ký, xác minh email, đăng nhập hoặc khôi phục tài khoản. | Từ nội dung công khai sang thao tác cần lưu bài, hệ thống yêu cầu đăng nhập. |
| Người học | Quản lý hồ sơ, mục tiêu và giao diện. Chọn bài đầy đủ hoặc luyện theo nhóm câu, Task, Part. Tiếp tục lượt làm dở, nộp bài, xem lời giải và lịch sử. | Bài nộp gắn với đúng phiên bản đề. Kết quả ghi rõ phạm vi đánh giá. |
| Người học | Tra cứu từ, lưu yêu thích, ghi chú, ôn flashcard. Theo dõi phiên học, streak và thông điệp hằng ngày. | Mỗi người chỉ thấy ghi chú, mục tiêu và tiến độ của mình. |
| Người học | Lưu, tải bài viết/bản ghi âm, gửi yêu cầu chấm và xem thông báo trong hệ thống. | Xem được trạng thái, hạn nội dung, lượt đã dùng và kết quả sau công bố. |
| Giáo viên | Theo dõi hàng đợi cá nhân, lưu nháp chấm theo tiêu chí, công bố kết quả và xem lịch sử chấm. | Chỉ mở được bài mình được giao theo quyền kỹ năng. |
| Quản lý | Quản lý tài khoản, quyền và tải chấm. Quản lý bộ đề, phiên bản, bài mẫu, từ vựng, nhập XLSX, xem thống kê. | Lỗi nhập chỉ ra vị trí cần sửa. Ẩn bộ đề đã có lượt làm vẫn giữ lịch sử. |

## Ranh giới phát hành

MVP chạy trên web. Giao diện điều hướng bằng tiếng Việt, nội dung đề giữ tiếng Anh. AI chấm Writing/Speaking, ứng dụng native, thương mại hóa, quản trị thang band/rubric qua UI và thông báo nghiệp vụ qua push/email nằm ngoài phạm vi. Email xác thực và khôi phục thuộc luồng tài khoản. Phần ngữ pháp ở Chương 1 chưa có ca sử dụng tương ứng ở Chương 3. Nhãn từ vựng đã được loại trong bản rà soát.

## Hiện trạng để lập kế hoạch

Express đã nối xác thực email, Google, khôi phục, refresh và hồ sơ phiên. Các màn hình đề, làm bài, kết quả, giáo viên và quản trị chủ yếu minh họa luồng bằng dữ liệu mẫu. Nghiệm thu tính năng cần chạy được từ UI qua API đến dữ liệu của đúng người dùng. Xem [các việc tiếp theo](TASKS.md), [quy tắc nghiệm thu nghiệp vụ](BUSINESS_RULES.md) và [căn cứ xác định phạm vi](DECISIONS.md).
