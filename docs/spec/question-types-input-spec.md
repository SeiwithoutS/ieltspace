# Dạng câu hỏi Listening/Reading và loại input cần có

Ngày 2026-10-20. Nguồn tra cứu: [IELTS Liz](https://ieltsliz.com/ielts-reading-question-types/) (14 dạng Reading), [IDP](https://ielts.idp.com/nepal/about/news-and-articles/article-ielts-listening-question-types) (6 nhóm Listening). Phần ánh xạ sang input là đề xuất của mình để nhóm duyệt; cột "Mã" dùng cho `question_type` trong file import xlsx.

## 1. Bảng tổng hợp

| Mã | Dạng (tiếng Anh) | Kỹ năng | Input người học | Lưu đáp án người học | Chấm tự động |
|---|---|---|---|---|---|
| MCQ_SINGLE | Multiple Choice (chọn 1) | L, R | Radio button (3-4 lựa chọn) | 1 chữ cái | So khớp chữ cái |
| MCQ_MULTI | Multiple Choice (chọn 2-3, "choose TWO letters") | L, R | Checkbox nhóm, giới hạn số lượt chọn bằng số câu mà dòng này chiếm (đã chốt) | Tập chữ cái | Mỗi chữ cái đúng 1 điểm, không phân biệt thứ tự (đã chốt 2026-10-20) |
| TFNG | True / False / Not Given | R | Radio 3 lựa chọn (hoặc dropdown) | TRUE/FALSE/NOT GIVEN | So khớp |
| YNNG | Yes / No / Not Given | R | Radio 3 lựa chọn | YES/NO/NOT GIVEN | So khớp |
| MATCH_HEADING | Matching Headings | R | Dropdown theo từng đoạn, danh sách tiêu đề i, ii, iii... (nhiều hơn số đoạn; mỗi tiêu đề dùng một lần) | Mã tiêu đề | So khớp; UI ẩn tiêu đề đã chọn |
| MATCH_INFO | Matching Paragraph Information | R | Dropdown chữ cái đoạn A-G (có thể lặp lại) | Chữ cái đoạn | So khớp |
| MATCH_FEATURE | Matching Features / Classification | R, L | Dropdown theo từng câu, danh sách nhóm A-E (có thể lặp lại) | Chữ cái nhóm | So khớp |
| MATCH_ENDING | Matching Sentence Endings | R | Dropdown chữ cái phần kết A-G (nhiều hơn số câu, dùng một lần) | Chữ cái | So khớp |
| LIST_SELECT | List Selection | R | Checkbox trên một danh sách dài A-G | Tập chữ cái | Như MCQ_MULTI |
| TITLE_CHOICE | Choosing a Title | R | Radio (tiêu đề đầy đủ) | 1 chữ cái | So khớp |
| SENTENCE_COMP | Sentence Completion | L, R | Textbox 1 dòng, hiện giới hạn từ | Chuỗi | So khớp chuỗi (xem mục 3) |
| SUMMARY_COMP | Summary Completion (điền từ trong bài) | L, R | Textbox ngay trong đoạn tóm tắt | Chuỗi | Như SENTENCE_COMP |
| SUMMARY_BOX | Summary Completion (chọn từ trong khung từ) | R | Dropdown trong đoạn tóm tắt, nguồn là khung từ | Chữ cái/từ | So khớp |
| NOTE_COMP | Note / Form Completion | L (R) | Textbox trong biểu mẫu hoặc ghi chú | Chuỗi | Như SENTENCE_COMP |
| TABLE_COMP | Table Completion | L, R | Textbox trong ô bảng | Chuỗi | Như SENTENCE_COMP |
| FLOW_COMP | Flow-chart Completion | L, R | Textbox trong ô của sơ đồ | Chuỗi | Như SENTENCE_COMP |
| DIAGRAM_COMP | Diagram Label Completion | R (L) | Textbox đặt cạnh nhãn trên hình | Chuỗi | Như SENTENCE_COMP |
| SHORT_ANSWER | Short-answer Questions | L, R | Textbox 1 dòng | Chuỗi | Như SENTENCE_COMP |
| MAP_LABEL | Plan / Map / Diagram Labelling (chọn nhãn) | L | Dropdown chữ cái A-H gắn với từng điểm trên ảnh | Chữ cái | So khớp |
| MATCH_LISTEN | Matching trong Listening (số thứ tự với danh sách) | L | Dropdown | Chữ cái | So khớp |

Tóm tắt widget: **radio** cho chọn 1 (MCQ_SINGLE, TFNG, YNNG, TITLE_CHOICE); **checkbox nhóm** cho chọn nhiều (MCQ_MULTI, LIST_SELECT); **dropdown** cho mọi dạng ghép/matching và chọn nhãn; **textbox** cho mọi dạng điền từ (completion, short answer).

Đã chốt 2026-10-20: Multiple Choice nhiều đáp án dùng **checkbox**, dropdown dành cho các dạng ghép. Một câu chọn nhiều chiếm nhiều số câu liên tiếp (ví dụ "Choose FIVE letters" ở câu 5-9 là một nhóm checkbox, giới hạn chọn 5, mỗi chữ cái đúng 1 điểm). Trong file import, đó là một dòng ở sheet Questions với `question_no`=5, `question_no_to`=9, và `correct_answer` ở sheet Answers ghi `B|D|E|F|H`.

**Ràng buộc kiểm tra khi import (UC24), chốt 2026-10-20:** với MCQ_MULTI và LIST_SELECT, số lựa chọn phải nhiều hơn số đáp án đúng, và số đáp án đúng phải bằng số câu mà dòng đó chiếm (`question_no_to` - `question_no` + 1). Ví dụ câu 5-9 chọn 5 thì options ít nhất 6 và `correct_answer` đúng 5 chữ cái, không trùng. Giao diện làm bài cũng giới hạn số lượt chọn bằng số câu đó.

## 2. Cấu hình mỗi câu hỏi (gợi ý cho cột/JSON `config`)

- `word_limit` (cho completion/short answer): ví dụ 1, 2, 3 từ; cờ `allow_number` (AND/OR A NUMBER).
- `options`: danh sách lựa chọn có nhãn (radio, checkbox, dropdown).
- `select_count`: số đáp án cần chọn (MCQ_MULTI, LIST_SELECT).
- `option_reuse`: lựa chọn có được dùng lại không (false cho MATCH_HEADING, MATCH_ENDING; true cho MATCH_INFO, MATCH_FEATURE).
- `word_bank`: khung từ (SUMMARY_BOX).
- `image_file` và vị trí điểm nhãn (MAP_LABEL, DIAGRAM_COMP).
- `audio_file` và đoạn thời gian (Listening).

## 3. Quy tắc chấm đề xuất

- Chuẩn hóa trước khi so: bỏ khoảng trắng đầu/cuối, không phân biệt hoa thường, gộp khoảng trắng thừa.
- So với `correct_answer` và từng giá trị trong `accepted_answers` (ngăn bằng `|` trong file import).
- Vượt `word_limit` thì sai (đúng như luật thi); từ gạch nối tính 1 từ.
- Số viết bằng chữ hoặc chữ số: chỉ chấp nhận dạng nằm trong `accepted_answers`.
- Chính tả sai là sai, không có điểm một phần.
- Câu bỏ trống tính là không đúng.

## 4. Điểm còn mở

1. Danh sách mã dạng câu hỏi trên có đủ không (các nguồn gộp/tách khác nhau).
2. Dạng kéo-thả (drag and drop) cho matching: MVP dùng dropdown cho đơn giản.

Đã xử lý 2026-10-20: tính điểm theo từng đáp án (chốt), file xlsx mẫu đã dùng đủ 20 mã `question_type` và có thêm cột `question_no_to` cho câu chọn nhiều đáp án.
