# Các module nghiệp vụ

Mỗi module đã có thư mục để triển khai tiếp. Chưa tạo endpoint hoặc dữ liệu mẫu cho nghiệp vụ.

Khi triển khai một module, có thể thêm:

```text
exams/
├── exams.routes.ts       # Đường dẫn API
├── exams.controller.ts   # Nhận request, trả response
├── exams.service.ts      # Xử lý nghiệp vụ
├── exams.schema.ts       # Kiểm tra dữ liệu đầu vào
└── exams.dto.ts          # Kiểu dữ liệu trao đổi
```

`grading/services` chứa các xử lý yêu cầu chấm, lượt chấm, phân công và kết quả. `grading/policies` chứa quy tắc nghiệp vụ. `reports` dành cho báo cáo và phản hồi.
