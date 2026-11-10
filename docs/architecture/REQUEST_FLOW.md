# Luồng xử lý một yêu cầu

> Nguồn: Chương 3 §3.3 (Chương 3 - bản team 10-11 (đã đồng bộ).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 3.3. Luồng xử lý một yêu cầu

Ví dụ khi người học nộp bài Listening hoặc Reading:

- Frontend gửi yêu cầu nộp bài qua HTTPS đến REST API, kèm mã xác thực (token) của người dùng.
- Middleware của backend kiểm tra token và vai trò; yêu cầu không hợp lệ bị từ chối ngay tại đây.
- Controller chuyển yêu cầu cho service của module Làm bài. Service kiểm tra quyền sở hữu, trạng thái lượt làm, thời hạn và dữ liệu câu trả lời; sau đó đối chiếu với đáp án chuẩn tương ứng với phiên bản đề đã sử dụng.
- Kết quả (điểm, số câu đúng/sai, thời gian hoàn thành) được lưu vào cơ sở dữ liệu để phục vụ lịch sử và thống kê.
- Backend trả kết quả dạng JSON, frontend hiển thị điểm và lời giải gần như tức thời.

Đối với Writing/Speaking, hệ thống lưu bài đã hoàn thành và xác định thời hạn nội dung ban đầu là 14 ngày.

Thao tác này không sử dụng lượt hỗ trợ và không tự đưa bài vào hàng đợi chấm.

Khi Người học chủ động gửi yêu cầu hỗ trợ, backend kiểm tra quyền sở hữu, thời hạn nội dung, lượt còn hiệu lực và trạng thái yêu cầu hiện có. Nếu hợp lệ, hệ thống sử dụng một lượt, tạo yêu cầu chờ phân công và giữ nội dung trong suốt quá trình xử lý. Nếu có Giáo viên phù hợp còn khả năng nhận bài, hệ thống tự động phân công; nếu chưa có, yêu cầu tiếp tục chờ trong thời hạn 72 giờ.

Giáo viên chấm các bài được phân công và công bố điểm, nhận xét. Sau khi có kết quả, nội dung được giữ thêm 14 ngày rồi tự động xóa; điểm, nhận xét và lịch sử tối thiểu được giữ lại. Việc hủy yêu cầu và hoàn bonus được thực hiện theo mục 3.4.6.

**Quy tắc chấm điểm và hiển thị kết quả**

Đối với Listening và Reading, hệ thống chấm tự động bằng cách đối chiếu câu trả lời của người học với đáp án chuẩn và các phương án được chấp nhận. Quy tắc đối chiếu được xác định theo từng dạng câu hỏi; câu không trả lời hoặc trả lời không hợp lệ được tính là không đúng.

Kết quả được hiển thị theo phạm vi bài làm:

- **Bài thi đầy đủ theo kỹ năng:** hệ thống tính số câu đúng và quy đổi sang band điểm theo bảng quy đổi được cấu hình cho kỹ năng, loại bài thi và bộ đề tương ứng. Band điểm hiển thị mang tính tham khảo phục vụ luyện tập, không phải kết quả thi IELTS chính thức. Trong phạm vi MVP, bảng quy đổi là dữ liệu khởi tạo cố định theo thang quy đổi IELTS công khai, không có chức năng cấu hình trên giao diện.
- **Bài luyện theo Question Group hoặc phần thi không đầy đủ:** hệ thống hiển thị số câu đúng, tổng số câu và tỷ lệ chính xác; không mặc định quy đổi thành band IELTS do phạm vi bài luyện chưa đủ để đánh giá toàn bộ kỹ năng.

Tỷ lệ chính xác được tính theo công thức:

Tổng số câu của bài luyện bao gồm cả những câu người học chưa trả lời. Việc một bài đủ điều kiện quy đổi band được xác định theo cấu trúc và cấu hình bài thi, không dựa trên việc người học đã trả lời tất cả câu hỏi hay chưa.

Đối với Writing và Speaking, điểm và nhận xét được Giáo viên nhập theo từng tiêu chí IELTS. Điểm tổng hợp được tính theo quy tắc trọng số và làm tròn đã cấu hình.

Bộ tiêu chí, trọng số và quy tắc làm tròn là dữ liệu khởi tạo cố định theo tiêu chí chấm IELTS (Writing: Task Achievement/Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy;

Speaking: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation), không có chức năng cấu hình trong MVP.

Nếu người học chỉ hoàn thành một Task hoặc Part, kết quả được ghi rõ là đánh giá cho phần luyện tập tương ứng, không mặc định xem là band của toàn bộ kỹ năng.

Dữ liệu thống kê được phân tách theo kỹ năng và loại kết quả. Hệ thống không tính trung bình trực tiếp giữa band điểm và tỷ lệ chính xác; các bài luyện theo cụm câu hỏi được thống kê riêng với các bài thi đầy đủ.
