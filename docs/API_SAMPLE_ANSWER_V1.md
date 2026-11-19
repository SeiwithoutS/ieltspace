# API bài mẫu v1

SAMPLE-01 đến đợt 5. Base URL local `http://localhost:3001/api`. Frontend dùng `apiFetch` với đường dẫn dưới đây và bỏ tiền tố `/api` vì client đã ghép base URL.

## Các route

| Method và URL | Quyền | Đầu vào → kết quả |
|---|---|---|
| GET /api/admin/samples | ADMIN | Bộ lọc và phân trang → `{samples, pagination}`. Thẻ lấy metadata bản nháp. |
| POST /api/admin/samples | ADMIN | `{document}` → 201 `{sample}` với UUID, DRAFT và revision 1. |
| GET /api/admin/samples/{id} | ADMIN | UUID bài → `{sample}` chứa document nháp. |
| PUT /api/admin/samples/{id}/draft | ADMIN | `{revision, document}` → `{sample}` với revision mới. |
| POST /api/admin/samples/{id}/publication | ADMIN | `{revision, action}` với PUBLISH, HIDE hoặc RESTORE → `{sample}`. |
| POST /api/admin/samples/{id}/assets?kind=…&originalName=… | ADMIN | Bytes tệp → 201 `{asset}`. |
| GET /api/admin/samples/{id}/assets/url?path=… | ADMIN | Path đã đăng ký cho bài → `{url, expiresAt}`. |
| POST /api/admin/samples/import/preview | ADMIN | `{schemaVersion: 1, fileName, sheets}` → `{canConfirm, dataRows, issues, samples}`. |
| POST /api/admin/samples/import/confirm | ADMIN | `{requestKey, workbook}` → 201 `{requestKey, replayed, createdCount, samples}`. Gửi lại cùng yêu cầu → 200. |
| GET /api/samples | Công khai | Bộ lọc và phân trang → `{samples, pagination}` chỉ gồm bài PUBLISHED. |
| GET /api/samples/{id} | Công khai | `{sample: {id, publishedRevision, publishedAt, document}}` đọc snapshot đã công bố. Bài nháp/ẩn trả 404. |
| GET /api/samples/{id}/assets/url?path=… | Công khai | Path thuộc snapshot PUBLISHED hiện tại → `{url, expiresAt}`. |

Admin gửi `Authorization: Bearer <access_token>`. Backend lấy `created_by` và `updated_by` từ hồ sơ xác thực. Hai router đặt `Cache-Control: no-store` để lượt đọc sau phản ánh trạng thái mới.

Query danh sách gồm `page` (mặc định 1), `pageSize` (mặc định 20, tối đa 100), `q` (tìm chuỗi trong tiêu đề hoặc chủ đề, không phân biệt hoa thường), `skill`, `sampleType` và `topic` (khớp đúng). Admin có thêm `status`. `pagination` gồm `page`, `pageSize`, `total`, `totalPages`. Thẻ có `id,title,skill,sampleType,topic,band,cover,publishedAt`. Thẻ admin có thêm `status,revision,draftUpdatedAt,hasUnpublishedChanges`.

## Ví dụ tạo một nháp

```http
POST /api/admin/samples
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "document": {
    "schemaVersion": 1,
    "title": "Learning at home",
    "topic": "Education",
    "source": "",
    "band": 8,
    "cover": null,
    "outlineIntro": "",
    "outline": "",
    "skill": "WRITING",
    "sampleType": "WRITING_TASK_2",
    "form": "ACADEMIC",
    "task": 2,
    "writingType": "agree",
    "prompt": "Online classes are as effective as classroom teaching. To what extent do you agree?",
    "promptImage": null,
    "essay": "A sample essay goes here.",
    "translation": ""
  }
}
```

Phản hồi admin theo kiểu `AdminSampleDetail` trong [hợp đồng v1](../frontend/src/lib/sample-types.ts). Với nháp mới, `revision=1`, `status=DRAFT`, `publishedRevision=null`, `publishedAt=null`, `hasUnpublishedChanges=true` và `document` là tài liệu đã validate. Khi chỉnh, gửi toàn bộ document cùng revision mới nhất. Phát hành nội dung đã lưu bằng `{"revision":1,"action":"PUBLISH"}` nếu đang ở revision 1. UI lưu nội dung đang sửa trước khi gửi yêu cầu công bố.

Lưu nháp sau khi đã công bố giữ snapshot cũ. HIDE tăng revision và loại bài khỏi thư viện. RESTORE tăng revision và hiện lại đúng snapshot gần nhất, giữ ngày công bố. `hasUnpublishedChanges` so sánh nội dung, nên riêng HIDE hoặc RESTORE không làm xuất hiện thay đổi nháp.

## Ảnh và audio

Tạo nháp để có UUID, rồi tải tệp vào đúng bài. Endpoint nhận bytes thô với `Content-Type` của tệp. Mã hóa `originalName` và `path` khi đưa chúng vào query string. `kind` nhận `cover`, `prompt-image` hoặc `audio`. Giới hạn ảnh JPEG, PNG và WebP là 5 MiB. Giới hạn audio MP3, WAV và M4A là 50 MiB.

Trong editor Writing và Speaking, mục **Ảnh đại diện bài mẫu** dùng `kind=cover`. Khi thêm bài mới, nhập tiêu đề và chọn ảnh để editor tạo nháp lấy UUID rồi tải ảnh. Bấm **Lưu** để giữ ảnh trong nháp hoặc **Công bố** để cập nhật ảnh trên thẻ thư viện. Nút **Gỡ ảnh** xóa liên kết ảnh trong nội dung đang soạn.

```http
POST /api/admin/samples/{id}/assets?kind=prompt-image&originalName=chart.png
Authorization: Bearer <access_token>
Content-Type: image/png

<bytes của tệp>
```

`asset` gồm `bucket`, `path`, `originalName`, `mimeType` và `sizeBytes`. Client gắn metadata vào `cover`, `promptImage` hoặc `items[].audio`, rồi lưu nháp bằng `PUT /draft`. Upload giữ nguyên revision. Tệp có thể xem trước ngay bằng route admin. Backend kiểm tra MIME và cấu trúc cơ bản của tệp trước khi đăng ký media. Writing Task 1 Academic cần ảnh đề hợp lệ khi công bố. Backend kiểm tra bài, loại media, trạng thái và metadata trong `sample_media_assets` khi lưu hoặc phát hành.

`STORAGE_BUCKET_SAMPLE_ASSETS` mặc định là `sample-assets`, một bucket private trên cùng Supabase với backend. URL ký hạn 5 phút và chỉ được cấp khi có quyền. HIDE và việc thay media trong snapshot chặn cấp URL công khai mới cho tệp cũ. URL đã cấp có thể dùng tới khi hết hạn. Tệp được giữ khi thay/gỡ tham chiếu để bản công bố cũ hoặc thao tác hoàn tác vẫn dùng được. Chưa có tác vụ dọn tệp định kỳ. Nếu upload xong mà ghi bảng đăng ký thất bại, backend thử xóa object vừa tạo.

## Nhập Excel

Trong **Quản lý bài mẫu**, tải mẫu, thay các dòng minh họa, chọn tệp, bấm **Kiểm tra tệp** rồi **Xác nhận nhập**. File `.xlsx` gồm `Hướng dẫn`, `Writing` và `Speaking`. Có thể để một sheet dữ liệu chỉ có tiêu đề. Đường tải từ frontend là `/templates/sample-answers-v1.xlsx`. [Tệp mẫu](../frontend/public/templates/sample-answers-v1.xlsx)

| Sheet | Header dòng 1 theo đúng thứ tự |
|---|---|
| Writing | `sample_key,title,sample_type,form,topic,band,source,writing_type,prompt,outline_intro,outline,essay,translation` |
| Speaking | `sample_key,title,sample_type,topic,band,source,outline_intro,outline,item_order,question,answer` |

`Writing` dùng một dòng cho mỗi bài. `Speaking` dùng một dòng cho mỗi câu. Các dòng chung `sample_key` phải có metadata bài giống nhau, với `item_order` liên tiếp từ 1. Part 2 có đúng một câu. Công thức và ô gộp bị chặn trong hai sheet dữ liệu. Mỗi file tối đa 5 MiB, 500 dòng dữ liệu và 100 bài. API nhận JSON UTF-8 chưa nén tối đa 1 MiB. Các dòng trống ở giữa được giữ vị trí để báo đúng địa chỉ ô.

- **Preview.** `workbook` có `schemaVersion: 1`, `fileName` và `sheets: { Writing: string[][], Speaking: string[][] }`. Cả hai mảng bắt đầu bằng dòng header. Ô trống biểu diễn bằng chuỗi rỗng. Trình duyệt đọc XLSX thành bảng, backend kiểm tra lại bảng. `issues[]` gồm `sheet`, `row` (từ 1), `column`, `field`, `severity` và `message`. Các lỗi `ERROR` chặn nhập. Các mục `WARNING` nhắc nội dung còn thiếu để công bố. `samples[]` gồm `sampleKey`, `title`, `sampleType` và `itemCount`. [Payload mẫu](../backend/tests/fixtures/sample-import-v1.json)
- **Confirm.** Gửi cùng `workbook` vào endpoint confirm với UUID `requestKey` sinh cho lần xác nhận. Server kiểm tra và tạo tất cả bài ở `DRAFT`, revision 1, trong một giao dịch cùng biên nhận ở `sample_import_receipts`. `samples[]` trong kết quả gồm `sampleKey`, `id`, `skill` và `status`. Gửi lại cùng UUID, cùng nội dung bảng và cùng admin trả các ID đã tạo. Nếu khác nội dung hoặc admin, API trả `409`. Khi lỗi mạng trong bảng nhập, bấm **Xác nhận nhập** lại để UI gửi cùng khóa. Chọn tệp và kiểm tra lại bắt đầu một lần nhập mới.
- **Sau khi nhập.** Mở bản nháp để chỉnh nội dung hoặc tải ảnh/audio, rồi công bố theo quy trình thường. Excel tạo bài mới và để media trống. Writing Task 1 Academic cần bổ sung ảnh đề trong editor trước khi công bố.

## Lỗi và phạm vi tích hợp

| HTTP | Code | Ý nghĩa |
|---|---|---|
| 400 | SAMPLE_INVALID_ID | ID không phải UUID. |
| 400 | SAMPLE_VALIDATION_ERROR | Body/query sai. `details.issues` chứa `path: (string\|number)[]` và `message`. |
| 400 | SAMPLE_PUBLICATION_INVALID | Bản nháp chưa đủ trường công bố. `details.issues` chỉ vị trí cần sửa. |
| 400 | SAMPLE_ASSET_REQUIRES_SAVED_SAMPLE | Yêu cầu tạo nháp ban đầu có tham chiếu media. Tạo nháp trước khi upload. |
| 400 | SAMPLE_ASSET_EMPTY / SAMPLE_ASSET_INVALID | Tệp rỗng hoặc metadata sai, sai bài, sai loại hay tệp chưa sẵn sàng. |
| 400 | SAMPLE_IMPORT_INVALID / SAMPLE_IMPORT_LIMIT | Confirm có ô lỗi (`details.issues`) hoặc vượt số dòng/số bài cho một lần nhập. |
| 401 / 403 | Mã của middleware Auth | Thiếu phiên, hồ sơ không hợp lệ hoặc không có quyền ADMIN. |
| 404 | SAMPLE_NOT_FOUND | ID không có hoặc bài chưa công khai. |
| 404 | SAMPLE_ASSET_NOT_FOUND | Tệp không có hoặc người gọi chưa có quyền lấy URL ký. |
| 409 | SAMPLE_REVISION_CONFLICT | `details` có `expectedRevision` và `currentRevision`. Giữ dữ liệu đang nhập để xử lý xung đột. |
| 409 | SAMPLE_INVALID_TRANSITION | HIDE/RESTORE sai trạng thái. |
| 409 | SAMPLE_IMPORT_REQUEST_CONFLICT | Mã yêu cầu đã được dùng cho dữ liệu hoặc người quản lý khác. |
| 413 | SAMPLE_ASSET_TOO_LARGE | Tệp vượt giới hạn của loại media. |
| 413 | SAMPLE_DOCUMENT_TOO_LARGE | JSON tạo/lưu nháp vượt 24 MiB, hoặc request công bố vượt 1 MiB. |
| 413 | SAMPLE_IMPORT_TOO_LARGE | Request JSON nhập Excel vượt 1 MiB. |
| 415 | SAMPLE_ASSET_TYPE / SAMPLE_ASSET_ENCODING | MIME hoặc dấu hiệu định dạng sai, hoặc request gửi body nén. |
| 415 | SAMPLE_IMPORT_TYPE | Kiểu dữ liệu hoặc cách mã hóa request nhập Excel sai. |
| 503 | SAMPLE_STORAGE_UNAVAILABLE | Bucket riêng chưa sẵn sàng hoặc Storage không thể xử lý upload/cấp URL. |

Client gửi nội dung Markdown hoặc văn bản. Giao diện tắt HTML thô và lọc URL khi render.
