# 05. Chấm Listening/Reading và dạng câu hỏi

Cập nhật 09/11/2026. Spec đầy đủ 20 mã dạng câu hỏi và widget: [spec/question-types-input-spec.md](spec/question-types-input-spec.md).

## 1. Chấm L/R

- Tự động, đối chiếu đáp án chuẩn.
- **Đề đầy đủ**: quy đổi band theo bảng cấu hình (seed), chỉ tham khảo.
- **Luyện theo Question Group**: số đúng / tổng, tỷ lệ chính xác = đúng / tổng câu (tính cả câu bỏ trống). Không quy đổi band. Không trung bình lẫn band với tỷ lệ chính xác.
- Câu bỏ trống là sai. Hết giờ thì hệ thống hoàn thành lượt làm với phần đã lưu.
- Listening đề đầy đủ nghe 1 lần; chế độ luyện được nghe lại.

### Quy tắc so đáp án dạng điền

- Chuẩn hóa: bỏ khoảng trắng đầu/cuối, không phân biệt hoa thường, gộp khoảng trắng thừa.
- So với đáp án đúng và từng giá trị trong danh sách cách viết khác (`accepted_answers`, ngăn bằng `|` khi nhập xlsx).
- Vượt giới hạn từ là sai; từ có gạch nối tính 1 từ.
- Số viết bằng chữ hay chữ số chỉ đúng nếu có trong danh sách chấp nhận. Sai chính tả là sai, không có điểm một phần.

## 2. Widget nhập cho người học

- **Radio**: chọn 1 (MCQ_SINGLE, TFNG, YNNG, TITLE_CHOICE).
- **Checkbox nhóm**: chọn nhiều (MCQ_MULTI, LIST_SELECT). Mỗi đáp án đúng 1 điểm. Một câu chọn nhiều chiếm nhiều số câu liên tiếp (ví dụ câu 5-9 chọn 5), giao diện giới hạn số lượt chọn bằng số câu đó.
- **Dropdown**: mọi dạng matching và chọn nhãn.
- **Textbox có giới hạn từ**: mọi dạng completion và short answer.
- Kéo thả (drag and drop): chưa làm, MVP dùng dropdown.

## 3. Dạng câu hỏi theo editor (chốt 27/10)

### Reading: 16 dạng (đối chiếu ielts.org, khớp đủ)

Gom thành 7 mẫu form trong editor. Bảng 16 dạng và 7 mẫu form nằm ở Claude Doc "Đề xuất form nhập liệu đề Reading" (https://claude.ai/artifact/Q2SmXCaj7sfjopJAEjoN3m) và component `QuestionCard` trên canvas (dữ liệu mẫu cho cả 16 dạng). Mã dạng dùng theo spec 20 mã.

- TFNG/YNNG và mọi Matching: chọn đáp án bằng combo box trong editor.
- Matching Headings: 1 câu cho mỗi đoạn.
- Summary/Note có trình soạn markdown nhẹ (B, I, `##` tiêu đề, `-` gạch đầu dòng, `___` chỗ trống).
- Summary khung từ: tick từ đúng (tối đa bằng số chỗ trống) rồi gán từ cho từng câu.
- Bảng kiểu Word/Notion: chọn vùng để gộp/tách ô, đặt ô tiêu đề, xóa hàng/cột.
- Hình có nhãn (Diagram): bấm vào hình để đặt nhãn số và mũi tên, kéo được.

### Listening: 11 dạng

NOTE_COMP (Form/Note Completion), SUMMARY, SUMMARY_BOX, SENTENCE, SHORT_ANSWER, TABLE, FLOW, DIAGRAM_COMP (Plan/Map/Diagram Labelling), MATCH_FEATURE (hiển thị là "Matching"), MCQ_SINGLE (3 lựa chọn A-C), MCQ_MULTI.

- Map Labelling gộp vào Diagram; Form Completion gộp vào Note Completion (không có mã FORM_COMP, MAP_LABEL riêng).
- Không có ở Listening: Headings, Matching Information, Sentence Endings, YNNG, TFNG.
- Thẻ câu hỏi Listening dùng lại thẻ của Reading.

## 4. Ràng buộc khi nhập (UC24)

- MCQ_MULTI và LIST_SELECT: số lựa chọn phải nhiều hơn số đáp án đúng, và số đáp án đúng bằng số câu dòng đó chiếm (`question_no_to - question_no + 1`), không trùng.

## 5. Điểm còn mở

- Danh sách mã `question_type` chưa được duyệt chính thức.
- Kéo thả cho matching.
