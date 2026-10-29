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
├── scripts/convert.py          # Công cụ chuyển từ HTML nguồn
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
| Main | `src/pages/Main.jsx` |
| AvatarMenu | `src/pages/AvatarMenu.jsx` |
| Login | `src/pages/Login.jsx` |
| Register | `src/pages/Register.jsx` |
| ForgotPassword | `src/pages/ForgotPassword.jsx` |
| CheckEmail | `src/pages/CheckEmail.jsx` |
| ResetPassword | `src/pages/ResetPassword.jsx` |
| AuthHero | `src/components/AuthHero.jsx` |
| LoginForm | `src/components/LoginForm.jsx` |
| RegisterForm | `src/components/RegisterForm.jsx` |
| AuthError | `src/components/AuthError.jsx` |
| StudentLanding | `src/pages/StudentLanding.jsx` |
| StudentHome | `src/pages/StudentHome.jsx` |
| FullTests | `src/pages/FullTests.jsx` |
| ExamDetail | `src/pages/ExamDetail.jsx` |
| PracticeLibrary | `src/pages/PracticeLibrary.jsx` |
| ReadingTest | `src/pages/ReadingTest.jsx` |
| ListeningTest | `src/pages/ListeningTest.jsx` |
| WritingTest | `src/pages/WritingTest.jsx` |
| SpeakingTest | `src/pages/SpeakingTest.jsx` |
| SubmitDialogs | `src/pages/SubmitDialogs.jsx` |
| ResultLR | `src/pages/ResultLR.jsx` |
| ResultWS | `src/pages/ResultWS.jsx` |
| MyWS | `src/pages/MyWS.jsx` |
| PracticeWS | `src/pages/PracticeWS.jsx` |
| SampleLibrary | `src/pages/SampleLibrary.jsx` |
| SampleWriting | `src/pages/SampleWriting.jsx` |
| SampleSpeaking | `src/pages/SampleSpeaking.jsx` |
| Vocab | `src/pages/Vocab.jsx` |
| Flashcard | `src/pages/Flashcard.jsx` |
| Profile | `src/pages/Profile.jsx` |
| Notifications | `src/pages/Notifications.jsx` |
| TeacherHome | `src/pages/TeacherHome.jsx` |
| TeacherQueue | `src/pages/TeacherQueue.jsx` |
| TeacherGrade | `src/pages/TeacherGrade.jsx` |
| TeacherHistory | `src/pages/TeacherHistory.jsx` |
| StaffProfile | `src/pages/StaffProfile.jsx` |
| AdminHome | `src/pages/AdminHome.jsx` |
| AdminUsers | `src/pages/AdminUsers.jsx` |
| AdminGrading | `src/pages/AdminGrading.jsx` |
| AdminExams | `src/pages/AdminExams.jsx` |
| AdminExamSet | `src/pages/AdminExamSet.jsx` |
| AdminReadingEditor | `src/pages/AdminReadingEditor.jsx` |
| AdminListeningEditor | `src/pages/AdminListeningEditor.jsx` |
| AdminWritingEditor | `src/pages/AdminWritingEditor.jsx` |
| AdminSpeakingEditor | `src/pages/AdminSpeakingEditor.jsx` |
| QuestionCards | `src/pages/QuestionCards.jsx` |
| QuestionCard | `src/components/QuestionCard.jsx` |
| AdminSamples | `src/pages/AdminSamples.jsx` |
| AdminSampleWriting | `src/pages/AdminSampleWriting.jsx` |
| AdminSampleSpeaking | `src/pages/AdminSampleSpeaking.jsx` |
| AdminSidebar | `src/components/AdminSidebar.jsx` |
| AdminTopbar | `src/components/AdminTopbar.jsx` |

## Kết quả kiểm tra

- `npm run build`: thành công (TypeScript và Vite).
- 46 route màn hình: render có nội dung, không ghi nhận lỗi JavaScript trong kiểm tra mở trang bằng Chromium.
- Kiểm tra này chưa bao phủ mọi thao tác tương tác hoặc so sánh ảnh từng pixel với HTML gốc. Chế độ tối dùng bảng màu gốc qua tiện ích CSS; cần đối chiếu thêm các màu SVG và màu sinh trong logic.
- Vite cảnh báo gói JavaScript lớn do đang import đồng thời toàn bộ màn hình. Có thể tách tải theo route sau.

## Cập nhật điều hướng, giao diện tối và báo cáo

Báo cáo hiện lưu trong localStorage của trình duyệt, chưa đồng bộ giữa máy hoặc tài khoản thật. Mã React đã được chỉnh sửa sau bước chuyển đổi; không chạy lại scripts/convert.py vì sẽ ghi đè các sửa đổi thủ công.
