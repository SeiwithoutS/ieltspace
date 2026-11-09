# CSDL draft của nhóm (trích văn bản từ nhom-csdl-draft.docx)

Trích 2026-10-29, gồm cả bảng. Tiêu đề mục 7 bị đánh số trùng trong bản gốc (nhóm bài mẫu và nhóm thông báo đều là "7").

1. Nhóm người dùng

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Người dùng users | id, auth_user_id, full_name, display_name, email, avatar_url, role, status, created_at, updated_at, deleted_at | Mã người dùng, mã tài khoản xác thực, họ tên, tên hiển thị, email, ảnh đại diện, vai trò, trạng thái tài khoản, ngày tạo, ngày cập nhật, thời điểm xóa tài khoản nếu có. |
| Quyền chấm của Giáo viên teacher_permissions | id, teacher_id, skill, max_pending, is_accepting, status, last_assigned_at, updated_at | Mã quyền chấm, mã Giáo viên, kỹ năng được chấm, giới hạn số bài chưa chấm, có nhận bài mới hay không, trạng thái quyền chấm, thời điểm nhận bài gần nhất, thời điểm cập nhật. |
| Mục tiêu học tập study_goals | id, user_id, overall_target, listening_target, reading_target, writing_target, speaking_target, daily_session_target, effective_from | Mã mục tiêu, mã Người học, band mục tiêu tổng thể, band mục tiêu từng kỹ năng, số phiên học mỗi ngày, thời điểm mục tiêu bắt đầu có hiệu lực. |

Diễn giải:
Người học, Giáo viên và Quản lý đều được lưu trong bảng Người dùng, phân biệt bằng vai trò.
Không cần bảng tài khoản Giáo viên riêng.
Trạng thái quyền chấm gồm: đang hoạt động, chờ thu hồi và đã thu hồi. Khi chờ thu hồi, Giáo viên ngừng nhận bài mới nhưng vẫn được hoàn thành bài đã giao.
Thiết kế này áp dụng giới hạn bài chưa chấm theo từng kỹ năng.
Khi Người học đổi mục tiêu, tạo bản ghi mục tiêu mới để giữ được lịch sử.
Chế độ sáng/tối lưu trên trình duyệt theo UC14, không cần bảng riêng.
2. Nhóm đề thi và câu hỏi

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Bộ đề exam_sets | id, name, description, status, created_by, created_at, updated_at | Mã Bộ đề, tên Bộ đề, mô tả, trạng thái hiển thị, người tạo, ngày tạo, ngày cập nhật. |
| Đề thi exams | id, exam_set_id, title, exam_type, description, status, created_by, created_at, updated_at | Mã Đề thi, mã Bộ đề, tên đề, loại bài thi Academic hoặc General Training, mô tả, trạng thái hiển thị, người tạo, ngày tạo, ngày cập nhật. |
| Phiên bản đề thi exam_versions | id, exam_id, version_number, status, created_by, created_at, published_at | Mã phiên bản, mã Đề thi, số phiên bản, trạng thái nháp hoặc đã công bố, người tạo, ngày tạo, ngày công bố. |
| Kỹ năng trong đề exam_skills | id, exam_version_id, skill, duration_minutes, band_scale_id, grading_rule_id, order_no | Mã kỹ năng trong đề, mã phiên bản đề, tên kỹ năng, thời lượng làm bài, bảng quy đổi band hoặc bộ quy tắc chấm áp dụng, thứ tự hiển thị. |
| Phần thi exam_sections | id, exam_skill_id, title, section_type, instruction, content, audio_path, image_path, order_no | Mã phần thi, mã kỹ năng trong đề, tên phần, loại phần hoặc Task/Part, hướng dẫn, nội dung dùng chung, tệp âm thanh, hình ảnh, thứ tự hiển thị. |
| Nhóm câu hỏi question_groups | id, section_id, title, question_type, instruction, content, audio_path, image_path, order_no | Mã nhóm câu hỏi, mã phần thi, tên nhóm, dạng câu hỏi, hướng dẫn, nội dung dùng chung, tệp âm thanh hoặc hình ảnh, thứ tự hiển thị. |
| Câu hỏi questions | id, question_group_id, content, question_type, answer_count, max_score, explanation, order_no | Mã câu hỏi, mã nhóm câu hỏi, nội dung câu hỏi, dạng câu hỏi, số ô trả lời hoặc số đáp án cần chọn, điểm tối đa, lời giải, thứ tự hiển thị. |
| Lựa chọn trả lời question_options | id, question_id, label, content, order_no | Mã lựa chọn, mã câu hỏi, ký hiệu lựa chọn, nội dung lựa chọn, thứ tự hiển thị. |
| Đáp án chuẩn question_answers | id, question_id, accepted_answers, matching_rule | Mã đáp án, mã câu hỏi, tập đáp án được chấp nhận, quy tắc đối chiếu câu trả lời. |

Diễn giải:
Cấu trúc dữ liệu đề thi:
Bộ đề
└── Đề thi
└── Phiên bản đề
└── Kỹ năng
└── Phần thi / Task / Part
└── Nhóm câu hỏi
└── Câu hỏi
├── Lựa chọn trả lời
└── Đáp án chuẩn
Một Đề thi có thể có nhiều phiên bản.
Nội dung của phiên bản đã công bố được giữ ổn định. Nếu sửa nội dung hoặc đáp án thì tạo phiên bản mới.
Task của Writing và Part của Speaking được xác định tại bảng Phần thi.
accepted_answers có thể lưu đáp án văn bản, các phương án tương đương, mã lựa chọn đúng hoặc đáp án theo từng ô.
matching_rule xác định cách chấm, chẳng hạn có phân biệt chữ hoa/thường, xét thứ tự hay không và cách tính điểm khi chọn nhiều đáp án.
Các trường tệp lưu vị trí trong kho lưu trữ, không lưu đường dẫn tải tạm thời.
3. Các bảng phục vụ chấm điểm

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Bảng quy đổi band band_scales | id, name, skill, exam_type, version, conversion_rules | Mã bảng quy đổi, tên bảng, kỹ năng, loại bài thi, phiên bản quy đổi, các khoảng số câu đúng và band tương ứng. |
| Bộ quy tắc chấm grading_rules | id, name, skill, assessment_scope, version, aggregation_rules, rounding_rules | Mã bộ quy tắc, tên bộ quy tắc, kỹ năng, phạm vi đánh giá, phiên bản, cách tổng hợp điểm và trọng số Task nếu có, quy tắc làm tròn. |
| Tiêu chí chấm rubric_criteria | id, grading_rule_id, name, description, weight, min_score, max_score, score_step, order_no | Mã tiêu chí, mã bộ quy tắc chấm, tên tiêu chí, mô tả, trọng số, điểm nhỏ nhất, điểm lớn nhất, bước điểm hợp lệ, thứ tự hiển thị. |

Diễn giải:
Listening/Reading sử dụng bảng quy đổi band.
Writing/Speaking sử dụng bộ quy tắc và các tiêu chí chấm.
Các quy tắc này là dữ liệu khởi tạo, không cần giao diện chỉnh sửa trong MVP.
Nếu thay đổi quy tắc trong tương lai, tạo phiên bản mới thay vì sửa quy tắc đã dùng cho kết quả lịch sử.
Phạm vi đánh giá phân biệt toàn kỹ năng với một Task hoặc Part.
4. Nhóm bài làm và nội dung bài nộp

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Lượt làm bài attempts | id, user_id, exam_version_id, attempt_type, selected_scope, status, started_at, completed_at | Mã lượt làm, mã Người học, mã phiên bản đề, loại làm bài hoặc luyện tập, phạm vi đã chọn, trạng thái, thời điểm bắt đầu, thời điểm hoàn tất. |
| Bài làm theo kỹ năng skill_attempts | id, attempt_id, exam_skill_id, section_id, question_group_id, status, started_at, deadline_at, completed_at, duration_seconds, correct_count, total_questions, accuracy, band_score, band_scale_id, grading_rule_id, initial_expires_at, content_expires_at, content_status, content_deleted_at | Mã bài làm, mã lượt làm, kỹ năng trong đề, phần hoặc nhóm câu hỏi được luyện nếu có, trạng thái, thời điểm bắt đầu, hạn làm bài, thời điểm hoàn thành, thời gian làm bài, số câu đúng, tổng số câu, tỷ lệ chính xác, band quy đổi, quy tắc chấm áp dụng, hạn lưu nội dung ban đầu, hạn lưu hiện tại, trạng thái nội dung, thời điểm xóa nội dung. |
| Câu trả lời attempt_answers | id, skill_attempt_id, question_id, answer_data, earned_score, correct_count, updated_at | Mã câu trả lời, mã bài làm theo kỹ năng, mã câu hỏi, nội dung hoặc các lựa chọn đã trả lời, điểm đạt được, số đơn vị trả lời đúng, thời điểm lưu gần nhất. |
| Nội dung Writing/Speaking submission_contents | id, skill_attempt_id, section_id, text_content, audio_path, file_type, file_size, audio_duration, recording_status, updated_at | Mã nội dung, mã bài làm theo kỹ năng, Task hoặc Part tương ứng, nội dung bài viết, vị trí tệp ghi âm, định dạng tệp, dung lượng, thời lượng âm thanh, trạng thái ghi âm, thời điểm lưu gần nhất. |
| Trạng thái làm từng phần attempt_section_states | id, skill_attempt_id, section_id, status, started_at, completed_at, listening_started_at, recording_started_at, recording_locked_at | Mã trạng thái phần, mã bài làm, mã phần thi, trạng thái làm phần đó, thời điểm bắt đầu và hoàn tất, thời điểm bắt đầu phát Listening, thời điểm bắt đầu ghi âm Speaking, thời điểm khóa bản ghi âm. |

Diễn giải:
Một lượt làm toàn đề có nhiều bài làm theo kỹ năng.
Một bài Writing có thể có hai nội dung tương ứng Task 1 và Task 2; một bài Speaking có thể có nhiều bản ghi theo Part.
Với bài luyện riêng, lưu mã phần hoặc mã nhóm câu hỏi được chọn. Với bài đầy đủ theo kỹ năng, các trường này có thể để trống.
Nội dung Writing/Speaking được lưu trong quá trình làm để hỗ trợ tự động lưu; hạn 14 ngày chỉ bắt đầu khi bài hoàn thành.
Bảng Trạng thái làm từng phần hỗ trợ tiếp tục bài đang làm và ghi nhận việc đã phát âm thanh hoặc ghi âm. Đây là cơ chế mô phỏng điều kiện thi, không bảo đảm ngăn tuyệt đối thao tác ghi lại âm thanh bên ngoài hệ thống.
Band chưa có hoặc không đủ điều kiện được để trống, không gán bằng 0.
Không cần bảng tệp tải xuống nếu .docx được tạo khi tải và không lưu lâu dài.
5. Nhóm hỗ trợ chấm Writing/Speaking

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Lượt hỗ trợ chấm support_credits | id, user_id, credit_type, week_start, valid_from, expires_at, used_at, created_at | Mã lượt hỗ trợ, mã Người học, loại lượt miễn phí hoặc bonus, ngày bắt đầu tuần cấp nếu là lượt miễn phí, thời điểm có hiệu lực, thời điểm hết hạn, thời điểm đã sử dụng, ngày tạo. |
| Yêu cầu hỗ trợ chấm grading_requests | id, skill_attempt_id, used_credit_id, status, requested_at, assignment_deadline, teacher_id, assigned_at, cancel_reason, cancel_note, cancelled_at, cancelled_by | Mã yêu cầu, mã bài làm theo kỹ năng, mã lượt đã sử dụng, trạng thái yêu cầu, thời điểm tiếp nhận, hạn chờ phân công, Giáo viên được giao, thời điểm phân công, loại nguyên nhân hủy, lý do chi tiết, thời điểm hủy, người xác nhận hủy. |
| Phiếu chấm grading_reviews | id, grading_request_id, teacher_id, grading_rule_id, status, overall_score, general_comment, updated_at, published_at | Mã phiếu chấm, mã yêu cầu hỗ trợ, mã Giáo viên, bộ quy tắc chấm áp dụng, trạng thái nháp hoặc đã công bố, điểm tổng hợp, nhận xét chung, thời điểm cập nhật, thời điểm công bố. |
| Điểm theo tiêu chí grading_scores | id, grading_review_id, criterion_id, assessment_scope, section_id, score, comment | Mã điểm tiêu chí, mã phiếu chấm, mã tiêu chí, phạm vi đánh giá, Task hoặc Part nếu đánh giá riêng, điểm, nhận xét. |
| Giao dịch hoàn bonus credit_refunds | id, grading_request_id, bonus_credit_id, status, created_at, refunded_at, error_message | Mã giao dịch, mã yêu cầu bị hủy, mã lượt bonus được tạo, trạng thái xử lý, thời điểm tạo giao dịch, thời điểm hoàn thành, thông tin lỗi nếu có. |

Diễn giải:
Mỗi lượt hỗ trợ tương ứng một lần gửi yêu cầu được tiếp nhận.
Tuần cấp lượt miễn phí được lưu để tránh cấp trùng khi tác vụ chạy lại.
Thông tin phân công nằm ngay trong Yêu cầu hỗ trợ chấm, không cần bảng Phân công riêng vì MVP không chuyển yêu cầu sang Giáo viên khác.
Phiếu chấm có hai trạng thái: nháp và đã công bố. Người học chỉ được xem phiếu đã công bố.
Điểm tiêu chí có thể thuộc toàn kỹ năng hoặc Task/Part. Không bắt buộc chấm toàn bộ Speaking bằng cách lấy trung bình điểm từng Part.
Giao dịch hoàn bonus có thể ở trạng thái chờ xử lý, hoàn thành hoặc gặp lỗi; việc thử lại không được tạo bonus trùng.
Trạng thái yêu cầu hỗ trợ

| Giá trị | Ý nghĩa |
|---|---|
| WAITING_ASSIGNMENT | Chờ phân công |
| ASSIGNED | Đã phân công, chờ chấm |
| COMPLETED | Đã công bố kết quả |
| CANCELLED | Đã hủy |

Nguyên nhân hủy được lưu riêng:

| Giá trị | Ý nghĩa | Hoàn bonus |
|---|---|---|
| ASSIGNMENT_TIMEOUT | Hết 72 giờ chưa được phân công | Có |
| TEACHER_UNAVAILABLE | Giáo viên không thể hoàn thành, Quản lý xác nhận hủy | Có |
| LEARNER_DELETED | Xóa tài khoản Người học | Không |

Loại lượt hỗ trợ
Trường support_credits.credit_type gồm:

| Giá trị | Ý nghĩa |
|---|---|
| FREE_WEEKLY | Lượt miễn phí hằng tuần |
| BONUS | Lượt được hoàn sau khi yêu cầu bị hủy |

6. Nhóm từ vựng và flashcard

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Bộ từ vựng vocabulary_sets | id, name, description, status, created_at, updated_at | Mã bộ từ vựng, tên bộ theo chủ đề, mô tả, trạng thái nháp/công khai/ẩn, ngày tạo, ngày cập nhật. |
| Từ vựng vocabularies | id, word, phonetic, definitions, audio_url, sources, fetched_at, status, created_at, updated_at | Mã từ vựng, từ hoặc cụm từ, phiên âm, danh sách nghĩa được chọn để học, đường dẫn âm thanh, nguồn dữ liệu, thời điểm lấy dữ liệu API gần nhất, trạng thái hiển thị, ngày tạo, ngày cập nhật. |
| Từ trong bộ vocabulary_set_items | id, set_id, vocabulary_id, order_no | Mã liên kết, mã bộ từ vựng, mã từ vựng, thứ tự hiển thị trong bộ. |
| Từ yêu thích favorite_vocabularies | id, user_id, vocabulary_id, created_at | Mã bản ghi yêu thích, mã Người học, mã từ vựng, thời điểm thêm vào danh sách yêu thích. |
| Ghi chú từ vựng vocabulary_notes | id, user_id, vocabulary_id, content, updated_at | Mã ghi chú, mã Người học, mã từ vựng, nội dung ghi chú cá nhân, thời điểm cập nhật. |
| Phiên ôn flashcard flashcard_sessions | id, user_id, source_type, set_id, tag_id, total_cards, minimum_cards, reviewed_count, status, is_qualified, started_at, completed_at | Mã phiên ôn, mã Người học, nguồn tập từ, mã bộ hoặc nhãn được chọn nếu có, tổng số thẻ, ngưỡng số thẻ tối thiểu áp dụng, số từ khác nhau đã ôn, trạng thái phiên, có đủ điều kiện tính phiên học hay không, thời điểm bắt đầu, thời điểm kết thúc. |
| Chi tiết phiên ôn flashcard_session_items | id, session_id, vocabulary_id, order_no, is_reviewed, self_rating, reviewed_at | Mã chi tiết, mã phiên ôn, mã từ vựng, thứ tự thẻ, trạng thái đã ôn, mức tự đánh giá khả năng ghi nhớ, thời điểm ôn gần nhất. |

Diễn giải:
Thiết kế đơn giản này quy định một mục từ thuộc một chủ đề.
Ghi chú, nhãn và yêu thích là dữ liệu riêng của từng Người học.
Một mục từ có thể được gắn nhiều nhãn cá nhân.
Khi tạo phiên flashcard, ghi nhận toàn bộ tập thẻ đã chọn trong Chi tiết phiên ôn để xác định việc ôn hết tập.
Phiên đủ điều kiện khi ôn hết tập đã chọn hoặc đạt ngưỡng số từ khác nhau tối thiểu.
Không xóa các liên kết cá nhân chỉ vì mục từ bị ẩn.
Chọn dịch vụ phù hợp

| Dịch vụ |  |
|---|---|
| Free Dictionary API | Lấy nghĩa, ví dụ, phiên âm và âm thanh. |
| Merriam-Webster Dictionary | Có thể dùng bổ sung hoặc ưu tiên định nghĩa. |
| Merriam-Webster Thesaurus | Đang xem xét |

7. Nhóm bài mẫu và hoạt động học tập

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Bài mẫu sample_answers | id, title, skill, sample_type, topic, prompt, content, exam_id, section_id, status, created_by, created_at, updated_at | Mã bài mẫu, tiêu đề, kỹ năng, loại Task/Part, chủ đề, đề bài, nội dung bài mẫu, đề hoặc phần thi liên quan nếu có, trạng thái, người tạo, ngày tạo, ngày cập nhật. |
| Thông điệp động lực daily_motivationsKhông cần lắm, tại có vài thông điệp nên để file code vào resource là được rồi | id, content, display_date, is_default, status | Mã thông điệp, nội dung, ngày hiển thị nếu được chỉ định, có phải thông điệp mặc định hay không, trạng thái sử dụng. |
| Hoạt động học tập learning_activities | id, user_id, activity_type, attempt_id, flashcard_session_id, completed_at, activity_date | Mã hoạt động, mã Người học, loại hoạt động, mã lượt làm bài hoặc phiên flashcard liên quan, thời điểm hoàn thành, ngày học. |

Diễn giải:
Bài mẫu chỉ áp dụng cho Writing và Speaking.
Liên kết đến đề hoặc phần thi là tùy chọn.
Hoạt động học tập chỉ ghi nhận hoạt động đủ điều kiện tính phiên học, dùng để tính streak và tiến độ mỗi ngày.
Để thống nhất với UC13, đề xuất một lượt làm bài hoặc bài luyện được ghi nhận hoàn thành tính một phiên; mỗi phiên flashcard đủ điều kiện tính một phiên. Không tính thêm phiên khi gửi chấm, nhận kết quả hoặc tải bài.
Nếu muốn tính mỗi kỹ năng hoàn thành là một phiên, cần sửa quy tắc nghiệp vụ và liên kết hoạt động sang skill_attempts thay cho attempts.
Điểm trung bình và biểu đồ được tổng hợp từ các bảng nghiệp vụ, không cần bảng riêng cho từng chỉ số.
7. Nhóm thông báo và quản trị

| Bảng | Các trường dữ liệu chính | Các thông tin cần lưu bằng ngôn ngữ tự nhiên |
|---|---|---|
| Thông báo notifications | id, recipient_id, event_key, type, title, content, reference_type, reference_id, created_at, read_at | Mã thông báo, mã người nhận, mã sự kiện để chống trùng, loại thông báo, tiêu đề, nội dung, loại và mã đối tượng liên quan, thời điểm tạo, thời điểm đã đọc. |
| Lô nhập dữ liệu import_batches | id, request_key, import_type, file_name, temporary_path, status, total_records, valid_records, error_records, created_by, created_at, completed_at | Mã lô nhập, mã yêu cầu chống nhập trùng, loại dữ liệu nhập, tên tệp, vị trí tệp tạm, trạng thái xử lý, tổng số bản ghi, số bản ghi hợp lệ, số bản ghi lỗi, người thực hiện, thời điểm tạo, thời điểm hoàn tất. |
| Tệp đính kèm lô nhập import_assets | id, batch_id, file_name, storage_path, file_type, file_size, status | Mã tệp, mã lô nhập, tên tệp để đối chiếu trong bảng dữ liệu, vị trí lưu trữ, định dạng, dung lượng, trạng thái xử lý. |
| Lỗi nhập dữ liệu import_errors | id, batch_id, sheet_name, row_number, field_name, severity, message | Mã lỗi, mã lô nhập, tên trang tính, số dòng, tên trường, mức độ lỗi hoặc cảnh báo, nội dung thông báo. |
| Nhật ký hệ thống audit_logs | id, actor_id, actor_type, action, entity_type, entity_id, change_data, reason, created_at | Mã nhật ký, người thực hiện nếu có, loại tác nhân là người dùng hoặc tác vụ hệ thống, hành động, loại và mã đối tượng, thông tin thay đổi cần thiết, lý do, thời điểm thực hiện. |

Diễn giải:
read_at để trống nghĩa là thông báo chưa đọc; không cần thêm trường is_read.
Thông báo nghiệp vụ hiển thị trong hệ thống. Email xác minh, khôi phục mật khẩu và mời tài khoản vẫn do cơ chế xác thực xử lý.
Tệp đính kèm lô nhập hỗ trợ đối chiếu các tệp âm thanh, hình ảnh với tên được khai báo trong tệp Excel.
Khi nhập thất bại hoặc bị hủy, cần dọn tệp tạm; giao dịch cơ sở dữ liệu không tự hoàn tác các tệp đã tải lên kho lưu trữ.
Nhật ký không được lưu mật khẩu, token hoặc toàn bộ bài viết, bản ghi âm.
reference_id và entity_id là mã tham chiếu tổng quát; backend phải kiểm tra đối tượng tương ứng và quyền truy cập.
8. Các quan hệ chính

| Quan hệ | Diễn giải |
|---|---|
| Người dùng → Quyền chấm | Một Giáo viên có thể có quyền chấm Writing và Speaking. |
| Người dùng → Mục tiêu học tập | Một Người học có nhiều bản ghi mục tiêu theo thời gian. |
| Bộ đề → Đề thi | Một Bộ đề có nhiều Đề thi. |
| Đề thi → Phiên bản đề | Một Đề thi có nhiều phiên bản nội dung. |
| Phiên bản đề → Kỹ năng → Phần → Nhóm câu hỏi → Câu hỏi | Cấu trúc phân cấp của nội dung đề thi. |
| Người dùng → Lượt làm → Bài làm theo kỹ năng | Một Người học có nhiều lượt làm; mỗi lượt có một hoặc nhiều bài làm theo kỹ năng. |
| Bài làm theo kỹ năng → Câu trả lời | Một bài Listening/Reading có nhiều câu trả lời. |
| Bài làm theo kỹ năng → Nội dung Writing/Speaking | Một bài có thể có nhiều nội dung theo Task hoặc Part. |
| Bài làm theo kỹ năng → Yêu cầu hỗ trợ chấm | Một bài có thể có nhiều yêu cầu kế tiếp sau các lần hủy. |
| Yêu cầu hỗ trợ chấm → Phiếu chấm → Điểm theo tiêu chí | Một yêu cầu có tối đa một phiếu chấm; phiếu có nhiều điểm tiêu chí. |
| Yêu cầu hỗ trợ chấm → Giao dịch hoàn bonus | Một yêu cầu có tối đa một giao dịch hoàn bonus. |
| Chủ đề từ vựng → Từ vựng | Một chủ đề có nhiều mục từ. |
| Phiên ôn flashcard → Chi tiết phiên ôn | Một phiên có nhiều thẻ được chọn. |
| Lô nhập dữ liệu → Tệp đính kèm / Lỗi nhập | Một lô nhập có thể có nhiều tệp và nhiều lỗi kiểm tra. |

9. Các ràng buộc dữ liệu quan trọng

| Ràng buộc | Nội dung |
|---|---|
| Tài khoản duy nhất | Mã tài khoản xác thực và email phải duy nhất theo chính sách tài khoản. |
| Quyền chấm duy nhất | Không tạo nhiều bản ghi quyền cho cùng Giáo viên và kỹ năng. |
| Phiên bản đề duy nhất | Số phiên bản không trùng trong cùng một Đề thi. |
| Lượt miễn phí theo tuần | Một Người học chỉ được cấp một lượt miễn phí trong một tuần. |
| Sử dụng lượt một lần | Một lượt hỗ trợ chỉ liên kết với một yêu cầu được tiếp nhận. |
| Yêu cầu đang hoạt động | Một bài chỉ có tối đa một yêu cầu ở trạng thái chờ phân công hoặc đã phân công. |
| Kết quả duy nhất | Một yêu cầu có tối đa một phiếu chấm; sau công bố không được sửa trong MVP. |
| Hoàn bonus một lần | Một yêu cầu bị hủy chỉ có tối đa một giao dịch hoàn; một giao dịch chỉ tạo một bonus. |
| Chuyển trạng thái nhất quán | Phân công và hủy quá hạn phải loại trừ nhau; công bố kết quả và hủy cũng phải loại trừ nhau. |
| Không vượt tải Giáo viên | Kiểm tra quyền, trạng thái tiếp nhận và số bài chưa chấm trong quá trình phân công có kiểm soát đồng thời. |
| Dữ liệu cá nhân không trùng | Không trùng từ yêu thích, ghi chú cho cùng người và từ; không trùng tên nhãn trong phạm vi Người học. |
| Chi tiết phiên ôn không trùng | Một mục từ chỉ xuất hiện một lần trong một phiên khi tính số từ khác nhau. |
| Hoạt động học không trùng | Một lượt làm hoặc phiên ôn đủ điều kiện chỉ tạo một bản ghi hoạt động học tương ứng. |
| Thông báo không trùng | Cùng một sự kiện và người nhận chỉ tạo một thông báo. |
| Bảo toàn lịch sử | Không xóa dây chuyền kết quả và lịch sử chỉ vì đề bị ẩn hoặc tài khoản bị khóa. |
| Nội dung hết hạn | Backend từ chối đọc hoặc tải khi hết hạn, kể cả khi tệp chưa được tác vụ xóa vật lý. |

