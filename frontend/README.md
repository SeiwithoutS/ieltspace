# IELTSpace — frontend chuyển từ HTML

## Chạy dự án

```powershell
cd C:\IELTS\frontend
npm install
npm run dev
```

Mở địa chỉ Vite in ra. Build: `npm run build`; xem bản build: `npm run preview`.
Trang chủ: `/#Main`, đăng nhập: `/#Login`, người học: `/#StudentHome`, trợ giảng: `/#TeacherHome`, quản trị: `/#AdminHome`.

## Công nghệ và phạm vi

Theo bảng công nghệ Chương 2: React, TypeScript, JavaScript, Vite, Tailwind CSS.
TypeScript dùng cho khởi tạo, điều hướng, kiểu tên trang và xử lý CSS. Các component `.jsx` dùng JavaScript để giữ logic mẫu gốc; chưa chuyển toàn bộ mô hình dữ liệu sang TypeScript.
Tailwind đã cấu hình, tắt Preflight để tránh thay đổi mặc định của HTML. CSS chi tiết gốc được giữ bằng `styleOf`, không thay số đo bằng các lớp Tailwind gần đúng.
Không có iframe, không chạy lại runtime DC và không chèn cả trang bằng `dangerouslySetInnerHTML`.

Các phần chưa hoàn thiện và dữ liệu mẫu vẫn giữ nguyên. Đây là frontend prototype, chưa nối Express/Prisma/PostgreSQL/Supabase; đăng nhập mẫu không phải xác thực thật. Không thêm API giả hoặc backend ngoài phạm vi yêu cầu.

## Cấu trúc thư mục đã tạo

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── ../_local/tools/scripts/convert.py          # Công cụ chuyển từ HTML nguồn
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx             # Điều hướng và sáng/tối
    │   └── pages.ts            # Danh sách màn hình và kiểu PageName
    ├── components/             # Component dùng chung
    ├── pages/                  # Mỗi màn hình một component
    ├── lib/
    │   ├── styles.ts           # CSS gốc → React style
    │   └── dark-palette.json   # Bảng màu gốc
    └── styles/
        ├── fonts.css          # Font từ HTML
        └── globals.css        # Tailwind và CSS nền
```

## Quy tắc ánh xạ

- `<x-dc>` → React Fragment, không thêm div làm thay đổi bố cục.
- `class Component extends DCLogic` → `React.Component`; giữ state, sự kiện và lifecycle.
- `{{ten}}` → giá trị `v.ten` từ `renderVals()`.
- `sc-if` → điều kiện React; `sc-for` → `map`.
- `dc-import` → import component dùng chung.
- `class`, `for`, thuộc tính SVG → thuộc tính React tương ứng.
- Link `TenTrang.dc.html` → điều hướng hash cùng tên, giữ alias từ HTML.

## Component dùng chung

AdminSidebar, AdminTopbar, AuthHero, AuthError, LoginForm, RegisterForm, QuestionCard được tái sử dụng tại các vị trí import gốc. Các vùng giống nhau về thị giác nhưng khác nội dung chưa tự động gộp thành một component để tránh làm sai giao diện; có thể tiếp tục tách theo dữ liệu khi nối backend.

## Ánh xạ toàn bộ màn hình

| Tên trong HTML | File React |
|---|---|
| Main | `src/pages/public/Main.jsx` |
| AvatarMenu | `src/pages/account/AvatarMenu.jsx` |
| Login | `src/pages/auth/Login.jsx` |
| Register | `src/pages/auth/Register.jsx` |
| ForgotPassword | `src/pages/auth/ForgotPassword.jsx` |
| CheckEmail | `src/pages/auth/CheckEmail.jsx` |
| ResetPassword | `src/pages/auth/ResetPassword.jsx` |
| AuthHero | `src/components/auth/AuthHero.jsx` |
| LoginForm | `src/components/auth/LoginForm.jsx` |
| RegisterForm | `src/components/auth/RegisterForm.jsx` |
| AuthError | `src/components/auth/AuthError.jsx` |
| StudentLanding | `src/pages/learner/StudentLanding.jsx` |
| StudentHome | `src/pages/learner/StudentHome.jsx` |
| FullTests | `src/pages/exams/FullTests.jsx` |
| ExamDetail | `src/pages/exams/ExamDetail.jsx` |
| PracticeLibrary | `src/pages/practice/PracticeLibrary.jsx` |
| ReadingTest | `src/pages/attempts/ReadingTest.jsx` |
| ListeningTest | `src/pages/attempts/ListeningTest.jsx` |
| WritingTest | `src/pages/attempts/WritingTest.jsx` |
| SpeakingTest | `src/pages/attempts/SpeakingTest.jsx` |
| SubmitDialogs | `src/pages/attempts/SubmitDialogs.jsx` |
| ResultLR | `src/pages/results/ResultLR.jsx` |
| ResultWS | `src/pages/results/ResultWS.jsx` |
| MyWS | `src/pages/results/MyWS.jsx` |
| PracticeWS | `src/pages/practice/PracticeWS.jsx` |
| SampleLibrary | `src/pages/samples/SampleLibrary.jsx` |
| SampleWriting | `src/pages/samples/SampleWriting.jsx` |
| SampleSpeaking | `src/pages/samples/SampleSpeaking.jsx` |
| Vocab | `src/pages/vocabulary/Vocab.jsx` |
| Flashcard | `src/pages/vocabulary/Flashcard.jsx` |
| Profile | `src/pages/account/Profile.jsx` |
| Notifications | `src/pages/notifications/Notifications.jsx` |
| TeacherHome | `src/pages/grading/TeacherHome.jsx` |
| TeacherQueue | `src/pages/grading/TeacherQueue.jsx` |
| TeacherGrade | `src/pages/grading/TeacherGrade.jsx` |
| TeacherHistory | `src/pages/grading/TeacherHistory.jsx` |
| StaffProfile | `src/pages/account/StaffProfile.jsx` |
| AdminHome | `src/pages/admin/dashboard/AdminHome.jsx` |
| AdminUsers | `src/pages/admin/users/AdminUsers.jsx` |
| AdminGrading | `src/pages/admin/grading/AdminGrading.jsx` |
| AdminExams | `src/pages/admin/exams/AdminExams.jsx` |
| AdminExamSet | `src/pages/admin/exams/AdminExamSet.jsx` |
| AdminReadingEditor | `src/pages/admin/exams/editors/AdminReadingEditor.jsx` |
| AdminListeningEditor | `src/pages/admin/exams/editors/AdminListeningEditor.jsx` |
| AdminWritingEditor | `src/pages/admin/exams/editors/AdminWritingEditor.jsx` |
| AdminSpeakingEditor | `src/pages/admin/exams/editors/AdminSpeakingEditor.jsx` |
| QuestionCards | `src/pages/admin/exams/editors/QuestionCards.jsx` |
| QuestionCard | `src/components/exams/QuestionCard.jsx` |
| AdminSamples | `src/pages/admin/samples/AdminSamples.jsx` |
| AdminSampleWriting | `src/pages/admin/samples/AdminSampleWriting.jsx` |
| AdminSampleSpeaking | `src/pages/admin/samples/AdminSampleSpeaking.jsx` |
| AdminSidebar | `src/components/navigation/AdminSidebar.jsx` |
| AdminTopbar | `src/components/navigation/AdminTopbar.jsx` |

## Kết quả kiểm tra

- `npm run build`: thành công (TypeScript và Vite).
- 46 route màn hình: render có nội dung, không ghi nhận lỗi JavaScript trong kiểm tra mở trang bằng Chromium.
- Kiểm tra này chưa bao phủ mọi thao tác tương tác hoặc so sánh ảnh từng pixel với HTML gốc. Chế độ tối dùng bảng màu gốc qua tiện ích CSS; cần đối chiếu thêm các màu SVG và màu sinh trong logic.
- Vite cảnh báo gói JavaScript lớn do đang import đồng thời toàn bộ màn hình. Có thể tách tải theo route sau.

## Cập nhật điều hướng, giao diện tối và báo cáo

Báo cáo hiện lưu trong localStorage của trình duyệt, chưa đồng bộ giữa máy hoặc tài khoản thật. Mã React đã được chỉnh sửa sau bước chuyển đổi; không chạy lại ../_local/tools/scripts/convert.py vì sẽ ghi đè các sửa đổi thủ công.

## Tổ chức thư mục

Pages và components đã được chia theo chức năng. Xem `src/README.md` để tra cứu. Không chạy lại các script chuyển đổi hoặc sắp xếp cũ vì chúng dùng cấu trúc trước đây.

Tài liệu nguồn, báo cáo kiểm tra và công cụ chuyển đổi đã được chuyển sang `../_local/` (không đưa lên Git). Hướng dẫn clone và chạy dự án nằm ở `../README.md`.
