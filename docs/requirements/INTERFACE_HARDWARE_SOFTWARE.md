# Yêu cầu giao diện, phần cứng, phần mềm

> Nguồn: Chương 1 §1.4.3 (Chương 1 - Phân tích yêu cầu nghiệp vụ (sửa 20-10 lần 2).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 1.4.3. Yêu cầu giao diện, phần cứng, phần mềm

**Yêu cầu giao diện:**

- Giao diện hiển thị tốt trên trình duyệt máy tính
- Giao diện làm bài kiểm tra được thiết kế tối giản, rõ ràng, hạn chế gây xao nhãng trong quá trình làm bài, có đồng hồ đếm ngược thời gian. Giao diện cũng cần sát với giao diện thi thật của bài thi IELTS để người dùng tập làm quen.
- Giao diện riêng cho Giáo viên dạng hàng đợi chấm bài (queue), hiển thị rõ bài đang chờ, đã chấm, cùng khung nhập điểm/nhận xét theo từng tiêu chí.
- Giao diện Dashboard cho Quản lý: quản lý người dùng, đề thi, import dữ liệu, thống kê tổng quan.
- Hỗ trợ ghi âm và phát lại audio (phục vụ luyện Speaking và Listening).
- Hỗ trợ chế độ giao diện sáng (light mode) và tối (dark mode).

**Yêu cầu phần cứng (tối thiểu để triển khai/vận hành hệ thống):**

Chưa xác định

**Yêu cầu phần mềm (đề xuất tham khảo, có thể điều chỉnh theo lựa chọn công nghệ cụ thể của nhóm):**

- Trình duyệt hỗ trợ: các trình duyệt phổ biến trên máy tính (Chrome, Edge, Firefox) phiên bản mới.
- Frontend: xây dựng bằng framework JavaScript hiện đại (React + Vite, TypeScript, Tailwind CSS)
- Backend: Node.js + Express (TypeScript), Prisma ORM.
- Cơ sở dữ liệu: PostgreSQL (Supabase), kèm Supabase Auth và Storage.
- Công cụ quản lý mã nguồn: Git/GitHub phục vụ làm việc nhóm và kiểm soát phiên bản.
