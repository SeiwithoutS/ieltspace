# Tiến độ rà soát task người học và quản lý ngày 20/11/2026

## Phạm vi và trạng thái

Rà soát chỉ đọc mã nguồn và tài liệu để lập danh sách công việc còn lại ngoài nghiệp vụ đề thi. Đối tượng: Người học, Giáo viên ở khía cạnh tài khoản, Quản lý. Không sửa mã ứng dụng, cơ sở dữ liệu, vai trò hay trạng thái tài khoản thật.

Loại khỏi danh sách: bộ đề, biên tập/nhập đề, làm bài, lưu nháp bài thi, tính điểm, gửi/chấm bài, phân công giáo viên, lượt chấm và hoàn bonus. Giữ phần đọc/hiển thị band trên hồ sơ và dashboard theo yêu cầu người dùng; nguồn band từ kết quả thi là phụ thuộc bên ngoài phạm vi này.

Đã đọc bàn giao 07/11, PRD, RULES, TASKS, BUSINESS_RULES, ARCHITECTURE, DATABASE, API, DESIGN, DECISIONS, từ điển CSDL và các báo cáo mới đến 20/11; đối chiếu route đang mount và mã giao diện. Tài liệu cũ có mô tả đã lỗi thời, do đó ưu tiên mã hiện tại và bằng chứng tiến độ mới.

Các mã `RS-*` dưới đây chỉ dùng nhận diện đề xuất trong báo cáo rà soát này, chưa phải các task đã được thêm vào TASKS.md. P1: nền tảng nên làm trước; P2: nối chức năng và nghiệm thu tiếp theo; P3: phần hoàn thiện. Đây là thứ tự đề xuất, không phải ước lượng thời gian.

## Công việc đã thực hiện

### 1. Phân biệt phần đã có với phần còn thiếu

| Phần | Trạng thái quan sát được | Còn lại |
|---|---|---|
| Auth email, Google, recovery và refresh | Có API, middleware và client; đã có kiểm thử mô phỏng | AUTH-01/02 cần bằng chứng email/Google thật và cấu hình triển khai. CheckEmail gửi lại email chưa nối API. |
| Thông tin tài khoản trên menu | Đọc được phiên thật qua lib/auth/account.ts | Nội dung chính Profile/StaffProfile vẫn có tên/email mẫu và nút chỉnh sửa chưa thực hiện nghiệp vụ. |
| Từ vựng, công bố bộ, yêu thích và ghi chú | Đã có route ghi/đọc DB. Sao và ghi chú lấy user từ phiên, SQL chống trùng theo cặp người–từ | Không liệt kê VOC-01 thành việc làm mới toàn bộ. Tiếp tục nghiệm thu liên thiết bị và xử lý media. |
| Flashcard | Có thiết lập, ôn, tự đánh giá, hết giờ/dừng, lịch sử theo tài khoản và ôn lại | flashcard-history.ts ghi localStorage; chưa có API lưu phiên/thẻ, đồng bộ DB hay ghi hoạt động học. VOC-02 chưa hoàn tất toàn tuyến. |
| StudentLanding/StudentHome | Có giao diện, responsive và theme | Tên chào, mục tiêu, chuỗi ngày, số từ, band và biểu đồ còn giá trị cố định; chưa có API thống kê. |
| AdminUsers | Có tìm/lọc, tạo tài khoản mẫu, panel chi tiết đúng kiểu ảnh, khóa/mở khóa/xóa mẫu | BASE/LEARN/TEACH/LOGS là dữ liệu mẫu. Tạo/khóa/xóa chỉ setState. Chưa có API quản lý người dùng, chưa có đổi role tài khoản hiện có. |
| AdminHome | Có giao diện và bộ chọn khoảng ngày | Số liệu và mốc ngày còn mẫu; không có API thống kê quản trị. |
| Thông báo | Đọc danh sách mẫu theo vai trò, dấu đã đọc lưu localStorage | NOTIF-01 cần DB, API và dữ liệu sự kiện thật. |
| Báo cáo hỗ trợ | Người dùng gửi, quản lý lọc/phản hồi/đổi trạng thái trong UI | Dùng chung localStorage trên một trình duyệt; chưa có bảng/API hỗ trợ. |
| Bài mẫu | SAMPLE-01 đã có API, nháp/công bố và Storage; tiến độ 19/11 ghi kiểm tra Supabase | Không xếp toàn module vào TODO; còn dọn media không được tham chiếu và một số kiểm tra thực tế. |
| Theme sáng/tối | Có lưu trình duyệt, phù hợp DATABASE/DESIGN hiện hành | Không coi đồng bộ theme lên tài khoản là yêu cầu MVP đã có. |

### 2. Backlog cho người học

| Mã rà soát | Ưu tiên | Công việc và tiêu chí hoàn thành | Liên hệ hiện có |
|---|---|---|---|
| RS-L01 | P1 | Hồ sơ thật: Profile/StaffProfile đọc đúng tên, email, avatar và vai trò từ hồ sơ. Cho sửa tên hiển thị, lưu DB và cập nhật menu; F5/thiết bị khác vẫn đúng. API chỉ cho sửa trường được phép của chính mình. | PRD, users, Profile.tsx, StaffProfile.tsx |
| RS-L02 | P2 | Ảnh đại diện: tải/thay/gỡ, kiểm tra loại và kích thước theo UI, lưu Storage và avatar_url; thay ảnh xử lý tệp cũ và lỗi tải. | users.avatar_url; nút Đổi ảnh hiện chưa nối |
| RS-L03 | P1 | Đổi mật khẩu trong hồ sơ: form và API thực, xác thực lại khi cần, xử lý tài khoản Google, lỗi nonce và trạng thái thu hồi phiên. Recovery hiện có không thay cho chức năng này. | Tiến độ Auth 07/11, Profile/StaffProfile |
| RS-L04 | P1 | Mục tiêu: lưu overall_target, mục tiêu bốn kỹ năng và daily_session_target; band 0–9 bước 0.5, overall nhập riêng. Mỗi lần đổi tạo mốc effective_from, không ghi đè lịch sử. Hồ sơ, landing và dashboard dùng chung dữ liệu. | GOAL-01, study_goals |
| RS-L05 | P1 | Flashcard đồng bộ DB: lưu phiên, tập thẻ, thứ tự, mức Đã nhớ/Chưa nhớ, thời gian và kết thúc/dừng/hết giờ. Người dùng chỉ đọc/ghi phiên của mình; retry không nhân đôi phiên hay thẻ. | VOC-02, flashcard_sessions, flashcard_session_items |
| RS-L06 | P2 | Lịch sử và thống kê Flashcard: đọc từ máy chủ, lọc/mở phiên/ôn lại; tập từ chưa nhớ theo đánh giá mới nhất, thống kê số phiên và số từ khác nhau rõ ràng. Cùng tài khoản ở hai thiết bị đọc được kết quả nhất quán. | VOC-02, flashcard-history.ts, Flashcard.tsx |
| RS-L07 | P1 | Hoạt động học và streak học: backend xác định phiên hợp lệ khi ôn hết tập chọn hoặc đạt ngưỡng số thẻ khác nhau (mặc định 10); xem lặp một thẻ không tăng số từ khác nhau. Ghi một learning_activity cho một nguồn, quy ngày Việt Nam và tính chuỗi ngày liên tiếp. Mở trang/đăng nhập/xem thông điệp không tự tạo hoạt động học. | STAT-01, BR-ACTIVITY-001, learning_activities |
| RS-L08 | P2 | Landing/dashboard thật: tên chào, mục tiêu hôm nay, tiến độ phiên, chuỗi ngày, từ đã ôn và lịch sử Flashcard lấy đúng dữ liệu người học. Có đang tải/rỗng/lỗi; không dùng số mẫu cho tài khoản mới. | StudentLanding.tsx, StudentHome.tsx, STAT-01/GOAL-01 |
| RS-L09 | P2, có phụ thuộc | Band trên dashboard: đọc lịch sử band có thật và mục tiêu từ đúng nguồn, phân biệt band tổng/kỹ năng với độ chính xác bài luyện và tự đánh giá Flashcard. Chưa có kết quả hiển thị trạng thái rỗng. Phần sinh điểm/kết quả không triển khai trong đợt này. Không tự thêm trường band hiện tại để người học sửa như điểm đã thi. | STAT-01, study_goals, skill_attempts.band_score |
| RS-L10 | P3 | Thông điệp hằng ngày: chuyển câu cố định sang tài nguyên thông điệp, chọn ổn định theo ngày; F5 không đổi tùy tiện và mở thông điệp không tăng streak. Không tạo bảng daily_motivations. | GOAL-01, D07, StudentLanding.tsx |

### 3. Backlog quản lý người dùng và quản trị

| Mã rà soát | Ưu tiên | Công việc và tiêu chí hoàn thành | Liên hệ hiện có |
|---|---|---|---|
| RS-A01 | P1 | Danh sách tài khoản thật: API ADMIN, tìm tên/email, lọc role/trạng thái, phân trang và bộ đếm từ DB. Ánh xạ frontend manager với backend ADMIN thống nhất; không dùng danh sách BASE. | AdminUsers.tsx; users |
| RS-A02 | P1 | Panel Chi tiết người dùng theo ảnh: tên/email/avatar/role/status; ngày tạo, nguồn email/Google/quản lý mời, trạng thái xác minh email, đăng nhập gần nhất, lịch sử đăng nhập và thao tác tài khoản. Lấy trạng thái xác minh từ Auth, không suy từ trạng thái khóa tài khoản. Thông tin học có thể nối flashcard/streak/mục tiêu. | AdminUsers.describeSelection, ảnh người dùng gửi |
| RS-A03 | P1 | Phân/chuyển role: UI và API cho tài khoản hiện có; quyền quyết định tại server, kiểm tra role hợp lệ, ghi người đổi và giá trị trước/sau, làm mất hiệu lực cache quyền cũ. Tự đăng ký vẫn chỉ LEARNER. | BR-AUTH-001, requireRole, invalidateUserCache |
| RS-A04 | P1 | Khóa/mở khóa thật: ghi trạng thái DB, lý do và audit; tài khoản bị khóa bị chặn cả API trực tiếp và refresh. Xử lý cache hồ sơ 60 giây theo D11, kiểm thử phiên đang mở. Mở khóa không tự khôi phục vai trò khác. | BR-AUTH-001, auth.ts, D11 |
| RS-A05 | P1 | Xóa tài khoản: thực thi chính sách xóa có deleted_at, xử lý liên kết Auth, chặn đăng nhập/refresh và dọn dữ liệu cá nhân/tệp theo chính sách; giữ phần lịch sử/audit cần thiết. Không chỉ đổi nhãn trong UI. Việc đang có bài được giao/yêu cầu chấm phải phối hợp với module phụ thuộc trước khi nghiệm thu xóa toàn tuyến. | BR-AUTH-002, users.deleted_at; không mở rộng sang task chấm bài |
| RS-A06 | P2 | Tạo/mời tài khoản nhân sự: backend tạo/liên kết đúng Auth và public.users, mời đặt mật khẩu thật, xử lý email trùng, gửi lỗi/thử lại và trạng thái chưa nhận lời. Không nhận thành công chỉ vì thêm hàng vào state. | Form tạo teacher/manager trong AdminUsers |
| RS-A07 | P1 | Nhật ký đăng nhập và tài khoản: ghi đăng nhập thành công email/Google, thời điểm gần nhất và nguồn; API chỉ quản lý xem lịch sử phù hợp. Phân biệt lần đăng nhập với F5/refresh. Ghi audit đổi role/khóa/mở/xóa/mời; không ghi token/mật khẩu. Chốt thời gian lưu và dữ liệu tối thiểu. | Điểm mở Nhật ký đăng nhập trong DECISIONS; LOGS hiện là mẫu |
| RS-A08 | P2 | Dashboard admin: thống kê thật về tài khoản mới/hoạt động/khóa, hoạt động Flashcard và hỗ trợ theo khoảng ngày; dùng ngày thực thay TODAY=23/10/2026. Mỗi chỉ số có định nghĩa và dữ liệu nguồn, không tự dùng số liệu bài thi/chấm trong phạm vi này. | AdminHome.tsx, modules/statistics |
| RS-A09 | P1 | Quy tắc bảo vệ thao tác tài khoản: xác định quyền sửa/xóa admin, trường hợp tự hạ quyền/tự khóa và admin hoạt động cuối cùng; xử lý thay đổi đồng thời, xác nhận hành động và audit. Đây là đề xuất kỹ thuật cần cụ thể hóa khi làm RS-A03..06, chưa có BR chi tiết được duyệt. | requireRole; canAct hiện chặn mọi manager chỉ ở UI |

Trong ảnh có Bài đã hoàn thành, Bonus chấm còn lại và Yêu cầu chấm chưa có kết quả. Ba chỉ số này thuộc phần thi/chấm nên không tạo task triển khai ở đây. Khi làm panel, để trạng thái chưa có dữ liệu hoặc nối sau; không thay bằng số mẫu. Quyền chấm W/S và tải giáo viên cũng thuộc phạm vi đã loại.

### 4. Các phần dùng chung còn lại

| Mã rà soát | Ưu tiên | Công việc và tiêu chí hoàn thành | Liên hệ hiện có |
|---|---|---|---|
| RS-C01 | P2 | Thông báo thật: lưu notifications, API danh sách/số chưa đọc/đánh dấu đã đọc, kiểm tra người nhận, chống trùng theo event_key và đồng bộ thiết bị. Trong đợt này nối các sự kiện tài khoản/hỗ trợ khi được xác định; sự kiện chấm nối sau. | NOTIF-01; seed JSON và localStorage hiện tại |
| RS-C02 | P2 | Hỗ trợ/báo lỗi: bổ sung thiết kế bảng/API, người dùng gửi/xem phiếu của mình; quản lý tiếp nhận/đổi trạng thái/phản hồi. Lưu lịch sử và thông báo, không phụ thuộc chung trình duyệt. | Support.tsx, AdminReports.tsx; chưa thấy bảng chuyên biệt trong từ điển |
| RS-C03 | P2 | Media từ vựng: nối upload ảnh từ máy, ảnh cần lưu lâu dài và ảnh bìa lên Storage; lưu metadata nguồn và dọn tệp thừa. Lưu nháp/công bố/mở lại không mất ảnh. Hiện editor từ chối lưu data URL, yêu cầu URL HTTPS. | AdminVocabulary.tsx, vocabulary.routes.ts, KIEN_TRUC_TU_VUNG.md |
| RS-C04 | P1 | Hoàn thiện và nghiệm thu Auth: AUTH-01/02 với email/Google thật, recovery hết hạn/dùng lại, F5/logout và tài khoản khóa. CheckEmail nhận đúng email và gọi API gửi lại có giới hạn; xử lý link recovery mới khi trang đang mở. | AUTH-01/02; tiến độ 20/11 |
| RS-C05 | P1/P2 theo module | CSDL/API/quyền và kiểm tra toàn tuyến: kiểm kê các bảng người dùng/mục tiêu/flashcard/hoạt động/thông báo cần dùng trên môi trường đích; migration tăng dần, ràng buộc chống trùng và quyền theo bản ghi. Thử hai tài khoản/hai thiết bị, ranh giới 00:00 Việt Nam, request lặp/đồng thời, theme và responsive. Kiểm thử redirect/HTTPS/cookie trên triển khai. | DB-01 theo phạm vi module, RULES; không coi thiếu model Prisma là thiếu bảng DB |
| RS-C06 | P3 | Dọn media bài mẫu không còn tham chiếu và nghiệm thu Storage/UI thật cho phần còn mở. Đây là bảo trì bài mẫu độc lập, không phải nhập/biên tập đề thi. | SAMPLE-01 phần còn mở, tiến độ 19/11 |

### 5. Yêu cầu mới hoặc quyết định cần ghi rõ

- **Streak đăng nhập:** người dùng nhắc trực tiếp trong yêu cầu rà soát. Quy tắc hiện tại chỉ có streak học. Nếu triển khai chuỗi đăng nhập thì bổ sung task riêng dựa trên ngày đăng nhập thực, thống nhất email/Google và cách xử lý phiên giữ đăng nhập; không thay ngầm BR-ACTIVITY-001. RS-A07 cung cấp nhật ký, còn chuỗi đăng nhập là kết quả tổng hợp riêng. Chưa thay đổi BR trong đợt rà soát.
- **Band:** mục tiêu đã có mô hình; band kết quả phải đọc kết quả hợp lệ. Nếu muốn nhập band đầu vào do người học tự khai thì cần đặc tả riêng, không trộn với điểm thi được hệ thống tính.
- **Đổi role và xóa:** người dùng yêu cầu rõ, cần có task ngoài USER-01. USER-01 trong backlog hiện chỉ nói thu hồi quyền chấm, không bao phủ quản lý tài khoản nói chung. Các quy tắc admin cuối cùng/tự khóa ở RS-A09 là đề xuất cần chốt khi triển khai.
- **Nhật ký đăng nhập:** nhu cầu hiển thị đã được người dùng nêu qua ảnh; thời gian giữ và dữ liệu tối thiểu vẫn chưa có quyết định cụ thể. Không mặc định thu IP/thiết bị nếu chưa cần cho màn hình.
- **Giới hạn xóa toàn tuyến:** phần quản lý tài khoản có thể làm trước, nhưng xử lý dữ liệu đang được module chấm sử dụng phải tuân BR-AUTH-002 khi nghiệm thu đầy đủ.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Đọc tài liệu và các báo cáo đến 20/11 | Repository local | Phát hiện bàn giao/một số đoạn ARCHITECTURE/API còn nói chỉ có Auth hoặc từ vựng chỉ local; không dùng các đoạn đó để kết luận trạng thái mới nhất. |
| Kiểm kê backend/src/app.ts, routes.ts, modules | Repository local | Đã có Auth, exams, vocabulary và samples; chưa thấy route triển khai users/profile/goals/flashcard/statistics/notifications/reports. Không truy vấn DB thật trong lần này. |
| Đọc Profile/StaffProfile/StudentLanding/StudentHome/AdminHome/AdminUsers | Repository local | Xác nhận dữ liệu cố định, thao tác setState và thiếu lời gọi API ở các luồng liệt kê. Menu tài khoản có đọc phiên thật. |
| Đọc flashcard-history.ts, notifications.ts và Support.tsx | Repository local | Xác nhận lịch sử Flashcard và dấu đọc thông báo lưu theo tài khoản trên trình duyệt; hỗ trợ lưu localStorage. |
| Đọc route vocabulary và client/editor | Repository local | Xác nhận sao/ghi chú có SQL theo user phiên; ảnh data URL bị chặn khi lưu. Không kết luận toàn bộ từ vựng còn là prototype. |
| Mở link Claude artifact | Công cụ đọc web | Không lấy được nội dung (DisabledError). Đối chiếu ảnh đính kèm và panel hiện có trong code. docs/ui/canvas được DESIGN dẫn nhưng không có ở checkout này. |
| Liên kết tài liệu trong báo cáo và định dạng thay đổi | PowerShell, Git local | Tất cả liên kết tương đối trong báo cáo trỏ đến tệp tồn tại; git diff --check không báo lỗi ở các thay đổi được theo dõi. Báo cáo mới là tệp chưa được commit. |
| Build/test ứng dụng | Không chạy trong đợt này | Chỉ thêm Markdown, không thay mã. Các kết quả build/test từ báo cáo cũ chỉ là bằng chứng của đợt cũ. |

## Phần còn mở

- Báo cáo là kiểm kê mã/tài liệu, không phải nghiệm thu runtime hoặc xác nhận dữ liệu đang có trên Supabase.
- Cần chuyển các nhóm được chọn thành task chính thức có hợp đồng API và ca nghiệm thu; chưa sửa TASKS.md hoặc ghi các đề xuất thành yêu cầu đã duyệt.
- Chưa xem được toàn bộ artifact bên ngoài; ảnh đính kèm đủ để đối chiếu panel chi tiết người dùng được yêu cầu.

## Bước tiếp theo

1. Làm nền tài khoản: RS-L01/L03, RS-A01..05/A07 và quy tắc RS-A09, kết hợp kiểm kê DB/API của RS-C05.
2. Lưu mục tiêu, phiên Flashcard và hoạt động học: RS-L04..07; sau đó nối dashboard RS-L08. Phần đọc band RS-L09 dùng dữ liệu kết quả khi nguồn đã sẵn sàng.
3. Tích hợp mời nhân sự, chi tiết người dùng đầy đủ, dashboard quản lý, thông báo và hỗ trợ; hoàn thiện Storage từ vựng và Auth thật.
4. Nghiệm thu theo tài khoản, thiết bị, múi giờ và môi trường triển khai; cuối cùng làm thông điệp và dọn media.

## Tài liệu và cách tái hiện

- [Task hiện hành](../TASKS.md), [PRD](../PRD.md), [quy tắc nghiệp vụ](../BUSINESS_RULES.md), [quyết định](../DECISIONS.md).
- [Tiến độ 20/11](2026-11-20-tong-ket.md), [tiến độ 19/11](2026-11-19-tong-ket.md), [API](../API.md), [từ điển CSDL](../csdl/CSDL.md).
- [Router nghiệp vụ](../../backend/src/routes.ts), [khởi tạo Express](../../backend/src/app.ts), [Auth middleware và cache](../../backend/src/middleware/auth.ts).
- [Quản lý người dùng](../../frontend/src/pages/admin/users/AdminUsers.tsx), [hồ sơ](../../frontend/src/pages/account/Profile.tsx), [dashboard người học](../../frontend/src/pages/learner/StudentHome.tsx), [landing](../../frontend/src/pages/learner/StudentLanding.tsx), [dashboard quản lý](../../frontend/src/pages/admin/dashboard/AdminHome.tsx).
- [Lịch sử Flashcard](../../frontend/src/lib/vocabulary/flashcard-history.ts), [thông báo](../../frontend/src/lib/notifications/notifications.ts), [hỗ trợ](../../frontend/src/components/reports/Support.tsx).
