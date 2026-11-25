# DESIGN.md – IELTSpace

**Nguồn duy nhất để theo dõi thiết kế giao diện.** Gộp từ `DESIGN.md` cũ (giá trị thực tế trong code), `docs/ui/design.md` (quy chuẩn gốc, mục A và mục 0) và `docs/11-quy-chuan-giao-dien.md`. Cập nhật 21/11/2026: dò lại luồng Quản lý bộ đề, Thông tin bộ đề và các Editor; chốt bộ component dùng chung ở mục 12 (khung Quản lý), trạng thái component ở mục 13, quy tắc áp dụng ở mục 14. Khi mục 6 mâu thuẫn với mục 12 thì **mục 12 thắng** cho khung Quản lý.

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

### Token bổ sung (đã dùng trong code, 21/11/2026)

Mọi mã dưới đây đã có ánh xạ tối trong `dark-palette.json`. Viết style inline thì dùng đúng mã; viết bằng class Tailwind `[#hex]` thì **không** được đổi sang tối tự động.

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| danger-line | `#F1B3A3` | `#7A4238` | Viền nút/ô destructive, hộp lỗi |
| danger-surface | `#FDF3F0` | `#3A2A28` | Nền hover nút destructive, hộp lỗi nhẹ |
| danger-solid | `#C0412A` (hover `#A33420`) | `#D9553F` | Nút xác nhận xóa, chữ lỗi |
| success-solid | `#2E7D4F` | `#3E9A63` (chữ `#7FCB9B`) | Toast thành công, nút "Công bố" |
| success-surface | `#E2F3E7` | `#213A2D` | Nền hover nút success, hộp thành công |
| text-disabled | `#B5ADB7` | `#74757C` | Chữ nút/ô bị khóa |
| line-soft | `#EAE7E2` | `#37383C` | Viền nút icon bị khóa |
| warning-surface | `#FDF4D9` / `#FBF4DD` | `#332D1A` | Dải cảnh báo nhẹ |
| teal (Academic) | `#DFF1F4` / `#1F6A78` | `#1F3338` / `#8FCBD6` | Chip phân loại bài |
| orange (General) | `#FCE6D6` / `#9A4A17` | `#3D2E22` / `#F0B27A` | Chip phân loại bài |

**Mã lệch cần gộp khi sửa tới** (không dùng cho code mới): `#E5E0D8` → divider `#E6E4E0` hoặc line `#D6D4D0`; `#FAF9F7` → paper-deep `#FAF9F5`; `#A89CA8` → text-subtle `#706473` (placeholder dùng `#8E8392`); `#2A1F2D`, `#554756`, `#5B4E5F`, `#3D2F40` → ink `#352637` hoặc text-2 `#4B3D4D`; `#1E40AF`, `#2050A8` → accent `#2963CC`; `#EFF6FF`, `#BFDBFE` → sky-soft `#E3ECFD` và `#C9D8F5`.

### Màu kỹ năng (nền / chữ)

| Kỹ năng | Sáng | Tối |
|---|---|---|
| Listening (xanh trời) | `#DDE8FC` / `#2A55B8` | `#1F2842` / `#A9C2F7` |
| Reading (mint) | `#DCEDE2` / `#2E6A48` | `#1D2F27` / `#A7D7B6` |
| Writing (butter) | `#FBEDBF` / `#7A5A0E` | `#352E18` / `#F4D66F` |
| Speaking (xanh tím) | `#E8E4FA` / `#5543B0` | `#282543` / `#C3B9F7` |

Khối minh họa (bìa khi chưa có ảnh thật): `#BFD8F7` xanh trời · `#F7C4B6` coral nhạt · `#C5CEF5` xanh tím · `#C5DECE` mint. Dùng xoay vòng, hai thẻ cạnh nhau không trùng màu.

### Tối

Chốt nền `#202125` (xám lạnh) ngày 30/10; xem trước ở `docs/ui/bang-mau-toi-v3.html`. Lớp `dark` trên `<html>`, lưu ở `localStorage 'ieltspace-app'`, nút bật tắt có thuộc tính `data-theme-toggle`. Bản tối cho từng màn làm sau khi chốt bản sáng. Ánh xạ từng mã màu ở `frontend/src/assets/theme/dark-palette.json`; `cssText`/`styleOf` tự đổi khi render. **Màu mới dùng trong style inline phải có trong file này**, nếu không sẽ giữ màu sáng.

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

Font của IELTSpace: **Inter** (không chân) và **IBM Plex Serif** (có chân).

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
- **Khung Quản lý và Editor:** dùng bộ nút ở mục 12.1 (cao 38, bo 999).
- **Khung Khách / Người học:** **nút chính** nền ink, chữ trắng, bo 12, cao 44–46. **Nút viền:** nền trắng, viền ink hoặc line. **"Làm bài" (đề lẻ):** nút viền cao 44, bo 12.
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
- **Flashcard:** nút “Ôn bằng flashcard” nằm trong bộ từ với tài khoản đã đăng nhập. Trang Flashcard dùng banner và tab của thư viện từ vựng, gồm Chọn bộ ôn, Lịch sử ôn và Từ chưa nhớ. Mọi nguồn đi qua cùng form thiết lập số thẻ và thời gian. Trong phiên ôn, người học lật thẻ rồi chọn “Chưa nhớ” hoặc “Đã nhớ”.
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
| | Thẻ câu hỏi | components/exams/lr-editor/cards/* |
| | Bài mẫu | AdminSamples, AdminSampleWriting, AdminSampleSpeaking |

Giải thích từng trang và liên kết: `docs/ui/trang-va-lien-ket.md`.

### Editor đề và bài mẫu
- Reading: split editor (Doc + board); Listening: 4 section, ghi âm, transcript có mốc giờ, Map Labelling; Writing: 2 Task, ảnh đề Task 1, Academic/General; Speaking: 3 Part. Thẻ câu hỏi có 16 dạng (`lr-editor/cards/*`).
- Bài mẫu: một editor cho mỗi kỹ năng; Writing một editor cho Task 1 và 2; **Speaking một editor cho cả Part 1, 2, 3**, mỗi mục có câu hỏi, câu trả lời mẫu, audio riêng. Ảnh bìa chỉ hiện ở thẻ, không nằm trong nội dung bài mẫu.
- **Luôn mở ở chế độ Chỉ xem** (ngoại lệ: "Thêm bài mẫu" vào thẳng Chỉnh sửa). Chỉ xem: chip "Chỉ xem", dải sky-soft có icon khóa, ô nhập thành khối nền surface-2 không viền, nút thêm/xóa nhỏ ẩn (lớp `.eo`); thanh trên có Nhập từ xlsx, **Chỉnh sửa**, Đăng. Chỉnh sửa: chip "Đang chỉnh sửa", thanh trên có trạng thái thay đổi, Hoàn tác, **Hủy** (destructive), **Lưu**. Hủy khi còn thay đổi hỏi Tiếp tục sửa / Không lưu / Lưu.
- Thư viện bài mẫu của Người học dùng banner chuyển màu ngang toàn trang. Thanh lọc trên danh sách gồm tab kỹ năng, loại bài và ô tìm tiêu đề hoặc chủ đề trong phạm vi đã chọn. Danh sách chia theo nhóm Writing Task 1 General, Writing Task 1 Academic, Writing Task 2 và Speaking. Chi tiết bài có breadcrumb, nội dung bên trái và mục lục theo vị trí cuộn bên phải trên desktop. Ảnh bìa nằm trên thẻ thư viện, ảnh đề và audio nằm trong bài.

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

#### Nhận diện bốn kỹ năng

ExamDetail ghép chữ cái, tên kỹ năng và cặp màu. Giữ cả ký hiệu lẫn tên khi không gian cho phép để người đọc nhận ra kỹ năng kể cả khi khó phân biệt màu. Nút "Làm bài" trong ExamDetail không tô màu theo kỹ năng: dùng một kiểu chung, viền và chữ #352637 trên nền #FFFFFF.

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
- **Thẻ đề.** Ảnh bìa theo tỷ lệ 3:2 đã ghi trong rà soát 10/11. Giữ tên bộ đề bằng chữ và dùng nhãn truy cập cho ảnh/nút. Dùng các component thẻ câu hỏi cho cấu trúc câu hỏi tương ứng.

### Phản hồi và khả năng tiếp cận

AuthFields gắn input vào label. GoogleButton khóa thao tác lặp, đặt aria-busy và đổi chữ sang “Đang chuyển…”. Notice dùng role=alert cho lỗi và role=status cho thông điệp. Các nút chỉ có biểu tượng cần tên truy cập, còn SVG trang trí dùng aria-hidden. ExamDetail có kiểu focus và tắt chuyển động khi prefers-reduced-motion. Khi bổ sung dữ liệu thật, phân biệt tải, danh sách rỗng và lỗi tải bằng thông điệp cụ thể, giữ khả năng thử lại khi phù hợp.

### Điểm và thời hạn trên màn hình kết quả

Theo [quy tắc nghiệp vụ](BUSINESS_RULES.md), hiển thị số đúng/tổng và tỷ lệ ở bài luyện L/R, ghi “band tham khảo” khi bài đủ điều kiện. W/S chưa chấm ghi “Chưa có điểm”. Nêu rõ Task/Part nếu chỉ đánh giá một phần. Hiển thị hạn tải theo mốc backend trả về. Khi quá hạn, bỏ thao tác tải nhưng vẫn trình bày điểm và nhận xét đã công bố. Đây là tiêu chí khi nối dữ liệu thật cho các màn hình kết quả.

Đối chiếu trực tiếp [CSS Auth](../frontend/src/components/auth/auth.css), [AuthFields](../frontend/src/components/auth/AuthFields.jsx), [khung trang và theme](../frontend/src/assets/css/app.css), [font](../frontend/src/styles/fonts.css), [ánh xạ màu](../frontend/src/lib/shared/styles.ts) và [chi tiết bộ đề](../frontend/src/pages/exams/ExamDetail.tsx).

Trong mục 7, ghi chú về các màn làm bài phản ánh thời điểm chốt thiết kế. Hiện [danh sách trang](../frontend/src/app/pages.ts) đã khai báo ReadingTest, ListeningTest, WritingTest và SpeakingTest. Việc khai báo trang chỉ xác nhận có giao diện trong mã nguồn.

---

## 11. Bố cục thích ứng (Responsive) cho người học (cập nhật 15/11/2026)

### LearnerHeader ở 3 mốc màn hình
Component `components/navigation/LearnerHeader.tsx` thống nhất cho toàn bộ các trang người học (trừ màn làm bài):
1. **Desktop (≥ 1024px):** Hiển thị đầy đủ Logo, thanh điều hướng 4 trang chính (Luyện đề, Thư viện bài mẫu, Từ vựng, Góc học tập), ô tìm kiếm, chuyển theme sáng/tối, chuông thông báo và avatar tài khoản.
2. **Tablet (768px – 1023px):** Rút gọn thanh điều hướng và khoảng cách; giữ các nút thao tác chính trên thanh header.
3. **Mobile (< 768px):** Header tinh giản còn Logo, nút theme, chuông thông báo và nút menu `☰` (hamburger). Nút `☰` mở Drawer trượt từ phải sang (rộng 300px), chứa toàn bộ danh sách trang, thông tin người dùng và các mục điều hướng tài khoản (truyền qua prop `accountNav` khi trang có sidebar riêng như StudentHome).

### Bảng dữ liệu chuyển thành danh sách thẻ ở mobile (< 768px)
- Với các bảng dữ liệu lịch sử thi (`StudentHome`), danh sách bài nộp Writing/Speaking (`MyWS`):
  - **Từ 768px trở lên:** Giữ bảng chuẩn `<table>` bọc trong khung `overflow-x-auto` để đảm bảo không tràn trang khi xem trên màn hình vừa.
  - **Dưới 768px:** Ẩn bảng (`hidden md:block`), hiển thị danh sách thẻ dọc (`flex flex-col gap-3 md:hidden`). Mỗi thẻ gói gọn tên bài/đề, badge kỹ năng/trạng thái, ngày làm và nút hành động chính (chiều cao tối thiểu 40px, dễ chạm ngón tay).

---

## 12. Bộ component dùng chung cho khung Quản lý và Editor (chốt 21/11/2026)

Chuẩn lấy từ luồng đã hiệu chỉnh: **AdminExams → AdminExamSet → Editor Writing/Speaking**. Các trang Quản lý khác (Người dùng, Bài mẫu, Từ vựng, Báo cáo, Thông báo) và editor LR (Reading/Listening) phải đưa về chuẩn này. Số đo theo px, viền khung luôn 1.5px.

### 12.1 Nút

| Biến thể | Nền | Viền | Chữ | Dùng cho |
|---|---|---|---|---|
| Chính (primary) | `#352637` | `#352637` | `#FFFFFF` | Một hành động chính mỗi khu vực: Thêm, Lưu, Tạo |
| Phụ (secondary) | `#FFFFFF` | `#D6D4D0` | `#352637` | Hủy, Quay lại, Sửa, Lọc |
| Destructive | `#FFFFFF` | `#F1B3A3` | `#C0412A` | Xóa, Gỡ, Hủy dữ liệu |
| Destructive đặc | `#C0412A` | `#C0412A` | `#FFFFFF` | Nút xác nhận trong hộp thoại xóa |
| Thành công | `#2E7D4F` | `#2E7D4F` | `#FFFFFF` | Công bố, Đăng (chỉ khi đủ điều kiện) |

- **Kích thước:** chuẩn cao 38, padding `0 16`, chữ 14/600; gọn cao 34, padding `0 12`, chữ 13/600; chip-nút nhỏ cao 26, padding `0 10`, chữ 12/600. Bo **999**, gap 6 giữa icon và chữ, `white-space: nowrap`.
- **Nút icon:** tròn 38 (gọn 34), viền 1.5px `#D6D4D0`, nền trắng, icon `#4B3D4D`; bản destructive viền `#F1B3A3`, icon `#C0412A`.
- **Nút trong hộp thoại:** Hủy (phụ) đứng trước, hành động chính đứng sau, canh phải, gap 10.
- Không dùng nút xanh accent đặc làm nút chính trong Quản lý (accent chỉ cho link, focus, mục đang chọn). Không bo 12 hoặc `rounded-xl` cho nút.

### 12.2 Ô nhập (textbox, select, textarea, combobox)

| Thuộc tính | Giá trị |
|---|---|
| Cao | 38 (ô một dòng, select); combobox lớn 44 với chữ 15 |
| Padding | `0 12`; select/combobox `0 40 0 12` (chừa mũi tên); textarea `10 12` |
| Viền | 1.5px `#8E8392`, bo **10**, nền `#FFFFFF`, chữ `#352637`, 14px |
| Textarea | line-height 1.6, `resize: vertical` (ô soạn dài của bài mẫu và dạng Note dùng tự giãn, xem 12.9) |
| Placeholder | `#8E8392` |
| Nhãn | 13/600 `#352637`, cách ô 6; chú thích 13 `#706473`, cách ô 4–6 |
| Tìm kiếm | rộng 280 (tối đa 100%), icon kính lúp bên trái |
| Lỗi | viền và thông báo `#C0412A`, thông báo cạnh ô bằng chữ, `aria-invalid` |
| Khóa | nền `#F3F0EA`, chữ `#8E8392`, `cursor: not-allowed` |

### 12.3 Bảng

- **Khung:** viền 1.5px `#D6D4D0`, bo **16**, nền trắng, `overflow: hidden` (nếu có dropdown trong khung thì `visible`), bóng `0 1px 2px rgba(53,38,55,.04), 0 8px 24px rgba(53,38,55,.07)`.
- **Tiêu đề cột:** nền `#FAF9F5`, 13/600 `#706473`, `text-align: left`, `white-space: nowrap`, viền dưới 1.5px `#D6D4D0`. Padding `12 16` (bảng thường) hoặc `10 14` (bảng dày).
- **Ô:** padding cùng kích thước tiêu đề, 14px (dày 13px), viền trên 1px `#E6E4E0`, `vertical-align: middle` (ô nhiều dòng thì `top`).
- **Hàng:** hover nền `var(--mo-hover-bg)` (class `hov` hoặc rule `tbody > tr` trong motion.css). Hàng bấm được có `cursor: pointer`.
- **Trạng thái rỗng, lỗi, đang tải:** thẻ cùng khung, padding `48 24` (hoặc `36 20` khi nằm trong bảng), căn giữa, 14px; rỗng `#706473`, lỗi `#C0412A` kèm nút thử lại.
- Dưới 768px bảng đổi sang danh sách thẻ (mục 11).

### 12.4 Tab, nhóm nút chọn (segmented)

- **Khung:** `inline-flex`, gap 2, padding 3, bo **10**, nền `#F3F0EA`.
- **Mục:** cao 34, padding `0 14`, bo **8**, 13px. Đang chọn: nền trắng, viền 1.5px `#D6D4D0`, 600, bóng `0 1px 2px rgba(53,38,55,.06)`. Không chọn: nền trong, chữ `#706473`, hover chữ `#352637`.
- Huy hiệu số trong tab: nền `#C0412A`, chữ trắng 11/700, bo 999, padding `2 6`.

### 12.5 Chip và huy hiệu

| Loại | Kích thước | Màu |
|---|---|---|
| Trạng thái nội dung | cao 26, `0 10`, 13/600, bo 999 | Công khai `#DCEDE2`/`#2E6A48`; Bản nháp `#FBEDBF`/`#7A5A0E`; Đã ẩn `#F3F0EA`/`#706473` |
| Kỹ năng L/R/W/S | cao 26 hoặc 22, `0 8–10`, 13/600 | Cặp màu kỹ năng ở mục 2, **luôn kèm chữ cái và tên** |
| Phân loại (Academic, General...) | cao 22, `0 8`, 13/600 | teal / orange ở "Token bổ sung" |
| Thẻ lọc/tag | cao 26, `0 10`, 12/600, viền 1px `#D6D4D0`, nền trắng | chữ `#4B3D4D` |
| Số lượng/chưa đọc | tối thiểu 18, 11/700, bo 999 | nền `#E5604A` hoặc `#C0412A`, chữ trắng |

Màu Reading (mint) trùng "Công khai", Writing (butter) trùng "Bản nháp": hai loại chip này **không đặt cạnh nhau mà thiếu chữ**, luôn có nhãn.

### 12.6 Hộp thoại, dropdown, toast, banner

- **Lớp phủ:** `rgba(53,38,55,.32–.42)`, padding 16 (mobile) hoặc 24, canh giữa, `z-index: 60`.
- **Hộp thoại:** nền trắng, viền 1.5px `#D6D4D0`, bo **22**, bóng `0 24px 64px rgba(53,38,55,.22)`, padding 24 (hộp có form dài 26/26/22), tối đa `100vh - 48px`, cuộn trong hộp. Rộng 440 (xác nhận), 460 (một trường), 660 (form nhiều trường). Tiêu đề serif 20/600; nội dung 14px `#4B3D4D`, line-height 1.55; chân: nút canh phải, gap 10. Hộp xác nhận nguy hiểm có icon tròn 44 nền `#FBDCD3`, chữ `#C0412A`.
- **Dropdown/menu:** nền trắng, viền 1.5px `#D6D4D0`, bo **12**, padding 6, bóng `0 1px 2px .04, 0 12px 28px .16`, cao tối đa 240 rồi cuộn. Mục cao tối thiểu 40, padding `0 12`, bo **8**, 14px; hover nền `#F3F0EA`; mục nguy hiểm chữ `#C0412A`.
- **Popover lọc:** như dropdown nhưng bo **16**, padding 14, rộng 272.
- **Toast:** `fixed`, giữa dưới (bottom 24), nền `#352637`, chữ trắng 14px, bo **12**, padding `10 14 10 18`, gap 16, `z-index: 70`; thành công dùng nền `#2E7D4F`.
- **Banner (VersionBanner, thông báo đầu trang):** dùng màu của token, không dùng mã riêng: cảnh báo `#FBEDBF`/`#7A5A0E`, thông tin `#E3ECFD`/`#2257B8`, thành công `#E6F3EC`/`#24543D`, lỗi `#FBDCD3`/`#9D301E`. Chữ 13px, padding `10 24`, viền dưới 1.5px.

### 12.7 Khung trang và tiêu đề

- **Nội dung trang:** `p-4 sm:p-6 md:p-8` (16/24/32), `flex-col gap-6`. Trang Editor tràn mép (xem 12.9) là ngoại lệ duy nhất.
- **Đầu trang:** `h1` serif **28**/600, line-height 1.25, letter-spacing `-0.015em`; mô tả 15px `#706473` cách 4; nút hành động chính góc phải, `flex-wrap`, căn dưới, gap 16.
- **Tiêu đề khối:** serif 20/600. Nhãn nhóm 13/700. Tiêu đề thẻ 18/600.
- **Liên kết quay lại:** 14/600 `#706473`, mũi tên trái, `align-self: flex-start`, đặt trên đầu trang.

### 12.8 Khung tải tệp (ảnh, audio)

Ô viền đứt 2px `#D6D4D0`, bo **12**, nền `#FAF9F5`, icon 28, tiêu đề 13/600, gợi ý 12 `#706473`, padding 16; kéo thả đổi viền và nền sang accent và `#E3ECFD`. Đã có tệp: thanh thông tin viền 1.5px, bo 12, gồm chấm tròn, tên tệp (cắt dấu ba chấm), dung lượng, và "Thay tệp | Xóa" (Xóa màu destructive). Component: `pages/admin/samples/SampleUploadFrame.tsx`, `components/exams/editor-shell/ImageUploader.tsx`. Khung ghi âm LR có thêm thanh tiến độ; nên gộp về một component.

### 12.9 Editor

- **Khung:** `StaffLayout` nhưng nội dung tràn mép: thanh trên (EditorTopbar) nền `#FAF9F5`, padding `20 24 16`, viền dưới 1px `#E6E4E0`; vùng soạn chia đôi, đường kẻ 1.5px `#D6D4D0`.
- **Ô soạn dài (Summary, Note, bài mẫu):** một khung viền 1.5px `#8E8392`, bo 10–12, thanh công cụ ở trên (nút **B**, *I*, H, • cao 32, bo 8), ô chữ monospace 13px, line-height 1.7, **tự giãn theo nội dung, không thanh cuộn**.
- **Thẻ trong editor** (section, câu hỏi): nền trắng, viền 1.5px `#D6D4D0`, bo **16**, padding `18 20`.
- **Chế độ Chỉ xem / Chỉnh sửa:** theo mục 7 (chip, dải sky-soft, nút Chỉnh sửa/Lưu/Hủy).

## 13. Trạng thái component (hover, nhấn, focus, khóa)

Hover và nhấn do `motion.css` tự áp lên mọi `button`/`a` có `background` inline: hover `brightness(.96)` (tối `1.12`), nhấn `scale(.97)`, khóa `opacity .55`. Vì vậy **chỉ đặt màu mặc định trong style, không tự viết màu hover cho nút**, trừ khi cần đổi màu hẳn (hàng "Nút phụ", "Nút destructive").

| Thành phần | Mặc định | Hover | Nhấn | Focus | Khóa |
|---|---|---|---|---|---|
| Nút chính | nền/viền `#352637`, chữ trắng | sáng/tối nhẹ (motion) | co 97% | outline 2px `#2963CC` offset 2 | nền `#FFFFFF`, viền `#D6D4D0`, chữ `#B5ADB7`, `not-allowed` |
| Nút phụ | trắng, viền `#D6D4D0` | nền `#F3F0EA` | co 97% | như trên | chữ `#B5ADB7` |
| Nút destructive | trắng, viền `#F1B3A3`, chữ `#C0412A` | nền `#FDF3F0` | co 97% | như trên | opacity .55 |
| Nút icon | tròn, viền `#D6D4D0` | nền `#F3F0EA`, icon `#352637` | co 97% | như trên | viền `#EAE7E2`, icon `#C9C2C6` |
| Link văn bản | `#2963CC` | `#2257B8`, gạch chân | — | như trên | `#B5ADB7` |
| Ô nhập | viền `#8E8392` | viền `#6A5D6C` | — | viền `#2963CC` + vòng 3px `rgba(41,99,204,.16)`, offset 0 | nền `#F3F0EA`, chữ `#8E8392` |
| Ô nhập lỗi | viền `#C0412A` | giữ | — | viền `#C0412A` + vòng đỏ nhẹ | — |
| Tab / segmented | trong, chữ `#706473` | chữ `#352637` | — | outline accent | opacity .55 |
| Hàng bảng | nền trắng | `var(--mo-hover-bg)` | — | hàng bấm được: outline khi focus | — |
| Thẻ bấm được (bo 16/22) | viền `#D6D4D0` | nổi lên 2px, bóng `--mo-lift-shadow` | co 97% | outline accent | — |
| Khung tải tệp | viền đứt `#D6D4D0` | viền `#8E8392` | — | outline accent (Enter/Space mở chọn tệp) | opacity .6, `not-allowed` |
| Chip bấm được | theo cặp màu | sáng/tối nhẹ | co 97% | outline accent | — |

Quy tắc chung: focus nhìn thấy được trên **mọi** điều khiển (outline 2px accent offset 2, ô nhập offset 0); trạng thái không chỉ bằng màu mà kèm chữ hoặc icon; thời lượng chuyển trạng thái dùng token `--mo-*` (mục 5). `prefers-reduced-motion` tắt chuyển động.

## 14. Quy tắc áp dụng (checklist khi viết hoặc sửa màn)

1. **Tìm trước, tạo sau.** Nút, ô nhập, bảng, tab, chip, hộp thoại, dropdown, toast đã có ở mục 12. Không tự chế kích thước hay bo góc mới. Muốn thêm biến thể mới thì thêm vào mục 12 trước.
2. **Bảng số cố định.** Cao điều khiển 26/34/38/44; bo 8/10/12/16/22/26/999; viền khung 1.5px, vạch kẻ 1px; chữ 11–48 theo mục 3; khoảng cách chia hết cho 4.
3. **Một nút chính mỗi khu vực.** Hành động phá hủy luôn dùng kiểu destructive; hộp thoại xóa dùng nút destructive đặc.
4. **Màu từ token.** Không dùng mã hex ngoài mục 2 và "Token bổ sung". Mã mới phải thêm vào `dark-palette.json` trong cùng commit, nếu không dark mode sẽ giữ màu sáng. Class Tailwind `[#hex]` không được đổi sang tối tự động, nên ưu tiên style inline qua `styleOf` hoặc biến CSS (`var(--sample-*)`, `var(--attempt-*)`).
5. **Tiêu đề trang 28 serif**, nội dung trang `p-4 sm:p-6 md:p-8`, cho mọi trang trong khung Quản lý và Giáo viên. Trang tràn mép chỉ dành cho editor chia đôi.
6. **Bo góc theo cấp:** điều khiển 10, nút 999, thẻ nhỏ 12, thẻ 16, hộp thoại và khối CTA 22.
7. **Style inline viết "prop: value"** (có khoảng trắng) để selector trong `motion.css` khớp; giữ `border-radius`, `display`, `background` ở dạng chuỗi dễ khớp.
8. **Tiếp cận:** nhãn gắn với ô nhập, nút chỉ có icon có `aria-label`, lỗi dùng `role="alert"`, trạng thái dùng `role="status"`, tiêu điểm hiện rõ, không dùng màu làm tín hiệu duy nhất.
9. **Dark mode:** kiểm tra cả hai chế độ trước khi báo xong; màn mới thì thêm ánh xạ.
10. **Chữ Việt nhất quán:** "Giáo viên" (không "Trợ giảng"), "Bản nháp / Công khai / Đã ẩn", "Hủy", "Xóa", "Lưu".

### Lệch hiện tại cần sửa theo mục 12

| Nơi | Lệch | Đưa về |
|---|---|---|
| `editor-shell/ConfirmDialog`, `LeaveDialog` | Nút bo 12 (`rounded-xl`), chữ 13, nút chính nền xanh accent, viền `#E5E0D8`, lớp phủ `bg-black/40`, `rounded-2xl` | Nút 38/999, nút chính ink, hộp bo 22 viền `#D6D4D0`, lớp phủ aubergine |
| `editor-shell/VersionBanner` | Mã màu riêng (`#FFF8E6`, `#EBF7EE`, `#B8E6C4`...) | Banner theo 12.6 |
| `editor-shell/EditorTopbar` | Tab `rounded-xl` p-3px, mục `rounded-[10px]`; chip trạng thái padding riêng; menu `shadow-lg` viền `#E5E0D8` | Tab 10/8 như 12.4, chip 12.5, dropdown 12.6 |
| Editor LR (Reading/Listening, `lr-editor/*`) | Dùng Tailwind với hex riêng (`#E5E0D8`, `#FAF9F7`, `#2A1F2D`...) | Dùng token mục 2; nút, ô nhập theo 12.1–12.2 |
| Tiêu đề trang chưa khai báo `font-weight` (AdminHome, AdminExams, AdminUsers...) | Tailwind preflight có thể đưa h1 về weight mặc định | Khai báo 600 như 12.7 |
| Trang Quản lý bài mẫu, Từ vựng, Báo cáo, Thông báo | Nút, ô nhập, chip viết bằng CSS riêng (`.sample-button`, `.vocab-button`, `.support-*`) | Hợp nhất số đo theo 12.1–12.5; giữ tên class, đổi giá trị |
