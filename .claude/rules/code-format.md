---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,css,json}"
---

# Định dạng code

- Prettier 3, cấu hình mặc định: nháy kép, chấm phẩy, 2 space, `trailingComma: all`, width 80, LF.
- File `.prettierrc` chỉ để local, **không commit**.
- Khi sửa file đã lệch Prettier từ trước (ví dụ `frontend/src/main.tsx` dùng nháy đơn), không format lại cả file nếu không được yêu cầu.
