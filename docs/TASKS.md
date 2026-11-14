# Công việc triển khai MVP

Các dòng là backlog đề xuất, trạng thái ban đầu **TODO**. Cột “Xong khi” là điều kiện để nghiệm thu từng việc. Kết quả thực chạy ghi theo mã task trong thư mục PROGRESS.

| Mã | Công việc | Phụ thuộc | Xong khi |
|---|---|---|---|
| AUTH-01 | Kiểm thử đăng ký, xác minh và recovery bằng email thật trên môi trường thử | SMTP, template và redirect đã cấu hình | Đăng nhập trước/sau xác minh đúng kết quả, link recovery chỉ dùng một lần, đăng nhập được bằng mật khẩu mới. |
| AUTH-02 | Kiểm thử Google và khôi phục phiên | Provider và callback đã cấu hình | Tài khoản mới có hồ sơ Người học, tài khoản khóa bị từ chối, F5 khôi phục đúng người, URL frontend không chứa token. |
| DB-01 | Đối chiếu schema thực tế và lập baseline | Quyền đọc DB thử | Có danh sách bảng, khóa, sai lệch và kế hoạch migration giữ được dữ liệu hiện hữu. |
| DB-02 | Chốt hai điểm mô hình còn mở | DB-01, DECISIONS | Ghi nguồn xác nhận về khóa chọn thang Reading và nơi lưu tham số. |
| EXAM-01 | Tạo schema bộ đề đến câu hỏi và bản nháp | DB-01 | Hai thao tác đồng thời vẫn chỉ tạo một nháp. Một đề có cả hai form ở phần tương ứng. |
| IMPORT-01 | Kiểm tra XLSX Reading và asset | EXAM-01 | Báo đúng sheet, dòng, trường cho dải số sai hoặc ảnh thiếu. File lỗi giữ nguyên nháp. |
| IMPORT-02 | Ghi lô Reading đã hợp lệ | IMPORT-01 | Ghi một giao dịch. Retry cùng request_key giữ nguyên số câu và đáp án. |
| IMPORT-03 | Ánh xạ ba mẫu còn lại | IMPORT-02 | Listening giữ mốc transcript, Writing giữ form theo Task, Speaking giữ cue card và thời lượng theo Part. Kiểm tra độc lập từng mẫu. |
| EXAM-02 | Phát hành nháp và cung cấp đề cho Người học | EXAM-01 | Người học chỉ mở nội dung được công khai. Payload làm bài không chứa đáp án hoặc evidence. |
| ATT-01 | Lưu và tiếp tục lượt làm | EXAM-02 | F5 khôi phục câu trả lời và hạn máy chủ. Hết giờ chốt phần đã lưu. |
| ATT-02 | Chấm Reading/Listening | ATT-01, DB-02 | Bài luyện tính cả câu bỏ trống vào mẫu số. Đề đủ cấu trúc chọn đúng thang band. |
| WS-01 | Lưu Writing và audio Speaking | ATT-01 | Hoàn thành ghi hạn gốc, chưa có điểm, chưa trừ lượt. Tải bài cần kiểm tra chủ sở hữu. |
| WS-02 | Chặn tải và dọn nội dung quá hạn | WS-01 | Chặn đọc ngay tại mốc hết hạn. Chạy dọn lại vẫn giữ điểm và lịch sử. |
| CREDIT-01 | Cấp lượt tuần và tiếp nhận yêu cầu | WS-01 | Kiểm tra qua ranh giới thứ Hai. Gửi song song chỉ dùng một lượt cho một yêu cầu hoạt động. |
| GRADE-01 | Chọn giáo viên và khóa tải | CREDIT-01 | Hai worker tranh cùng yêu cầu chỉ giao một lần. Giáo viên đạt giới hạn kỹ năng không nhận thêm. |
| GRADE-02 | Hủy quá hạn và hoàn bonus | GRADE-01 | Đúng mốc 72 giờ chỉ hủy yêu cầu còn chờ, job lặp chỉ hoàn một bonus. |
| GRADE-03 | Lưu nháp và công bố phiếu | GRADE-01 | Nháp riêng của người được giao. Công bố và hủy đồng thời chỉ một thao tác thành công. |
| USER-01 | Xử lý thu hồi quyền chấm | GRADE-02, GRADE-03 | Dừng nhận mới vẫn giữ bài đang giao. Quản lý hủy có lý do khi giáo viên không thể hoàn thành. |
| VOC-01 | Lưu từ yêu thích và ghi chú | DB-01 | Hai người ghi chú cùng từ độc lập. Bấm yêu thích lặp không tạo bản sao. |
| VOC-02 | Hoàn tất phiên flashcard | VOC-01 | Tập nhỏ ôn hết vẫn hợp lệ. Ôn lại một thẻ nhiều lần không tăng số thẻ khác nhau. |
| STAT-01 | Tổng hợp lịch sử và streak | ATT-02, VOC-02 | Một attempt chỉ sinh một hoạt động. Band và tỷ lệ bài luyện hiển thị riêng. |
| NOTIF-01 | Lưu và đọc thông báo theo sự kiện | GRADE-02, GRADE-03 | Retry không tạo trùng. Chỉ người nhận đọc/đánh dấu đã xem. |
| SAMPLE-01 | Nối quản trị và thư viện bài mẫu | DB-01 | Quản lý lưu bài nháp, khách chỉ xem được bài công khai. |
| GOAL-01 | Lưu lịch sử mục tiêu và hiển thị tiến độ ngày | STAT-01 | Đổi mục tiêu sinh mốc hiệu lực mới. Mở thông điệp hằng ngày không tăng streak. |
| QLBD-00 | Nâng cấp CSDL và tạo bảng danh mục bộ đề (04, 05) | DB-01 | Đã chạy 04 (D08) và 05_danh_muc_bo_de.sql trên PostgreSQL; exam_set_categories có 5 danh mục ban đầu, updated_at và UNIQUE(name). |
| QLBD-01 | Đồng bộ Prisma schema (exam_set_categories, updated_at, quan hệ) | QLBD-00 | schema.prisma khớp cấu hình DB đích, npm run prisma:generate thành công, tsc biên dịch không lỗi. |
| QLBD-02 | Viết unit rules và tests pure logic (exam-rules.ts) | QLBD-01 | 8/8 unit tests node:test chạy đạt, bao phủ slotKey, buildSlots, slotUi, canDeleteSet, canDeleteExam, canPublishSet, validateSkillReady. |
| QLBD-03 | Cập nhật HttpError, audit logger và Supabase Storage | QLBD-01 | HttpError hỗ trợ payload linh hoạt, audit ghi vào public.audit_logs an toàn transaction, bucket exam-covers sẵn sàng. |
| QLBD-04 | Dịch vụ danh mục và upload ảnh bìa bộ đề | QLBD-01, QLBD-03 | List/create category tự sinh slug, upload/delete ảnh bìa dọn Storage khi thay thế/xóa. |
| QLBD-05 | Dịch vụ quản lý bộ đề (exam-sets.service.ts) | QLBD-02, QLBD-04 | CRUD bộ đề, publish/hide/delete đảm bảo điều kiện biên, lockExamSet chống race condition, tính max(updated_at). |
| QLBD-06 | Dịch vụ quản lý Test trong bộ (exam-tests.service.ts) | QLBD-05 | Thêm Test tự sinh order_no, sửa Test, xóa Test re-index số thứ tự liên tục. |
| QLBD-07 | Dịch vụ quản lý kỹ năng (exam-skills.service.ts) | QLBD-02, QLBD-06 | Tạo nháp v1, publish nháp kèm kiểm tra điều kiện sẵn sàng, ẩn, hiển thị lại, nhân bản nháp mới tăng version_number. |
| QLBD-08 | Controller và Router Admin (A1–A16) | QLBD-05, QLBD-06, QLBD-07 | 16 endpoints quản trị tại /admin/exam-sets, /admin/exams, /admin/exam-skills, /admin/categories kiểm tra Zod và RBAC ADMIN. |
| QLBD-09 | Controller và Router Public (P1: GET /exam-sets/:id) | QLBD-05 | Trả chi tiết bộ đề công khai, chỉ hiển thị skills PUBLISHED (theo O4), kèm tối đa 5 bộ đề cùng danh mục. |
| QLBD-10 | Thư viện API Frontend (api.ts, exam-admin.ts) | QLBD-08, QLBD-09 | apiFetch tự chèn token/refresh, exam-admin cung cấp hàm gọi A1–A16 & P1 và các hàm chuyển đổi toUiSet, toLearnerSet, slotUi. |
| QLBD-11 | Nối backend cho AdminExams.tsx (Danh sách bộ đề) | QLBD-10 | Danh sách tải từ DB, Combobox danh mục có tạo mới inline, upload ảnh bìa xem trước, tạo/xóa bộ đề thời gian thực. |
| QLBD-12 | Nối backend cho AdminExamSet.tsx (Chi tiết bộ đề) | QLBD-10 | Hiển thị thông tin thực tế, thêm/xóa Test, menu kỹ năng cố định viewport, công khai/ẩn bộ đề, xóa an toàn. |
| QLBD-13 | Nối backend cho ExamDetail.tsx (Học viên) | QLBD-10 | Đọc ID từ URL, hiển thị dữ liệu thực tế từ P1, gợi ý bộ đề cùng loại, xử lý trạng thái không tìm thấy hoặc chưa công khai. |
| QLBD-14 | Kiểm thử tổng thể và hoàn thiện tài liệu | QLBD-00..13 | Unit tests và typecheck/build cả frontend và backend đều đạt 100%, tài liệu API, CSDL, Business Rules đồng bộ. |
| WSE-00 | Nâng cấp CSDL quy tắc chấm W/S (06) và đồng bộ Prisma | DB-01, QLBD-01 | Đã chạy 06_quy_tac_cham_ws.sql có 4 quy tắc và 16 tiêu chí; schema.prisma có rubric_criteria và quy tắc JSON, prisma generate và typecheck đạt. |
| WSE-01 | Quy tắc biên tập và chuyển đổi nội dung W/S (pure logic) | WSE-00 | 15/15 unit tests node:test đạt; validateSkillReady bao phủ W/S, mapper DB ↔ DTO không mất dữ liệu, canDeleteSkill và speakingDuration chính xác. |
| WSE-02 | Cấu hình Supabase Storage cho tài nguyên đề thi (exam-assets) | QLBD-03 | Bucket exam-assets cấu hình trong config, upload/delete/publicUrl ảnh đề kiểm tra byte type và dọn Storage an toàn. |
| WSE-03 | Dịch vụ biên tập kỹ năng Writing/Speaking (exam-editor.service.ts) | WSE-01, WSE-02 | Hoàn thành E1-E3, E5, E6; lưu có baseUpdatedAt chống ghi đè, tạo bản sửa tăng version, dọn Storage sau transaction, sửa publishSkill lọc FULL_SKILL. |
| WSE-04 | Endpoints quản trị biên tập đề (E1–E6) và kiểm thử tích hợp | WSE-03 | Các route E1–E6 trong exams.admin.routes.ts kiểm tra Zod và RBAC ADMIN; audit logs đầy đủ; 16/16 integration tests đạt 100%. |
| WSE-05 | Thư viện API Frontend biên tập đề thi (exam-editor.ts, exam-admin.ts) | WSE-04 | exam-editor.ts chuyển đổi state hai chiều toEditorState/fromEditorState, gọi E1–E6; deleteSkill bổ sung vào exam-admin.ts; tsc không lỗi. |
| WSE-06 | Chuyển đổi và kết nối AdminWritingEditor sang TSX | WSE-05 | AdminWritingEditor.tsx tuân thủ RULES không any; nạp đề theo skillId, chuyển Chỉnh sửa tự tạo bản sửa, lưu/đăng/xóa/upload ảnh nối API thật, giữ nguyên giao diện canvas. |
| WSE-07 | Chuyển đổi và kết nối AdminSpeakingEditor sang TSX | WSE-05 | AdminSpeakingEditor.tsx tuân thủ RULES không any; nạp 3 Part từ DB, tính thời lượng Speaking 15p chuẩn, lưu/đăng/xóa nối API thật, giữ nguyên giao diện canvas. |
| WSE-08 | Xóa kỹ năng, bỏ bản sửa và hoàn tác trên AdminExamSet | WSE-05 | Menu ô có Xóa/Bỏ bản sửa theo ngữ cảnh, confirm dialog BTN_RED, toast Tạo kèm nút Hoàn tác gỡ ngay bản nháp vừa tạo, build đạt. |
| WSE-09 | Cập nhật tài liệu kỹ thuật và biên bản bàn giao W/S | WSE-00..08 | Hoàn thiện API.md (E1-E6), BUSINESS_RULES.md (BR-EXAM-007, BR-EXAM-010), CSDL.md (Section 9), csdl/README.md, TASKS.md và biên bản tiến độ PROGRESS. |

Khi nhận một dòng liên quan nhiều kỹ năng, thực hiện và kiểm tra từng kỹ năng bằng fixture riêng. Với API mới, cập nhật [hợp đồng](API.md) cùng thay đổi phía gọi và phía phục vụ.
