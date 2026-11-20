# Tổng hợp IELTSpace ngày 20/11/2026 – Phần 3

## Phạm vi và trạng thái

Gộp đủ chín báo cáo mới ngày 20/11 về Thông báo và Hỗ trợ đợt 1–5, ảnh từ vựng R2, CSDL và bài mẫu, hồ sơ ba vai trò, rà soát web, xác minh email và trang chủ. Giữ các báo cáo [Phần 2](2026-11-20-tong-hop-phan-2.md), [Tổng kết](2026-11-20-tong-ket.md) và [Rà soát task người dùng và admin](2026-11-20-ra-soat-task-nguoi-dung-admin.md) tại các tệp hiện có. Phạm vi rà soát theo yêu cầu trước đó loại trừ bộ đề, biên tập đề và nghiệp vụ làm đề do người khác phụ trách.

Đợt rà soát lại build mã hiện tại, chạy bộ kiểm thử trên dữ liệu cô lập, thử trên Edge và chỉ đọc cấu trúc hai dự án Supabase. Các mục chi tiết bên dưới lưu kết quả theo từng thời điểm. Những nhận xét ở bản kế hoạch và bản rà soát ban đầu phản ánh tình trạng khi viết.

## Công việc đã thực hiện

- Đối chiếu chín báo cáo với tuyến API, màn hình và SQL áp dụng. Gộp nguyên nội dung theo thứ tự từ kế hoạch đến rà soát và sửa tiếp theo. Phần cập nhật chuyển năm màn chấm sang TSX được đối chiếu trong [Tổng kết hiện có](2026-11-20-tong-ket.md#chuyển-năm-màn-hỗ-trợ-chấm-writing-và-speaking-sang-tsx).
- Đối chiếu chuông hệ thống của Quản lý và trang quản lý ba tab. Chạy lại việc nhận/đọc thông báo, mở đúng phiếu hỗ trợ, lưu mẫu, gửi ngay và hẹn theo giờ Việt Nam.
- Đối chiếu luồng email xác minh, hồ sơ ba vai trò, ảnh từ vựng theo thứ tự Wikipedia → Unsplash → Pixabay, nháp/công bố và bảo trì media bài mẫu.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build frontend/backend và typecheck backend | Local | Đạt. |
| Backend đợt này | PostgreSQL qua PGlite, Auth/Storage/R2 mô phỏng | 24/24 ca đã chọn đạt. Gồm quản trị tài khoản, hỗ trợ, chống gửi lặp và chọn người nhận khi phát, mẫu và phân quyền thông báo, xác minh, hồ sơ, hoạt động học, bài mẫu và ảnh từ vựng. |
| Hồ sơ cấu hình R2 | Auth và R2 mô phỏng | 3/3 ca bổ sung đạt cho Người học, Giáo viên và Quản lý. |
| Test frontend | Local | 17/17 ca đạt. |
| Xác minh và trang chủ | Edge, API mô phỏng | Thử truy cập thiếu email, địa chỉ đúng, gửi lỗi và gửi lại, F5 giữ thời gian chờ. Đã thử Liên hệ → đăng nhập → Hồ sơ, câu động lực đổi sau 5 phút và bài mẫu mở đúng ID. |
| Hồ sơ và năm màn chấm TSX | Edge, phiên mô phỏng | Hồ sơ Giáo viên và Quản lý đọc đúng email từ phiên. Hồ sơ Người học đổi tên, ảnh và mật khẩu, mở lại ở hai phiên thử. Đối chiếu 40 trường hợp bố cục năm màn chấm ở bốn kích thước và hai theme. Kiểm tra riêng menu quản lý ở màn hẹp, Escape, điều hướng Giáo viên, F5 và bốn ca sai vai trò. |
| Thông báo và hỗ trợ | Edge, API mô phỏng | Chuông Quản lý mở hộp hệ thống, sidebar mở đúng ba tab. Gửi ngay, hẹn giờ, lưu mẫu và mở phiếu từ thông báo đạt. Phát hiện hai trường hợp cần xử lý bên dưới. |
| Quản lý bài mẫu và media | Edge, Express, PostgreSQL cô lập, Storage mô phỏng | Đạt lưu nháp, F5, công bố, sửa, ẩn/hiện, công bố lại, XLSX phát lại giữ nguyên số bản ghi, tải ảnh bìa/ảnh đề và phát audio Speaking. Dữ liệu được tạo trong CSDL kiểm thử. |
| Kiểm tra SQL 21–23, RLS và bucket bài mẫu | Supabase chính và dev, chỉ đọc | Cả hai có bảng thông báo, cài đặt, hỗ trợ và ảnh từ vựng. Các bảng được rà có RLS và không cấp SELECT trực tiếp cho `anon`/`authenticated`. Chính có đủ 17 bảng được chọn, bucket `sample-assets` riêng tư và 0 đối tượng. Dev thiếu `sample_answer_drafts`, `sample_import_receipts`, `sample_media_assets` và bucket `sample-assets`. |

## Phần còn mở

| Mức | Phát hiện | Bằng chứng và ảnh hưởng |
|---|---|---|
| Cao | Hộp thư Người học, Giáo viên còn khung chi tiết mẫu | Edge với API trả danh sách rỗng vẫn hiển thị thẻ nói yêu cầu Speaking bị hủy hoặc Giáo viên được giao bài mới. Có thể khiến người dùng hiểu đây là sự kiện trên tài khoản. [Màn thông báo](../../frontend/src/pages/notifications/Notifications.tsx) |
| Vừa | Sửa nội dung bản nháp sau khi mất phản hồi lưu có thể mắc lỗi 409 | Mô phỏng server đã nhận và lưu, phản hồi bị mất. Sửa tiêu đề rồi lưu lại làm frontend gửi lại cùng `requestId` với nội dung khác. Điều kiện chống trùng phía backend trả 409 theo thiết kế. Có thể mở đúng bản nháp đã lưu từ tab Danh sách để sửa tiếp. [Form tạo thông báo](../../frontend/src/components/notifications/AdminNotifications.tsx) · [API lưu bản nháp](../../backend/src/modules/notifications/announcement-admin.routes.ts) |
| Còn công việc tích hợp | Chấm Writing/Speaking và nguồn sự kiện | `recordGradingTransition` đã có service và test với dữ liệu chấm thử. Trong mã hiện tại chỉ thấy khai báo, chưa có nơi gọi từ nghiệp vụ thật. Màn Giáo viên và Quản lý chấm vẫn dùng dữ liệu minh họa. Lịch sử WS đã đọc được bài hoàn thành và điểm công bố, xem chi tiết ngày 21/11. [Service thông báo chấm](../../backend/src/modules/notifications/grading-notifications.ts) · [Tổng hợp 21/11](2026-11-21-tong-hop.md) |
| Cấu hình | Ảnh từ vựng và Storage thật | Tệp cấu hình backend local vẫn thiếu `R2_VOCABULARY_BUCKET`. Các ca R2 lần này dùng mô phỏng. Thiếu schema và bucket bài mẫu trên dev tiếp tục chặn nghiệm thu tải/phát với Storage thật. [Kiến trúc từ vựng](../KIEN_TRUC_TU_VUNG.md) · [SQL bài mẫu](../csdl/README.md) |
| Chưa nghiệm thu trên dịch vụ thật | Email, lịch chạy và bảo trì | Lượt này chưa gửi thư thật hoặc chạy tác vụ ghi/dọn trên môi trường dùng chung. Tại ngày 20/11, mã bảo mật và thư mời được thử dưới dạng văn bản. Ngày 21/11, hai luồng này chuyển sang Google Authenticator và tạo tài khoản trực tiếp. Việc kiểm tra email xác minh/khôi phục của Supabase Auth, lịch gửi khi máy chủ ngủ và chính sách ẩn danh phiếu hỗ trợ còn mở. [Tổng hợp 21/11](2026-11-21-tong-hop.md#go-bo-resend) |

## Bước tiếp theo

1. Xử lý khung thông báo mẫu và trạng thái phục hồi khi lưu nháp bị mất phản hồi. Chạy lại bằng tài khoản thử.
2. Chuẩn bị schema và bucket bài mẫu ở dev, kiểm tra cấu hình bucket từ vựng theo môi trường, rồi nghiệm thu ghi và đọc với đối tượng thử trên dev.
3. Khi luồng chấm thật sẵn sàng, nối sự kiện vào giao dịch nghiệp vụ và kiểm tra end-to-end. Kiểm tra email thực nhận và lịch chạy khi máy chủ ngủ trong đợt thử riêng.

## Tài liệu và cách tái hiện

Quản lý mở chuông `#Notifications` và mục sidebar `#AdminNotifications`. Người học mở `#Profile?support=1`, `#Notifications` và `#CheckEmail` từ luồng đăng nhập. Xem [API](../API.md), [quy tắc nghiệp vụ](../BUSINESS_RULES.md) và [cấu hình SQL](../csdl/README.md).

Chín bản nguồn được lưu lại trong `_local/archive-progress-2026-11-20-21-merged`.

## Báo cáo chi tiết theo đợt

Các phần dưới đây giữ nội dung các báo cáo nguồn, gồm kiểm thử, bước triển khai và phần còn mở ghi theo từng thời điểm.

- [Kế hoạch Thông báo, Hỗ trợ và ảnh từ vựng](#ke-hoach-thong-bao-ho-tro-anh-tu-vung)
- [Đợt 1–2 · Thông báo và Hỗ trợ](#thong-bao-va-ho-tro-dot-1-2)
- [Đợt 3 · Ảnh từ vựng qua R2](#anh-tu-vung-r2-dot-3)
- [Đợt 4–5 · Thông báo chung và nghiệp vụ chấm](#thong-bao-dot-4-5-kiem-thu-1-5)
- [Kiểm thử đợt 1–5, CSDL và bài mẫu](#kiem-thu-dot-1-5-csdl-bai-mau)
- [Tách hộp thư và quản lý thông báo](#tach-luong-thong-bao-quan-ly)
- [Hồ sơ cá nhân ba vai trò](#ho-so-ca-nhan-ba-vai-tro)
- [Rà soát web ngoài bộ đề và đề thi](#ra-soat-web-ngoai-de-thi)
- [Xác minh email, bảo trì media và trang chủ](#xac-minh-email-media-bai-mau-trang-chu)

<a id="ke-hoach-thong-bao-ho-tro-anh-tu-vung"></a>

### Kế hoạch Thông báo, Hỗ trợ và ảnh từ vựng ngày 20/11/2026

#### Phạm vi và trạng thái

Kế hoạch triển khai `NOTIF-01` / `RS-C01`, Hỗ trợ/Báo lỗi (`RS-C02`) và ảnh từ vựng (`RS-C03`). Theo phạm vi đợt 3 đã chốt, Cloudflare R2 lưu ảnh từ và ảnh bìa tải từ máy cùng ảnh Pixabay được chọn. Trạng thái tại lúc lập kế hoạch là đã rà soát mã và schema chỉ đọc.

#### Công việc đã thực hiện

##### Đối chiếu với dự án hiện tại

- **Thông báo.** `NotificationInbox` và `NotificationBadge` dùng JSON mẫu. Dấu đã đọc lấy từ localStorage. Supabase dev và chính đều có `public.notifications` với `recipient_id`, `event_key`, `type`, `title`, `content`, tham chiếu đích, `created_at` và `read_at`. Hai dự án đều bật RLS, có khóa duy nhất `(recipient_id, event_key)`, chỉ mục danh sách và chưa cấp quyền bảng trực tiếp cho khách/người dùng. Dùng tiếp ID hồ sơ `public.users.id` từ `req.appUser` trong Express. [Hook hiện tại](../../frontend/src/lib/notifications/notifications.ts) · [Quy tắc thông báo](../BUSINESS_RULES.md)
- **Hỗ trợ.** Hồ sơ Người học, Hồ sơ Giáo viên và trang Báo cáo & phản hồi của Quản lý dùng cùng component lưu dữ liệu trong trình duyệt. Dashboard trả `supportReports: null`. Hai dự án chưa có bảng phiếu hỗ trợ riêng. `support_credits` là lượt chấm. [Màn hỗ trợ](../../frontend/src/components/reports/Support.tsx) · [API Dashboard](../../backend/src/modules/statistics/admin-statistics.routes.ts)
- **Ảnh từ vựng.** Mã hiện tại đã có API nháp, kiểm tra revision, công bố và thư viện công khai. Ảnh tải máy và bản sao Pixabay tạm dùng data URL nên chưa lưu nháp được. Ảnh bìa raster cũng cần nối upload. Phần công bố dùng `publishedSet` riêng cho ảnh bìa và ghi từ vào bảng thư viện. Adapter R2 đã dùng cho ảnh đại diện và bản ghi âm. [Route từ vựng](../../backend/src/modules/vocabulary/vocabulary.routes.ts) · [Adapter R2](../../backend/src/integrations/storage/r2-storage.ts)

##### Thứ tự triển khai

| Đợt | Phạm vi | Nghiệm thu |
|---|---|---|
| 1. Hộp thông báo thật | Dùng bảng có sẵn. Tạo service ghi sự kiện, API danh sách/phân trang, số chưa đọc, đánh dấu một hoặc tất cả đã đọc. Nối giao diện và chuông hiện tại. | Hai phiên của cùng tài khoản thấy cùng dữ liệu sau khi tải lại/lấy dữ liệu mới. Tài khoản khác không đọc/đổi được. Đếm toàn bộ thông báo chưa đọc, kể cả khi danh sách có nhiều trang. Cùng sự kiện ghi một lần. |
| 2. Phiếu hỗ trợ và thông báo phản hồi | Thêm bảng/API phiếu và lịch sử. Nối màn đang có cho Người học, Giáo viên và Quản lý. Sau khi nối nguồn, Dashboard đếm phiếu mới theo ngày Việt Nam. | Người gửi tạo phiếu ở thiết bị A và thấy phản hồi ở B. Quản lý tiếp nhận, phản hồi và đổi trạng thái. Chủ phiếu có thông báo thật khi được phản hồi hoặc đổi trạng thái. Dashboard đối chiếu được với DB. |
| 3. Ảnh từ vựng trên R2 | Lưu ảnh từ máy, ảnh bìa và ảnh Pixabay được chọn vào R2. Giữ URL Wikipedia/Unsplash. Thực hiện độc lập với đợt 1–2. | Lưu nháp, mở lại, công bố và đọc thư viện/Flashcard vẫn có ảnh. Nháp riêng chỉ Quản lý xem được. Thử lỗi tải, xung đột lưu, thay ảnh, ẩn bộ và dọn ảnh bỏ. |
| 4. Thông báo chung của Quản lý | Theo tài liệu tham khảo, thêm bản nháp, chọn nhóm, gửi ngay, hẹn giờ và xem lịch sử/số người nhận. Trình phương án menu và tab trước khi chạm giao diện. | Nhóm nhận lấy tại thời điểm gửi. Gửi ngay, hẹn giờ, retry hoặc hai worker không phát trùng. Hiển thị giờ Việt Nam. Đợt có 0 người nhận vẫn hoàn tất với số 0. |
| 5. Thông báo chấm bài và cài đặt | Nối các sự kiện nghiệp vụ khi các luồng chấm và hạn nội dung đã có service tương ứng. Sau đó mở cấu hình mẫu và nhắc hết hạn theo phạm vi được duyệt. | Chủ bài và Giáo viên được giao nhận đúng thông báo. Sự kiện bắt buộc vẫn được gửi. Mẫu sai biến bị từ chối, mẫu sửa chỉ ảnh hưởng thông báo mới và link đích tiếp tục kiểm tra quyền. |

##### Đợt 1. Hộp thông báo và dữ liệu đã đọc

- API dự kiến gồm `GET /api/notifications` (lọc chưa đọc, cursor), `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read` và `POST /api/notifications/read-all`. Mọi truy vấn giới hạn người nhận theo phiên, bao gồm Quản lý sử dụng hộp thông báo cá nhân. Thao tác đánh dấu lặp giữ nguyên `read_at`. Rà chỉ mục đếm bản ghi chưa đọc và chỉ thêm migration nếu cần.
- Dùng lại hook chung cho chuông, trang thông báo và kiểu dữ liệu hiện có. Làm mới khi mở hộp thư, quay lại tab hoặc định kỳ khi tab hiển thị. Cập nhật chung số chưa đọc và danh sách khi đánh dấu. Dữ liệu mẫu và dấu đã đọc của các mục mẫu kết thúc cùng lúc với chuyển nguồn dữ liệu.
- Service nhận sự kiện từ nghiệp vụ phía server và ghi cùng transaction với thay đổi gốc. Khóa sự kiện ổn định dựa trên ID đối tượng và lần thay đổi, dùng khóa duy nhất hiện có. Link đích ánh xạ theo loại tham chiếu và điều hướng hiện hành. API đích tiếp tục xác minh quyền sở hữu/phân công. Hộp thư có thể rỗng trước khi đợt 2 nối nguồn sự kiện đầu tiên.

##### Đợt 2. Phiếu hỗ trợ qua nhiều thiết bị

- Bổ sung bảng phiếu và lịch sử cập nhật. Chủ phiếu lấy từ phiên. Giữ ba trạng thái hiện có **Chờ tiếp nhận**, **Đang xử lý**, **Đã giải quyết**. Người gửi xem phiếu của mình. Quản lý đang hoạt động đọc hàng đợi, phản hồi và đổi trạng thái. Màn hiện có có thể hiển thị phản hồi mới nhất; nhu cầu hiển thị cả cuộc trao đổi được duyệt riêng.
- Lưu phản hồi/trạng thái và thông báo cho chủ phiếu trong cùng transaction. Chống tạo trùng khi gửi lại sau lỗi mạng và phát hiện Quản lý cập nhật đồng thời. Đếm số phiếu tạo trong khoảng ngày Việt Nam trên Dashboard. Dữ liệu cũ trong localStorage cần phương án nhập riêng nếu thực sự muốn giữ, vì có bản ghi thiếu chủ tài khoản và có thể trùng giữa trình duyệt.
- Chốt cách xử lý nội dung phiếu khi xóa tài khoản trước khi bật dọn dữ liệu phiếu. Phân biệt dữ liệu cần ẩn danh với lịch sử tối thiểu cần giữ theo chính sách xóa đang áp dụng.

##### Đợt 3. Tải ảnh từ vựng lên R2

- Dùng `R2_VOCABULARY_BUCKET=ieltspace-vocabpic-dev` ở dev và bucket riêng cho bản chính. Tái sử dụng adapter R2. Backend kiểm tra quyền Quản lý, kích thước, MIME và chữ ký tệp. Giữ giới hạn hiện tại JPG/PNG/WebP tối đa 1 MiB. Ghi khóa đối tượng, nguồn, ghi công và trạng thái tham chiếu vào DB. Nếu R2 lỗi, báo lỗi và giữ bản nháp hiện có để thử lại.
- Giữ bucket riêng tư. Quản lý xem trước bằng URL ký ngắn hạn. Thư viện công khai dùng URL ổn định của ứng dụng và chỉ phục vụ đối tượng thuộc bộ từ đang công bố. Lưu khóa media thay vì lưu URL ký vào nháp hoặc bản công bố. Khi thay ảnh trong nháp, bản đã công bố tiếp tục dùng ảnh cũ tới lần công bố kế tiếp. [URL ký của Cloudflare R2](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- Giữ thứ tự tra ảnh Wikipedia → Unsplash → Pixabay. Wikipedia và Unsplash dùng URL nguồn kèm ghi công. URL Pixabay dùng để xem trước kết quả. Khi Quản lý chọn một ảnh, sao chép ảnh vào R2 và giữ URL trang nguồn để ghi công. Ảnh HTTPS cũ và preset bìa đọc theo định dạng sẵn có. [Pixabay API](https://pixabay.com/api/docs/) · [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- Theo dõi ảnh đã tải nhưng chưa lưu, ảnh bị bỏ và tác vụ dọn thất bại. Chỉ dọn sau khi xác nhận không còn tham chiếu trong bản nháp hoặc bất kỳ bộ đã công bố/đã ẩn nào có thể mở lại. Kiểm thử đồng thời giữa lưu/công bố với tác vụ dọn. Rà cả hai luồng chọn ảnh bìa khi tạo bộ và sửa bộ.

##### Điều chỉnh từ tài liệu thông báo tham khảo

- Giữ mô hình một thông báo mỗi người nhận và mỗi sự kiện, gửi nhóm ngay/hẹn giờ, các sự kiện bắt buộc và tùy chọn nhắc hết hạn. Dùng middleware, Prisma, contract lỗi và điều hướng của repo. Migration chỉ thêm phần thực tế còn thiếu, dựa trên schema dev và chính đã đối chiếu. [RLS của Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Đợt 4 dự kiến thêm bảng lưu đợt thông báo chung và ghi audit. Nhắm nhóm **Tất cả tài khoản hoạt động**, **Người học** hoặc **Giáo viên** như thiết kế. Nhóm Tất cả gồm Quản lý đang hoạt động. Đóng băng nội dung khi lên lịch/gửi, dùng mốc UTC lưu trong DB và hiển thị theo giờ Việt Nam. Tác vụ định kỳ đọc lịch từ DB và có thể chạy lại sau khi backend khởi động lại. Nếu cần gửi theo lô, lưu phạm vi người nhận tại lúc bắt đầu gửi và cho phép tiếp tục từ lô chưa hoàn tất.
- Đợt 5 dùng quy tắc sẵn có của `GRADE-01–03`, `BR-CREDIT-002` và `BR-CONTENT-001/002`. Phát thông báo sau khi tiếp nhận yêu cầu, phân công, công bố, hủy hoặc hoàn bonus tương ứng được lưu thành công. Nhắc hết hạn dùng hạn hiệu lực thực tế và bỏ qua bài đang có yêu cầu chấm. Mẫu chỉ nhận biến cho phép. Thay mẫu, giờ nhắc hoặc tùy chọn hiển thị không đổi quy tắc 72 giờ, 14 ngày hay quyền nhận. Phạm vi là thông báo trong ứng dụng.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Đối chiếu bảng, khóa và quyền `notifications` | Supabase dev và chính, chỉ đọc metadata | Có cùng schema cần dùng, khóa chống trùng và RLS. Không có bảng phiếu hỗ trợ hoặc bảng thông báo chung/cài đặt trong nhóm đã rà. |
| Đối chiếu giao diện, routes và kho tệp | Repository local | Có hộp thư, chuông, màn hỗ trợ/văn bản phản hồi, API từ vựng nháp/công bố và adapter R2 để tái dùng. Dashboard hỗ trợ trả null. |
| Rà thiết kế đính kèm | Bản tham khảo của người dùng | Phần nhận, thông báo chung và cài đặt được tách theo phụ thuộc. Mã và SQL trong bản tham khảo chỉ dùng để đối chiếu. |

Khi triển khai, chạy kiểm thử quyền và giao dịch trên PostgreSQL cô lập. Thử luồng trên Edge bằng hai tài khoản, hai phiên đăng nhập và một phiên khách. Thử R2 bằng bucket dev, gồm ảnh giả MIME, quá dung lượng, lỗi giữa các bước, lưu lại sau lỗi và ảnh đang công bố vẫn đọc được. Chỉ dùng DB và bucket thử cho ca có ghi dữ liệu.

#### Phần còn mở

- **Danh sách thông báo**, **Tạo thông báo** và **Cài đặt** là ba tab đề xuất cho Quản lý. Cần người dùng duyệt trước khi thêm vào giao diện. Đợt 1–3 dùng các điểm thao tác sẵn có.
- Thời điểm mở tác vụ hẹn giờ và các cấu hình sự kiện phụ thuộc môi trường chạy tác vụ định kỳ và nghiệp vụ chấm bài thực tế. Thông báo/hỗ trợ dùng phân quyền hiện có và cần nghiệm thu việc chặn tài khoản khóa. Với thao tác nhạy cảm, dùng kiểm tra hồ sơ mới để tránh phụ thuộc cache D11.

#### Bước tiếp theo

1. Làm API và nối hộp thông báo ở Đợt 1. Sau đó thêm phiếu hỗ trợ làm nguồn thông báo thật đầu tiên.
2. Làm ảnh từ vựng trên bucket R2 dev song song hoặc sau Đợt 1. Ghi biến cấu hình và file SQL tăng dần khi có thay đổi schema, giữ SQL trong `docs/csdl/`.
3. Nghiệm thu dev trước. Khi từng đợt đạt, xác nhận SQL tương ứng và kế hoạch áp dụng dự án chính.

#### Tài liệu và cách tái hiện

- [TASKS](../TASKS.md) · [Quy tắc nghiệp vụ](../BUSINESS_RULES.md) · [CSDL](../DATABASE.md) · [Hợp đồng API](../API.md) · [Thiết kế](../DESIGN.md)
- [Tổng hợp 20/11 – Phần 2](2026-11-20-tong-hop-phan-2.md) · [Kiến trúc từ vựng](../KIEN_TRUC_TU_VUNG.md)

<a id="thong-bao-va-ho-tro-dot-1-2"></a>

### Tiến độ Thông báo và Hỗ trợ đợt 1–2 ngày 20/11/2026

#### Phạm vi và trạng thái

Đã nối hộp thông báo thật (`NOTIF-01` / `RS-C01`) và Báo cáo & hỗ trợ (`RS-C02`). Mã frontend/backend đã kiểm tra local. SQL 21 đã áp dụng trên Supabase dev rồi dự án chính. Việc phát hành frontend/backend lên máy chủ dùng chung còn chờ.

#### Công việc đã thực hiện

- Dùng bảng `notifications` hiện có. API đọc hộp thư theo ID của tài khoản trong phiên, lọc chưa đọc, phân trang 20 mục, đếm chưa đọc toàn hộp thư, đánh dấu một mục hoặc tất cả. Chuông và hộp thông báo đọc cùng nguồn. Badge làm mới khi quay lại tab và mỗi 30 giây trong khi tab đang hiển thị.
- Nối màn hỗ trợ trong Hồ sơ Người học/Giáo viên và trang Báo cáo & phản hồi của Quản lý với DB. Gửi lại cùng mã yêu cầu và nội dung dùng lại phiếu. Cập nhật dùng revision và lưu lịch sử, audit, thông báo trong cùng giao dịch. Phiếu do người học hoặc giáo viên tạo chỉ đọc được bằng phiên của chủ phiếu hoặc qua API Quản lý.
- Khi Quản lý có phản hồi mới hoặc đổi trạng thái, thông báo hiển thị cho chủ phiếu đang hoạt động. Mở thông báo đánh dấu đã đọc và đưa tới phiếu tương ứng. API chi tiết tiếp tục kiểm tra người sở hữu. Nội dung phiếu và phản hồi giữ trong module hỗ trợ.
- Dashboard đếm phiếu được tạo trong khoảng ngày Việt Nam. Khi không có phiếu, chỉ số là 0. Giữ bố cục hiện tại, dùng các nút hiện có để gửi, lọc, lưu và đánh dấu đã đọc. Bổ sung phản hồi tải/lỗi và nút xem thêm cho danh sách phân trang.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build backend và frontend | Local | Đạt. |
| HTTP API thông báo, hỗ trợ, quản trị, học tập và Auth | PostgreSQL cô lập | 6 ca đạt. Xác nhận khách và tài khoản khóa bị từ chối, tài khoản khác không xem/sửa được, retry không trùng phiếu, phản hồi hoặc audit lỗi rollback, revision cũ bị từ chối, giữ mốc đã đọc và đánh dấu toàn bộ khi có hơn một trang. Dashboard đếm đúng hai phiếu trong ca ranh giới 00:00 Việt Nam. |
| Gửi báo cáo, phản hồi và mở thông báo | Edge với API mô phỏng | Thử Người học ở 375 px, Giáo viên ở 768 px, Quản lý ở 1366 px. Phiên Người học thứ hai mở đúng phiếu từ thông báo. Phiên ban đầu đọc lại thấy trạng thái đã đọc. Hộp thư Giáo viên riêng. |
| SQL 21 | Supabase dev | Áp dụng thành công. Kiểm tra RLS, quyền đọc của khách/người dùng, tạo phiếu, chống trùng, phản hồi, thông báo và đánh dấu đã đọc trong giao dịch đã hoàn tác. |
| SQL 21 | Supabase chính | Áp dụng sau dev. Xác minh chỉ đọc các bảng, chỉ mục và quyền. Không tạo phiếu thử. |

#### Phần còn mở

- Phiếu cũ trong localStorage chưa được nhập vì có bản ghi thiếu định danh chủ phiếu. Chưa bổ sung chính sách ẩn danh/xóa nội dung phiếu khi xóa tài khoản.
- Đợt gửi thông báo chung và thông báo nghiệp vụ chấm bài tiếp tục theo kế hoạch riêng.
- Phạm vi ảnh từ vựng đã cập nhật theo yêu cầu. R2 dành cho ảnh từ máy. Ảnh từ Unsplash API giữ URL và thông tin nguồn. Pixabay cho dùng URL ảnh để xem trước kết quả. URL trang nguồn có thể lưu để ghi công, còn hiển thị ảnh lâu dài cần một bản được lưu riêng. Chưa triển khai đợt ảnh. [Pixabay API](https://pixabay.com/api/docs/) · [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)

#### Bước tiếp theo

1. Phát hành frontend và backend cùng phiên bản. SQL 21 đã có trên dev và dự án chính.
2. Trên dev, mở hai phiên của cùng một tài khoản để thử lại gửi phiếu, phản hồi và chuông bằng phiên đăng nhập thật sau khi phát hành ứng dụng.

#### Tài liệu và cách tái hiện

- [Kế hoạch](#ke-hoach-thong-bao-ho-tro-anh-tu-vung) · [SQL 21](../csdl/21_notifications_support_reports.sql) · [Hợp đồng API](../API.md#thông-báo-và-phiếu-hỗ-trợ)
- [Kiểm thử tích hợp](../../backend/tests/admin-users.integration.mjs). Trên môi trường thử, mở Hồ sơ → **Báo cáo & hỗ trợ** để gửi. Dùng phiên Quản lý vào **Báo cáo & phản hồi**, lưu phản hồi. Quay lại phiên chủ phiếu, mở chuông và chọn thông báo vừa tạo.

<a id="anh-tu-vung-r2-dot-3"></a>

### Tiến độ ảnh từ vựng trên R2 đợt 3 ngày 20/11/2026

#### Phạm vi và trạng thái

`RS-C03`. Đã nối ảnh từ tải máy, bìa tải máy và ảnh Pixabay được chọn vào Cloudflare R2. Giữ bố cục editor hiện tại. SQL 22 đã áp dụng trên Supabase dev trước rồi dự án chính. Chưa phát hành mã frontend/backend lên máy chủ dùng chung.

#### Công việc đã thực hiện

- Giữ thứ tự tra ảnh đã có **Wikipedia → Unsplash → Pixabay**. Wikipedia và Unsplash giữ URL và ghi công. Pixabay chỉ trả URL xem trước khi tra, rồi sao chép ảnh vào R2 khi Quản lý chọn ảnh cụ thể. Nhập bộ từ không tải ảnh Pixabay hàng loạt. [Pixabay API](https://pixabay.com/api/docs/)
- Nút ảnh trong editor và nút tải bìa dùng cùng API tải JPG/PNG/WebP tối đa 1 MiB. Backend xác thực Quản lý và kiểm tra nội dung tệp. DB lưu `vocab-image:<uuid>`, bucket, khóa và loại nguồn. Giữ URL HTTPS hiện có và preset bìa.
- Khi mở lại bản nháp, backend cấp URL xem trước ngắn hạn cho Quản lý. Nếu ảnh báo lỗi khi URL hết hạn, editor thử xin URL mới. Thư viện và Flashcard đi qua đường dẫn ảnh ổn định và chỉ nhận URL ký khi ảnh thuộc bộ đang công bố.
- Mỗi ảnh thay thế có khóa R2 riêng. Bản công bố giữ ảnh từ và ảnh bìa trước đó cho tới lần công bố lại. Có API dọn theo lô ảnh từ 24 giờ trở lên không còn tham chiếu. Bảo vệ ảnh trong nháp, bản đang công bố hoặc bản đã ẩn. Lỗi kho giữ bản ghi để thử dọn lại.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build backend và frontend | Local | Đạt. |
| Thứ tự tra, API tải và vòng đời ảnh | PostgreSQL cô lập, R2 và provider mô phỏng | 12 ca đạt. Gồm sai MIME, vượt dung lượng, lỗi kho, quyền người dùng, nháp riêng, ảnh từ và ảnh bìa cũ giữ ở bản công bố, mở lại, công bố bản thay thế, ẩn/hiện và dọn ảnh. |
| Tải bìa, ảnh từ và chọn Pixabay | Edge với API mô phỏng | Tạo bộ với ảnh bìa, tải ảnh từ, lưu rồi mở lại thấy ảnh. Khi URL xem trước hết hạn, editor lấy được URL mới. Luồng xem trước Pixabay chỉ ghi R2 sau thao tác chọn. |
| Tải, đọc và dọn ảnh thật | Bucket `ieltspace-vocabpic-dev` | Tải ảnh thử, URL ký đọc được, URL không ký bị từ chối. Đã xóa ảnh thử. |
| SQL 22 | Supabase dev và chính | Áp dụng theo thứ tự dev rồi chính. Đã xác minh hai chỉ mục cho ảnh công bố, RLS và quyền bảng. Dự án chính có 0 bản ghi ảnh mới tại lúc xác minh. |

#### Phần còn mở

- Backend đang kết nối môi trường nào phải dùng bucket từ vựng của môi trường đó. Trên dev đặt `R2_VOCABULARY_BUCKET=ieltspace-vocabpic-dev`. Khi phát hành chính cần bucket và khóa phù hợp của môi trường chính. Cấu hình local hiện trỏ Supabase chính, nên lần kiểm tra bucket dev dùng biến riêng cho tiến trình thử.
- Luồng trình duyệt đã thử với API mô phỏng. Chưa thử toàn tuyến từ phiên đăng nhập thật trên bản triển khai đến R2/Pixabay thật. API dọn ảnh chưa có lịch chạy tự động.

#### Bước tiếp theo

1. Phát hành backend và frontend cùng phiên bản sau khi đã cấu hình bucket phù hợp. Hai dự án hiện có SQL 22.
2. Trên dev, tạo bộ thử, tải ảnh bìa và ảnh từ, chọn ảnh Pixabay nếu tìm thấy qua thứ tự nguồn. Lưu nháp, mở lại, công bố và đối chiếu ảnh công khai trước/sau khi thay nháp.

#### Tài liệu và cách tái hiện

- [SQL 22](../csdl/22_vocabulary_image_assets.sql) · [Hợp đồng API](../API.md#ảnh-từ-vựng) · [Kiến trúc từ vựng](../KIEN_TRUC_TU_VUNG.md) · [Cấu hình backend](../../backend/.env.example)
- [Kiểm thử tích hợp ảnh](../../backend/tests/vocabulary-images.integration.mjs) · [Kiểm thử thứ tự nguồn](../../backend/tests/vocabulary-media.test.mjs)

<a id="thong-bao-dot-4-5-kiem-thu-1-5"></a>

### Tiến độ Thông báo đợt 4–5 và kiểm thử đợt 1–5 ngày 20/11/2026

#### Phạm vi và trạng thái

Đợt 4 đã có thông báo chung, ba tab đã duyệt trên trang Thông báo của Quản lý và tác vụ gửi theo lịch. Đợt 5 có cấu hình mẫu, nhắc hạn lưu nội dung và kiểm tra quyền mở chi tiết. Các điểm ghi thông báo tiếp nhận, phân công, công bố và hủy đã có hàm dùng trong giao dịch và đã thử bằng dữ liệu cô lập. Repository chưa có service nghiệp vụ thực để gọi các điểm này trong luồng chấm bài. Bản frontend/backend mới chưa phát hành lên máy chủ.

#### Công việc đã thực hiện

- Trang Quản lý giữ hộp thư cá nhân và thêm **Danh sách**, **Tạo thông báo**, **Cài đặt**. Quản lý lưu/sửa nháp, chọn nhóm, gửi ngay hoặc nhập giờ Việt Nam để hẹn lịch. Lịch sử hiện thời điểm, trạng thái và số người nhận. Backend khóa nội dung khi lên lịch.
- Tác vụ đến hạn chọn tài khoản đang hoạt động tại thời điểm chạy. Nhóm Tất cả gồm Quản lý đang hoạt động. Cùng giao dịch khóa đợt gửi, ghi hộp thư, đếm và cập nhật lịch sử. Một lượt thất bại vẫn chờ xử lý và lần chạy tiếp theo không nhân đôi. Đợt không có người nhận kết thúc với số 0.
- Cấu hình mẫu chỉ chấp nhận `{{skill}}` và thêm `{{expiresAt}}` cho nhắc hạn. Sự kiện bắt buộc luôn bật. Mẫu sửa ảnh hưởng thông báo mới. Giờ nhắc mặc định 24, giới hạn 1–168, chỉ dùng để chọn thời điểm nhắc. Mốc hạn lưu thật đọc từ `skill_attempts.content_expires_at`.
- Nhắc hạn kiểm tra bài Writing/Speaking đã hoàn thành, nội dung còn lưu, phiên người học hợp lệ và chưa có yêu cầu chấm đang hoạt động. Mỗi mốc hết hạn tạo tối đa một thông báo. Đổi hạn sau công bố có thể tạo lần nhắc mới. Khóa hồ sơ trước khi khóa bài để phối hợp với thao tác xóa tài khoản.
- Mở chi tiết thông báo xác minh phiên, người nhận và quyền trên dữ liệu thật. Giáo viên chỉ xem được khi còn quan hệ phân công theo trạng thái. Bài hết hạn trả 410. API chỉ trả metadata cho hộp thư.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build backend và frontend | Local | Đạt. |
| Đợt 1, hộp thông báo | PostgreSQL cô lập và Edge | Kiểm tra phân trang, đếm toàn bộ, giữ mốc đã đọc, đánh dấu tất cả, tài khoản khóa, không đọc chéo và trạng thái đã đọc trên hai phiên. |
| Đợt 2, hỗ trợ và Dashboard | PostgreSQL cô lập và Edge | Qua gửi lại, bảo vệ chủ phiếu, xung đột revision, rollback khi lỗi audit, phản hồi kèm thông báo, mở đúng phiếu và thống kê ranh giới ngày Việt Nam. |
| Đợt 3, ảnh từ vựng | PostgreSQL cô lập, R2/provider mô phỏng và Edge | Kiểm tra tải bìa, ảnh từ, chọn Pixabay, mở nháp, ảnh cũ giữ ở bản công bố, ẩn/hiện và dọn tệp không tham chiếu. Thứ tự Wikipedia → Unsplash → Pixabay tiếp tục đạt. Kiểm tra bucket thật ghi ở báo cáo đợt 3. |
| Đợt 4, thông báo chung | PostgreSQL cô lập và Edge | Qua gửi ngay, lịch tương lai, lọc người hoạt động, đổi vai trò sau khi lập lịch, sửa nháp, xử lý lỗi rồi thử lại, hai lượt chạy trùng, đợt có 0 người nhận, danh sách và điều hướng bàn phím. |
| Đợt 5, cấu hình, nhắc hạn và quyền | PostgreSQL cô lập và Edge | Biến lạ, tắt mẫu bắt buộc và sửa revision cũ bị từ chối. Dùng dữ liệu thử kiểm chứng tiếp nhận, phân công, công bố, hủy/hoàn và giữ im lặng khi chưa đủ điều kiện. Nhắc không trùng, bỏ qua bài chờ chấm và gửi lại nếu hạn hiệu lực đổi. Chi tiết kiểm tra đúng quyền và hết hạn. |
| Bộ kiểm thử chạy lại | Local, không dùng DB chính | 21 ca backend và 17 ca frontend đạt. Edge kiểm tra luồng ở 375–1366 px. |
| SQL 23 | Supabase dev rồi dự án chính | Dev kiểm tra cấu trúc, RLS và luồng gửi bằng giao dịch hoàn tác. Dự án chính chỉ áp dụng schema và xác minh bằng truy vấn đọc. Có đủ hai bảng riêng và chỉ mục lịch gửi. Tại lúc đối chiếu, chưa có đợt gửi, mẫu tùy chỉnh hoặc lượt làm có mốc hết hạn lưu. |

#### Phần còn mở

- Cần nối `recordGradingTransition` trong giao dịch của service tiếp nhận yêu cầu, phân công, công bố, hủy và hoàn lượt khi các service có mặt. Không phát thông báo kết quả từ dữ liệu mẫu. Liên kết tới màn chấm và nội dung bài cần dùng route nghiệp vụ thật khi có.
- Khi phát hành, backend đang chạy kiểm tra lịch mỗi 30 giây. Nếu máy chủ có thể ngủ, cần lịch bên ngoài chạy `npm run notifications:dispatch` trên đúng môi trường. Chưa nghiệm thu lịch ngoài trên máy chủ.

#### Bước tiếp theo

1. Phát hành frontend/backend cùng phiên bản và thử một lịch gửi trên dev bằng phiên Quản lý thật.
2. Khi có giao dịch chấm bài, gọi hàm ghi thông báo trong cùng transaction rồi nghiệm thu hoàn chỉnh với Người học và Giáo viên.

#### Tài liệu và cách tái hiện

- [SQL 23](../csdl/23_announcements_and_notification_settings.sql) · [API thông báo chung](../API.md#thông-báo-chung-và-mẫu-nghiệp-vụ) · [Kiểm thử tích hợp](../../backend/tests/admin-users.integration.mjs)
- [Thông báo và hỗ trợ đợt 1–2](#thong-bao-va-ho-tro-dot-1-2) · [Ảnh từ vựng đợt 3](#anh-tu-vung-r2-dot-3)
- Ở môi trường dev, mở **Thông báo → Quản lý thông báo → Tạo thông báo**. Lưu nháp, hẹn giờ hoặc gửi ngay. Mở **Danh sách** và dùng hai phiên thử khác vai trò để so sánh số người nhận và hộp thư.

<a id="kiem-thu-dot-1-5-csdl-bai-mau"></a>

### Tiến độ kiểm thử đợt 1–5, quyền dữ liệu và thư viện bài mẫu ngày 20/11/2026

#### Phạm vi và trạng thái

Build backend và frontend thành công. 50 ca backend và 17 ca frontend trong bộ kiểm thử đã chọn đều đạt. Đã mở bản build local trong Microsoft Edge bằng Playwright và thao tác các luồng chính. Các kịch bản ghi ứng dụng chạy với PostgreSQL cô lập. Dự án Supabase chính `vnssjipyagfqunskgvke` được kiểm tra chỉ đọc. Ảnh thử trên R2 được tạo và dọn trong bucket dev. Lượt rà soát chỉ bổ sung báo cáo, giữ giao diện hiện hành.

#### Công việc đã thực hiện

- Đối chiếu log PostgreSQL trên Supabase chính với giờ áp dụng [SQL 23](../csdl/23_announcements_and_notification_settings.sql). Từ 20:48:33 đến 21:01:08 giờ Việt Nam có 27 lỗi `42P01` cho mỗi bảng `public.announcements` và `public.notification_settings`. Nhịp lặp khoảng 30 giây khớp với [tác vụ thông báo của backend](../../backend/src/server.ts) truy vấn hai bảng trước khi migration được áp dụng.
- Lúc 21:01:35, bản ghi migration xuất hiện cùng hai cảnh báo `25001` và `25P01`. Ảnh log cho thấy công cụ chạy SQL đã mở transaction và nội dung tệp cũng có cặp `BEGIN`/`COMMIT`. Trình tự này giải thích hai cảnh báo. Đã xác nhận hai bảng, chỉ mục lịch gửi và chỉ mục thông báo chưa đọc tồn tại. Từ 21:01:36 đến 21:32:45, truy vấn log trả 0 dòng cho bốn thông báo đã đối chiếu. [Mã lỗi PostgreSQL](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- Trên Supabase chính, 17 bảng đã kiểm tra có RLS và các vai trò `anon`, `authenticated` thiếu quyền SELECT trực tiếp. Phạm vi gồm hồ sơ, mục tiêu, phiên/thẻ Flashcard, điểm danh, hoạt động học, nhật ký đăng nhập, thông báo, hỗ trợ, ảnh từ vựng và các bảng bài mẫu. Các ca quyền qua API được chạy riêng với nhiều phiên.
- Đối chiếu metadata với đối tượng trong bucket riêng tư `sample-assets`, dựa trên đường dẫn ảnh bìa, ảnh đề và audio trong cả nháp lẫn snapshot đã công bố hoặc đã ẩn. Có 1 bài công bố, 3 bài ở trạng thái nháp và 4 bản ghi nháp. Bucket có 0 đối tượng, metadata media có 0 bản ghi và truy vấn ghi nhận 0 tham chiếu hỏng hoặc tệp mồ côi. Phần này kiểm tra riêng thư viện bài mẫu.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `npm run build` và bộ kiểm thử Node | Local | Backend và frontend build đạt. 50/50 ca backend và 17/17 ca frontend đạt. |
| Đợt 1–2, thông báo và hỗ trợ | Edge, Express và PostgreSQL cô lập | Người học gửi phiếu ở 375 px. Phát lại cùng yêu cầu nhận cùng mã phiếu. Quản lý trả lời ở 1366 px và tạo đúng 1 thông báo cùng 1 dòng audit. Phiên thứ hai mở đúng phiếu, đánh dấu đã đọc và phiên thứ nhất thấy lại trạng thái. Tài khoản khác mở đường dẫn phiếu nhận 404. Hạ vai trò Quản lý giữa phiên khiến yêu cầu tiếp theo nhận 403. |
| Đợt 3, ảnh từ vựng | Edge với API thử, bộ tích hợp PostgreSQL và R2 dev thật | Tải bìa, ảnh từ, chọn Pixabay và mở lại nháp. Bản công bố giữ ảnh cũ đến lần công bố sau. Thứ tự Wikipedia → Unsplash → Pixabay đạt. Bucket `ieltspace-vocabpic-dev` nhận ảnh thử, đọc được đúng byte bằng URL ký, từ chối đọc không ký và trả 404 sau khi xóa chính ảnh thử. |
| Đợt 4, thông báo chung | Edge với API thử và tích hợp PostgreSQL | Thao tác ba tab, lưu/sửa nháp, gửi ngay, hẹn giờ và xem danh sách. Tác vụ chọn người nhận theo vai trò tại lúc gửi. Giao dịch lỗi rồi chạy lại và hai lượt thực thi đồng thời chỉ tạo mỗi thông báo một lần. |
| Đợt 5, thông báo chấm bài | Edge với API thử và tích hợp PostgreSQL | Cài đặt mẫu, chặn biến ngoài danh sách, nhắc hạn đúng điều kiện, gửi lặp không trùng và kiểm tra quyền khi mở liên kết. Sự kiện tiếp nhận, phân công, công bố và hủy đã qua ca tích hợp với dữ liệu chấm thử. |
| Hồ sơ, mục tiêu, Flashcard và hoạt động | Edge, Express và PostgreSQL cô lập | Sửa tên/ảnh và mục tiêu, mở lại ở phiên khác, kiểm tra lịch sử và phân quyền. Phát lại phiên Flashcard sau khi mất phản hồi chỉ lưu một lần. Điểm danh và thống kê kiểm tra hai phía của 00:00 giờ Việt Nam. F5 và refresh giữ nguyên số bản ghi đăng nhập. |
| Quyền trong phiên đang mở | API tích hợp và kiểm tra hai bộ nhớ đệm riêng | API thông báo và hỗ trợ đọc quyền mới ngay. API dùng bộ nhớ đệm mặc định trên tiến trình khác có thể giữ quyền cũ tối đa 60 giây theo [D11](../DECISIONS.md). Đã thử mốc 59.999 giây và 60 giây. |
| Thư viện bài mẫu công khai | Edge và Express local đọc Supabase chính | Bấm từ thư viện vào bài đã công bố ở 390 và 1366 px, cả API danh sách lẫn chi tiết trả 200, trang hiển thị đúng và không tràn ngang. ID không tồn tại trả 404. |
| Soạn bài mẫu, Excel và media | Chromium, Express, PostgreSQL cô lập và Storage mô phỏng | Lưu/mở lại nháp, công bố, sửa riêng, ẩn/hiện, công bố lại và nhập Excel lặp không nhân đôi. Tải ảnh đại diện và ảnh đề, kiểm tra ảnh hiện trên thẻ và trang Writing. Tải và phát audio trong bài Speaking. Đã cập nhật bộ thử local theo nhãn và lựa chọn hiện hành của giao diện. |

#### Phần còn mở

- Đợt 5 còn bước nghiệm thu toàn trình với nghiệp vụ chấm bài. Các service GRADE-01–03 chưa gọi `recordGradingTransition`. Tại lúc đọc dự án chính có 0 lượt bài mang hạn lưu nội dung, 0 thông báo đang hẹn lịch và 0 bản cấu hình mẫu riêng. Lịch chạy ngoài trên máy chủ chưa được thử.
- Backend local hiện thiếu `R2_VOCABULARY_BUCKET` trong cấu hình mặc định. Ca R2 thật gán riêng bucket dev trong tiến trình kiểm thử. Luồng upload ảnh từ trình biên tập trên cấu hình triển khai cần được xác nhận khi gắn đúng bucket.
- Kiểm thử ghi Storage thật cho bài mẫu còn mở. Dev thiếu ba bảng `sample_answer_drafts`, `sample_media_assets`, `sample_import_receipts` và bucket `sample-assets`. Supabase chính có đủ cấu trúc và bucket riêng tư nhưng chưa có tệp để thử tải hoặc phát. Việc triển khai tác vụ dọn tệp bài mẫu vẫn là phần bảo trì riêng. Tại thời điểm kiểm kê chưa có đối tượng cần dọn.

#### Bước tiếp theo

1. Giữ thứ tự áp dụng migration trước khi khởi động tác vụ thông báo. Migration 23 đã có trên Supabase chính.
2. Nghiệm thu chuỗi thông báo chấm bài khi các giao dịch nghiệp vụ sẵn sàng. Dùng dữ liệu thử để đối chiếu người nhận, hạn lưu và kết quả của lịch chạy trên máy chủ.
3. Hoàn thiện môi trường thử của bài mẫu để kiểm tra tải lên và đọc URL ký qua Supabase Storage. Dùng tệp thử có mã riêng để kiểm tra nguyên tắc giữ tệp còn tham chiếu trước khi triển khai tác vụ dọn.

#### Tài liệu và cách tái hiện

- [Kiểm thử tài khoản, hỗ trợ, thông báo và lịch phát](../../backend/tests/admin-users.integration.mjs) · [Kiểm thử học và ranh giới ngày](../../backend/tests/learner-study.integration.mjs) · [Kiểm thử hồ sơ](../../backend/tests/learner-profile.test.mjs)
- [Kiểm thử ảnh từ vựng](../../backend/tests/vocabulary-images.integration.mjs) · [Kiểm thử bài mẫu](../../backend/tests/samples.integration.mjs)
- [Báo cáo đợt 4–5](#thong-bao-dot-4-5-kiem-thu-1-5) · [Ảnh từ vựng qua R2](#anh-tu-vung-r2-dot-3)

<a id="tach-luong-thong-bao-quan-ly"></a>

### Tiến độ tách luồng thông báo Quản lý ngày 20/11/2026

#### Phạm vi và trạng thái

Đã tách hộp thư hệ thống và màn quản lý thông báo của Quản lý. Thay đổi điều hướng và giao diện đã build, chạy kiểm thử và xác nhận trên local.

#### Công việc đã thực hiện

- Chuông cạnh ảnh đại diện mở **Thông báo hệ thống**. Hộp thư đọc dữ liệu theo tài khoản đang đăng nhập, hiển thị số chưa đọc và hỗ trợ đánh dấu đã đọc. Đã bỏ nội dung chi tiết minh họa ở màn Quản lý.
- Mục **Quản lý thông báo** trong thanh bên mở trang riêng với ba tab **Danh sách thông báo**, **Tạo thông báo** và **Cài đặt thông báo**. Tab danh sách mở mặc định. Quyền mở trang dùng điều kiện vai trò Quản lý hiện có.
- Thanh chuyển tab nằm ngay trên nội dung, dùng nền chung và viền nhấn cho tab đang chọn theo mẫu ở trang **Người dùng**. Các tab tự xuống dòng khi cần trên màn hẹp.
- Trang quản lý dùng các API thông báo chung và mẫu nghiệp vụ hiện có. Quy tắc người nhận của nhóm **Tất cả tài khoản hoạt động** tiếp tục bao gồm Quản lý đang hoạt động. Hộp thư chỉ nhận bản ghi đã phát đến đúng tài khoản.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build và kiểm thử frontend | Local | Build thành công, 17/17 ca đạt. |
| Điều hướng hai luồng và đánh dấu đã đọc | Edge, bản build local, dữ liệu thử | Chuông mở đúng hộp thư và số trên chuông cập nhật sau khi đọc. Thanh bên mở đúng trang quản lý. Tải lại và quay lại bằng trình duyệt đi đúng trang. |
| Ba tab và thao tác nghiệp vụ | Edge, bản build local, API mô phỏng | Chuyển tab bằng bàn phím, lưu/sửa nháp, gửi ngay, hẹn giờ và lưu mẫu đều qua. |
| Kiểu thanh tab nhỏ | Edge, bản build local | So sánh với thanh tab Người dùng, khớp chiều cao, nền, viền, kiểu chữ và khoảng đệm. Kiểm tra chuyển tab và hiển thị ở cả bốn kích thước bên dưới. |
| Quyền trực tiếp và bố cục | Edge, bản build local | Giáo viên và Người học mở URL quản lý được chuyển về trang phù hợp. Thử 375 × 812, 768 × 900, 812 × 375 và 1366 × 830, gồm mở thanh bên thu gọn, cuộn tới nút lưu và chế độ tối. |

#### Phần còn mở

- Bản frontend đã xác nhận trên local, chờ phát hành theo quy trình dự án.

#### Bước tiếp theo

1. Khi phát hành, kiểm tra chuông và mục thanh bên bằng phiên Quản lý trên bản web đã cập nhật.

#### Tài liệu và cách tái hiện

- Từ trang Quản lý, bấm chuông để mở `#Notifications`. Bấm **Quản lý thông báo** trong thanh bên để mở `#AdminNotifications`.
- [Hợp đồng API thông báo](../API.md#thông-báo-chung-và-mẫu-nghiệp-vụ) · [Kiểm thử đợt 1–5](#kiem-thu-dot-1-5-csdl-bai-mau)

<a id="ho-so-ca-nhan-ba-vai-tro"></a>

### Tiến độ hồ sơ cá nhân ba vai trò ngày 20/11/2026

#### Phạm vi và trạng thái

Đã sửa lỗi trang hồ sơ Quản lý và Giáo viên vẫn hiển thị tên, email và ảnh mẫu sau khi đăng nhập. Đã kiểm tra lại luồng Người học. Thay đổi dùng trường dữ liệu và kho ảnh hiện có, xác nhận trên bản build local với tài khoản thử và PostgreSQL cách ly.

#### Công việc đã thực hiện

- Trang hồ sơ Quản lý và Giáo viên dùng tên, email, vai trò và ảnh của phiên hiện tại. Thẻ **Thông tin cá nhân** giữ cấu trúc cũ và dùng chung một thành phần giữa hai vai trò.
- Nối các nút **Lưu thay đổi**, **Đổi ảnh đại diện** và **Đổi mật khẩu** với API hồ sơ cá nhân. Sau khi lưu tên hoặc ảnh, thanh đầu trang và menu tài khoản cập nhật theo cùng dữ liệu.
- API dùng Bearer để xác định chủ hồ sơ và kiểm tra trạng thái hoạt động. Phần tự chỉnh sửa chỉ nhận tên hiển thị, ảnh và mật khẩu. Vai trò, email và trạng thái do các quy trình quản trị và xác thực riêng quản lý.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build frontend và backend | Local | Cả hai thành công. Bộ frontend 17/17 ca đạt. |
| Quyền và thao tác hồ sơ qua Express | Dữ liệu thử, Supabase Auth và Storage mô phỏng | 5/5 ca auth và hồ sơ đạt, thêm 3/3 ca hồ sơ khi dùng cấu hình R2. Kiểm tra từ chối khách, tài khoản khóa, dữ liệu cố sửa tài khoản khác, email hoặc vai trò, và kiểm tra ảnh với URL ký. |
| Đăng nhập, hồ sơ và lưu thay đổi | Edge, backend local và PostgreSQL cách ly | Quản lý ở 1366 px, Giáo viên ở 768 px và Người học ở 375 px đều thấy đúng dữ liệu tài khoản. Tên và ảnh mới được đọc lại sau F5 và từ phiên thứ hai. Hai vai trò nhân sự mở hồ sơ từ menu ảnh đại diện. |
| Đổi mật khẩu | Edge, tài khoản thử | Cả ba vai trò bị từ chối khi mật khẩu hiện tại sai. Sau khi đổi đúng, phiên thứ hai không refresh được. Đăng nhập lại bằng mật khẩu mới thành công. |

#### Phần còn mở

- Bản sửa đã xác nhận trên local. Các ca ghi hồ sơ và đổi mật khẩu dùng tài khoản thử.

#### Bước tiếp theo

1. Khi chuyển bản sửa lên web, phát hành frontend và backend cùng phiên bản để các nút hồ sơ nhân sự gọi đúng API.

#### Tài liệu và cách tái hiện

- [Hợp đồng API hồ sơ cá nhân](../API.md#hồ-sơ-cá-nhân) · [Kiểm thử API hồ sơ cho ba vai trò](../../backend/tests/learner-profile.test.mjs)
- Đăng nhập theo từng vai trò, mở **Hồ sơ cá nhân** từ menu tài khoản, so sánh tên và ảnh với thanh đầu trang. Thay tên hoặc ảnh, tải lại rồi đối chiếu lần nữa.

<a id="ra-soat-web-ngoai-de-thi"></a>

### Tiến độ rà soát web ngoài bộ đề và đề thi ngày 20/11/2026

#### Phạm vi và trạng thái

Đối chiếu màn hình Khách, Người học, Giáo viên, Quản lý và các API với tiêu chí MVP. Chấm Writing/Speaking sau khi nộp được rà như luồng nghiệp vụ riêng giữa ba vai trò. Bộ đề, biên tập đề, nhập đề, làm/nộp trên màn thi và thuật toán chấm tự động thuộc phần do người khác phụ trách. Lượt này lập danh sách việc còn mở trên bản mã local.

#### Công việc đã thực hiện

- Kiểm kê theo cấu hình điều hướng, router backend và các báo cáo gần nhất. Hồ sơ ba vai trò, mục tiêu, Flashcard, từ yêu thích/ghi chú, điểm danh, hỗ trợ, quản trị tài khoản, dashboard và thông báo chung đã có kết nối API. Các mục được ghi là còn mẫu trong báo cáo cũ đã được đối chiếu lại.
- Rà riêng Thư viện bài mẫu và Quản lý bài mẫu. Lưu nháp, import Excel, công bố và đọc công khai đã có API. Còn phần bảo trì media và các lối vào công khai.

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build và bộ kiểm thử trong phạm vi | Local, PostgreSQL cô lập và dịch vụ mô phỏng | Build frontend/backend thành công. 23/23 ca backend và 5/5 ca frontend trong bộ đã chọn đạt. |
| Gửi lại xác minh | Edge local | Trang hiện địa chỉ mẫu. Sau đếm ngược, bấm gửi lại thấy báo thành công và không có yêu cầu gửi lại tới API. |
| Gửi và chấm Writing/Speaking | Edge local và đối chiếu mã | Người học thấy số lượt mẫu, bấm gửi mở hộp thoại. Nút **Lưu nháp** và **Công bố kết quả** của Giáo viên chuyển trang mà không ghi dữ liệu. Màn theo dõi Quản lý đang dùng dữ liệu mô phỏng. |
| Thông báo theo vai trò | Edge local, API thử trả hộp thư rỗng | Người học vẫn thấy thông báo mẫu về hủy yêu cầu. Giáo viên vẫn thấy thông báo mẫu về được phân công. |
| Trang chủ và lối vào công khai | Edge local và đối chiếu mã | Thẻ bài mẫu Người học mở danh sách Writing. Link **Liên hệ** thiếu đích. Câu động lực dùng cùng một nội dung cố định. |

#### Phần còn mở

##### Chức năng và luồng còn thiếu

| Ưu tiên | Task | Việc cần hoàn thiện |
|---|---|---|
| Cao | Gửi lại email xác minh (AUTH-01, RS-C04) | Truyền email đúng vào màn xác minh, nối API gửi lại có giới hạn phía server và hiển thị đúng kết quả gửi hoặc lỗi. |
| Cao | Bài đã nộp và yêu cầu chấm (WS-02, CREDIT-01) | Nhận đầu vào là bài W/S đã hoàn thành từ phần làm bài. Nối danh sách và bộ lọc **Bài Writing và Speaking của tôi** với dữ liệu thật, kiểm tra quyền xem/tải nội dung, hạn lưu và dọn quá hạn. Cấp lượt mỗi tuần, dùng lượt hợp lệ, tạo một yêu cầu cho một bài khi gửi đồng thời và hiển thị trạng thái. |
| Cao | Phân công và chấm bài (GRADE-01–03) | Nối tổng quan, hàng chờ, màn chấm và lịch sử Giáo viên vào bài được giao. Lưu nháp, công bố nhận xét/điểm, hủy đúng điều kiện và hoàn duy nhất một bonus khi đủ điều kiện. |
| Cao | Theo dõi chấm và quyền Giáo viên (USER-01) | Nối **Theo dõi hỗ trợ chấm** với hàng đợi, tải, hủy và hoàn bonus thật. Bổ sung chỉnh quyền chuyên môn và giới hạn nhận bài của Giáo viên hiện có, dừng nhận mới và xử lý bài đang giao. Form mời có cấu hình ban đầu. Server đã chặn đổi vai trò/xóa khi Giáo viên còn bài đang giao. |
| Cao | Thông báo chấm và khung mẫu (NOTIF-01 phần còn mở) | Bỏ mẫu ở hộp thư Người học/Giáo viên. Nối hàm ghi sự kiện tiếp nhận, phân công, công bố và hủy vào giao dịch thật khi nghiệp vụ chấm sẵn sàng. Dẫn đúng bài hoặc phiếu chấm theo ID, kiểm tra quyền và hết hạn khi mở. |
| Vừa | Bảo trì media bài mẫu (SAMPLE-01) | Bổ sung cơ chế dọn tệp không còn tham chiếu và thử lại sau lỗi, kiểm tra cả nháp, bản công bố và bản ẩn. Đối chiếu schema/bucket bài mẫu ở dev rồi nghiệm thu tải lên và phát từ Storage thật. |
| Vừa | Thông điệp hằng ngày và band tổng (RS-L09–L10) | Chọn câu động lực ổn định theo ngày Việt Nam. Band theo kỹ năng và tỷ lệ đúng đã có phần đọc dữ liệu. Band tổng cần quy tắc tổng hợp và đầu vào kết quả từ phần đề thi. |
| Vừa | Điều hướng và nội dung trang chủ | Nối thẻ bài mẫu nổi bật với bài công bố và đúng ID. Đối chiếu **Xem thêm** của bài mẫu/từ vựng và đích **Liên hệ** ở chân trang. Khối từ vựng giới thiệu dùng nội dung tĩnh. |
| Vừa | Mẫu email HTML | Mẫu mã bảo mật và mẫu mời đã có tệp. Tích hợp hiện gửi dạng văn bản. Muốn dùng mẫu đã chuẩn bị thì cần nối HTML hoặc mã mẫu và thử hiển thị trong hộp thư nhận. |

##### Đã có mã, còn cần nghiệm thu môi trường thật

- **Auth và email nhân sự.** Chạy đăng ký, xác minh, khôi phục/thiết lập mật khẩu và Google OAuth trên dev với callback, cookie và redirect đích. Thử gửi mã bảo mật, nhận lời mời, dùng lại/hết hạn mã hoặc link và đăng nhập đúng vai trò qua hộp thư thật.
- **Ảnh R2.** Bucket dev đã qua thao tác tệp thử. Cần thử từ trình biên tập đến đúng bucket từ vựng, gồm ảnh bìa, ảnh máy, ảnh Pixabay, thay ảnh giữa nháp và bản công bố. API dọn ảnh từ vựng đã có, còn thiếu lịch chạy tự động. Thử ảnh hồ sơ nhân sự trên kho thật cùng đợt.
- **Thông báo hẹn giờ.** Tác vụ backend và lệnh chạy riêng đã có. Thử lịch trên môi trường chạy thật, kể cả lúc ứng dụng ngủ hoặc khởi động lại.
- **Thu hồi quyền nhiều tiến trình.** API đọc trạng thái mới nhận thay đổi ngay. API dùng cache có thể giữ trạng thái cũ tối đa 60 giây theo D11. Chỉ cần thay quy tắc nếu yêu cầu phát hành đòi thu hồi tức thì ở mọi API.
- **CI.** Repo có các bài kiểm thử. Chưa thấy workflow GitHub Actions. Nếu đưa vào CI, dùng danh sách test cô lập và cấu hình môi trường riêng.

#### Bước tiếp theo

1. Xử lý gửi lại email xác minh và nội dung mẫu ở hộp thư Người học/Giáo viên.
2. Chốt hợp đồng nhận bài W/S đã hoàn thành với người phụ trách đề thi. Triển khai cấp lượt/yêu cầu, phân công, chấm/công bố, thu hồi quyền rồi nối sự kiện thông báo.
3. Nghiệm thu Auth, R2, Storage bài mẫu và lịch thông báo trên dev trước khi xác nhận trên bản chính.

#### Tài liệu và cách tái hiện

- [TASKS](../TASKS.md) · [Quy tắc nghiệp vụ](../BUSINESS_RULES.md) · [Quyết định D11](../DECISIONS.md)
- [Kiểm thử đợt 1–5 và media bài mẫu](#kiem-thu-dot-1-5-csdl-bai-mau) · [Kiểm thử hồ sơ ba vai trò](#ho-so-ca-nhan-ba-vai-tro)
- [Màn xác minh](../../frontend/src/pages/auth/CheckEmail.tsx) · [Màn bài của tôi](../../frontend/src/pages/results/MyWS.tsx) · [Màn chấm](../../frontend/src/pages/grading/TeacherGrade.tsx) · [Theo dõi chấm](../../frontend/src/pages/admin/grading/AdminGrading.tsx) · [Thông báo](../../frontend/src/pages/notifications/Notifications.tsx)

<a id="xac-minh-email-media-bai-mau-trang-chu"></a>

### Tiến độ xác minh email, media bài mẫu và trang chủ ngày 20/11/2026

#### Phạm vi và trạng thái

Đã sửa luồng gửi lại email xác minh, nối các mục trang chủ dùng được độc lập với đề thi và thêm lệnh bảo trì media bài mẫu. Bản sửa đã build và chạy local. Bố cục của màn xác minh, trang chủ và thẻ bài mẫu được tái sử dụng.

#### Công việc đã thực hiện

- Trang **Kiểm tra email** tại `/#CheckEmail` từng gán cứng `minhanh@email.com`. Sau đăng ký hoặc khi Auth trả email chưa xác minh, trang đọc email vừa nhập từ phiên tab. Các mốc chờ gửi lại giữ được sau F5 và email không nằm trong địa chỉ trang. Mở trực tiếp khi thiếu email sẽ thấy hướng dẫn quay lại đăng nhập hoặc đăng ký.
- **Gửi lại email xác minh** gọi `POST /api/auth/resend-verification` và luồng signup của Supabase Auth. API xác thực Origin, chuẩn hóa email, giới hạn tần suất và trả thông báo trung tính khi tiếp nhận. UI hiển thị trạng thái bận, lỗi và thời gian chờ. [Supabase Auth resend](https://supabase.com/docs/reference/javascript/auth-resend)
- Thẻ **Bài mẫu** ở trang công khai và trang Người học lấy tối đa bốn bài đã công bố, dẫn theo đúng ID Writing/Speaking và dùng ảnh đã lưu nếu có. **Xem thêm** mở đúng Thư viện bài mẫu hoặc Từ vựng. **Liên hệ** dẫn tới luồng hỗ trợ hiện có, qua đăng nhập đối với khách. Câu động lực tự đổi theo mốc 5 phút và giữ nguyên khi F5 trong cùng khoảng.
- Lệnh bảo trì kiểm tra ảnh bìa, ảnh đề và audio còn tham chiếu từ nháp hoặc snapshot đã công bố, kể cả bài ẩn. Với tệp được ứng dụng ghi nhận và đã tải ít nhất bảy ngày, lệnh khóa bài khi kiểm tra, đánh dấu `DELETING`, gọi Storage rồi mới dọn bản ghi. Khi Storage lỗi, bản ghi còn để thử lại. Lượt tải mới ghi nhận metadata trước khi gọi Storage để có thể tìm lại cả lượt tải có kết quả chưa rõ. Mỗi lần xử lý tối đa 100 tệp. [Supabase Storage remove](https://supabase.com/docs/reference/javascript/storage-from-remove)

#### Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build và test | Local | Build frontend/backend đạt. 7/7 ca backend và 5/5 ca frontend đã chọn đạt. |
| Đăng ký, đăng nhập chưa xác minh và gửi lại | Edge local, API thử | Mở đúng địa chỉ email, mở trực tiếp thiếu email có hướng dẫn, gửi lại qua API, có lỗi/thử lại và giữ chờ sau F5. |
| Trang chủ | Edge local, API thử | Cả hai trang mở đúng bài mẫu theo ID. Câu động lực giữ khi F5 trong cùng khoảng và đổi đúng hai mốc 5 phút liên tiếp. Khách bấm Liên hệ, đăng nhập rồi đến phần hỗ trợ. |
| Dọn media | PostgreSQL cô lập và Storage mô phỏng | Chế độ xem trước chỉ đếm. Giữ tệp mới, nháp, bản công bố và bài ẩn. Tệp mất tham chiếu giữ trạng thái khi Storage lỗi và được dọn khi chạy lại. |
| Tải và phát media | Chromium, PostgreSQL cô lập và Storage mô phỏng | Lưu nháp, nhập Excel, công bố/ẩn/hiện, tải ảnh bìa và ảnh đề, phát audio Speaking đều đạt. |
| Kiểm kê bucket | Truy vấn chỉ đọc trên Supabase | Dev thiếu bucket riêng tư và schema media bài mẫu. Dự án chính có bucket riêng tư và 0 đối tượng, 0 bản ghi media tại lúc đối chiếu. |

#### Phần còn mở

- Chưa thử thư gửi lại đến hộp thư thật. Kiểm thử local đã xác nhận yêu cầu gửi đến lớp Supabase Auth mô phỏng.
- Chưa nghiệm thu tải và phát media bằng Storage thật trên dev. Môi trường thử cần có schema bài mẫu, bucket riêng tư `sample-assets` và kết nối backend dev.

#### Bước tiếp theo

1. Với backend trỏ dev, chạy `npm run build` rồi `npm run samples:cleanup-media` để xem số tệp đủ điều kiện trong lô. Khi đã đối chiếu kết quả, dùng `npm run samples:cleanup-media -- --apply` để dọn và chạy lại khi có lỗi.
2. Đối chiếu baseline dev với [SQL 11](../csdl/11_sample_answers_drafts.sql), [SQL 12](../csdl/12_sample_media_assets.sql) và [SQL 13](../csdl/13_sample_import_receipts.sql). Tạo bucket riêng tư bằng Storage khi cấu hình dev và nghiệm thu bằng bài thử. Lệnh bảo trì dùng schema hiện có.

#### Tài liệu và cách tái hiện

- [Hợp đồng Auth](../API.md) · [Kiểm thử gửi lại](../../backend/tests/auth.test.mjs) · [Kiểm thử media](../../backend/tests/samples.integration.mjs)
- [Lệnh dọn media](../../backend/src/jobs/run-sample-media-cleanup.ts) · [Rà soát ban đầu](#ra-soat-web-ngoai-de-thi)
