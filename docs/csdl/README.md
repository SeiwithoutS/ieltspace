# Chạy cấu trúc CSDL IELTSpace

Phần mục tiêu và Flashcard dùng [14_learner_study_history.sql](14_learner_study_history.sql) sau khi bảng người học và từ vựng đã có. Tệp tăng dần này lưu metadata của phiên và thêm chỉ mục lịch sử.

Sau migration 14, chạy [15_learner_activity.sql](15_learner_activity.sql) để thêm chỉ mục theo ngày học và bổ sung mỗi phiên Flashcard đủ điều kiện đã lưu thành một hoạt động, kể cả khi chạy lại.

Chạy [16_learner_checkins.sql](16_learner_checkins.sql) trước khi triển khai báo cáo tiến độ có điểm danh. Bảng `learner_checkins` lưu mỗi tài khoản một lượt điểm danh mỗi ngày Việt Nam. Backend đọc bảng qua kết nối PostgreSQL.

Chạy [17_nhat_ky_dang_nhap.sql](17_nhat_ky_dang_nhap.sql) và [18_ma_bao_mat_quan_tri.sql](18_ma_bao_mat_quan_tri.sql) trước khi triển khai quản trị đợt 2–3. Hai bảng cần quyền truy cập qua kết nối PostgreSQL của backend, bật RLS và thu hồi quyền trực tiếp của khách/người dùng. Lịch sử bắt đầu từ lúc triển khai. Đợt 3 ghi thao tác vào `audit_logs` hiện có.

Chạy [19_staff_invitations.sql](19_staff_invitations.sql) rồi [20_account_deletion.sql](20_account_deletion.sql) trước khi triển khai quản trị đợt 4–5. Trên dự án dùng trigger `on_auth_user_created` với hàm `handle_new_auth_user`, chạy [19a_staff_invitation_auth_compat.sql](19a_staff_invitation_auth_compat.sql) trước 19. Tệp 19a tách nhánh lời mời và giữ nguyên hàm tạo hồ sơ đăng ký công khai. Migration 19 mở trạng thái `INVITED`. Migration 20 thêm hàng đợi dọn Auth/Storage và thủ tục ẩn danh hồ sơ. Hai bảng được đọc qua kết nối DB của backend.

Chạy [21_notifications_support_reports.sql](21_notifications_support_reports.sql) trước khi triển khai API thông báo, hỗ trợ và Dashboard có số phiếu. Tệp thêm chỉ mục chưa đọc vào bảng `notifications` hiện có và tạo `support_reports`, `support_report_updates`. Hai bảng bật RLS và chỉ đọc/ghi qua backend.

Sau 20 và 21, chạy [27_remove_deleted_learner_support_reports.sql](27_remove_deleted_learner_support_reports.sql) để xóa phiếu, phản hồi và lịch sử phiếu khi tài khoản Người học chuyển sang `DELETED`. Quy tắc áp dụng cho những lượt xóa phát sinh sau khi cài migration.

Chạy [22_vocabulary_image_assets.sql](22_vocabulary_image_assets.sql) trước khi bật tải ảnh từ vựng qua R2. Tệp cần các bảng từ vựng và bảng bản nháp đã có. Tệp tạo bảng tham chiếu ảnh riêng cho backend, bật RLS và thêm chỉ mục kiểm tra ảnh đã công bố.

Chạy [23_announcements_and_notification_settings.sql](23_announcements_and_notification_settings.sql) trước khi phát hành thông báo chung và tác vụ nhắc hết hạn. Tệp tạo bảng lịch gửi và cài đặt mẫu, bật RLS và thu hồi quyền trực tiếp của khách/người dùng. Mẫu mặc định nằm trong backend và chỉ sinh bản ghi cài đặt khi Quản lý lưu thay đổi.

Chạy [24_staff_accounts_and_authenticator.sql](24_staff_accounts_and_authenticator.sql) sau 19, rồi chạy [25_staff_auth_metadata.sql](25_staff_auth_metadata.sql) để bật tạo nhân sự bằng mật khẩu tạm. Nếu đã chạy 24, chỉ bổ sung 25. SQL 25 xử lý thứ tự Supabase Auth lưu vai trò nhân sự và cho phép Quản lý thử lại bằng đúng thông tin của lần tạo lỗi nếu tài khoản chưa được sử dụng. Tài khoản hiện có vẫn đăng nhập được trước hai migration này.

Sau khi triển khai, Quản lý mở **Hồ sơ cá nhân → Google Authenticator**, quét QR và xác nhận mã 6 số. Quản lý tạo nhân sự trong trang **Người dùng** và chuyển thông tin đăng nhập qua kênh riêng. Nếu một email còn hồ sơ `INVITED` cũ, xử lý hồ sơ đó trong trang **Người dùng** trước khi tạo tài khoản bằng cùng email.

Chạy [26_speaking_attempts.sql](26_speaking_attempts.sql) trước khi bật API lượt làm Speaking (`/learner/skill-attempts`). Tệp thêm `client_attempt_id`, `mode`, `time_limit_minutes`, cho `deadline_at` nhận NULL và khóa theo câu hỏi cho bản ghi âm ở `submission_contents`. Đã áp lên database Supabase dùng chung ngày 2026-11-25 (các bảng liên quan lúc đó rỗng). Database khác thì chạy lại, tệp idempotent.

Tiền đề của 26: đã có các bảng `attempts`, `skill_attempts`, `submission_contents` (từ 01 hoặc 01 mới; database cũ chạy 04, 05). Tệp 26 không tự tạo các bảng này và dừng bằng lỗi nếu thiếu hoặc nếu `recording_status` có giá trị ngoài `PENDING`, `UPLOADED`, `DELETED`. Kiểm tra trước khi áp:

```sql
select to_regclass('public.attempts'), to_regclass('public.skill_attempts'), to_regclass('public.submission_contents'); -- không NULL
select distinct recording_status from public.submission_contents; -- chỉ NULL, PENDING, UPLOADED, DELETED
select count(*) from public.submission_contents; -- ghi lại để so sau khi áp
```

Rollback 26 (thủ công, khối chú thích cuối tệp): bỏ hai index theo câu hỏi và ràng buộc `recording_status`, thêm lại unique `(skill_attempt_id, section_id)` (cần không còn hàng `question_key <> ''`), đặt lại `deadline_at not null` (cần không còn hàng NULL), rồi bỏ các cột `question_key`, `mode`, `time_limit_minutes`, `client_attempt_id` (mất dữ liệu ở các cột này). Tắt API `/learner/skill-attempts` trước khi rollback.

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

### Khởi tạo thang điểm Band Reading & Listening (10)

Ngày 19/11: [10_thang_band_lr.sql](10_thang_band_lr.sql) khởi tạo 3 thang quy đổi band điểm chuẩn Cambridge cho Listening, Reading Academic và Reading General trong bảng `band_scales` (phiên bản 1). Bảng cấu trúc `conversion_rules` dạng JSON lưu các khoảng điểm số câu đúng (0–40) tương ứng với band điểm từ 0.0 đến 9.0.

[Từ điển bảng](CSDL.md).
