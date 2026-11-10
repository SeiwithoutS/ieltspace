# Câu hỏi mở

Khi chốt một mục: ghi ngày và quyết định vào cột Trạng thái, thêm tệp `decisions/PDR-xxx` nếu là quyết định nghiệp vụ, rồi sửa tệp tài liệu và bản Word liên quan.

| ID | Câu hỏi cần chốt | Tác động | Trạng thái |
| --- | --- | --- | --- |
| OQ-001 | UC12 và UC30 nêu nhãn cá nhân nhưng CSDL hiện chưa có bảng nhãn: chốt thêm bảng nhãn hoặc bỏ nhãn khỏi UC12/UC30. | Câu chữ Chương 3 và CSDL | Mở (ghi trong Chương 3 bản team 10/11) |
| OQ-002 | Hình 3.1 ghi "7 module backend" nhưng Bảng 3.2 liệt kê 8 module: cần sửa trong hình. | Câu chữ Chương 3 và CSDL | Mở (ghi trong Chương 3 bản team 10/11) |
| OQ-003 | Mục 3.2 hoặc UC20: cân nhắc thêm một câu về phiên bản đề (đề đã đăng bất biến) cho khớp CSDL có exam_versions. | Câu chữ Chương 3 và CSDL | Mở (ghi trong Chương 3 bản team 10/11) |
| OQ-004 | Loại bài thi (Academic/General): CSDL lưu ở từng phần thi; Chương 3 đang nói ở mức đề trong UC27 và bảng quy đổi band. Giữ nguyên câu chữ hay sửa? | Câu chữ Chương 3 và CSDL | Mở (ghi trong Chương 3 bản team 10/11) |
| OQ-005 | UC04 E3 (xử lý bù khi tạo hồ sơ lỗi): thực tế hồ sơ được cơ sở dữ liệu tạo tự động cùng tài khoản, giữ hay sửa lại câu chữ? | Câu chữ Chương 3 và CSDL | Mở (ghi trong Chương 3 bản team 10/11) |
| OQ-006 | Yêu cầu phần cứng tối thiểu để triển khai/vận hành (Chương 1 §1.4.3 ghi "Chưa xác định"). | Báo cáo, triển khai | Mở |
| OQ-007 | Chương 2 chưa sửa theo các quyết định 20/10: §2.1 còn gọi vai trò là "trợ giảng, quản trị viên" và ghi Speaking là "giai đoạn phát triển tiếp theo"; đánh số nhảy từ 2.10 sang 2.12 (thiếu 2.11). | Câu chữ báo cáo | Mở. Khi code, theo [PDR-002](decisions/PDR-002-ten-vai-tro.md) và [PDR-004](decisions/PDR-004-pham-vi-mvp.md). |
| OQ-008 | Bảng 3.4 và một số UC còn kèm nhãn tiếng Anh User/Assistant/Admin bên cạnh tên vai trò. Giữ trong báo cáo hay bỏ? | Câu chữ báo cáo | Mở. Giao diện chỉ dùng tên tiếng Việt theo PDR-002. |
| OQ-009 | Thêm bảng system_settings (khóa, giá trị JSON) để lưu hạn 72 giờ, hạn 14 ngày, ngưỡng flashcard (mặc định 10 thẻ), giới hạn bài mặc định của Giáo viên? Hiện các tham số này chưa có nơi lưu. | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-010 | Thêm hai bảng nhãn từ vựng cá nhân (vocabulary_tags, vocabulary_tag_items) và đưa lại tag_id vào flashcard_sessions? UC12 chọn tập từ theo nhãn và UC30 quản lý nhãn, nhưng bản này không có bảng nhãn. Nếu không thêm thì phải sửa UC12/UC30. Thêm cả hai mục này thì tổng 42 bảng (đang là 39 bảng, tính cả daily_motivations nếu giữ). | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-011 | Bỏ hẳn bảng daily_motivations (theo góp ý của team) hay giữ? Đề xuất bỏ. | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-012 | Ghi sự kiện đăng nhập vào audit_logs để làm bảng "Hoạt động người học" ở trang Người dùng? | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-013 | users: giữ id riêng và auth_user_id duy nhất (đúng với code hiện tại), thay cho quy tắc cũ "id hồ sơ trùng auth.users.id"? | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-014 | band_scales.exam_type còn giữ để phân biệt Academic/General khi quy đổi Reading. Nếu đã chuyển loại bài thi xuống phần thi thì đổi thành form cho thống nhất? | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-015 | Thang tự đánh giá của flashcard: 3 mức (Chưa nhớ / Còn phân vân / Đã nhớ) trên giao diện hay 2 mức ở Chương 3 (self_rating)? | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
| OQ-016 | Lưu ý: số "41 bảng" trong bộ SQL local của báo cáo bàn giao khác với tài liệu này, cần so lại trước khi chạy migration. | Cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md)) | Mở (CSDL.docx mục 10, 10/11/2026) |
