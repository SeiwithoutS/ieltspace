# Đặc tả cấp dự án IELTSpace

## Mục tiêu

Xây dựng nền tảng web hỗ trợ học tập và ôn luyện IELTS đủ 4 kỹ năng Listening, Reading, Writing, Speaking, gom vào một nơi các nhu cầu làm đề, xem kết quả, gửi bài chấm, học từ vựng và theo dõi tiến độ (xem [product/VISION.md](product/VISION.md), [product/PROPOSED_SYSTEM.md](product/PROPOSED_SYSTEM.md)). Hệ thống gồm Dashboard nhập liệu cho Quản lý và Landing Page cho người dùng đăng ký, luyện thi, theo dõi tiến độ.

Đồ án 1, Khoa Công nghệ Phần mềm, Trường ĐH Công nghệ Thông tin (ĐHQG TP.HCM), 2026.

## Người dùng

Bốn tác nhân (Bảng 3.4). Chi tiết quyền ở [product/ROLES.md](product/ROLES.md).

| Tác nhân | Mô tả | Nhóm chức năng chính |
|---|---|---|
| Khách (Guest) | Người truy cập chưa đăng nhập; muốn làm bài phải đăng ký và đăng nhập | Xem Landing Page, đăng ký tài khoản, xem kho bài mẫu<br>Không được làm đề hay nộp bài<br>Xem được thư viện đề, bộ từ vựng hiện có |
| Người học (User) | Học sinh, sinh viên, người đi làm tự ôn luyện IELTS, đã có tài khoản; kế thừa các chức năng của Khách | Làm bài và luyện tập, xem kết quả, nộp bài Writing/Speaking, học từ vựng, xem lịch sử và tiến độ |
| Giáo viên (Assistant) | Người chấm bài Writing/Speaking, tài khoản do Quản lý cấp | Chấm bài theo hàng đợi, xem lịch sử chấm |
| Quản lý (Admin) | Người quản trị nội dung và người dùng của hệ thống | Quản lý tài khoản, Bộ đề, Đề thi, bài mẫu và từ vựng; nhập dữ liệu hàng loạt; xem thống kê toàn hệ thống. Giám sát hỗ trợ chấm và quản lý năng lực tiếp nhận. |

## Cấu trúc nghiệp vụ trung tâm

`Bộ đề → Đề thi → Kỹ năng → Phần → Question Group → Question → Answer/Rubric`. Listening/Reading chấm tự động theo đáp án; Writing/Speaking do Giáo viên chấm theo tiêu chí khi Người học chủ động gửi yêu cầu hỗ trợ ([requirements/BUSINESS_RULES.md](requirements/BUSINESS_RULES.md)). Thuật ngữ ở [product/GLOSSARY.md](product/GLOSSARY.md).

## Phạm vi

MVP web cho máy tính, 35 use case (UC01–UC35). Không chấm bằng AI, không ứng dụng di động riêng, không email hay thông báo đẩy. Chi tiết: [product/SCOPE.md](product/SCOPE.md) và [decisions/PDR-004-pham-vi-mvp.md](decisions/PDR-004-pham-vi-mvp.md).

## Công nghệ

React + Vite + TypeScript + Tailwind CSS; Node.js + Express; PostgreSQL + Prisma; Supabase (Auth, Storage); triển khai Vercel và Render ([architecture/TECH_STACK.md](architecture/TECH_STACK.md)).

## Ngoài thư mục này

- Thiết kế cơ sở dữ liệu: [architecture/DATABASE.md](architecture/DATABASE.md). Chưa có ERD, `schema.prisma` và migration trong thư mục này.
- Giao diện: [DESIGN.md](../DESIGN.md) ở gốc repo.
