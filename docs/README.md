# Tài liệu đặc tả IELTSpace

Cập nhật 09/11/2026. Tổng hợp từ bộ nhớ dự án và các tài liệu hiện hành của nhóm. Khi có mâu thuẫn: Chương 3 (bản "sửa 20-10 lần 2") thắng Chương 1; canvas UI và `DESIGN.md` (gốc repo) là nguồn chuẩn giao diện.

## Đặc tả theo chủ đề

| File | Nội dung |
|---|---|
| [01-tong-quan-du-an.md](01-tong-quan-du-an.md) | Đề tài, phạm vi MVP, tác nhân, cấu trúc đề |
| [02-cong-nghe-va-kien-truc.md](02-cong-nghe-va-kien-truc.md) | Công nghệ, kiến trúc 8 module, quy tắc kỹ thuật, hiện trạng repo |
| [03-use-case.md](03-use-case.md) | 35 UC, quyết định rà soát, đối chiếu với giao diện |
| [04-cham-bai-writing-speaking.md](04-cham-bai-writing-speaking.md) | Lưu bài, lượt chấm, 72 giờ, 14 ngày, phân công, trạng thái |
| [05-cham-listening-reading-va-dang-cau-hoi.md](05-cham-listening-reading-va-dang-cau-hoi.md) | Chấm L/R, widget, dạng câu hỏi Reading/Listening |
| [06-nhap-lieu-xlsx.md](06-nhap-lieu-xlsx.md) | Nhập xlsx trong editor, sheet từng kỹ năng |
| [07-quan-ly-bo-de-va-de-thi.md](07-quan-ly-bo-de-va-de-thi.md) | Danh sách bộ đề, Thông tin bộ đề, Academic/GT, ảnh bìa |
| [08-editor-soan-de.md](08-editor-soan-de.md) | Chế độ Chỉ xem, editor Reading, Listening, Writing, Speaking |
| [09-quan-ly-bai-mau.md](09-quan-ly-bai-mau.md) | Quản lý bài mẫu, editor bài mẫu, trang xem bài mẫu |
| [10-co-so-du-lieu.md](10-co-so-du-lieu.md) | Bản CSDL nhóm (base), bản 22 bảng, quyết định, điểm mở |
| [11-quy-chuan-giao-dien.md](11-quy-chuan-giao-dien.md) | Hệ màu, chế độ tối, nút destructive, thẻ chuẩn, khung trang |
| [12-quan-ly-nguoi-dung-va-thong-ke.md](12-quan-ly-nguoi-dung-va-thong-ke.md) | Người dùng, Dashboard Quản lý, theo dõi chấm, hồ sơ |
| [13-quy-trinh-lam-viec.md](13-quy-trinh-lam-viec.md) | Git, định dạng mã, bám UI gốc, lưu ý `.gitignore` |
| [14-nguon-de-thi.md](14-nguon-de-thi.md) | Nguồn đề và dữ liệu mẫu |

## Tài liệu gốc chép nguyên văn

Các file này chép nguyên từ thư viện dự án; đường dẫn bên trong (như `thiet-ke-csdl/`, `usecase/`, `/mnt/project-files/...`) là đường dẫn trong thư viện dự án, không phải trong repo.

- [tai-lieu-goc/dac-ta-quy-trinh-va-cong-nghe-setup-repo.md](tai-lieu-goc/dac-ta-quy-trinh-va-cong-nghe-setup-repo.md): đặc tả quy trình và công nghệ (29/10).
- [tai-lieu-goc/tom-tat-chuong-1-3.md](tai-lieu-goc/tom-tat-chuong-1-3.md): tóm tắt Chương 1-3 và các điểm lệch đã chốt (20/10).
- [spec/question-types-input-spec.md](spec/question-types-input-spec.md): 20 mã dạng câu hỏi L/R và widget nhập.
- [usecase/ra-soat-uc-chuong3-2026-10-20.md](usecase/ra-soat-uc-chuong3-2026-10-20.md): rà soát UC Chương 3.
- [usecase/so-do-dac-ta-use-case.md](usecase/so-do-dac-ta-use-case.md): mã Mermaid UC tổng quan, hoạt động, tuần tự 35 UC.
- [csdl/nhom-csdl-draft.md](csdl/nhom-csdl-draft.md): CSDL draft của nhóm (base hiện hành).
- [csdl/ban-22-bang-README.md](csdl/ban-22-bang-README.md), [csdl/ban-22-bang-tu-dien-du-lieu.md](csdl/ban-22-bang-tu-dien-du-lieu.md): bản 22 bảng (đối chiếu).

## Giao diện

[ui/](ui/): canvas bản 236 (`canvas/*.dc.html`), `design.md`, bảng màu tối, đối chiếu UC, ảnh mẫu, [ui/trang-va-lien-ket.md](ui/trang-va-lien-ket.md).

## Lưu ý

`.gitignore` đang bỏ qua mọi `*.md` (trừ README, DESIGN, CLAUDE ở gốc và `AGENTS/`), nên các file `.md` trong `docs/` chưa được Git theo dõi. Muốn commit cần thêm `!/docs/**/*.md`.
