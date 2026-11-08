---
paths:
  - "frontend/**"
---

# Quy ước frontend

- Điều hướng bằng hash: `#TenTrang` với `TenTrang` là khóa trong `pages.ts`. Thêm trang mới: tạo file trong `src/pages/<nhóm>/`, thêm vào `pages.ts`.
- Link dạng `href="TenTrang.dc.html"` (giữ từ canvas) được `App.tsx` chặn và chuyển thành route. Dùng `navigate()` trong `lib/auth.ts` khi điều hướng bằng code.
- Phân quyền theo tiền tố tên trang: `Admin*`/`Question*` chỉ `ADMIN`, `Teacher*` chỉ `TEACHER`; trang công khai: Main, Login, Register, ForgotPassword, CheckEmail, ResetPassword. Đặt tên trang mới đúng tiền tố.
- Nhiều trang là class component chuyển từ canvas, style inline qua `styleOf`/`cssText` trong `lib/styles.ts`. Khi sửa, giữ kiểu hiện có của file đó.
- Chế độ tối: lớp `dark` trên `<html>`, lưu ở `localStorage 'ieltspace-app'`. Màu mới dùng trong style inline phải có trong `src/lib/dark-palette.json`, nếu không sẽ giữ nguyên màu sáng ở chế độ tối (lỗi từng gặp với `#FDFCF8`). sessionStorage dùng chuyển dữ liệu giữa trang; localStorage chỉ cho tiện ích từng người.
- Hiệu ứng hover, dropdown, hộp thoại, accordion nằm trong `src/styles/motion.css` và bám vào chuỗi style inline (ví dụ `[style*="border-radius: 22px"]`). Đổi cách viết `border-radius` hay `display` trong style inline có thể làm mất hiệu ứng.
- Chữ hiển thị bằng tiếng Việt có dấu.
- Trước khi báo xong: chạy `npm run build` trong `frontend/`.
