# Tiến độ thống nhất luồng đăng đề và Landing ngày 13/11/2026

## Phạm vi và trạng thái

Đối chiếu CSDL (docs/csdl/CSDL.md, 01_tao_cau_truc_moi.sql), luồng Quản lý (AdminExams, AdminExamSet, 4 editor) và luồng Người học (Main, StudentLanding, FullTests, ExamDetail, PracticeLibrary, PracticeWS) trong mã nguồn và canvas. Mã L1..L12 nối tiếp audit 10/11 (D1–D18, S1–S9). Đã sửa 2 điểm không cần chốt. Ba điểm lớn Trọng Phúc đã chốt theo đề xuất: D08 (L1/L2, đăng theo kỹ năng + hình thức), D09 (L5/L6, thẻ luyện là một kỹ năng của một Test), D10 (L7, danh mục bộ đề). CSDL, SQL 01 và 04, canvas và code đã cập nhật theo ba quyết định này.

## Mô hình mà UI đang giả định

Cả AdminExams, AdminExamSet và ExamDetail dùng cùng một dạng dữ liệu:

```
Bộ đề { status: pub | draft | hidden, tests: [
  Test { L: trạng thái, R: { A: trạng thái, G: trạng thái }, W: { A, G }, S: trạng thái } ] }
trạng thái = pub | draft | hidden | null
```

Nghĩa là đơn vị được đăng, ẩn và làm bài là **một kỹ năng của một Test**, và với Reading/Writing là **một kỹ năng + một hình thức**. Editor có nút "Đăng đề này?" riêng và ghi "sửa đề khi đã có người làm sẽ tạo phiên bản mới". Người học chỉ thấy bộ đề khi bộ đề Công khai, rồi từng ô kỹ năng hiện "Làm bài", "Đang cập nhật" hoặc "—".

CSDL thì đặt trạng thái và phiên bản ở cấp Test: `exams.status`, `exam_versions` (DRAFT/PUBLISHED, một nháp mỗi Test), `exam_skills.is_hidden`, `form` ở `exam_sections`.

## Danh sách điểm lệch

| Mã | Điểm lệch | Bằng chứng | Đề xuất |
|---|---|---|---|
| L1 (= D1) | Đăng theo kỹ năng ở UI, phiên bản theo Test ở CSDL. Đăng Reading Test 1 khi Listening còn nháp thì bản PUBLISHED vẫn bị sửa; sửa Reading đã đăng thì phải sao cả Test. | Editor "Đăng đề này?", AdminExamSet menu ô "Ẩn với người học"; SQL exam_versions, exam_skills | **Đã chốt D08**, áp phương án A. |
| L2 | Ô A/G có trạng thái riêng nhưng `form` nằm ở `exam_sections`; `is_hidden` và `band_scale_id` nằm ở `exam_skills` nên không ẩn riêng Reading General được và một Reading chỉ có một thang band dù chứa cả hai form. | ExamDetail `R: {A, G}`; DECISIONS "Tên cột bảng quy đổi Reading" | Đi cùng L1: đưa `form` lên `exam_skills`. Hết luôn điểm mở về chọn thang band. |
| L3 | `exams.status` không có chỗ dùng: UI không có trạng thái riêng cho Test, Test hiện khi có ít nhất một kỹ năng Đã đăng/Đang soạn. | AdminExamSet `rows`, ExamDetail `visible()` | Bỏ `exams.status`, trạng thái Test là suy ra. |
| L4 | Xóa một Test trong AdminExamSet không kiểm tra gì, kể cả Test đã đăng và đã có lượt làm. Trái BR-EXAM-001. | AdminExamSet `del` | **Đã sửa** (xem dưới). |
| L5 | Thẻ luyện ở Main/StudentLanding/PracticeLibrary là từng Passage/Section (13 câu, 10 câu, tiêu đề riêng, không ghi nguồn đề), trong khi chốt 09/11 nói thẻ là "Test 1 · Listening" bấm là làm luôn. Không bảng nào chứa bài luyện ngoài đề. | Main "Luyện IELTS Reading", PracticeLibrary "Kho Reading Practice"; memory chốt 09/11 | **Đã chốt D09**: thẻ = kỹ năng của một Test lấy từ `exam_skills` đã đăng, ghi nguồn bộ đề và Test; chọn Passage/Section trong StartTestDialog. |
| L6 | PracticeWS (Writing/Speaking theo Task/Part) cũng là đề lẻ không có nguồn; nhãn trạng thái "Đã làm 1 lần", "Chờ chấm" lấy từ lượt làm. CTA "Luyện ngay" khác chuẩn "Làm bài". | PracticeWS | Theo L5: thẻ Task/Part lấy từ `exam_sections` TASK/PART đã đăng. Đổi chữ CTA khi nối dữ liệu. |
| L7 | FullTests nhóm bộ đề theo "Bộ IELTS Mock Test / Practice Test Plus / Actual Test", ExamDetail có "Bộ đề cùng loại", nhưng `exam_sets` không có danh mục. | FullTests, ExamDetail `REL` | **Đã chốt D10**: `exam_sets.category`. |
| L8 (= S7, D16) | Badge "Mới" và sắp "Bộ đề mới nhất" cần ngày đăng bộ đề; `exam_sets` không có `published_at`. "Lượt làm" chưa có quy tắc đếm. | FullTests, Main | Thêm `exam_sets.published_at` (lần đầu Công khai). "Mới" = đăng trong 30 ngày. Lượt làm = số attempts COMPLETED thuộc bộ đề, tính bằng view. |
| L9 (= S1, D7) | Bộ lọc Academic/General ở FullTests là chữ tĩnh, bộ đề không có form. | FullTests | Sau L1/L2: bộ đề khớp form X khi có ít nhất một `exam_skills` Đã đăng với form X. Không thêm cột. |
| L10 | Nhãn "Full 4 kỹ năng" và số "6 bài test" ở thẻ đang viết tay trong tên; dữ liệu mẫu Landing hiện "Đề thi thật Quý 3/2026 · Full 4 kỹ năng" trong khi AdminExams để bộ này Đã ẩn và chỉ có L/R. | Main, StudentLanding, AdminExams `SETS` | Suy từ dữ liệu: "Full 4 kỹ năng" khi mọi Test hiển thị đủ L/R/W/S Đã đăng; số bài test = số Test có ít nhất một kỹ năng hiển thị. Không lưu vào tên. |
| L11 (= S5) | Landing, FullTests, ExamDetail dùng danh sách viết cứng, mỗi trang một bộ tên khác nhau (Mock Test Vol 20 ở FullTests, Mock Test 2026 Vol 4 ở Quản lý). | các trang trên | Khi nối API, dùng chung một endpoint danh sách bộ đề công khai. |
| L12 | BR-EXAM-002 ghi "Đang cập nhật / —" hiện ở màn hình quản lý, thực tế là ở ExamDetail của Người học. | BUSINESS_RULES.md | **Đã sửa** câu chữ. |

## Phương án A cho L1 + L2 (đã áp vào 01 và 04)

```sql
-- exam_versions bỏ; exam_skills là đơn vị đăng, mỗi bản là một phiên bản
create table public.exam_skills (
 id uuid primary key default gen_random_uuid(),
 exam_id uuid not null references public.exams(id),
 skill text not null check(skill in ('LISTENING','READING','WRITING','SPEAKING')),
 form text check(form in ('ACADEMIC','GENERAL')),          -- bắt buộc R/W, NULL L/S
 version_number integer not null check(version_number>0),
 status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED','HIDDEN')),
 duration_minutes integer not null check(duration_minutes>0),
 band_scale_id uuid references public.band_scales(id), grading_rule_id uuid references public.grading_rules(id),
 created_by uuid references public.users(id), created_at timestamptz not null default now(), published_at timestamptz,
 check((skill in ('READING','WRITING')) = (form is not null))
);
create unique index skill_version on public.exam_skills(exam_id, skill, coalesce(form,'-'), version_number);
create unique index one_draft_per_skill on public.exam_skills(exam_id, skill, coalesce(form,'-')) where status='DRAFT';
create unique index one_live_per_skill on public.exam_skills(exam_id, skill, coalesce(form,'-')) where status in ('PUBLISHED','HIDDEN');
-- exam_sections bỏ cột form (lấy từ exam_skills); attempts.exam_version_id đổi thành exam_id
-- skill_attempts.exam_skill_id trỏ đúng bản đã làm; band_scales.exam_type đổi tên thành form
-- exam_sets thêm category, published_at; exams bỏ status
```

Hệ quả: đăng lại một kỹ năng thì bản cũ chuyển ARCHIVED (thêm giá trị này) hoặc giữ nguyên làm lịch sử; bài làm cũ vẫn trỏ bản cũ. "Làm full test" chọn 4 bản đang PUBLISHED của L, R(form), W(form), S. Nhập xlsx (`import_batches.exam_id, skill`) thêm `form` cho R/W và ghi vào bản DRAFT của đúng kỹ năng + form.

## Công việc đã thực hiện

- CSDL theo D08–D10: viết lại `docs/csdl/01_tao_cau_truc_moi.sql` (39 bảng) và `04_nang_cap_tu_01.sql`; cập nhật `CSDL.md`, `DATABASE.md`, `DECISIONS.md` (D08–D10), `csdl/README.md`, BR-EXAM-001/002.
- Canvas (bản 333): thẻ luyện ở Main, StudentLanding, PracticeLibrary ghi "Bộ đề · Test N · Kỹ năng", 40 câu, kèm Academic/General; tên bộ đề thống nhất với AdminExams (Mock Test 2026 Vol 1–4, Actual Test Quý 3/2025–Quý 2/2026), bỏ "Full 4 kỹ năng" khỏi tên; AdminExams có chọn Danh mục khi tạo bộ đề và hiện danh mục dưới tên; AdminExamSet chặn xóa Test đã đăng.
- Code: cùng các thay đổi đó ở `Main.jsx`, `StudentLanding.jsx`, `PracticeLibrary.jsx`, `FullTests.jsx`, `AdminExams.tsx`, `AdminExamSet.tsx`, chữ menu Listening/Reading ở 18 trang.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Phân tích cú pháp các JSX đã sửa bằng esbuild 0.21.5 | Container (bản sao tệp) | Đạt |
| `node --check` script các trang canvas đã sửa | Container | Đạt |
| 01 mới trên schema trống, 14 trường hợp ràng buộc | PostgreSQL 16 | Đạt |
| 01 cũ + dữ liệu mẫu + 04, so với 01 mới (cột, kiểu, NULL, mặc định, ràng buộc, chỉ mục, trigger, RLS) | PostgreSQL 16 | Trùng khớp 657/657 dòng |
| Dữ liệu sau 04: v1 → ARCHIVED, v2 → PUBLISHED, v3 → DRAFT, Test Đã ẩn → HIDDEN, form theo exam_type, lượt làm cũ trỏ đúng bản đã làm | PostgreSQL 16 | Đạt |
| 04 dừng khi có 2 bản nháp, khi thang Reading khác loại đề, khi chạy lại lần hai | PostgreSQL 16 | Đạt |
| `npm run build`, bấm thử trên trình duyệt | Chưa | Chưa kiểm tra: node_modules trên máy là bản Windows, cần chạy trên Windows |

## Phần còn mở

- StudentLanding trong code chưa có hết phần canvas 237 (nối StartTestDialog từ thẻ, khối "Bài làm gần đây" mới).
- ExamDetail, FullTests chưa lọc theo danh mục và form từ dữ liệu; sẽ làm khi nối API danh sách bộ đề công khai (L9, L10, L11).
- Repo local đang dở một phiên `git am` (bản vá "feat(admin): mở các editor ở chế độ Chỉ xem…"). Chưa đụng tới.

## Bước tiếp theo

1. Chạy `npm run build` trên Windows và xem thử các trang đã sửa.
2. Viết API danh sách bộ đề công khai và chi tiết bộ đề theo D08–D10, thay dữ liệu viết cứng ở Landing, FullTests, ExamDetail.
