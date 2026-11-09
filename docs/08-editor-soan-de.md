# 08. Editor soạn đề (Reading, Listening, Writing, Speaking)

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án (canvas bản 119 đến 231). Màn tương ứng trong `docs/ui/canvas/`: `AdminReadingEditor`, `AdminListeningEditor`, `AdminWritingEditor`, `AdminSpeakingEditor`, `QuestionCard`, `QuestionCards`.

## 1. Chế độ Chỉ xem và Chỉnh sửa (áp dụng cho mọi editor, chốt 31/10)

- Mọi editor (4 editor đề và 2 editor bài mẫu) **mở ở chế độ Chỉ xem**, kể cả đề mới tạo và bài mới trống.
- Ở chế độ xem, ô nhập thành khối nền `#F6F4EF` không viền, không con trỏ, không resize, không mũi tên select. Dưới thanh tiêu đề có dải xanh `#E3ECFD` với icon khóa "Chế độ chỉ xem...".
- Bấm Chỉnh sửa → hiện Hoàn tác, Hủy (đỏ), Lưu. Hủy khi chưa lưu hỏi: Tiếp tục sửa / Không lưu / Lưu.
- Ngoại lệ: "Thêm bài mẫu" từ trang Quản lý bài mẫu vào thẳng Chỉnh sửa.
- Nút xóa thẻ câu hỏi (cả nhóm) hiện ở cả hai chế độ; bấm từ chế độ xem thì hỏi xác nhận rồi đề chuyển sang Chỉnh sửa chưa lưu.
- Xóa lớn có hộp xác nhận; xóa nhỏ có thanh Hoàn tác; hỗ trợ Ctrl+Z.
- Cạnh tên đề: số câu, chip Chỉ xem, chip hình thức (Academic/GT), icon mắt "Xem như người học".

## 2. Reading (split editor)

- Một đề Reading: 3 passage, 40 câu. Đề luôn có sẵn 3 passage (trống thì ghi "chưa nhập") để nhập song song.
- Cột trái: 2 cụm Tiêu đề + Hình / Các đoạn, thu gọn được. Passage chia đoạn A, B, C...; đoạn văn lưu dạng `[{label, text}]` trong nội dung của phần, không thêm bảng.
- Hình kèm bài đọc luôn đặt sau tiêu đề, có chú thích.
- Cột phải: các nhóm câu hỏi (1-2 dạng mỗi passage). Thẻ câu hỏi co giãn theo độ rộng: hẹp thì xuống dòng, rộng thì nằm ngang.
- Giới hạn từ là combo 7 mức. Hướng dẫn tự sinh theo dạng, giới hạn từ, số lựa chọn.
- Cách viết khác (tùy chọn) lưu vào `accepted_answers`; ô này nằm dưới cột Đáp án, hoặc ngang hàng khi thẻ rộng từ 720px.
- Dạng có chỗ trống `___` có nút xóa đỏ từng chỗ trống (gỡ cả đáp án, các câu sau tự đánh lại số).
- Đáp án đúng trắc nghiệm hiện màu xanh lá `#2E7D4F`.
- Tab **Giải thích**: mỗi câu gán đoạn chứa đáp án + key phrases (bôi đen chữ trong đoạn để thêm, tô sáng ở cột trái; key không có trong đoạn thì báo đỏ). Không bắt buộc khi Đăng.
- Dạng câu hỏi chi tiết: [05 Chấm L/R và dạng câu hỏi](05-cham-listening-reading-va-dang-cau-hoi.md).

## 3. Listening

- Theo ielts.org: 4 section (part), 40 câu, khoảng 30 phút, ghi âm phát một lần, dùng chung Academic/GT.
- Dựng từ editor Reading: mỗi section có thêm ghi âm và transcript.
- Ghi âm: tải tệp thật MP3/WAV/M4A tối đa 50 MB, đọc thời lượng, phát được. Xóa có hộp xác nhận + Hoàn tác. Đăng báo lỗi "Section N chưa có ghi âm".
- Transcript chia đoạn A, B, C...; mốc giờ ghi đầu đoạn dạng `[01:05] SPEAKER: ...` (bấm chip để nghe từ mốc đó). Tab Giải thích gán đoạn transcript chứa đáp án + key phrases.
- Bản đồ Section 2 là ảnh + nhãn số (Diagram Labelling).
- Công nghệ đề xuất cho transcript: Whisper/WhisperX (ghi trong Doc luồng bộ đề 27/10).

## 4. Writing

- Tab Task 1 / Task 2. Ô đề bài trong khung riêng; người dùng chỉ nhập nội dung trong khung.
- Phút, số từ và dòng dưới khung **cố định theo Task**: Task 1 20 phút / 150 từ, Task 2 40 phút / 250 từ.
- Task 1 upload, thay, xóa ảnh (png/jpg/webp tối đa 5 MB).
- Hình thức Academic / General Training.
- Đăng bắt buộc: có đề, phút trong 1-120, số từ trong 1-1000.

## 5. Speaking

- Tab Part 1 / 2 / 3.
- Part 1 và Part 3 là danh sách câu hỏi lẻ (thêm, sửa, xóa từng câu); người học xem từng câu và ghi âm. Thời gian tổng Part 1 + 3 dùng chung, mặc định 5 phút, chỉnh được.
- Part 2: chuẩn bị 1 phút, nói 2 phút, cue card soạn bằng markdown nhẹ (dùng lại từ Reading).
- Đăng bắt buộc: có câu hỏi Part 1, Part 3 và cue card Part 2.

## 6. Nhập xlsx trong editor

Cả 4 editor có nút "Nhập từ xlsx". Chi tiết: [06 Nhập liệu xlsx](06-nhap-lieu-xlsx.md).
