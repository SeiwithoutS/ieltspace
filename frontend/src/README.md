# Cấu trúc frontend

`app/pages.ts` khai báo các trang và tải từng trang khi cần. Tên route/hash giữ nguyên sau khi chuyển thư mục.

## Pages — màn hình theo chức năng

- `pages/public/`: Main.
- `pages/auth/`: Login, Register, ForgotPassword, CheckEmail, ResetPassword.
- `pages/learner/`: StudentHome, StudentLanding.
- `pages/account/`: Profile, StaffProfile, AvatarMenu.
- `pages/exams/`: FullTests, ExamDetail.
- `pages/practice/`: PracticeLibrary, PracticeWS.
- `pages/attempts/`: ReadingTest, ListeningTest, WritingTest, SpeakingTest, SubmitDialogs.
- `pages/results/`: ResultLR, ResultWS, MyWS.
- `pages/samples/`: SampleLibrary, SampleWriting, SampleSpeaking.
- `pages/vocabulary/`: Vocab, Flashcard.
- `pages/notifications/`: Notifications.
- `pages/grading/`: TeacherHome, TeacherQueue, TeacherGrade, TeacherHistory.
- `pages/admin/dashboard/`: AdminHome.
- `pages/admin/users/`: AdminUsers.
- `pages/admin/exams/`: AdminExams, AdminExamSet.
- `pages/admin/exams/editors/`: AdminReadingEditor, AdminListeningEditor, AdminWritingEditor, AdminSpeakingEditor, QuestionCards.
- `pages/admin/samples/`: AdminSamples, AdminSampleWriting, AdminSampleSpeaking.
- `pages/admin/grading/`: AdminGrading.
- `pages/admin/reports/`: AdminReports.

## Components — phần dùng chung

- `components/account/`: AccountDropdown.jsx, AccountMenu.tsx.
- `components/navigation/`: AdminSidebar.jsx, TeacherSidebar.jsx, AdminTopbar.jsx.
- `components/auth/`: AuthError.jsx, AuthHero.jsx, LoginForm.jsx, RegisterForm.jsx.
- `components/notifications/`: NotificationBadge.tsx, NotificationInbox.tsx.
- `components/exams/`: QuestionCard.jsx.
- `components/reports/`: Support.jsx, support.css.

## Thư mục còn lại

- `app/`: khởi tạo, điều hướng, danh sách trang.
- `lib/`: hồ sơ tài khoản, trạng thái thông báo và xử lý style.
- `data/`: dữ liệu thông báo mẫu.
- `styles/`: font và CSS dùng toàn ứng dụng.

Đặt màn hình mới vào nhóm nghiệp vụ tương ứng. Component dùng chung đặt ở nhóm phù hợp trong components; CSS chỉ dùng cho một component đặt cùng thư mục đó. Không thêm lớp thư mục khi chỉ có ít file và không có nhu cầu phân nhóm rõ ràng.
