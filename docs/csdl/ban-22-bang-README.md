# Thiết kế CSDL - Hệ thống luyện đề IELTS (bản rút gọn, 22 bảng)

Ngày 2026-10-24. Bám Chương 3 bản "(sửa 20-10 lần 2)" (35 UC, mục 3.3-3.4), spec dạng câu hỏi, mẫu import xlsx. Công nghệ: PostgreSQL trên Supabase, Prisma, Supabase Auth và Storage. Tài liệu thiết kế, chưa phải báo cáo.

Cập nhật 2026-10-27: `exam_sets` thêm `description` và `cover_url` (ảnh bìa 7:10 trên Supabase Storage); bỏ `exams.exam_type`, Academic/GT chuyển xuống `parts.form` (enum `ExamForm`, chỉ Reading/Writing) vì một đề có thể có cả Reading Academic và Reading GT. Bản 38 bảng trước đó giữ ở `ban-cu-38-bang/` để đối chiếu.

## 1. Các tệp

| Tệp | Nội dung |
|---|---|
| `schema.prisma` | **Nguồn chuẩn.** 22 bảng, 18 enum, chú thích tiếng Việt từng cột |
| `schema.sql` | DDL PostgreSQL sinh từ Prisma |
| `constraints-bo-sung.sql` | Partial unique index và CHECK mà Prisma không viết được, FK tới `auth.users` |
| `seed.sql` | Tham số hệ thống, tiêu chí W/S, bảng quy đổi band, Daily Motivation (đều trong `system_settings`) |
| `kiem-thu-rang-buoc.sql` | Kiểm thử nhanh các ràng buộc then chốt |
| `tu-dien-du-lieu.md` | Từ điển dữ liệu, sinh tự động |
| `erd/erd-00-tong-quan.mmd/.png` | ERD tổng quan (Mermaid) |
| `erd/erd-00-tong-quan-theo-module.png` | ERD tổng quan tô màu theo module (Graphviz) |
| `erd/erd-01..03-*.mmd/.png` | ERD chi tiết, có đủ cột |
| `gen.py` | Sinh lại ERD và từ điển dữ liệu từ `schema.prisma` |

Đã chạy thử `schema.sql` → `constraints-bo-sung.sql` → `seed.sql` → `kiem-thu-rang-buoc.sql` trên PostgreSQL 16: không lỗi, 8 ca vi phạm đều bị chặn.

## 2. 22 bảng

| Module | Bảng |
|---|---|
| 1. Người dùng | `profiles`, `audit_logs` |
| 2. Đề thi | `exam_sets`, `exams`, `parts`, `question_groups`, `questions` |
| 3. Làm bài và chấm bài | `attempts`, `attempt_answers`, `grading_credits`, `grading_requests`, `grading_scores` |
| 4. Từ vựng | `vocab_topics`, `vocab_words`, `user_words`, `user_tags`, `word_tags`, `flashcard_sessions` |
| 5. Bài mẫu, thông báo, nhập liệu, cấu hình | `samples`, `notifications`, `import_batches`, `system_settings` |

## 2b. Tóm lược bản cũ (38 bảng) và bản mới (22 bảng)

Tổng quan: bản cũ có 38 bảng, bản mới có 22 bảng. Trong số 38 bảng cũ, 21 bảng giữ nguyên tên (có bảng được thêm hoặc bớt cột), 14 bảng gộp thành cột hoặc JSON của bảng khác, 3 bảng bỏ (2 bảng tính lại được từ bảng khác, 1 bảng chuyển thành cột JSON). Bảng mới duy nhất là `user_words`, gộp từ 2 bảng cũ.

### Bản cũ: 38 bảng (lưu ở `ban-cu-38-bang/`)

| # | Bảng cũ | Module | Vai trò | Trong bản 22 bảng |
|---|---|---|---|---|
| 1 | `profiles` | Người dùng | Hồ sơ người dùng, 1-1 với `auth.users` của Supabase | Giữ, thêm cột mục tiêu và năng lực chấm |
| 2 | `teacher_profiles` | Người dùng | Giới hạn bài chưa chấm, còn nhận bài, lần nhận gần nhất của Giáo viên | Gộp thành cột của `profiles` |
| 3 | `teacher_skill_permissions` | Người dùng | Quyền chấm Writing/Speaking và trạng thái thu hồi | Gộp thành `profiles.writing_permission`, `speaking_permission` |
| 4 | `learning_goals` | Người dùng | Mục tiêu học tập có lịch sử hiệu lực (UC31) | Gộp thành cột `goal_*` của `profiles`, mất lịch sử (đánh đổi 1) |
| 5 | `audit_logs` | Người dùng | Nhật ký thao tác quản trị | Giữ |
| 6 | `exam_sets` | Đề thi | Bộ đề | Giữ |
| 7 | `exams` | Đề thi | Đề thi | Giữ |
| 8 | `exam_skills` | Đề thi | Kỹ năng trong một đề, thời lượng | Gộp thành cột `parts.skill` |
| 9 | `parts` | Đề thi | Section/Passage/Task/Part | Giữ, thêm cột `skill`, trỏ thẳng `exam_id` |
| 10 | `question_groups` | Đề thi | Cụm câu hỏi | Giữ |
| 11 | `questions` | Đề thi | Câu hỏi | Giữ, thêm cột đáp án |
| 12 | `answer_keys` | Đề thi | Đáp án chuẩn tách riêng | Gộp vào `questions` (đánh đổi 2) |
| 13 | `band_conversion_rules` | Đề thi | Bảng quy đổi số câu đúng sang band | Gộp vào `system_settings` (JSON) |
| 14 | `attempts` | Làm bài | Lượt làm bài theo kỹ năng | Giữ, thêm cột hạn nội dung W/S và `progress` |
| 15 | `attempt_answers` | Làm bài | Câu trả lời L/R | Giữ, chứa thêm bài viết/ghi âm W/S |
| 16 | `attempt_part_states` | Làm bài | Đã phát audio / đã ghi âm từng phần | Gộp vào JSON `attempts.progress` (đánh đổi 6) |
| 17 | `ws_submissions` | Làm bài | "Bài" W/S và vòng đời 14 ngày | Gộp vào `attempts` (đánh đổi 6) |
| 18 | `ws_responses` | Làm bài | Bài viết/ghi âm từng Task/Part | Gộp vào `attempt_answers` |
| 19 | `grading_credits` | Chấm bài | Lượt miễn phí/bonus | Giữ |
| 20 | `grading_requests` | Chấm bài | Yêu cầu hỗ trợ chấm | Giữ, thêm cột kết quả chấm |
| 21 | `grading_criteria` | Chấm bài | 8 tiêu chí W/S | Gộp vào `system_settings` (đánh đổi 3) |
| 22 | `grading_results` | Chấm bài | Kết quả chấm nháp/công bố (1-1 với yêu cầu) | Gộp vào `grading_requests` |
| 23 | `grading_scores` | Chấm bài | Điểm, nhận xét từng tiêu chí | Giữ, khóa theo `request_id` + mã tiêu chí |
| 24 | `vocab_topics` | Từ vựng | Chủ đề từ vựng | Giữ |
| 25 | `vocab_words` | Từ vựng | Mục từ | Giữ |
| 26 | `favorite_words` | Từ vựng | Từ yêu thích | Gộp vào `user_words.is_favorite` |
| 27 | `word_notes` | Từ vựng | Ghi chú cá nhân | Gộp vào `user_words.note` |
| 28 | `user_tags` | Từ vựng | Nhãn cá nhân | Giữ |
| 29 | `word_tags` | Từ vựng | Gắn nhãn cho từ | Giữ |
| 30 | `flashcard_sessions` | Từ vựng | Phiên ôn flashcard | Giữ, thêm cột `ratings` |
| 31 | `flashcard_reviews` | Từ vựng | Từng lần lật thẻ | **Bỏ** (đánh đổi 4) |
| 32 | `samples` | Bài mẫu | Bài mẫu Writing/Speaking | Giữ |
| 33 | `study_activities` | Thống kê | Phiên học hợp lệ, nguồn tính streak | **Bỏ**, tính bằng truy vấn (đánh đổi 5) |
| 34 | `daily_motivations` | Thống kê | Thông điệp Daily Motivation | Gộp vào `system_settings` (JSON) |
| 35 | `notifications` | Thông báo | Thông báo trong hệ thống | Giữ |
| 36 | `import_batches` | Nhập liệu | Lô nhập xlsx | Giữ, thêm cột `issues` |
| 37 | `import_issues` | Nhập liệu | Lỗi kiểm tra theo sheet/dòng/cột | **Bỏ**, lưu JSON `import_batches.issues` |
| 38 | `system_settings` | Cấu hình | Tham số hệ thống | Giữ, chứa thêm dữ liệu cố định |

### Bản mới: 22 bảng

| # | Bảng | Module | Vai trò | UC chính | Gộp từ bảng cũ |
|---|---|---|---|---|---|
| 1 | `profiles` | Người dùng | Hồ sơ, vai trò, trạng thái; mục tiêu học tập (Người học); quyền chấm và giới hạn bài (Giáo viên) | UC01-06, 19, 31 | `profiles`, `teacher_profiles`, `teacher_skill_permissions`, `learning_goals` |
| 2 | `audit_logs` | Người dùng | Nhật ký thao tác quản trị và tác vụ tự động | UC19, 23 | `audit_logs` |
| 3 | `exam_sets` | Đề thi | Bộ đề | UC20, 27 | `exam_sets` |
| 4 | `exams` | Đề thi | Đề thi (trạng thái, phiên bản); Academic/GT nằm ở `parts.form` | UC20, 27 | `exams` |
| 5 | `parts` | Đề thi | Phần thi theo kỹ năng: bài đọc, audio, đề Writing, câu hỏi Speaking | UC07, 08, 20 | `parts`, `exam_skills` |
| 6 | `question_groups` | Đề thi | Cụm câu hỏi, dạng câu hỏi, chỉ dẫn | UC08, 20 | `question_groups` |
| 7 | `questions` | Đề thi | Câu hỏi kèm đáp án và lời giải | UC07, 09, 20 | `questions`, `answer_keys` |
| 8 | `attempts` | Làm bài, chấm bài | Lượt làm bài; với W/S là "bài" có hạn nội dung 14 ngày | UC07-10, 13, 33 | `attempts`, `ws_submissions`, `attempt_part_states` |
| 9 | `attempt_answers` | Làm bài, chấm bài | Câu trả lời L/R; bài viết hoặc ghi âm W/S | UC07-10, 33 | `attempt_answers`, `ws_responses` |
| 10 | `grading_credits` | Làm bài, chấm bài | Lượt miễn phí theo tuần, bonus được hoàn | UC13, 34 | `grading_credits` |
| 11 | `grading_requests` | Làm bài, chấm bài | Yêu cầu chấm, phân công, hủy, kết quả (nháp và công bố) | UC11, 15-18, 34 | `grading_requests`, `grading_results` |
| 12 | `grading_scores` | Làm bài, chấm bài | Điểm, nhận xét từng tiêu chí | UC11, 16 | `grading_scores` |
| 13 | `vocab_topics` | Từ vựng | Chủ đề từ vựng | UC22, 28 | `vocab_topics` |
| 14 | `vocab_words` | Từ vựng | Mục từ | UC22, 28 | `vocab_words` |
| 15 | `user_words` | Từ vựng | Yêu thích và ghi chú của Người học với một từ | UC29, 30 | `favorite_words`, `word_notes` |
| 16 | `user_tags` | Từ vựng | Nhãn cá nhân | UC30 | `user_tags` |
| 17 | `word_tags` | Từ vựng | Gắn nhãn cho từ | UC30 | `word_tags` |
| 18 | `flashcard_sessions` | Từ vựng | Phiên ôn flashcard và kết quả tự đánh giá | UC12, 13 | `flashcard_sessions` (bỏ `flashcard_reviews`) |
| 19 | `samples` | Bài mẫu | Bài mẫu Writing/Speaking | UC05, 21 | `samples` |
| 20 | `notifications` | Thông báo | Thông báo trong hệ thống | UC35 | `notifications` |
| 21 | `import_batches` | Nhập liệu | Lô nhập xlsx và lỗi kiểm tra (JSON) | UC23, 24 | `import_batches` (bỏ `import_issues`) |
| 22 | `system_settings` | Cấu hình | Tham số 14 ngày/72 giờ, số thẻ tối thiểu, bảng band, tiêu chí W/S, Daily Motivation | UC12, 16, 32 | `system_settings`, `band_conversion_rules`, `grading_criteria`, `daily_motivations` |

Ba bảng cũ bị bỏ: `flashcard_reviews` (không còn lưu chi tiết từng lần lật thẻ), `study_activities` (streak tính từ `attempts` + `flashcard_sessions`), `import_issues` (lỗi lưu JSON trong `import_batches.issues`).

## 3. Đã gộp những gì so với bản 38 bảng

| Bản cũ | Bản rút gọn | Đánh đổi |
|---|---|---|
| `teacher_profiles`, `teacher_skill_permissions`, `learning_goals` | Thành cột của `profiles` (`writing_permission`, `speaking_permission`, `max_open_requests`, `goal_*`) | Không lưu lịch sử mục tiêu: tiến độ ngày cũ so với mục tiêu hiện tại (UC31 BR4 được đáp ứng ở mức đơn giản) |
| `exam_skills` | Cột `skill` trên `parts`; thời lượng kỹ năng = tổng `duration_min` các phần | Không có |
| `answer_keys` | Cột `correct_answer`, `accepted_answers`, `explanation` trên `questions` | API lấy đề phải tự loại các cột này khi select |
| `ws_submissions`, `ws_responses`, `attempt_part_states` | Lượt W/S đã hoàn thành chính là "bài": hạn nội dung nằm trên `attempts`; bài viết/ghi âm từng Task/Part là một dòng `attempt_answers`; trạng thái nghe/ghi âm một lần lưu JSON `attempts.progress` | Hạn lưu ban đầu tính bằng `completed_at` + 14 ngày, không lưu cột riêng |
| `grading_results` | Gộp vào `grading_requests` (`overall_band`, `general_comment`, `draft_saved_at`, `graded_at`) | Không có (quan hệ vốn 1-1) |
| `grading_criteria`, `band_conversion_rules`, `daily_motivations` | Dữ liệu cố định trong `system_settings` (JSON) | Không có ràng buộc khóa ngoại tới tiêu chí; backend kiểm tra mã tiêu chí |
| `favorite_words`, `word_notes` | `user_words` (`is_favorite`, `note`) | Không có |
| `flashcard_reviews` | Đếm thẻ và kết quả tự đánh giá lưu trên `flashcard_sessions` | Không xem lại từng lần lật thẻ |
| `study_activities` | Streak và số phiên/ngày tính từ `attempts` hoàn thành + `flashcard_sessions.is_qualified` | Truy vấn thống kê dài hơn một chút |
| `import_issues` | JSON `import_batches.issues` | Không có |

## 3a. Phân tích chi tiết các chỗ đánh đổi (để team bàn)

Có 6 chỗ thật sự đánh đổi, xếp từ đáng cân nhắc nhất xuống ít quan trọng nhất. Các phần gộp còn lại (`exam_skills`, `grading_results`, `favorite_words` + `word_notes`, `import_issues`) không mất chức năng gì.

Tóm tắt để chốt nhanh:

| # | Chỗ đánh đổi | Có lệch Chương 3 không | Ai phải chú ý | Đề xuất | Team chốt |
|---|---|---|---|---|---|
| 1 | Mục tiêu học tập không còn lịch sử | **Có**, lệch UC31 BR4 | Cả nhóm | Thêm lại bảng `learning_goals` (23 bảng) | ☐ Thêm lại ☐ Giữ gọn |
| 2 | Đáp án nằm chung bảng `questions` | Không | Người code backend | Giữ, viết hàm lấy đề dùng chung | ☐ Đồng ý ☐ Tách lại |
| 3 | Tiêu chí, bảng band, Daily Motivation ở dạng JSON | Không | Người code backend | Giữ | ☐ Đồng ý ☐ Tách lại |
| 4 | Không lưu từng lần lật thẻ flashcard | Không | Người code từ vựng | Giữ | ☐ Đồng ý ☐ Tách lại |
| 5 | Streak tính bằng truy vấn, không có bảng riêng | Không | Người code thống kê | Giữ | ☐ Đồng ý ☐ Tách lại |
| 6 | Bài W/S gộp vào `attempts` | Không | Người code làm bài, chấm bài | Giữ | ☐ Đồng ý ☐ Tách lại |

### Đánh đổi 1. Mục tiêu học tập không còn lịch sử

- **Trước (38 bảng):** bảng `learning_goals`, mỗi lần đổi mục tiêu tạo một dòng mới có `effective_from` và `effective_to`. Muốn biết ngày 15/10 mục tiêu là bao nhiêu thì tra dòng có hiệu lực vào ngày đó.
- **Bây giờ (22 bảng):** mục tiêu là các cột `goal_overall_band`, `goal_skill_bands`, `goal_daily_sessions` trong `profiles`. Đổi mục tiêu là ghi đè, giá trị cũ mất.
- **Ví dụ:** tuần trước học viên đặt 2 phiên/ngày và ngày nào cũng học 2 phiên. Hôm nay đổi thành 4. Biểu đồ tuần trước (UC13) giờ so 2 với 4 nên cả tuần hiện "chưa đạt mục tiêu", dù lúc đó học viên đã đạt.
- **Vì sao đáng bàn:** UC31 BR4 ghi rõ "việc đánh giá lịch sử phải dựa trên mục tiêu có hiệu lực tại thời điểm tương ứng". Bản gọn không đáp ứng câu này. Nếu giáo viên hướng dẫn đối chiếu đặc tả với CSDL thì đây là chỗ dễ bị hỏi.
- **Cách khác không cần thêm bảng:** sửa UC31 BR4 trong Chương 3 thành "tiến độ được so với mục tiêu hiện tại". Đơn giản nhưng phải sửa báo cáo.
- **Nếu quay lại:** thêm bảng `learning_goals` (user_id, các cột band, daily_sessions, effective_from, effective_to) cùng một partial unique index "mỗi người chỉ có một mục tiêu đang hiệu lực". Bỏ các cột `goal_*` khỏi `profiles`. Khoảng 15 phút sửa schema, không ảnh hưởng bảng khác.
- **Đề xuất:** thêm lại, vì chi phí thấp và khớp đặc tả.

### Đánh đổi 2. Đáp án nằm chung bảng với câu hỏi

- **Trước:** bảng riêng `answer_keys`. Truy vấn lấy đề chỉ đọc bảng `questions`, nên không có cách nào lộ đáp án dù viết code ẩu.
- **Bây giờ:** `correct_answer`, `accepted_answers`, `explanation` là cột của `questions`. Prisma mặc định trả **mọi** cột nếu không chỉ định `select`.
- **Ví dụ rủi ro:** API `GET /exams/:id` viết `prisma.question.findMany({ where: ... })` mà quên `select`. Học viên mở DevTools tab Network là thấy đáp án của cả đề. Chương 2 và UC07 BR2 yêu cầu "không gửi đáp án chuẩn cho client trước thời điểm được phép xem lời giải".
- **Cách giảm rủi ro:**
  1. Viết sẵn một hằng `QUESTION_PUBLIC_SELECT` (liệt kê các cột được phép) và một hàm `getExamForAttempt()` dùng chung; quy ước không ai gọi `findMany` thẳng trên `questions` ở API học viên.
  2. Thêm một test tự động: gọi API lấy đề và kiểm tra JSON trả về không có khóa `correct_answer`.
- **Nếu quay lại:** tách 3 cột ra bảng `answer_keys` (khóa chính `question_id`). Import xlsx và chấm bài phải join thêm một bảng.
- **Đề xuất:** giữ gọn, làm 2 việc giảm rủi ro ở trên.

### Đánh đổi 3. Tiêu chí chấm, bảng quy đổi band, Daily Motivation lưu dạng JSON

- **Trước:** 3 bảng `grading_criteria`, `band_conversion_rules`, `daily_motivations`. `grading_scores.criterion_id` là khóa ngoại tới `grading_criteria`, nên CSDL từ chối mọi mã tiêu chí không tồn tại.
- **Bây giờ:** cả ba nằm trong `system_settings` (các khóa `grading_criteria`, `band_conversion`, `daily_motivations`, xem `seed.sql`). `grading_scores.criterion` là chuỗi tự do.
- **Ví dụ rủi ro:** code chấm Writing ghi `criterion = 'TR'` thay vì `'TA_TR'`, hoặc ghi tiêu chí Speaking `PRON` cho một bài Writing. CSDL vẫn nhận, điểm tổng hợp tính sai mà không ai báo lỗi.
- **Vì sao chấp nhận được:** Chương 3 (mục 3.3, UC16 BR3, UC20 BR2) nói rõ đây là dữ liệu khởi tạo cố định, MVP không có màn hình cấu hình. Chỉ backend đọc, không có người dùng nào sửa.
- **Cách giảm rủi ro:** backend kiểm tra danh sách tiêu chí khi lưu điểm (đủ 4 tiêu chí, đúng kỹ năng), dùng hằng TypeScript sinh từ seed thay vì gõ chuỗi tay.
- **Nếu quay lại:** thêm bảng `grading_criteria` và đổi `grading_scores.criterion` thành khóa ngoại. Bảng band và Daily Motivation để JSON vẫn ổn.
- **Đề xuất:** giữ.

### Đánh đổi 4. Không lưu từng lần lật thẻ flashcard

- **Trước:** bảng `flashcard_reviews`, mỗi lần lật thẻ và tự đánh giá là một dòng (phiên, từ, mức đánh giá, thời điểm).
- **Bây giờ:** `flashcard_sessions` chỉ lưu tổng của phiên: `total_cards`, `distinct_reviewed` (số thẻ khác nhau đã ôn), `ratings` (ví dụ `{"KNOW":8,"UNSURE":3,"DONT_KNOW":1}`), `is_qualified`.
- **Mất gì:** không trả lời được "từ nào học viên hay chọn Chưa biết nhất", không làm được ôn tập ngắt quãng (spaced repetition) hay gợi ý "ôn lại các từ chưa thuộc".
- **Vì sao chấp nhận được:** UC12 chỉ yêu cầu lưu và hiển thị số từ đã ôn và kết quả tự đánh giá của phiên, và BR3 nói tự đánh giá không phải kết quả kiểm chứng. Không UC nào cần chi tiết từng thẻ.
- **Lưu ý khi code:** UC12 BR2 (lật lại cùng một thẻ không tính thành nhiều từ) phải xử lý ở backend/frontend trong lúc phiên đang diễn ra, rồi mới ghi `distinct_reviewed`.
- **Nếu quay lại:** thêm bảng `flashcard_reviews`. Nên làm nếu sau này muốn có tính năng "ôn từ chưa thuộc".
- **Đề xuất:** giữ.

### Đánh đổi 5. Streak và số phiên mỗi ngày tính bằng truy vấn

- **Trước:** bảng `study_activities`, mỗi phiên học hợp lệ (UC13 BR9) ghi một dòng với `local_date` theo giờ Việt Nam. Streak = đếm các ngày liên tiếp có dòng.
- **Bây giờ:** gộp hai nguồn: `attempts` có `status = 'COMPLETED'` (UC07, UC08) và `flashcard_sessions` có `is_qualified = true` (UC12), đổi thời điểm sang ngày giờ Việt Nam rồi đếm.
- **Ví dụ truy vấn:**
  ```sql
  SELECT DISTINCT (ts AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS ngay FROM (
    SELECT completed_at AS ts FROM attempts WHERE user_id = $1 AND status = 'COMPLETED'
    UNION ALL
    SELECT ended_at FROM flashcard_sessions WHERE user_id = $1 AND is_qualified
  ) t ORDER BY ngay DESC;
  ```
- **Mất gì:** mỗi lần mở trang tiến độ phải chạy truy vấn gộp thay vì đọc một bảng. Nếu sau này thêm loại hoạt động mới, phải sửa truy vấn này.
- **Vì sao chấp nhận được:** với số người dùng của đồ án (vài chục đến vài trăm), truy vấn có chỉ mục `(user_id, completed_at)` chạy rất nhanh. Kết quả streak giống hệt bản cũ.
- **Nếu quay lại:** thêm bảng `study_activities` và ghi một dòng mỗi khi hoàn thành bài hoặc phiên flashcard đủ điều kiện.
- **Đề xuất:** giữ.

### Đánh đổi 6. Bài Writing/Speaking gộp vào `attempts`

- **Trước:** 3 bảng riêng. `ws_submissions` là "bài" W/S với `initial_expires_at` (hạn lưu ban đầu) và `content_expires_at` (hạn hiện hành); `ws_responses` giữ bài viết hoặc ghi âm từng Task/Part; `attempt_part_states` ghi phần nào đã phát audio, đã ghi âm.
- **Bây giờ:**
  - Lượt làm W/S đã hoàn thành chính là "bài". `content_expires_at` và `content_deleted_at` là cột của `attempts`.
  - Hạn lưu ban đầu không lưu riêng mà tính bằng `completed_at + 14 ngày`. Khi yêu cầu chấm bị hủy, backend đặt lại `content_expires_at = completed_at + 14 ngày` (mục 3.4.1).
  - Bài viết, ghi âm từng Task/Part là một dòng `attempt_answers` có `part_id` (L/R dùng `question_id`). CHECK bảo đảm mỗi dòng có đúng một trong hai.
  - "Đã phát audio / đã ghi âm" lưu trong JSON `attempts.progress`, ví dụ `{"audio_played": ["<part_id>"], "recorded": ["<part_id>"]}`.
- **Mất gì:**
  - CSDL không tự chặn việc nghe lại audio hay ghi âm lại trong bài thi đầy đủ (UC07 BR6, BR8). Backend phải đọc `progress` và từ chối.
  - Nếu sau này đổi hạn 14 ngày thành số khác, bài cũ sẽ bị tính theo số mới (vì hạn ban đầu không lưu cứng).
  - Bảng `attempts` có thêm vài cột chỉ dùng cho W/S (CHECK bảo đảm bài L/R để trống các cột này).
- **Được gì:** không phải giữ đồng bộ 3 bảng khi tạo, hủy, xóa bài; yêu cầu chấm trỏ thẳng tới lượt làm.
- **Cách giảm rủi ro:** viết một service duy nhất cập nhật `progress` cho cả nghe audio và ghi âm; nếu muốn chắc chắn hơn về hạn ban đầu, có thể thêm lại một cột `initial_expires_at` vào `attempts` (không cần bảng mới).
- **Đề xuất:** giữ. Có thể thêm cột `initial_expires_at` nếu team muốn hạn ban đầu cố định.

## 4. Quy tắc nghiệp vụ vẫn được CSDL bảo đảm

- Mỗi bài W/S tối đa một yêu cầu chấm đang hoạt động; bài đã có kết quả không gửi lại (hai partial unique index trên `grading_requests.attempt_id`).
- Mỗi người một lượt miễn phí mỗi tuần (`UNIQUE (user_id, type, week_start)`); mỗi yêu cầu bị hủy chỉ hoàn bonus một lần (`UNIQUE source_request_id`); mỗi lượt chỉ dùng cho một yêu cầu (`UNIQUE credit_id`). Tác vụ tự động chạy lại không tạo trùng.
- Hủy do quá hạn chỉ khi chưa phân công; hủy do Giáo viên không thể hoàn thành phải có Quản lý và lý do (CHECK).
- Luyện L/R phải chỉ cụm câu hỏi, luyện W/S phải chỉ Task/Part; band chỉ có ở bài thi đầy đủ L/R (CHECK).
- Band 0-9 bước 0,5 ở mọi cột band; quyền chấm chỉ gán cho Giáo viên (CHECK).
- Academic/GT bắt buộc với phần Reading/Writing, để trống với Listening/Speaking; Writing Task 1 Academic/General khớp `form`; L/S không trùng số phần trong một đề (CHECK + partial unique).
- Thông báo không tạo trùng khi thử lại (`UNIQUE (recipient_id, event_key)`).
- Kết quả cũ không đổi khi sửa đề: `attempts.exam_version` và `attempt_answers.answer_snapshot`.

Vòng đời nội dung W/S trên `attempts`: hoàn thành thì `content_expires_at` = `completed_at` + 14 ngày; gửi yêu cầu thì đặt NULL (tạm ngừng xóa); bị hủy thì trả về `completed_at` + 14 ngày; có kết quả thì = `graded_at` + 14 ngày; tác vụ xóa đặt `content_deleted_at`, xóa `text_content`/tệp ghi âm nhưng giữ điểm và nhận xét.

## 5. Repo GitHub đã tham khảo

| Repo | Lấy gì |
|---|---|
| [hzuy/ietls-](https://github.com/hzuy/ietls-) (cùng stack Express + Prisma + Supabase + Vite) | Bảng Question Group riêng có khoảng số câu và cờ dùng lại lựa chọn; điểm theo tiêu chí W/S thành bảng con; audit log; xóa mềm |
| [aashish-nepal/Ielts_Pro](https://github.com/aashish-nepal/Ielts_Pro) | Enum trạng thái nội dung, enum loại Task/Part; câu trả lời unique theo (lượt, câu hỏi); thông báo có `read_at` |
| [huymanhnguyen10-sketch/ielts-learning](https://github.com/huymanhnguyen10-sketch/ielts-learning) | Phiên ôn flashcard có tự đánh giá; import từ bảng tính |

Các repo trên đều chấm W/S bằng AI, nên phần lượt, hàng đợi 72 giờ, hoàn bonus và hạn 14 ngày được thiết kế theo Chương 3.4.

## 6. Ánh xạ sheet xlsx → bảng

| Sheet | Bảng |
|---|---|
| Exams | `exam_sets` (`set_code`, `set_name`; `description`, `cover_url` nhập trên màn tạo bộ đề), `exams` (`exam_code`, `exam_title`, `source`, `note`). Cột `exam_type` của mẫu cũ chuyển sang sheet Parts |
| Parts | `parts` (`skill`, `form` = ACADEMIC/GENERAL cho R/W, để trống cho L/S, `part_code`, `part_no`, `title`, `duration_min`, `content`, `audio_file`/`image_file` → `*_path`) |
| Groups | `question_groups` |
| Questions + Answers | `questions` (đáp án gộp vào cùng dòng câu hỏi theo `question_code`) |
| Bai_mau | `samples` |

## 7. Điểm còn mở

1. Dải band thấp nhất (0-3 câu) trong `seed.sql` tạm là 0.0.
2. Mỗi từ vựng thuộc đúng một chủ đề.
3. Giáo viên mặc định giữ tối đa 10 bài chưa chấm.

## 8. Sinh lại khi sửa

```bash
npx prisma validate && npx prisma migrate diff --from-empty --to-schema-datamodel schema.prisma --script > schema.sql
python3 gen.py
npx -p @mermaid-js/mermaid-cli mmdc -i erd/erd-01-nguoi-dung-de-thi.mmd -o erd/erd-01-nguoi-dung-de-thi.png -s 2 -b white
dot -Tpng -Gdpi=130 erd/erd-00-tong-quan-theo-module.dot -o erd/erd-00-tong-quan-theo-module.png
```
