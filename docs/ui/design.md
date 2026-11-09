# IELTS Learning System – Design System

> **Đã gộp vào `DESIGN.md` (gốc repo) ngày 09/11/2026.** Từ nay chỉ sửa và theo dõi ở `DESIGN.md`; file này giữ nguyên để tra lịch sử, không cập nhật thêm.

> 26/10/2026: tên sản phẩm đổi từ BandUp thành IELTSpace (logo chữ "IS"). Các chỗ ghi BandUp bên dưới là tên cũ.

Hệ thống luyện đề IELTS 4 kỹ năng · Đồ án 1
Cập nhật: 29/10/2026 (mục A là quy chuẩn hợp nhất mới nhất) · Bản mẫu: canvas Claude Design "BandUp Landing Khách" (https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V)
Tên "BandUp" là tên tạm.

> **Cập nhật 23/10/2026 (theo Chương 1, Chương 3 bản "sửa 20-10 lần 2" và thiết kế CSDL).** Bản đóng gói xem trực tiếp: `ui/bandup-giao-dien.html` (35 màn hình, một file, không cần mạng). Mã sinh: `ui/canvas-gen/v2/`.
> - Viền thẻ/ô nhập đổi sang `#737373`; nút nền đen giữ viền `#1A1A1A`.
> - Thêm chế độ Sáng/Tối (UC14, bảng màu ở mục 2.5): nút gạt trong menu tài khoản, Hồ sơ và thanh bên Giáo viên/Quản lý. Không có song ngữ.
> - Chuông thông báo (UC35) có chấm đỏ số chưa đọc; chấm đỏ nhỏ `#D92D20` đánh dấu bài W/S mới có kết quả hoặc vừa bị hủy. "Đăng xuất" màu đỏ.
> - Nhãn trạng thái bài W/S: Đã lưu · chưa gửi chấm, Chờ phân công, Chờ chấm, Đã có kết quả, Đã hủy · đã hoàn bonus, Chưa có điểm, Có bản nháp (chỉ Giáo viên thấy).
> - Nhãn nội dung: Công khai / Bản nháp / Đã ẩn. Tài khoản: Hoạt động / Bị khóa / Đã xóa. Quyền chấm: Đang nhận bài / Ngừng nhận bài mới / Đã thu hồi.

## A. Quy chuẩn hợp nhất (29/10/2026, ưu tiên cao nhất)

Mục này tổng hợp mọi quyết định đã chốt trên canvas đến bản 225. Khi mâu thuẫn với các mục bên dưới (mục 1 đến 10 là bản cũ từ 07/10), **mục A và mục 0 thắng**. Mục 1, 2, 3, 6 (viền đen `--ink`, bo 14 đến 16, màu v2) chỉ còn để tra lịch sử.

### A.1 Cấu trúc canvas (sắp xếp theo role và nghiệp vụ)

Canvas xếp từ trên xuống: **Khách và xác thực → Người học → Giáo viên → Quản lý**. Mỗi role có một tiêu đề lớn, mỗi nghiệp vụ là một hàng có nhãn "Role · Nghiệp vụ", các màn nối nhau từ trái sang phải theo thứ tự luồng. Khoảng cách ngang giữa hai màn 160, giữa hai hàng khoảng 500 (cộng chiều cao màn cao nhất).

| Role | Hàng (nghiệp vụ) | Màn |
|---|---|---|
| Khách và xác thực | Landing và đăng nhập | Main, AvatarMenu, Login, Register |
| | Quên mật khẩu | ForgotPassword, CheckEmail, ResetPassword |
| | Component xác thực | AuthHero, LoginForm, RegisterForm, AuthError |
| Người học | Trang chủ và thư viện đề | StudentLanding, StudentHome, FullTests, ExamDetail, PracticeLibrary |
| | Làm bài | ReadingTest, ListeningTest, WritingTest, SpeakingTest, SubmitDialogs |
| | Kết quả và bài đã làm | ResultLR, ResultWS, MyWS, PracticeWS |
| | Luồng xem bài mẫu | SampleLibrary, SampleWriting, SampleSpeaking |
| | Từ vựng | Vocab, Flashcard |
| | Hồ sơ và thông báo | Profile, Notifications |
| Giáo viên | Chấm bài | TeacherHome, TeacherQueue, TeacherGrade, TeacherHistory, StaffProfile |
| Quản lý | Tổng quan, người dùng, chấm bài | AdminHome, AdminUsers, AdminGrading |
| | Bộ đề và đề thi | AdminExams, AdminExamSet, AdminReading/Listening/Writing/SpeakingEditor |
| | Thẻ câu hỏi | QuestionCards, QuestionCard |
| | Bài mẫu | AdminSamples, AdminSampleWriting, AdminSampleSpeaking |
| | Component dùng chung | AdminSidebar, AdminTopbar |

Quy tắc đặt tên: tiêu đề board "Role · Màn hình (ghi chú Tweaks)". Màn mới đặt vào đúng hàng nghiệp vụ, hàng mới thì tạo nhãn mới. Kích thước board: 1440 rộng, component đúng kích thước thật. Bản trước khi xếp lại: `ui/canvas-gen/v2/canvas.before-reorg-224.json`.

### A.2 Thẻ chuẩn (Landing, thư viện, bài mẫu)

- Khung: nền trắng, bo 22, viền 1.5px `#D6D4D0`, padding 12/12/16. Không đổ bóng đậm.
- **Bìa tỉ lệ 3:2** (đổi từ 7:10 ngày 29/10), bo 12, chỉ có màu phẳng lấy từ `#BFD8F7` · `#F7C4B6` · `#C5CEF5` · `#C5DECE`. Ảnh thật khác tỉ lệ thì fit (contain) trên nền màu, không cắt. Kích thước bìa trong màn Quản lý: ô tải ảnh 240×160, thumb 48×32, bìa ở trang thông tin bộ đề 144×96, bìa ở ExamDetail 288×192. Cảnh báo khi ảnh lệch tỉ lệ quá ngưỡng 1.5.
- Badge dạng viên thuốc: "Mới", "N câu" ở góc phải trên; "Đã làm" nền xanh lá nhạt ở góc trái trên.
- Tiêu đề 18/600; **một dòng meta** 14px; chip nằm **dưới tiêu đề** (với bài mẫu).
- **Chip dạng bài** mỗi dạng một màu pastel (bảng `CHIPC` trong `ui/canvas-gen/v2/v3_cards.py`); chip kỹ năng dùng cặp màu kỹ năng ở mục 0.1.
- CTA: bộ đề = link chữ "Xem bài test ›"; bài mẫu = link "Xem bài mẫu ›"; đề lẻ theo kỹ năng = nút viền cao 44, bo 12, "Làm bài".
- **Thẻ bài mẫu Speaking có audio ngay trong thẻ** (cả Part 1, 2, 3): nút phát tròn, thanh thời gian, mỗi câu có audio riêng; Part 2 chỉ một audio.
- Mọi khoảng cách và kích thước chia hết cho **4** (lưới 4px). Bo góc thông dụng: 8 (ô nhỏ) · 12 (bìa, nút) · 22 (thẻ) · 26 (khung lớn) · 999 (nút, chip, badge).

### A.3 Màn Quản lý (admin)

- Khung chung: **AdminSidebar** (rộng 248, thu gọn 76, nhớ trạng thái bằng `localStorage 'ieltspace-admin-nav'`, nhận prop `active`) + **AdminTopbar** (prop `crumb`; bấm avatar mở menu Hồ sơ cá nhân, Giao diện Sáng/Tối, Đăng xuất). Nút Sáng/Tối và Đăng xuất không đặt trong sidebar.
- Nền khu làm việc `--paper-deep`, thẻ và bảng trắng. Chọn ngày dùng Date Picker, không dùng ô nhập tay.
- Trang soạn nội dung có 3 trạng thái: Bản nháp, Công khai, Đã ẩn (đổi ở Tweaks). Bài đã công khai thì khóa chỉnh sửa và hiện nút "Sửa", nút "Đăng" chỉ hiện ở chế độ xem sau khi "Lưu".
- **Mọi nút Hủy/Xóa dùng kiểu destructive**: nền trắng, chữ `#C0412A`, viền 1.5px `#F1B3A3`; nút icon thùng rác cũng `#C0412A`. "Đăng xuất", "Không lưu" cũng chữ đỏ. Chạy `ui/canvas-gen/v2/destructive.py` trước khi đăng.
- Danh sách có thanh lọc trên cùng, bảng hoặc thẻ bên dưới, hành động chính góc phải trên (nút xanh "Thêm ...").

### A.4 Editor nội dung (đề và bài mẫu)

- Đề: Reading là split editor (Doc + board canvas); Listening có 4 section, ghi âm, transcript có mốc giờ, Map Labelling; Writing 2 Task, ảnh đề bài Task 1, Academic/General; Speaking 3 Part. Thẻ câu hỏi dùng 16 dạng ở `QuestionCards` (xem `ielts-question-input-types`).
- Bài mẫu: **một editor cho mỗi kỹ năng**. Writing: một editor cho Task 1 và Task 2. **Speaking: một editor duy nhất cho cả Part 1, 2, 3** (không tách theo Part); mỗi mục có câu hỏi, câu trả lời mẫu và audio riêng.
- **Ảnh bìa chỉ để hiện ở thẻ**, không xuất hiện trong nội dung bài mẫu. Editor có ô tải ảnh bìa tỉ lệ 3:2 với preview.
- Nhập hàng loạt bằng xlsx theo mẫu ở `ielts-import-format`.
- **Chế độ Chỉ xem trước khi sửa (31/10/2026)**, áp dụng cho cả 6 editor (Reading, Listening, Writing, Speaking, bài mẫu Writing, bài mẫu Speaking) và mọi editor làm sau:
  - Mở editor luôn ở **Chỉ xem**, kể cả đề mới tạo hay bài mẫu trống. Ngoại lệ duy nhất: bấm "Thêm bài mẫu" ở trang Quản lý bài mẫu thì vào thẳng Chỉnh sửa.
  - Chỉ xem: chip "Chỉ xem", dải xanh nhạt `--sky-soft` có icon khóa dưới thanh tiêu đề ("Chế độ chỉ xem. Nội dung đang khóa..."); ô nhập thành khối nền `--surface-2` không viền, không con trỏ, không kéo giãn, không mũi tên select, placeholder mờ; nút thêm/xóa nhỏ ẩn (lớp `.eo`). Thanh trên: Nhập từ xlsx, **Chỉnh sửa**, Đăng.
  - Chỉnh sửa: chip "Đang chỉnh sửa", thanh trên: trạng thái thay đổi, Hoàn tác, **Hủy** (destructive đỏ), **Lưu** (nút chính). Hủy khi còn thay đổi chưa lưu hỏi Tiếp tục sửa / Không lưu / Lưu.
  - Cài bằng lớp `ro` trên `<main>` (`modeCls`) + `ui/canvas-gen/v2/patch_readonly.py`; chạy lại script này sau khi chạy các generator editor.

### A.5 Trang bài mẫu của người học

Luồng: SampleLibrary (chọn bài, lọc theo kỹ năng và dạng bài) → SampleWriting hoặc SampleSpeaking. Hai trang chi tiết dùng cùng khuôn: breadcrumbs, mục lục scrollspy bên trái, nội dung bên phải, đổi bài mẫu ở Tweaks (`mau`). Speaking chia mục theo Part; mỗi câu hỏi là một thẻ có audio phát tại chỗ.

### A.6 Mẫu tương tác chung

- Mọi popup/hộp thoại: nền mờ tối, thẻ trắng bo 22, nút chính bên phải, nút Hủy bên trái (destructive nếu hủy dữ liệu).
- Trạng thái nhãn: giữ bảng ở đầu tài liệu (W/S: Đã lưu, Chờ phân công, Chờ chấm, Đã có kết quả, Đã hủy; nội dung: Công khai / Bản nháp / Đã ẩn; tài khoản: Hoạt động / Bị khóa / Đã xóa).
- Màn dùng sessionStorage để chuyển dữ liệu giữa các trang (`{at, v}`), localStorage chỉ cho tiện ích từng người (thu gọn sidebar, chế độ tối).
- Canvas template: mỗi màn là một `.dc.html`; mã sinh ở `ui/canvas-gen/v2/` (v3_cards.py, v3_covers.py, v3_samples.py, v3_sample_speaking.py, v3_sample_speaking_page.py). Sửa bằng cách chạy script lên file live, không sửa tay nhiều nơi.

### A.7 Việc chưa làm

Chế độ tối cho các màn mới (thẻ, editor bài mẫu), sidebar Giáo viên theo khuôn AdminSidebar, từ vựng và bài tập cho bài mẫu, ảnh thật thay khối màu, "Xem thêm" và dữ liệu thật cho SampleLibrary.


## 0. Hệ màu v3 (26/10/2026, thay mục 2, 3 và token ở mục 9)

Tham khảo: palette Aubergine, Coral, Mint, Butter, Paper; landing "together" (thẻ pastel bo tròn lớn, thẻ số liệu nghiêng, FAQ dạng accordion, khối CTA nền tối); minh họa phẳng tông xanh tím nhạt. Ưu tiên của nhóm: nền kem nhạt và xanh trời. Mã áp hệ màu: `ui/canvas-gen/v2/theme_v3.py`, bảng tối: `dark_palette.py`. Ảnh mẫu: `ui/mau-v3/`.

Nguyên tắc:
1. **Nền kem, thẻ trắng.** Trang dùng kem rất nhạt `#FCFBF7` (làm nhạt từ Paper #F9F6EF ngày 26/10); thẻ, ô nhập, nút viền dùng trắng để nổi trên nền kem.
2. **Xanh trời là màu nhấn duy nhất** cho link, logo, mục đang chọn, dải hero (gradient xanh trời sang mint).
3. **Aubergine thay đen** cho chữ chính, nút chính và khối CTA.
4. **Viền mềm.** Viền thẻ xám ấm `#D6D4D0` (đổi 26/10) chỉ để tách khối. Ô nhập giữ viền `#8E8392` (3.6:1) cho dễ thấy.
5. **Bo tròn hơn.** Nút và nhãn bo kiểu viên thuốc (999px), thẻ 22px, khung lớn 26px.

### 0.1 Màu sáng

| Token | Hex | Dùng cho | Tương phản |
|---|---|---|---|
| `--paper` | `#FCFBF7` | Nền trang | |
| `--paper-deep` | `#FAF9F5` | Nền khu làm việc Giáo viên, Quản lý | |
| `--surface` | `#FFFFFF` | Thẻ, ô nhập, nút viền | |
| `--surface-3` | `#EFE8DB` | Nhóm nút chọn, hover menu | |
| `--divider` | `#ECE4D6` | Vạch kẻ trong bảng, thẻ | |
| `--ink` | `#352637` Aubergine | Chữ chính, nút chính, khối CTA | 13.1:1 trên Paper |
| `--text-2` | `#4B3D4D` | Chữ phụ | 9.4:1 |
| `--text-muted` | `#6A5D6C` | Mô tả, meta | 5.7:1 |
| `--text-subtle` | `#706473` | Nhãn nhỏ, số lượt | 5.2:1 |
| `--line` | `#D6D4D0` | Viền thẻ, chip, thanh điều hướng | |
| `--field-line` | `#8E8392` | Viền ô nhập | 3.6:1 |
| `--accent` | `#2963CC` xanh trời | Link, logo, nút nhấn | 5.2:1; chữ trắng trên nền 5.6:1 |
| `--sky-soft` | `#E3ECFD` | Mục đang chọn, ghi chú | |
| `--hero` | `linear-gradient(135deg, #E3ECFD, #E6F3EC)` | Dải hero, đầu trang thư viện | |
| `--danger` | `#E5604A` (nền) · `#C0412A` (chữ) | Chấm đỏ, huy hiệu số, "Đăng xuất" | chữ 5.2:1 |
| `--danger-soft` | `#FBDCD3` | Chip "Đã hủy", hộp thoại lỗi, câu FAQ đang mở | |
| `--coral` | `#F27D65` | Điểm nhấn trang trí (theo palette gốc) | |
| `--mint` | `#C5DECE` · `--butter` `#F4D66F` | Khối minh họa, thẻ số liệu | |

Màu kỹ năng:

| Kỹ năng | Nền | Chữ | Tương phản |
|---|---|---|---|
| Listening (xanh trời) | `#DDE8FC` | `#2A55B8` | 5.5:1 |
| Reading (mint) | `#DCEDE2` | `#2E6A48` | 5.3:1 |
| Writing (butter) | `#FBEDBF` | `#7A5A0E` | 5.5:1 |
| Speaking (xanh tím) | `#E8E4FA` | `#5543B0` | 6.0:1 |

Khối minh họa: `#BFD8F7` xanh trời · `#F7C4B6` coral nhạt · `#C5CEF5` xanh tím · `#C5DECE` mint.

### 0.2 Màu tối (nền #202125, chốt 30/10/2026)

Thay bảng nền tím than Aubergine ngày 26/10 vì nền bị ánh tím. Nền và chữ là xám hơi lạnh, hợp với màu nhấn xanh trời; màu nhấn, đỏ và khối minh họa giữ nguyên. Xem trước: `ui/bang-mau-toi-v3.html`. Đổi mã cũ sang mới: `ui/canvas-gen/v2/swap_dark_202125.py`.

| Token | Hex | Tương phản |
|---|---|---|
| `--paper` | `#202125` | |
| `--paper-deep` | `#1A1B1E` | |
| `--surface` | `#292A2E` | |
| `--surface-3` | `#333438` | |
| `--divider` | `#3B3C41` | |
| `--ink` | `#F1F2F4` (nút chính: nền này, chữ `#202125`) | 14.4:1 |
| `--text-2` / `--text-muted` / `--text-subtle` | `#D5D6DA` / `#B2B3B9` / `#9FA0A7` | 11.1 / 7.7 / 6.2:1 |
| `--line` / `--field-line` | `#46474D` / `#85868D` | ô nhập 4.0:1 |
| `--accent` | `#4A7FE6` (nền) · `#8DB0F7` (chữ) | chữ 7.4:1 |
| `--sky-soft` | `#26314D` | |
| `--danger` | `#D9553F` (nền) · `#F49A85` (chữ) | chữ 7.5:1 |

Màu kỹ năng tối: Listening `#1F2842`/`#A9C2F7` (8.2:1) · Reading `#1D2F27`/`#A7D7B6` (8.8:1) · Writing `#352E18`/`#F4D66F` (9.4:1) · Speaking `#282543`/`#C3B9F7` (8.1:1).

### 0.3 Chữ

- **Inter** cho chữ giao diện (có dấu tiếng Việt), dự phòng Be Vietnam Pro. Đổi từ Geist theo yêu cầu 26/10.
- **IBM Plex Serif** 500–700 cho tiêu đề và tên thẻ từ 20px (có dấu tiếng Việt). Đổi từ Lexend theo yêu cầu 26/10.
- **IBM Plex Mono** 500–600 cho số liệu lớn (band, số bài, phần trăm, đếm ngược).

### 0.4 Thành phần mới

- **Thẻ số liệu nghiêng** (trang chủ Khách): 4 thẻ bo 26px, nền xanh trời, coral nhạt, mint, butter, xoay -6°, 3°, -2°, 5°; số dùng chữ lớn 40px.
- **FAQ dạng accordion**: mỗi câu là một khung bo 20px, đánh số 01, 02...; câu đang mở nền `--danger-soft`.
- **Khối CTA**: nền Aubergine, chữ trắng, nút xanh trời.

## 1. Định hướng (bản cũ 07/10, viền đen đã bỏ, xem mục A và 0)

Nền trắng, gọn, có viền đen rõ để tách khối. Màu nhạt dùng để nhận diện kỹ năng và làm ảnh minh họa. Màu nhấn xanh dương dành cho logo, nhãn "Mới" và một hành động kêu gọi.

Nguồn tham khảo đã chốt:

| Nguồn | Lấy gì |
|---|---|
| design.md QLKLTN (Nhóm 8) | Bảng màu nền/chữ, cặp màu trạng thái, font Be Vietnam Pro, bo góc, chiều cao nút |
| tuhoc.dolenglish.vn | Bố cục landing: hàng thẻ theo mục, "Xem thêm ›", thẻ ảnh + tiêu đề + số lượt làm, nút "Làm bài" |
| Dashboard LMS (Cinema 4D) | Chỉ lấy viền đen 1.5px quanh thẻ, chip, nút |

Nguyên tắc:

1. **Viền đen tách khối.** Mọi thẻ, chip, nút viền và ô nhập dùng viền `1.5px --ink`. Không dùng viền xám nhạt cho thành phần tương tác.
2. **Một hành động chính mỗi khu vực.** Nút đen là hành động chính; còn lại dùng nút viền hoặc link.
3. **Màu kỹ năng nhất quán.** Listening, Reading, Writing, Speaking luôn mang đúng một cặp màu ở mọi trang.
4. **Tiếng Việt trước.** Font phải hiển thị tốt dấu tiếng Việt.

## 2. Màu (hệ màu v2, đã thay bằng mục 0)

### 2.1 Nền, chữ, viền

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg` | `#FFFFFF` | Nền trang, thẻ |
| `--bg-subtle` | `#FAFAF9` | Nền footer |
| `--bg-muted` | `#F5F5F4` | Ô câu ví dụ trong thẻ từ vựng |
| `--bg-segment` | `#F2F2F1` | Nền segmented control (VI/EN) |
| `--bg-hero` | `#EAF4FB` | Dải nền hero |
| `--ink` | `#1A1A1A` | Chữ chính, nút chính, nền khối CTA |
| `--line` | `#737373` | Viền 1.5px của thẻ, chip, nút viền, thanh điều hướng (nhạt hơn từ 09/10/2026; nút nền đen giữ viền `#1A1A1A`) |
| `--text-2` | `#3D3D3D` | Chữ phụ trong nội dung, link menu, link footer |
| `--text-muted` | `#5C5C5C` | Mô tả, meta (6.6:1 trên nền trắng) |
| `--text-subtle` | `#737373` | Nhãn viết hoa nhỏ, số lượt làm (4.7:1) |
| `--text-on-dark` | `#C9C9C6` | Chữ phụ trên nền `--ink` |

### 2.2 Màu nhấn

| Token | Hex | Dùng cho |
|---|---|---|
| `--accent` | `#1F5FBF` | Logo, chấm eyebrow, nhãn "Mới", nút trong khối CTA, icon play của nút "Làm bài", link "Xem bài test" |
| `--accent-hover` | `#174A94` | Hover của link |
| `--on-accent` | `#FFFFFF` | Chữ trên nền `--accent` |

Quy tắc: nếu đổi accent sang màu sáng (độ sáng > 0.6), chữ trên nền accent đổi sang `--ink`. Không dùng accent làm nền cho đoạn chữ dài.

### 2.3 Màu kỹ năng

Dùng cho chip kỹ năng, icon trong ô kỹ năng và số đề.

| Kỹ năng | Nền | Chữ |
|---|---|---|
| Listening | `#E3ECFB` | `#1F4FA0` |
| Reading | `#DDF3D8` | `#2B6A1F` |
| Writing | `#FDF1D8` | `#6B3A06` |
| Speaking | `#EDE7FB` | `#5B3BA8` |

### 2.4 Khối màu minh họa

Thay ảnh trong thẻ bộ đề, bài luyện và bài mẫu khi chưa có ảnh thật. Dùng xoay vòng, hai thẻ cạnh nhau không trùng màu.

`#A9CBEB` xanh dương · `#F4B9BB` hồng · `#BAB7DD` tím · `#BFDDB5` xanh lá

### 2.5 Chế độ tối (UC14, thêm 23/10/2026)

> Đã thay bằng mục 0.2 (nền #202125, 30/10/2026). Giữ lại để tham khảo nguyên tắc; mã màu bên dưới là bản v2 cũ.

Cùng bố cục và thành phần với chế độ sáng, chỉ đổi màu. Nguyên tắc:

1. **Không dùng đen tuyền.** Nền khu làm việc `#111111`, thẻ và trang `#181818`, lớp nổi `#1F1F1F` đến `#242424`.
2. **Nút chính đảo màu.** Nút nền đen ở chế độ sáng thành nút nền `#EDEDED`, chữ `#111111`.
3. **Màu kỹ năng giữ sắc độ.** Nền đổi sang bản tối, cùng tông; chữ đổi sang bản sáng. Mọi cặp chữ trên nền đạt từ 7.5:1 trở lên.
4. **Viền nhạt hơn chữ phụ.** Viền `#4D4D4D` chỉ dùng tách khối, không mang thông tin.
5. **Bóng đổ dùng đen trong suốt**, vì bóng xám xanh của chế độ sáng không thấy trên nền tối.

| Token | Sáng | Tối | Dùng cho / độ tương phản |
|---|---|---|---|
| `--bg-subtle` | `#FAFAF9` | `#111111` | Nền khu làm việc (Giáo viên, Quản lý), nền đăng nhập |
| `--bg` | `#FFFFFF` | `#181818` | Thẻ, trang Người học, thanh điều hướng |
| `--bg-muted` | `#F5F5F4` | `#1F1F1F` | Ô ví dụ, nền lớp 2 |
| `--bg-segment` | `#F2F2F1` | `#242424` | Nhóm nút chọn, hover menu |
| `--bg-hero` | `#EAF4FB` | `#18283A` | Dải hero, mục đang chọn, ghi chú thông tin |
| `--ink` | `#1A1A1A` | `#EDEDED` | Chữ chính (15.2:1), nền nút chính |
| `--on-ink` | `#FFFFFF` | `#111111` | Chữ trên nút chính |
| `--text-2` | `#3D3D3D` | `#D4D4D4` | Chữ phụ (12.0:1) |
| `--text-muted` | `#5C5C5C` | `#B3B3B3` | Mô tả, meta (8.5:1) |
| `--text-subtle` | `#737373` | `#9A9A9A` | Nhãn nhỏ, số lượt (6.3:1) |
| `--line` | `#737373` | `#4D4D4D` | Viền 1.5px thẻ, chip, ô nhập |
| `--divider` | `#E5E5E5` | `#2E2E2E` | Vạch kẻ trong bảng, thẻ |
| `--accent` | `#1F5FBF` | `#4C8DEB` (nền) · `#6AA4F5` (chữ, link 7.0:1) | Logo, link, nhãn "Mới" |
| `--danger` | `#D92D20` | `#E5484D` (nền) · `#F0675C` (chữ 5.7:1) | Chấm đỏ, huy hiệu số, "Đăng xuất" |
| `--danger-soft` | `#FDE3E1` | `#3D1D1A` | Nền chip "Đã hủy", hộp thoại lỗi |
| `--shadow-card` | xám xanh 4%, 6% | đen 35%, 45% | Bóng thẻ |

Màu kỹ năng ở chế độ tối:

| Kỹ năng | Nền | Chữ | Tương phản |
|---|---|---|---|
| Listening | `#1C2A40` | `#9DBDF5` | 7.6:1 |
| Reading | `#1C3320` | `#9AD58A` | 7.9:1 |
| Writing | `#3A2C14` | `#F2C47A` | 8.4:1 |
| Speaking | `#2A2340` | `#C3B2F5` | 7.8:1 |

Khối màu minh họa ở chế độ tối: `#33506E` xanh dương · `#6E3E40` hồng · `#4A4770` tím · `#3F5E37` xanh lá.

Lưu ý: chữ trắng trên `--accent` tối chỉ đạt 3.3:1, nên chỉ dùng cho chữ lớn hoặc đậm (chữ "B" của logo, nút lớn). Số trên huy hiệu đỏ đạt 3.9:1, giữ chữ đậm 11.5px trở lên.

Bảng ánh xạ đầy đủ từng mã màu (theo vai trò chữ, nền, viền) nằm trong `ui/canvas-gen/v2/dark_palette.py`. File `ui/bandup-giao-dien.html` dùng chính bảng đó khi bấm "Tối".

## 3. Chữ (v2, đã thay bằng mục 0.3)

Font: **Be Vietnam Pro** (Google Fonts, 400/500/600/700/800). Fallback: `'Segoe UI', system-ui, sans-serif`.

| Kiểu | Cỡ / độ đậm | Dùng cho |
|---|---|---|
| Display | 48 / 700, line-height 1.15, letter-spacing -0.025em | Tiêu đề hero |
| H2 | 28 / 700, line-height 1.25, letter-spacing -0.015em | Tiêu đề mục ("Bộ đề mới nhất") |
| H2 CTA | 30 / 700 | Tiêu đề khối CTA |
| Card title | 18 / 600, line-height 1.35 | Tên đề, tên bài mẫu |
| Word | 22 / 700 | Từ vựng trong thẻ |
| Lead | 17 / 400 | Đoạn mô tả hero |
| Body | 15 / 400, line-height 1.6 | Nội dung |
| Body-sm | 14–14.5 / 400–600 | Mô tả thẻ, link, nút nhỏ |
| Caption | 13–13.5 / 400–600 | Phiên âm, meta |
| Overline | 11.5–12 / 600, viết hoa, letter-spacing 0.06–0.08em | Eyebrow hero, chủ đề từ vựng, tiêu đề cột footer |

Mô tả trong thẻ cắt ở 2 dòng (`-webkit-line-clamp: 2`).

## 4. Khoảng cách, bo góc, viền, bóng

- Lưới khoảng cách: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64.
- Độ rộng nội dung tối đa: 1200 px, lề ngang 24 px.
- Padding mục: 48 px trên/dưới; hero 64 / 56.
- Khoảng cách hàng thẻ: 28 px dọc × 20 px ngang (thẻ ảnh); 16 px (thẻ từ vựng, thẻ điểm nổi bật).
- Bo góc: nhãn số câu 8 · logo, nút nhỏ 9 · nút, ô nhập, khối màu trong thẻ 10 · ô kỹ năng, thẻ điểm nổi bật 14 · thẻ bộ đề, bài luyện, bài mẫu, từ vựng 16 · khung ô kỹ năng, khối CTA 20 · chấm tròn 50%.
- Viền: `1.5px solid --ink` cho thẻ, nút, chip, khung; đường kẻ dưới menu, dưới hero, trên footer cũng 1.5px `--ink`.
- Bóng thẻ: `0 1px 2px rgba(16,24,40,.04), 0 6px 16px rgba(16,24,40,.06)`.
- Bóng khối CTA: `0 12px 32px rgba(16,24,40,.18)`.
- Chiều cao: nút chính 46 px · nút "Làm bài" 44 px · nút icon 42 px · nút lưu từ 36 px. Vùng bấm tối thiểu 44 px với nút chính.

## 5. Bố cục landing (Khách)

> Các màn sau đăng nhập (học viên, làm bài, trợ giảng, quản trị) lấy luồng và nội dung từ UI của nhóm (`ui/team/UI IELTS demo.html`), dựng lại theo design system này. Thành phần ở mục 6.

Thứ tự các mục từ trên xuống:

1. **Menu**: logo · Thư viện đề · Thư viện từ vựng · Bài mẫu · (phải) VI/EN · sáng/tối · Đăng nhập.
2. **Hero** trên dải `--bg-hero`: eyebrow, tiêu đề, mô tả, 2 nút (Đăng ký miễn phí, Xem thư viện đề), dòng "Đã có tài khoản? Đăng nhập". Bên phải là khung 2×2 ô kỹ năng.
3. **Điểm nổi bật**: 3 thẻ (Chấm L/R tức thì · Trợ giảng chấm W/S · Theo dõi tiến độ).
4. **Bộ đề mới nhất**: 4 thẻ khối màu, mỗi thẻ có link "Xem bài test".
5. **Luyện IELTS Reading** và **Luyện IELTS Listening**: mỗi mục 4 thẻ bài luyện, có nút "Làm bài".
6. **Từ vựng mới**: thẻ từ vựng dạng chữ.
7. **Bài mẫu**: 4 thẻ khối màu.
8. **Khối CTA** nền đen.
9. **Footer**: 4 cột (thương hiệu · Luyện thi · Tài khoản · Hỗ trợ).

Mỗi mục có tiêu đề H2 + mô tả 1 dòng bên trái, link "Xem thêm ›" bên phải.

Trên web thật, các hàng thẻ (Bộ đề, Reading, Listening, Từ vựng, Bài mẫu) là slider cuộn ngang. Desktop hiện 4 thẻ, tablet khoảng 2.6 thẻ, điện thoại khoảng 1.2 thẻ, có `scroll-snap`.

Mọi hành động cần tài khoản (Làm bài, Lưu từ, Xem bài test, Xem bài mẫu đầy đủ) đều dẫn tới đăng ký/đăng nhập.

## 6. Thành phần

### Nút
- **Chính**: nền `--ink`, chữ trắng 600, viền `--ink`, cao 46, bo 10, padding ngang 20.
- **Viền**: nền trắng, viền `--ink`, chữ `--ink`.
- **Làm bài**: nút viền cao 44; icon play tròn màu `--accent` bên trái, mũi tên tam giác `--text-subtle` bên phải (mở menu chọn chế độ làm).
- **Icon**: 42×42, bo 10, viền `--ink`, luôn có `aria-label`.
- **Trên nền đen (CTA)**: nền `--accent`, chữ `--on-accent`, viền trắng.

### Link
- **Xem thêm ›**: 15 / 600, màu `--ink`, chevron 16 px.
- **Xem bài test ›**: 14.5 / 600, màu `--accent`, nằm cuối thẻ bộ đề.
- Link trong đoạn văn: `--accent`, hover `--accent-hover`.

### Menu
Nền trắng, đường kẻ dưới 1.5px `--ink`, cao 68. Link menu 14.5 / 500 `--text-2`, cao 40, bo 8. Logo là ô vuông 32 px bo 9, nền `--accent`, viền `--ink`, chữ "B".

### Segmented control (VI/EN)
Khung viền `--ink`, nền `--bg-segment`, padding 3, bo 10. Mục đang chọn nền trắng, bóng nhẹ; mục còn lại chữ `--text-muted`. Dùng `aria-pressed`.

### Ô kỹ năng (hero)
Thẻ trắng viền `--ink` bo 14, bóng thẻ, cao tối thiểu 172. Icon 42 px trong ô bo 10 dùng cặp màu kỹ năng; tên 17 / 700; mô tả 13.5; số đề 13 / 600 màu chữ của kỹ năng. 4 ô đặt trong khung bo 20, nền trắng 60%, viền `--ink`.

### Thẻ điểm nổi bật
Thẻ trắng viền `--ink` bo 14, bóng thẻ. Ô icon 36 px bo 10 dùng cặp màu kỹ năng, tiêu đề 600, mô tả 14 `--text-muted`.

### Thẻ khối màu (Bộ đề, Bài mẫu)
Thẻ trắng viền `--ink` bo 16, padding 12/12/16, bóng thẻ. Bên trong: khối màu tỉ lệ 3:2 bo 10 → tiêu đề 18 / 600 → mô tả 14 cắt 2 dòng. Thẻ bộ đề có thêm link "Xem bài test ›" ở đáy.

### Thẻ bài luyện (Reading, Listening)
Giống thẻ khối màu, thêm:
- Nhãn số câu ("13 câu") ở góc trái trên khối màu: nền trắng, viền `--ink`, bo 8, 13.5 / 600.
- Dòng "3.2K lượt làm" 14 `--text-subtle`.
- Nút "Làm bài" ở đáy.

### Thẻ từ vựng
Thẻ trắng viền `--ink` bo 16, padding 18, bóng thẻ. Gồm: chủ đề (Overline `--text-subtle`) + nút lưu 36 px; từ 22 / 700; phiên âm + loại từ (nghiêng) 13.5 `--text-muted`; nghĩa 600; câu ví dụ trong ô `--bg-muted` bo 10.

### Nhãn
- **Mới**: 11 / 700, nền `--accent`, chữ `--on-accent`, bo 999.
- **Chip kỹ năng**: 12.5 / 600, cặp màu kỹ năng, bo 999, padding 5×10.

### Khối CTA
Nền `--ink`, chữ trắng, bo 20, padding 36×40, bóng CTA. Tiêu đề 30 / 700, vạch accent 44×4 bên dưới, mô tả `--text-on-dark`, nút accent bên phải.

### Footer
Nền `--bg-subtle`, đường kẻ trên 1.5px `--ink`. Cột tiêu đề Overline `--text-subtle`, link 14.5 `--text-2`.

### Khung ứng dụng học viên (sau đăng nhập)
Menu trên cùng như landing nhưng link là Tổng quan · Luyện thi · Bài mẫu · Từ vựng · Flashcard · Kết quả; bên phải nút sáng/tối và avatar tròn 42 px viền `--ink`. Link đang chọn: nền `--bg-hero`, viền `--ink`, chữ 600, cao 38.

### Khung làm việc (Trợ giảng, Quản trị)
- **Sidebar** rộng 248, nền trắng, kẻ phải 1.5px `--ink`, padding 20×16: logo → nhãn nhóm (Overline `--text-subtle`) → mục menu cao 44 bo 10, icon 19 px. Mục đang chọn: nền `--bg-hero`, viền `--ink`, chữ 600. Đáy: ô châm ngôn nền `--bg-hero` viền `--ink` bo 14, rồi "Đăng xuất".
- **Thanh trên** cao 68, kẻ dưới 1.5px `--ink`: đường dẫn (Trợ giảng / Tổng quan) bên trái, nút sáng/tối và avatar bên phải.
- Vùng nội dung nền `--bg-subtle`, padding 36×32, các khối cách nhau 28.
- Trợ giảng: Tổng quan · Bài đang duyệt · Chờ duyệt · Đã duyệt. Quản trị: Dashboard · Quản lý người dùng · Ngân hàng đề · Import và Preview · Báo cáo & phản hồi · Duyệt bằng cấp.

### Tiêu đề trang (màn sau đăng nhập)
Eyebrow → H1 36 / 700 → mô tả `--text-muted`; nút chính (accent) canh phải nếu có.

### Dải chỉ số
Một thẻ viền `--ink` bo 16 chia 4 ô bằng vạch dọc 1.5px `--ink`. Mỗi ô: nhãn 13.5 `--text-muted`, số 32 / 700, ghi chú 13 `--text-subtle`.

### Thẻ kỹ năng (Tổng quan học viên)
Thẻ trắng viền `--ink` bo 16, padding 20: ô icon 44 px dùng cặp màu kỹ năng + mũi tên phải → tên 18 / 600 → mô tả 14 → đường kẻ mảnh → cách chấm (Chấm tự động / Trợ giảng chấm).

### Khối "Bài gợi ý hôm nay" và "Mục tiêu hôm nay"
- Bài gợi ý: nền `--ink`, chữ trắng, bo 20, nút accent, khối màu minh họa viền trắng bên phải.
- Mục tiêu: thẻ trắng, vòng tiến độ 132 px (`conic-gradient` `--accent` trên `#E5E5E5`), số ở giữa 28 / 700.

### Biểu đồ tiến bộ
Cột bo trên 8, viền `--ink`, màu nền theo kỹ năng (Listening, Reading); nhãn % trên cột 12.5 / 600, tên đề dưới cột `--text-subtle`.

### Hàng bài nộp (chờ phản hồi, hàng đợi chấm)
Ô icon kỹ năng 42 px → tên bài 600 + "người nộp · ngày" 13.5 `--text-subtle` → chip kỹ năng → chip trạng thái → nút viền cao 40 (Nhận duyệt / Tiếp tục chấm). Các hàng cách nhau bằng kẻ 1px `#E5E5E5`.

### Chip trạng thái
Viền `--ink`, bo 8, cao 26, 12.5 / 600. Chờ duyệt: cặp Writing (vàng). Đang duyệt: cặp Listening (xanh). Đã duyệt: cặp Reading (xanh lá). Cần xử lý gấp: `#FDE7E7` / `#A12A2A`.

### Bảng (Điều phối chấm bài)
Nằm trong thẻ viền `--ink`. Hàng tiêu đề nền `--bg-segment`, kẻ trên và dưới 1.5px `--ink`, chữ 13 / 600 `--text-muted`. Hàng dữ liệu kẻ 1px `#E5E5E5`, padding 14×24. Ô chọn (phân công) cao 40, viền `--ink`, bo 10.

### Màn làm bài (Reading)
- Thanh trên: logo, đường dẫn + tên đề, đồng hồ (chip), nút "Lưu nháp & thoát" (viền) và "Nộp bài" (accent).
- Chia đôi: trái là passage trong thẻ (chữ 16, line-height 1.75, đánh dấu bằng nền `#FDF1D8`), có chip chọn Phần 1/2/3; phải là danh sách câu hỏi cuộn riêng.
- Lựa chọn: hàng bo 10, viền `#E5E5E5`; khi chọn thì viền `--ink`, nền `--bg-hero`, chấm tròn `--accent`.
- Thanh đáy: các ô số câu 34 px bo 8 (đã trả lời: nền accent; đang xem: viền `--ink`; chưa làm: viền xám) và "Đã trả lời x/13".

### Màn đăng nhập
Dải nền `--bg-hero`. Trái: khối đen bo 20 với tiêu đề lớn và 4 ô kỹ năng. Phải: thẻ trắng có segmented control chọn vai trò (Học viên / Trợ giảng / Quản trị), ô nhập cao 48 viền `--ink` bo 10, nút accent cao 50 full width.

### Trang chủ học viên (sau đăng nhập)
Thứ tự: menu (như landing, nút Đăng nhập thay bằng avatar) → hero → Bài làm gần đây → Bộ đề mới nhất → Reading → Listening → Từ vựng mới → Bài mẫu → footer. Không có khối CTA đăng ký.
- **Hero**: dải `--bg-hero`; trái là khối đen "Động lực mỗi ngày" (câu trích 30 / 700, vạch accent, nút "Làm tiếp bài dở" accent + "Chọn đề mới" viền trắng); phải là thẻ "Mục tiêu hôm nay" gồm vòng tiến độ 112 px và chuỗi ngày (7 chấm 30 px: ngày đã học nền accent có icon lửa, ngày chưa học viền đứt xám, kèm "Kỷ lục").

### Thẻ bài làm gần đây
Thẻ trắng viền `--ink` bo 16, padding 20: chip kỹ năng + nguồn đề (13.5 `--text-subtle`) → tên bài 18 / 600 → trạng thái → nút ở đáy.
- Đã xong (L/R): "Đúng 2/13 câu" 14.5 / 600 màu chữ Reading, icon check. Nút "Làm lại" (icon vòng lặp + mũi tên tam giác mở menu).
- Đang làm dở: thanh tiến độ cao 8 viền `--ink`, phần đã làm màu accent, kèm "11/40 câu". Nút "Làm tiếp" (icon tạm dừng màu accent).
- W/S đã nộp: chip trạng thái (Chờ duyệt…). Nút "Xem bài nộp".

### Dashboard học viên (mở từ avatar)
Bấm avatar trên menu mở menu tài khoản (thẻ 300 px: tên + mục tiêu band, Dashboard, Lịch sử luyện đề, Bài chờ chấm, Hồ sơ cá nhân, Đăng xuất). Avatar đang mở có vòng 2px `--accent`.
Trang Dashboard dùng menu của trang chủ, không có hero. Nền `--bg-subtle`, khung 1200: sidebar trái 248 (thẻ hồ sơ + thẻ menu dọc như khung làm việc) và cột nội dung gồm:
1. **Kết quả luyện tập**: 5 thẻ chỉ số (Band mục tiêu có link "Sửa", Band trung bình, Số bài đã làm, Thời gian TB / bài, Độ chính xác), icon 40 px trên nền `--bg-hero`, số 26 / 700. Bên dưới là thẻ có tab 4 kỹ năng (tab đang chọn dùng cặp màu kỹ năng + viền `--ink`) và biểu đồ cột band theo lần làm, có đường mục tiêu màu `--accent`.
2. **Lịch sử luyện đề**: bảng Ngày làm · Tên đề · Kỹ năng · Kết quả · Thời gian · nút "Xem lại".
3. **Bài đang chờ phản hồi**: hàng bài nộp W/S với chip Chờ duyệt / Đang duyệt / Đã chấm.

## 7. Responsive

- Các hàng dùng `flex-wrap` với `flex-basis` 240–300 px nên tự xuống dòng; hero chia 2 cột từ khoảng 1000 px, dưới đó xếp dọc.
- Dưới khoảng 860 px: menu gộp vào nút ☰, VI/EN và sáng/tối chuyển vào menu.
- Slider: thẻ chiếm khoảng 82% chiều rộng ở điện thoại.
- Bảng rộng (nếu có) cuộn ngang trong khung riêng; trang không bao giờ cuộn ngang.

## 8. Trợ năng

- Dùng phần tử thật: `<button>`, `<a href>`, `<input>` + `<label>`.
- Nút chỉ có icon luôn có `aria-label` ("Lưu từ", "Đổi giao diện sáng/tối").
- Màu không đứng một mình: chip kỹ năng luôn có chữ, khối màu luôn đi kèm tiêu đề.
- Chữ đạt tương phản 4.5:1 trên nền của nó.

## 9. Token CSS

```css
:root {
  --bg: #FFFFFF;
  --bg-subtle: #FAFAF9;
  --bg-muted: #F5F5F4;
  --bg-segment: #F2F2F1;
  --bg-hero: #EAF4FB;
  --ink: #1A1A1A;
  --line: #737373;
  --text-2: #3D3D3D;
  --text-muted: #5C5C5C;
  --text-subtle: #737373;
  --text-on-dark: #C9C9C6;
  --accent: #1F5FBF;
  --accent-hover: #174A94;
  --on-accent: #FFFFFF;

  --l-bg: #E3ECFB; --l-fg: #1F4FA0;
  --r-bg: #DDF3D8; --r-fg: #2B6A1F;
  --w-bg: #FDF1D8; --w-fg: #6B3A06;
  --s-bg: #EDE7FB; --s-fg: #5B3BA8;

  --block-1: #A9CBEB; --block-2: #F4B9BB; --block-3: #BAB7DD; --block-4: #BFDDB5;

  --border: 1.5px solid var(--ink);
  --shadow-card: 0 1px 2px rgba(16,24,40,.04), 0 6px 16px rgba(16,24,40,.06);
  --shadow-cta: 0 12px 32px rgba(16,24,40,.18);

  --r-badge: 8px; --r-btn-sm: 9px; --r-btn: 10px; --r-tile: 14px; --r-card: 16px; --r-panel: 20px;

  --font: "Be Vietnam Pro", "Segoe UI", system-ui, sans-serif;
  --container: 1200px; --gutter: 24px;
}

/* Chế độ tối (mục 2.5) */
:root[data-theme="dark"] {
  --bg: #181818;
  --bg-subtle: #111111;
  --bg-muted: #1F1F1F;
  --bg-segment: #242424;
  --bg-hero: #18283A;
  --ink: #EDEDED;
  --on-ink: #111111;
  --line: #4D4D4D;
  --divider: #2E2E2E;
  --text-2: #D4D4D4;
  --text-muted: #B3B3B3;
  --text-subtle: #9A9A9A;
  --accent: #4C8DEB;
  --accent-text: #6AA4F5;
  --danger: #E5484D; --danger-text: #F0675C; --danger-soft: #3D1D1A;

  --l-bg: #1C2A40; --l-fg: #9DBDF5;
  --r-bg: #1C3320; --r-fg: #9AD58A;
  --w-bg: #3A2C14; --w-fg: #F2C47A;
  --s-bg: #2A2340; --s-fg: #C3B2F5;

  --block-1: #33506E; --block-2: #6E3E40; --block-3: #4A4770; --block-4: #3F5E37;

  --shadow-card: 0 1px 2px rgba(0,0,0,.35), 0 6px 16px rgba(0,0,0,.45);
  --shadow-cta: 0 12px 32px rgba(0,0,0,.6);
}
```

## 10. Chưa chốt

- Tên sản phẩm chính thức thay cho "BandUp".
- Ảnh thật cho thẻ thay khối màu.
