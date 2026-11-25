# Ý định: trang làm bài Speaking và bộ chọn thời gian dùng chung

Trạng thái: đã được người dùng xác nhận qua phỏng vấn (2026-11-25). Spec chi tiết ở [speaking-test-spec.md](speaking-test-spec.md).

## Mục tiêu
Trang làm bài Speaking có hai chế độ (Thi thật, Practice) và một component chọn thời gian dùng chung cho các bài luyện tập.

## Người dùng
Người học (`LEARNER`) ghi âm và nộp bài. Giáo viên chấm.

## Speaking, Thi thật
- Test mic và nghe lại. Mic chưa ổn thì chưa vào làm bài.
- Part 1, Part 2, Part 3; mỗi lần hiện một câu. Xem câu hỏi 5 giây, sau đó hệ thống tự ghi âm. Nói xong thì người học bấm sang câu kế. Không cho ghi âm lại.
- Luật chặt khi vào lại bài (F5, đóng tab, rời đi): câu Part 1/3 đang làm dở không làm lại; có bản ghi dở thì giữ làm đáp án, chưa có thì để trống, rồi sang câu kế. Câu đã có bản ghi không bao giờ bị mở lại để ghi đè (kể cả khi Part 2 mất bản ghi và phải làm lại từ phần chuẩn bị). Part 2 đã qua chuẩn bị và đang ghi dở cũng chặt như Part 1/3 (giữ bản ghi dở làm đáp án hoặc để trống, rồi sang câu kế); chỉ Part 2 còn ở bước chuẩn bị mới quay về phần chuẩn bị.
- Part 2 có 1 phút chuẩn bị, tính trong tổng 15 phút. Một đồng hồ đếm ngược 15 phút cho cả bài, người học tự phân bổ.
- Hết giờ: lấy bản ghi âm dở, báo cho người học, hỏi có lưu bài không.
- Lưu: sang trang xác nhận hoàn thành, nơi người học chọn gửi Giáo viên chấm. Không lưu: hủy bài, xóa ghi âm, về trang trước.

## Speaking, Practice
- Được ghi âm lại câu đã trả lời. Người học tự bấm ghi âm khi sẵn sàng. Part 2 có thể bỏ qua phần chuẩn bị.
- Vào lại bài: câu đang nói dở (chưa có bản ghi) về đầu câu, được làm lại.
- Người học chọn mức thời gian: không giới hạn (mức sàn), 15, 20, 25, 30 phút (mức trần).

## Component chọn thời gian dùng chung
- Speaking: không giới hạn đến 30 phút (15-20-25-30).
- Reading, từng section: không giới hạn đến 20 phút mỗi section; các mức giữa 10-15-20.
- Reading, nhiều section: mức trần là 20 phút nhân số section.
- Reading, full test: cố định 60 phút, không cho chọn.
- Listening: không có bộ chọn, thời gian theo audio.
- Component phụ trách: bộ chọn mức, đồng hồ trong lúc làm, hộp thoại "hết giờ, có lưu bài không".

## Thời gian hoàn thành
Ghi ở mọi chế độ và kỹ năng, kể cả "không giới hạn". Hiển thị cho người học và Giáo viên. Tính cả thời gian chuẩn bị Part 2 và thời gian bị gián đoạn (đồng hồ vẫn chạy).

## Sự cố mạng và an toàn dữ liệu
- Mất mạng hoặc gián đoạn: bài vẫn chạy, không hiện hộp thoại offline ở Speaking. Một dải nhắc (ConnectionNotice) thay hộp đó: "không tắt màn hình, không chuyển trang", trạng thái mạng; hiện cả lúc kiểm tra micro và lúc đang khôi phục bài. Nếu trình duyệt không lưu được bản ghi lên máy thì dải nhắc cảnh báo bản ghi chỉ tạm trong bộ nhớ, sẽ mất khi tải lại.
- Khi vào lại: Thi thật: câu đang ghi dở (kể cả Part 2 đã qua chuẩn bị) được đóng rồi sang câu kế, chỉ Part 2 còn ở bước chuẩn bị mới về bước chuẩn bị. Practice: Part 2 về bước chuẩn bị, Part 1 và 3 về đầu câu.
- Lưu bền: bản ghi âm đã thu lưu trên máy người học (IndexedDB); có mạng lại thì tải lên. Phần đã thu xong trước điểm gián đoạn được giữ.
- Bài làm dở của cả 4 kỹ năng (draft) lưu ở localStorage, hạn 24 giờ kể từ lần lưu cuối; hết hạn thì bỏ draft và bản ghi âm kèm theo. Speaking tự lưu mỗi khi vị trí hoặc bản ghi đổi và khi rời trang, nên F5 hay đóng tab không lách được luật Thi thật. Đăng xuất xóa draft và bản ghi của người dùng trên máy, và các tab đang làm bài ngừng ghi lại.
- Trang chi tiết bộ đề: có bài làm dở thì nút đổi thành "Tiếp tục làm bài". Speaking đã hết giờ mà chưa lưu thì dòng thông tin ghi "đã hết giờ, chưa lưu" (nút vẫn là "Tiếp tục làm bài").
- Backend (làm sau): phải lưu thời điểm bắt đầu lượt làm ở máy chủ để chặn việc sửa localStorage kéo dài thời gian hoặc làm lại câu; frontend không đáng tin cho giờ làm bài.

## Lịch sử luyện tập (Writing/Speaking)
- Mỗi hàng Speaking có menu ba chấm gom "Nghe lại" (hộp liệt kê từng câu kèm trình phát) và "Tải ghi âm" (tải tất cả về một file .zip), cùng một nút chính theo trạng thái: "Gửi yêu cầu chấm" (chưa gửi), "Xem kết quả" (đã công bố), "Gửi lại yêu cầu" (đã hủy).
- Các trạng thái hiển thị: đã lưu chưa gửi chấm, chờ phân công, đang chấm, đã có kết quả, đã hủy, tạm giữ, nội dung đã hết hạn (điểm đã công bố vẫn được giữ).
- Nút "Gửi yêu cầu chấm" và "Xem kết quả" chờ phần lượt chấm do thành viên khác làm (xem docs/PROGRESS/2026-11-25-speaking-ban-giao.md).

## Sau khi gửi
Bài vào hàng chờ chấm của Giáo viên theo luật lượt chấm W/S. Người học nhận thông báo, xem điểm tổng và điểm 4 tiêu chí (Fluency, Lexical, Grammar, Pronunciation), nghe lại từng câu và đọc nhận xét.

## Nguyên tắc code
Gói code thành component dùng chung nếu có thể (ví dụ trang chọn chế độ làm bài là một component).

## Ngoài phạm vi
Chấm bằng AI (làm sau), nói trực tiếp với giám khảo, đồng bộ bài làm dở giữa nhiều máy (draft chỉ nằm trên máy đã làm), trang cài đặt Admin (các số đặt thành hằng số trong code).
