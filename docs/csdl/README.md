# Chạy cấu trúc CSDL IELTSpace

**Database đã chạy 01 cũ:** dùng [04_nang_cap_tu_01.sql](04_nang_cap_tu_01.sql) và [05_danh_muc_bo_de.sql](05_danh_muc_bo_de.sql). **Project Supabase mới với schema public trống:** chạy một lần [01_tao_cau_truc_moi.sql](01_tao_cau_truc_moi.sql). Ngày 13/11, cấu trúc đã theo [D08–D10](../DECISIONS.md) và thiết kế Quản lý bộ đề (40 bảng: bổ sung bảng `exam_set_categories`, bỏ exam_versions, kỹ năng có trạng thái và phiên bản, trigger updated_at cho exam_sets và exams, ràng buộc UNIQUE tên bộ đề). Tệp 05 tách riêng bảng danh mục động, thêm 5 danh mục mặc định và chuyển đổi dữ liệu an toàn.

## Database đang dùng

1. Sao lưu bằng cơ chế của môi trường đang dùng, gồm schema, dữ liệu, trigger Auth, quyền và policy. Tạo bản sao để chạy thử. Ghi số dòng các bảng quan trọng, đặc biệt là users, attempts, grading_requests và question_answers. Chọn thời gian tạm dừng ứng dụng ghi dữ liệu.
2. Trong SQL Editor của bản sao, chạy các truy vấn chỉ đọc bên dưới. Đối chiếu định nghĩa cũ nếu DB đã được sửa thủ công sau 01. Với nhiều bản nháp, xác định nháp nào tiếp tục sử dụng và xử lý lịch sử trước khi tạo unique index. Với mã cũ bất thường, đối chiếu dữ liệu gốc trước khi chuyển.
3. Mở 04. Nếu đã nhập lô đề, điền từng ánh xạ vào import_map ở đầu tệp theo mã đề và kỹ năng thật. Hai loại SAMPLE/VOCABULARY không cần ánh xạ nếu mã đã đúng. Nếu có phiên ôn theo nhãn, điền tag_session_map với bộ từ tương ứng sau khi đối chiếu thẻ. Chưa xác định được bộ thì dừng ở bước này. Lưu lại bản SQL đã điền để tái hiện trên môi trường thật.
4. Chạy **toàn bộ tệp 04 trong một lần**. Một transaction bao trọn kiểm tra, chuyển dữ liệu và thay cấu trúc. Khi lỗi, đọc dòng báo lỗi, dùng `ROLLBACK;` nếu phiên SQL còn ở trạng thái lỗi, sửa nguyên nhân rồi chạy lại từ đầu. Nếu hết thời gian chờ khóa, đợi các giao dịch đang ghi kết thúc. Tệp 04 nhận diện 01 cũ và dừng nếu DB đã nâng cấp.
5. Thực hiện kiểm tra sau nâng cấp bên dưới. Sau khi đối chiếu bản sao đạt yêu cầu, áp dụng cùng quy trình cho database thật. Nếu cần quay về sau khi đã commit, phục hồi bản sao lưu đã kiểm chứng. Schema lưu trữ chỉ giữ một số trường lịch sử.

### Kiểm tra trước trên cấu trúc 01 cũ

```sql
select exam_id, count(*) from public.exam_versions
where status='DRAFT' group by exam_id having count(*)>1;

select k.id, k.skill, b.skill as thang_skill, b.exam_type, e.exam_type as loai_de
from public.exam_skills k join public.exam_versions v on v.id=k.exam_version_id
join public.exams e on e.id=v.exam_id join public.band_scales b on b.id=k.band_scale_id
where k.skill='READING' and (b.skill<>'READING' or b.exam_type<>e.exam_type);

select s.id, k.skill, s.section_type from public.exam_sections s
join public.exam_skills k on k.id=s.exam_skill_id
where (k.skill,s.section_type) not in (('READING','PASSAGE'),('LISTENING','SECTION'),
 ('WRITING','TASK'),('SPEAKING','PART'));

select id,skill,band_scale_id,grading_rule_id from public.exam_skills
where (skill in ('READING','LISTENING') and grading_rule_id is not null)
   or (skill in ('WRITING','SPEAKING') and band_scale_id is not null);

select id,import_type,file_name from public.import_batches
where import_type not in ('SAMPLE','VOCABULARY');
select id,user_id,tag_id from public.flashcard_sessions where source_type='TAG';
select self_rating,count(*) from public.flashcard_session_items group by self_rating;
```

Các giá trị tự đánh giá được nhận là NULL, REMEMBERED, NOT_REMEMBERED hoặc hai nhãn tiếng Việt “Đã nhớ”, “Chưa nhớ”. Tệp 04 chuyển hai nhãn sang mã. Giá trị khác làm transaction dừng ở ràng buộc flashcard_rating_valid.

### Các thay đổi có ảnh hưởng đến dữ liệu cũ

| Vùng | Xử lý khi nâng cấp |
|---|---|
| Bộ đề và Test | Đổi tên cover_path thành cover_url, giữ giá trị đường dẫn. Thêm category, mọi bộ cũ nhận OTHER: Quản lý cần chọn lại danh mục. Bộ đề không còn Bản nháp nhận published_at là ngày đăng sớm nhất của các Test bên trong, không có thì lấy updated_at. Gán order_no ban đầu theo created_at, rồi id trong mỗi bộ. Kiểm tra lại thứ tự mong muốn của Quản lý. Bỏ exams.status và exams.exam_type sau khi đã chuyển sang kỹ năng. |
| Phiên bản và kỹ năng (D08) | Mỗi dòng exam_skills giữ nguyên id, nhận exam_id, version_number, created_at, published_at từ phiên bản cũ. Reading/Writing nhận form từ exam_type của Test (GENERAL_TRAINING → GENERAL). Trạng thái: phiên bản nháp → DRAFT; phiên bản đã đăng mới nhất của Test → PUBLISHED nếu Test cũ Công khai, còn lại HIDDEN; phiên bản đã đăng cũ hơn → ARCHIVED. Bỏ exam_versions và exam_skills.order_no (bản sao ở ielts_archive_01). attempts.exam_version_id thành exam_id; bài làm cũ vẫn trỏ đúng kỹ năng đã làm qua skill_attempts.exam_skill_id. Tệp dừng nếu một Test có nhiều bản nháp hoặc Reading dùng thang khác loại đề. |
| Thang band | exam_type thành form, chỉ Reading có form. Hai thang Listening chỉ khác exam_type sẽ thành hai dòng giống nhau: giữ một và gán lại kỹ năng dùng dòng kia nếu muốn gọn. |
| Phần thi | Thêm config, giữ transcript hiện có. Không có cột form (lấy từ kỹ năng). Cột sinh section_skill và khóa ngoại ghép bảo vệ quan hệ với kỹ năng cha. Giữ thứ tự duy nhất trong mỗi kỹ năng. |
| Nhóm câu và câu hỏi | Dải số L/R được suy từ thứ tự phần, nhóm, câu và answer_count, tính riêng theo từng kỹ năng. Kiểm lại với đề gốc nếu số hiển thị cũ có khoảng trống hoặc bắt đầu khác 1. Nhóm trống và W/S có thể để dải số NULL. |
| JSON cũ | Passage chỉ có khóa paragraphs được bóc thành mảng. Nếu có khóa bổ sung, giữ nguyên object để đối chiếu. Sao chép các trường bằng chứng nhận diện được từ explanation sang evidence và giữ lời giải gốc. Kiểm tra các cấu trúc JSON riêng của dữ liệu thật. |
| Từ vựng | Giữ thẻ và tiến độ ôn. Chuyển hai bảng nhãn cũ sang schema riêng ielts_archive_01, lưu liên kết phiên–nhãn trước khi bỏ tag_id trong bảng nghiệp vụ. Không mở schema này qua Supabase Data API. |
| Lô nhập | Giữ id, request_key, asset và lỗi. Gắn đích nhập bằng bảng ánh xạ (Test, kỹ năng và form cho Reading/Writing). Ràng buộc kiểm tra skill khớp EXAM_* và form có đúng khi cần, còn SAMPLE/VOCABULARY để đích đề trống. |
| Cấu hình | Thêm system_settings theo bảng trong bản Word, khởi tạo 72 giờ, 14 ngày và 10 thẻ. Giá trị mặc định tải giáo viên trong 01 là 5; chưa thêm khóa teacher_default_max_pending vì bản Word chờ nhóm chốt. Giới hạn 72 giờ trong CHECK cũ vẫn áp dụng. Việc cho sửa tham số vận hành cần đồng bộ backend và ràng buộc. |

Các bảng users, skill_attempts, attempt_section_states, support_credits, grading_requests, credit_refunds, learning_activities, notifications cùng các khóa đã đúng được giữ nguyên. Các trigger liên kết Supabase Auth hiện có nằm ngoài phạm vi sửa của 04. Khởi tạo project mới cần thiết lập trigger hồ sơ riêng theo [hướng dẫn Auth](../PROGRESS/2026-11-07-trang-thai-du-an.md#cấu-hình-auth).

### Kiểm tra sau khi chạy

```sql
select key,value from public.system_settings order by key;
select e.title,k.skill,k.form,k.version_number,k.status,k.published_at from public.exam_skills k
join public.exams e on e.id=k.exam_id order by e.exam_set_id,e.order_no,k.skill,k.form,k.version_number;
select s.id,s.section_type,k.skill,k.form,s.order_no from public.exam_sections s
join public.exam_skills k on k.id=s.exam_skill_id order by k.id,s.order_no;
select name,category,status,published_at from public.exam_sets order by name;
select g.id,g.question_from,g.question_to,q.order_no,q.number_from,q.number_to
from public.question_groups g join public.questions q on q.question_group_id=g.id
order by g.id,q.order_no;
select to_regclass('public.vocabulary_tags') as nhan_trong_nghiep_vu,
       to_regclass('ielts_archive_01.vocabulary_tags') as nhan_luu_tru;
select count(*) from pg_tables where schemaname='public';
```

So số dòng với trước nâng cấp. Với DB chỉ chứa bảng IELTSpace, public có 39 bảng (01 sau D08). Nếu có thêm bảng riêng, tổng số sẽ khác. Trên đường nâng cấp, nhan_trong_nghiep_vu là NULL và nhan_luu_tru có giá trị. Chạy lại kiểm tra RLS/quyền ở 03 cũ, thử đăng nhập bằng tài khoản đã có, mở đề mẫu và kiểm tra dữ liệu thật trước khi bật ghi trở lại.

### Nâng cấp quy tắc chấm Writing & Speaking (06)

Ngày 14/11: [06_quy_tac_cham_ws.sql](06_quy_tac_cham_ws.sql) khởi tạo 4 bộ quy tắc chấm `grading_rules` chuẩn IELTS với phạm vi `assessment_scope = 'FULL_SKILL'` và bảng `rubric_criteria` với 16 tiêu chí rubric (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy cho Writing; Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation cho Speaking).

[Từ điển bảng](CSDL.md).
