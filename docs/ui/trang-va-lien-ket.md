# Các trang giao diện IELTSpace và liên kết giữa chúng

Tài liệu này mô tả từng màn trong canvas "IELTSpace · Giao diện" (bản 236, 08/11/2026, đã đồng bộ theo `DESIGN.md`) và cách các màn nối với nhau. Mã nguồn từng màn nằm ở `docs/ui/canvas/<Tên>.dc.html`; vị trí và kích thước trên canvas ở `docs/ui/canvas/canvas.json`. Tên màn trùng tên trang trong `frontend/src/app/pages.ts` (bỏ đuôi `.dc.html`).

Canvas live https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V thắng bản sao này khi hai bản khác nhau.

> File `.dc.html` cần `support.js` của canvas để hiển thị, mà `support.js` không nằm trong repo. Muốn xem giao diện thì mở canvas live; các file ở đây dùng để đọc cấu trúc, giá trị style và link.

## 1. Cách đọc canvas

- Canvas xếp theo vai trò, từ trên xuống: **Khách và xác thực → Người học → Giáo viên → Quản lý**. Mỗi nghiệp vụ là một hàng có nhãn "Vai trò · Nghiệp vụ". Trong một hàng, các màn xếp theo thứ tự người dùng đi qua.
- Link giữa màn là `href="TenMan.dc.html"`. Trong code React, `App.tsx` chặn các link này và đổi thành route hash `#TenMan`.
- Phân quyền theo tiền tố tên trang: `Admin*`/`Question*` chỉ Quản lý, `Teacher*` chỉ Giáo viên. Trang công khai: Main, Login, Register, ForgotPassword, CheckEmail, ResetPassword.
- Dữ liệu truyền giữa màn dùng `sessionStorage`, dạng `{at, v}`, chỉ nhận nếu dưới 20 giây: `ieltspace-set` (bộ đề), `ieltspace-sample` (bài mẫu), `ieltspace-editor-import` (mở editor kèm hộp nhập xlsx), `ieltspace-learner` (trạng thái người học ở Chi tiết bộ đề). `localStorage 'ieltspace-admin-nav'` nhớ sidebar Quản lý thu gọn.
- Cột "Tweaks" ghi các thuộc tính chỉnh được trên canvas để xem biến thể (ví dụ `trangThai`, `mau`, `vaiTro`). Chúng chỉ phục vụ xem mẫu, không phải tính năng.

## 2. Bản đồ tổng quát

```text
KHÁCH                         NGƯỜI HỌC                                   GIÁO VIÊN              QUẢN LÝ
Main ──Đăng nhập──► Login ─┬► StudentLanding ─┬► FullTests ─► ExamDetail ─► ListeningTest ─┐
  │                        │   (+ StudentHome)│   PracticeLibrary ─► ReadingTest           │
  └─Đăng ký──► Register ───┘                  │   PracticeWS ─► WritingTest/SpeakingTest ──┤
                                              │                                            ▼
Login ─► ForgotPassword ─► ResetPassword      │                  SubmitDialogs ─► ResultLR / MyWS ─► ResultWS
CheckEmail ◄─ AuthError                       │   SampleLibrary ─► SampleWriting / SampleSpeaking
                                              │   Vocab ◄─► Flashcard ;  Profile ;  Notifications
                                              ▼
                                  MyWS ──(gửi yêu cầu chấm)──► TeacherQueue ─► TeacherGrade ─► TeacherHome/History
                                                                                  │ công bố ─► Notifications ─► ResultWS
Login (admin) ─► AdminHome ─► AdminUsers / AdminGrading / AdminExams ─► AdminExamSet ─► editor R/L/W/S
                              AdminSamples ─► AdminSampleWriting / AdminSampleSpeaking  (xem như người học: SampleWriting/Speaking)
```

Tài khoản demo ở Login (mật khẩu từ 8 ký tự): `minhanh@email.com` vào StudentLanding, `lanhuong@ieltspace.vn` vào TeacherHome, `admin@ieltspace.vn` vào AdminHome, `moi@email.com` báo chưa xác minh email, `khoa@email.com` báo tài khoản bị khóa, email khác báo sai.

## 3. Thanh điều hướng dùng chung

**Người học** (nằm sẵn trong mỗi trang người học, `AvatarMenu` là bảng mẫu các trạng thái menu):
- Logo "IS IELTSpace" → StudentLanding.
- **Thư viện đề**: IELTS Full Tests → FullTests; Listening Practice, Reading Practice → PracticeLibrary (đổi tab bằng Tweaks `trang`); Writing Practice, Speaking Practice → PracticeWS.
- **Thư viện bài mẫu**: mục chính → SampleLibrary; Writing Task 1 Academic/General và Task 2 → PracticeLibrary (kho bài mẫu); Speaking Part 1, 2, 3 → SampleSpeaking.
- **Thư viện từ vựng** → Vocab. **Flashcard của tôi** → Flashcard.
- Chuông có chấm đỏ số chưa đọc → Notifications. Avatar → menu: Dashboard tiến độ (StudentHome), Bài Writing/Speaking của tôi (MyWS), Từ vựng đã lưu, Thông báo, Hồ sơ cá nhân (Profile), Đăng xuất.

**Giáo viên**: Tổng quan (TeacherHome), Hàng chờ chấm (TeacherQueue), Lịch sử chấm (TeacherHistory), Thông báo, Hồ sơ cá nhân (StaffProfile), Đăng xuất (về Main).

**Quản lý**: component `AdminSidebar` (rộng 248, thu gọn 76) gồm Tổng quan, Người dùng, Bộ đề và đề thi, Quản lý bài mẫu, Theo dõi chấm bài, Thông báo, Hồ sơ cá nhân; component `AdminTopbar` có breadcrumb, chuông, avatar mở menu (Hồ sơ cá nhân, Giao diện Sáng/Tối, Đăng xuất về Main). 14 trang Admin* nhúng `AdminTopbar` bằng `<dc-import>`.

## 4. Khách và xác thực

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **Main** | Trang chủ cho Khách. Hero "Mỗi ngày một đề, band tăng từng bước", Bộ đề mới nhất, Luyện Reading, Luyện Listening, Từ vựng mới, Bài mẫu, Câu hỏi thường gặp, CTA "Bắt đầu với một đề Reading 60 phút". Khách xem được thư viện nhưng làm bài cần đăng nhập. | Đăng ký → Register; Đăng nhập → Login; menu như thanh người học (FullTests, PracticeLibrary, PracticeWS, SampleLibrary, SampleSpeaking, Vocab) |
| **Login** | Trang flow hai nửa: trái `AuthHero` (gradient, 3 lợi ích), phải `LoginForm`. Bấm "Đăng ký miễn phí" đổi sang `RegisterForm` ngay tại trang, không đổi route. Tweaks `start`, `previewError` xem sẵn các lỗi. | Về trang chủ → Main; đăng nhập đúng → trang theo vai trò (xem mục 2) |
| **Register** | Cùng flow với Login nhưng mở sẵn form tạo tài khoản. | Về trang chủ → Main; tạo xong → StudentLanding |
| **LoginForm** (component) | Email, mật khẩu, nút "Đăng nhập bằng Google", "Quên mật khẩu?", dải "Dùng" để điền nhanh tài khoản demo. Lỗi hiện bằng `AuthError`. | Quên mật khẩu → ForgotPassword |
| **RegisterForm** (component) | Tạo tài khoản bằng email hoặc Google (tài khoản Google là Người học, bỏ qua xác minh email). | Đăng nhập → quay về LoginForm |
| **AuthHero** (component) | Nửa trái: logo, tiêu đề "Luyện IELTS mỗi ngày, band tăng từng bước", ba gạch đầu dòng. | Logo → Main |
| **AuthError** (component) | Thông báo lỗi đỏ, 4 kiểu: sai email/mật khẩu, chưa xác minh, bị khóa, tùy ý. Kiểu "chưa xác minh" có link gửi lại. | gửi lại email xác minh → CheckEmail |
| **ForgotPassword** | Nhập email, bấm "Gửi liên kết đặt lại", hiện thông báo trung tính (không lộ email có tồn tại hay không). Có link bản demo sang bước đặt mật khẩu. | Mở trang đặt mật khẩu mới → ResetPassword; Quay lại đăng nhập → Login |
| **CheckEmail** | "Kiểm tra email để xác minh", đếm ngược 60 giây rồi mới cho gửi lại. | Đã xác minh → Login; Đổi email đăng ký → Register |
| **ResetPassword** | Đặt mật khẩu mới, nút "Cập nhật mật khẩu". | Quay lại đăng nhập → Login |

## 5. Người học

### 5.1 Trang chủ và thư viện đề

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **StudentLanding** | Trang chủ sau đăng nhập, "Học một chút, tiến xa hơn". Có khối "Bài làm gần đây" (Làm tiếp bài dở, Làm lại, Xem bài nộp), Bộ đề mới nhất, Luyện Reading/Listening, Từ vựng mới, Bài mẫu, khối "Động lực mỗi ngày" (UC32). | Xem bài test → ExamDetail; Xem bài nộp → MyWS; Xem bài mẫu → SampleWriting; menu chung |
| **StudentHome** | Dashboard tiến độ: "Kết quả luyện tập", "Lịch sử luyện đề", "Bài Writing và Speaking", Từ vựng đã lưu, mục tiêu band (Sửa). | Bài Writing/Speaking → MyWS; Từ vựng đã lưu → Vocab; Hồ sơ → Profile; Đăng xuất → Login |
| **FullTests** | "IELTS Full Tests": các bộ Mock Test, Practice Test Plus, Actual Test, mỗi bộ là thẻ bìa 3:2 kèm "Xem bài test", "Xem thêm". | Xem bài test → ExamDetail |
| **ExamDetail** | Chi tiết bộ đề kiểu DOL: tiêu đề bộ, lọc Academic/General, bảng "Danh sách bài test" với cột L/R/W/S (kỹ năng đang soạn hiện "Đang cập nhật", đã ẩn hiện "—"), "Làm bài", "Làm full test", "Chia sẻ", "Bộ đề cùng loại". Cũng là nơi Quản lý bấm nút mắt để xem như người học. | Làm bài/Làm full test → ListeningTest (bản mẫu); Xem tất cả → FullTests; bộ cùng loại → ExamDetail |
| **PracticeLibrary** | Một trang, nhiều chế độ chọn bằng Tweaks `trang`: Gợi ý cho bạn, Kho Listening Practice, Kho Reading Practice, Bài mẫu mới nhất, Kho bài mẫu Writing Task 1 General/Academic/Task 2. Mỗi dòng "Làm bài" hoặc "Xem bài mẫu". | Làm bài → ListeningTest/ReadingTest; Xem bài mẫu → SampleWriting |
| **PracticeWS** | "Luyện Writing và Speaking theo Task, Part": hai khối Writing (Task 1, Task 2) và Speaking (Part 1, 2, 3), mỗi thẻ "Luyện ngay". | Writing → WritingTest; Speaking → SpeakingTest |

### 5.2 Làm bài và nộp bài

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **ListeningTest** | Làm Listening: đồng hồ, trình phát một lần (đề đầy đủ), câu hỏi theo section, "Lưu và thoát", "Nộp bài". | Lưu và thoát → StudentHome; Nộp bài → SubmitDialogs; quay lại → ExamDetail |
| **ReadingTest** | Làm Reading "Urban green spaces": bài đọc bên trái, câu hỏi bên phải (dạng câu hỏi lấy từ `QuestionCard`), "Lưu và thoát", "Nộp bài". Bản mẫu hiện chưa có link nộp bài. | Không có href (xử lý bằng script khi code) |
| **WritingTest** | Làm Writing "Public transport and traffic": đề, ô viết, đếm từ, "Lưu và thoát", "Hoàn thành". Hoàn thành chỉ **lưu** bài (giữ 14 ngày), chưa vào hàng chờ chấm. | Hoàn thành/Lưu và thoát → SubmitDialogs, StudentLanding |
| **SpeakingTest** | Làm Speaking "Describe a skill you would like to learn": cue card Part 2, đếm giờ chuẩn bị/nói, ghi âm, "Nghe lại", "Ghi lại Part này", "Hoàn thành". Tweaks `cheDo`. | Hoàn thành/Lưu và thoát → SubmitDialogs, StudentLanding |
| **SubmitDialogs** | Gom các hộp thoại: xác nhận nộp bài ("Quay lại làm tiếp"/"Nộp bài"), hết giờ tự hoàn thành, lưu và thoát, hoàn thành W/S (Tải .docx, "Gửi yêu cầu chấm" tốn 1 lượt, Hủy, "Xác nhận gửi", "Đã hiểu"). | Nộp bài/Xem kết quả → ResultLR; Lưu và thoát → StudentLanding; Hoàn thành, Xác nhận gửi, Đã hiểu → MyWS |

### 5.3 Kết quả và bài đã làm

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **ResultLR** | "Kết quả Reading" của Practice Test 01: giờ nộp, thời gian làm, so sánh với lần làm trước (ví dụ điểm tăng 0.5), "Lời giải từng câu" (bạn chọn, đáp án đúng, giải thích). Band chỉ hiện cho đề đầy đủ. | Làm lại → ReadingTest; Về lịch sử → `ResultsHistory` (chưa có trên canvas); Luyện thêm dạng yếu → `QTPractice` (chưa có trên canvas) |
| **MyWS** | "Bài Writing và Speaking của tôi": danh sách bài với trạng thái (Đã lưu · chưa gửi chấm, Chờ phân công, Chờ chấm, Đã có kết quả, Đã hủy · đã hoàn bonus). Nút theo trạng thái: Gửi yêu cầu chấm, Gửi lại yêu cầu, Xem kết quả, Tải .docx, Nghe lại, Tải ghi âm. Hiển thị số lượt chấm còn lại. | Gửi yêu cầu/Gửi lại → SubmitDialogs; Xem kết quả → ResultWS; Luyện Writing, Speaking → PracticeWS |
| **ResultWS** | "Kết quả Writing Task 2": band từng tiêu chí, nhận xét của giáo viên, bài làm kèm chỉnh sửa. | Bài Writing và Speaking của tôi → MyWS; Tải .docx |

### 5.4 Bài mẫu, từ vựng, hồ sơ

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **SampleLibrary** | Bước 1 luồng bài mẫu: chọn bài theo Writing Task 1 General/Academic, Task 2, Speaking Part 1, 2, 3. Breadcrumb Trang chủ. | Writing → SampleWriting; Speaking → SampleSpeaking |
| **SampleWriting** | Bước 2a: breadcrumb (Trang chủ › Thư viện bài mẫu › Task › Dạng bài › Tiêu đề), thẻ chip, bốn mục Đề bài / Dàn ý / Bài mẫu (cụm quan trọng bôi vàng) / Phần dịch, mục lục dính bên phải có scrollspy và % đã đọc, nút luyện đề này. Tweaks `mau` chọn bài. | Breadcrumb → SampleLibrary; Luyện → PracticeWS |
| **SampleSpeaking** | Bước 2b: tương tự, có audio mẫu cho từng câu (Part 2 một audio) và nút phát. Tweaks `mau`. | Breadcrumb → SampleLibrary; Luyện → PracticeWS |
| **Vocab** | "Thư viện từ vựng": tìm kiếm, lưu từ, ghi chú (Lưu, Xóa ghi chú), nhãn. Khách xem được; lưu cần đăng nhập. | Ôn bằng flashcard → Flashcard |
| **Flashcard** | "Flashcard của tôi": chọn tập thẻ (theo Chủ đề, Từ yêu thích, Theo nhãn), lật thẻ, chấm Chưa nhớ / Còn phân vân / Đã nhớ, Đổi mục tiêu, Kết thúc phiên (phiên hợp lệ khi hết tập hoặc từ 10 thẻ khác nhau). | menu chung; Hồ sơ → Profile |
| **Profile** | "Hồ sơ và cài đặt" của Người học: đổi ảnh, chỉnh sửa thông tin, đổi mật khẩu, mục tiêu band (Lưu mục tiêu), Đăng xuất. | Đăng xuất → Main |
| **Notifications** | Thông báo theo vai trò (Tweaks `vaiTro`: Người học, Giáo viên, Quản lý), có chấm đỏ số chưa đọc, "Đánh dấu tất cả đã đọc". Chỉ trong hệ thống, không gửi email/push. Người học: "Mở bài Writing/Speaking" → MyWS. Giáo viên: "Mở bài trong hàng chờ" → TeacherGrade. Quản lý: "Xử lý trong Người dùng" → AdminUsers. | xem cột trái |

## 6. Giáo viên

Toàn bộ dùng thanh điều hướng Giáo viên (mục 3).

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **TeacherHome** | "Chào cô Lan Hương": bốn số (Chờ chấm, Có bản nháp chưa công bố, Đã công bố tuần này, Giới hạn nhận bài), danh sách "Tiếp tục công việc" (bài, người học, giờ phân công, đã chờ bao lâu), khối "Bài đến với bạn như thế nào" (người học gửi yêu cầu, hệ thống tự phân công, chấm và lưu nháp, công bố) và "Trạng thái nhận bài" kèm quyền chấm. | Xem hàng chờ → TeacherQueue; Mở bài → TeacherGrade |
| **TeacherQueue** | "Hàng chờ chấm": bài được tự phân công (ưu tiên giáo viên ít bài nhất, rồi lâu chưa nhận), lọc Writing/Speaking, hạn 72 giờ. | Chấm bài, Tiếp tục → TeacherGrade |
| **TeacherGrade** | Chấm Writing/Speaking: bài của người học bên trái, bốn tiêu chí IELTS và nhận xét bên phải. Lưu nháp được; công bố rồi thì khóa. | Lưu nháp → TeacherQueue; Công bố kết quả → TeacherHome |
| **TeacherHistory** | "Lịch sử chấm": các bài đã công bố, điểm và nhận xét đã gửi. | Xem, Xem điểm → TeacherGrade |
| **StaffProfile** | Hồ sơ cá nhân dùng chung Giáo viên và Quản lý (Tweaks `vaiTro`): đổi ảnh đại diện, tên hiển thị, email (không đổi được), đổi mật khẩu, chọn giao diện Sáng/Tối (lưu trên trình duyệt), Lưu thay đổi. Mỗi vai trò dùng thanh điều hướng riêng của mình (bản Quản lý còn là bản cũ, xem mục 9). | Menu theo vai trò |

## 7. Quản lý

### 7.1 Tổng quan, người dùng, chấm bài

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **AdminHome** | "Tổng quan hệ thống": chọn 7 ngày, 30 ngày hoặc khoảng tùy chọn (Date Picker, không chọn sau ngày hiện tại), thẻ số liệu (Người dùng theo vai trò, Bài hoàn thành, Yêu cầu chấm tiếp nhận, Bonus đã hoàn), luồng yêu cầu chấm (Chờ phân công, Đã phân công, Đã có kết quả, Đã hủy), biểu đồ theo nguyên nhân hủy, và "Việc cần xem" (yêu cầu sắp quá 72 giờ, giáo viên báo không thể hoàn thành, lô nhập đề xlsx có lỗi nên chưa lưu gì). | Theo dõi → AdminGrading; Xử lý → AdminUsers; Xem → AdminReadingEditor |
| **AdminUsers** | "Người dùng": lọc vai trò và trạng thái (Hoạt động, Bị khóa, Đã xóa), tìm kiếm, bấm dòng mở ngăn chi tiết (khóa/mở khóa, Xóa tài khoản; xóa khi chưa có dữ liệu, có dữ liệu thì khóa). "Tạo tài khoản" mở form Giáo viên/Quản lý và gửi email mời. Dưới cùng hai bảng "Hoạt động người học" và "Hoạt động giáo viên" (chỉ ghi lượt đăng nhập), cùng thao tác "Hủy thao tác" cho yêu cầu chấm của tài khoản bị xóa. | không có href đi |
| **AdminGrading** | "Theo dõi hỗ trợ chấm": bốn thẻ trạng thái (Chờ phân công, Đã phân công chờ chấm, Đã có kết quả, Đã hủy), bảng yêu cầu có lọc kỹ năng/trạng thái/giáo viên và cột "còn trước hạn 72 giờ", bảng "Tải công việc giáo viên" (quyền chấm, bài chưa chấm trên giới hạn, nhận bài mới). Giáo viên không thể hoàn thành thì Quản lý xác nhận hủy và hoàn bonus, không phân công lại. | Đến người dùng → AdminUsers |

### 7.2 Bộ đề và đề thi

Chuỗi thao tác: **AdminExams → AdminExamSet → editor từng kỹ năng**, và nút mắt hoặc Đăng mở ExamDetail để xem như người học.

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **AdminExams** | "Bộ đề và đề thi": danh sách bộ đề (bìa 7:10, chip số đề theo kỹ năng, trạng thái Bản nháp/Công khai/Đã ẩn), lọc, "Tạo bộ đề" (hộp thoại: tên, mô tả, ảnh; xong thì Đóng hoặc "Mở Thông tin bộ đề"). Xóa chỉ cho bộ chưa có lượt làm, có hộp xác nhận và Hoàn tác. | Mở → AdminExamSet |
| **AdminExamSet** | "Thông tin bộ đề": ảnh đại diện và tên, chip Academic/General/trạng thái, bốn ô đếm đề theo L/R/W/S, bảng Test × kỹ năng với chip Đã đăng/Đang soạn/Đã ẩn (Reading và Writing tách hai cột con Academic/GT), "Thêm đề", "Tạo" ở ô trống, "Nhập xlsx" ở ô Reading/Listening/Writing/Speaking, Đăng/Ẩn/Xóa bộ đề. Truyền dữ liệu qua `ieltspace-set`. | Ô kỹ năng → AdminReadingEditor/ListeningEditor/WritingEditor/SpeakingEditor; nút mắt → ExamDetail; về danh sách → AdminExams |
| **AdminReadingEditor** | Soạn đề Reading dạng split editor: bên trái bài đọc và đoạn, bên phải các nhóm câu hỏi theo 16 dạng (`QuestionCard`). Mở ở chế độ **Chỉ xem**, bấm "Chỉnh sửa" mới sửa (Hoàn tác, Hủy, Lưu, Đăng). "Nhập từ xlsx" kiểm tra tệp, xem trước, "Đổ vào đề". Tweaks `trangThai`, `moTab`, `loaiDe`. | không có href đi (quay lại bằng breadcrumb) |
| **AdminListeningEditor** | Soạn đề Listening: 4 section, ghi âm/tải audio, transcript có mốc giờ, Map Labelling. Cùng chế độ Chỉ xem, nhập xlsx. | như trên |
| **AdminWritingEditor** | Soạn đề Writing: hai tab Task 1 (20 phút, 150 từ, có ảnh biểu đồ) và Task 2 (40 phút, 250 từ); Academic/GT. | như trên |
| **AdminSpeakingEditor** | Soạn đề Speaking: ba tab Part; Part 1 và 3 là danh sách câu hỏi lẻ, Part 2 có cue card và thời gian chuẩn bị 1 phút, nói 2 phút. | như trên |
| **QuestionCards** | Bảng xem 16 dạng câu hỏi Reading, nhúng `QuestionCard` 16 lần. Dùng để đối chiếu khi code widget. | không có |
| **QuestionCard** (component) | Một thẻ câu hỏi có đủ chế độ soạn: chỗ trống, lựa chọn, ghép nối, bảng (Gộp ô, Tách ô, Ô tiêu đề), sơ đồ, danh sách từ, giới hạn từ, "Tạo lại", "Cách viết khác", "Thêm câu". | không có |

### 7.3 Bài mẫu

| Trang | Mô tả | Liên kết đi |
|---|---|---|
| **AdminSamples** | "Quản lý bài mẫu": ba ô tổng quan (tổng, Writing, Speaking), danh sách Writing nhóm theo Task 1 Academic, Task 1 General, Task 2; Speaking theo Part. "Thêm bài mẫu" hỏi kỹ năng rồi mở editor ở chế độ Chỉnh sửa (ngoại lệ duy nhất), "+ Nhập bài" theo nhóm. | Mở → AdminSampleWriting/AdminSampleSpeaking (qua `ieltspace-sample`) |
| **AdminSampleWriting** | Editor bài mẫu Writing: hai cột Soạn và Xem trước, mỗi cột cuộn riêng. Các ô: hình thức, Task, dạng bài, tiêu đề, chủ đề, nguồn, band, đề bài, dàn ý, bài mẫu (B/I, tiêu đề, gạch đầu dòng, **đậm** cụm quan trọng), phần dịch. Chế độ Chỉ xem mặc định. | Quản lý bài mẫu → AdminSamples; nút mắt → SampleWriting |
| **AdminSampleSpeaking** | Một editor cho Part 1, 2, 3: đề bài, dàn ý, bài mẫu, audio, nhiều câu hỏi (Thêm câu hỏi). | Quản lý bài mẫu → AdminSamples; nút mắt → SampleSpeaking |

### 7.4 Component dùng chung

- **AdminSidebar**: Tweaks `active`, `collapsed`; nút thu gọn cạnh logo, nhớ ở `localStorage 'ieltspace-admin-nav'`.
- **AdminTopbar**: Tweaks `crumb`, `menuOpen`, `userName`, `initials`, `email`, `role`; menu avatar có công tắc Sáng/Tối và Đăng xuất.

## 8. Chuỗi luồng quan trọng

1. **Luyện Reading/Listening (chấm tự động)**: StudentLanding → FullTests hoặc PracticeLibrary → ExamDetail → ListeningTest/ReadingTest → SubmitDialogs (xác nhận nộp) → ResultLR → StudentHome (lịch sử).
2. **Luyện Writing/Speaking (giáo viên chấm)**: PracticeWS → WritingTest/SpeakingTest → SubmitDialogs (Hoàn thành, chỉ lưu 14 ngày) → MyWS (Đã lưu · chưa gửi chấm) → SubmitDialogs (Gửi yêu cầu chấm, tốn 1 lượt) → Chờ phân công (tối đa 72 giờ) → TeacherQueue → TeacherGrade → công bố → Notifications → MyWS → ResultWS.
3. **Đăng ký tài khoản**: Main → Register → CheckEmail (xác minh) → Login → StudentLanding. Quên mật khẩu: Login → ForgotPassword → ResetPassword → Login.
4. **Tạo và đăng đề**: AdminExams (Tạo bộ đề) → AdminExamSet (Thêm đề) → editor từng kỹ năng (nhập tay hoặc xlsx) → Đăng → ExamDetail (người học thấy).
5. **Bài mẫu**: AdminSamples → editor bài mẫu → Đăng → SampleLibrary → SampleWriting/SampleSpeaking.

## 9. Điểm lệch cần biết khi code

- `Notifications` và `StaffProfile` còn thanh Quản lý cũ (inline) với mục "Bài mẫu và từ vựng" trỏ tới `AdminContent`, trang đã bị xóa. Khi code, dùng `AdminSidebar` mới: "Quản lý bài mẫu" → AdminSamples.
- `ResultLR` trỏ tới `ResultsHistory` và `QTPractice`, chưa có màn tương ứng trên canvas. Cần hỏi người dùng trước khi tự dựng giao diện (quy tắc: màn chưa có trên canvas thì hỏi).
- `ReadingTest` chưa có link nộp bài; `ExamDetail` nút "Làm bài" trỏ động theo bài test, bản mẫu chỉ nối tới ListeningTest.
- Các trang Giáo viên dùng thanh điều hướng riêng (inline), chưa tách component như bên Quản lý.
- Phần viền `1px` thường và bo góc nhỏ 2 đến 6px trong canvas chưa đồng bộ với `DESIGN.md` (chưa chốt ngoại lệ).
