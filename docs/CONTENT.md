# Mục lục tài liệu IELTSpace

Đây là điểm bắt đầu để hiểu nền tảng hỗ trợ học tập và ôn luyện IELTS. Nội dung được tách từ báo cáo Đồ án 1, giữ nguyên câu chữ; các quyết định người dùng đã chốt nằm trong `decisions/`.

## Thứ tự đọc trước khi code

1. Đọc [PROJECT_SPEC.md](PROJECT_SPEC.md), [FEATURE.md](FEATURE.md) và [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md).
2. Đọc `product/` để nắm vai trò, phạm vi và thuật ngữ.
3. Đọc `requirements/` (yêu cầu Chương 1 và quy tắc Writing/Speaking Chương 3.4).
   Khi làm dữ liệu hoặc backend, đọc thêm [thiết kế cơ sở dữ liệu](architecture/DATABASE.md).
4. Đọc `architecture/` và `decisions/`.
5. Mở đúng tệp use case trong `use-cases/` cho chức năng sắp làm, kể cả sơ đồ hoạt động và tuần tự.
6. Khi làm giao diện, đọc [DESIGN.md](../DESIGN.md) ở gốc repo trước.
7. Chỉ code hành vi phụ thuộc vào một mục **Mở** trong `OPEN_QUESTIONS.md` sau khi mục đó được chốt.

## Nguyên tắc khi tài liệu lệch nhau

Theo [PDR-001](decisions/PDR-001-nguon-chuan-khi-cac-chuong-lech.md): Chương 3 thắng Chương 1; Chương 2 thắng Chương 1 về công nghệ; quyết định trong `decisions/` thắng câu chữ báo cáo cũ. Khi sửa nội dung ở đây, cập nhật lại bản Word tương ứng (xem [SOURCE_MAP.md](SOURCE_MAP.md)).

## Tài liệu hiện hành

| Khu vực | Mục đích |
| --- | --- |
| [PROJECT_SPEC.md](PROJECT_SPEC.md) | Bức tranh tổng thể: mục tiêu, người dùng, phạm vi, cấu trúc nghiệp vụ. |
| [FEATURE.md](FEATURE.md) | Danh mục 35 use case theo tác nhân, liên kết tới đặc tả. |
| [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) | Các điểm chưa chốt hoặc câu chữ báo cáo cần sửa. |
| [STRUCTURE.md](STRUCTURE.md) | Bản đồ thư mục tài liệu. |
| [SOURCE_MAP.md](SOURCE_MAP.md) | Bảng đối chiếu mục báo cáo → tệp, kèm bản Word nguồn. |
| `product/` | Tầm nhìn, khảo sát, hệ thống đề xuất, phạm vi, vai trò, thuật ngữ (Chương 1). |
| `requirements/` | Yêu cầu chức năng, dữ liệu, giao diện/phần cứng/phần mềm, phi chức năng (Chương 1); quy tắc Writing/Speaking (Chương 3.4). |
| `architecture/` | Kiến trúc, module backend, luồng xử lý, bảo mật và triển khai (Chương 3.1–3.5); công nghệ (Chương 2); thiết kế cơ sở dữ liệu ([DATABASE](architecture/DATABASE.md), từ `CSDL.docx`). |
| `use-cases/` | Tổng quan và 35 tệp đặc tả UC01–UC35 kèm sơ đồ (Chương 3.6). |
| `decisions/` | Quyết định đã được người dùng xác nhận, kèm lý do và hệ quả. |
| `assets/` | Hình trích từ báo cáo (`ch1/`, `ch3/`), đặt tên theo số hình. |
