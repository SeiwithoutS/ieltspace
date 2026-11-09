# Rà soát danh sách Use Case Chương 3 (ngày 2026-10-20)

Nguồn: "Chương 3 - Phân tích và thiết kế hệ thống mới.docx" (bảng 34 UC, đặc tả UC01-UC34, hình sơ đồ use case tổng quan), đối chiếu với Chương 1, mục 3.4 và các quyết định đã chốt trong .notes/inputs.md. File .docx gốc không bị sửa.

Mức độ: **[Nặng]** sai lệch hoặc thiếu chức năng; **[Vừa]** thiếu luồng/quy tắc; **[Nhẹ]** trình bày, đánh số.

## A. Sơ đồ use case tổng quan (hình trong mục 3.6.1) đã cũ, phải vẽ lại [Nặng]

Hình hiện tại là bản 25 UC trước khi chốt, lệch với bảng và đặc tả:
1. Tác nhân ghi "Trợ giảng", phải là "Giáo viên".
2. UC18 vẽ là "Theo dõi tiến độ người học" của Trợ giảng. Đặc tả mới: UC18 "Theo dõi hoạt động hỗ trợ chấm bài" của **Quản lý**, và Giáo viên không được xem tiến độ người học.
3. Thiếu 9 UC: UC26 đến UC34 (khôi phục mật khẩu, thư viện đề, thư viện từ vựng, yêu thích, ghi chú/nhãn, mục tiêu, Daily Motivation, tải bài, gửi yêu cầu chấm).
4. Tên cũ: UC10 "Nộp bài Writing/Speaking" (nay "Hoàn thành và lưu bài"), UC11 "Xem nhận xét của Trợ giảng", UC12 "Học từ vựng" (nay "Ôn tập từ vựng bằng flashcard").
5. UC06 chỉ nối Người học; đặc tả cho cả 3 vai trò. UC26 cũng dành cho cả 3 vai trò.
6. Tiêu đề hình "Khách chỉ xem bài mẫu" sai: Khách còn xem thư viện đề (UC27) và từ vựng (UC28).
7. Thiếu các quan hệ include/extend đặc tả đã nêu: UC07 → UC10 (include với W/S), UC10/UC13 → UC34 và UC33 (extend), UC01 → UC26 (extend), UC12 ↔ UC29/UC30.
8. Chú thích ảnh ghi "25 use case", phải là 34.

## B. Thiếu chức năng / thiếu UC

9. **[Nặng] Thông báo cho Người học không có UC.** UC34 (A4, A5), UC19 (A7) đều "thông báo cho Người học" khi yêu cầu chấm bị hủy hoặc có kết quả, nhưng không có UC xem thông báo và không nói kênh nào (trong app hay email). → Cần quyết định (câu hỏi 2).
10. **[Nặng] Cấu hình bảng quy đổi band và bộ tiêu chí chấm W/S không có ai quản lý.** UC07 BR4, mục 3.3, UC16 BR3, UC20 BR2 đều dựa vào "bảng quy đổi đã cấu hình" và "bộ tiêu chí, trọng số, làm tròn đã cấu hình", nhưng không UC nào tạo/sửa chúng, file import cũng không có. → Cần quyết định (câu hỏi 3).
11. **[Vừa] UC23 chỉ nhập "đề thi hoặc từ vựng".** Đã chốt file mẫu xlsx có sheet Bai_mau, nên UC23 cần thêm bài mẫu. UC23 cũng thiếu bước upload tệp audio/ảnh và kiểm tra tên tệp khớp với cột audio_file/image_file (UC24 bước 5).
12. **[Vừa] Không có lưu tự động / làm tiếp bài đang dở.** UC07 E2 chỉ "giữ câu trả lời trên giao diện". Nếu đóng tab, mất mạng lâu hoặc đăng xuất giữa bài (UC02 bước 2) thì lượt làm dở xử lý ra sao chưa có quy tắc. Đề xuất: lưu câu trả lời lên server định kỳ, cho làm tiếp đến khi hết giờ; hết giờ thì tự nộp phần đã lưu.
13. **[Vừa] Speaking thiếu luồng ghi âm.** UC07/UC10 không có ngoại lệ trình duyệt từ chối micro hoặc không hỗ trợ ghi âm, không nói có được ghi lại trước khi hoàn thành không, và không nói ghi theo từng Part hay cả bài.
14. **[Vừa] Quy tắc phát audio Listening chưa có.** Đề thật chỉ nghe một lần, không tua. UC07/UC08 không nêu. → câu hỏi 6.
15. **[Vừa] "Phiên học hợp lệ" chưa định nghĩa.** UC12 BR4, UC13 BR5, UC31 BR6 dùng khái niệm này để tính streak và mục tiêu số phiên/ngày, nhưng không nói hoạt động nào được tính. → câu hỏi 5.
16. **[Vừa] Tài khoản Người học bị khóa/xóa khi đang có yêu cầu chấm.** UC19 BR7 chỉ xử lý phía Giáo viên. Chưa có quy tắc cho yêu cầu đang chờ/đang chấm của Người học bị khóa hoặc xóa.
17. **[Nhẹ] Giáo viên đầu tiên đăng nhập thế nào.** UC19 A1 "tạo tài khoản theo vai trò" nhưng không nói cách giao mật khẩu (email mời đặt mật khẩu hay mật khẩu tạm). Đề xuất: gửi email mời đặt mật khẩu qua dịch vụ xác thực (dùng lại cơ chế UC26).
18. **[Nhẹ] Giáo viên không lưu nháp khi chấm.** UC16 A2 hủy là mất. Bài Writing dài, nhận xét theo 4 tiêu chí; đề xuất cho lưu nháp (chưa công bố, Người học không thấy).
19. **[Nhẹ] Tác vụ tự động không xuất hiện trong mô hình.** Hủy sau 72 giờ, cấp lượt miễn phí mỗi tuần, xóa nội dung hết hạn, phân công định kỳ là việc của hệ thống. Đề xuất thêm tác nhân phụ "Bộ hẹn giờ hệ thống" vào sơ đồ, hoặc ghi rõ trong 3.4 là tác vụ nền, không phải UC.

## C. Mâu thuẫn giữa các phần

20. **[Nặng] UC14 Tùy chỉnh giao diện và song ngữ Việt-Anh lệch với UI.** Chương 1, 2, 3 đều yêu cầu chế độ sáng/tối và song ngữ, nhưng thiết kế UI ngày 09/10 đã bỏ nút sáng/tối và nút đổi ngôn ngữ. Song ngữ cũng không có UC nào. → câu hỏi 1.
21. **[Vừa] UC08 cho luyện Writing/Speaking (A3, BR5)** trong khi Question Group chỉ có ở Listening/Reading (W/S không có cụm câu hỏi, đúng như file import). → câu hỏi 4.
22. **[Vừa] Ngữ pháp còn trong Chương 1** (1.3.1, 1.3.2, 1.4.1d, 1.4.2: "học ngữ pháp", "đẩy dữ liệu ngữ pháp") nhưng Chương 3 không có UC. Theo nguyên tắc đã chốt (Chương 3 thắng), mặc định bỏ ngữ pháp khỏi Chương 1.
23. **[Nhẹ] Tác nhân không nhất quán:** UC05 bảng tổng quan ghi "Khách", trong khi UC27/UC28 ghi "Khách, Người học". Vì Người học kế thừa Khách (có mũi tên tổng quát hóa trên hình) nên chọn một kiểu ghi và dùng cho cả 3 UC.
24. **[Nhẹ] UC14 chỉ cho Người học**, nhưng Giáo viên và Quản lý cũng dùng giao diện. Nếu giữ UC14 thì mở cho cả 3 vai trò (và Khách nếu lưu trên trình duyệt).
25. **[Nhẹ] Bài mẫu Speaking?** UC21 "phân loại theo kỹ năng" ngụ ý có bài mẫu Speaking, nhưng menu UI và file import chỉ có Writing Task 1/Task 2.

## D. Đánh số, trình bày [Nhẹ]

26. Có hai bảng cùng số "Bảng 3.6" (tác nhân và danh sách UC), hình đánh "Hình 3.6" ngay sau Hình 3.1 (alt text còn ghi "Hình 3.2"). Cần đánh lại số bảng/hình.
27. Bảng tổng quan có một dòng trống giữa UC14 và UC15.
28. Mục 3.5 có câu bị cắt: "Mật khẩu không được lưu dưới dạng văn bản thuần mà được dịch vụ xác thự" và dấu chấm đôi "Người học..".
29. UC04 E2 "Email không thể sử dụng để đăng ký" và A1 "nếu bật xác minh email": quyết định có bật xác minh email hay không vẫn để mở. → câu hỏi 7.

## E. Câu hỏi cần quyết định (mặc định đề xuất in đậm)

1. Sáng/tối và song ngữ: **giữ trong tài liệu, thêm lại nút trên UI** / bỏ UC14 và bỏ song ngữ khỏi Chương 1-3.
2. Thông báo: **chỉ hiển thị trạng thái + chấm đỏ trong trang lịch sử (UC13), không thêm UC** / thêm UC "Xem thông báo" trong app / gửi email.
3. Bảng quy đổi band và bộ tiêu chí W/S: **dữ liệu khởi tạo cố định theo chuẩn IELTS, không có UC** / thêm UC cho Quản lý cấu hình.
4. UC08 luyện theo dạng: **chỉ Listening/Reading, bỏ A3 và BR5** / cho luyện W/S theo từng Task/Part.
5. Phiên học hợp lệ: **hoàn thành 1 bài ở UC07/UC08/UC10 hoặc 1 phiên flashcard đủ số thẻ tối thiểu** / định nghĩa khác.
6. Audio Listening: **làm đề đầy đủ chỉ nghe 1 lần, luyện dạng (UC08) được nghe lại** / luôn cho nghe lại.
7. Xác minh email khi đăng ký: **bật** / không bật.
8. Người học bị khóa/xóa khi đang có yêu cầu chấm: **khóa thì giữ nguyên yêu cầu; xóa thì hủy yêu cầu, không hoàn bonus** / khác.

## F. Đã áp dụng vào Chương 3 (2026-10-20)

Người dùng chọn: 1 giữ sáng/tối, bỏ song ngữ (chưa sửa UI); 2a; 3a; 4b (UC08 cho luyện W/S theo Task/Part); 5a; 6a; 7a; 8a.
File đã sửa: /mnt/project-files/tai-lieu/Chương 3 - Phân tích và thiết kế hệ thống mới (sửa 20-10).docx. Chữ thêm mới tô vàng, chữ bỏ đi là tracked change (gạch ngang). Sơ đồ use case vẽ lại: /mnt/project-files/tai-lieu/hinh-3.2-uc-tong-quan.png.
Mục đã xử lý: A1-A8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 23, 24, 26, 27, 28 (chỉ dấu chấm đôi; câu "bị cắt" là do công cụ trích, file gốc đầy đủ), 29.
Còn mở: 13 (Speaking có được ghi lại không), 18 (Giáo viên lưu nháp khi chấm), 22 (ngữ pháp và song ngữ trong Chương 1), 25 (bài mẫu Speaking), số thẻ tối thiểu của phiên flashcard (đang để 10).

## G. Đợt 2 (2026-10-20 05:18), đã áp dụng
- Số thẻ tối thiểu của phiên flashcard là tham số cấu hình hệ thống (mặc định 10).
- Speaking: được ghi âm lại khi luyện tập (UC08); bài thi đầy đủ ghi một lần (UC07).
- Giáo viên được lưu nháp điểm và nhận xét (UC16 A4, BR10; UC15 hiện bài có nháp).
- Bài mẫu chỉ Writing (UC05, UC21, Bảng 3.2, Bảng 3.5).
- Chương 1 đã sửa theo các quyết định: bỏ ngữ pháp, song ngữ, forum/cộng đồng, nghe chép chính tả, GV theo dõi tiến độ; Trợ giảng/User đổi thành Giáo viên/Người học; React + Vite thay Next.js; import xlsx. File: /mnt/project-files/tai-lieu/Chương 1 - Phân tích yêu cầu nghiệp vụ (sửa 20-10).docx
Chương 2 chưa sửa (còn ghi Speaking là giai đoạn sau).
