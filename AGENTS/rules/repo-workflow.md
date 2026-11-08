# Quy tắc làm việc với repo

- Commit **không** thêm dòng `Co-Authored-By` hay `Claude-Session`.
- **Không push, không tạo PR.** Người dùng tự push và mở PR. Chỉ sửa và commit cục bộ khi được yêu cầu.
- Làm trực tiếp trong repo, không tạo file patch.
- Không commit `.env`, khóa, mật khẩu, `.prettierrc`. `.gitignore` bỏ qua mọi file `.md` trừ `README.md`, `DESIGN.md` và `AGENTS/**/*.md`.
- Trước khi báo xong: chạy `npm run build` (frontend) hoặc `npm run typecheck` (backend) cho phần đã sửa.
- Tài liệu gốc (Chương 1–3, CSDL, design.md, mẫu xlsx, spec dạng câu hỏi) nằm ngoài repo, trong thư mục chung của project; hỏi người dùng nếu cần mà không đọc được.
