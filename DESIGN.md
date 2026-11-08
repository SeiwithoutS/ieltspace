# DESIGN.md – IELTSpace

Tóm tắt hệ thống thiết kế đang dùng trong `frontend/`. Nguồn chuẩn vẫn là canvas "IELTSpace · Giao diện" và `design.md` gốc (mục A và mục 0 thắng các mục cũ). File này ghi lại **giá trị thực tế trong code** để dev bám theo. Cập nhật 08/11/2026.

## 1. Màu

### Sáng

| Token | Giá trị | Dùng cho |
|---|---|---|
| ink | `#352637` Aubergine | Chữ chính, nút chính |
| text-2 | `#4B3D4D` | Chữ phụ |
| text-muted | `#6A5D6C` / `#706473` | Chữ mờ, nhãn (đang có 2 tông, xem mục 7) |
| bg | `#FCFBF7` | Nền trang |
| card | `#FFFFFF` | Thẻ |
| hover-soft | `#F3F0EA` | Nền hover menu |
| line | `#D6D4D0` | Viền thẻ |
| input-line | `#8E8392` | Viền ô nhập |
| accent | `#2963CC` (hover `#2257B8`) | Link, nhấn, focus ring |
| accent-soft | `#E3ECFD` | Mục đang chọn |
| danger-bg | `#E5604A` | Chấm đỏ, huy hiệu số |
| danger-text | `#C0412A`, viền `#F1B3A3` | Hủy, Xóa, Đăng xuất, Không lưu |

### Màu kỹ năng (nền / chữ)

| Kỹ năng | Nền | Chữ |
|---|---|---|
| Listening | `#DDE8FC` | `#2A55B8` |
| Reading | `#DCEDE2` | `#2E6A48` |
| Writing | `#FBEDBF` | `#7A5A0E` |
| Speaking | `#E8E4FA` | `#5543B0` |

### Tối

Lớp `dark` trên `<html>`, lưu ở `localStorage 'ieltspace-app'`. Nền `#202125`, thẻ `#292A2E`, viền `#46474D`, chữ `#F1F2F4`, chữ phụ `#B2B3B9`, link `#8DB0F7`. Ánh xạ từng mã màu nằm ở `src/lib/dark-palette.json`; `cssText`/`styleOf` tự đổi khi render.

## 2. Chữ

| Font | Dùng cho |
|---|---|
| Inter | Giao diện |
| IBM Plex Serif | Tiêu đề lớn |
| IBM Plex Mono | Số liệu |

### Thang cỡ chữ (px) – đã đồng bộ 08/11/2026

Chỉ dùng các giá trị nguyên sau. Không dùng cỡ lẻ nửa pixel.

| Cỡ | Vai trò | Ghi chú |
|---|---|---|
| 11 | Badge, nhãn "Mới" | Đậm 700 |
| 12 | Overline, meta nhỏ | In hoa, letter-spacing .08em |
| 13 | Caption, mô tả phụ, ô bảng dày | Cỡ phổ biến nhất |
| 14 | Chữ UI chính: menu, nút, nội dung thẻ | |
| 15 | Đoạn văn đọc, câu hỏi | |
| 16 | Chữ nhấn, tiêu đề thẻ nhỏ | |
| 18 | Tiêu đề thẻ, logo sidebar | |
| 20 · 22 | Tiêu đề khối | |
| 24 · 28 | Tiêu đề khối, tiêu đề trang | 30 đã gộp về 28 |
| 32 · 36 · 40 · 48 | Số liệu lớn, hero | |

Đã gộp: 10, 10.5 → 11; 13.5 → 13; 14.5 → 14; 15.5 → 15; 16.5 → 16; 17, 19 → 18; 21 → 20; 26, 30 → 28; 34 → 32; 38 → 36; 44 → 40. Cỡ trong SVG (`fontSize="…"` của biểu đồ) và `clamp()` của hero đăng nhập giữ nguyên.

## 3. Khoảng cách, bo góc, viền

- Lưới 4px.
- Bo góc: 8 (chip nhỏ), 10 (chuẩn cho nav, menu, nút, ô nhập, ô logo), 12 (bìa, nút lớn), 14·16·18·20 (thẻ vừa, menu, khối CTA), 22 (thẻ), 26 (khung lớn), 999 (viên thuốc, chip). Đã gộp 9, 11 → 10 và 7 → 8 ngày 08/11/2026.
- Viền chuẩn 1.5px. Bìa bộ đề và bài mẫu tỉ lệ 3:2.
- Sidebar Quản lý rộng 248, thu gọn 76, nhớ ở `localStorage 'ieltspace-admin-nav'`. Mục nav cao 44, icon 19.

## 4. Chuyển động

Định nghĩa ở `src/styles/motion.css`.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--mo-fast` | .16s | Hover, đổi màu, nhấn |
| `--mo-med` | .22s | Sidebar, mũi tên xoay, đổ bóng |
| `--mo-slow` | .28s | Hộp thoại, accordion, ngăn kéo |
| `--mo-ease` | `cubic-bezier(.2,.8,.2,1)` | Mọi chuyển động vào/ra |

Hành vi: link và nút sáng/tối nhẹ khi hover, co 3% khi nhấn; thẻ bo 14/16/22 nổi lên 2px; hàng bảng sáng khi hover; dropdown `.bu-dd` mờ dần và trượt; hộp thoại, menu, toast, ngăn kéo tự có animation vào; sidebar thu gọn có nhãn mờ dần; `<details>` mở mượt. Class dùng thủ công: `an-fade`, `an-pop`, `an-drop`, `an-toast`, `an-check`, `an-rise`, `an-spin`, `lift`, `press`, `thumb-h`. `prefers-reduced-motion` tắt tất cả.

Lưu ý: animation vào dùng `transform`, nên phần tử tự căn giữa bằng `transform` inline chỉ được fade.

## 5. Thành phần

- **Nút chính:** nền ink, chữ trắng, bo 12, cao 44–46.
- **Nút viền:** nền trắng, viền ink hoặc line.
- **Nút destructive:** nền trắng, chữ `#C0412A`, viền `#F1B3A3`.
- **Chip kỹ năng:** bo 999, cặp màu kỹ năng.
- **Focus:** viền 2px accent, offset 2px (ô nhập offset 0), vòng sáng 3px khi focus ô nhập.
- **Màn Quản lý:** AdminSidebar + AdminTopbar (avatar mở menu Hồ sơ, Sáng/Tối, Đăng xuất). Chọn ngày dùng Date Picker.
- **Editor đề và bài mẫu:** mở ở chế độ Chỉ xem, bấm "Chỉnh sửa" mới sửa.

## 6. Cách viết style trong code

- Nhiều trang là class component chuyển từ canvas, dùng style inline qua `styleOf("…")`. Giữ kiểu hiện có của từng file.
- Motion layer bám vào chuỗi style inline (ví dụ `[style*="border-radius: 22px"]`). Đổi cách viết `border-radius` hay `display` trong inline style có thể làm mất hiệu ứng hover.
- Chữ hiển thị bằng tiếng Việt có dấu.

## 7. Còn lệch so với design

| Hạng mục | Hiện trạng | Chuẩn |
|---|---|---|
| Bo góc | Còn 14, 16, 18, 20 nằm giữa 12 và 22 (tổng khoảng 215 chỗ) | Chưa chốt có gộp không |

Đã đồng bộ: cỡ chữ (mục 2), màu destructive về `#C0412A`, chữ phụ về `#706473`, viền khung về 1.5px, bo góc 9/11 → 10 và 7 → 8, tiêu đề 30 → 28.

### Ngoại lệ có chủ đích về viền

- Đường kẻ phân cách (`border-top/bottom` 1px `#E6E4E0`, `#F3F0EA`): giữ 1px.
- Thanh tiến độ cao 8px (`border: 1px solid #DDDBD7`): giữ 1px để không ăn chiều cao.
- Viền trắng 2px quanh chấm đỏ, huy hiệu số, avatar: giữ 2px để tách khỏi nền.
- Viền 2px accent `#2963CC` cho trạng thái được chọn hoặc vùng thả tệp: giữ 2px.
