# Google Authenticator và Supabase Auth trong IELTSpace

## Hai bên phối hợp thế nào?

**Google Authenticator** là ứng dụng trên điện thoại tạo mã 6 số. **Supabase Auth** lưu thiết lập xác thực của từng tài khoản và kiểm tra mã. **IELTSpace** quyết định lúc nào cần hỏi mã và kiểm tra bạn còn quyền thực hiện thao tác.

Khi bạn thiết lập, Supabase tạo một khóa bí mật và đưa khóa đó vào mã QR. Google Authenticator đọc khóa khi bạn quét QR. Sau đó, ứng dụng dùng khóa và giờ hiện tại để tạo mã, thường đổi sau mỗi 30 giây. Khi bạn nhập mã trên IELTSpace, backend yêu cầu Supabase xác minh mã theo tài khoản đang đăng nhập. Điện thoại có thể tạo mã ngoại tuyến. Trình duyệt vẫn cần mạng để gửi và xác minh mã. Cơ chế này gọi là TOTP. [Cách TOTP hoạt động trong Supabase Auth](https://supabase.com/docs/guides/auth/auth-mfa/totp)

Luồng tạo và xác minh mã không cần Resend, tên miền gửi email hay cấu hình Google OAuth. Nút **Đăng nhập bằng Google** dùng tài khoản Google để đăng nhập website. Cài đặt MFA bảo vệ tài khoản đăng nhập **Supabase Dashboard** cũng nằm ở một nơi riêng. [MFA cho tài khoản Supabase Dashboard](https://supabase.com/docs/guides/platform/multi-factor-authentication)

## Thiết lập lần đầu

1. Mở Google Authenticator trên điện thoại. Nếu đang dùng mật khẩu tạm của Quản lý, đổi mật khẩu trong hồ sơ IELTSpace trước.
2. Đăng nhập IELTSpace bằng tài khoản Quản lý của bạn. Vào **Hồ sơ cá nhân → Google Authenticator → Thiết lập**.
3. Trong ứng dụng điện thoại, chọn thêm tài khoản và quét mã QR đang hiện trên màn hình.
4. Nhập mã 6 số đang hiện trong ứng dụng rồi chọn **Xác minh và bật**. Khi hồ sơ hiện **Đã bật**, thiết lập đã hoàn tất.

Mỗi Quản lý thiết lập trên tài khoản của mình. Dự án thử và dự án chính có tài khoản Supabase riêng, nên hãy thiết lập riêng trên từng môi trường nếu bạn dùng cả hai. Giữ mã QR riêng tư vì ai có QR cũng có thể tạo mã giống bạn.

## Khi nào website hỏi mã?

| Tình huống | Cách dùng |
|---|---|
| Đăng nhập IELTSpace hằng ngày | Đăng nhập như thường. IELTSpace hỏi mã khi bạn xác nhận thao tác cần bảo vệ. |
| Tạo Quản lý, cấp hoặc hạ vai trò Quản lý, khóa, mở khóa hay xóa một Quản lý | Nhập mã đang hiện trên điện thoại của **người thao tác**. Ví dụ, bạn khóa một Quản lý khác thì bạn dùng mã của mình. Quy tắc cấm tự khóa, tự hạ quyền, tự xóa và bảo vệ Quản lý cuối cùng vẫn áp dụng. |
| Tạo hoặc khóa tài khoản Giáo viên, khóa Người học | Các thao tác này dùng quyền Quản lý đang đăng nhập và không yêu cầu mã TOTP. |
| Đổi hoặc khôi phục mật khẩu khi tài khoản đã bật TOTP | Nhập thêm mã nếu website yêu cầu. Nếu khôi phục bằng email, mở liên kết từ Supabase Auth trước. |

## Khi cần xử lý sự cố

- **Mã bị từ chối.** Chọn đúng mục IELTSpace trên điện thoại, chờ mã tiếp theo và nhập lại. Nếu vẫn lỗi, kiểm tra điện thoại đang để ngày giờ tự động.
- **QR hết hiệu lực trước khi bật.** Mở lại phần thiết lập để lấy QR mới. Sau khi quét, dùng mã từ mục vừa thêm.
- **Mất điện thoại hoặc mất mục IELTSpace trong ứng dụng.** Nếu bạn còn bản sao của mục đó trên thiết bị khác, dùng mã từ thiết bị ấy. IELTSpace hiện chưa có nút tự đặt lại Google Authenticator hoặc mã dự phòng. Nếu mất hoàn toàn, liên hệ người có quyền vận hành Supabase để xác minh danh tính và đặt lại thiết lập xác thực của tài khoản. Sau đó đăng nhập lại và quét QR mới. [Đặt lại yếu tố xác thực qua Supabase Auth Admin](https://supabase.com/docs/reference/javascript/auth-admin-deletefactor)

## SQL 24 dùng vào việc gì?

SQL 24 chuẩn bị phần **tạo nhân sự trực tiếp và nhắc đổi mật khẩu tạm**. Khi tạo Giáo viên hoặc Quản lý, Supabase Auth tạo tài khoản đăng nhập và cơ sở dữ liệu tạo hồ sơ tương ứng. Khi nhân sự đổi mật khẩu, cơ sở dữ liệu tắt lời nhắc. Việc thiết lập và kiểm tra mã TOTP diễn ra qua Supabase Auth. Chạy SQL 24 xong, mỗi Quản lý vẫn cần tự quét QR để bật TOTP cho tài khoản của mình. [Tệp SQL 24](csdl/24_staff_accounts_and_authenticator.sql)
