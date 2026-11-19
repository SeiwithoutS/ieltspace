Ngày tạo: 16/11/2026 · Cập nhật: 19/11/2026

# Kiến trúc và thiết lập từ vựng

## Nhập tệp và tự lưu bản nháp ngày 19/11/2026

- Quản lý tải [mẫu Excel từ vựng](../frontend/public/templates/mau-tu-vung.xlsx). Sheet đầu chứa dữ liệu, sheet thứ hai hướng dẫn điền từng cột. Bộ đọc vẫn nhận CSV và XLSX có dữ liệu ở sheet đầu.
- Chọn tệp → đọc và kiểm tra dòng → xác nhận nếu thay danh sách đang sửa → `PUT /api/admin/vocabulary/sets/:id/draft` ghi toàn bộ từ theo revision → tra media → dùng revision mới để lưu các URL tìm được. Bản nháp nằm trong `public.vocabulary_set_drafts.content.words`. Ảnh tạm dạng data URL chỉ hiển thị tại trình chỉnh sửa. Audio và URL ảnh hợp lệ vẫn được gửi lưu.
- Điều hướng trong ứng dụng được giữ lại khi đang đọc tệp hoặc chờ lần ghi. Sau lần lưu đầu, quản lý có thể xác nhận rời trang trong lúc tra media. Khi mở lại bộ, editor đọc danh sách đã lưu và có thể dùng **Tìm lại URL** cho các mục thiếu.
- **Lưu** ghi thay đổi vào nháp. **Công bố** cập nhật thư viện từ phiên bản vừa lưu. Mắt mở/nhắm biểu thị trạng thái hiển thị của bộ đã công bố.

## Mốc nối API lưu nháp ngày 16/11/2026

Phần này thay thế mô tả “chỉ localStorage” bên dưới, vốn ghi trạng thái trước khi nối DB.

- Trang quản lý đọc/tạo bộ từ database; UUID do backend tạo. Lưu từ vào `vocabulary_set_drafts.content.words`, tăng revision khi lưu thành công. Có sửa thông tin và xóa bộ DRAFT chưa có từ công bố. Truy vấn Prisma đều có tham số; không cần generate lại model hoặc db push.
- Giữ UI danh sách/popup hiện có. Bộ localStorage cũ không tự nhập sang database và không bị xóa. Thư viện học viên vẫn đọc dữ liệu cục bộ cũ: chưa nối API công bố/đọc công khai trong đợt này.
- Tạm bỏ Công bố/Ẩn bằng localStorage trên editor DB để không báo thành công sai.
- Ảnh từ phải là URL HTTPS; ảnh máy/Pixabay dạng data URL chưa có đường upload Storage. UI có nút Bỏ ảnh để thử lưu từ. Ảnh bìa hỗ trợ URL HTTPS và bìa màu có sẵn, chưa lưu bìa raster tải máy. Không tự cắt mất ảnh khi lưu thất bại.
- Trường audio còn một dòng select, nhóm Free Dictionary/Merriam; nhóm thiếu kết quả có option vô hiệu hóa, không giả URL. Bấm Tìm lại audio để nhận nguồn mới.
- Backend đọc `.env` theo đường dẫn backend cố định, độc lập thư mục chạy lệnh. Cần dừng và chạy lại backend sau khi sửa key. Không thay giá trị secret.

### Kết quả tra thật và việc cần làm

Với `curriculum`, kiểm tra bằng key trên máy nhận Free Dictionary + Merriam Learner’s và ba ảnh Unsplash. Pixabay trả HTTP 429; code nay báo rõ hạn mức. `MW_DICTIONARY_KEY` có giá trị nhưng chưa có `MW_DICTIONARY_PRODUCT`; chỉ thêm `MW_DICTIONARY_PRODUCT=collegiate` nếu key đúng sản phẩm Collegiate. Learner’s vẫn hoạt động không cần biến này.

1. Dừng backend bằng Ctrl+C, từ backend chạy `npm run dev`; frontend chạy lại nếu đang dùng bản build cũ.
2. Quản lý từ vựng → Tạo bộ → dùng bìa màu/URL HTTPS → mở bộ.
3. Nhập hai từ từ CSV/XLSX, kiểm tra và dùng URL ảnh HTTPS (hoặc Bỏ ảnh nếu đang là ảnh nhúng).
4. Bấm Lưu bản nháp; phải thấy thông báo lưu database cùng revision. F5 rồi mở lại bộ phải thấy từ.
5. Trong SQL Editor kiểm tra câu sau. Chưa cần chạy thêm CREATE TABLE hay GRANT vì kiểm thử bằng runtime database role hiện tại đã ghi/đọc được.

```sql
select s.id, s.name, s.status, d.revision,
       jsonb_array_length(d.content->'words') as so_tu_nhap,
       d.updated_at
from public.vocabulary_sets s
join public.vocabulary_set_drafts d on d.set_id=s.id
order by d.updated_at desc;
```

Bước tiếp theo: upload Storage, transaction công bố sang bảng từ/liên kết và API thư viện học viên. Vì chưa công bố, chưa có dòng trong vocabularies/vocabulary_set_items từ thao tác Lưu bản nháp là đúng.

### File và kiểm chứng của bước lưu nháp

- Thêm `backend/src/modules/vocabulary/vocabulary.routes.ts`: danh sách, tạo, đọc nháp, lưu revision, sửa metadata, xóa nháp.
- Thêm `frontend/src/lib/vocabulary/vocabulary-api.ts`; nối `SetDirectory.tsx` và `AdminVocabulary.tsx` vào API.
- Sửa `backend/src/routes.ts`, `config.ts`, `media.routes.ts`, `WordMediaEditor.tsx` đúng phạm vi từ vựng/đọc key.
- Typecheck/backend build/frontend build qua. 10 kiểm thử validation/Auth/media qua.
- Test tích hợp dev `vocabulary-db.integration.mjs`: thực thi handler tạo/lưu/đọc/sửa với SQL thật, kiểm tra revision conflict, không ghi bảng công bố, luôn rollback bộ thử; qua. Đây không phải kiểm thử toàn bộ UI qua trình duyệt đăng nhập. Chưa kiểm thử trực quan dropdown.


## Phạm vi đã có

Quản lý tạo bộ → nhập CSV/XLSX hoặc thêm từ → tự tra media → chọn/sửa ảnh và audio → lưu nháp → công bố. **Bộ từ, nội dung, trạng thái và lựa chọn media hiện lưu trong localStorage, chưa lưu PostgreSQL.** Nhập file chỉ thay state đang sửa; phải bấm Lưu bản nháp/Công bố. Học viên ở cùng trình duyệt đọc bản công bố. Backend mới cung cấp tra media; chưa có API lưu/import/công bố bộ từ.

```text
AdminVocabulary → vocabulary-import (đọc file trên trình duyệt)
               → vocabulary-media → apiFetch + access token
                    → Express /admin/vocabulary/media
                       → requireAuth → requireRole(ADMIN) → giới hạn request
                       → Free Dictionary + Merriam / Unsplash + Pixabay
               → WordMediaEditor chọn nguồn và sửa URL
               → WordImage chọn ảnh máy / WordCard nghe thử
               → data/vocabulary → localStorage nháp và bản công bố
Vocabulary người học → data/vocabulary → WordCard
```

## Cấu hình API tại backend

Thêm vào `backend/.env`, không đưa key vào frontend, VITE_* hoặc Git:

```dotenv
MW_LEARNERS_KEY=key_learner_cua_ban
MW_DICTIONARY_KEY=key_dictionary_cua_ban
MW_DICTIONARY_PRODUCT=collegiate
PIXABAY_API_KEY=key_pixabay_cua_ban
UNSPLASH_ACCESS_KEY=access_key_unsplash_cua_ban
```

- Merriam: key Learner’s dùng sản phẩm `learners`. Chỉ đặt `MW_DICTIONARY_PRODUCT=collegiate` nếu key Dictionary thực sự đăng ký sản phẩm Collegiate. Nếu chưa xác nhận, để trống/bỏ biến product; Learner’s vẫn hoạt động riêng. Adapter hiện chỉ hỗ trợ hai sản phẩm này.
- Pixabay: đăng nhập, lấy API key ở [tài liệu Pixabay](https://pixabay.com/api/docs/).
- Unsplash: tạo ứng dụng Developer, lấy **Access Key**, không dùng Secret Key cho biến trên. [Tài liệu Unsplash](https://unsplash.com/documentation).
- Free Dictionary không cần key.
- Khởi động lại backend sau khi sửa `.env`: từ `backend` chạy `npm run dev`. Frontend chạy `npm run dev` từ `frontend`. Đăng nhập tài khoản ADMIN thuộc đúng project dev.
- Tại lần kiểm tra này, năm biến mới chưa có giá trị trong `.env`; chưa kiểm thử nhà cung cấp có key thật.

## Audio

GET `/api/admin/vocabulary/media?type=audio&word=curriculum` gọi Free Dictionary và mọi sản phẩm Merriam đã cấu hình. Kết quả chứa `candidates` (URL, nguồn, giọng nếu biết) và `warnings`. Chọn ứng viên Free Dictionary đầu tiên; nếu không có, dùng Merriam. Dropdown hiển thị nguồn và URL, ô bên dưới cho nhập tay. Một nguồn lỗi không loại bỏ kết quả nguồn khác. Tra không thấy không xóa URL cũ.

Merriam chỉ lấy đúng mục từ, bỏ gợi ý chính tả và dựng URL MP3 theo quy tắc bix/gg/number/chữ đầu. Bản ghi từ đường dẫn `en/us` gắn US; không gán UK. [Quy tắc Merriam](https://dictionaryapi.com/products/json).

WordCard ưu tiên URL được chọn cho giọng phù hợp, sau đó ứng viên của giọng đó. Nếu chưa có bản ghi phù hợp, dùng giọng thiết bị và thông báo rõ. Giọng thiết bị không tạo URL; không thể tự điền nó vào trường URL. Audio chưa rõ giọng có nút riêng “Nghe bản đã chọn”.

## Ảnh

GET `/api/admin/vocabulary/media?type=image&word=curriculum` tìm cả Unsplash và Pixabay, mỗi nguồn tối đa ba ảnh, bật bộ lọc an toàn. Ưu tiên kết quả Unsplash; nếu lấy ảnh không thành công, thử ứng viên tiếp theo. Quản lý có thể chọn ảnh khác trong danh sách gợi ý.

POST `/api/admin/vocabulary/media/image` nhận ID ứng viên đã tra, không nhận URL tùy ý:

- Unsplash: ghi nhận download qua API, giữ URL ảnh trả về cùng tham số của nhà cung cấp, hiển thị tên tác giả và nguồn có liên kết.
- Pixabay: lấy bản sao tối đa 1 MB thành data URL cho bản nháp trên trình duyệt, tránh dùng hotlink preview làm ảnh lâu dài. Khi tích hợp CSDL, chuyển bản sao sang Supabase Storage và chỉ lưu storage path/metadata trong PostgreSQL. Ảnh gợi ý vẫn là preview.
- Cache phản hồi nhà cung cấp 24 giờ trong bộ nhớ, có giới hạn số mục; cache mất khi backend khởi động lại hoặc bị loại khỏi giới hạn. Trước triển khai nhiều server cần cache dùng chung bền vững. Giới hạn endpoint 120 request/phút; frontend giãn request tối thiểu 750 ms, bốn worker nhập từ. Import lớn mất thời gian và có thể vượt hạn mức riêng của gói API; UI báo lỗi/thiếu media để tìm lại.
- Bấm ảnh/ô chữ trên card quản lý mở hộp chọn file; JPG/PNG/WebP tối đa 1 MB. Ảnh máy và bản sao Pixabay không có URL web, ô URL hiển thị trạng thái thay vì chuỗi base64 dài. localStorage có hạn mức, không phù hợp bộ lớn nhiều ảnh nhúng.

## Vì sao Supabase chưa có từ?

Không phải lỗi SQL hay thiếu một nút thiết lập. `storeWords()` hiện chỉ ghi localStorage. Main Prisma schema chưa có model từ vựng và backend chưa có API ghi bộ từ. Bảy bảng đã tạo ở dev không tự nhận dữ liệu từ UI.

Không chạy lại script tạo toàn bộ cấu trúc hoặc `prisma db push` từ schema rút gọn. Không đổi về database nhóm để thử khắc phục. Luồng cần triển khai tiếp:

1. Đối chiếu cột/khóa hiện tại của `vocabulary_sets`, `vocabularies`, `vocabulary_set_items` và bốn bảng cá nhân. Introspect vào file riêng, không ghi đè schema đang dùng.
2. Bổ sung models và migration phần thiếu: phiên bản nháp/công bố, metadata nguồn audio/ảnh, ID từ ổn định. Thử trên dev, giữ liên kết yêu thích/ghi chú/flashcard.
3. API ADMIN tạo/sửa/xóa bộ, lưu từ, import preview/confirm, công bố/ẩn; validate server, transaction khi ghi nhiều bảng và kiểm tra quyền. Import không phụ thuộc việc nhà cung cấp media có trả kết quả hay không.
4. API người học chỉ đọc bản công bố; dữ liệu cá nhân giới hạn theo người dùng. Cấu hình RLS theo đường truy cập thực tế; không mở toàn bộ bảng cho anon để chữa lỗi UI.
5. Chuyển `data/vocabulary` sang repository gọi API, giữ dữ liệu cục bộ cũ để xuất/nhập có kiểm tra, không tự đẩy mẫu lên DB. Lưu ảnh máy/Pixabay vào bucket được kiểm soát.
6. Nghiệm thu: tạo bộ, import, lưu, reload, công bố; xem đúng hàng trong DB và đăng nhập trình duyệt thứ hai thấy bộ. Thử lỗi import phải rollback, quyền học viên không được ghi, ẩn bộ không còn xuất hiện công khai.

Không có migration hoặc thao tác ghi Supabase trong lần tích hợp media này. Cấu trúc tham chiếu hiện có ở [SQL tạo cấu trúc](csdl/01_tao_cau_truc_moi.sql) và [mô tả CSDL](csdl/CSDL.md). SQL tham chiếu không thay thế việc kiểm tra database dev thực tế.

## Hướng dẫn nối PostgreSQL và hiển thị cho người học

### 1. Những gì có thể chuẩn bị ngay

Dùng IELTSpace-dev đã kết nối được Auth; không cần tạo project mới hoặc đổi key lần nữa. Giữ frontend và backend trỏ cùng môi trường. Database dùng chung cho Auth, đề thi và từ vựng trong một môi trường; dev và project nhóm là hai môi trường riêng.

Trong SQL Editor của dev, chạy các câu chỉ đọc dưới đây để xác nhận cột và khóa thực tế trước khi viết migration:

```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'vocabulary_sets', 'vocabularies', 'vocabulary_set_items',
    'favorite_vocabularies', 'vocabulary_notes',
    'flashcard_sessions', 'flashcard_session_items'
  )
order by table_name, ordinal_position;

select c.conrelid::regclass as bang, c.conname,
       pg_get_constraintdef(c.oid) as rang_buoc
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
  and t.relname in ('vocabulary_sets', 'vocabularies', 'vocabulary_set_items')
order by bang, c.conname;

select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in
('vocabulary_sets','vocabularies','vocabulary_set_items','favorite_vocabularies','vocabulary_notes');

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename in
('vocabulary_sets','vocabularies','vocabulary_set_items','favorite_vocabularies','vocabulary_notes');
```

Không có dòng ở truy vấn policy không có nghĩa là frontend đã được phép đọc. Prisma kết nối PostgreSQL bằng database role của chuỗi kết nối; JWT Supabase không tự động trở thành ngữ cảnh RLS cho mọi truy vấn Prisma. Backend phải kiểm tra vai trò và lọc dữ liệu; quyền SQL/RLS phải được kiểm tra với đúng runtime role. Không tắt RLS để chữa một luồng chưa có API.

### 2. Ánh xạ bảng và chốt phần cần bổ sung

Theo SQL trong repository:

| Dữ liệu UI | Cột đang có / cách ánh xạ đề xuất |
|---|---|
| Tên, mô tả, trạng thái bộ | vocabulary_sets.name, description, status |
| Ảnh bìa bộ | Chưa có cột trong SQL tham chiếu; migration cần thêm cover path/URL |
| Từ, phiên âm, audio đã chọn | vocabularies.word, phonetic, audio_url |
| Từ loại, nghĩa, ví dụ, dịch | Chuẩn hóa một mục trong definitions JSONB: partOfSpeech, meaningVi, exampleEn, exampleVi |
| Các nguồn audio và attribution | sources JSONB có cấu trúc được validate; hoặc cột metadata riêng qua migration, không lưu tùy ý mỗi nơi một dạng |
| Ảnh từ | Chưa có cột chuyên biệt trong SQL tham chiếu; thêm image path/URL và credit theo thiết kế |
| Từ thuộc bộ, thứ tự | vocabulary_set_items.set_id, vocabulary_id, order_no (bắt đầu từ 1) |
| Sao và ghi chú | favorite_vocabularies, vocabulary_notes; user_id lấy từ req.appUser.id |

Chốt cơ chế nháp trước khi code. Đề xuất giữ bản nháp riêng và chỉ cập nhật bản công bố trong transaction. Không sửa trực tiếp dữ liệu công bố khi quản lý mới bấm Lưu nháp. Các cột/bảng phiên bản cần nằm trong migration được review; schema hiện có chỉ một status không tự giữ hai bản. Giữ UUID từ ổn định để yêu thích, ghi chú, flashcard không mất liên kết. Không xóa toàn bộ vocabularies khi nhập lại bộ.

### 3. Prisma — đọc cấu trúc, rồi generate client

Mở terminal tại backend:

```powershell
cd C:\IELTS\backend
npx.cmd prisma db pull --schema=prisma/introspection.prisma --print
```

Lệnh trên chỉ in model theo database; không tạo API hoặc nhập dữ liệu. Dùng file introspection riêng đang có, không ghi đè schema runtime hoặc đem schema rút gọn đi migrate. Sau khi thêm đúng models vào schema runtime và áp dụng migration được review trên dev:

```powershell
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run typecheck
npm.cmd run build
```

Không chạy migrate dev/db push/reset từ schema runtime đang thiếu nhiều bảng. Với database đã tồn tại, thống nhất quy trình migration/baseline của nhóm trước khi giao Prisma Migrate quản lý toàn bộ schema.

### 4. Backend phải viết — các route dưới đây là đề xuất, chưa có

| Route | Tác dụng |
|---|---|
| GET /api/admin/vocabulary/sets | Tìm/lọc bộ, thống kê, số từ |
| POST /api/admin/vocabulary/sets | Tạo bộ DRAFT, trả UUID thật |
| GET /api/admin/vocabulary/sets/:id | Đọc bản nháp để sửa |
| PATCH /api/admin/vocabulary/sets/:id | Đổi tên, mô tả, bìa |
| PUT /api/admin/vocabulary/sets/:id/draft | Lưu nội dung nháp có revision để phát hiện sửa đồng thời |
| POST /api/admin/vocabulary/sets/:id/publish | Validate rồi công bố bản nháp trong transaction |
| POST /api/admin/vocabulary/sets/:id/hide | Ẩn khỏi thư viện |
| DELETE /api/admin/vocabulary/sets/:id | Xóa/đánh dấu xóa theo ràng buộc lịch sử, không cascade từ tùy tiện |
| POST /api/admin/vocabulary/sets/:id/import/preview | Validate hàng nhập, báo lỗi theo dòng |
| POST /api/admin/vocabulary/sets/:id/import/confirm | Ghi toàn bộ hàng hợp lệ trong transaction, chống gửi lặp |
| POST /api/admin/vocabulary/assets | Upload ảnh đã kiểm tra vào Storage |
| GET /api/vocabulary/sets | Danh sách chỉ PUBLISHED, phân trang và tìm tên |
| GET /api/vocabulary/sets/:id | Bản công bố và danh sách từ theo order_no; bản nháp/ẩn trả 404 |

Tái sử dụng requireAuth, requireRole("ADMIN"), HttpError và Prisma client hiện có. Không tin role/status/user_id từ trình duyệt. Phân quyền đọc công khai hay yêu cầu đăng nhập theo PRD. Frontend có thể tiếp tục parse CSV/XLSX để preview; backend vẫn phải validate payload hàng, giới hạn 500 từ, độ dài trường và kích thước request. Khi gửi JSON hàng đã parse, server không thể xác nhận kích thước file gốc 5 MB; nếu cần giới hạn file thật ở server phải bổ sung multipart upload/parser. Không gọi dịch vụ ảnh/audio bên trong transaction DB; lưu từ trước và cập nhật media riêng.

Tách module thành vocabulary.routes.ts, vocabulary.service.ts, vocabulary.schemas.ts và DTO/mapper. Route tra media hiện có giữ nguyên trách nhiệm.

### 5. Storage cho ảnh máy/Pixabay

Trong Supabase dev → Storage → tạo bucket `vocabulary-images`. Đề xuất private để ảnh nháp không công khai qua URL; cho phép JPEG/PNG/WebP và giới hạn 1 MB theo UI hiện tại. Backend kiểm tra ADMIN, upload bằng thông tin máy chủ, lưu path `sets/<setId>/<uuid>.webp` với phần mở rộng khớp dữ liệu thật. Không chỉ đổi tên đuôi nếu chưa chuyển định dạng.

API đọc tạo signed URL ngắn hạn khi caller được phép xem bộ; PostgreSQL lưu path, không lưu signed URL hết hạn. Ảnh Unsplash giữ hotlink và attribution như hiện tại. Service-role key chỉ ở backend; không mở policy upload cho mọi authenticated user. Tạo bucket không tự nối được nút upload — cần triển khai route upload và thêm cấu hình bucket vào code.

### 6. Frontend phải nối lại

- Tạo `frontend/src/lib/vocabulary/vocabulary-api.ts` dùng apiFetch chung, định kiểu dữ liệu và chuyển tên cột DB sang UI.
- SetDirectory tải danh mục qua GET; tạo bộ phải đợi POST thành công rồi dùng UUID backend trả về.
- AdminVocabulary tải draft theo ID; nút Lưu gọi PUT, Công bố gọi POST; chỉ báo thành công khi server xác nhận.
- Import file → preview → sửa lỗi → confirm → tải lại dữ liệu DB. Upload ảnh riêng, không gửi base64 dài trong danh sách từ. Lỗi media không làm mất từ đã nhập.
- Vocabulary đọc danh sách/bản công bố qua API, bỏ fallback sample và localStorage cho dữ liệu thật. Thêm loading, lỗi, thử lại, trạng thái chưa có bộ; không biến lỗi API thành danh sách rỗng im lặng.
- Sao/ghi chú cần endpoint riêng theo user nếu muốn đồng bộ cả hai chức năng. Chỉ nối bộ/từ chưa khiến dữ liệu cá nhân tự đồng bộ.
- Xuất/giữ dữ liệu localStorage trước khi đổi adapter. Import lại có xác nhận; không tự seed bộ mẫu lên database nhóm.

### 7. Kiểm thử theo thao tác người dùng

1. ADMIN tạo bộ “Education thử nghiệm” → SQL thấy một dòng DRAFT.
2. Nhập curriculum và workload → lưu/confirm → thấy hai từ và hai quan hệ trong bộ.
3. Reload trang quản lý → dữ liệu vẫn có do API đọc DB.
4. Mở trình duyệt thứ hai bằng học viên → chưa thấy bộ DRAFT.
5. ADMIN công bố → học viên tải lại thấy bộ và hai từ.
6. ADMIN sửa nháp → học viên vẫn thấy bản công bố cũ; công bố lại mới thấy thay đổi.
7. Ẩn → không thấy trong danh sách và không đọc được qua URL chi tiết công khai.
8. Học viên gọi API ghi phải bị từ chối. Import có dòng lỗi không được lưu dở; gửi confirm lại không nhân đôi.

Kiểm tra số từ thực tế (không dùng số liệu localStorage):

```sql
select s.id, s.name, s.status, count(i.id) as so_tu
from public.vocabulary_sets s
left join public.vocabulary_set_items i on i.set_id = s.id
group by s.id, s.name, s.status
order by s.name;
```

Sau khi luồng trên qua trên dev mới áp dụng migration cùng phiên bản backend/frontend lên môi trường nhóm. Không ghi đè database/Auth chung bằng bản dev.

Nguồn đối chiếu: [Supabase + Prisma](https://supabase.com/docs/guides/database/prisma), [quyền Storage](https://supabase.com/docs/guides/storage/security/access-control). Các bước trên là hướng dẫn triển khai; chưa xác nhận kết quả trên database thật.

## File liên quan

| File | Vai trò |
|---|---|
| backend/src/modules/vocabulary/media.routes.ts | Xác thực, kiểm tra quyền, gọi/chuẩn hóa nguồn, cache và chọn ảnh. |
| backend/src/config.ts, .env.example, routes.ts | Khai báo key tùy chọn và mount API. |
| frontend/src/lib/vocabulary/vocabulary-media.ts | Client tra/chọn media, ưu tiên nguồn, giãn request. |
| frontend/src/components/vocabulary/WordMediaEditor.tsx | Các trường nội dung, dropdown audio, gợi ý ảnh, tìm lại. |
| frontend/src/components/vocabulary/WordImage.tsx | Card ảnh, chọn file, ghi nguồn ảnh. |
| frontend/src/components/vocabulary/WordCard.tsx | Dùng ảnh chung, phát bản ghi hoặc giọng thiết bị. |
| frontend/src/pages/vocabulary/AdminVocabulary.tsx | Điều phối import, tự tra, tìm lại hàng loạt, lưu cục bộ. |
| frontend/src/data/vocabulary.ts | Kiểu candidates/credit và dữ liệu localStorage. |
| frontend/src/pages/vocabulary/vocabulary.css | Bố cục, ảnh nhỏ và viền focus nằm trong trường, không bị cắt. |
| backend/tests/vocabulary-media.test.mjs | Test nguồn audio, fallback, cache, ảnh và metadata với phản hồi mô phỏng. |

## Kiểm tra

Backend typecheck/build và frontend build đã qua. Sáu test (bốn media, hai Auth) đã qua. Test nhà cung cấp dùng fetch mô phỏng, không xác nhận key/quota thực tế. Chưa kiểm thử giao diện trực quan trên đủ breakpoint, chọn file thật, phát audio thật và tải ảnh thật với các key mới.
