# 06. Nhập liệu bằng xlsx (UC23, UC24)

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án, đặc tả setup repo.

## 1. Quyết định

- Chốt **xlsx**, không dùng CSV hay JSON (CSV lỗi font tiếng Việt trong Excel, khó biểu diễn dữ liệu nhiều cấp và văn bản dài).
- Nhập nằm **ngay trong editor từng kỹ năng** (đổi hướng 27/10). Trang nhập riêng AdminImport đã bỏ.
- Ở trang Thông tin bộ đề, ô của từng kỹ năng có nút "Nhập xlsx" mở editor kỹ năng đó với hộp nhập đã mở sẵn.

## 2. Quy tắc chung

- Một file nhiều sheet, các sheet nối bằng cột mã (`part_code`, `group_code`, `question_code`...).
- Nhiều giá trị trong một ô ngăn bằng `|`.
- Câu chọn nhiều đáp án là 1 dòng có `question_no` và `question_no_to`, đáp án dạng `A|C|E`.
- Audio và ảnh tải riêng lên Storage; ô trong xlsx chỉ ghi tên tệp.
- Kiểm tra toàn file, báo lỗi theo sheet, dòng, cột. **Có lỗi thì không lưu gì.**
- Tệp hỏng hoặc chưa kiểm tra xong: một thông báo chung ở bước 3, không cần bảng lỗi (gộp UC24 E1/E2, góp ý 27/10). Cách nhận tệp hỏng trên canvas: đọc 2 byte đầu "PK".

## 3. Luồng trong editor

Tải mẫu → chọn tệp → kiểm tra (5 mục) → báo lỗi hoặc xem trước → "Đổ vào đề". Đổ vào đề đưa editor sang chế độ Chỉnh sửa chưa lưu, có Hoàn tác. Nút "Nhập từ xlsx" có cả ở chế độ xem, chế độ sửa và khi đề còn trống.

Những gì vẫn phải làm trong editor sau khi nhập: vị trí nhãn trên hình, bảng gộp ô, bôi key phrase.

## 4. Mẫu theo kỹ năng

Các tệp mẫu nằm trong thư viện dự án `import-templates/`, sinh bằng script Python cùng thư mục.

| Kỹ năng | Tệp | Sheet |
|---|---|---|
| Reading | `ielts-reading-template.xlsx` (`make_template_reading.py`) | De_thi, Passages, Paragraphs, Groups, Questions, Danh_muc |
| Listening | `ielts-listening-template.xlsx` (`make_template_listening.py`) | De_thi, Sections (audio_file, duration), Transcript (start_time), Groups, Questions (transcript_label), Danh_muc |
| Writing | `ielts-writing-template.xlsx` (`make_template_ws.py`) | De_thi, Tasks (prompt, image_file) |
| Speaking | `ielts-speaking-template.xlsx` (`make_template_ws.py`) | De_thi (part13_minutes), Part1, Part2 (prep, speak, cue_card), Part3 |

- Mẫu Reading không có cột `set_code` hay `skill` (đề đã nằm trong bộ và kỹ năng đang mở).
- Hộp nhập Listening nhận cả tệp ghi âm.
- Hai mẫu chung cũ `ielts-import-template.xlsx` và `-v2.xlsx` đã xóa 27/10. `make_template_v2.py` còn giữ nếu cần sinh lại.

## 5. Bài mẫu và từ vựng

- Bài mẫu: theo thiết kế ban đầu là sheet phẳng `Bai_mau` (Writing và Speaking, cột `audio_file` cho audio mẫu Speaking). `sample_type` là đề xuất, chưa duyệt.
- Trên giao diện, trang Quản lý bài mẫu có nút "+ Nhập bài" ở mỗi nhóm.
- Từ vựng: chưa có hộp nhập và màn Quản lý từ vựng (UC22).

## 6. Còn thiếu so với đặc tả

- Màn lịch sử nhập (lô, thời gian, kết quả) của UC23.
- UC23 E2/E3, UC24 dòng lỗi BR5 chưa thể hiện đủ trên giao diện.
