# Tiến độ cấu trúc CSDL ngày 11/11/2026

## Phạm vi và trạng thái

Đã viết từ điển dữ liệu, tệp tạo mới và tệp nâng cấp từ 01 cũ. Đã thử cục bộ bằng PostgreSQL đóng gói trong PGlite. Chưa áp dụng lên database Supabase đang sử dụng.

## Công việc đã thực hiện

- Đối chiếu 41 bảng của 01 cũ với Word CSDL và bản rà soát 10/11. Thiết kế mới có 40 bảng nghiệp vụ. Hai bảng nhãn được đưa khỏi public và thêm system_settings.
- Tạo bản Word và Markdown có mô tả rút gọn cho từng bảng. Bản nâng cấp giữ các bảng phù hợp, chuyển form xuống phần thi và lưu dữ liệu nhãn lịch sử.
- Dọn hai bản sao Chương 1 và 2 sau khi kiểm tra chúng trùng với bản trong Downloads.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Tạo mới, so với 01 cũ + seed 02 + nâng cấp | Hai PostgreSQL cục bộ, mô phỏng auth.users và các role Supabase | Đủ 40 bảng. Trùng tên, kiểu, mặc định, tính nullable của cột, định nghĩa constraint, index, trigger và trạng thái RLS của các bảng public. |
| Đối chiếu từ điển bảng | Cấu trúc vừa tạo | Các trường của cả 40 bảng khớp danh mục, có thêm cột kỹ thuật tự sinh đã giải thích. |
| Chuyển dữ liệu và lỗi nhập | Seed Reading và fixture riêng | Dữ liệu mẫu giữ đáp án, bằng chứng và dải số. Đã thử cả Academic/General và phiên theo nhãn có ánh xạ. Lô thiếu ánh xạ làm rollback. DB từ chối nháp thứ hai, form hoặc kỹ năng cha sai và đích nhập thiếu kỹ năng. |
| Bố cục bản Word | Xuất bản xem thử bằng Word | Đã kiểm tra sáu trang và tám nhóm bảng. |

## Phần còn mở

Cần đối chiếu dữ liệu cũ, trigger bổ sung, quyền thực tế và các lô nhập trên bản sao của project đang dùng. Hạn chờ 72 giờ vẫn được CHECK cũ bảo vệ. Việc vận hành giá trị cấu hình động cần được nối ở backend.

## Bước tiếp theo

Chạy các truy vấn kiểm tra trước, điền ánh xạ nếu có, chạy 04 trên bản sao rồi đối chiếu số dòng, đăng nhập và mở đề trước khi áp dụng cho database thật.

## Tài liệu và cách tái hiện

[Quy trình cho database mới và database đã chạy 01](../csdl/README.md).
