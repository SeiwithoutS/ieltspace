# Quy tắc viết mã và kiểm thử

1. Bắt đầu từ task có tiêu chí nghiệm thu. Đối chiếu mã BR, source, route và dữ liệu đang dùng. Tách thay đổi nghiệp vụ chưa chốt khỏi thay đổi kỹ thuật.
2. Giữ quy ước module và API hiện tại. Validate đầu vào ở biên bằng Zod khi phù hợp. Tách tính điểm, phân công, thời hạn và chuyển trạng thái khỏi component/controller. Tái sử dụng middleware xác thực và kiểm tra thêm quyền sở hữu/phân công ở service.
3. Tính role, user_id, điểm, tải và thời hạn tại backend. Không trả đáp án qua payload làm bài. Không ghi token, mật khẩu, nội dung bài viết, bản ghi âm hoặc URL tải tạm vào log/Git.
4. Đóng gói các lần ghi phụ thuộc nhau trong transaction. Bổ sung ràng buộc DB và kiểm tra đồng thời cho cấp lượt, phân công, hoàn bonus, công bố và import. Kiểm tra lại điều kiện tại thời điểm ghi kể cả khi UI đã xác thực trước.
5. Giữ thay đổi trong phạm vi task. Ghi rõ nhu cầu khi đề xuất thư viện mới. Không sửa migration đã áp dụng trên môi trường chung. Không chạy reset, db push hoặc migrate từ schema hồ sơ rút gọn.
6. Với giao diện, dùng lại thành phần theo [DESIGN](DESIGN.md). Kiểm tra bàn phím, trạng thái bận/rỗng/lỗi, thay đổi kích thước và theme. Phân biệt dữ liệu mẫu trong trình duyệt với dữ liệu trả về sau khi tải lại.
7. Ghi bằng chứng trong docs/PROGRESS/ sau task. Phân biệt đã viết mã, đã build, đã kiểm thử và đã triển khai. Với luồng phụ thuộc dịch vụ thật, ghi rõ môi trường, ca đã thử và phần chưa xác minh.

## Kiểm tra theo phạm vi sửa

| Phạm vi | Thao tác và bằng chứng |
|---|---|
| Backend | Từ backend chạy `npm run typecheck` và `npm run build`. Test Auth đọc dist nên build trước `node --test tests/auth.test.mjs`. |
| Frontend | Từ frontend chạy `npm run build`. Test xử lý link dùng loader TS. Từ backend chạy `node --import ./node_modules/tsx/dist/loader.mjs --test ../frontend/tests/auth-links.test.mjs`. |
| Tích hợp Auth | Thử email xác minh, recovery hết hạn/dùng lại, Google callback, F5, logout và tài khoản khóa trên môi trường kiểm thử có cấu hình thật. Phản hồi 202 chỉ xác nhận tiếp nhận. |
| Thay đổi dữ liệu | Trên DB thử, kiểm tra dữ liệu cũ, rollback giao dịch lỗi, hai yêu cầu đồng thời, chạy lại job/import. So sánh số lượt, trạng thái và lịch sử trước/sau. |
| Chỉ sửa Markdown | Kiểm tra tệp đích của liên kết, đối chiếu tên endpoint/bảng với nguồn, phân biệt trạng thái đã có và dự kiến. |
