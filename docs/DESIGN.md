# DESIGN.md – IELTSpace

**Nguồn duy nhất để theo dõi thiết kế giao diện.** Gộp từ `DESIGN.md` cũ (giá trị thực tế trong code), `docs/ui/design.md` (quy chuẩn gốc, mục A và mục 0) và `docs/11-quy-chuan-giao-dien.md`. Cập nhật 10/11/2026 (thêm mục "Màn làm bài").

- Nguồn mẫu hình ảnh vẫn là canvas "IELTSpace · Giao diện" (https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V; bản chép ở `docs/ui/canvas/`). Tên màn trùng tên trang trong `frontend/src/app/pages.ts`.
- Khi file này mâu thuẫn với các mục cũ (v1, v2) của `docs/ui/design.md`, **file này thắng**. `docs/ui/design.md` chỉ còn để tra lịch sử.
- Khi giá trị trong code lệch file này, ghi vào mục 8 rồi sửa code hoặc sửa file, không để lệch ngầm.
- Sửa file này thì phản ánh ngược lên canvas.

## 1. Nguyên tắc

1. **Nền kem, thẻ trắng.** Nền trang `#FCFBF7`; thẻ, ô nhập, nút viền dùng trắng.
2. **Xanh trời là màu nhấn duy nhất** (link, logo, mục đang chọn, focus).
3. **Aubergine thay đen** cho chữ chính, nút chính, khối CTA.
4. **Viền mềm** `#D6D4D0` chỉ để tách khối; ô nhập viền đậm hơn `#8E8392`.
5. **Bo tròn:** nút và chip kiểu viên thuốc (999), thẻ 22, khung lớn 26.
6. **Một hành động chính mỗi khu vực.** Màu kỹ năng nhất quán ở mọi trang. Chữ hiển thị bằng tiếng Việt có dấu.

## 2. Màu

### Sáng

| Token | Giá trị | Dùng cho |
|---|---|---|
| paper | `#FCFBF7` | Nền trang |
| paper-deep | `#FAF9F5` | Nền khu làm việc Giáo viên, Quản lý |
| card / surface | `#FFFFFF` | Thẻ, ô nhập, nút viền |
| hover-soft | `#F3F0EA` | Nền hover menu |
| surface-3 | `#EFE8DB` | Nhóm nút chọn |
| divider | `#E6E4E0` (đường kẻ), `#F3F0EA` (nhạt) | Vạch kẻ trong bảng, thẻ |
| line | `#D6D4D0` | Viền thẻ, chip, thanh điều hướng |
| input-line | `#8E8392` (3.6:1) | Viền ô nhập |
| ink | `#352637` Aubergine (13.1:1) | Chữ chính, nút chính, khối CTA |
| text-2 | `#4B3D4D` | Chữ phụ |
| text-muted | `#6A5D6C` | Mô tả, meta |
| text-subtle | `#706473` | Nhãn nhỏ, số lượt |
| accent | `#2963CC` (hover `#2257B8`) | Link, logo, nút nhấn, focus ring |
| accent-soft / sky-soft | `#E3ECFD` | Mục đang chọn, ghi chú, dải "Chỉ xem" |
| hero | `linear-gradient(135deg, #E3ECFD, #E6F3EC)` | Dải hero, đầu trang thư viện |
| danger-bg | `#E5604A` | Chấm đỏ, huy hiệu số |
| danger-text | `#C0412A` (5.2:1), viền `#F1B3A3` | Hủy, Xóa, Đăng xuất, Không lưu |
| danger-soft | `#FBDCD3` | Chip "Đã hủy", hộp thoại lỗi, FAQ đang mở |

Màu trang trí: coral `#F27D65`, mint `#C5DECE`, butter `#F4D66F`.

### Màu kỹ năng (nền / chữ)

| Kỹ năng | Sáng | Tối |
|---|---|---|
| Listening (xanh trời) | `#DDE8FC` / `#2A55B8` | `#1F2842` / `#A9C2F7` |
| Reading (mint) | `#DCEDE2` / `#2E6A48` | `#1D2F27` / `#A7D7B6` |
| Writing (butter) | `#FBEDBF` / `#7A5A0E` | `#352E18` / `#F4D66F` |
| Speaking (xanh tím) | `#E8E4FA` / `#5543B0` | `#282543` / `#C3B9F7` |

Khối minh họa (bìa khi chưa có ảnh thật): `#BFD8F7` xanh trời · `#F7C4B6` coral nhạt · `#C5CEF5` xanh tím · `#C5DECE` mint. Dùng xoay vòng, hai thẻ cạnh nhau không trùng màu.

### Tối

Chốt nền `#202125` (xám lạnh) ngày 30/10; xem trước ở `docs/ui/bang-mau-toi-v3.html`. Lớp `dark` trên `<html>`, lưu ở `localStorage 'ieltspace-app'`, nút bật tắt có thuộc tính `data-theme-toggle`. Bản tối cho từng màn làm sau khi chốt bản sáng. Ánh xạ từng mã màu ở `frontend/src/lib/dark-palette.json`; `cssText`/`styleOf` tự đổi khi render. **Màu mới dùng trong style inline phải có trong file này**, nếu không sẽ giữ màu sáng.

| Token | Giá trị |
|---|---|
| paper / paper-deep | `#202125` / `#1A1B1E` |
| surface / surface-3 | `#292A2E` / `#333438` |
| divider / line / input-line | `#3B3C41` / `#46474D` / `#85868D` |
| ink (nút chính: nền này, chữ `#202125`) | `#F1F2F4` |
| text-2 / muted / subtle | `#D5D6DA` / `#B2B3B9` / `#9FA0A7` |
| accent (nền / chữ) | `#4A7FE6` / `#8DB0F7` |
| sky-soft | `#26314D` |
| danger (nền / chữ) | `#D9553F` / `#F49A85` |

## 3. Chữ

| Font | Dùng cho |
|---|---|
| Inter (dự phòng Be Vietnam Pro) | Giao diện |
| IBM Plex Serif 500–700 | Tiêu đề và tên thẻ từ 20px |
| IBM Plex Mono 500–600 | Số liệu lớn (band, số bài, %, đếm ngược) |

### Thang cỡ chữ (px, đồng bộ 08/11/2026)

Chỉ dùng số nguyên, không dùng cỡ lẻ nửa pixel.

| Cỡ | Vai trò |
|---|---|
| 11 | Badge, nhãn "Mới" (đậm 700) |
| 12 | Overline, meta nhỏ (in hoa, letter-spacing .08em) |
| 13 | Caption, mô tả phụ, ô bảng dày (phổ biến nhất) |
| 14 | Chữ UI chính: menu, nút, nội dung thẻ, một dòng meta |
| 15 | Đoạn văn đọc, câu hỏi |
| 16 | Chữ nhấn, tiêu đề thẻ nhỏ |
| 18 | Tiêu đề thẻ (600), logo sidebar |
| 20 · 22 | Tiêu đề khối |
| 24 · 28 | Tiêu đề khối, tiêu đề trang |
| 32 · 36 · 40 · 48 | Số liệu lớn, hero |

Đã gộp: 10, 10.5 → 11; 13.5 → 13; 14.5 → 14; 15.5 → 15; 16.5 → 16; 17, 19 → 18; 21 → 20; 26, 30 → 28; 34 → 32; 38 → 36; 44 → 40. Cỡ trong SVG biểu đồ (`fontSize="…"`) và `clamp()` hero đăng nhập giữ nguyên.

## 4. Khoảng cách, bo góc, viền

- Lưới **4px**: mọi khoảng cách và kích thước chia hết cho 4 (ngoại lệ lịch sử xem mục 8).
- **Thang bo góc chốt 09/11/2026:** 8 (chip nhỏ, ô nhỏ) · 10 (nav, menu, nút, ô nhập, ô logo) · 12 (bìa, nút lớn, thẻ nhỏ) · 16 (thẻ vừa, menu, khối) · 22 (thẻ chuẩn, CTA, FAQ) · 26 (khung lớn) · 999 (viên thuốc, chip, badge) · 50% (tròn). Đã gộp 9, 11 → 10; 7 → 8; 14 → 12; 18 → 16; 20 → 22. Không dùng giá trị khác khi viết mới.
- **Viền:** khung (thẻ, chip, nút, ô nhập, nút phân trang) luôn 1.5px; vạch kẻ phân cách luôn 1px (xem ngoại lệ bên dưới). Không đổ bóng đậm.
- Sidebar Quản lý rộng 248, thu gọn 76, nhớ ở `localStorage 'ieltspace-admin-nav'`. Mục nav cao 44, icon 19.

### Ngoại lệ có chủ đích về viền

- Đường kẻ phân cách (`border-top/bottom` 1px `#E6E4E0`, `#F3F0EA`): 1px. Chỉ là vạch chia trong bảng hoặc thẻ, không phải khung.
- Thanh tiến độ cao 8px (`border: 1px solid #DDDBD7`): 1px.
- Viền trắng 2px quanh chấm đỏ, huy hiệu số, avatar: 2px.
- Viền 2px accent `#2963CC` cho trạng thái được chọn hoặc vùng thả tệp: 2px.

## 5. Chuyển động

Định nghĩa ở `frontend/src/styles/motion.css`.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--mo-fast` | .16s | Hover, đổi màu, nhấn |
| `--mo-med` | .22s | Sidebar, mũi tên xoay, đổ bóng |
| `--mo-slow` | .28s | Hộp thoại, accordion, ngăn kéo |
| `--mo-ease` | `cubic-bezier(.2,.8,.2,1)` | Mọi chuyển động vào/ra |

Hành vi: link và nút sáng/tối nhẹ khi hover, co 3% khi nhấn; thẻ là link (`a[href]`) bo 16/22 nổi lên 2px; hàng bảng sáng khi hover; dropdown `.bu-dd` mờ dần và trượt; hộp thoại, menu, toast, ngăn kéo tự có animation vào; `<details>` mở mượt. Class dùng thủ công: `an-fade`, `an-pop`, `an-drop`, `an-toast`, `an-check`, `an-rise`, `an-spin`, `lift`, `press`, `thumb-h`. `prefers-reduced-motion` tắt tất cả. Animation vào dùng `transform`, nên phần tử tự căn giữa bằng `transform` inline chỉ được fade.

## 6. Thành phần dùng chung

### Nút, chip, nhãn
- **Nút chính:** nền ink, chữ trắng, bo 12, cao 44–46. **Nút viền:** nền trắng, viền ink hoặc line. **"Làm bài" (đề lẻ):** nút viền cao 44, bo 12.
- **Nút destructive** (mọi Hủy/Xóa, icon thùng rác, "Đăng xuất", "Không lưu"): nền trắng, chữ `#C0412A`, viền 1.5px `#F1B3A3`.
- **Chip kỹ năng:** bo 999, cặp màu kỹ năng. **Chip dạng bài:** mỗi dạng một màu pastel.
- **Focus:** viền 2px accent, offset 2px (ô nhập offset 0), vòng sáng 3px khi focus ô nhập.
- **Nhãn trạng thái:** bài W/S (Đã lưu · chưa gửi chấm, Chờ phân công, Chờ chấm, Đã có kết quả, Đã hủy · đã hoàn bonus; Giáo viên thấy thêm Chưa có điểm, Có bản nháp); nội dung (Công khai / Bản nháp / Đã ẩn); tài khoản (Hoạt động / Bị khóa / Đã xóa); quyền chấm (Đang nhận bài / Ngừng nhận bài mới / Đã thu hồi). Chấm đỏ nhỏ đánh dấu bài W/S mới có kết quả hoặc vừa bị hủy; chuông thông báo có chấm đỏ số chưa đọc.

### Thẻ chuẩn (Landing, thư viện, bài mẫu)
Áp cho Main, StudentLanding, FullTests, SampleLibrary, PracticeLibrary (lưới và danh sách).

- Nền trắng, bo 22, viền 1.5px `#D6D4D0`, padding 12/12/16. Bìa `overflow: hidden`.
- **Bìa tỉ lệ 3:2**, bo 12, màu phẳng từ khối minh họa. Ảnh thật khác tỉ lệ thì fit (contain) trên nền màu, không cắt. Kích thước trong màn Quản lý: ô tải ảnh 240×160, thumb 48×32, bìa trang thông tin bộ đề 144×96, bìa ở ExamDetail 288×192; cảnh báo khi ảnh lệch tỉ lệ quá ngưỡng 1.5. `exam_sets.cover_url`.
- Badge viên thuốc: "Mới", "N câu" góc phải trên; "Đã làm" nền xanh lá nhạt góc trái trên.
- Tiêu đề 18/600, **một dòng meta** 14px, chip dưới tiêu đề (bài mẫu). Mô tả cắt 2 dòng.
- CTA: bộ đề = link "Xem bài test ›"; bài mẫu = link "Xem bài mẫu ›"; đề lẻ = nút viền "Làm bài".
- **Thẻ bài mẫu Speaking có audio ngay trong thẻ** (Part 1, 2, 3): nút phát tròn, thanh thời gian, mỗi câu một audio; Part 2 một audio.

### Thành phần trang chủ Khách
Thẻ số liệu nghiêng (bo 26, số 40px, xoay -6°, 3°, -2°, 5°); FAQ accordion (khung bo 20, đánh số 01, 02…, câu mở nền danger-soft); khối CTA nền ink, chữ trắng, nút xanh trời.

### Khung trang
- **Khách / Người học:** top nav "Thư viện đề · Thư viện bài mẫu · Thư viện từ vựng" + Đăng nhập (Khách), hoặc thêm "Flashcard của tôi" + avatar (Người học). Avatar mở menu: tiến độ/dashboard, hồ sơ, cài đặt. Không có chip streak trên nav.
- **Quản lý:** AdminSidebar + AdminTopbar (xem "Màn Quản lý").
- **Giáo viên:** chưa chuyển sang khuôn sidebar/topbar chung (còn hoãn).
- Thông báo và Hồ sơ Giáo viên/Quản lý: một artboard nhiều biến thể trên canvas; khi code tách route riêng theo vai trò.

### Xác thực
Login / Register là trang 2 nửa: AuthHero gradient bên trái, form bên phải. Trang riêng CheckEmail, ForgotPassword, ResetPassword. Có nút đăng nhập/đăng ký Google. Link "Về trang chủ" ở bên trái.

### Popup / hộp thoại
Nền mờ tối, thẻ trắng bo 22, nút chính bên phải, Hủy bên trái (destructive nếu hủy dữ liệu).

### Màn Quản lý
- **AdminSidebar** (prop `active`) + **AdminTopbar** (prop `crumb`; avatar mở menu Hồ sơ, Giao diện Sáng/Tối, Đăng xuất). Nút Sáng/Tối và Đăng xuất không đặt trong sidebar.
- Nền khu làm việc paper-deep, thẻ và bảng trắng. Chọn ngày dùng Date Picker.
- Danh sách: thanh lọc trên cùng, bảng hoặc thẻ bên dưới, hành động chính góc phải trên (nút xanh "Thêm …").
- Nội dung có 3 trạng thái Bản nháp / Công khai / Đã ẩn. Bài đã công khai thì khóa chỉnh sửa, hiện nút "Sửa"; nút "Đăng" chỉ hiện ở chế độ xem sau khi "Lưu".

## 7. Màn và luồng

Canvas xếp theo role: **Khách và xác thực → Người học → Giáo viên → Quản lý**; mỗi nghiệp vụ một hàng, màn nối từ trái sang phải theo luồng. Danh sách màn:

| Role | Nghiệp vụ | Màn |
|---|---|---|
| Khách | Landing, đăng nhập | Main, AvatarMenu, Login, Register |
| | Quên mật khẩu | ForgotPassword, CheckEmail, ResetPassword |
| Người học | Trang chủ, thư viện đề | StudentLanding, StudentHome, FullTests, ExamDetail, PracticeLibrary |
| | Làm bài | ReadingTest, ListeningTest, WritingTest, SpeakingTest, SubmitDialogs |
| | Kết quả, bài đã làm | ResultLR, ResultWS, MyWS, PracticeWS |
| | Bài mẫu | SampleLibrary → SampleWriting / SampleSpeaking |
| | Từ vựng | Vocab, Flashcard |
| | Hồ sơ, thông báo | Profile, Notifications |
| Giáo viên | Chấm bài | TeacherHome, TeacherQueue, TeacherGrade, TeacherHistory, StaffProfile |
| Quản lý | Tổng quan, người dùng, chấm | AdminHome, AdminUsers, AdminGrading |
| | Bộ đề, đề thi | AdminExams, AdminExamSet, Admin{Reading,Listening,Writing,Speaking}Editor |
| | Thẻ câu hỏi | QuestionCards, QuestionCard |
| | Bài mẫu | AdminSamples, AdminSampleWriting, AdminSampleSpeaking |

Giải thích từng trang và liên kết: `docs/ui/trang-va-lien-ket.md`.

### Editor đề và bài mẫu
- Reading: split editor (Doc + board); Listening: 4 section, ghi âm, transcript có mốc giờ, Map Labelling; Writing: 2 Task, ảnh đề Task 1, Academic/General; Speaking: 3 Part. Thẻ câu hỏi có 16 dạng (`QuestionCards`).
- Bài mẫu: một editor cho mỗi kỹ năng; Writing một editor cho Task 1 và 2; **Speaking một editor cho cả Part 1, 2, 3**, mỗi mục có câu hỏi, câu trả lời mẫu, audio riêng. Ảnh bìa chỉ hiện ở thẻ, không nằm trong nội dung bài mẫu.
- **Luôn mở ở chế độ Chỉ xem** (ngoại lệ: "Thêm bài mẫu" vào thẳng Chỉnh sửa). Chỉ xem: chip "Chỉ xem", dải sky-soft có icon khóa, ô nhập thành khối nền surface-2 không viền, nút thêm/xóa nhỏ ẩn (lớp `.eo`); thanh trên có Nhập từ xlsx, **Chỉnh sửa**, Đăng. Chỉnh sửa: chip "Đang chỉnh sửa", thanh trên có trạng thái thay đổi, Hoàn tác, **Hủy** (destructive), **Lưu**. Hủy khi còn thay đổi hỏi Tiếp tục sửa / Không lưu / Lưu.
- Trang bài mẫu của Người học: breadcrumbs, mục lục scrollspy bên trái, nội dung bên phải; Speaking chia mục theo Part, mỗi câu hỏi một thẻ có audio.

### Màn làm bài (chốt 09/11/2026)
Màn: StartTestDialog, ReadingTest, ListeningTest, WritingTest, SpeakingTest (chờ draft), SubmitDialogs. Chưa có trong `pages.ts`/code, canvas bản 237 là mẫu.

- **Lối vào:** đề theo kỹ năng (ví dụ "Test 1 · Listening") là thẻ ở Landing và tab kỹ năng của Thư viện đề, bấm là làm luôn. StartTestDialog chỉ chọn chế độ (Practice / Real Test) và phần. Practice chọn Part/Section; Question Group là bài tập nhỏ riêng trong PracticeLibrary, vào thẳng màn làm bài.
- **Chế độ:** Practice đếm lên, chỉ hiện số câu đúng; Real Test đếm ngược, mới có band. Writing Practice = 1 Task đếm lên; Real Test = 2 Task, 60 phút đếm ngược.
- **TestTopbar** (một thanh trên duy nhất, đã gộp toolbar): đồng hồ, nút Aa (cỡ chữ 90–150%, gốc 15px, làm tròn 14–22px, ngoại lệ thang chữ), Sáng/Tối. Ở Reading có thêm cụm cố định Highlight / Ghi chú / Xóa highlight. Sáng/Tối chỉ đổi trong lúc làm bài, dùng bảng tối ở mục 2, khóa riêng `ieltspace-test-theme`, không ghi `ieltspace-app`. **TestProgressBar** tính theo Passage/Section; ô số câu có cờ "Xem lại", hộp nộp bài liệt kê câu gắn cờ và câu thiếu.
- **Reading:** mặc định chia đôi. Công cụ Con trỏ (mặc định) / Highlight (bôi là tô ngay). Mỗi highlight có một ghi chú tùy chọn; cột Highlight bên phải (chip "Highlight n", thẻ đoạn trích + ghi chú, bấm thì cuộn tới vị trí, trạng thái trống có 2 bước hướng dẫn). Lưu cùng "Làm tiếp". 5 màu (nền sáng / nền tối / vạch): Vàng mặc định `#FCE8A6`/`#5C4A14`/`#E0B323`, Xanh lá `#CDEBD5`/`#234A33`/`#3E9A63`, Xanh dương `#D3E2FB`/`#24395E`/`#3B6FD8`, Hồng `#F9D5DE`/`#5A2735`/`#D2577A`, Tím `#E2DAF8`/`#3B3166`/`#7A63D1`.
- **Listening:** Real Test tự phát, nghe một lần; Practice có phát/dừng, tốc độ, xem transcript sau khi nộp.
- **Writing:** giấy kẻ dòng, đếm từ (không đổi màu), Notes ngay dưới đề bài của từng Task; Notes chỉ lưu cùng bài và không gửi cho Giáo viên.
- **Thoát / mất mạng:** đồng hồ dừng ở cả hai chế độ; hộp "Lưu và thoát?" trong SubmitDialogs; ConnectionBanner báo mất mạng; tạm lưu và "Làm tiếp" ở Landing. Chưa đăng nhập thì chuyển Login rồi quay về đề.

## 8. Cách viết style trong code

- Nhiều trang là class component chuyển từ canvas, dùng style inline qua `styleOf("…")`. Giữ kiểu hiện có của từng file.
- Motion layer bám vào chuỗi style inline (ví dụ `[style*="border-radius: 22px"]`). Đổi cách viết `border-radius` hay `display` trong inline style có thể làm mất hiệu ứng hover.
- `sessionStorage` chuyển dữ liệu giữa trang (`{at, v}`); `localStorage` chỉ cho tiện ích từng người (thu gọn sidebar, chế độ tối).

## 9. Còn lệch / chưa làm

| Hạng mục | Hiện trạng | Chuẩn |
|---|---|---|
| Bo 2–6px (2, 3, 4, 6) trong code và canvas | Dùng cho thanh tiến độ, cột biểu đồ, chấm nhỏ | Giữ là ngoại lệ; canvas còn bo cũ 14/18/20 cần cập nhật theo thang mới |
| Chế độ tối cho màn mới (thẻ, editor bài mẫu) | Chưa làm hết | Cần có trong `dark-palette.json` |
| Sidebar Giáo viên | Chưa theo khuôn AdminSidebar | Theo AdminSidebar |
| Ảnh thật thay khối màu; "Xem thêm" và dữ liệu thật cho SampleLibrary; từ vựng và bài tập cho bài mẫu | Chưa làm | |

Đã đồng bộ: cỡ chữ, destructive `#C0412A`, chữ phụ `#706473`, viền khung 1.5px, bo 9/11 → 10 và 7 → 8, tiêu đề 30 → 28.

---

## 10. Đối chiếu với mã nguồn ngày 11/11/2026

Các mục 1–9 ở trên là quy chuẩn thiết kế gốc. Các số đo dưới đây mô tả từng màn hình tại thời điểm đối chiếu. Trang học và trang chi tiết đề dùng nền giấy sáng, nội dung đọc có cấp bậc rõ. Màn hình nhân viên ưu tiên bảng, thanh điều hướng bên và vùng nội dung cuộn độc lập. Các giá trị dưới đây lấy từ CSS và component hiện có.

### Màu sắc và chữ

| Vai trò | Kiểu đang dùng | Áp dụng |
|---|---|---|
| Nền và chữ sáng | Nền #FCFBF7, bề mặt trắng, chữ #352637, chữ phụ #706473 | Trang chi tiết đề và Auth. Nút chính Auth nền #352637, hover #4B3D4D. |
| Tương tác | Link và viền focus #2963CC | Ô nhập Auth có outline 2 px lệch 2 px. Link trong form gạch chân khi hover. |
| Phản hồi | Lỗi nền #FBDCD3, chữ #9D301E. Thành công nền #E6F3EC, chữ #24543D. | Notice hiển thị thông điệp bằng chữ và dùng alert/status. |
| Tối | Nền trang #202125, bề mặt của nút chọn theme #292A2E, viền #46474D, chữ #F1F2F4 | Theme áp trên html.dark. styleOf chuyển màu theo vai trò nền, viền, chữ và bóng qua dark-palette.json. Kiểm tra component ở cả hai chế độ. |
| Chữ | Auth dùng Inter, dự phòng Be Vietnam Pro/sans-serif. Tiêu đề form IBM Plex Serif 600, 32 px, line-height 1.2. Nội dung 14 px, nhãn 13 px. | fonts.css nhúng WOFF2 và còn khai báo IBM Plex Mono. Chưa xác định được tệp giấy phép tương ứng trong các tệp mã nguồn đã rà soát. |

#### Nhận diện bốn kỹ năng

ExamDetail ghép chữ cái, tên kỹ năng và cặp màu. Giữ cả ký hiệu lẫn tên khi không gian cho phép để người đọc nhận ra kỹ năng kể cả khi khó phân biệt màu.

| Ký hiệu | Kỹ năng | Nền sáng | Chữ sáng | Nền tối theo dark-palette |
|---|---|---|---|---|
| L | Listening | #DDE8FC | #2A55B8 | #1F2842 |
| R | Reading | #DCEDE2 | #2E6A48 | #1D2F27 |
| W | Writing | #FBEDBF | #7A5A0E | #352E18 |
| S | Speaking | #E8E4FA | #5543B0 | #282543 |

### Kích thước và bố cục

- **Form Auth.** Hai cột bằng nhau, form rộng tối đa 400 px. Khoảng cách giữa các cụm 18 px, giữa trường 14 px, giữa nhãn và ô 6 px. Ô nhập cao 44 px, bo 12 px. Nút cao tối thiểu 44 px, bo tròn 999 px. Hộp thông báo bo 10 px. Thẻ Auth dùng bóng nhẹ `0 4px 24px #3526370b`.
- **Màn hình hẹp hoặc thấp.** Auth chuyển một cột và ẩn hero ở chiều rộng ≤900 px. Khi rộng ≥901 px nhưng cao ≤760 px, form thu còn tối đa 350 px và điều khiển chính còn 40 px. Đây là breakpoint riêng của Auth. Với trang nhân viên, kiểm tra menu, bảng và cuộn trong vùng nội dung ở kích thước mục tiêu.
- **Khung làm việc.** app-shell cao 100dvh, sidebar giữ chiều rộng, app-content cuộn. Dùng lại AdminSidebar, TeacherSidebar, AdminTopbar, NotificationBadge và AccountMenu khi mở rộng màn hình cùng vai trò.
- **Thẻ đề.** Ảnh bìa theo tỷ lệ 3:2 đã ghi trong rà soát 10/11. Giữ tên bộ đề bằng chữ và dùng nhãn truy cập cho ảnh/nút. Dùng QuestionCard cho cấu trúc câu hỏi tương ứng.

### Phản hồi và khả năng tiếp cận

AuthFields gắn input vào label. GoogleButton khóa thao tác lặp, đặt aria-busy và đổi chữ sang “Đang chuyển…”. Notice dùng role=alert cho lỗi và role=status cho thông điệp. Các nút chỉ có biểu tượng cần tên truy cập, còn SVG trang trí dùng aria-hidden. ExamDetail có kiểu focus và tắt chuyển động khi prefers-reduced-motion. Khi bổ sung dữ liệu thật, phân biệt tải, danh sách rỗng và lỗi tải bằng thông điệp cụ thể, giữ khả năng thử lại khi phù hợp.

### Điểm và thời hạn trên màn hình kết quả

Theo [quy tắc nghiệp vụ](BUSINESS_RULES.md), hiển thị số đúng/tổng và tỷ lệ ở bài luyện L/R, ghi “band tham khảo” khi bài đủ điều kiện. W/S chưa chấm ghi “Chưa có điểm”. Nêu rõ Task/Part nếu chỉ đánh giá một phần. Hiển thị hạn tải theo mốc backend trả về. Khi quá hạn, bỏ thao tác tải nhưng vẫn trình bày điểm và nhận xét đã công bố. Đây là tiêu chí khi nối dữ liệu thật cho các màn hình kết quả.

Đối chiếu trực tiếp [CSS Auth](../frontend/src/components/auth/auth.css), [AuthFields](../frontend/src/components/auth/AuthFields.jsx), [khung trang và theme](../frontend/src/styles/globals.css), [font](../frontend/src/styles/fonts.css), [ánh xạ màu](../frontend/src/lib/styles.ts) và [chi tiết bộ đề](../frontend/src/pages/exams/ExamDetail.tsx).

Trong mục 7, ghi chú về các màn làm bài phản ánh thời điểm chốt thiết kế. Hiện [danh sách trang](../frontend/src/app/pages.ts) đã khai báo ReadingTest, ListeningTest, WritingTest và SpeakingTest. Việc khai báo trang chỉ xác nhận có giao diện trong mã nguồn.
