# Đặc tả quy trình làm việc và công nghệ để setup repo (IELTSpace)

Cập nhật 29/10/2026. Tài liệu này để bạn trong nhóm dùng ChatGPT (hoặc công cụ khác) dựng repo mà không cần đọc lại toàn bộ lịch sử. Phần nào đã chốt thì ghi **[Đã chốt]**, phần là đề xuất của mình thì ghi **[Đề xuất]**, phần còn bỏ ngỏ thì ghi **[Còn mở]**. Khi tài liệu này mâu thuẫn với Chương 1 đến 3 của nhóm, Chương 3 bản "sửa 20-10 lần 2" thắng.

---

## 1. Bối cảnh

- Đồ án 1, ĐH CNTT: "Xây dựng nền tảng hỗ trợ học tập và ôn luyện IELTS". Tên sản phẩm: **IELTSpace**. Phạm vi MVP: web desktop, tiếng Việt, không app native, không AI chấm, không song ngữ.
- Nhóm: Nguyễn Trọng Phúc, Võ Nguyễn Thanh Hương. GVHD Nguyễn Thị Xuân Hương.
- Bốn vai trò: **Khách**, **Người học**, **Giáo viên**, **Quản lý**. (Chương 1 còn gọi Giáo viên là Trợ giảng; dùng "Giáo viên".)
- 35 use case (UC01 đến UC35). Danh sách đầy đủ ở `usecase/mermaid/UC00-use-case-tong-quan.mmd`.
- Kỹ năng: Listening, Reading (chấm tự động), Writing, Speaking (Giáo viên chấm tay).

## 2. Công nghệ **[Đã chốt, Chương 2]**

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript (cả frontend và backend) |
| Frontend | React + Vite (không dùng Next.js), Tailwind CSS (có chế độ sáng/tối) |
| Backend | Node.js + Express, REST/JSON, monolith chia module |
| CSDL | PostgreSQL trên Supabase |
| ORM | Prisma (`schema.prisma` là nguồn chuẩn của CSDL) |
| Xác thực | Supabase Auth (email, mật khẩu, xác minh email bắt buộc; đăng nhập Google cho Người học) |
| Lưu tệp | Supabase Storage (ảnh bìa, ảnh đề, audio đề, audio bài mẫu, ghi âm Speaking). CSDL chỉ lưu đường dẫn |
| Deploy | Vercel (frontend), Render (backend; gói free có thể ngủ) |
| Quản lý mã | Git và GitHub |
| Thiết kế | Canvas HTML trên Claude (xem mục 5), không dùng Figma làm nguồn chính |
| Phụ trợ | Python (sinh file xlsx mẫu, sinh ERD và từ điển dữ liệu), Mermaid (sơ đồ UC) |

Backend gồm 8 module: người dùng và xác thực, đề thi, làm bài, chấm bài, từ vựng, bài mẫu, thống kê, quản trị và nhập liệu.

### Quy tắc kỹ thuật bắt buộc

1. Backend tự kiểm tra quyền theo vai trò. Prisma kết nối bằng quyền rộng nên **không dựa vào RLS** của Supabase.
2. API lấy đề cho Người học **không trả đáp án**. Điểm chính thức luôn tính ở backend.
3. Nộp bài phải chống trùng (idempotent); đề đã đăng thì không sửa ngược kết quả các lượt đã nộp.
4. Giờ và tuần tính theo múi giờ Việt Nam ở backend; cột thời gian lưu `timestamptz`.
5. Khóa chính UUID. `profiles.id` trùng `auth.users.id`.
6. Tên bảng, cột snake_case (`@@map`, `@map`); model Prisma PascalCase.

## 3. Cơ sở dữ liệu

Có hai bản trong `thiet-ke-csdl/`:

- **Bản 22 bảng** (24/10, đã có `schema.prisma`, `schema.sql`, `constraints-bo-sung.sql`, `seed.sql`, ERD, từ điển dữ liệu; đã chạy thử trên PostgreSQL 16 không lỗi). Là nguồn chuẩn hiện tại của schema.
- **CSDL draft của nhóm** (29/10, 39 đến 40 bảng, `nhom-csdl-draft.md`). Người dùng muốn coi đây là base mới. **[Còn mở]** Chưa chuyển thành `schema.prisma`; trước khi code cần chốt bản nào làm gốc. Điểm khác chính: có `exam_versions` (đề đã đăng bất biến), tách `attempts` và `skill_attempts`, tách credit/refund/review/score, từ vựng chia `vocabulary_sets` và `favorite_vocabularies`, thêm `learning_activities`, `import_assets`, `import_errors`.

Quyết định đã chốt dù dùng bản nào:

- `exam_sets` có `description` và `cover_url` (ảnh bìa tỉ lệ 3:2).
- Academic hoặc General Training nằm ở `parts.form` (bắt buộc cho Reading/Writing, NULL cho Listening/Speaking). Không có `exams.exam_type`.
- Bảng quy đổi band, tiêu chí chấm W/S (4 tiêu chí Writing, 4 tiêu chí Speaking), thông điệp động lực, tham số hệ thống (14 ngày, 72 giờ, ngưỡng flashcard 10 thẻ) là dữ liệu seed, không có màn quản lý riêng.
- `learning_activities` tính theo lượt làm.

Việc setup DB: chạy `schema.sql` → `constraints-bo-sung.sql` → `seed.sql` → `kiem-thu-rang-buoc.sql`. Hoặc dùng `prisma migrate` rồi áp `constraints-bo-sung.sql` bằng migration SQL tay (Prisma không viết được partial unique index và CHECK).

## 4. Nghiệp vụ cốt lõi cần code đúng

### 4.1 Cấu trúc đề
Bộ đề → Đề thi → Kỹ năng → Phần → Question Group → Question → đáp án / rubric. Trạng thái nội dung: **Bản nháp, Công khai, Đã ẩn**. Bộ đề xóa được khi chưa có lượt làm; đã có thì ẩn.

### 4.2 Chấm Listening/Reading
Tự động. Tỉ lệ chính xác = đúng / tổng câu. **Band chỉ tính cho đề đầy đủ**, theo bảng quy đổi. Listening đề đầy đủ nghe một lần; chế độ luyện được nghe lại. Hết giờ thì hệ thống hoàn thành lượt làm với phần đã lưu. Câu bỏ trống tính là sai.

### 4.3 Writing/Speaking (UC10, UC34, UC16, UC11)
- Hoàn thành bài chỉ **lưu** (giữ 14 ngày), không tự vào hàng đợi chấm.
- Người học tự **gửi yêu cầu chấm**, tốn 1 lượt: 1 lượt miễn phí mỗi tuần (làm mới 00:00 thứ Hai giờ VN, không cộng dồn, dùng chung W/S) hoặc lượt bonus (hết hạn cuối Chủ nhật tuần kế). Lượt hết hạn sớm hơn được dùng trước.
- Chờ phân công tối đa **72 giờ**; quá hạn tự hủy và hoàn 1 bonus. Giáo viên báo không thể hoàn thành thì Quản lý xác nhận hủy và hoàn bonus (không phân công lại).
- Tự phân công: giáo viên đang hoạt động, có quyền chấm kỹ năng đó, chưa đạt giới hạn bài; ưu tiên người ít bài nhất, rồi người lâu chưa nhận.
- Mỗi bài tối đa 1 yêu cầu đang hoạt động; đã có kết quả thì không gửi lại. Giáo viên chỉ sửa kết quả trước khi gửi (đã gửi thì khóa). Có thể lưu nháp.
- Có kết quả: giữ nội dung bài 14 ngày rồi xóa, giữ điểm và nhận xét.
- Trạng thái bài: Đã lưu · chưa gửi chấm; Chờ phân công; Chờ chấm; Đã có kết quả; Đã hủy · đã hoàn bonus; Chưa có điểm.

### 4.4 Từ vựng và flashcard
Khách xem thư viện từ vựng; cần đăng nhập để lưu yêu thích, ghi chú, nhãn (riêng từng người). Một phiên học hợp lệ = xong một lượt làm bài, một lượt luyện, hoặc một phiên flashcard (ôn hết tập hoặc từ 10 thẻ khác nhau trở lên). Mục tiêu band và số phiên mỗi ngày đặt trong Hồ sơ. Từ đang nằm trong flashcard của người học thì ẩn, không xóa.

### 4.5 Tài khoản
Bắt buộc xác minh email. Người học bị khóa vẫn giữ yêu cầu chấm; bị xóa thì hủy và không hoàn bonus. Chỉ Quản lý tạo, khóa, xóa tài khoản (xóa khi chưa có dữ liệu, có dữ liệu thì khóa). Giáo viên và Quản lý có quyền chấm theo kỹ năng do Quản lý đặt.

### 4.6 Thông báo
Trung tâm thông báo trong hệ thống cho cả 3 vai trò (UC35), có chấm đỏ số chưa đọc. Không gửi email hoặc push.

## 5. Quy trình làm việc đã dùng

1. **Tài liệu trước**: Chương 1 (yêu cầu), Chương 3 (UC, đặc tả), Chương 2 (công nghệ). Bản đang dùng: `tai-lieu/Chương 1 ... (sửa 20-10 lần 2).docx` và `Chương 3 ... (sửa 20-10 lần 2).docx`. Chỗ đổi được tô vàng.
2. **Sơ đồ**: Mermaid cho UC tổng quan, sơ đồ hoạt động và tuần tự cho từng UC (`usecase/mermaid/`). Sửa file `.mmd`, xuất lại PNG, thay trong Word.
3. **Giao diện trước khi code**: canvas "IELTSpace · Giao diện" (https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V) gồm hơn 50 màn HTML, xếp theo role và nghiệp vụ. Mã sinh nằm ở `ui/canvas-gen/v2/`. Quy chuẩn thiết kế ở `ui/design.md` (mục A là bản mới nhất). Các màn đã dựng là tham chiếu bố cục và nội dung khi code React.
4. **CSDL**: sửa `schema.prisma` rồi sinh lại SQL, ERD, từ điển bằng `gen.py`.
5. **Dữ liệu mẫu**: soạn đề theo file xlsx mẫu (mục 6), import qua màn Quản lý. Không có API đề IELTS chính thức; đề Cambridge/BC/IDP có bản quyền. Hướng đã chốt: tự soạn 2 đến 3 bộ, có thể nhờ AI soạn nháp rồi người duyệt. Dùng nguồn có sẵn chỉ cho demo nội bộ, ghi nguồn trong báo cáo, không deploy công khai.
6. **Phân tích khoảng trống**: `ui/doi-chieu-uc-canvas-29-10.md` đối chiếu 35 UC với màn hình.

## 6. Nhập liệu xlsx (UC23, UC24) **[Đã chốt: xlsx, không CSV hay JSON]**

- Nhập nằm **trong editor** từng kỹ năng, không có trang import riêng. Làm xong cho Reading và Listening; Writing, Speaking, Từ vựng chưa có.
- Mẫu hiện có trong `import-templates/`: `ielts-reading-template.xlsx`, `ielts-listening-template.xlsx`, `ielts-writing-template.xlsx`, `ielts-speaking-template.xlsx` (sinh bằng các script `make_template_*.py`).
- Reading gồm các sheet: De_thi, Passages, Paragraphs, Groups, Questions, Danh_muc. Các sheet nối với nhau bằng cột mã (`part_code`, `group_code`, `question_code`...). Nhiều giá trị trong một ô ngăn bằng `|`. Câu chọn nhiều đáp án là một dòng có `question_no` và `question_no_to`, đáp án dạng `A|C|E`.
- Audio và ảnh tải riêng lên Storage; ô trong xlsx chỉ ghi tên tệp.
- Kiểm tra toàn file, báo lỗi theo sheet, dòng, cột. **Có lỗi thì không lưu gì.** Tệp hỏng (không đọc được) báo một thông báo chung.
- 20 mã `question_type` và widget nhập tương ứng ở `spec/question-types-input-spec.md` (radio, checkbox, dropdown, textbox có giới hạn từ).

## 7. Đề xuất cấu trúc repo **[Đề xuất]**

Monorepo một repo GitHub:

```
ielts-space/
├─ apps/
│  ├─ web/                 # React + Vite + Tailwind
│  └─ api/                 # Express + Prisma
├─ packages/
│  └─ shared/              # kiểu TypeScript dùng chung (enum, DTO, zod schema)
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  ├─ constraints.sql      # partial unique index, CHECK
│  └─ seed.sql
├─ docs/                   # Chương 1-3, design.md, sơ đồ Mermaid, ERD
├─ design/                 # canvas HTML tham chiếu, mẫu xlsx
├─ .github/workflows/      # CI: lint, typecheck, test
├─ .env.example
└─ README.md
```

Công cụ gợi ý: pnpm workspaces, ESLint + Prettier, `zod` để kiểm tra dữ liệu vào, `vitest` cho test, `supertest` cho API. Thư viện xlsx phía backend: `exceljs`.

Biến môi trường tối thiểu: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` (frontend), `SUPABASE_SERVICE_ROLE_KEY` (chỉ backend), `JWT_SECRET` hoặc dùng JWT của Supabase để xác thực token, `CORS_ORIGIN`, `VITE_API_URL`. Không commit khóa thật.

Quy ước Git **[Đề xuất]**: nhánh `main` bảo vệ, nhánh tính năng `feat/<uc>-<tên>`, PR nhỏ theo UC, commit tiếng Anh hoặc tiếng Việt thống nhất một kiểu.

## 8. Thứ tự dựng **[Đề xuất]**

1. Khởi tạo repo, Supabase project, Prisma, kết nối DB, seed (mục 3).
2. Xác thực và phân quyền 3 vai trò: UC01, UC02, UC04, UC26, UC06; middleware kiểm vai trò.
3. Quản lý đề: UC20, UC30-tương-đương (editor), nhập xlsx UC23, UC24 cho Reading rồi Listening.
4. Người học xem và làm bài L/R: UC27, UC07, UC09, UC13.
5. W/S: UC10, UC34 (lượt, 72 giờ), UC15, UC16, UC11, UC18; cần job định kỳ (hủy quá 72 giờ, làm mới lượt thứ Hai, xóa nội dung quá 14 ngày).
6. Từ vựng và flashcard: UC28, UC29, UC30, UC12, UC22.
7. Bài mẫu: UC05, UC21. Thông báo UC35, thống kê UC25. Giao diện sáng/tối UC14 làm cuối.

## 9. Việc còn mở

- Chốt CSDL gốc: bản 22 bảng hay bản nhóm 39 đến 40 bảng (mục 3), và các điểm mơ hồ của bản nhóm (thẻ nhãn trong flashcard, bảng cấu hình hệ thống, `daily_motivations`).
- Màn còn thiếu trên canvas: Quản lý từ vựng (UC22), lịch sử nhập (UC23), giao diện tối, sidebar Giáo viên. Chi tiết ở `ui/doi-chieu-uc-canvas-29-10.md`.
- Danh sách mã `question_type` và `sample_type` chưa duyệt chính thức; kéo thả (drag and drop) chưa có.
- Yêu cầu phần cứng, dịch vụ tra từ (Merriam-Webster Thesaurus đang xem xét).
- Chương 2 chưa sửa theo các quyết định ngày 20/10 (xlsx thay JSON/CSV, v.v.).

## 10. Mẫu câu lệnh cho ChatGPT

> Bạn là kỹ sư full-stack. Đọc tài liệu "Đặc tả quy trình làm việc và công nghệ để setup repo (IELTSpace)" tôi gửi kèm. Hãy dựng monorepo theo mục 7 với pnpm workspaces: `apps/web` (React + Vite + TypeScript + Tailwind), `apps/api` (Express + TypeScript + Prisma), `packages/shared`. Thêm ESLint, Prettier, `.env.example`, README hướng dẫn chạy, và CI GitHub Actions (lint, typecheck, test). Chưa viết nghiệp vụ; chỉ dựng khung, một route `GET /health`, kết nối Prisma tới PostgreSQL, và trang React gọi `/health`. Tuân thủ mục 2 (quy tắc kỹ thuật bắt buộc). Hỏi lại tôi nếu thiếu thông tin, đừng tự đoán.

Đính kèm thêm khi cần: `thiet-ke-csdl/schema.prisma`, `spec/question-types-input-spec.md`, `ui/design.md`, và file xlsx mẫu.
