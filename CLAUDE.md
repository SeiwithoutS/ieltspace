# CLAUDE.md – IELTSpace

Hướng dẫn cho Claude Code khi làm việc trong repo này. Quy tắc dùng chung của cả team nằm ở thư mục `AGENTS/` (xem `AGENTS/README.md`); file này nạp chúng vào Claude Code. Sửa quy tắc ở `AGENTS/rules/`, không sửa ở đây.

@AGENTS/rules/project-overview.md
@AGENTS/rules/tech-stack-and-commands.md
@AGENTS/rules/repo-workflow.md
@AGENTS/rules/frontend-conventions.md
@AGENTS/rules/backend-conventions.md
@AGENTS/rules/code-format.md
@AGENTS/rules/database.md
@AGENTS/rules/business-rules.md
@AGENTS/rules/ui-design.md

Giá trị thiết kế đang dùng trong code ghi ở `DESIGN.md`.

## UI gốc trong repo (`docs/ui/`)

Canvas IELTSpace v3 là **nguồn UI chuẩn**: code giao diện phải bám canvas và `docs/ui/design.md` (mục A và mục 0 thắng các mục cũ). Bản sao chép từ thư mục chung của project ngày 08/11:

| File | Nội dung |
|---|---|
| `docs/ui/ieltspace-giao-dien.html` | Canvas v3 đóng gói (31/10), mở bằng trình duyệt; đủ các màn theo vai trò |
| `docs/ui/design.md` | Quy chuẩn UI hợp nhất: hệ màu v3, chữ, bo góc, chế độ tối |
| `docs/ui/bang-mau-toi-v3.html` | Bảng màu chế độ tối |
| `docs/ui/doi-chieu-uc-canvas-29-10.md`, `docs/ui/doi-chieu-landing-page-bao-cao.md` | Đối chiếu UC với canvas và Landing với báo cáo |
| `docs/ui/mau-v3/*.png` | Ảnh mẫu 8 màn chính theo hệ màu v3 |

Canvas live (https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V) có thể mới hơn bản đóng gói; khi hai bản khác nhau thì canvas live thắng. `docs/` bị `.gitignore` bỏ qua phần `.md`, chỉ dùng cục bộ.
