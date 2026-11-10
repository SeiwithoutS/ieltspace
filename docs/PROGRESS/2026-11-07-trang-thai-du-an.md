# Tiến độ IELTSpace ngày 07/11/2026

## Phạm vi và trạng thái

Bàn giao phần xác thực và rà soát mức độ hoàn thiện các màn hình. Auth đã có mã và đã kiểm thử một phần tại local. Hai luồng cần kiểm tra với dịch vụ thật là email và Google. Các kết quả dưới đây do nhóm ghi nhận ngày 07/11. [Báo cáo bàn giao](../BAO_CAO_BAN_GIAO.md).

## Công việc đã thực hiện

- **Email và mật khẩu.** Đã nối đăng ký, xác minh email, đăng nhập và đăng xuất phiên hiện tại với Supabase Auth. Backend kiểm tra hồ sơ ACTIVE và vai trò trong DB, kiểm tra Origin, dữ liệu đầu vào, giới hạn tần suất và token qua getUser. Access token lưu trong bộ nhớ, refresh token được xoay trong cookie HttpOnly để khôi phục sau F5.
- **Khôi phục mật khẩu.** Có giao diện yêu cầu email, xác minh token recovery bằng verifyOtp, cập nhật mật khẩu bằng updateUser và xử lý kết quả thu hồi phiên cũ.
- **Google.** Đã nối nút Google với POST /api/auth/google. GET /api/auth/google/callback đổi code PKCE, kiểm tra hồ sơ và đặt cookie. Frontend /auth/callback gọi refresh rồi chuyển trang theo vai trò. Mã tích hợp ở backend/src/lib/supabase-oauth.ts, callback cấu hình qua AUTH_GOOGLE_CALLBACK_URL.
- **Giao diện.** Đã phục hồi mẫu Auth và bỏ luồng demo ở màn xác thực. Thư viện và editor đề, làm bài, kết quả, bài mẫu, từ vựng/flashcard, hồ sơ, chấm bài, quản lý người dùng và thông báo vẫn chủ yếu dùng dữ liệu mẫu hoặc trạng thái trình duyệt. Tại ngày bàn giao, các nghiệp vụ này chưa có route Express tương ứng.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Build frontend và backend | Local | Cả hai build thành công. |
| Khởi tạo SDK, guard Auth và xử lý link email | Local | Test SDK/guard đạt. Bốn trường hợp link email đạt. |
| Đối chiếu hồ sơ với Auth | Kiểm tra chỉ đọc tại thời điểm bàn giao | Hai hồ sơ public.users đều có tài khoản auth.users tương ứng. Auth URL và DB cùng project. |
| Điều hướng và bố cục Auth | Viewport 1366 × 768 | Đã thử điều hướng. Màn hình vừa khung, không cần cuộn. |

## Phần còn mở

- Chưa thử Google với tài khoản thật hoặc xác nhận đủ vòng đời email xác minh, email recovery, link dùng lại/hết hạn và đăng nhập bằng mật khẩu mới. Cần kiểm tra provider, SMTP, hạn mức, redirect, template và trigger tạo hồ sơ. Phản hồi 202 chỉ ghi nhận yêu cầu gửi thư.
- Chưa có UI/API nhập nonce cho reauthentication. Khả năng giao email Password Changed chưa được kiểm chứng.
- Cần kiểm tra SPA, cookie và callback trên môi trường triển khai. Chưa có kết quả kiểm thử đầu cuối cho các nghiệp vụ đang dùng dữ liệu mẫu.

## Bước tiếp theo

1. Chạy hai luồng Auth thật theo [AUTH-01 và AUTH-02](../TASKS.md). Thử đăng ký → xác minh → đăng nhập → F5 → đăng xuất, sau đó thử khôi phục mật khẩu và Google callback.
2. Thiết kế hợp đồng API và kiểm tra quyền theo từng bản ghi cho module học tập/quản trị. Tiếp tục với nhập XLSX, Storage, chấm điểm, cấp lượt, phân công và dọn nội dung hết hạn.
3. Trước phát hành, tách môi trường, rà quyền DB tối thiểu, sao lưu, lập migration, thử triển khai SPA/cookie và rà soát thư viện phụ thuộc.

## Tài liệu và cách tái hiện

### Cấu hình Auth

Hướng dẫn dưới đây dùng để chạy lại các luồng xác thực trong môi trường local. Các bước thử với dịch vụ thật vẫn thuộc phần còn mở của báo cáo ngày 07/11.

Với Google, bật provider trong Supabase và cấu hình thông tin OAuth tương ứng. Cho phép URL callback của Supabase trong cấu hình OAuth của Google. Trong Redirect URLs của Supabase, thêm `http://localhost:3001/api/auth/google/callback` để backend nhận code PKCE. Sau khi đổi code và kiểm tra hồ sơ, backend đặt refresh cookie và chuyển về `/auth/callback` của frontend.

Bộ hướng dẫn cùng ba tệp SQL được lưu riêng trên máy bàn giao ở `_local/supabase-huong-dan/`.

#### Email khôi phục mật khẩu

Giao diện đã nối API gửi email và đặt mật khẩu mới. Trong Supabase → Authentication → Email Templates (hoặc Emails → Templates) → Reset Password, thay nội dung liên kết đặt lại bằng:

```html
<h2>Đặt lại mật khẩu IELTSpace</h2>
<p>Bấm nút bên dưới để chọn mật khẩu mới.</p>
<p><a href="{{ .SiteURL }}/reset-password#token_hash={{ .TokenHash }}&type=recovery">Đặt lại mật khẩu</a></p>
```

Site URL phải là origin frontend (khi chạy local: http://localhost:3000), không có dấu / cuối. Thêm http://localhost:3000/reset-password vào Redirect URLs. Lưu template rồi yêu cầu email mới; email cũ không đổi theo template mới. Không dùng template này cho email xác minh đăng ký. Backend xác minh token bằng loại recovery khi gửi mật khẩu mới; ứng dụng đọc và xóa token khỏi thanh địa chỉ trước khi render, không lưu token trong localStorage. Liên kết cũ dạng /#ResetPassword?token_hash=... vẫn được hỗ trợ. Nếu F5 sau khi đã xóa token, hãy mở lại liên kết trong email; nếu liên kết đã dùng/hết hạn hoặc cập nhật thất bại, yêu cầu email mới.

##### Các template khác

- Confirm signup: giữ `{{ .ConfirmationURL }}` ở cả nút và liên kết dự phòng. Supabase xác minh trước khi chuyển về /login. Ứng dụng hiển thị thông báo nếu liên kết lỗi và vẫn yêu cầu đăng nhập bằng mật khẩu.
- Reauthentication: giữ `{{ .Token }}`. Đây là mẫu cho luồng xác thực lại thao tác nhạy cảm, không phải email đặt lại mật khẩu. Chưa có màn hình nhập nonce hay chức năng đổi mật khẩu trong hồ sơ; việc thêm template không tự triển khai những chức năng đó.
- Password Changed: bật thông báo bảo mật trong Supabase nếu muốn nhận email. Supabase gửi khi mật khẩu đổi, backend không gửi email trùng. Không cần token trong mẫu này.
- Sau reset thành công, backend yêu cầu thu hồi phiên toàn tài khoản và xóa cookie hiện tại; frontend xóa phiên trong bộ nhớ. Access token đã phát hành có thể vẫn có hiệu lực tới khi hết hạn. Nếu thu hồi lỗi, vẫn báo đúng rằng mật khẩu đã đổi và kèm thông báo về các phiên cũ.
- Giữ `VITE_API_URL=http://localhost:3001/api` trong dự án này. Ví dụ tài liệu dùng URL không có /api vì hàm ghép đường dẫn khác; không áp dụng nguyên dòng đó vào code hiện tại.
- Khi dán HTML vào Supabase, dùng thẻ HTML thực, không kèm dấu gạch chéo ngược để escape Markdown.

Các trang đăng ký/đăng nhập dùng chung AuthLayout, AuthHero, AuthFields và CSS responsive.

Nếu không thấy tài khoản ở Authentication, xóa từ khóa/bộ lọc, làm mới trang và kiểm tra đúng project. Có thể đối chiếu bằng truy vấn chỉ đọc:

```sql
select u.email, u.auth_user_id, (a.id is not null) as exists_in_auth
from public.users u
left join auth.users a on a.id = u.auth_user_id;
```


#### 1. Supabase bạn đã cấu hình

Giữ Email provider, Allow signups và Confirm email bật. Giữ trigger tạo public.users với LEARNER/ACTIVE và trigger đồng bộ email mà bạn đã chạy. Không chạy lại SQL tạo 41 bảng.

Frontend hiện tại dùng cổng 3000. Trong Authentication → URL Configuration đặt:

- Site URL: `http://localhost:3000`
- Redirect URLs: thêm `http://localhost:3000/login`

Bạn từng cấu hình cổng 1800: cập nhật theo cổng 3000 hoặc chủ động chạy frontend cổng 1800 và đổi tất cả URL cấu hình tương ứng. Dùng nhất quán localhost, không trộn localhost với 127.0.0.1.

Nếu vẫn dùng email template mặc định, liên kết xác minh sẽ xác nhận email tại Supabase rồi quay lại trang login. Ứng dụng yêu cầu đăng nhập bằng mật khẩu sau xác minh, không lấy token từ URL làm phiên ứng dụng.

#### 2. Cấu hình backend

Mở thư mục backend. Nếu chưa có `.env`, sao chép `.env.example` thành `.env`. Nếu đã có, cập nhật các biến bên dưới, không ghi đè những cấu hình khác.

```dotenv
NODE_ENV=development
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
AUTH_EMAIL_REDIRECT_URL=http://localhost:3000/login
AUTH_GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
SUPABASE_URL=https://MA_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=KHOA_PUBLISHABLE_THAT
DATABASE_URL=CHUOI_KET_NOI_POSTGRESQL_THAT
COOKIE_SAME_SITE=lax
```

Lấy Project URL trong hộp Connect hoặc phần cấu hình API của Supabase. Lấy publishable key ở Settings → API Keys (legacy anon key cũng dùng được). Code này không cần service_role/secret key.

Lấy DATABASE_URL: bấm Connect → Session pooler, sao chép URI PostgreSQL. Thay [YOUR-PASSWORD] bằng database password, không phải mật khẩu dashboard. Giữ nguyên host, user và port từ dashboard. Bổ sung `sslmode=require` nếu URI chưa có (dùng & nếu đã có tham số khác). Nếu mật khẩu có ký tự đặc biệt, percent-encode phần mật khẩu.

Prisma dùng kết nối PostgreSQL để đọc public.users; Supabase Auth dùng Project URL/publishable key để xác thực. Cần điền cả hai nhóm thông tin. Không gửi mật khẩu hoặc chuỗi kết nối vào chat/Git.

#### 3. Cài và chạy backend

Trong terminal thứ nhất:

```powershell
cd C:\IELTS\backend
npm install
npm run prisma:generate
npm run dev
```

Schema Prisma trong repo chỉ ánh xạ các trường cần đọc của bảng users đang có. Không chạy migrate dev, migrate reset hoặc db push bằng schema rút gọn này: database có nhiều bảng được quản lý bằng SQL. Không cần db pull để chạy phần Auth đã viết.

#### 4. Cấu hình và chạy frontend

Nếu chưa có frontend/.env, sao chép frontend/.env.example thành frontend/.env. Nội dung:

```dotenv
VITE_API_URL=http://localhost:3001/api
```

Trong terminal thứ hai:

```powershell
cd C:\IELTS\frontend
npm install
npm run dev -- --port 3000 --strictPort
```

Mở `http://localhost:3000/#Login`. Đăng ký ở nút “Chưa có tài khoản? Đăng ký”. Mật khẩu tối thiểu 8 ký tự. Nếu cấu hình Supabase yêu cầu mạnh hơn, mật khẩu phải đáp ứng quy định đó.

#### 5. Thử theo thứ tự

1. Đăng ký email bạn kiểm soát.
2. Vào Authentication → Users kiểm tra có tài khoản; Table Editor → public.users kiểm tra có hồ sơ LEARNER/ACTIVE.
3. Mở email và bấm xác minh. Sau khi quay về website, đăng nhập bằng email/mật khẩu.
4. Vai trò đọc từ DB quyết định trang mở: LEARNER → StudentHome; TEACHER → TeacherHome; ADMIN → AdminHome.
5. F5: phiên được khôi phục qua refresh cookie.
6. Mở menu tài khoản → Đăng xuất. Sau thành công, về trang login. F5 không khôi phục lại phiên đã thu hồi.
7. Thử sai mật khẩu, chưa xác minh, hồ sơ LOCKED: phải bị từ chối.

Các API: POST /api/auth/register, /login, /refresh, /logout; GET /api/auth/me (Bearer access token). POST bắt buộc Origin đúng FRONTEND_ORIGIN. Nếu dùng Postman cần thêm Origin tương ứng. Access token giữ trong bộ nhớ frontend; refresh token đặt trong HttpOnly cookie. Không lưu token trong localStorage/sessionStorage.

Logout scope local thu hồi phiên hiện tại; access token đã phát hành có thể còn hiệu lực tới khi hết hạn. Các API nghiệp vụ về sau phải dùng middleware requireAuth và kiểm tra quyền sở hữu ở server; chặn trang ở frontend không thay thế phân quyền API.

#### 6. Nếu có lỗi

- Thiếu biến môi trường: điền backend/.env rồi khởi động lại backend.
- Không kết nối được: kiểm tra backend cổng 3001 đang chạy và VITE_API_URL đúng.
- INVALID_ORIGIN: địa chỉ thanh trình duyệt phải khớp FRONTEND_ORIGIN.
- PROFILE_NOT_FOUND: kiểm tra trigger tạo hồ sơ và bổ sung hồ sơ tài khoản cũ bằng SQL bạn đã làm; không tạo Auth user lần nữa.
- Lỗi database: kiểm tra Session pooler URI, mật khẩu và public.users tồn tại, quyền kết nối đọc được bảng. Kết nối quản trị dùng để phát triển; triển khai thật cần role server riêng và policy/quyền phù hợp.
- Không nhận email: xem Authentication logs, thư rác, cấu hình SMTP và hạn mức email. Dịch vụ email mặc định có hạn chế người nhận; để gửi tới người dùng thật, cấu hình Custom SMTP. Không tắt Confirm email chỉ để vượt qua cấu hình gửi email.
- Trigger lỗi tạo user: xem Postgres/Auth logs, kiểm tra unique email và cấu trúc public.users.

#### 7. Khi đưa lên hosting

Thay các URL localhost bằng URL thật. Khuyến nghị proxy /api cùng origin hoặc domain cùng site. Nếu Vercel và Render khác site cần HTTPS, NODE_ENV=production và COOKIE_SAME_SITE=none; một số trình duyệt vẫn chặn cookie bên thứ ba. Cấu hình trust proxy theo hạ tầng thực tế trước khi dùng giới hạn IP; không bật tùy tiện. Bộ giới hạn hiện tại dùng bộ nhớ một tiến trình; nhiều instance cần store dùng chung.

Tài liệu: https://supabase.com/docs/reference/javascript/auth-signinwithpassword và https://supabase.com/docs/guides/auth/signout
