> Cập nhật 07/11/2026: Đã tích hợp Google OAuth qua Supabase PKCE. Nút Google gọi POST /api/auth/google; GET /api/auth/google/callback đổi code, kiểm tra hồ sơ và đặt refresh cookie; frontend /auth/callback dùng refresh chung và điều hướng theo role. File mới backend/src/lib/supabase-oauth.ts; biến AUTH_GOOGLE_CALLBACK_URL (mặc định localhost:3001/api/auth/google/callback). Build và test local đã qua, chưa kiểm thử Google thật. Các ghi chú bên dưới nói Google chưa tích hợp là trạng thái trước cập nhật này. Bộ hướng dẫn và ba file SQL được giữ tại `../_local/supabase-huong-dan`, chỉ lưu trên máy và được Git bỏ qua.

# Bàn giao dự án IELTSpace

Ngày rà soát: 07/11/2026. Tài liệu nội bộ cho người phát triển và AI agent. Không chứa thông tin kết nối thật. Đây là ảnh chụp trạng thái code hiện tại, không khẳng định mọi giao diện đã có backend.

## Cây thư mục toàn bộ mã nguồn

Không liệt kê node_modules, .git, bản build, cấu hình IDE, dữ liệu cá nhân trong _local và .env thật.

```text
backend/
  prisma/
    migrations/
      .gitkeep
    schema.prisma
  src/
    config/
      .gitkeep
      env.ts
    integrations/
      storage/
        .gitkeep
    jobs/
      .gitkeep
    lib/
      .gitkeep
      prisma.ts
      supabase.ts
    middleware/
      .gitkeep
      auth.ts
      error-handler.ts
    modules/
      attempts/
        .gitkeep
      auth/
        .gitkeep
        auth.routes.ts
      exams/
        .gitkeep
      grading/
        policies/
          .gitkeep
        services/
          .gitkeep
        .gitkeep
      imports/
        .gitkeep
      motivation/
        .gitkeep
      notifications/
        .gitkeep
      reports/
        .gitkeep
      samples/
        .gitkeep
      statistics/
        .gitkeep
      users/
        .gitkeep
      vocabulary/
        .gitkeep
      README.md
    shared/
      errors/
        .gitkeep
      types/
        .gitkeep
      utils/
        .gitkeep
    utils/
      http.ts
    app.ts
    config.ts
    routes.ts
    server.ts
  tests/
    fixtures/
      .gitkeep
    integration/
      .gitkeep
    auth.test.mjs
    check-auth-profiles.mjs
  .env.example
  .gitignore
  README.md
  package-lock.json
  package.json
  tsconfig.json
frontend/
  src/
    app/
      App.tsx
      pages.ts
    components/
      account/
        AccountDropdown.jsx
        AccountMenu.tsx
      auth/
        AuthError.jsx
        AuthFields.jsx
        AuthHero.jsx
        AuthLayout.jsx
        LoginForm.jsx
        RegisterForm.jsx
        auth.css
      exams/
        QuestionCard.jsx
      navigation/
        AdminSidebar.jsx
        AdminTopbar.jsx
        TeacherSidebar.jsx
      notifications/
        NotificationBadge.tsx
        NotificationInbox.tsx
      reports/
        Support.jsx
        support.css
    data/
      notifications.json
    lib/
      account.ts
      auth-links.ts
      auth.ts
      dark-palette.json
      notifications.ts
      styles.ts
    pages/
      account/
        AvatarMenu.jsx
        Profile.jsx
        StaffProfile.jsx
      admin/
        dashboard/
          AdminHome.jsx
        exams/
          editors/
            AdminListeningEditor.jsx
            AdminReadingEditor.jsx
            AdminSpeakingEditor.jsx
            AdminWritingEditor.jsx
            QuestionCards.jsx
          AdminExamSet.tsx
          AdminExams.tsx
        grading/
          AdminGrading.jsx
        reports/
          AdminReports.jsx
        samples/
          AdminSampleSpeaking.jsx
          AdminSampleWriting.jsx
          AdminSamples.jsx
        users/
          AdminUsers.jsx
      attempts/
        ListeningTest.jsx
        ReadingTest.jsx
        SpeakingTest.jsx
        SubmitDialogs.jsx
        WritingTest.jsx
      auth/
        CheckEmail.jsx
        ForgotPassword.jsx
        Login.jsx
        Register.jsx
        ResetPassword.jsx
      exams/
        ExamDetail.tsx
        FullTests.jsx
      grading/
        TeacherGrade.jsx
        TeacherHistory.jsx
        TeacherHome.jsx
        TeacherQueue.jsx
      learner/
        StudentHome.jsx
        StudentLanding.jsx
      notifications/
        Notifications.jsx
      practice/
        PracticeLibrary.jsx
        PracticeWS.jsx
      public/
        Main.jsx
      results/
        MyWS.jsx
        ResultLR.jsx
        ResultWS.jsx
      samples/
        SampleLibrary.jsx
        SampleSpeaking.jsx
        SampleWriting.jsx
      vocabulary/
        Flashcard.jsx
        Vocab.jsx
    styles/
      fonts.css
      globals.css
    README.md
    main.tsx
  tests/
    auth-links.test.mjs
  .env.example
  .gitignore
  README.md
  index.html
  package-lock.json
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  vercel.json
  vite.config.mjs
supabase-huong-dan/
  01_tao_cau_truc.sql
  02_du_lieu_mau.sql
  03_kiem_tra.sql
  HUONG_DAN.md
.gitignore
docs/PROGRESS/2026-11-07-trang-thai-du-an.md
README.md
```

## Bản đồ code và trách nhiệm

| File hoặc nhóm | Dùng làm gì, liên hệ |
|---|---|
| frontend/src/main.tsx | Nạp font/CSS, mount App vào root |
| app/App.tsx → app/pages.ts | Điều hướng trang theo hash, lazy-load trang; chặn trang cần phiên/vai trò ở giao diện |
| lib/auth-links.ts | Đọc callback email ngay khi module nạp, xóa token khỏi URL; hỗ trợ /reset-password#token_hash và hash cũ; chuyển lỗi xác minh sang Login |
| lib/auth.ts | Store phiên trong bộ nhớ, gọi Express với credentials include; refresh dùng chung promise, lên lịch trước hạn; logout đợi refresh và xóa store |
| lib/account.ts | Ánh xạ hồ sơ thật sang tên/email/initials/role phục vụ component tài khoản |
| components/auth/AuthLayout.jsx + AuthHero.jsx + auth.css | Bố cục hai cột, panel giới thiệu, responsive; màn hình nhỏ ẩn hero, desktop bình thường vừa viewport |
| components/auth/AuthFields.jsx | Input, thông báo lỗi/thành công, nút Google chưa tích hợp OAuth |
| components/auth/LoginForm.jsx, RegisterForm.jsx | Quản lý input, validation cơ bản, gọi lib/auth; đăng ký không tự đăng nhập |
| pages/auth/Login.jsx, Register.jsx | Ghép layout với form chung |
| pages/auth/ForgotPassword.jsx, ResetPassword.jsx | Gửi email và gửi token + mật khẩu mới; reset token chỉ giữ trong bộ nhớ |
| pages/auth/CheckEmail.jsx, components/auth/AuthError.jsx | Giao diện có sẵn từ bản mẫu; không phải nguồn xử lý xác thực chính |
| components/account/* | Menu hồ sơ và đăng xuất; App bắt liên kết đăng xuất để gọi API |
| components/navigation/* | Điều hướng riêng quản lý/giáo viên |
| lib/notifications.ts, data/notifications.json, components/notifications/* | Thông báo mẫu/trạng thái phía trình duyệt, chưa có API thông báo thật |
| lib/styles.ts, dark-palette.json, styles/* | Chuyển style cũ, màu sáng/tối, CSS và font |
| backend/src/server.ts → app.ts | Listen cổng; app gắn CORS credentials, JSON, cookie, route và xử lý lỗi |
| backend/src/config.ts → config/env.ts | Zod kiểm tra .env; env.ts ánh xạ cho server cũ |
| backend/src/routes.ts | /api/health; chưa có route nghiệp vụ học tập |
| backend/src/modules/auth/auth.routes.ts | Toàn bộ API Auth, giới hạn yêu cầu, Origin check, refresh cookie |
| backend/src/lib/supabase.ts | Client mới cho mỗi yêu cầu, không lưu session server dùng chung; ws hỗ trợ Node 20 |
| backend/src/lib/prisma.ts → prisma/schema.prisma | Đọc public.users theo auth_user_id; schema chỉ có các cột cần đọc |
| backend/src/middleware/auth.ts | getUser(access token), tìm hồ sơ ACTIVE; requireRole; không tự kiểm tra quyền sở hữu các tài nguyên tương lai |
| backend/src/utils/http.ts | HttpError và wrapper bắt lỗi async Express |
| backend/src/middleware/error-handler.ts | Chuyển lỗi thành JSON, không trả stack/secret ra client |
| backend/tests/* | Kiểm thử guard API, khởi tạo SDK; check-auth-profiles.mjs truy vấn chỉ đọc, chỉ in số lượng |
| frontend/tests/auth-links.test.mjs | Kiểm thử các dạng link, xóa token và xử lý lỗi callback |
| supabase-huong-dan/*.sql | 41 bảng thiết kế đề xuất, seed và truy vấn kiểm tra; không phải bằng chứng tất cả nghiệp vụ đã triển khai |

## Tính năng tương ứng với màn hình

- Trang công khai: pages/public/Main.jsx.
- Dashboard người học: pages/learner/StudentHome.jsx, StudentLanding.jsx.
- Hồ sơ: pages/account/Profile.jsx, StaffProfile.jsx, AvatarMenu.jsx.
- Thư viện đề: pages/exams/FullTests.jsx, ExamDetail.tsx.
- Luyện tập: pages/practice/PracticeLibrary.jsx, PracticeWS.jsx.
- Làm bài: pages/attempts/{ReadingTest,ListeningTest,WritingTest,SpeakingTest,SubmitDialogs}.jsx; components/exams/QuestionCard.jsx.
- Kết quả: pages/results/ResultLR.jsx, ResultWS.jsx, MyWS.jsx.
- Từ vựng: pages/vocabulary/Vocab.jsx, Flashcard.jsx.
- Bài mẫu: pages/samples/SampleLibrary.jsx, SampleWriting.jsx, SampleSpeaking.jsx.
- Giáo viên: pages/grading/TeacherHome.jsx, TeacherQueue.jsx, TeacherGrade.jsx, TeacherHistory.jsx.
- Quản lý: pages/admin/dashboard, users, reports, grading, samples, exams. Nhóm exams/editors chứa editor từng kỹ năng và QuestionCards.
- Thông báo/hỗ trợ: pages/notifications, components/notifications, components/reports.

Ngoài Auth, những nhóm màn hình trên chủ yếu là prototype; không suy ra đã lưu Supabase chỉ vì có nút lưu hoặc hiển thị điểm.

## Luồng xử lý cần hiểu trước khi sửa

### Đăng ký
Register → RegisterForm → auth.register → POST /api/auth/register → Zod/limiter/Origin → Supabase signUp. Metadata chỉ có full_name, không nhận role. Trigger trong database tạo public.users LEARNER/ACTIVE. Supabase gửi email xác minh. ConfirmationURL đi qua Supabase rồi quay /login. Người dùng đăng nhập riêng. Không thêm prisma.users.create gây trùng trigger.

### Đăng nhập và API bảo vệ
LoginForm → auth.login → POST /login → signInWithPassword → findActiveUser qua Prisma. Backend trả user và access token, đặt refresh token vào HttpOnly cookie path /api/auth. Frontend giữ access token trong bộ nhớ, chọn trang theo role thật. GET /me dùng Bearer → getUser → kiểm tra hồ sơ ACTIVE. Quyền ở frontend chỉ để điều hướng, không thay thế middleware server.

### Giữ phiên và đăng xuất
Khi App mount: POST /refresh dùng cookie, Supabase xoay refresh token; backend kiểm tra hồ sơ và thay cookie. Một promise refresh trong mỗi tab tránh gọi trùng. Logout dừng timer, đợi refresh rồi gọi /logout; backend nạp phiên từ refresh cookie và signOut local, xóa cookie; frontend xóa store. Access token cũ có thể còn hợp lệ tới hết hạn. Chưa có khóa refresh dùng chung nhiều tab.

### Quên mật khẩu
ForgotPassword → POST /forgot-password → resetPasswordForEmail. Thông báo chung không chứng minh email đã gửi. Template mới đưa token hash trong fragment tới /reset-password. auth-links đọc token trước render, xóa URL. ResetPassword lấy token một lần, kiểm tra nhập lại mật khẩu rồi POST /reset-password. Backend validate trước verifyOtp(type recovery), updateUser, signOut global khi thành công (local khi thất bại). Frontend xóa phiên. Lỗi thu hồi không được báo sai rằng mật khẩu chưa đổi. Token đã dùng để xác minh có thể không dùng lại nếu đổi mật khẩu bị từ chối.

### Điều hướng
App dùng pages.ts và hash, không dùng React Router. Link *.dc.html bị bắt ở document capture rồi đổi sang hash; #dang-ky/#dang-nhap cũng được ánh xạ. navigate() pushState và phát popstate. Nếu thêm trang cần thêm pages.ts và xem publicPage/role guard. Callback /login, /reset-password cần hosting SPA fallback. Không lưu token vào URL mới, logs hoặc storage.

## Các API hiện có

POST /api/auth/register, /login, /refresh, /logout, /forgot-password, /reset-password; GET /api/auth/me; GET /api/health. Các POST Auth cần Origin khớp FRONTEND_ORIGIN. Frontend đọc message hoặc error.message. Không cần secret/service_role cho các luồng đang có.

## Chạy và kiểm tra

Theo README.md hoặc [hướng dẫn Auth ngày 07/11](PROGRESS/2026-11-07-trang-thai-du-an.md#cấu-hình-auth) để điền .env. Chạy npm install ở từng package; backend npm run prisma:generate rồi npm run dev; frontend npm run dev -- --port 3000 --strictPort. Không có npm script ở thư mục gốc.

Build: npm run build tại từng package. Kiểm thử từ backend:

```powershell
node --test tests/auth.test.mjs
node --import ./node_modules/tsx/dist/loader.mjs --test ../frontend/tests/auth-links.test.mjs
```

Kiểm thử backend cần build trước. Các test dùng dữ liệu giả, không chứng minh gửi email/đổi mật khẩu thật. check-auth-profiles.mjs dùng .env thật, chỉ chạy khi cần chẩn đoán được cho phép; không in token/email.

## Ranh giới và lưu ý bàn giao

- Không migrate bằng Prisma schema rút gọn; giữ các bảng Auth/Storage do Supabase quản lý.
- Chưa có Google OAuth, màn hình reauthentication nonce, nghiệp vụ học tập, worker hoặc Storage upload thật.
- Production cần HTTPS/cookie đúng site, proxy và rate-limit store phù hợp; frontend/vercel.json hiện outputDirectory='.' chưa xác nhận phù hợp build Vite. Cần kiểm tra hosting root/output và rewrite trước deploy, không mặc định coi là đã triển khai.
- Một số trang cũ dùng JSX và dữ liệu mẫu; giữ giao diện nhưng thay từng nguồn dữ liệu theo API thật.
- Thông báo password changed do Supabase, không gửi email trùng từ Express.
- Không ghi password/token/body nhạy cảm vào logs. Chẩn đoán qua code/status đã lọc.
- Tài liệu này và [phần cấu hình Auth](PROGRESS/2026-11-07-trang-thai-du-an.md#cấu-hình-auth) chỉ dùng local. README.md gốc là tài liệu công khai duy nhất.
