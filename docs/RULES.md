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

## Quy ước cho frontend mới và phần đang refactor

- Viết component và trang mới bằng React + TypeScript (`.tsx`); đặt hàm thuần, kiểu dữ liệu và mã gọi API không có JSX trong `.ts`. Định kiểu props, sự kiện và dữ liệu qua ranh giới module. Kiểm tra dữ liệu nhận từ bên ngoài khi cần; tránh dùng `any` chỉ để build qua.
- Trang phụ trách ghép giao diện và điều phối luồng. Tách component khi nhiều nơi cần cùng hành vi hoặc khi một phần có trách nhiệm rõ, ví dụ bộ chọn đáp án, nút gắn cờ và hộp thoại xác nhận. Giữ state gần nơi sử dụng; chỉ đưa lên cha khi nhiều phần phải đồng bộ. Ưu tiên HTML ngữ nghĩa và tên theo nghiệp vụ.
- Dùng Tailwind cho bố cục và trạng thái thông dụng. Dùng lại class, biến chung trong [app.css](../frontend/src/assets/css/app.css); đặt quy tắc riêng phức tạp cạnh component. Dùng React style hoặc CSS variable cho giá trị tính lúc chạy như chiều rộng cột kéo thả. Không tạo thêm chuỗi CSS qua `styleOf` trong code mới. [input.css](../frontend/src/input.css) là đầu vào Tailwind; Vite sinh CSS để triển khai. Không sửa bản build hoặc tự thêm framework CSS.
- Dùng client/service hiện có cho API. Giữ dữ liệu minh họa tách khỏi dữ liệu tài khoản thật; hiển thị trạng thái đang tải, lỗi hoặc thành công dựa trên kết quả thao tác. Các quyết định về quyền, điểm và thời hạn tuân theo mục 2–4 ở trên.
- **Điều hướng:** đích kiến trúc là một React Router tại gốc SPA. Hiện [App.tsx](../frontend/src/app/App.tsx) và [pages.ts](../frontend/src/app/pages.ts) đang quản lý route theo hash. Trước khi tích hợp Router, dùng cơ chế chung đang có. Sau khi tích hợp, khai báo route ở cấu hình chung, dùng Link hoặc navigate của router. Không gắn router thứ hai trong từng trang.
- Với JSX cũ, chuyển theo một luồng khi có nhu cầu sửa. Trước khi đổi, ghi lại đầu vào, thao tác và kết quả hiện tại. Giữ URL, query, API, dữ liệu nháp và quyền theo vai trò trừ khi task yêu cầu thay đổi. Tách đợt di chuyển router khỏi đợt đổi giao diện.
- Nghiệm thu theo bề mặt thay đổi: build frontend và thử luồng chính; nếu đổi router, kiểm tra mở link trực tiếp, F5, Back/Forward, link email, Google callback và trang theo vai trò. Nếu đổi giao diện làm bài, kiểm tra cuộn bên trong, thao tác bàn phím, theme, nộp và tiếp tục nháp. Ghi rõ kiểm tra nào dùng dữ liệu mẫu.

## Responsive và nghiệm thu trên thiết bị

- Thiết kế bố cục thích ứng theo không gian hiển thị: điều chỉnh số cột, thứ tự khối, menu và khoảng cách. Giữ chữ đọc được và nút dễ thao tác; không thu nhỏ toàn bộ trang bằng transform/zoom để vừa màn hình.
- Dùng breakpoint theo lúc nội dung cần đổi bố cục. Tránh kích thước cố định gây tràn ngang. Bảng rộng, timeline hoặc hình đề cần cuộn ngang phải có vùng cuộn riêng và dấu hiệu nhận biết.
- Màn làm bài giữ khung ngoài vừa viewport. Trên desktop, vùng đề và câu hỏi cuộn bên trong; trên thiết bị không hỗ trợ desktop, hiển thị màn yêu cầu dùng máy tính theo yêu cầu ngày 14/11/2026. Giữ đồng hồ, điều hướng câu và nút nộp có thể truy cập, tránh nhiều vùng cuộn lồng nhau. Kiểm tra khi bàn phím ảo mở và xoay màn hình.
- Popup vừa chiều rộng màn hình, nội dung dài cuộn bên trong và các nút luôn có thể tiếp cận. Menu và tooltip cần thao tác được bằng chạm, không chỉ hover. Kiểm tra focus bàn phím và khả năng đọc khi phóng to chữ.
- Khi sửa bố cục, tối thiểu thử chiều rộng 375px, 768px và 1366px cùng một trường hợp ngang có chiều cao thấp. Kiểm tra tràn ngang, nội dung bị cắt, thứ tự đọc, thao tác chính và theme. Ghi kích thước thực đã kiểm tra; build thành công không thay thế kiểm tra giao diện.
