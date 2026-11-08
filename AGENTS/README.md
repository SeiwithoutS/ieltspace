# AGENTS – Hướng dẫn cho AI coding agent

Thư mục này được duy trì trên Git cho cả team. Mọi thành viên, dù dùng Claude Code, Codex, Gemini hay công cụ khác, đọc cùng một bộ quy tắc của dự án IELTSpace.

## Cách dùng

- Mỗi file trong `rules/` là một chủ đề. Nội dung là Markdown thường, đọc được bằng mọi công cụ.
- Một số file có phần đầu `paths:` (frontmatter). Đó là định dạng của Claude Code để chỉ nạp rule khi làm việc với file khớp; công cụ khác bỏ qua và coi đó là chú thích phạm vi áp dụng.
- Nếu công cụ của bạn tự đọc một file riêng ở gốc repo (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`…), hãy để file đó trỏ tới thư mục này thay vì chép lại nội dung. `.claude/rules/` đã làm vậy cho Claude Code.
- Giá trị thiết kế đang dùng trong code nằm ở [`../DESIGN.md`](../DESIGN.md).

## Danh sách rule

| File | Phạm vi | Nội dung |
|---|---|---|
| [`rules/project-overview.md`](rules/project-overview.md) | toàn repo | Dự án, vai trò, hiện trạng code |
| [`rules/tech-stack-and-commands.md`](rules/tech-stack-and-commands.md) | toàn repo | Công nghệ đã chốt, cấu trúc repo, lệnh chạy |
| [`rules/repo-workflow.md`](rules/repo-workflow.md) | toàn repo | Commit, push, build trước khi báo xong |
| [`rules/frontend-conventions.md`](rules/frontend-conventions.md) | `frontend/**` | Router hash, phân quyền theo tên trang, chế độ tối, motion |
| [`rules/backend-conventions.md`](rules/backend-conventions.md) | `backend/**` | ESM, route, zod, 5 quy tắc kỹ thuật bắt buộc |
| [`rules/code-format.md`](rules/code-format.md) | file code | Prettier |
| [`rules/database.md`](rules/database.md) | `backend/prisma/**`, `backend/src/modules/**` | Prisma, Supabase, thiết kế CSDL đã chốt |
| [`rules/business-rules.md`](rules/business-rules.md) | `backend/src/modules/**`, `frontend/src/pages/**`, `frontend/src/lib/**` | Nghiệp vụ chấm bài, lượt chấm, tài khoản, nhập xlsx |
| [`rules/ui-design.md`](rules/ui-design.md) | `frontend/src/**` | Hệ màu, chữ, bo góc, viền, màn Quản lý |

## Quy ước duy trì

- Sửa quy tắc thì sửa file trong `AGENTS/rules/` và commit cùng thay đổi code liên quan.
- Mỗi rule một chủ đề, ngắn gọn. Quy tắc mới thuộc phạm vi nào thì thêm vào file tương ứng, chỉ tạo file mới khi chủ đề chưa có.
- Không đưa khóa, mật khẩu, nội dung `.env` hay thông tin cá nhân vào đây: thư mục này công khai.
- Claude Code nạp thư mục này qua `.claude/rules/`: mỗi file ở đó giữ nguyên `paths:` và chỉ có một dòng `@../../AGENTS/rules/<tên>.md`. Thêm rule mới thì tạo file cùng tên ở cả hai nơi (copy phần `paths:`), không chép nội dung vào `.claude/rules/`.
