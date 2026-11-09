# 15. Flow làm bài (Practice / Real Test)

Cập nhật 09/11/2026. Nguồn quyết định: Claude Doc "Kế hoạch UI flow làm bài" (https://claude.ai/artifact/FAsbkZKzuVu7B9wgLweb4A), người dùng chốt qua comment ngày 09/11. Giao diện: canvas bản 237 (https://claude.ai/artifact/BbGeNht7gcmTF2YWJcEF2V), bản sao ở [ui/canvas/](ui/canvas/). Speaking chưa có draft nên giữ nguyên.

## 1. Lối vào (người học đã đăng nhập)

- **Bộ đề → đề → kỹ năng**: FullTests hoặc Landing → ExamDetail. Mỗi đề hiện đủ 4 kỹ năng; bấm "Làm bài" ở ô kỹ năng nào thì mở StartTestDialog cho kỹ năng đó.
- **Đề theo kỹ năng** (ví dụ "IELTS Recent Actual Tests · Test 1 · Listening"): hiện thành thẻ ở Landing và tab kỹ năng của Thư viện đề; bấm "Làm bài" là vào StartTestDialog rồi làm luôn, không qua ExamDetail.
- **Question Group** (bài tập nhỏ, trang Listening/Reading Practice trong PracticeLibrary): là bài tập riêng bên ngoài đề thi, vào thẳng màn làm bài, không qua StartTestDialog.
- **Khách bấm Làm bài**: sang Login (tweak `lyDo` hiện dải "Đăng nhập để làm …"), đăng nhập xong quay lại đúng đề và mở sẵn StartTestDialog.

## 2. Chế độ làm bài

| | Practice | Real Test |
|---|---|---|
| Phạm vi | Chọn Part/Section/Passage (Writing: một Task) | Trọn kỹ năng (Writing: 2 Task) |
| Đồng hồ | Đếm lên | Đếm ngược (Reading/Writing 60 phút, Listening theo audio); còn 5 phút thì chip đồng hồ đổi màu cảnh báo |
| Kết quả | Chỉ số câu đúng, thời gian đã làm, phần đã làm; không band | Có band |
| Listening | Play/pause, lùi/tiến 5 giây, kéo thanh, tốc độ 0.75/1/1.25/1.5×; xem transcript sau khi nộp | Audio tự phát một lần, không dừng/tua |

Thoát (Lưu và thoát) hoặc mất kết nối: **đồng hồ dừng ở cả hai chế độ**, làm tiếp thì chạy tiếp từ thời gian còn lại. Hộp "Đã hết giờ" chỉ xảy ra khi đang làm Real Test.

## 3. Màn làm bài

- **TestTopbar** (một thanh duy nhất cho mọi màn làm bài): logo, đường dẫn và tên đề, chip chế độ, trạng thái lưu (Đã tự lưu / Mất kết nối, đang lưu trên máy / Đang đồng bộ), đồng hồ, nút "Aa" (cỡ chữ 90% đến 150%, công tắc Sáng/Tối), riêng Reading có công cụ Con trỏ / Highlight (kèm chọn màu) và nút mở cột Highlight; "Lưu và thoát", "Nộp bài" (W/S: "Hoàn thành").
- **TestProgressBar** (thanh đáy): nhóm theo Passage/Section, ô số câu (đã trả lời, đang xem, chưa làm), cờ "Xem lại" ở góc ô; bấm ô nhảy tới câu.
- **Reading**: mặc định chia đôi bài đọc và câu hỏi. Highlight và ghi chú gộp một: mỗi highlight kèm một ô ghi chú tùy chọn. Công cụ Highlight: bôi là tô ngay; Con trỏ: bôi hiện popover "Highlight", bấm đoạn đã tô hiện Ghi chú / Đổi màu / Xóa. Cột Highlight bên phải (mặc định đóng) liệt kê thẻ đoạn trích + ghi chú, bấm thẻ cuộn tới vị trí; có trạng thái trống 2 bước hướng dẫn. Highlight được lưu khi Làm tiếp.
- **Listening**: như Reading (không highlight), AudioPlayer theo chế độ; Practice chỉ hiện Section đã chọn.
- **Writing**: Notes (dàn ý) ngay dưới đề bài, riêng từng Task, lưu cùng bài; giấy kẻ dòng; word count chỉ hiện số từ, không đổi màu.
- **Nộp khi chưa xong**: hộp xác nhận liệt kê câu chưa làm và câu còn gắn cờ (bấm để quay lại); xác nhận thì chấm như bình thường, hủy thì làm tiếp nếu còn giờ.
- **Tạm lưu**: Landing có khối "Bài làm gần đây", bài đang làm dở xếp trước (chip chế độ, x/40 câu, còn bao nhiêu phút hoặc đã làm bao lâu, nhãn "Lưu trên máy, chưa đồng bộ" khi offline), nút "Làm tiếp".

## 4. Màu highlight và chế độ tối

| Màu | Nền sáng | Nền tối | Vạch / chấm |
|---|---|---|---|
| Vàng (mặc định) | `#FCE8A6` | `#5C4A14` | `#E0B323` |
| Xanh lá | `#CDEBD5` | `#234A33` | `#3E9A63` |
| Xanh dương | `#D3E2FB` | `#24395E` | `#3B6FD8` |
| Hồng | `#F9D5DE` | `#5A2735` | `#D2577A` |
| Tím | `#E2DAF8` | `#3B3166` | `#7A63D1` |

Chữ trên highlight giữ màu chữ thường; tương phản 10.5 đến 11.6 (sáng), 7.7 đến 10.6 (tối).

Sáng/Tối trong lúc làm bài chỉ áp cho vùng làm bài, dùng bảng tối có sẵn ở `DESIGN.md` mục 1 (`dark-palette.json`), lưu khóa riêng (đề xuất `ieltspace-test-theme`), không ghi `ieltspace-app`.

Cỡ chữ bài đọc/câu hỏi gốc 15px; 90/100/110/120/130/140/150% = 14/15/16/18/20/21/22px. Đây là ngoại lệ của thang cỡ chữ, khi code cần ghi vào `DESIGN.md` mục 7.

## 5. Màn trên canvas (bản 237)

| Màn | Thay đổi | Tweaks |
|---|---|---|
| StartTestDialog (mới) | Chọn Practice/Real Test, tick phần, "Bắt đầu" | `skill`, `cheDo` |
| TestTopbar (mới, component) | Thanh trên chung | (props từ màn cha) |
| TestProgressBar (mới, component) | Thanh đáy chung | (props từ màn cha) |
| ReadingTest | Topbar, highlight + ghi chú, cột Highlight, cờ, progress | `cheDo`, `coChu`, `toi`, `congCu`, `cotHighlight`, `trongHighlight`, `hienPopover` |
| ListeningTest | AudioPlayer 2 chế độ, cờ, progress | `cheDo`, `coChu`, `toi` |
| WritingTest | Notes dưới đề, giấy kẻ dòng, word count trung tính | `cheDo`, `task`, `toi`, `coChu` |
| SubmitDialogs | Liệt kê câu thiếu + câu gắn cờ, biến thể Listening/Practice, hộp mất kết nối, toast, câu chữ "Lưu và thoát?" mới | |
| ResultLR | Practice không band; transcript Listening | `cheDo`, `kyNang` |
| ExamDetail | "Làm bài" ở ô kỹ năng → StartTestDialog | |
| StudentLanding | Bài dở xếp trước, thẻ đề theo kỹ năng → StartTestDialog | |
| Main, Login, LoginForm | Khách bấm Làm bài → Login; dải lý do đăng nhập | `lyDo` |

## 6. Điểm còn mở

- Notes của Writing có gửi kèm cho giáo viên không (đề xuất: không, chỉ lưu cùng bài).
- Trang Listening/Reading Practice (PracticeLibrary) hiện vẫn là Question Group; nếu tab kỹ năng của Thư viện đề cần liệt kê đề theo kỹ năng thì phải thêm danh sách đó.
- Link sang StartTestDialog trên canvas không mang theo kỹ năng; khi code, truyền qua `sessionStorage` khóa `ieltspace-attempt` (đề, kỹ năng, chế độ, phần), và `ieltspace-return` cho đề cần quay về sau đăng nhập.
- Speaking: chờ draft.
