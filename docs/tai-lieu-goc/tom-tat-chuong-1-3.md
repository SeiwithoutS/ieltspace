# Tài liệu đầu vào của dự án (ghi 2026-10-20, chỉ dựa trên Chương 1, 2, 3)

Nguồn: 3 file .docx người dùng đính kèm vào thread ngày 2026-10-20 (không nằm trong thư mục chung; bản gốc trên máy người dùng, thư mục D:\Study\Đồ án 1). Tên: "Chương 1 - Phân tích yêu cầu nghiệp vụ.docx", "Chương 2 - Tổng quan công nghệ.docx", "Chương 3 - Phân tích và thiết kế hệ thống mới.docx".

## Đề tài
Đồ án 1, ĐH CNTT (ĐHQG TP.HCM), khoa Công nghệ phần mềm, năm 2026. Tên: "Xây dựng nền tảng hỗ trợ học tập và ôn luyện IELTS". GVHD: Nguyễn Thị Xuân Hương. SV: Nguyễn Trọng Phúc (19522041), Võ Nguyễn Thanh Hương (24520649).
Động lực: học ở trung tâm tốn kém, cố định giờ, thiếu cá nhân hóa; một thành viên từng làm ở trung tâm IELTS. Đã khảo sát Study4, PREP, DOL Tự Học, IELTS Online Test: chưa nền tảng nào gom đủ chức năng.

## Chương 1 (yêu cầu nghiệp vụ)
- Cấu trúc nghiệp vụ: Bộ đề → Đề thi → Kỹ năng → Phần (Section/Passage/Task/Part) → Question Group → Question → Answer (L/R) hoặc Rubric (W/S).
- Làm từng kỹ năng độc lập, không bắt buộc làm trọn đề; luyện theo từng Question Group.
- L/R chấm tự động; W/S do trợ giảng/giáo viên chấm tay theo tiêu chí. AI chấm: hướng phát triển sau, ngoài phạm vi.
- Vai trò (Ch.1): Người học (User), Trợ giảng (Assistant), Quản lý (Admin); Ch.1 còn dùng chữ "Trợ giảng" và "User" (Ch.3 đã đổi sang "Giáo viên", "Người học").
- Chức năng người học: tài khoản/hồ sơ, làm bài, kết quả + lời giải, nộp W/S và theo dõi trạng thái, flashcard + yêu thích + ghi chú + nhãn, bài mẫu, sáng/tối, lịch sử + biểu đồ tiến độ, Daily Motivation, streak.
- Quản lý: người dùng/giáo viên (tạo, khóa/mở, phân quyền), Bộ đề/Đề thi, import theo format chuẩn có validate (Excel/CSV/JSON, "chưa chốt"), thống kê tổng quan.
- Dữ liệu tự biên soạn từ nguồn công khai (tránh vi phạm bản quyền). Phạm vi MVP, web desktop, song ngữ Việt-Anh, không có app native.
- Phần cứng: "chưa xác định". Phi chức năng: phản hồi 2-3 giây, mật khẩu mã hóa, phân quyền 3 vai trò, sao lưu định kỳ, module hóa, light/dark.
- Ch.1 còn dấu vết cũ: nhắc "forum", "nghe chép chính tả có thể triển khai", "theo dõi tiến độ người học nếu được phân quyền" (Ch.3 nói quyền chấm không đồng nghĩa quyền xem tiến độ).

## Chương 2 (công nghệ, Bảng 2.1)
TypeScript (trên nền JavaScript), React + Vite, Tailwind CSS (sáng/tối), Node.js + Express (REST, JSON, HTTPS), PostgreSQL, Prisma ORM, Supabase (Database, Auth, Storage: ảnh đại diện, audio Listening, ghi âm Speaking), triển khai frontend Vercel, backend Render, Git/GitHub, thiết kế Figma.
Lưu ý từ Ch.2: backend phải tự kiểm tra quyền (Prisma dùng quyền rộng, không dựa vào RLS); API lấy đề không trả đáp án; điểm chính thức tính ở backend; nộp bài chống xử lý trùng; file lưu Supabase Storage, DB chỉ giữ đường dẫn; Render gói free có thể ngủ. Ch.2 viết Speaking là "giai đoạn sau" (lệch với Ch.3 đã có UC Speaking).

## Chương 3 (phân tích và thiết kế)
- Kiến trúc client-server 3 tầng; backend nguyên khối chia 8 module: Người dùng và xác thực; Đề thi; Làm bài; Chấm bài; Từ vựng; Bài mẫu; Thống kê và động lực; Quản trị và nhập dữ liệu.
- Chấm L/R: đối chiếu đáp án chuẩn. Đề đầy đủ → quy đổi band theo bảng cấu hình (chỉ tham khảo). Luyện theo Question Group → số đúng/tổng, tỷ lệ chính xác = đúng / tổng câu (tính cả câu bỏ trống), không quy đổi band. Không trung bình lẫn band với tỷ lệ chính xác.
- Quy tắc W/S (3.4), điểm then chốt:
  - Hoàn thành W/S chỉ LƯU bài (hạn lưu tạm 14 ngày), không tự vào hàng đợi chấm.
  - Người học chủ động "gửi yêu cầu hỗ trợ chấm" (UC34): tốn 1 lượt. Mỗi tuần 1 lượt miễn phí dùng chung W/S (tuần T2 00:00 giờ VN, không cộng dồn); lượt bonus hiệu lực đến hết Chủ nhật tuần kế tiếp.
  - Yêu cầu chờ tối đa 72 giờ; tự động phân công cho giáo viên (đang hoạt động, có quyền kỹ năng, chưa đạt giới hạn bài chưa chấm; ưu tiên ít bài nhất, rồi lâu chưa nhận). Giáo viên không từ chối/nhận thủ công.
  - Quá 72 giờ chưa phân công → tự hủy + hoàn 1 bonus. Giáo viên không thể hoàn thành → Quản lý xác nhận hủy + hoàn bonus, không phân công lại. Mỗi bài tối đa 1 yêu cầu đang hoạt động; bài đã có kết quả không gửi lại.
  - Có kết quả → giữ nội dung thêm 14 ngày rồi xóa; điểm, nhận xét, lịch sử được giữ. Chưa chấm = "chưa có điểm", không phải 0.
  - Thu hồi quyền giáo viên: ngừng giao bài mới, chấm nốt bài đã giao.
- Bảo mật: giáo viên chỉ truy cập bài được phân công; mật khẩu do dịch vụ xác thực xử lý.
- Use case (3.6): 4 tác nhân (Khách, Người học, Giáo viên, Quản lý), 34 UC (bảng tổng quan; nhưng chú thích hình vẽ còn ghi "25 use case", lệch số). Đặc tả chi tiết mẫu từ UC01 đến UC34.
  UC01 Đăng nhập, 02 Đăng xuất, 03 Xem trang giới thiệu, 04 Đăng ký, 05 Xem bài mẫu (Khách), 06 Quản lý thông tin cá nhân (3 vai trò), 07 Làm bài kiểm tra, 08 Luyện theo dạng câu hỏi, 09 Xem kết quả và lời giải, 10 Hoàn thành và lưu W/S, 11 Xem nhận xét của Giáo viên, 12 Flashcard, 13 Lịch sử và thống kê, 14 Tùy chỉnh giao diện (sáng/tối), 15 Xem hàng đợi bài chờ chấm, 16 Chấm W/S, 17 Xem lịch sử bài đã chấm, 18 Theo dõi hoạt động hỗ trợ chấm (Quản lý), 19 Quản lý người dùng, 20 Quản lý Bộ đề và Đề thi, 21 Quản lý bài mẫu, 22 Quản lý từ vựng, 23 Nhập dữ liệu hàng loạt (bao hàm 24), 24 Kiểm tra hợp lệ dữ liệu, 25 Xem thống kê hệ thống, 26 Khôi phục mật khẩu, 27 Xem thư viện đề (Khách, Người học), 28 Tra cứu thư viện từ vựng (Khách, Người học), 29 Quản lý từ yêu thích, 30 Quản lý ghi chú và nhãn, 31 Thiết lập mục tiêu học tập, 32 Daily Motivation, 33 Tải bài làm W/S (.docx / ghi âm), 34 Gửi yêu cầu hỗ trợ chấm W/S.
  Hình 3.1 (kiến trúc) và hình use case là ảnh trong .docx, chưa trích ra.

## Các điểm lệch giữa 3 chương: chốt theo tài liệu 20/10 (người dùng xác nhận 2026-10-20)
Nguyên tắc: Chương 3 (mới nhất, chi tiết nhất) thắng Chương 1; Chương 2 thắng Chương 1 về công nghệ.
- Tên vai trò: Khách, Người học, Giáo viên, Quản lý (không dùng Trợ giảng/User/Assistant/Admin trong tài liệu và giao diện).
- Cơ chế chấm W/S: theo Chương 3.4 (lưu bài 14 ngày, người học chủ động gửi yêu cầu, lượt miễn phí/bonus, chờ 72 giờ, tự phân công). Không còn mô hình "nộp là tự vào hàng đợi".
- Danh sách use case: 34 UC của Chương 3 (UC01-UC34); chú thích hình "25 use case" là sót, sửa thành 34.
- Giáo viên không theo dõi tiến độ người học (Ch.3 bảo mật); bỏ ý "nếu được Quản lý phân quyền theo dõi" của Ch.1.
- Speaking: có trong phạm vi (Ch.3 có UC10, UC16, UC33 cho W/S); bỏ ý "Speaking giai đoạn sau" của Ch.2.
- Frontend: React + Vite (Ch.2), không dùng Next.js như gợi ý Ch.1. Backend Express, DB PostgreSQL, Prisma, Supabase, Vercel + Render.
- Forum và nghe chép chính tả: ngoài phạm vi (Ch.3 không có UC); chỉ còn kho bài mẫu.
- Định dạng file import: chốt xlsx (2026-10-20, người dùng đồng ý). Một file nhiều sheet cho đề thi (Exams, Parts, Groups, Questions, Answers nối bằng cột mã) và sheet phẳng Bai_mau; media upload riêng, ghi tên tệp vào cột audio_file/image_file; kiểm tra hợp lệ báo lỗi theo sheet/dòng/cột, có lỗi thì không lưu gì. File mẫu: /mnt/project-files/import-templates/ielts-import-template.xlsx. Ch.1 (mục 1.4.2) và Ch.3 (bảng module, UC23/UC24) cần sửa cho khớp.
- Vẫn để mở theo đúng tài liệu: yêu cầu phần cứng ("chưa xác định").

## Quyết định rà soát UC ngày 2026-10-20 (người dùng chọn, đã ghi vào bản sửa Chương 3)
Bản sửa: /mnt/project-files/tai-lieu/Chương 3 - Phân tích và thiết kế hệ thống mới (sửa 20-10).docx (thêm mới tô vàng, xóa là tracked change). Chi tiết: /mnt/project-files/usecase/ra-soat-uc-chuong3-2026-10-20.md
- Giữ chế độ sáng/tối (UC14, mở cho cả 3 vai trò); BỎ song ngữ Việt-Anh. UI chưa cần thêm lại nút sáng/tối.
- Thông báo: chỉ trạng thái + chấm đỏ chưa xem ở UC13, không email/đẩy.
- Bảng quy đổi band và bộ tiêu chí W/S: dữ liệu khởi tạo cố định, không có UC cấu hình.
- UC08 cho luyện cả W/S theo từng Task/Part (L/R theo Question Group).
- Phiên học hợp lệ: hoàn thành 1 lượt UC07, 1 bài UC08 hoặc 1 phiên flashcard (hết tập hoặc >=10 thẻ, số 10 chờ xác nhận); streak khi có >=1 phiên/ngày.
- Listening: đề đầy đủ nghe 1 lần, luyện theo dạng được nghe lại.
- Bắt buộc xác minh email khi đăng ký; tài khoản Giáo viên/Quản lý mới nhận email mời đặt mật khẩu.
- Người học bị khóa: giữ yêu cầu chấm; bị xóa: hủy yêu cầu chưa có kết quả, không hoàn bonus.
- Thêm: lưu tự động bài làm và làm tiếp lượt dở; ngoại lệ không có micro; mục 3.4.9 tác vụ tự động.

## Cập nhật 2026-10-20 15:25 (Chương 3 người dùng gửi lại)
- Bản mới nhất: /mnt/project-files/tai-lieu/Chương 3 - Phân tích và thiết kế hệ thống mới (sửa 20-10 lần 2).docx (35 UC, 72 hình). Bản người dùng gửi (đã chấp nhận hết thay đổi cũ) nằm trong uploads của thread, không ở thư mục chung.
- UC35 "Xem và quản lý thông báo" (Người học, Giáo viên, Quản lý): trung tâm thông báo trong hệ thống, không email/đẩy. Thay quyết định cũ "thông báo chỉ là trạng thái + chấm đỏ ở UC13".
- Bài mẫu: Writing (Task 1 Academic/General, Task 2) và Speaking (Part 1/2/3; transcript, có thể kèm audio). Thay quyết định cũ "chỉ Writing".
- Import vẫn chốt xlsx (người dùng chọn lại 15:16), gồm cả bài mẫu.
