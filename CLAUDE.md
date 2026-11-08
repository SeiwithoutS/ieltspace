# CLAUDE.md – IELTSpace

Hướng dẫn cho Claude Code khi làm việc trong repo này. Nội dung chi tiết đã tách thành các rule trong `.claude/rules/`; rule có `paths` chỉ nạp khi Claude làm việc với file khớp.

| Rule | Phạm vi | Nội dung |
|---|---|---|
| `project-overview.md` | luôn nạp | Dự án, vai trò, hiện trạng code |
| `tech-stack-and-commands.md` | luôn nạp | Công nghệ đã chốt, cấu trúc repo, lệnh chạy |
| `repo-workflow.md` | luôn nạp | Commit, push, build trước khi báo xong |
| `frontend-conventions.md` | `frontend/**` | Router hash, phân quyền theo tên trang, chế độ tối, motion |
| `backend-conventions.md` | `backend/**` | ESM, route, zod, 5 quy tắc kỹ thuật bắt buộc |
| `code-format.md` | file code | Prettier |
| `database.md` | `backend/prisma/**`, `backend/src/modules/**` | Prisma, Supabase, thiết kế CSDL đã chốt |
| `business-rules.md` | `backend/src/modules/**`, `frontend/src/pages/**`, `frontend/src/lib/**` | Nghiệp vụ chấm bài, lượt chấm, tài khoản, nhập xlsx |
| `ui-design.md` | `frontend/src/**` | Hệ màu, chữ, bo góc, viền, màn Quản lý |

Giá trị thiết kế đang dùng trong code ghi ở `DESIGN.md`.
