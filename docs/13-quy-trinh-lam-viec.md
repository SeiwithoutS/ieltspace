# 13. Quy trình làm việc với repo

Cập nhật 09/11/2026. Nguồn: các dặn dò của Trọng Phúc lưu trong bộ nhớ dự án (31/10 và 08/11).

## 1. Git

- Người dùng tự push và tự tạo Pull Request. Claude không push, không mở PR.
- Commit **không** thêm dòng Co-Authored-By hay Claude-Session.
- Claude làm thẳng trên repo local `D:\Study\Đồ án 1\ieltspace`, không tạo file patch.
- Chỉ commit khi người dùng yêu cầu.
- Không commit `.prettierrc` (chỉ để local). `.claude/` và `CLAUDE.md` chỉ dùng cục bộ (đã nằm trong `.gitignore`).

## 2. Định dạng mã

- Prettier 3, cấu hình mặc định: nháy kép, chấm phẩy, 2 space, `trailingComma: all`, độ rộng 80, LF.
- Chạy định dạng trong `frontend` trước khi commit.
- Một số file trong repo dùng CRLF: khi sửa thì giữ nguyên kiểu xuống dòng của file đó.

## 3. Giao diện

- Code giao diện luôn bám UI design gốc: canvas IELTSpace và `design.md` mục A (bản chép ở `docs/ui/`). Không tự chế giao diện khác.
- Thay đổi trong `DESIGN.md` thì phản ánh lên canvas.

## 4. Phân vai model khi code (31/10)

- Haiku: đọc tài liệu.
- Sonnet: viết code.
- Opus: review.

## 5. Chạy dự án

Xem `README.md` ở gốc repo (Node.js, cấu hình Supabase, lệnh chạy backend cổng 3001 và frontend cổng 3000).

## 6. Lưu ý về `.gitignore`

`.gitignore` hiện bỏ qua mọi file `*.md` trừ `README.md`, `DESIGN.md`, `CLAUDE.md` ở gốc và `AGENTS/**/*.md`. Vì vậy các file `.md` trong `docs/` (kể cả thư mục này) **không được Git theo dõi**. Muốn đưa vào Git cần thêm dòng `!/docs/**/*.md` vào `.gitignore`.
