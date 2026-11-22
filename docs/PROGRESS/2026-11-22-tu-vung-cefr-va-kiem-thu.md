# Tiến độ và kiểm thử từ vựng CEFR ngày 22/11/2026

## Phạm vi và trạng thái

Rà soát phần thêm cấp độ CEFR, nhập tệp, hiển thị và lọc từ vựng, sắp xếp bộ từ, flashcard và ảnh từ vựng (RS-C03). Frontend và backend đã build. Luồng chính đã được kiểm thử trên Chrome và PostgreSQL cục bộ. Người dùng xác nhận lỗi cấu hình ảnh đã hết ở lần thử local của mình.

## Công việc đã thực hiện

- Cột `tag` tùy chọn nhận A1–C2. Quản lý có thể đổi hoặc bỏ cấp độ trong mục chỉnh sửa từ. API lưu thuộc tính này trong JSONB của nháp và mục đã công bố. D05 ghi lại việc bỏ các bảng nhãn cũ. Cấp độ CEFR thuộc từng mục từ.
- Mẫu Excel dùng tiêu đề tiếng Anh. Trình nhập nhận cả tiêu đề tiếng Anh và tiếng Việt. CSV UTF-8 hỗ trợ dấu phẩy, dấu chấm phẩy, BOM và trường có ngoặc kép. Đã sửa lỗi nhận dấu phân cách khi một tiêu đề phụ hợp lệ chứa xuống dòng trong ngoặc kép. Tiêu đề trùng, thiếu dữ liệu và CEFR sai được báo trước bước lưu.
- Bàn giao 14 bộ với 580 mục. Giữ nội dung của 400 mục gốc và soạn thêm 180 mục thuộc sáu chủ đề. Mỗi bộ có bản Excel và CSV cùng dữ liệu. Cấp độ trong bộ bàn giao là ước lượng theo nghĩa dùng trong ví dụ.
- Trong bộ công khai, nút **CEFR thấp → cao** sắp A1 đến C2, giữ thứ tự các từ cùng mức và đặt từ chưa gắn cuối danh sách. Bấm lại để về thứ tự gốc. Chọn cấp độ kết hợp được với ô tìm kiếm và cập nhật số kết quả. Khi đổi bộ, bộ lọc trở về mặc định. Thẻ từ và hai mặt flashcard hiển thị mức CEFR nếu có.
- Màn nhập hiện danh sách ngay khi đọc tệp, lưu nháp rồi mới tra ảnh và audio. Màn nhập, client và API tra media, phần lưu ảnh khớp bản trước đợt CEFR. Lịch gửi có khoảng cách 750 ms từ commit `67199ea`. Với 50 từ, 100 yêu cầu tra mất khoảng 74 giây từ yêu cầu đầu đến yêu cầu cuối. Nếu mỗi từ cần thêm một yêu cầu chọn ảnh, khoảng cách tăng lên khoảng 112 giây, chưa tính thời gian nguồn phản hồi.
- Lỗi “Chưa cấu hình kho ảnh từ vựng” ban đầu xảy ra trước khi ghi DB hoặc liên hệ R2 do thiếu `R2_VOCABULARY_BUCKET`. Sau khi người dùng thêm bucket dev, tiến trình Node mới đọc đủ biến và đi qua bước kiểm tra cấu hình. Backend local dùng cấu hình Supabase chính theo lần đối chiếu trong đợt này. API trên cổng 3001 phản hồi bình thường.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build frontend, typecheck và build backend | Local | Đạt. |
| Toàn bộ các tệp unit test frontend | Node.js | 21/21 đạt, gồm 4 ca nhập từ vựng. |
| Schema bản nháp, phân quyền, nguồn media và vòng đời ảnh | Express, PostgreSQL qua PGlite và R2 giả lập | 13/13 đạt. Hai ca HTTP ban đầu vướng `EACCES` từ terminal và đạt khi chạy lại bằng luồng HTTP trong bộ nhớ. Kiểm tra gồm thiếu phiên, sai vai trò, MIME, kích thước, lỗi kho, tải ảnh lên, URL ký, công bố và dọn ảnh. |
| Đọc CSV, Excel, xác thực nháp và xuất bản | Trình nhập của frontend, route backend và PGlite | Đọc được 28 tệp theo chủ đề và mẫu tải trên web. Đối chiếu 7 trường của cả 580 mục theo hai định dạng. Kiểm tra đủ 14 bộ từ lúc lưu nháp đến khi đọc bản công khai, gồm xung đột revision và thay đổi tag chưa công bố. |
| Công cụ CEFR cho Quản lý | Playwright trên Chrome, API giả lập | Lưu nháp trước khi tra media. Hai lần nhập cùng 5 từ có và không có tag đều gửi 15 yêu cầu trong khoảng 10,5 giây. Đổi tag sang C2 rồi xóa tag được lưu đúng và không phát sinh yêu cầu media. |
| Thư viện và flashcard | Playwright trên Chrome, API giả lập | Đạt sắp xếp, lọc kết hợp tìm kiếm, đổi bộ, trạng thái rỗng, bàn phím và Yêu thích. Đã lật hai mặt của thẻ có tag, qua thẻ chưa gắn và hoàn tất phiên. Bộ điều khiển CEFR không gây tràn ngang ở 375×812, 768×1024, 1366×768 và 667×375 với cả hai theme. |
| Kiểm tra cấu hình ảnh thật | Tiến trình Node mới và trình duyệt local ở lượt trước | Tiến trình mới vượt qua bước kiểm tra kho, API local trả `status: ok`. Yêu cầu S3 từ terminal trước đó bị chặn phân giải DNS. Bucket dev đã qua kiểm tra tải, đọc và xóa ảnh thử ngày 20/11. |

## Phần còn mở

- Đợt rà soát mã dùng R2 giả lập và dữ liệu thử. Chưa tự xác nhận một lần ghi ảnh thật lên R2 hoặc chạy trên bản triển khai.
- Tên bucket ảnh từ vựng dành cho môi trường chính vẫn cần xác nhận riêng khi triển khai.

## Bước tiếp theo

1. Dùng cấu hình kho đã xác nhận cho môi trường triển khai. Khi nghiệm thu, thử tải ảnh cho một mục từ, lưu nháp, mở lại và kiểm tra ảnh bên thư viện sau khi công bố.

## Tài liệu và cách tái hiện

- [Trình nhập CSV và Excel](../../frontend/src/lib/vocabulary/vocabulary-import.ts) và [unit test](../../frontend/tests/vocabulary-import.test.mjs).
- [Trang thư viện từ vựng](../../frontend/src/pages/vocabulary/Vocabulary.tsx) và [Excel mẫu](../../frontend/public/templates/mau-tu-vung.xlsx).
- [Kiểm thử schema và phân quyền](../../backend/tests/vocabulary-draft.test.mjs), [nguồn media](../../backend/tests/vocabulary-media.test.mjs) và [vòng đời ảnh](../../backend/tests/vocabulary-images.integration.mjs).
- [Thiết lập ảnh từ vựng](../KIEN_TRUC_TU_VUNG.md) và [kiểm tra R2 ngày 20/11](2026-11-20-tong-hop-phan-3.md#anh-tu-vung-r2-dot-3).
