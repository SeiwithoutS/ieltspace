# Tổng hợp IELTSpace ngày 20/11/2026 – Phần 2

## Phạm vi và trạng thái

Báo cáo tổng hợp bảy tài liệu mới về kế hoạch và sáu đợt Quản lý, khôi phục giao diện Người dùng và kiểm thử sau triển khai local. Các mục Người học ghi kết quả kiểm tra lại trong đợt này.

| Phạm vi | Trạng thái cuối ngày |
|---|---|
| Quản lý | Sáu đợt đã có mã và qua kiểm thử cô lập. Đã đối chiếu danh sách, chi tiết, lịch sử và Dashboard bằng dữ liệu Supabase chính. Còn vấn đề thu hồi quyền giữa nhiều tiến trình và nghiệm thu gửi email tới hộp thư thật. |
| Kiểm thử lại Người học | Đã chạy lại hồ sơ, mật khẩu, mục tiêu, Flashcard, điểm danh và lịch sử kết quả. Kết quả và các lỗi còn mở được ghi trong phần kiểm thử. |
| Dữ liệu | Migration quản trị đã được áp dụng trên các môi trường ở bảng bên dưới. Đợt kiểm thử xác nhận 11 bảng trong phạm vi có mặt và bật RLS trên dev và dự án chính. |
| Triển khai | Kết quả ghi nhận trên ứng dụng local, dịch vụ mô phỏng và các lần đọc dữ liệu thật. Chưa có bằng chứng phát hành bản frontend/backend mới hoặc nghiệm thu toàn tuyến trên bản triển khai. |

## Công việc đã thực hiện

### Quản lý tài khoản và Dashboard

| Đợt | Task | Kết quả |
|---|---|---|
| 1. Danh sách và chi tiết | `RS-A01–A02` | Danh sách tìm theo tên hoặc email, lọc vai trò/trạng thái, có tổng theo bộ lọc, bộ đếm toàn bộ và phân trang. Panel đọc tên, email, ảnh ký, vai trò, trạng thái, ngày tạo, nguồn đăng ký, xác minh và lần đăng nhập gần nhất. Phân biệt thiếu dữ liệu với Auth/ảnh tạm lỗi. Hai API đọc chỉ dành cho Quản lý đang hoạt động. |
| 2. Hoạt động và nhật ký | `RS-A07` | Ghi một dòng cho mỗi phiên đăng nhập Email/Google được chấp nhận, dùng mã băm phiên để tránh trùng. F5, refresh, điểm danh và xác thực lại giữ nguyên số sự kiện. Giữ toàn bộ lịch sử đã ghi. Panel xem riêng lịch sử đăng nhập và thao tác theo tài khoản. Tab **Hoạt động** có một bảng chung và lọc theo vai trò hiện tại. |
| 3. Vai trò, khóa/mở, bảo vệ Quản lý | `RS-A03–A04`, `RS-A09`, D18 | Áp dụng cho Người học, Giáo viên và Quản lý. Server kiểm tra quyền/trạng thái, ghi lý do và audit cùng giao dịch. Chặn tự khóa, tự hạ quyền và thao tác làm mất Quản lý hoạt động cuối cùng. Cấp/thu hồi vai trò Quản lý hoặc khóa/mở một Quản lý cần mã bảo mật. Mở khóa giữ vai trò hiện tại. |
| 4. Mời nhân sự | `RS-A06`, D19 | Form **Tạo tài khoản** mời Giáo viên hoặc Quản lý, có trạng thái **Chờ kích hoạt**, lỗi email trùng và lỗi gửi. Liên kết dùng một lần trong 24 giờ. Khi đặt mật khẩu, Auth kích hoạt đúng hồ sơ, vai trò và quyền chấm Giáo viên đã chọn. Mời Quản lý cần mã của người mời. Gửi lại cùng nội dung phát hành liên kết mới, có giới hạn một phút. |
| 5. Xóa và dọn lại | `RS-A05`, D19 | Chặn truy cập, ẩn danh hồ sơ và bỏ danh tính Auth, ảnh, dữ liệu học cá nhân, ghi chú, nội dung bài nộp và tệp thuộc phạm vi. Hủy yêu cầu chấm chưa có kết quả của chủ tài khoản theo BR-AUTH-002. Giữ ID ẩn danh, điểm/kết quả và audit. Chặn tự xóa, bảo vệ Quản lý cuối cùng và chặn xóa Giáo viên còn bài đang giao. Xóa Quản lý cần mã. Nếu Auth hoặc Storage lỗi, panel có **Thử dọn lại**. |
| 6. Tổng quan | `RS-A08` | Thống kê 7 ngày, 30 ngày và khoảng tùy chọn theo giờ Việt Nam. Đếm hồ sơ mới, số tài khoản có đăng nhập, lượt khóa từ audit và phiên Flashcard hợp lệ cùng số người ôn. Mỗi tài khoản đăng nhập được đếm một lần trong kỳ. Tách lượt khóa trong kỳ và số đang khóa. Biểu đồ lấy tối đa 7 ngày cuối, gồm ngày có 0 phiên. Dùng `0` khi nguồn có sẵn và không có bản ghi, `—` khi nguồn phiếu hỗ trợ chưa có. |

- **Giao diện Người dùng.** Khôi phục tiêu đề, bảng, nút và form Tạo tài khoản, bố cục panel bên phải và các vùng thông tin theo vai trò từ repo. Thay bộ lọc cũ bằng bộ lọc mới. Danh sách người dùng và Hoạt động thành hai tab trên cùng trang, bộ lọc danh sách được giữ khi chuyển tab. Bản khôi phục đầu còn hai bảng hoạt động. Đợt 2 đã gộp thành một bảng có bộ lọc **Vai trò** theo yêu cầu cuối. Nút **Đổi vai trò** trong panel và hộp xác nhận dùng theo phương án đã duyệt.
- **Mã bảo mật.** Website tạo mã 6 số và gửi đến email Auth đã xác minh của Quản lý thao tác. Mã dùng một lần trong 10 phút, tối đa 5 lần nhập sai, gắn với người thao tác và thao tác đã chọn. Lịch sử giữ dữ liệu nghiệp vụ, không ghi mật khẩu hay token. Trang Hồ sơ nhân sự là màn riêng và còn thông tin mẫu.
- **Phiên và quyền.** Đăng nhập, Google callback và refresh tra trạng thái mới. Các thao tác quản trị nhạy cảm kiểm tra quyền tại thời điểm ghi. Sau giao dịch, backend bỏ cache tài khoản đích trong tiến trình hiện tại. Giao diện kiểm tra lại phiên khi quay lại tab, định kỳ khi tab hiển thị và khi gặp lỗi quyền phù hợp. Giới hạn trên nhiều tiến trình ghi ở phần còn mở.
- **Phạm vi chấm.** Các số liệu học tập và quyền chấm trong panel vẫn dùng dấu gạch ngang cho phần chưa nối. Việc triển khai làm bài, sinh điểm, thu hồi quyền chấm, phân công, tải Giáo viên và bonus có tiêu chí riêng. [API](../API.md) · [Quy tắc nghiệp vụ](../BUSINESS_RULES.md) · [Quyết định D11, D18, D19](../DECISIONS.md)

### Supabase và cấu hình gửi thư

Dev `llqylqplgjmvgthynepj` dùng để thử trước. Dự án chính `vnssjipyagfqunskgvke` dùng sau khi xác minh trên dev.

| SQL | Mục đích | Trạng thái ghi nhận |
|---|---|---|
| [17](../csdl/17_nhat_ky_dang_nhap.sql), [18](../csdl/18_ma_bao_mat_quan_tri.sql) | Nhật ký đăng nhập và mã bảo mật | Đã áp dụng trên dev rồi dự án chính. Các bảng đã bật RLS và chặn truy cập trực tiếp của khách/người dùng. |
| [19a](../csdl/19a_staff_invitation_auth_compat.sql), [19](../csdl/19_staff_invitations.sql), [20](../csdl/20_account_deletion.sql) | Tương thích trigger Auth, lời mời và hàng đợi dọn dữ liệu | Dev chạy 19 và 20. Dự án chính chạy 19a trước 19 và 20 để giữ hành vi Auth riêng của dự án. |

Đợt danh sách và Dashboard dùng bảng hiện có. Không có SQL bổ sung để cài Resend. Xem thứ tự và trường hợp cần áp dụng trên một môi trường mới ở [mục lục SQL](../csdl/README.md).

- **Kho tệp khi xóa tài khoản.** Tác vụ dọn đọc kho gốc của avatar và đường dẫn bản ghi âm. Với bản ghi âm trên R2, backend cần `R2_RECORDINGS_BUCKET` và thông tin kết nối của môi trường tương ứng. Panel cho thử dọn lại khi bước ngoài DB thất bại.
- **Resend.** Backend local đã có khóa gửi và secret mã bảo mật, dùng địa chỉ gửi thuộc `resend.dev` và `FRONTEND_ORIGIN` localhost. Resend tiếp nhận email thử đến địa chỉ mô phỏng. Để gửi thật, xác minh tên miền, điền `RESEND_API_KEY`, `ADMIN_SECURITY_EMAIL_FROM` và `ADMIN_SECURITY_CODE_SECRET` trên backend của đúng môi trường. Đặt `FRONTEND_ORIGIN` thành URL người nhận mở được. Mã bảo mật và lời mời hiện gửi dạng văn bản. Mẫu HTML cần nối ID template ở backend sau khi công bố trong Resend. Email xác minh đăng ký/khôi phục của Người học đi qua Supabase Auth và có thể cấu hình SMTP riêng. [Hướng dẫn Resend](../HUONG_DAN_RESEND.md) · [Mẫu mã bảo mật](../email-templates/ma-bao-mat.html) · [Mẫu mời nhân sự](../email-templates/loi-moi-nhan-su.html)

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả |
|---|---|---|
| Build và bộ kiểm thử tập trung | Local | Build frontend/backend đạt. Frontend 17/17, backend tập trung 17/17. Backend tập trung dùng PostgreSQL cô lập và mô phỏng dịch vụ ngoài. |
| Hồ sơ, mục tiêu và phiên học | Edge, hai phiên trình duyệt, PostgreSQL cô lập, Auth/R2 mô phỏng | Qua các ca quyền sở hữu, tệp sai loại/quá giới hạn, đổi mật khẩu sai/đúng, đăng nhập lại, phiên khác F5 phải đăng nhập, mục tiêu giữ lịch sử, Flashcard hết giờ/dừng và mất phản hồi sau khi lưu. Thử lại cùng UUID không nhân đôi bản ghi. |
| Điểm danh, tiến độ và lịch sử kết quả | PostgreSQL cô lập, Edge | Kiểm chứng ranh giới 00:00 Việt Nam và tách điểm danh khỏi bộ đếm phiên. Thử tài khoản chưa có dữ liệu, lọc lịch sử và phân biệt band với độ chính xác. Khối Bài Writing và Speaking vẫn dùng dữ liệu minh họa. |
| Quản trị tài khoản và email mời | Edge, PostgreSQL cô lập, Auth/Resend mô phỏng | Kiểm thử một sự kiện mỗi phiên, rollback khi lỗi audit, từ chối sai quyền, mã sai/đã dùng/khác thao tác, hai Quản lý đồng thời hạ quyền nhau, khóa Người học và Giáo viên, mời và đặt mật khẩu đúng vai trò, xóa và chạy lại tác vụ dọn. |
| Danh sách, chi tiết, hoạt động và Dashboard | API local đọc Supabase chính | Tìm/lọc, trang vượt giới hạn, 401/403/404, 4 hồ sơ, nguồn Email/Google và một ảnh ký. Khoảng 22/10–20/11/2026 đối chiếu **4 tài khoản mới, 1 tài khoản có đăng nhập, 0 lượt khóa, 2 phiên Flashcard hợp lệ**. Các ca đối chiếu này chỉ đọc. |
| Giao diện và mẫu email | Edge | Thử 375, 768 và 1366 px, thêm khung ngang 844 × 390 cho Quản lý. Đã thử sáng/tối, điều hướng bằng bàn phím, trả tiêu điểm, tải/rỗng/lỗi/thử lại. Mẫu email thử ở 320 và 768 px, giữ số 0 đầu mã và toàn bộ liên kết mời. Chưa thử mẫu trong hộp thư thật. |
| Bộ tổng backend, gồm Bộ đề ngoài phạm vi | Local và cấu hình DB mặc định | 50 đạt, 1 lỗi, 2 bỏ qua. Test công bố Reading trả `SKILL_NOT_READY` vì dữ liệu thử có 1 câu và thiếu nội dung passage, trong khi quy tắc đòi đủ 40 câu và 3 passage. Bỏ qua JWT với tài khoản thật và lưu nháp từ vựng trên dev vì thiếu cấu hình kiểm thử. |

### Dữ liệu Bộ đề do lần chạy test tạo

Bộ tổng đã dùng kết nối mặc định trỏ đến Supabase chính. Bốn bộ đề tạm được tạo và tự dọn theo ID trong các test. Ca `Set Full Flow` đi vào khối `finally` khi bị từ chối công bố, sau đó dọn bộ đề cùng đề, kỹ năng, phần thi, nhóm câu hỏi, câu hỏi và đáp án do ca đó tạo.

| Bộ đề do test tạo | Đoạn tự dọn trong mã |
|---|---|
| `Test Set Automated <timestamp>`, `Set Full Flow <timestamp>` | Lời gọi `deleteExamSet` và khối `finally` trong `backend/tests/exams-services.test.mjs`, dòng 81 và 252. |
| `Editor Test Set <timestamp>` | Khối `finally` trong `backend/tests/exam-editor-services.test.mjs`, dòng 237. |
| `History Test Set <timestamp>` | Phần cleanup trong `backend/tests/exam-history.test.mjs`, dòng 165. Ca này xóa cả audit theo ID của chính dữ liệu thử. |

Truy vấn chỉ đọc sau khi chạy xác nhận bốn bộ đề thử không còn trong `exam_sets`, không có danh mục thử mới hoặc thang điểm `Test scale`. Một số dòng audit thử vẫn còn. Không xóa file hay chạy SQL xóa thủ công. Các lần kiểm thử tập trung sau đó dùng kết nối cô lập.

## Phần còn mở

| Mục | Kết quả rà soát và điều kiện nghiệm thu |
|---|---|
| Thu hồi quyền giữa nhiều tiến trình | Đã tái hiện hai tiến trình cùng đọc hồ sơ đang hoạt động. Sau khi khóa và xóa cache ở tiến trình A, tiến trình B còn dùng trạng thái cũ trên đường đọc có cache tối đa 60 giây theo D11. Đường đọc mới từ chối. Cần xác nhận yêu cầu thu hồi tức thời và kiểm tra lại trên môi trường chạy nhiều tiến trình. |
| `RS-C04`, `AUTH-01/02` | `/#CheckEmail` có thể hiện email mẫu. Sau đếm ngược, bấm gửi lại thấy báo thành công nhưng trình duyệt không gọi API. Cần nối đúng email và gửi lại có giới hạn. Cần chạy đăng ký/xác minh, recovery, Google, HTTPS, redirect và cookie trên dev. |
| Hồ sơ nhân sự, phần còn lại của `RS-L01–L03` | Hồ sơ Quản lý và Giáo viên còn giá trị mẫu. Đã mở màn Quản lý bằng tài khoản thử có email khác và tái hiện. API sửa hồ sơ và đổi mật khẩu trong hồ sơ hiện giới hạn Người học. Mọi sửa giao diện cần được duyệt trước. |
| `RS-L09–L10` | Band tổng thực tế chờ nguồn tổng hợp kết quả. Thông điệp hằng ngày còn một câu cố định, chưa chọn theo ngày Việt Nam. |
| `RS-C01–C02` | Thông báo còn nguồn mẫu và trạng thái đã đọc cục bộ. Phiếu hỗ trợ còn lưu trên trình duyệt, nên Quản lý ở thiết bị khác chưa có nguồn chung. Tách nghiệm thu chỉ số hỗ trợ sau khi có kho phiếu. |
| `RS-C03`, `RS-C06` | Hoàn thiện lưu ảnh tải trực tiếp của từ vựng và dọn media bài mẫu không còn tham chiếu. Kiểm tra nháp/công bố trên kho thật. |
| `RS-C05`, nghiệm thu triển khai | Có kiểm thử cô lập về quyền, chạy lại, đồng thời, phân trang và ranh giới ngày. Còn cần kiểm tra tải/xóa tệp R2 thật, gửi mã/lời mời tới hộp thư thật và nhận lời để đăng nhập đúng vai trò. Bản frontend và backend cần cùng phiên bản khi nghiệm thu. |

## Bước tiếp theo

1. Chốt cách thu hồi quyền giữa các tiến trình, sau đó kiểm tra lại khóa/xóa và đổi vai trò khi tài khoản đang mở trên hai phiên.
2. Chốt phạm vi sửa **Gửi lại email xác minh** và **Hồ sơ nhân sự** trước khi đụng giao diện. Khắc phục thông điệp hằng ngày theo task còn mở.
3. Cấu hình tên miền gửi Resend cho backend dev. Nghiệm thu mã đến email Quản lý, mời Giáo viên/Quản lý, đặt mật khẩu, đăng nhập đúng vai trò và các ca link cũ, hết hạn hoặc gửi lỗi trước khi áp dụng cho bản chính.
4. Nghiệm thu các luồng Auth/R2 và Dashboard trên bản triển khai. Chỉ thêm số liệu phiếu hỗ trợ khi có dữ liệu dùng chung để đối chiếu.

## Tài liệu và cách tái hiện

- Người học. Mở `#Profile`, `#Flashcard` → **Lịch sử ôn**, `#StudentLanding` hoặc `#StudentHome`. So sánh hai phiên trình duyệt, thử F5 và đối chiếu tiến độ trước/sau **Điểm danh**. [Test hồ sơ](../../backend/tests/learner-profile.test.mjs) · [Test học tập](../../backend/tests/learner-study.integration.mjs)
- Quản lý. Mở **Người dùng**, thử tìm/lọc và chuyển hai tab. Chọn một hàng để xem chi tiết và lịch sử. Với tài khoản thử trên dev, kiểm tra mời, khóa/mở, đổi vai trò và xóa. Mở **Tổng quan hệ thống** để đối chiếu 7 ngày, 30 ngày hoặc một ngày cụ thể. [Test quản trị](../../backend/tests/admin-users.integration.mjs) · [Hướng dẫn Resend](../HUONG_DAN_RESEND.md)
- [Danh sách công việc](../TASKS.md) · [Hợp đồng API](../API.md) · [Cơ sở dữ liệu](../DATABASE.md) · [Quy chuẩn giao diện](../DESIGN.md) · [Quy tắc kiểm thử](../RULES.md)
