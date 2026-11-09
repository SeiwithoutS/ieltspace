---
paths:
  - "frontend/src/**"
---

# Giao diện: luôn bám UI design gốc

- Nguồn chuẩn: canvas "IELTSpace · Giao diện" https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V (mỗi màn là một `.dc.html`, tên màn trùng tên trang trong `pages.ts`) và [`DESIGN.md`](../../DESIGN.md) (nguồn thiết kế duy nhất, đã gộp `ui/design.md`). Không tự chế giao diện khác; màn nào chưa có trên canvas thì hỏi trước.
- Cỡ chữ, màu, bo góc, viền, chuyển động đều lấy từ `DESIGN.md`; không dùng các mục cũ của `docs/ui/design.md`.

## Màu (hệ màu v3)

- Nền kem `#FCFBF7`, thẻ trắng, chữ/nút chính Aubergine `#352637`, màu nhấn duy nhất xanh trời `#2963CC`, viền thẻ `#D6D4D0`, ô nhập viền `#8E8392`. Chữ phụ `#706473` (một tông duy nhất). Tối: nền `#202125`.
- Màu kỹ năng (nền/chữ): Listening `#DDE8FC/#2A55B8`, Reading `#DCEDE2/#2E6A48`, Writing `#FBEDBF/#7A5A0E`, Speaking `#E8E4FA/#5543B0`.
- Nút Hủy/Xóa, "Đăng xuất", "Không lưu": kiểu destructive (nền trắng, chữ `#C0412A`, viền `#F1B3A3`). Không dùng biến thể đỏ khác cho chữ.

## Chữ

- Inter (giao diện), IBM Plex Serif (tiêu đề), IBM Plex Mono (số liệu).
- Cỡ chữ chỉ dùng số nguyên: 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48. Không dùng cỡ nửa pixel.

## Khoảng cách, bo góc, viền

- Lưới 4px. Bìa bộ đề/bài mẫu tỉ lệ 3:2.
- Bo góc: 8, 10 (chuẩn cho nav, menu, nút, ô nhập), 12 (bìa, nút lớn), 14, 16, 18, 20, 22 (thẻ), 26 (khung lớn), 999 (viên thuốc, chip). Không dùng 7, 9, 11.
- Viền khung 1.5px. Ngoại lệ: đường kẻ phân cách và thanh tiến độ cao 8px dùng 1px; viền trắng quanh chấm đỏ, huy hiệu, avatar dùng 2px.

## Màn Quản lý

- AdminSidebar (rộng 248, thu gọn 76, nhớ ở `localStorage 'ieltspace-admin-nav'`) + AdminTopbar (avatar mở menu Hồ sơ, Sáng/Tối, Đăng xuất). Chọn ngày dùng Date Picker.
- 6 editor (đề R/L/W/S, bài mẫu W/S) mở ở chế độ **Chỉ xem** trước, bấm "Chỉnh sửa" mới sửa được (trừ "Thêm bài mẫu" vào thẳng Chỉnh sửa). Editor mới cũng theo quy tắc này.
