# 09. Quản lý bài mẫu (UC21) và trang xem bài mẫu (UC05)

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án (canvas bản 207 đến 231). Màn tương ứng trong `docs/ui/canvas/`: `AdminSamples`, `AdminSampleWriting`, `AdminSampleSpeaking`, `SampleLibrary`, `SampleWriting`, `SampleSpeaking`.

## 1. Trang Quản lý bài mẫu (`AdminSamples`)

- Thay trang cũ "Nội dung học tập" (đã xóa 28/10). Mục sidebar "Quản lý bài mẫu".
- 3 ô tổng quan: tổng, Writing, Speaking.
- Danh sách Writing nhóm theo Task 1 Academic, Task 2, General Training; Speaking theo Part 1 / 2 / 3. Mỗi nhóm có nút "+ Nhập bài".
- Nút "Thêm bài mẫu" hỏi kỹ năng rồi mở editor (vào thẳng chế độ Chỉnh sửa).

## 2. Editor bài mẫu Writing (`AdminSampleWriting`)

Cấu trúc tham khảo tuhoc.dolenglish.vn.

- Trường: hình thức Academic/GT, Task, dạng bài, tiêu đề, chủ đề, nguồn, band, đề bài (khung; ảnh cho Task 1 Academic), dàn ý (đoạn giới thiệu `outlineIntro` ngoài ô + dàn ý trong ô), bài mẫu (đếm từ, `**đậm**` cho cụm quan trọng), phần dịch, ảnh bìa 3:2.
- **Dạng bài** (select, bắt buộc khi Đăng, hiện thành thẻ tím ở bản xem trước), danh sách đổi theo hình thức + Task:
  - Task 1 Academic: Bar Chart, Line, Table, Map, Process, Pie Chart, Mixed.
  - Task 1 General Training: Request Letter, Advice Seeking Letter, Application letter, Complaint Letter, Apology Letter, Thank Letter.
  - Task 2: Agree/Disagree, Discuss Both Views, Advantages/Disadvantages, Two-Part Questions, Problem/Causes/Solutions.
- Phút, số từ, dòng dưới khung cố định theo Task như editor đề thi.
- Hai cột Soạn và Xem trước, mỗi cột có thanh cuộn riêng. Xem trước: tiêu đề Đề bài / Dàn ý / Bài mẫu / Phần dịch cỡ lớn font heading, đề bài trong thẻ xanh. Ảnh bìa chỉ hiện ở thẻ thư viện, không hiện ở xem trước.
- Nút mắt "Xem như người học" mở trang SampleWriting.
- Bài tập và từ vựng đi kèm bài mẫu: **tạm chưa làm**.

## 3. Editor bài mẫu Speaking (`AdminSampleSpeaking`)

- Một editor riêng cho cả Part 1, 2, 3 (không gộp với Writing, không tách theo Part). Chọn Part bằng pill.
- Part 1 / Part 3: danh sách câu hỏi, mỗi câu một bài mẫu.
- Part 2: cue card + một bài mẫu.
- Dàn ý tùy chọn; audio mẫu tùy chọn (nằm trong từng thẻ, Part 2 một audio).
- Xem trước theo DOL: Đề bài, Dàn ý, Bài mẫu.

## 4. Phía người học

- Luồng: SampleLibrary → SampleWriting → SampleSpeaking. Thẻ Writing và menu Bài mẫu mở SampleWriting; thẻ/menu Speaking mở SampleSpeaking.
- **SampleWriting**: breadcrumbs (Trang chủ › Thư viện bài mẫu › Writing Task N › dạng bài › tiêu đề), chip, 4 mục Đề bài / Dàn ý / Bài mẫu / Phần dịch, mục lục dính bên phải có scrollspy + thanh % đã đọc, cụm quan trọng bôi vàng.
- **SampleSpeaking**: cùng khuôn: breadcrumbs, scrollspy, Đề bài (Part 2 cue card, Part 1/3 danh sách câu hỏi), Dàn ý, Bài mẫu từng câu + audio mẫu.
- Còn thiếu: "Xem thêm" và dữ liệu thật ở SampleLibrary; bài tập và từ vựng đi kèm.

## 5. Dữ liệu

- Bảng `sample_answers` (bản CSDL nhóm). Ảnh, audio ở Storage.
- Nhập xlsx: xem [06 Nhập liệu xlsx](06-nhap-lieu-xlsx.md).
